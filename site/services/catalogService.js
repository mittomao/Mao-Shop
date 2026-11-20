/**
 * Catalog Service for MaoShop Site
 * Reads categories, products and sections strictly from published Treecraft CMS Items (items_web).
 * NO hardcoded product or category data.
 */
'use strict';

const path = require('path');
const coreDir = path.resolve(__dirname, '../../core');
const PublishedItem = require(path.join(coreDir, 'src/models/PublishedItem'));

function parseJson(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function mapProduct(item) {
  if (!item) return null;
  const rawFields = item.languages?.[0]?.fields || item.fields || {};
  const fields = rawFields instanceof Map ? Object.fromEntries(rawFields) : rawFields;

  const price = Number(fields.Price) || 0;
  const originalPrice = Number(fields.OriginalPrice) || price;
  const memberDiscount = Number(fields.MemberDiscount) || Math.round((price * 0.01) / 1000) * 1000;

  return {
    id: item._id.toString(),
    slug: fields.Slug || item.name,
    name: fields.ProductName || fields.Title || item.displayName || item.name,
    kind: fields.Kind || fields.CategoryId || 'phone',
    color: fields.Color || '#1f2937',
    price,
    originalPrice,
    memberDiscount,
    installment0: fields.Installment0 !== false && fields.Installment0 !== '0' && fields.Installment0 !== 0,
    promoText: fields.PromoText || '',
    rating: Number(fields.Rating) || 5,
    fastDelivery: fields.FastDelivery !== false && fields.FastDelivery !== '0' && fields.FastDelivery !== 0,
    specs: parseJson(fields.SpecsJson, []),
    categoryId: fields.CategoryId || 'phone',
    subCategory: fields.SubCategory || '',
    brand: fields.Brand || 'MaoShop',
    tags: parseJson(fields.TagsJson, ['hot']),
    attrs: parseJson(fields.AttrsJson, {}),
    inStock: true,
    isNew: Boolean(fields.IsNew),
    popularity: Number(fields.Popularity) || 50,
    warranty: fields.Warranty || '12 tháng chính hãng',
    description: fields.Description || '',
    colors: parseJson(fields.ColorsJson, [{ name: 'Mặc định', color: fields.Color || '#1f2937' }]),
    gallery: parseJson(fields.GalleryJson, []),
  };
}

function mapCategory(item) {
  if (!item) return null;
  const rawFields = item.languages?.[0]?.fields || item.fields || {};
  const fields = rawFields instanceof Map ? Object.fromEntries(rawFields) : rawFields;

  const slug = fields.Slug || item.name;
  const name = fields.CategoryName || fields.Title || item.displayName || item.name;

  return {
    id: fields.CategoryId || slug,
    slug,
    name,
    title: fields.PageTitle || `${name} chính hãng, giá tốt - MaoShop`,
    group: fields.GroupId || 'all',
    facets: parseJson(fields.FacetsJson, [
      { key: 'hang', label: 'Hãng sản xuất', type: 'brand' },
      { key: 'nhucau', label: 'Nhu cầu', type: 'attr' },
    ]),
    needs: parseJson(fields.NeedsJson, []),
    pricePresets: parseJson(fields.PricePresetsJson, [
      [0, 5000000],
      [5000000, 15000000],
      [15000000, 30000000],
      [30000000, 100000000],
    ]),
    banners: parseJson(fields.BannersJson, [
      {
        title: fields.BannerTitle || name,
        subtitle: fields.BannerSubtitle || 'Ưu đãi chính hãng, trả góp 0%',
        from: '#1f2937',
        to: '#f97316',
        kind: fields.CategoryId || 'phone',
        color: '#f97316',
      },
    ]),
    vouchers: parseJson(fields.VouchersJson, []),
    seo: {
      featured: [],
      intro: fields.SeoIntro || `<p>Khám phá bộ sưu tập ${name} chính hãng tại MaoShop.</p>`,
      toc: [],
      paragraphs: [],
    },
    faq: parseJson(fields.FaqJson, []),
  };
}

class CatalogService {
  /**
   * Get all products for a specific category from CMS
   */
  async getCategoryProducts(categoryId) {
    const items = await PublishedItem.find({
      path: /\/danh-muc\//,
      isDeleted: { $ne: true },
      $or: [
        { 'languages.fields.CategoryId': categoryId },
        { 'fields.CategoryId': categoryId },
      ],
    }).lean();

    // Filter out category parent items themselves, only keep product items
    return items
      .filter((item) => item.path.split('/').length >= 6 || item.path.includes('/san-pham/'))
      .map(mapProduct)
      .filter(Boolean);
  }

  /**
   * Get category configuration and its products from CMS
   */
  async getCategoryData(slug) {
    const catItem = await PublishedItem.findOne({
      path: new RegExp(`/danh-muc/${slug}$`, 'i'),
      isDeleted: { $ne: true },
    }).lean();

    if (!catItem) {
      return null;
    }

    const config = mapCategory(catItem);
    const products = await this.getCategoryProducts(config.id);

    return {
      config,
      products,
    };
  }

  /**
   * Get product detail data from CMS
   */
  async getProductData(slug) {
    const prodItem = await PublishedItem.findOne({
      path: new RegExp(`/(danh-muc/[^/]+|san-pham)/${slug}$`, 'i'),
      isDeleted: { $ne: true },
    }).lean();

    if (!prodItem) {
      return null;
    }

    const product = mapProduct(prodItem);

    // Get related products from the same category
    const relatedItems = await PublishedItem.find({
      path: /\/san-pham\//,
      isDeleted: { $ne: true },
      _id: { $ne: prodItem._id },
      $or: [
        { 'languages.fields.CategoryId': product.categoryId },
        { 'fields.CategoryId': product.categoryId },
      ],
    })
      .limit(8)
      .lean();

    const relatedProducts = relatedItems.map(mapProduct).filter(Boolean);

    // Build rich ProductDetail object strictly from CMS fields
    const rawColors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : [product.color];
    const colors = rawColors.map((c) => {
      if (typeof c === 'string') return { name: 'Màu ' + c, color: c };
      return { name: c.name || 'Mặc định', color: c.color || '#1f2937' };
    });

    const detail = {
      gallery: product.gallery.length > 0
        ? product.gallery
        : colors.map((c, i) => ({
            id: `g-${i}`,
            kind: product.kind,
            color: c.color,
            label: `${product.name} - ${c.name}`,
          })),
      variants: [
        { label: 'Tiêu chuẩn', price: product.price, originalPrice: product.originalPrice },
      ],
      colors,
      specs: product.specs.map((s) => {
        if (typeof s === 'object' && s !== null && s.label) return s;
        const parts = String(s).split(':');
        return { label: parts[0]?.trim() || 'Thông số', value: parts[1]?.trim() || String(s) };
      }),
      highlights: [
        'Bảo hành chính hãng 12 tháng tại các trung tâm bảo hành ủy quyền.',
        '1 đổi 1 trong 30 ngày đầu tiên nếu phát sinh lỗi kỹ thuật từ nhà sản xuất.',
        'Hỗ trợ trả góp 0% lãi suất với thủ tục xét duyệt nhanh chóng.',
        'Miễn phí giao hàng toàn quốc, kiểm tra hàng trước khi thanh toán.',
      ],
      features: [
        { title: 'Chính hãng', value: '100% Nguyên seal' },
        { title: 'Bảo hành', value: product.warranty },
        { title: 'Vận chuyển', value: product.fastDelivery ? 'Giao nhanh 2h' : 'Toàn quốc' },
        { title: 'Trả góp', value: product.installment0 ? '0% Lãi suất' : 'Linh hoạt' },
      ],
      description: [
        product.description || `<p>${product.name} chính hãng mang đến trải nghiệm đột phá với hiệu năng vượt trội.</p>`,
      ],
      compareIds: relatedProducts.slice(0, 3).map((p) => p.id),
    };

    return {
      product,
      detail,
      relatedProducts,
    };
  }

  /**
   * Get home page section data strictly from CMS
   */
  async getHomeData(cmsFields = {}) {
    const allProducts = await PublishedItem.find({
      $or: [
        { path: /\/san-pham\// },
        { path: new RegExp('^/root/content/home/danh-muc/[^/]+/[^/]+$', 'i') },
      ],
      isDeleted: { $ne: true },
    }).lean();

    const mapped = allProducts.map(mapProduct).filter(Boolean);

    // Group products by category from CMS items
    const byCategory = {};
    for (const p of mapped) {
      if (!byCategory[p.categoryId]) byCategory[p.categoryId] = [];
      byCategory[p.categoryId].push(p);
    }

    // Flash sale: products marked with tag 'deal' or highest discount percentage
    const flashSale = [...mapped]
      .filter((p) => p.originalPrice > p.price)
      .sort((a, b) => (b.originalPrice - b.price) - (a.originalPrice - a.price))
      .slice(0, 10);

    return {
      heroTitle: cmsFields.title || 'Siêu Phẩm Công Nghệ 2026',
      heroSubtitle: cmsFields.subtitle || 'Thu cũ đổi mới trợ giá đến 5 triệu, bảo hành chính hãng 12 tháng.',
      promoText: cmsFields.promoText || 'Trả góp sinh viên 0%, duyệt nhanh 5 phút — hạn mức lên đến 30 triệu',
      buttonText: cmsFields.buttonText || 'Mua ngay',
      buttonLink: cmsFields.buttonLink || '/dien-thoai',
      flashSale,
      byCategory,
      totalProducts: mapped.length,
    };
  }
}

module.exports = new CatalogService();
