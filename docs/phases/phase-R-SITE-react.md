---
phase: R-SITE
name: Đưa Dự Án React Mẫu Vào Site Theo Kiến Trúc React Island
status: Hoàn thành
depends_on: [S]
estimate: 3-4 ngày làm việc
started: 2026-11-19
completed: 2026-11-19
updated: 2026-11-19
---

# GĐ R-SITE — Đưa Dự Án React Mẫu Vào Site (React Island)

> Tích hợp mã nguồn giao diện thương mại điện tử từ dự án React mẫu (`D:\Claude Code\Clone Website 2`) vào dự án Treecraft Site hiện tại theo mô hình **React Island Architecture**. Máy chủ EJS giữ vai trò Server-Side Rendering (SSR) bố cục chính và tối ưu hóa SEO. React chỉ mount cục bộ tại các khối cần tương tác động (Carousel, Flash Sale, Deal Tabs, Facet Filters, Product Detail Interactive, Cart Drawer). Toàn bộ thay đổi nằm trọn vẹn trong `site/` và cấu hình gốc của dự án, bảo vệ tính bất biến 100% của Treecraft Core.

---

## 1. MỤC TIÊU GIAI ĐOẠN R-SITE

1. **Bảo tồn tính bất biến của Treecraft Core:**
   - Tuyệt đối không can thiệp, không sửa bất kỳ dòng code nào trong `core/` (`node_modules/@<scope>/treecraft-core`).
   - Mọi thành phần mới (Vite config, React components, EJS wrappers, Serialization YAML, build scripts) chỉ nằm trong `site/` và `package.json` gốc.
2. **Kiến trúc React Island kết hợp EJS SSR:**
   - EJS kết xuất đầy đủ thẻ meta SEO (title, description, canonical, open graph) và khung HTML dự phòng (fallback content cho trường hợp tắt JavaScript).
   - React chỉ mount vào các thẻ có thuộc tính `[data-react="..."]` thông qua dữ liệu `data-props`.
   - Một island gặp lỗi (crash) không làm sụp đổ toàn bộ trang web (tích hợp React Error Boundary riêng cho từng island).
3. **Bộ công cụ Build Vite Tối Ưu & Tên File Có Hash:**
   - Mã nguồn React đặt tại `site/react/` với TypeScript.
   - Vite đóng gói bundle ra `site/public/react/` với tên file có hash (`main.[hash].js`, `style.[hash].css`) và file `manifest.json`.
   - Layout EJS nạp bundle động thông qua `manifest.json`, không hardcode tên file.
4. **Môi trường Phát triển Một Lệnh (`npm run dev`):**
   - Viết script Node.js thuần `site/scripts/dev.js` khởi chạy song song server dev của Treecraft và chế độ watch của Vite.
   - Khi nhấn `Ctrl + C`, cả hai tiến trình con đều được dừng an toàn.
5. **Chuyển đổi Toàn diện Component & Trang sang Serialization CMS:**
   - Xây dựng Component Templates (`/root/templates/Feature/Components/...`) tương ứng các thành phần mẫu.
   - Xây dựng Page Templates (`/root/templates/Project/Pages/...`) cho Trang Chủ (Home), Danh Mục (Category), Chi Tiết (Product Detail).
   - Đồng bộ hóa toàn bộ vào `site/serialization/` dạng YAML chuẩn mực; kiểm chứng đạt 100% qua `npm run tree:compare`.
6. **Bảo mật CSP & An Toàn Dữ Liệu:**
   - Không tự ý nới lỏng CSP, không sử dụng `unsafe-eval` trong code mới.
   - Mọi chuỗi JSON truyền qua `data-props` đều được escape HTML an toàn chống XSS. Không nhúng bí mật/API keys vào client bundle.

---

## 2. BẢNG PHÂN TÍCH CÁC NHÓM CÔNG VIỆC: HIỆN TRẠNG $\rightarrow$ THAY ĐỔI $\rightarrow$ RỦI RO

