# CÂU HỎI KỸ THUẬT & NGHIỆP VỤ GIAI ĐOẠN R-SITE (REACT ISLAND TRONG SITE)
> File: `docs/open-questions.md`  
> Trạng thái: Chờ duyệt trong Giai đoạn R-SITE

---

### 1. Đường dẫn dự án React mẫu và khả năng truy cập của AI
- **Trạng thái:** Đã xác nhận (Đã kiểm tra)
- **Kết quả khảo sát:** AI đã kiểm tra trực tiếp và truy cập thành công thư mục `D:\Claude Code\Clone Website 2`. Thư mục chứa đầy đủ mã nguồn TypeScript, cấu hình Vite và package-lock.json.
- **Đề xuất:** **Người dùng không cần thao tác copy thủ công** vào `site/_import/react-sample/`. AI sẽ đọc trực tiếp từ `D:\Claude Code\Clone Website 2` trong quá trình thực hiện.

---

### 2. Xử lý định tuyến Router (`react-router-dom`)
- **Trạng thái:** Đề xuất mặc định (Chờ duyệt)
- **Quyết định liên quan:** [DEC-057](./decisions/DEC-057-react-island-architecture.md)
- **Lựa chọn A (Đề xuất):** **Loại bỏ hoàn toàn `react-router-dom` ở phía client.** Mỗi route của mẫu (`/`, `/danh-muc/:slug`, `/san-pham/:slug`, `*`) sẽ chuyển thành một **Page Template** trong Treecraft (`/root/templates/Project/Pages/...`). Toàn bộ điều hướng trang do máy chủ Express EJS quản lý và sử dụng các helper view chuẩn của CMS (`link()`, `navItems()`).
- **Lựa chọn B:** Giữ `react-router` chạy dạng client-side SPA lồng bên trong một trang EJS duy nhất.
- **Lý do đề xuất:** Lựa chọn A đảm bảo 100% khả năng Server-Side Rendering (SEO thân thiện), tương thích tự nhiên với cơ chế phân quyền, xuất bản (publish) và quản lý cây nội dung của Treecraft CMS.

---

### 3. Nguồn dữ liệu của mẫu và cách tích hợp vào CMS
- **Trạng thái:** Đề xuất mặc định (Chờ duyệt)
- **Kết quả khảo sát:** Mẫu 100% sử dụng dữ liệu tĩnh (mock data) khai báo trong `src/data/*.ts` (`products.ts`, `catalog.ts`, `site.ts`...), không gọi API bên ngoài (`fetch`/`axios`).
- **Lựa chọn A (Đề xuất):** **Chuyển các thuộc tính cấu hình/tiêu đề thành field của Component Template CMS.** Các dữ liệu danh mục, sản phẩm mẫu được đưa vào `site/react/data/` làm nguồn dữ liệu mặc định. Khi render, EJS truyền các giá trị ghi đè (override fields) từ CMS sang React thông qua thuộc tính `data-props`.
- **Lựa chọn B:** Tạo REST API mới trong core để phục vụ dữ liệu.
- **Lý do đề xuất:** Lựa chọn A không vi phạm quy tắc cấm sửa core, giúp site hoạt động độc lập và cho phép biên tập viên chỉnh sửa trực tiếp nội dung trên Content Editor.

---

### 4. Phân loại thành phần: Giữ React Island vs Chuyển sang EJS thuần
- **Trạng thái:** Đề xuất mặc định (Chờ duyệt)
- **Quyết định liên quan:** [DEC-057](./decisions/DEC-057-react-island-architecture.md)
- **Lựa chọn A (Đề xuất):**
  - **EJS thuần (Trình bày tĩnh, tối ưu SEO, không cần JS):** `TopBar`, `Footer`, `PromoStrip`, `AccessoryGrid`, `Offers`, `News`, `TechSpecs`, `HighlightContent`, `404`.
  - **React Island (Tương tác động, có state/animation):** `HeroCarousel` (auto-slide, tabs progress), `FlashSale` (countdown, slot selector, carousel), `DealTabs` (framer-motion animation), `CategorySection` (product carousel), `CategoryFilters` (faceted filter, price range slider), `ProductDetailInteractive` (image gallery, variant/color selector, warranty, add to cart), `CartDrawer` (fly-out drawer).
