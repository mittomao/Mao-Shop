# HƯỚNG DẪN PHÁT TRIỂN REACT ISLAND TRONG TREECRAFT SITE (GĐ R-SITE)

Tài liệu này hướng dẫn chi tiết quy trình phát triển, tích hợp và vận hành các thành phần **React Island** bên trong dự án Treecraft Site kết hợp EJS Server-Side Rendering (SSR).

---

## 1. MỤC ĐÍCH / KHI DÙNG

### Mục đích
- **Tối ưu hóa kép giữa SEO và Trải nghiệm Tương tác:** EJS đảm nhận kết xuất toàn bộ mã HTML ngữ nghĩa, thẻ meta Open Graph và nội dung dự phòng (fallback content) phía máy chủ cho công cụ tìm kiếm và mạng xã hội. React chỉ được nạp và gắn (mount) cục bộ vào đúng những vùng cần tương tác động (Carousel, Flash Sale, Deal Tabs, Bộ lọc đa diện, Giỏ hàng fly-out, Thanh mua hàng dính đáy).
- **Bảo toàn Tính Bất Biến của Core CMS:** Toàn bộ mã nguồn React, bundler Vite, EJS wrappers và CSS đều nằm trọn vẹn trong `site/` và cấu hình gốc của dự án. Không chỉnh sửa bất kỳ dòng code nào trong Treecraft Core.
- **Quy trình Phát triển Tinh Gọn (One-Command Dev):** Khởi chạy cả hệ thống chỉ với một lệnh duy nhất `npm run dev`, tự động đồng bộ mã nguồn React qua Vite Watch Mode.

### Khi dùng
- Khi xây dựng các khối giao diện đòi hỏi trạng thái phức tạp (state management), hiệu ứng chuyển động mượt mà (animation framer-motion) hoặc tương tác tức thì phía client.
- Khi cần đưa các component từ thư viện UI React vào dự án website Treecraft CMS mà vẫn giữ vững khả năng quản trị trường dữ liệu trên Content Editor.

---

## 2. ĐIỀU KIỆN TRƯỚC

Trước khi bắt đầu, môi trường phát triển của bạn cần đáp ứng:
1. **Node.js:** Phiên bản `v20.0.0` LTS trở lên (`node -v`).
2. **MongoDB:** Phiên bản `6.0+` đang chạy cục bộ hoặc qua Docker trên cổng 27017 (`mongodb://127.0.0.1:27017`).
3. **Dependencies dự án:** Đã cài đặt đầy đủ các gói cần thiết thông qua `npm install`.

---

## 3. CÁC BƯỚC ĐÁNH SỐ VỚI LỆNH COPY ĐƯỢC

### Bước 1: Khởi động Môi trường Phát triển (Development)
Chạy một lệnh duy nhất để khởi động song song cả Server Treecraft (Express cổng 4000) và chế độ theo dõi mã nguồn React của Vite:

**Trên Windows (PowerShell / Command Prompt):**
```powershell
npm run dev
```

**Trên macOS / Linux (Bash / Zsh):**
```bash
npm run dev
```

*Tiến trình sẽ tự động mở server tại `http://localhost:4000` và theo dõi các thay đổi trong `site/react/src/`.*

---

### Bước 2: Thêm một Component React Mới thành Rendering trong CMS

Khi muốn bổ sung một component tương tác mới (ví dụ: `ProductComparison`), thực hiện theo quy trình 5 bước sau:

#### 2.1. Tạo mã nguồn React Component
Tạo file component tại `site/react/src/components/product/ProductComparison.tsx`:
```tsx
import React, { useState } from 'react';

interface Props {
  title?: string;
  maxItems?: number;
}

export default function ProductComparison({ title = 'So sánh sản phẩm', maxItems = 3 }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-xs text-slate-500">Đã chọn: {selected.length} / {maxItems} thiết bị</p>
    </div>
  );
}
```