| Nhóm | Hiện trạng trong Site | Thay đổi trong GĐ R-SITE | Mức độ rủi ro & Cách khắc phục |
| :--- | :--- | :--- | :--- |
| **Nhóm A: Toolchain & Vite Bundler** | Dự án chỉ có script chạy `treecraft.js dev`, chưa có công cụ build frontend. | Thêm Vite, React 18, TypeScript vào `package.json` gốc. Cấu hình Vite build ra `site/public/react/` có manifest. | **Trung bình:** Xung đột phiên bản package. *Khắc phục:* Khoá chặt version trong `package.json`, cài đặt chuẩn qua npm. |
| **Nhóm B: Mount Helper & Island Registry** | Chưa có cơ chế nạp React vào EJS. | Viết entry `site/react/src/main.tsx` tự động quét `[data-react]`, tra cứu `registry.ts`, nạp `data-props` và bọc Error Boundary. | **Cao:** Lỗi parse JSON props làm sập JS. *Khắc phục:* Bọc `try-catch` khi parse JSON và bọc `ErrorBoundary` cho từng island. |
| **Nhóm C: Tích hợp `npm run dev`** | `npm run dev` chỉ gọi `node core/bin/treecraft.js dev`. | Tạo `site/scripts/dev.js` chạy song song `treecraft dev` và `vite build --watch`. | **Thấp:** Tiến trình con bị mồ côi (zombie process). *Khắc phục:* Bắt tín hiệu SIGINT/SIGTERM để kill tree con. |
| **Nhóm D: Di chuyển & Chuyển đổi Components** | Chỉ có 3 component cơ bản trong `site/views/components/` (`HeroBanner`, `ImageText`, `Introduction`). | Chuyển các component tĩnh sang EJS; đưa các component tương tác vào `site/react/` và tạo EJS wrapper tương ứng. | **Trung bình:** Thiếu CSS/styles do Tailwind. *Khắc phục:* Nạp `style.[hash].css` vào `head.ejs`. |
| **Nhóm E: Serialization & Content Tree** | Cây nội dung chỉ có 2 trang mẫu (`home`, `about-us`). | Tạo Component Templates, Renderings, Page Templates cho Home, Category, Product Detail; xuất bản ra `site/serialization/`. | **Cao:** Lệch cây hoặc thiếu trường dữ liệu. *Khắc phục:* Chạy `npm run tree:compare` và dry-run đối soát nghiêm ngặt. |
| **Nhóm F: Hướng dẫn Sử dụng** | Chưa có hướng dẫn phát triển React trong Site. | Soạn thảo tài liệu chuẩn 7 mục tại `docs/guides/react-in-site.md`. | **Thấp:** Không ảnh hưởng mã nguồn. |

---

## 3. CẤU TRÚC THƯ MỤC ĐÍCH TRONG `site/`

