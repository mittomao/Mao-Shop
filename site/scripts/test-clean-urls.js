'use strict';

const http = require('http');

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { headers: options.headers || {} }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function runTests() {
  console.log('🧪 Bắt đầu kiểm tra tự động URL Mapping và Clean URLs:\n');

  const tests = [
    // 301 Redirects
    {
      name: 'Redirect danh-muc folder root (/danh-muc -> /)',
      path: '/danh-muc',
      expectedStatus: 301,
      expectedLocation: '/',
    },
    {
      name: 'Redirect danh-muc category (/danh-muc/dien-thoai -> /dien-thoai)',
      path: '/danh-muc/dien-thoai',
      expectedStatus: 301,
      expectedLocation: '/dien-thoai',
    },
    {
      name: 'Redirect danh-muc product (/danh-muc/dien-thoai/iphone-17-pro-max-256gb -> /dien-thoai/iphone-17-pro-max-256gb)',
      path: '/danh-muc/dien-thoai/iphone-17-pro-max-256gb',
      expectedStatus: 301,
      expectedLocation: '/dien-thoai/iphone-17-pro-max-256gb',
    },
    // 200 OK Clean URLs
    {
      name: 'Trang chủ (Home)',
      path: '/',
      expectedStatus: 200,
    },
    {
      name: 'Danh mục Điện thoại (/dien-thoai)',
      path: '/dien-thoai',
      expectedStatus: 200,
      contain: 'Điện thoại',
    },
    {
      name: 'Danh mục Laptop (/laptop)',
      path: '/laptop',
      expectedStatus: 200,
      contain: 'Laptop',
    },
    {
      name: 'Danh mục Máy tính bảng (/may-tinh-bang)',
      path: '/may-tinh-bang',
      expectedStatus: 200,
      contain: 'Máy tính bảng',
    },
    {
      name: 'Danh mục Đồng hồ (/dong-ho)',
      path: '/dong-ho',
      expectedStatus: 200,
      contain: 'Đồng hồ',
    },
    {
      name: 'Danh mục Âm thanh (/am-thanh)',
      path: '/am-thanh',
      expectedStatus: 200,
      contain: 'Âm thanh',
    },
    {
      name: 'Danh mục Tivi (/tivi)',
      path: '/tivi',
      expectedStatus: 200,
      contain: 'Tivi',
    },
    {
      name: 'Danh mục Điện máy (/dien-may)',
      path: '/dien-may',
      expectedStatus: 200,
      contain: 'Điện máy',
    },
    {
      name: 'Danh mục Phụ kiện (/phu-kien)',
      path: '/phu-kien',
      expectedStatus: 200,
      contain: 'Phụ kiện',
    },
    {
      name: 'Danh mục Màn hình (/man-hinh)',
      path: '/man-hinh',
      expectedStatus: 200,
      contain: 'Màn hình',
    },
    // Product Detail Pages
    {
      name: 'Sản phẩm: iPhone 17 Pro Max (/dien-thoai/iphone-17-pro-max-256gb)',
      path: '/dien-thoai/iphone-17-pro-max-256gb',
      expectedStatus: 200,
      contain: 'iPhone 17 Pro Max 256GB',
    },
    {
      name: 'Sản phẩm: Samsung Galaxy S25 Ultra (/dien-thoai/samsung-galaxy-s25-ultra-12gb-256gb)',
      path: '/dien-thoai/samsung-galaxy-s25-ultra-12gb-256gb',
      expectedStatus: 200,
      contain: 'Samsung Galaxy S25 Ultra',
    },
    {
      name: 'Sản phẩm: MacBook Pro 14 M5 (/laptop/macbook-pro-14-m5-16gb-512gb)',
      path: '/laptop/macbook-pro-14-m5-16gb-512gb',
      expectedStatus: 200,
      contain: 'MacBook Pro 14 M5',
    },
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const res = await fetch(`http://localhost:4000${t.path}`);
      if (res.statusCode !== t.expectedStatus) {
        console.error(`  ✖ [FAIL] ${t.name} -> Expected ${t.expectedStatus}, got ${res.statusCode}`);
        continue;
      }

      if (t.expectedLocation && res.headers.location !== t.expectedLocation) {
        console.error(
          `  ✖ [FAIL] ${t.name} -> Expected Location: "${t.expectedLocation}", got "${res.headers.location}"`
        );
        continue;
      }

      if (t.contain && !res.body.includes(t.contain)) {
        console.error(`  ✖ [FAIL] ${t.name} -> Body does not contain: "${t.contain}"`);
        continue;
      }

      const sizeKb = (Buffer.byteLength(res.body, 'utf8') / 1024).toFixed(1);
      if (t.expectedStatus === 301) {
        console.log(`  ✔ [301 -> ${res.headers.location}] ${t.name}`);
      } else {
        console.log(`  ✔ [200 OK] ${t.name} (${sizeKb} KB)`);
      }
      passed++;
    } catch (err) {
      console.error(`  ✖ [ERROR] ${t.name} -> ${err.message}`);
    }
  }

  console.log(`\n📊 Kết quả: ${passed}/${tests.length} tests đạt tiêu chuẩn.`);
  if (passed !== tests.length) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
