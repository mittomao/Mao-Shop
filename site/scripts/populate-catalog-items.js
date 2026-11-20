/**
 * Populate MaoShop Catalog Items (Categories and Products) as standard Treecraft CMS Items (GĐ R-SITE)
 * Creates Templates (CategoryPage, ProductDetailPage), 9 Categories and Products in Content Tree.
 */
'use strict';

const path = require('path');
const coreDir = path.resolve(__dirname, '../../core');
const siteDir = path.resolve(__dirname, '..');

const mongoose = require(path.join(coreDir, 'node_modules/mongoose'));
const esbuild = require('esbuild');
const { connectDB, disconnectDB } = require(path.join(coreDir, 'src/config/db'));
const branding = require(path.join(coreDir, 'src/config/branding'));
const Item = require(path.join(coreDir, 'src/models/Item'));
const Template = require(path.join(coreDir, 'src/models/Template'));
const PublishedItem = require(path.join(coreDir, 'src/models/PublishedItem'));
const User = require(path.join(coreDir, 'src/models/User'));
const yamlSectionService = require(path.join(coreDir, 'src/services/yamlSectionService'));

async function loadReactData() {
  console.log('📦 Loading React sample datasets...');
  const catResult = await esbuild.build({
    entryPoints: [path.join(siteDir, 'react/src/data/categories.ts')],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
  });
  const catMod = { exports: {} };
  new Function('module', 'exports', 'require', catResult.outputFiles[0].text)(catMod, catMod.exports, require);
  const categories = catMod.exports.categories || [];

  const prodResult = await esbuild.build({
    entryPoints: [path.join(siteDir, 'react/src/data/products.ts')],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
  });
  const prodMod = { exports: {} };
  new Function('module', 'exports', 'require', prodResult.outputFiles[0].text)(prodMod, prodMod.exports, require);
  const products = prodMod.exports.products || [];

  const detailResult = await esbuild.build({
    entryPoints: [path.join(siteDir, 'react/src/data/productDetails.ts')],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
  });
  const detailMod = { exports: {} };
  new Function('module', 'exports', 'require', detailResult.outputFiles[0].text)(detailMod, detailMod.exports, require);
  const getProductDetail = detailMod.exports.getProductDetail;

  return { categories, products, getProductDetail };
}

