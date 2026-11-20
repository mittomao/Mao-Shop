'use strict';

const path = require('path');
const coreResolverPath = path.resolve(__dirname, '../../core/src/services/siteResolver');

function installUrlMapping() {
  setImmediate(() => {
    let siteResolver;
    try {
      siteResolver = require(coreResolverPath);
    } catch (err) {
      console.warn('[urlMapping] Could not load siteResolver:', err.message);
      return;
    }

    if (!siteResolver || typeof siteResolver.resolve !== 'function') {
      return;
    }

    // Idempotent guard
    if (siteResolver.__urlMappingInstalled) return;
    siteResolver.__urlMappingInstalled = true;

    const originalResolve = siteResolver.resolve.bind(siteResolver);

    siteResolver.resolve = async function (rawUrl, options = {}) {
      if (!rawUrl || typeof rawUrl !== 'string') {
        return originalResolve(rawUrl, options);
      }

      const trimmed = rawUrl.trim();

      // 1. Redirect /danh-muc -> / (Folder is not a page)
      if (trimmed === '/danh-muc' || trimmed === '/danh-muc/') {
        return { redirect: '/', statusCode: 301 };
      }

      // 2. Redirect legacy /danh-muc/:path -> /:path (SEO 301 Permanent Redirect)
      if (trimmed.startsWith('/danh-muc/')) {
        const cleanTarget = trimmed.replace(/^\/danh-muc/, '') || '/';
        return { redirect: cleanTarget, statusCode: 301 };
      }

      // 3. Normal resolution first
      try {
        return await originalResolve(rawUrl, options);
      } catch (err) {
        // 4. Fallback: if not found, check if it maps to an item under /danh-muc/
        // E.g. /dien-thoai -> /danh-muc/dien-thoai
        // or /dien-thoai/iphone-17-pro-max-256gb -> /danh-muc/dien-thoai/iphone-17-pro-max-256gb
        if (err.statusCode === 404 || err.name === 'NotFoundError') {
          const mappedUrl = '/danh-muc' + (trimmed.startsWith('/') ? trimmed : '/' + trimmed);
          try {
            const res = await originalResolve(mappedUrl, options);
            if (res && res.item) {
              return {
                ...res,
                cleanPath: trimmed,
              };
            }
          } catch (_mapErr) {
            // Ignore and rethrow original 404
          }
        }
        throw err;
      }
    };
  });
}

module.exports = { installUrlMapping };