```
site/
├── react/                          # Mã nguồn React Island
│   ├── src/
│   │   ├── components/             # React components tương tác (HeroCarousel, FlashSale, DealTabs, Filters...)
│   │   ├── context/                # ShopContext và Shared Event Bus
│   │   ├── data/                   # Mock data catalog, categories, products
│   │   ├── hooks/                  # Custom hooks (filters, click outside, etc.)
│   │   ├── lib/                    # Helpers định dạng tiền tệ, xử lý class
│   │   ├── types/                  # TypeScript interface định nghĩa kiểu
│   │   ├── registry.ts             # Bảng đăng ký ánh xạ tên component -> React Component
│   │   └── main.tsx                # Entry point quét [data-react] và mount islands
│   ├── index.css                   # File CSS nguồn chứa @theme Tailwind v4
│   ├── tsconfig.json               # Cấu hình TypeScript cho React
│   └── vite.config.ts              # Cấu hình build Vite (library/island mode, manifest: true)
├── scripts/
│   └── dev.js                      # Script Node.js chạy song song Treecraft dev & Vite watch
├── views/
│   ├── components/                 # EJS wrappers cho từng React Island + EJS components thuần
│   │   ├── HeroCarousel.ejs        # Wrapper cho island HeroCarousel
│   │   ├── FlashSale.ejs           # Wrapper cho island FlashSale
│   │   ├── DealTabs.ejs            # Wrapper cho island DealTabs
│   │   ├── CategorySection.ejs     # Wrapper cho island CategorySection
│   │   ├── CategoryFilters.ejs     # Wrapper cho island CategoryFilters
│   │   ├── ProductDetailInteractive.ejs # Wrapper cho island ProductDetail
│   │   ├── PromoStrip.ejs          # Component EJS thuần
│   │   ├── AccessoryGrid.ejs       # Component EJS thuần
│   │   ├── Offers.ejs              # Component EJS thuần
│   │   └── News.ejs                # Component EJS thuần
│   ├── layouts/
│   │   └── ShopLayout.ejs          # Layout chung cho toàn bộ website thương mại điện tử
│   └── partials/
│       ├── head.ejs                # Nạp manifest CSS tự động
│       ├── header.ejs              # Header có điểm mount HeaderActions
│       ├── footer.ejs              # Footer EJS thuần
│       ├── topbar.ejs              # Topbar EJS thuần
│       └── react-scripts.ejs       # Đọc manifest.json nạp bundle JS/CSS có hash
├── public/
│   └── react/                      # Thư mục chứa bundle build Vite (.gitignore bỏ qua)
│       ├── manifest.json           # Bản đồ ánh xạ file nguồn -> file có mã băm
│       ├── main.[hash].js
│       └── style.[hash].css
└── serialization/                  # Templates, Renderings, Pages YAML được cập nhật
```

---

## 4. CHECKLIST CÔNG VIỆC CHI TIẾT