async function populateCatalog() {
  console.log('🚀 [Catalog Population] Connecting to database...');
  await connectDB();

  try {
    const { categories, products, getProductDetail } = await loadReactData();
    console.log(`✔ Found ${categories.length} categories and ${products.length} products.`);

    const rootNode = await Item.findOne({ path: new RegExp(`^${branding.PATHS.ROOT}$`, 'i') });
    const contentRoot = await Item.findOne({ path: new RegExp(`^${branding.PATHS.CONTENT}$`, 'i') });
    const projectPagesFolder = await Item.findOne({ path: new RegExp(`^${branding.PATHS.TEMPLATES}/Project/Pages$`, 'i') });
    const systemTemplate = await Item.findOne({ path: new RegExp(`^${branding.PATHS.TEMPLATES}/System/Template$`, 'i') });
    const homeItem = await Item.findOne({ path: /^\/root\/content\/home$/i });
    const shopLayout = await Item.findOne({ path: /^\/root\/layout\/Layouts\/ShopLayout$/i });
    const catIsland = await Item.findOne({ path: /^\/root\/layout\/Renderings\/CategoryPageIsland$/i });
    const prodIsland = await Item.findOne({ path: /^\/root\/layout\/Renderings\/ProductDetailPageIsland$/i });

    if (!rootNode || !contentRoot || !projectPagesFolder || !systemTemplate || !homeItem || !shopLayout || !catIsland || !prodIsland) {
      throw new Error('Core references (Home, ShopLayout, CategoryPageIsland, ProductDetailPageIsland) not found. Run init-maoshop-content.js first.');
    }

    const adminUser = await User.findOne({ username: 'admin' });
    const adminUserId = adminUser?._id || new mongoose.Types.ObjectId();

    // -------------------------------------------------------------
    // 1. Template Definitions (DEC-055 Compliant)
    // -------------------------------------------------------------
    console.log('📦 [1/5] Defining CategoryPage and ProductDetailPage Templates...');

    const categorySections = [
      {
        name: 'General',
        title: 'Thông tin chung',
        sortOrder: 100,
        fields: [
          { name: 'PageTitle', title: 'Tiêu đề trang (SEO)', type: 'Single-Line Text', defaultValue: 'Danh mục sản phẩm | MaoShop' },
          { name: 'MetaDescription', title: 'Mô tả SEO', type: 'Multi-Line Text', defaultValue: '' },
          { name: 'Slug', title: 'Mã định danh (Slug)', type: 'Single-Line Text', defaultValue: 'dien-thoai' },
          { name: 'CategoryId', title: 'Mã ngành hàng (ID)', type: 'Single-Line Text', defaultValue: 'phone' },
        ],
      },
      {
        name: 'CategoryInfo',
        title: 'Thông tin danh mục',
        sortOrder: 200,
        fields: [
          { name: 'CategoryName', title: 'Tên danh mục', type: 'Single-Line Text', defaultValue: '' },
          { name: 'GroupId', title: 'Nhóm ngành hàng', type: 'Single-Line Text', defaultValue: '' },
          { name: 'BannerTitle', title: 'Tiêu đề Banner', type: 'Single-Line Text', defaultValue: '' },
          { name: 'BannerSubtitle', title: 'Phụ đề Banner', type: 'Single-Line Text', defaultValue: '' },
          { name: 'BannerHighlight', title: 'Điểm nhấn khuyến mãi', type: 'Single-Line Text', defaultValue: '' },
          { name: 'SeoIntro', title: 'Giới thiệu ngành hàng (SEO)', type: 'Rich Text', defaultValue: '' },
        ],
      },
      {
        name: 'CategoryConfiguration',
        title: 'Cấu hình bộ lọc & Dữ liệu mở rộng',
        sortOrder: 300,
        fields: [
          { name: 'FacetsJson', title: 'Bộ lọc thuộc tính (JSON)', type: 'Multi-Line Text', defaultValue: '[]' },
          { name: 'NeedsJson', title: 'Nhu cầu sử dụng (JSON)', type: 'Multi-Line Text', defaultValue: '[]' },
          { name: 'PricePresetsJson', title: 'Mốc giá lọc (JSON)', type: 'Multi-Line Text', defaultValue: '[]' },
          { name: 'BannersJson', title: 'Danh sách Banner quảng cáo (JSON)', type: 'Multi-Line Text', defaultValue: '[]' },
          { name: 'VouchersJson', title: 'Mã giảm giá / Voucher (JSON)', type: 'Multi-Line Text', defaultValue: '[]' },
          { name: 'FaqJson', title: 'Câu hỏi thường gặp FAQ (JSON)', type: 'Multi-Line Text', defaultValue: '[]' },
        ],
      },
    ];

    const productSections = [
      {
        name: 'General',
        title: 'Thông tin chung',
        sortOrder: 100,
        fields: [
          { name: 'PageTitle', title: 'Tiêu đề trang (SEO)', type: 'Single-Line Text', defaultValue: 'Chi tiết sản phẩm | MaoShop' },
          { name: 'MetaDescription', title: 'Mô tả SEO', type: 'Multi-Line Text', defaultValue: '' },
          { name: 'Slug', title: 'Mã định danh (Slug)', type: 'Single-Line Text', defaultValue: '' },
        ],
      },
      {
        name: 'ProductInfo',
        title: 'Thông tin sản phẩm',
        sortOrder: 200,
        fields: [
          { name: 'ProductName', title: 'Tên sản phẩm', type: 'Single-Line Text', defaultValue: '' },
          { name: 'Brand', title: 'Hãng sản xuất', type: 'Single-Line Text', defaultValue: '' },
          { name: 'CategoryId', title: 'Mã danh mục', type: 'Single-Line Text', defaultValue: '' },
          { name: 'Kind', title: 'Loại thiết bị (Kind)', type: 'Single-Line Text', defaultValue: 'phone' },
          { name: 'Color', title: 'Màu sắc chủ đạo (Hex)', type: 'Single-Line Text', defaultValue: '#1f2937' },
          { name: 'Price', title: 'Giá bán (VND)', type: 'Single-Line Text', defaultValue: '0' },
          { name: 'OriginalPrice', title: 'Giá niêm yết (VND)', type: 'Single-Line Text', defaultValue: '0' },
          { name: 'Rating', title: 'Đánh giá (sao)', type: 'Single-Line Text', defaultValue: '5' },
          { name: 'ReviewCount', title: 'Số lượt đánh giá', type: 'Single-Line Text', defaultValue: '0' },
          { name: 'Popularity', title: 'Điểm phổ biến (0-100)', type: 'Single-Line Text', defaultValue: '50' },
          { name: 'MemberDiscount', title: 'Giảm giá hội viên (VND)', type: 'Single-Line Text', defaultValue: '0' },
          { name: 'PromoText', title: 'Khuyến mãi nổi bật', type: 'Single-Line Text', defaultValue: '' },
          { name: 'SubCategory', title: 'Phân loại phụ', type: 'Single-Line Text', defaultValue: '' },
          { name: 'Warranty', title: 'Chế độ bảo hành', type: 'Single-Line Text', defaultValue: '12 tháng chính hãng' },
          { name: 'FastDelivery', title: 'Giao hàng nhanh 2h', type: 'Checkbox', defaultValue: true },
          { name: 'Installment0', title: 'Trả góp 0%', type: 'Checkbox', defaultValue: true },
          { name: 'IsNew', title: 'Sản phẩm mới ra mắt', type: 'Checkbox', defaultValue: false },
        ],
      },
      {
        name: 'SpecsAndDetails',
        title: 'Thông số kỹ thuật & Chi tiết',
        sortOrder: 300,
        fields: [
          { name: 'SpecsJson', title: 'Thông số tóm tắt (JSON)', type: 'Multi-Line Text', defaultValue: '[]' },
          { name: 'ColorsJson', title: 'Danh sách màu sắc (JSON)', type: 'Multi-Line Text', defaultValue: '[]' },
          { name: 'AttrsJson', title: 'Thuộc tính lọc Attrs (JSON)', type: 'Multi-Line Text', defaultValue: '{}' },
          { name: 'TagsJson', title: 'Nhãn Tags (JSON)', type: 'Multi-Line Text', defaultValue: '[]' },
          { name: 'GalleryJson', title: 'Bộ ảnh sản phẩm (JSON)', type: 'Multi-Line Text', defaultValue: '[]' },
          { name: 'Description', title: 'Bài viết đánh giá chi tiết', type: 'Rich Text', defaultValue: '' },
        ],
      },
    ];

    const catTemplateUid = 'maoshop-cat-island-uid';
    const prodTemplateUid = 'maoshop-prod-island-uid';

    // Upsert CategoryPage Template
    let categoryPageTemplate = await Template.findOne({ name: 'CategoryPage' });
    const catTplPath = `${branding.PATHS.TEMPLATES}/Project/Pages/CategoryPage`;
    const catPresentationDef = {
      layoutId: shopLayout._id,
      renderings: [
        {
          uid: catTemplateUid,
          renderingId: catIsland._id,
          placeholder: 'maincontent',
          placeholderKey: 'maincontent',
          sortOrder: 100,
          hidden: false,
        },
      ],
    };

    if (!categoryPageTemplate) {
      categoryPageTemplate = await Template.create({
        name: 'CategoryPage',
        displayName: 'Category Page Template',
        icon: 'ti ti-layout-grid',
        description: 'Template cho trang Danh mục sản phẩm (MaoShop)',
        sections: categorySections,
        presentation: catPresentationDef,
      });
    } else {
      categoryPageTemplate.sections = categorySections;
      categoryPageTemplate.presentation = catPresentationDef;
      await categoryPageTemplate.save();
    }

    let categoryPageItem = await Item.findOne({ path: catTplPath });
    if (!categoryPageItem) {
      categoryPageItem = await Item.create({
        _id: categoryPageTemplate._id,
        name: 'CategoryPage',
        displayName: 'Category Page Template',
        templateId: systemTemplate._id,
        path: catTplPath,
        parentId: projectPagesFolder._id,
        ancestors: [rootNode._id, projectPagesFolder._id],
        sortOrder: 110,
        icon: 'ti ti-layout-grid',
        presentation: { shared: catPresentationDef },
        languages: [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: new Map() }] }],
      });
    } else {
      categoryPageItem.presentation = { shared: catPresentationDef };
      await categoryPageItem.save();
    }

    // Upsert ProductDetailPage Template
    let productPageTemplate = await Template.findOne({ name: 'ProductDetailPage' });
    const prodTplPath = `${branding.PATHS.TEMPLATES}/Project/Pages/ProductDetailPage`;
    const prodPresentationDef = {
      layoutId: shopLayout._id,
      renderings: [
        {
          uid: prodTemplateUid,
          renderingId: prodIsland._id,
          placeholder: 'maincontent',
          placeholderKey: 'maincontent',
          sortOrder: 100,
          hidden: false,
        },
      ],
    };

    if (!productPageTemplate) {
      productPageTemplate = await Template.create({
        name: 'ProductDetailPage',
        displayName: 'Product Detail Page Template',
        icon: 'ti ti-device-mobile',
        description: 'Template cho trang Chi tiết sản phẩm (MaoShop)',
        sections: productSections,
        presentation: prodPresentationDef,
      });
    } else {
      productPageTemplate.sections = productSections;
      productPageTemplate.presentation = prodPresentationDef;
      await productPageTemplate.save();
    }

    let productPageItem = await Item.findOne({ path: prodTplPath });
    if (!productPageItem) {
      productPageItem = await Item.create({
        _id: productPageTemplate._id,
        name: 'ProductDetailPage',
        displayName: 'Product Detail Page Template',
        templateId: systemTemplate._id,
        path: prodTplPath,
        parentId: projectPagesFolder._id,
        ancestors: [rootNode._id, projectPagesFolder._id],
        sortOrder: 120,
        icon: 'ti ti-device-mobile',
        presentation: { shared: prodPresentationDef },
        languages: [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: new Map() }] }],
      });
    } else {
      productPageItem.presentation = { shared: prodPresentationDef };
      await productPageItem.save();
    }

    console.log('✔ Templates created & updated in Template and Item collections.');

    // -------------------------------------------------------------
    // 2. Listing Parent Item: /danh-muc & Cleanup old /san-pham
    // -------------------------------------------------------------
    console.log('📦 [2/5] Setting up Listing Parent Item (/danh-muc) and cleaning up old /san-pham...');

    // User confirmed cleanup of old /root/content/home/san-pham
    const fs = require('fs');
    await Item.deleteMany({ path: new RegExp('^/root/content/home/san-pham', 'i') });
    await PublishedItem.deleteMany({ path: new RegExp('^/root/content/home/san-pham', 'i') });
    const oldSanphamDir = path.resolve(__dirname, '../serialization/Contents/home/san-pham');
    if (fs.existsSync(oldSanphamDir)) {
      fs.rmSync(oldSanphamDir, { recursive: true, force: true });
      console.log('✔ Cleaned up old directory:', oldSanphamDir);
    }

    const catParentPath = `${homeItem.path.toLowerCase()}/danh-muc`;
    let catParentItem = await Item.findOne({ path: new RegExp(`^${catParentPath}$`, 'i') });
    if (catParentItem && catParentItem.path !== catParentPath) {
      catParentItem.path = catParentPath;
      await catParentItem.save();
    }
    const catParentFields = new Map([
      ['PageTitle', 'Tất Cả Danh Mục Sản Phẩm | MaoShop'],
      ['MetaDescription', 'Khám phá tất cả các danh mục điện thoại, laptop, tablet, đồng hồ chính hãng tại MaoShop.'],
      ['Slug', 'phone'],
      ['CategoryName', 'Tất Cả Sản Phẩm'],
      ['GroupId', 'all'],
      ['BannerTitle', 'Danh Mục Sản Phẩm MaoShop'],
      ['BannerSubtitle', 'Chính hãng 100% - Trả góp 0% - Giao hàng miễn phí'],
      ['BannerHighlight', 'Ưu đãi đến 50%'],
      ['SeoIntro', '<p>Hệ thống MaoShop cung cấp các dòng sản phẩm công nghệ hàng đầu thế giới với chế độ hậu mãi chu đáo.</p>'],
    ]);

    if (!catParentItem) {
      catParentItem = await Item.create({
        name: 'danh-muc',
        displayName: 'Danh mục sản phẩm',
        templateId: categoryPageTemplate._id,
        path: catParentPath,
        parentId: homeItem._id,
        ancestors: [rootNode._id, contentRoot._id, homeItem._id],
        sortOrder: 200,
        presentation: { shared: catPresentationDef },
        languages: [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: catParentFields }] }],
      });
    } else {
      catParentItem.templateId = categoryPageTemplate._id;
      catParentItem.presentation = { shared: catPresentationDef };
      catParentItem.languages = [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: catParentFields }] }];
      await catParentItem.save();
    }

    // -------------------------------------------------------------
    // 3. Populate 9 Category Items
    // -------------------------------------------------------------
    console.log(`📦 [3/5] Populating ${categories.length} Category Items...`);
    const createdCatItems = [];
    const catMap = {};

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const itemPath = `${catParentPath}/${cat.slug}`;

      const fieldsMap = new Map([
        ['PageTitle', `${cat.title} chính hãng, giá tốt | MaoShop`],
        ['MetaDescription', `Mua ${cat.name} chính hãng giá tốt, trả góp 0%, bảo hành 12 tháng tại hệ thống MaoShop.`],
        ['Slug', cat.slug],
        ['CategoryId', cat.id],
        ['CategoryName', cat.name],
        ['GroupId', cat.group || ''],
        ['BannerTitle', cat.banner?.title || cat.name],
        ['BannerSubtitle', cat.banner?.subtitle || 'Chính hãng 100% - Bảo hành tận tâm - Trả góp 0%'],
        ['BannerHighlight', cat.banner?.highlight || 'Ưu đãi hấp dẫn'],
        ['SeoIntro', cat.seo?.intro || `<p>Khám phá bộ sưu tập ${cat.name} mới nhất tại MaoShop với nhiều ưu đãi độc quyền.</p>`],
        ['FacetsJson', JSON.stringify(cat.facets || [])],
        ['NeedsJson', JSON.stringify(cat.needs || [])],
        ['PricePresetsJson', JSON.stringify(cat.pricePresets || [])],
        ['BannersJson', JSON.stringify(cat.banners || [])],
        ['VouchersJson', JSON.stringify(cat.vouchers || [])],
        ['FaqJson', JSON.stringify(cat.faq || [])],
      ]);

      let catChildItem = await Item.findOne({ path: itemPath });
      if (!catChildItem) {
        catChildItem = await Item.create({
          name: cat.slug,
          displayName: cat.name,
          templateId: categoryPageTemplate._id,
          path: itemPath,
          parentId: catParentItem._id,
          ancestors: [rootNode._id, contentRoot._id, homeItem._id, catParentItem._id],
          sortOrder: (i + 1) * 10,
          presentation: { shared: catPresentationDef },
          languages: [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: fieldsMap }] }],
        });
      } else {
        catChildItem.templateId = categoryPageTemplate._id;
        catChildItem.displayName = cat.name;
        catChildItem.presentation = { shared: catPresentationDef };
        catChildItem.languages = [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: fieldsMap }] }];
        await catChildItem.save();
      }
      createdCatItems.push(catChildItem);
      catMap[cat.id] = catChildItem;
    }
    console.log(`✔ Populated ${createdCatItems.length} Category Items.`);

    // -------------------------------------------------------------
    // 4. Populate Product Items directly under their corresponding Category
    // -------------------------------------------------------------
    console.log(`📦 [4/5] Populating Product Items directly under categories (${products.length} products)...`);
    const createdProdItems = [];
    const usedSlugs = new Set();

    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      let slug = prod.slug;
      if (usedSlugs.has(slug)) {
        slug = `${slug}-${prod.id}`;
      }
      usedSlugs.add(slug);

      const targetCatItem = catMap[prod.categoryId] || createdCatItems[0];
      const itemPath = `${targetCatItem.path}/${slug}`;
      const detail = getProductDetail ? getProductDetail(prod) : null;
      const specsList = detail?.specs || (prod.specs ? prod.specs.map(s => ({ label: 'Thông số', value: s })) : []);
      const colorsList = detail?.colors || (prod.attrs?.mau ? prod.attrs.mau.map(m => ({ name: m, color: prod.color || '#1f2937' })) : [{ name: 'Mặc định', color: prod.color || '#1f2937' }]);
      const galleryList = detail?.gallery || [];
      const descriptionHtml = detail?.description?.join('\n') || `<p><strong>${prod.name}</strong> là dòng thiết bị cao cấp thuộc danh mục ${prod.categoryId}. Sở hữu thiết kế hiện đại, hiệu năng ổn định và thời lượng pin ấn tượng, đáp ứng tối đa nhu cầu học tập, làm việc và giải trí.</p>`;

      const fieldsMap = new Map([
        ['PageTitle', `${prod.name} chính hãng, giá tốt | MaoShop`],
        ['MetaDescription', `Mua ngay ${prod.name} giá chỉ ${prod.price ? Number(prod.price).toLocaleString('vi-VN') + ' đ' : ''} tại MaoShop. Trả góp 0%, bảo hành 12 tháng.`],
        ['Slug', slug],
        ['ProductName', prod.name],
        ['Brand', prod.brand || 'MaoShop'],
        ['CategoryId', prod.categoryId || 'phone'],
        ['Kind', prod.kind || prod.categoryId || 'phone'],
        ['Color', prod.color || '#1f2937'],
        ['Price', String(prod.price || 0)],
        ['OriginalPrice', String(prod.originalPrice || prod.price || 0)],
        ['Rating', String(prod.rating || 5)],
        ['ReviewCount', String(prod.popularity || 48)],
        ['Popularity', String(prod.popularity || 50)],
        ['MemberDiscount', String(prod.memberDiscount || 0)],
        ['PromoText', prod.promoText || 'Ưu đãi thanh toán giảm thêm đến 2 triệu đồng'],
        ['SubCategory', prod.subCategory || ''],
        ['Warranty', '12 tháng chính hãng'],
        ['FastDelivery', Boolean(prod.fastDelivery)],
        ['Installment0', Boolean(prod.installment0)],
        ['IsNew', Boolean(prod.isNew)],
        ['SpecsJson', JSON.stringify(specsList)],
        ['ColorsJson', JSON.stringify(colorsList)],
        ['AttrsJson', JSON.stringify(prod.attrs || {})],
        ['TagsJson', JSON.stringify(prod.tags || ['hot'])],
        ['GalleryJson', JSON.stringify(galleryList)],
        ['Description', descriptionHtml],
      ]);

      let prodChildItem = await Item.findOne({ path: itemPath });
      if (!prodChildItem) {
        prodChildItem = await Item.create({
          name: slug,
          displayName: prod.name,
          templateId: productPageTemplate._id,
          path: itemPath,
          parentId: targetCatItem._id,
          ancestors: [rootNode._id, contentRoot._id, homeItem._id, catParentItem._id, targetCatItem._id],
          sortOrder: (i + 1) * 10,
          presentation: { shared: prodPresentationDef },
          languages: [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: fieldsMap }] }],
        });
      } else {
        prodChildItem.templateId = productPageTemplate._id;
        prodChildItem.displayName = prod.name;
        prodChildItem.parentId = targetCatItem._id;
        prodChildItem.ancestors = [rootNode._id, contentRoot._id, homeItem._id, catParentItem._id, targetCatItem._id];
        prodChildItem.presentation = { shared: prodPresentationDef };
        prodChildItem.languages = [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: fieldsMap }] }];
        await prodChildItem.save();
      }
      createdProdItems.push(prodChildItem);
    }
    console.log(`✔ Populated ${createdProdItems.length} Product Items under categories.`);

    // -------------------------------------------------------------
    // 5. Publish to items_web (PublishedItem)
    // -------------------------------------------------------------
    console.log('📦 [5/5] Publishing Items to Web Store (items_web)...');
    const allItemsToPublish = [
      catParentItem,
      ...createdCatItems,
      ...createdProdItems,
    ];

    let pubCount = 0;
    for (const it of allItemsToPublish) {
      const rawItem = await Item.findById(it._id).lean();
      if (!rawItem) continue;

      const pubLanguages = (rawItem.languages || []).map((l) => {
        const v1 = l.versions?.[0];
        const vFields = v1?.fields instanceof Map ? Object.fromEntries(v1.fields) : (v1?.fields || {});
        return {
          code: l.code,
          publishedVersion: v1?.version || 1,
          fields: vFields,
          unversionedFields: l.unversionedFields instanceof Map ? Object.fromEntries(l.unversionedFields) : (l.unversionedFields || {}),
          finalLayout: rawItem.presentation?.shared || {},
          publishedAt: new Date(),
          publishedBy: adminUserId,
        };
      });

      await PublishedItem.findOneAndUpdate(
        { _id: rawItem._id },
        {
          _id: rawItem._id,
          name: rawItem.name,
          displayName: rawItem.displayName || rawItem.name,
          parentId: rawItem.parentId || null,
          templateId: rawItem.templateId || null,
          path: rawItem.path,
          sortOrder: rawItem.sortOrder || 100,
          isSystem: Boolean(rawItem.isSystem),
          isDeleted: false,
          fields: rawItem.fields instanceof Map ? Object.fromEntries(rawItem.fields) : (rawItem.fields || {}),
          sharedFields: rawItem.sharedFields instanceof Map ? Object.fromEntries(rawItem.sharedFields) : (rawItem.sharedFields || {}),
          presentation: rawItem.presentation || {},
          languages: pubLanguages,
          publishedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      pubCount++;
    }
    console.log(`✔ Published ${pubCount} Items to Web Store.`);

    // -------------------------------------------------------------
    // 6. Reserialize YAML Sections
    // -------------------------------------------------------------
    console.log('📦 Reserializing YAML sections (template, content)...');
    await yamlSectionService.reserializeSection('template', { pruneOrphans: true });
    await yamlSectionService.reserializeSection('content', { pruneOrphans: true });
    console.log('✔ Reserialization completed.');

    console.log('\n🎉 ALL CATALOG ITEMS SUCCESSFULLY POPULATED AS CMS ITEMS!');
  } catch (error) {
    console.error('❌ [Catalog Population Failed]:', error);
    throw error;
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  populateCatalog()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = populateCatalog;
