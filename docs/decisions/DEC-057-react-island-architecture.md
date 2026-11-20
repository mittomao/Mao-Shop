# DEC-057: Kiến Trúc React Island trong Treecraft Site

- **Trạng thái:** Đề xuất (Chờ duyệt trong GĐ R-SITE)
- **Ngày quyết định:** 2026-11-19
- **Người đề xuất:** Senior Full-stack Developer (AI Agent)
- **Phạm vi:** `site/react/`, `site/views/components/`, `site/public/react/`, `site/scripts/`

---

## 1. Bối cảnh
Treecraft là hệ thống Content Management System kết xuất 100% Server-Side Rendering (SSR) bằng EJS và Express.js. Để đáp ứng các nhu cầu trải nghiệm thương mại điện tử hiện đại (carousel tự động, giỏ hàng tương tác, lọc facet đa diện, thanh mua dính đáy), hệ thống cần tích hợp các thành phần giao diện từ dự án React mẫu (Vite + React 18 + TypeScript).

Tuy nhiên, việc biến toàn bộ website thành SPA (Single Page Application) hoặc áp dụng Next.js SSR hoàn toàn đi ngược lại triết lý thiết kế và hạ tầng monolithic của Treecraft, gây mất mát khả năng SEO máy chủ và phá vỡ kiến trúc Presentation Details (Layout, Placeholder, Rendering).

## 2. Quyết định Kiến trúc
Áp dụng mô hình **React Island Architecture**:
1. **Máy chủ EJS chịu trách nhiệm bố cục và SEO:** Trang web tải về đầy đủ mã HTML ngữ nghĩa, thẻ meta Open Graph, tiêu đề và khung nội dung dự phòng (fallback HTML).
2. **React chỉ mount cục bộ tại các điểm tương tác:** Các component có trạng thái phức tạp (HeroCarousel, FlashSale, DealTabs, CategoryFilters, ProductDetailInteractive) được bọc bên trong EJS wrapper với thuộc tính định danh:
   ```html
   <div data-react="ComponentName" data-props="<%= JSON.stringify(props).replace(/"/g, '&quot;') %>">
     <!-- Nội dung HTML dự phòng hiển thị khi tắt JS hoặc đang tải bundle -->
   </div>
   ```
3. **Bộ khởi tạo Mount Helper duy nhất (`site/react/src/main.tsx`):**
   - Quét toàn bộ DOM tìm các phần tử có thuộc tính `[data-react]`.
   - Tra cứu tên component trong `componentRegistry`.
   - Giải mã an toàn chuỗi JSON trong `data-props`.
   - Khởi tạo React Root (`createRoot(el)`) độc lập với Error Boundary riêng biệt cho từng island (một island gặp sự cố không làm ảnh hưởng các phần còn lại của trang).
4. **Vite Bundler xuất bản tệp có Hash và Manifest:**
   - Mã nguồn đặt tại `site/react/`.
   - Kết quả build nằm tại `site/public/react/` với định dạng tên tệp băm an toàn cache (`[name].[hash].js`, `[name].[hash].css`) và tệp `manifest.json`.
   - View EJS nạp script động dựa trên `manifest.json`.
5. **Điều phối Trạng thái Liên Island (Cross-Island Communication):**
   - Không dùng `react-router` ở phía client; mọi chuyển hướng thực hiện qua liên kết HTML tiêu chuẩn do CMS quản lý.
   - Trạng thái giỏ hàng, danh sách yêu thích và thông báo (toasts) lưu trữ tại `localStorage` và trao đổi giữa các island độc lập thông qua DOM `CustomEvent` (`window.dispatchEvent` / `window.addEventListener`).
6. **Môi trường phát triển một lệnh (`npm run dev`):**
   - Sử dụng script Node.js thuần `site/scripts/dev.js` khởi chạy song song `node core/bin/treecraft.js dev` và `vite build --watch`.
   - Tự động bắt tín hiệu tắt (SIGINT/SIGTERM) để giải phóng tiến trình con mà không cần cài đặt thêm thư viện quản lý tiến trình bên ngoài.

## 3. Hệ quả
- **Ưu điểm:**
  - Giữ vững 100% khả năng SEO và tốc độ phản hồi ban đầu của SSR EJS.
  - Tận dụng trọn vẹn sức mạnh tương tác và hệ sinh thái UI của React (framer-motion, lucide-react).
  - Tách biệt ranh giới rõ ràng: Treecraft Core hoàn toàn bất biến, mã React nằm trọn vẹn trong `site/`.
- **Hạn chế:**
  - Cần duy trì mã HTML dự phòng bên trong EJS wrapper để đảm bảo trải nghiệm khi JavaScript bị tắt.
  - Các island không chia sẻ chung Virtual DOM tree mà kết nối qua DOM CustomEvent.