### Task 1: Cấu hình Toolchain & Dependencies (Chỉ khi có lệnh APPROVE GĐ R-SITE)
- [x] Thêm các dependencies (`react`, `react-dom`, `framer-motion`, `lucide-react`) vào `package.json` gốc.
- [x] Thêm các devDependencies (`vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `typescript`, `@types/react`, `@types/react-dom`) vào `package.json` gốc.
- [x] Khởi tạo `site/react/vite.config.ts` xuất bundle ra `site/public/react/` kèm `manifest.json`.
- [x] Khởi tạo `site/react/tsconfig.json`.
- [x] Viết script `site/scripts/dev.js` chạy song song `treecraft dev` và `vite build --watch`.
- [x] Cập nhật npm scripts trong `package.json` gốc: `"dev": "node site/scripts/dev.js"`, `"build:react": "vite build --config site/react/vite.config.ts"`.

### Task 2: Xây dựng Mount Helper & Island Registry
- [x] Tạo `site/react/src/registry.ts` đăng ký danh mục các island component.
- [x] Tạo `site/react/src/main.tsx` quét `[data-react]`, phân tích `data-props` an toàn, bọc `ErrorBoundary` độc lập.
- [x] Viết partial `site/views/partials/react-scripts.ejs` đọc `manifest.json` và render thẻ `<script type="module" src="...">` tương ứng.
- [x] Tạo module `site/react/src/context/ShopContext.tsx` kết hợp DOM CustomEvent hỗ trợ trao đổi giỏ hàng giữa các island.

### Task 3: Di chuyển & Chuyển đổi Components
- [x] Sao chép các thư mục mã nguồn cần thiết (`types`, `lib`, `data`, `hooks`, `components`) từ mẫu vào `site/react/src/`.
- [x] Chuyển đổi các thành phần tĩnh sang EJS: `views/partials/topbar.ejs`, `views/components/PromoStrip.ejs`, `views/components/AccessoryGrid.ejs`, `views/components/Offers.ejs`, `views/components/News.ejs`, `views/partials/footer.ejs`.
- [x] Tạo các EJS wrappers cho React Island trong `views/components/`:
  - `Hero.ejs`
  - `FlashSale.ejs`
  - `DealTabs.ejs`
  - `CategorySection.ejs`
  - `CategoryPageIsland.ejs`
  - `ProductDetailPageIsland.ejs`
  - `CartDrawer.ejs`
- [x] Bổ sung nội dung HTML dự phòng (fallback content) trong các EJS wrapper phục vụ crawler và khi tắt JS.

### Task 4: Tạo Template, Rendering và Nội dung trong CMS
- [x] Tạo các Component Templates dưới `/root/templates/Feature/Components/` cho từng component mới.
- [x] Tạo các Rendering Items dưới `/root/layout/Renderings/` trỏ đúng `viewPath`.
- [x] Tạo Layout `ShopLayout` dưới `/root/layout/Layouts/`.
- [x] Tạo Page Templates dưới `/root/templates/Project/Pages/`:
  - `Shop Home Page`
  - `Category Page`
  - `Product Detail Page`
- [x] Tạo Page Items mẫu dưới `/root/content` và thiết lập Standard Presentation.
- [x] Đồng bộ toàn bộ vào `site/serialization/` thông qua `reserialize all`.

### Task 5: Soạn thảo Tài liệu & Kiểm chứng
- [x] Soạn thảo tài liệu chuẩn 7 mục `docs/guides/react-in-site.md`.
- [x] Kiểm chứng kiểm thử: `npm run dev` khởi động trơn tru; `build:react` sinh file có mã băm; island mount chính xác; dữ liệu giỏ hàng hoạt động; tắt JS trang vẫn đọc được; nhập nội dung chứa thẻ `<script>` không gây XSS.
- [x] Chạy bộ test tự động `npm test` đạt 9/9 tests passed.
- [x] Báo cáo kết quả và dừng lại chờ lệnh duyệt.

---

## 5. DEFINITION OF DONE (DOD) & CÁCH KIỂM THỬ

1. **Bảo toàn Core 100%:**
   - Không có file nào trong `core/` bị thêm, sửa hoặc xóa (`git -C core status --short` hoàn toàn trống).
2. **Khởi chạy Một Lệnh:**
   - Chạy `npm run dev` khởi động đồng thời cả server Express (cổng 4000) và tiến trình Vite watch. Bấm `Ctrl + C` dừng cả hai không để lại tiến trình ngầm.
3. **Mount Island & Tương tác:**
   - Trang chủ (`/`), trang danh mục, trang chi tiết nạp thành công các island React.
   - Thao tác thêm vào giỏ hàng cập nhật đúng badge trên Header và hiển thị sản phẩm trong CartDrawer.
4. **Nội dung Dự phòng khi Tắt JavaScript:**
   - Tắt JavaScript trong trình duyệt (Chrome DevTools $\rightarrow$ Settings $\rightarrow$ Disable JavaScript), trang web vẫn hiển thị cấu trúc nội dung, hình ảnh sản phẩm tĩnh và bài viết giới thiệu.
5. **An toàn Bảo mật (CSP & XSS):**
   - Không có cảnh báo vi phạm Content Security Policy trên Console trình duyệt.
   - Điền dữ liệu thử nghiệm chứa chuỗi `"><script>alert(1)</script>` vào trường CMS, kiểm tra giao diện không bị phá vỡ thuộc tính `data-props` và script không bị thực thi.
6. **Đồng bộ Serialization:**
   - Chạy `npm run tree:compare` đạt kết quả đồng nhất 100% giữa Database và file YAML trên đĩa.
7. **Tài liệu Hướng dẫn Chuẩn 7 Mục:**
   - File `docs/guides/react-in-site.md` hoàn thành đầy đủ 7 mục theo đúng quy tắc.
8. **Kỷ luật Git:**
   - Không có bất kỳ lệnh commit nào được thực thi. `git status --short` phản ánh chính xác các file đã thêm/sửa theo nhóm.