#### 2.2. Đăng ký Component vào Registry
Mở file `site/react/src/registry.ts` và thêm component vào bảng ánh xạ:
```typescript
import ProductComparison from './components/product/ProductComparison';

export const registry: Record<string, ComponentType<any>> = {
  // ... các components hiện có
  ProductComparison,
};
```

#### 2.3. Tạo EJS Wrapper
Tạo file view EJS tại `site/views/components/ProductComparison.ejs`:
```html
<%
  const compProps = {
    title: field('Title', 'So sánh cấu hình chi tiết'),
    maxItems: 4,
  };
  const jsonProps = JSON.stringify(compProps).replace(/"/g, '&quot;');
%>
<section class="site-comparison-wrapper" data-react="ProductComparison" data-props="<%= jsonProps %>">
  <!-- Nội dung HTML dự phòng hiển thị cho Googlebot và khi tắt JavaScript -->
  <noscript>
    <div class="container mx-auto px-4 py-6 bg-white rounded-xl shadow-sm">
      <h3 class="text-lg font-bold text-slate-900"><%= compProps.title %></h3>
      <p class="text-xs text-slate-500">Vui lòng bật JavaScript để sử dụng công cụ so sánh.</p>
    </div>
  </noscript>
</section>
```

#### 2.4. Đăng ký Rendering & Template trong CMS
1. Truy cập **Content Editor** tại `http://localhost:4000/admin/content-editor`.
2. Mở nhánh `/root/templates/Feature/Components/`, tạo Template mới mang tên `ProductComparison` với trường `Title` (kiểu `singleLineText`).
3. Mở nhánh `/root/layout/Renderings/`, tạo Rendering mới:
   - **Tên:** `ProductComparison`
   - **viewPath:** `components/ProductComparison.ejs`
   - **componentTemplate:** chọn Template `ProductComparison` vừa tạo ở trên.
4. Gán Rendering vào Placeholder `maincontent` trong Presentation Details của trang mong muốn và bấm **Save**.

#### 2.5. Xuất bản và Đồng bộ hóa YAML
1. Trên Ribbon Content Editor, chọn **PUBLISH** $\rightarrow$ **Publish Item** để đẩy dữ liệu sang Web Store (`items_web`).
2. Chạy lệnh đồng bộ hóa để cập nhật các file cấu hình YAML:
```bash
node core/src/scripts/serialize-section-cli.js reserialize all
```

---

### Bước 3: Truyền Dữ liệu Qua `data-props` An Toàn

Để ngăn chặn triệt để lỗ hổng tấn công XSS và không làm vỡ cú pháp thuộc tính HTML, luôn tuân thủ nguyên tắc:
1. Chuẩn hóa dữ liệu qua helper `field()`, `imageUrl()`, `link()`.
2. Chuyển đổi đối tượng sang chuỗi JSON và thay thế dấu nháy kép `"` thành `&quot;`:

```html
<%
  const safeData = {
    title: field('Title', 'Tiêu đề mặc định'),
    bannerUrl: imageUrl(fields.BannerImage),
    itemsCount: 10,
  };
  const encodedProps = JSON.stringify(safeData).replace(/"/g, '&quot;');
%>
<div data-react="MyIsland" data-props="<%= encodedProps %>"></div>
```

---

### Bước 4: Đóng Gói và Triển Khai (Staging / Production)

Trước khi triển khai lên môi trường thử nghiệm hoặc máy chủ thật, chạy lệnh build để sinh các tệp tĩnh được băm mã (hash):

```bash
npm run build:react
```

Khởi chạy ứng dụng ở chế độ Production:
```bash
npm run start
```
*Lệnh `start` sẽ tự động kiểm tra sự tồn tại của `site/public/react/manifest.json`. Nếu chưa có, script sẽ tự kích hoạt build trước khi khởi chạy server.*

---

## 4. KẾT QUẢ MONG ĐỢI

