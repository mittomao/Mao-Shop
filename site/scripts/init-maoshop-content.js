/**
 * Initialize MaoShop CMS Content, Templates, Renderings and Layout (GĐ R-SITE)
 * Sets up Complete MaoShop Experience with Full Sample Content (Matches React Project 100%)
 */
'use strict';

const path = require('path');

// Resolve Core paths
const coreDir = path.resolve(__dirname, '../../core');
const siteDir = path.resolve(__dirname, '..');

const mongoose = require(path.join(coreDir, 'node_modules/mongoose'));
const { connectDB, disconnectDB } = require(path.join(coreDir, 'src/config/db'));
const branding = require(path.join(coreDir, 'src/config/branding'));
const Item = require(path.join(coreDir, 'src/models/Item'));
const Template = require(path.join(coreDir, 'src/models/Template'));
const PublishedItem = require(path.join(coreDir, 'src/models/PublishedItem'));
const User = require(path.join(coreDir, 'src/models/User'));
const yamlSectionService = require(path.join(coreDir, 'src/services/yamlSectionService'));

async function initMaoShop() {
  console.log('🚀 [MaoShop Init] Connecting to database...');
  await connectDB();

  try {
    const rootNode = await Item.findOne({ path: branding.PATHS.ROOT });
    const contentRoot = await Item.findOne({ path: branding.PATHS.CONTENT });
    const layoutsRoot = await Item.findOne({ path: branding.PATHS.LAYOUTS });
    const renderingsRoot = await Item.findOne({ path: branding.PATHS.RENDERINGS });
    const featureComponentsFolder = await Item.findOne({ path: `${branding.PATHS.TEMPLATES}/Feature/Components` });
    const projectPagesFolder = await Item.findOne({ path: `${branding.PATHS.TEMPLATES}/Project/Pages` });

    const systemLayoutTemplate = await Item.findOne({ path: `${branding.PATHS.TEMPLATES}/System/Layout` });
    const systemRenderingTemplate = await Item.findOne({ path: `${branding.PATHS.TEMPLATES}/System/Rendering` });
    const systemTemplate = await Item.findOne({ path: `${branding.PATHS.TEMPLATES}/System/Template` });

    if (!rootNode || !contentRoot || !layoutsRoot || !renderingsRoot || !systemLayoutTemplate || !systemRenderingTemplate || !systemTemplate) {
      throw new Error('Core system roots or system templates not found. Please ensure database is initialized.');
    }

    const adminUser = await User.findOne({ username: 'admin' });
    const adminUserId = adminUser?._id || new mongoose.Types.ObjectId();

    // 1. Create / Update ShopLayout
    console.log('📦 [1/5] Setting up ShopLayout & HomeLayout...');
    let shopLayout = await Item.findOne({ path: `${branding.PATHS.LAYOUTS}/ShopLayout` });
    if (!shopLayout) {
      shopLayout = await Item.create({
        name: 'ShopLayout',
        displayName: 'Shop Layout (MaoShop)',
        templateId: systemLayoutTemplate._id,
        path: `${branding.PATHS.LAYOUTS}/ShopLayout`,
        parentId: layoutsRoot._id,
        ancestors: [rootNode._id, layoutsRoot._id],
        sortOrder: 10,
        icon: 'layout',
        sharedFields: new Map([['viewPath', 'layouts/ShopLayout.ejs']]),
        fields: new Map([['viewPath', 'layouts/ShopLayout.ejs']]),
        languages: [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: new Map([['viewPath', 'layouts/ShopLayout.ejs']]) }] }],
      });
    } else {
      shopLayout.sharedFields.set('viewPath', 'layouts/ShopLayout.ejs');
      shopLayout.templateId = systemLayoutTemplate._id;
      await shopLayout.save();
    }

    let homeLayout = await Item.findOne({ path: `${branding.PATHS.LAYOUTS}/HomeLayout` });
    if (homeLayout) {
      homeLayout.sharedFields.set('viewPath', 'layouts/ShopLayout.ejs');
      await homeLayout.save();
    }

    // 2. Component Templates Definitions with Complete Sections & Fields (DEC-055)
    console.log('📦 [2/5] Setting up Component Templates with Sections & Fields...');
    const componentTemplatesDef = [
      {
        name: 'HomePage',
        displayName: 'MaoShop Home Page Full Experience',
        icon: 'ti ti-home',
        sectionName: 'Home Content',
        fields: [
          { name: 'Title', title: 'Tiêu đề Trang chủ', type: 'singleLineText', defaultValue: 'Siêu Phẩm Công Nghệ 2026' },
          { name: 'Subtitle', title: 'Phụ đề Trang chủ', type: 'singleLineText', defaultValue: 'Thu cũ đổi mới trợ giá đến 5 triệu, bảo hành chính hãng 12 tháng.' },
          { name: 'PromoText', title: 'Nội dung khuyến mãi dải banner', type: 'singleLineText', defaultValue: 'Trả góp sinh viên 0%, duyệt nhanh 5 phút — hạn mức lên đến 30 triệu' },
          { name: 'ButtonText', title: 'Nhãn nút bấm khuyến mãi', type: 'singleLineText', defaultValue: 'Mua ngay' },
          { name: 'ButtonLink', title: 'Đường dẫn khuyến mãi', type: 'singleLineText', defaultValue: '/danh-muc' },
        ],
      },
      {
        name: 'Hero',
        displayName: 'Hero Carousel & Banners',
        icon: 'ti ti-slideshow',
        sectionName: 'Hero Content',
        fields: [
          { name: 'Title', title: 'Tiêu đề Hero', type: 'singleLineText', defaultValue: 'Siêu Phẩm Công Nghệ 2026' },
          { name: 'Subtitle', title: 'Phụ đề Hero', type: 'singleLineText', defaultValue: 'Thu cũ đổi mới trợ giá đến 5 triệu, bảo hành chính hãng 12 tháng.' },
          { name: 'Eyebrow', title: 'Nhãn phụ phía trên', type: 'singleLineText', defaultValue: 'Ưu đãi mùa hè 2026' },
          { name: 'BannerLink', title: 'Đường dẫn liên kết', type: 'singleLineText', defaultValue: '/danh-muc' },
        ],
      },
      {
        name: 'PromoStrip',
        displayName: 'Promo Strip Banner',
        icon: 'ti ti-tag',
        sectionName: 'Promo Strip Data',
        fields: [
          { name: 'Title', title: 'Tiêu đề khuyến mãi', type: 'singleLineText', defaultValue: 'TƯNG BỪNG DEAL KHỦNG' },
          { name: 'PromoText', title: 'Nội dung ngắn', type: 'singleLineText', defaultValue: 'Trả góp sinh viên 0%, duyệt nhanh 5 phút — hạn mức lên đến 30 triệu' },
          { name: 'ButtonText', title: 'Nhãn nút bấm', type: 'singleLineText', defaultValue: 'Mua ngay' },
          { name: 'ButtonLink', title: 'Đường dẫn liên kết', type: 'singleLineText', defaultValue: '/danh-muc' },
        ],
      },
      {
        name: 'FlashSale',
        displayName: 'Flash Sale Section',
        icon: 'ti ti-bolt',
        sectionName: 'Flash Sale Data',
        fields: [
          { name: 'Title', title: 'Tiêu đề Flash Sale', type: 'singleLineText', defaultValue: 'GIỜ VÀNG GIÁ SỐC' },
          { name: 'Subtitle', title: 'Phụ đề', type: 'singleLineText', defaultValue: 'Khung giờ săn deal giảm đến 50%' },
          { name: 'EndTime', title: 'Thời gian kết thúc', type: 'singleLineText', defaultValue: '2026-12-31T23:59:59' },
        ],
      },
      {
        name: 'DealTabs',
        displayName: 'Deal Tabs Showcase',
        icon: 'ti ti-layout-grid',
        sectionName: 'Deal Tabs Data',
        fields: [
          { name: 'Title', title: 'Tiêu đề khối', type: 'singleLineText', defaultValue: 'Sản Phẩm Đang Hot Nhất' },
          { name: 'Subtitle', title: 'Phụ đề khối', type: 'singleLineText', defaultValue: 'Tuyển chọn thiết bị được yêu thích nhất' },
        ],
      },
      {
        name: 'CategorySection',
        displayName: 'Category Product Carousel',
        icon: 'ti ti-device-mobile',
        sectionName: 'Category Section Data',
        fields: [
          { name: 'CategoryId', title: 'Mã ngành hàng (phone, laptop, watch, tv)', type: 'singleLineText', defaultValue: 'phone' },
          { name: 'Title', title: 'Tiêu đề ngành hàng', type: 'singleLineText', defaultValue: 'Điện Thoại Nổi Bật' },
          { name: 'Eyebrow', title: 'Nhãn nổi bật', type: 'singleLineText', defaultValue: 'Flagship & Phổ Thông' },
          { name: 'Subtitle', title: 'Phụ đề', type: 'singleLineText', defaultValue: 'Bảo hành 12 tháng chính hãng - 1 đổi 1 trong 30 ngày' },
          { name: 'ViewAllLink', title: 'Link xem tất cả', type: 'singleLineText', defaultValue: '/danh-muc?cat=phone' },
        ],
      },
      {
        name: 'AccessoryGrid',
        displayName: 'Accessory Categories Grid',
        icon: 'ti ti-plug',
        sectionName: 'Accessory Grid Data',
        fields: [
          { name: 'Title', title: 'Tiêu đề khối phụ kiện', type: 'singleLineText', defaultValue: 'Phụ Kiện Chính Hãng' },
          { name: 'Subtitle', title: 'Phụ đề khối phụ kiện', type: 'singleLineText', defaultValue: 'Tai nghe, cáp sạc, ốp lưng, pin dự phòng cao cấp' },
          { name: 'ViewAllLink', title: 'Link xem tất cả', type: 'singleLineText', defaultValue: '/danh-muc?cat=accessories' },
        ],
      },
      {
        name: 'Offers',
        displayName: 'Payment & Partner Offers',
        icon: 'ti ti-gift',
        sectionName: 'Offers Content',
        fields: [
          { name: 'Title', title: 'Tiêu đề khối ưu đãi', type: 'singleLineText', defaultValue: 'Ưu đãi thanh toán & đối tác' },
          { name: 'Offer1_Badge', title: 'Ưu đãi 1 - Nhãn', type: 'singleLineText', defaultValue: 'Thẻ Tín Dụng' },
          { name: 'Offer1_Title', title: 'Ưu đãi 1 - Tiêu đề', type: 'singleLineText', defaultValue: 'Giảm đến 800K khi mở thẻ Techcombank' },
          { name: 'Offer1_Desc', title: 'Ưu đãi 1 - Mô tả ngắn', type: 'singleLineText', defaultValue: 'Áp dụng cho mọi hóa đơn mua điện thoại, laptop từ 10 triệu' },
          { name: 'Offer1_Link', title: 'Ưu đãi 1 - Liên kết', type: 'singleLineText', defaultValue: '#offers' },
          { name: 'Offer2_Badge', title: 'Ưu đãi 2 - Nhãn', type: 'singleLineText', defaultValue: 'Ví Điện Tử' },
          { name: 'Offer2_Title', title: 'Ưu đãi 2 - Tiêu đề', type: 'singleLineText', defaultValue: 'Hoàn tiền 10% tối đa 300K qua VNPAY-QR' },
          { name: 'Offer2_Desc', title: 'Ưu đãi 2 - Mô tả ngắn', type: 'singleLineText', defaultValue: 'Nhập mã VNPAYMAOPHONE khi quét mã thanh toán' },
          { name: 'Offer2_Link', title: 'Ưu đãi 2 - Liên kết', type: 'singleLineText', defaultValue: '#offers' },
          { name: 'Offer3_Badge', title: 'Ưu đãi 3 - Nhãn', type: 'singleLineText', defaultValue: 'Thu Cũ Đổi Mới' },
          { name: 'Offer3_Title', title: 'Ưu đãi 3 - Tiêu đề', type: 'singleLineText', defaultValue: 'Trợ giá lên đời đến 5 triệu đồng' },
          { name: 'Offer3_Desc', title: 'Ưu đãi 3 - Mô tả ngắn', type: 'singleLineText', defaultValue: 'Thẩm định máy cũ 15 phút, nhận ngay máy mới siêu tốc' },
          { name: 'Offer3_Link', title: 'Ưu đãi 3 - Liên kết', type: 'singleLineText', defaultValue: '#offers' },
          { name: 'Offer4_Badge', title: 'Ưu đãi 4 - Nhãn', type: 'singleLineText', defaultValue: 'Sinh Viên' },
          { name: 'Offer4_Title', title: 'Ưu đãi 4 - Tiêu đề', type: 'singleLineText', defaultValue: 'Giảm thêm 5% cho học sinh - sinh viên' },
          { name: 'Offer4_Desc', title: 'Ưu đãi 4 - Mô tả ngắn', type: 'singleLineText', defaultValue: 'Ưu đãi tựu trường áp dụng cho laptop, iPad và phụ kiện' },
          { name: 'Offer4_Link', title: 'Ưu đãi 4 - Liên kết', type: 'singleLineText', defaultValue: '#offers' },
        ],
      },
      {
        name: 'News',
        displayName: 'Tech News Grid',
        icon: 'ti ti-news',
        sectionName: 'News Data',
        fields: [
          { name: 'Title', title: 'Tiêu đề tin tức', type: 'singleLineText', defaultValue: 'Tin Tức & Mẹo Hay Công Nghệ' },
          { name: 'Subtitle', title: 'Phụ đề tin tức', type: 'singleLineText', defaultValue: 'Cập nhật xu hướng và đánh giá thiết bị mới nhất' },
          { name: 'ViewAllLink', title: 'Link xem tất cả', type: 'singleLineText', defaultValue: '#tin-tuc' },
        ],
      },
      {
        name: 'CategoryPageIsland',
        displayName: 'Category Page Interactive Island',
        icon: 'ti ti-filter',
        sectionName: 'Category Page Config',
        fields: [
          { name: 'Title', title: 'Tiêu đề trang danh mục', type: 'singleLineText', defaultValue: 'Danh Mục Sản Phẩm' },
          { name: 'Slug', title: 'Mã danh mục mặc định (phone, laptop...)', type: 'singleLineText', defaultValue: 'phone' },
        ],
      },
      {
        name: 'ProductDetailPageIsland',
        displayName: 'Product Detail Interactive Island',
        icon: 'ti ti-shopping-cart',
        sectionName: 'Product Detail Config',
        fields: [
          { name: 'Title', title: 'Tên sản phẩm', type: 'singleLineText', defaultValue: 'iPhone 16 Pro Max 256GB' },
          { name: 'Slug', title: 'Mã sản phẩm URL', type: 'singleLineText', defaultValue: 'iphone-16-pro-max' },
        ],
      },
    ];

    const componentTemplatesMap = {};
    const allFieldDefinitionsMap = new Map();

    for (const ct of componentTemplatesDef) {
      const templatePath = `${branding.PATHS.TEMPLATES}/Feature/Components/${ct.name}`;
      let itemTpl = await Item.findOne({ path: templatePath });
      let schemaTpl = await Template.findOne({ name: ct.name });

      const tplId = itemTpl?._id || schemaTpl?._id || new mongoose.Types.ObjectId();

      const existingFieldsByName = new Map();
      if (schemaTpl?.sections) {
        for (const s of schemaTpl.sections) {
          for (const f of s.fields || []) {
            existingFieldsByName.set(f.name, f);
          }
        }
      }

      const sectionId = schemaTpl?.sections?.[0]?._id || new mongoose.Types.ObjectId();
      const fields = ct.fields.map((f, idx) => {
        const existingF = existingFieldsByName.get(f.name);
        const fId = existingF?._id || new mongoose.Types.ObjectId();
        const fieldObj = {
          _id: fId,
          name: f.name,
          title: f.title,
          type: f.type,
          source: '',
          required: false,
          defaultValue: f.defaultValue || '',
          shared: false,
          unversioned: false,
          sortOrder: (idx + 1) * 10,
          helpText: '',
          validation: {},
          visibility: { dependsOn: '', operator: '', value: null },
          permissions: { hiddenRoles: [], readRoles: [], writeRoles: [] },
          layout: { colSpan: 12, groupName: '' },
          config: {},
        };
        allFieldDefinitionsMap.set(f.name, fieldObj);
        return fieldObj;
      });

      const sections = [
        {
          _id: sectionId,
          name: ct.sectionName || `${ct.name} Data`,
          sortOrder: 100,
          fields,
        },
      ];

      if (!schemaTpl) {
        schemaTpl = await Template.create({
          _id: tplId,
          name: ct.name,
          displayName: ct.displayName,
          icon: ct.icon,
          description: `Template dữ liệu cho component ${ct.name}`,
          isSystem: false,
          path: templatePath,
          sections,
          baseTemplates: [],
          insertOptions: [],
          standardValues: new Map(),
          createdBy: adminUserId,
          updatedBy: adminUserId,
        });
      } else {
        schemaTpl.displayName = ct.displayName;
        schemaTpl.icon = ct.icon;
        schemaTpl.path = templatePath;
        schemaTpl.sections = sections;
        schemaTpl.updatedBy = adminUserId;
        await schemaTpl.save();
      }

      if (!itemTpl) {
        itemTpl = await Item.create({
          _id: tplId,
          name: ct.name,
          displayName: ct.displayName,
          templateId: systemTemplate._id,
          path: templatePath,
          parentId: featureComponentsFolder?._id || rootNode._id,
          ancestors: [rootNode._id, featureComponentsFolder?._id].filter(Boolean),
          sortOrder: 100,
          icon: ct.icon,
          sections,
          languages: [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: new Map() }] }],
        });
      } else {
        itemTpl.displayName = ct.displayName;
        itemTpl.icon = ct.icon;
        itemTpl.templateId = systemTemplate._id;
        itemTpl.sections = sections;
        await itemTpl.save();
      }

      componentTemplatesMap[ct.name] = itemTpl;
      console.log(`  ✔ Template [${ct.name}]: ${fields.length} fields configured`);
    }

    // 3. Renderings Setup
    console.log('📦 [3/5] Setting up Renderings...');
    const renderingsDef = [
      { name: 'HomePage', viewPath: 'components/HomePage.ejs', template: componentTemplatesMap.HomePage },
      { name: 'Hero', viewPath: 'components/Hero.ejs', template: componentTemplatesMap.Hero },
      { name: 'PromoStrip', viewPath: 'components/PromoStrip.ejs', template: componentTemplatesMap.PromoStrip },
      { name: 'FlashSale', viewPath: 'components/FlashSale.ejs', template: componentTemplatesMap.FlashSale },
      { name: 'DealTabs', viewPath: 'components/DealTabs.ejs', template: componentTemplatesMap.DealTabs },
      { name: 'CategorySection', viewPath: 'components/CategorySection.ejs', template: componentTemplatesMap.CategorySection },
      { name: 'AccessoryGrid', viewPath: 'components/AccessoryGrid.ejs', template: componentTemplatesMap.AccessoryGrid },
      { name: 'Offers', viewPath: 'components/Offers.ejs', template: componentTemplatesMap.Offers },
      { name: 'News', viewPath: 'components/News.ejs', template: componentTemplatesMap.News },
      { name: 'CategoryPageIsland', viewPath: 'components/CategoryPageIsland.ejs', template: componentTemplatesMap.CategoryPageIsland },
      { name: 'ProductDetailPageIsland', viewPath: 'components/ProductDetailPageIsland.ejs', template: componentTemplatesMap.ProductDetailPageIsland },
    ];

    const renderingsMap = {};
    for (const r of renderingsDef) {
      const renderingPath = `${branding.PATHS.RENDERINGS}/${r.name}`;
      let ren = await Item.findOne({ path: renderingPath });
      const sharedFields = new Map([
        ['viewPath', r.viewPath],
        ['componentTemplate', r.template?._id?.toString() || ''],
      ]);

      if (!ren) {
        ren = await Item.create({
          name: r.name,
          displayName: r.template?.displayName || r.name,
          templateId: systemRenderingTemplate._id,
          path: renderingPath,
          parentId: renderingsRoot._id,
          ancestors: [rootNode._id, renderingsRoot._id],
          sortOrder: 100,
          icon: r.template?.icon || 'rendering',
          sharedFields,
          fields: sharedFields,
          languages: [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: sharedFields }] }],
        });
      } else {
        ren.sharedFields.set('viewPath', r.viewPath);
        ren.sharedFields.set('componentTemplate', r.template?._id?.toString() || '');
        ren.templateId = systemRenderingTemplate._id;
        await ren.save();
      }
      renderingsMap[r.name] = ren;
    }

    // 4. Update Template Home Standard Presentation (Remove HeroBanner to eliminate default text)
    console.log('📦 [4/5] Updating Home Page Template presentation...');
    const fixedHomePageUid = 'maoshop-home-page-root';
    const homeTemplate = await Template.findById('6aeaccf2b200083aee58709e');
    if (homeTemplate) {
      homeTemplate.presentation = {
        layoutId: shopLayout._id,
        renderings: [
          {
            uid: fixedHomePageUid,
            renderingId: renderingsMap.HomePage._id,
            placeholder: 'maincontent',
            placeholderKey: 'maincontent',
            sortOrder: 100,
            hidden: false,
          },
        ],
      };
      await homeTemplate.save();
      console.log('✔ Updated Template Home Standard Presentation (HeroBanner removed)!');
    }

    const homeTemplateItem = await Item.findById('6aeaccf2b200083aee58709e');
    if (homeTemplateItem) {
      homeTemplateItem.presentation = {
        shared: {
          layoutId: shopLayout._id,
          renderings: [
            {
              uid: fixedHomePageUid,
              renderingId: renderingsMap.HomePage._id,
              placeholderKey: 'maincontent',
              sortOrder: 100,
            },
          ],
        },
      };
      await homeTemplateItem.save();
    }

    // 5. Setup Home Content Item Presentation & Data
    const homeRenderingsList = [
      {
        uid: fixedHomePageUid,
        renderingId: renderingsMap.HomePage._id,
        placeholderKey: 'maincontent',
        sortOrder: 100,
      },
    ];

    const homePresentation = {
      layoutId: shopLayout._id,
      renderings: homeRenderingsList,
    };

    const homeValuesVi = {
      PageTitle: 'MaoShop - Điện thoại, Laptop, Tivi chính hãng',
      MetaDescription: 'MaoShop - Hệ thống bán lẻ điện thoại di động, smartphone, laptop chính hãng hàng đầu, hỗ trợ trả góp 0%, giao hàng toàn quốc.',
      Title: 'Siêu Phẩm Công Nghệ 2026',
      Subtitle: 'Thu cũ đổi mới trợ giá đến 5 triệu, bảo hành chính hãng 12 tháng.',
      PromoText: 'Trả góp sinh viên 0%, duyệt nhanh 5 phút — hạn mức lên đến 30 triệu',
      ButtonText: 'Mua ngay',
      ButtonLink: '/danh-muc',
    };

    const homeValuesEn = {
      PageTitle: 'MaoShop - Genuine Smartphones, Laptops, Tablets at Best Price',
      MetaDescription: 'MaoShop - Leading retail chain for genuine mobile devices, laptops and accessories with 0% installment and nationwide shipping.',
      Title: 'Cutting-Edge Technology 2026',
      Subtitle: 'Trade-in upgrade bonus up to 5M VND, 12-month official warranty.',
      PromoText: 'Student installment 0%, 5-min approval — limit up to 30M VND',
      ButtonText: 'Shop Now',
      ButtonLink: '/danh-muc',
    };

    function buildFieldMap(rawValues) {
      const map = new Map();
      for (const [key, val] of Object.entries(rawValues)) {
        map.set(key, val);
        const fieldDef = allFieldDefinitionsMap.get(key);
        if (fieldDef?._id) {
          map.set(fieldDef._id.toString(), val);
        }
      }
      return map;
    }

    const homeFieldsVi = buildFieldMap(homeValuesVi);
    const homeFieldsEn = buildFieldMap(homeValuesEn);

    let homeItem = await Item.findOne({ path: { $regex: /^\/root\/content\/home$/i } });
    if (!homeItem) {
      homeItem = await Item.findOne({ parentId: contentRoot._id, sortOrder: 100 });
    }

    if (homeItem) {
      homeItem.presentation = { shared: homePresentation };
      homeItem.languages = [
        {
          code: 'vi',
          unversionedFields: new Map(),
          versions: [
            {
              version: 1,
              fields: homeFieldsVi,
              createdBy: adminUserId,
              updatedBy: adminUserId,
              createdAt: new Date(),
            },
          ],
        },
        {
          code: 'en',
          unversionedFields: new Map(),
          versions: [
            {
              version: 1,
              fields: homeFieldsEn,
              createdBy: adminUserId,
              updatedBy: adminUserId,
              createdAt: new Date(),
            },
          ],
        },
      ];
      await homeItem.save();
      console.log('✔ Updated Home page with HomePage rendering and complete content!');
    }

    // Category Page Child Item
    const catPagePath = `${branding.PATHS.HOME}/danh-muc`;
    let catItem = await Item.findOne({ path: catPagePath });
    const catPresentation = {
      layoutId: shopLayout._id,
      renderings: [
        { uid: new mongoose.Types.ObjectId().toString(), renderingId: renderingsMap.CategoryPageIsland._id, placeholderKey: 'maincontent', sortOrder: 100 },
      ],
    };
    const catFieldsVi = new Map([
      ['PageTitle', 'Danh Mục Sản Phẩm | MaoShop'],
      ['Title', 'Tất Cả Sản Phẩm Công Nghệ'],
      ['Slug', 'phone'],
    ]);

    if (!catItem) {
      catItem = await Item.create({
        name: 'danh-muc',
        displayName: 'Danh mục sản phẩm',
        templateId: homeItem?.templateId || systemTemplate._id,
        path: catPagePath,
        parentId: homeItem._id,
        ancestors: [rootNode._id, contentRoot._id, homeItem._id],
        sortOrder: 200,
        presentation: { shared: catPresentation },
        languages: [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: catFieldsVi }] }],
      });
    } else {
      catItem.presentation = { shared: catPresentation };
      catItem.languages = [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: catFieldsVi }] }];
      await catItem.save();
    }

    // Product Detail Child Item
    const prodPagePath = `${branding.PATHS.HOME}/san-pham`;
    let prodItem = await Item.findOne({ path: prodPagePath });
    const prodPresentation = {
      layoutId: shopLayout._id,
      renderings: [
        { uid: new mongoose.Types.ObjectId().toString(), renderingId: renderingsMap.ProductDetailPageIsland._id, placeholderKey: 'maincontent', sortOrder: 100 },
      ],
    };
    const prodFieldsVi = new Map([
      ['PageTitle', 'Chi Tiết Sản Phẩm | MaoShop'],
      ['Title', 'iPhone 16 Pro Max 256GB'],
      ['Slug', 'iphone-16-pro-max'],
    ]);

    if (!prodItem) {
      prodItem = await Item.create({
        name: 'san-pham',
        displayName: 'Chi tiết sản phẩm',
        templateId: homeItem?.templateId || systemTemplate._id,
        path: prodPagePath,
        parentId: homeItem._id,
        ancestors: [rootNode._id, contentRoot._id, homeItem._id],
        sortOrder: 300,
        presentation: { shared: prodPresentation },
        languages: [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: prodFieldsVi }] }],
      });
    } else {
      prodItem.presentation = { shared: prodPresentation };
      prodItem.languages = [{ code: 'vi', unversionedFields: new Map(), versions: [{ version: 1, fields: prodFieldsVi }] }];
      await prodItem.save();
    }

    // 6. Publish all items to items_web (PublishedItem)
    console.log('📦 [5/5] Publishing items to Web Store (items_web)...');
    const allItemsToPublish = [
      shopLayout,
      homeLayout,
      ...Object.values(renderingsMap),
      homeItem,
      catItem,
      prodItem,
    ].filter(Boolean);

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
          publishedBy: adminUserId,
        },
        { upsert: true, new: true }
      );
    }
    console.log(`✔ Successfully published ${allItemsToPublish.length} items to Web Store!`);

    // 7. Export Serialization YAML
    console.log('📝 [Export] Reserializing sections to YAML in site/serialization/...');
    await yamlSectionService.reserializeSection('layout');
    await yamlSectionService.reserializeSection('rendering');
    await yamlSectionService.reserializeSection('template');
    await yamlSectionService.reserializeSection('content');
    console.log('✔ Successfully reserialized all sections to YAML!');

    console.log('\x1b[32m%s\x1b[0m', '🎉 [MaoShop Init] Complete sample content successfully applied!');
  } finally {
    await disconnectDB();
  }
}

initMaoShop().catch((err) => {
  console.error('❌ [MaoShop Init Error]:', err);
  process.exit(1);
});