- **Lựa chọn B:** Chuyển toàn bộ tất cả component thành React Island.
- **Lý do đề xuất:** Giảm thiểu tối đa kích thước bundle JavaScript tải về trình duyệt, trang nạp tức thì và hiển thị đầy đủ thông tin cho các bot tìm kiếm (Googlebot).

---

### 5. Xử lý danh sách lặp (Repeated Lists) & Hạn chế Datasource của CMS
- **Trạng thái:** Đề xuất mặc định (Chờ duyệt)
- **Bối cảnh:** Hiện tại Treecraft chưa có kiểu trường `Treelist` hoặc cơ chế gắn Datasource Item riêng lẻ cho từng Rendering (Component đọc Effective Fields từ Page Item).
- **Lựa chọn A (Đề xuất):** Sử dụng các trường `Multi-Line Text` (hoặc JSON textarea) trên Template cho các danh sách có thể chỉnh sửa đơn giản, kết hợp nạp sẵn bộ catalog mẫu trong `site/react/data/`. Đồng thời ghi nhận vào danh mục "Yêu cầu cho core" để bổ sung tính năng Datasource/Treelist ở các giai đoạn sau.
- **Lựa chọn B:** Tạo cấu trúc Item con phân cấp dưới Page và viết helper tùy biến trong view để duyệt item con.
- **Lý do đề xuất:** Lựa chọn A an toàn, ổn định và không can thiệp vào logic lõi của core.

---

### 6. Đánh giá tính pháp lý & Giấy phép thư viện
- **Trạng thái:** Đã kiểm tra (Đủ điều kiện)
- **Kết quả khảo sát:** Toàn bộ dependencies (`react`, `react-dom`, `framer-motion`, `lucide-react`, `tailwindcss`, `vite`) đều mang giấy phép mã nguồn mở chuẩn (MIT / ISC / Apache-2.0). Đồ họa sản phẩm vẽ bằng vector SVG nội suy (`DeviceImage`), font chữ Inter mở (OFL).
- **Đề xuất:** **Đủ điều kiện pháp lý** để tích hợp và phân phối trong dự án mà không vi phạm bản quyền hay sở hữu trí tuệ.

---

### 7. Công nghệ Bundler & Ngôn ngữ lập trình
- **Trạng thái:** Đề xuất mặc định (Chờ duyệt)
- **Lựa chọn A (Đề xuất):** **Sử dụng Vite 6 + TypeScript.** Giữ nguyên định dạng `.tsx` của component mẫu, đặt trong `site/react/`.
- **Lựa chọn B:** Chuyển đổi toàn bộ mã nguồn TypeScript sang JavaScript thuần (`.jsx`).
- **Lý do đề xuất:** Giữ TypeScript giúp bảo toàn type safety, tránh rủi ro phát sinh lỗi cú pháp khi convert tay, đồng thời Vite biên dịch TypeScript sang JavaScript trong quá trình build mà không ảnh hưởng runtime của trình duyệt.

---

### 8. Quy tắc Git đối với thư mục build `site/public/react/`
- **Trạng thái:** Đề xuất mặc định (Chờ duyệt)
- **Lựa chọn A (Đề xuất):** **Không commit thư mục build `site/public/react/` vào Git.** Thêm `site/public/react/` vào `.gitignore` của dự án. File bundle sẽ được sinh tự động khi chạy `npm run build:react` trong quy trình CI/CD hoặc deploy.
- **Lựa chọn B:** Commit toàn bộ file build `.js` và `.css` có mã băm vào repository.
- **Lý do đề xuất:** Tuân thủ quy ước Clean Git, tránh làm phình to lịch sử Git do các tệp băm nhị phân/minified JS liên tục thay đổi sau mỗi lần build.
