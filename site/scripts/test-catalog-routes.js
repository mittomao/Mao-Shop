/**
 * Test Catalog Routes (9 Categories + Sample Products nested under categories + Home)
 */
const http = require('http');

const endpoints = [
  { name: 'Trang chủ (Home)', path: '/' },
  { name: 'Danh mục tổng (/danh-muc)', path: '/danh-muc' },
  { name: 'Danh mục Điện thoại', path: '/danh-muc/dien-thoai' },
  { name: 'Danh mục Laptop', path: '/danh-muc/laptop' },
  { name: 'Danh mục Máy tính bảng', path: '/danh-muc/may-tinh-bang' },
  { name: 'Danh mục Màn hình & PC', path: '/danh-muc/man-hinh' },
  { name: 'Danh mục Đồng hồ', path: '/danh-muc/dong-ho' },
  { name: 'Danh mục Âm thanh', path: '/danh-muc/am-thanh' },
  { name: 'Danh mục Tivi', path: '/danh-muc/tivi' },
  { name: 'Danh mục Điện máy', path: '/danh-muc/dien-may' },
  { name: 'Danh mục Phụ kiện', path: '/danh-muc/phu-kien' },
  { name: 'Sản phẩm: iPhone 17 Pro Max 256GB', path: '/danh-muc/dien-thoai/iphone-17-pro-max-256gb' },
  { name: 'Sản phẩm: iPhone 17 Pro 256GB', path: '/danh-muc/dien-thoai/iphone-17-pro-256gb' },
  { name: 'Sản phẩm: Samsung Galaxy S25 Ultra', path: '/danh-muc/dien-thoai/samsung-galaxy-s25-ultra-12gb-256gb' },
  { name: 'Sản phẩm: MacBook Pro 14 M5', path: '/danh-muc/laptop/macbook-pro-14-m5-16gb-512gb' },
];

function check(url) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:4000${url}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, length: data.length, title: (data.match(/<title>([^<]+)<\/title>/i) || [])[1] });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('🧪 Bắt đầu kiểm tra tự động tất cả các route danh mục và sản phẩm lồng nhau:\n');
  let passed = 0;
  for (const ep of endpoints) {
    try {
      const res = await check(ep.path);
      if (res.statusCode === 200) {
        console.log(`  ✔ [200 OK] ${ep.name} -> "${res.title}" (${(res.length / 1024).toFixed(1)} KB)`);
        passed++;
      } else {
        console.error(`  ❌ [${res.statusCode}] ${ep.name} (${ep.path})`);
      }
    } catch (err) {
      console.error(`  ❌ [ERROR] ${ep.name}: ${err.message}`);
    }
  }
  console.log(`\n📊 Kết quả: ${passed}/${endpoints.length} routes đạt tiêu chuẩn HTTP 200 OK.`);
  if (passed !== endpoints.length) process.exit(1);
}

run();