- Trình duyệt truy cập website công khai (`http://localhost:4000/`):
  - Nhận được mã HTML hoàn chỉnh từ server. Thẻ `<head>` tự động nạp CSS băm `style.[hash].css`.
  - Cuối thẻ `<body>` tự động nạp thẻ script module `main.[hash].js` đọc từ `manifest.json`.
  - Toàn bộ các thẻ có thuộc tính `[data-react="..."]` được mount thành các React Root độc lập.
  - Thao tác bấm "Thêm vào giỏ" trên bất kỳ island nào lập tức cập nhật số lượng badge trên Header và mở fly-out CartDrawer.
- Công cụ tìm kiếm (crawler) hoặc khi tắt JavaScript:
  - Khung giao diện, thẻ SEO Open Graph và nội dung bên trong `<noscript>` vẫn hiển thị đầy đủ, không bị trang trắng.

---

## 5. CÁCH KIỂM TRA

Chạy bộ kiểm thử tự động của dự án:
```bash
npm test
```

Kiểm tra thủ công:
1. **Kiểm tra Mount Island:** Mở Console trình duyệt (F12), không xuất hiện lỗi đỏ nào.
2. **Kiểm tra Độc Lập Lỗi (Error Boundary):** Thử cố tình truyền dữ liệu lỗi vào một island, chỉ riêng island đó hiển thị thông báo lỗi cục bộ, các island khác và toàn bộ trang web vẫn hoạt động bình thường.
3. **Kiểm tra Thoát Hiểm XSS:** Nhập chuỗi `"><script>alert(1)</script>` vào trường `Title` trong Content Editor, bấm Publish. Mở trang xem mã nguồn HTML $\rightarrow$ chuỗi hiển thị an toàn dưới dạng ký tự escape, không có hộp thoại alert nào bật lên.
4. **Kiểm tra Tính Bất Biến của Core:**
```bash
git -C core status --short
```
*Kết quả phải hoàn toàn trống (không có bất kỳ file core nào bị sửa).*

---

## 6. LỖI THƯỜNG GẶP & CÁCH KHẮC PHỤC

| Lỗi gặp phải | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| **Island không mount (vẫn hiển thị fallback HTML)** | Chưa đăng ký component trong `site/react/src/registry.ts` hoặc sai tên thuộc tính `data-react`. | Kiểm tra tên component trong thuộc tính `data-react` phải khớp chính xác chữ hoa/thường với key trong `registry.ts`. |
| **Trang báo lỗi 500 khi nạp layout** | File `site/public/react/manifest.json` chưa được tạo do chưa chạy build React. | Chạy lệnh `npm run build:react` để sinh bundle và manifest. |
| **Lỗi cú pháp JSON khi mount** | Truyền trực tiếp chuỗi chứa dấu nháy kép `"` vào thuộc tính `data-props` mà không thay thế bằng `&quot;`. | Áp dụng đúng cú pháp: `JSON.stringify(props).replace(/"/g, '&quot;')`. |
| **Mất kiểu dáng CSS của React component** | File `site/react/src/main.tsx` bị thiếu dòng import `./index.css`. | Đảm bảo `import './index.css';` nằm ở đầu file `site/react/src/main.tsx`. |

---

## 7. CẢNH BÁO

> [!CAUTION]
> **Tuyệt Đối Không Sửa Core:** Mọi file trong thư mục `core/` thuộc về submodule Treecraft Core. Không bao giờ tạo file, sửa code hay cài đặt thư viện bên trong `core/`.

> [!WARNING]
> **Không Sử Dụng Client-Side Router:** Không sử dụng `BrowserRouter` hoặc `HashRouter` lồng vào toàn trang; việc chuyển trang phải do Treecraft Server điều hướng thông qua thẻ `<a href="...">` để bảo toàn năng lực SEO.

> [!IMPORTANT]
> **Bảo Mật Biến Môi Trường:** Không đưa bất kỳ thông tin bí mật (database connection string, JWT secret, Cloudinary API Secret) vào mã nguồn React trong `site/react/`. Toàn bộ bundle client-side đều có thể bị người dùng xem thấy trên trình duyệt.
