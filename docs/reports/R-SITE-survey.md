# BÁO CÁO KHẢO SÁT DỰ ÁN REACT MẪU (GĐ R-SITE)
> File: `docs/reports/R-SITE-survey.md`  
> Ngày thực hiện: 2026-11-19  
> Người thực hiện: Senior Full-stack Developer (AI Agent)  
> Nguồn khảo sát: `D:\Claude Code\Clone Website 2`

---

## 1. TỔNG QUAN DỰ ÁN REACT MẪU

Dự án mẫu là một ứng dụng Web thương mại điện tử chuyên bán lẻ thiết bị di động và điện tử công nghệ mang tên **MaoShop** (tên package: `maoshop`). Toàn bộ giao diện bằng tiếng Việt, thiết kế tối ưu cho trải nghiệm mua sắm hiện đại với hiệu ứng chuyển động mượt mà, bộ lọc đa diện (faceted search), giỏ hàng tức thời và trang chi tiết sản phẩm toàn diện.

---

## 2. KHẢO SÁT TOOLCHAIN & MÔI TRƯỜNG BUILD

- **Loại hình ứng dụng:** Single Page Application (SPA) thuần Client-Side, **không sử dụng Server-Side Rendering (SSR) hay Next.js**. Rất phù hợp để bóc tách thành kiến trúc **React Island** trên nền Treecraft EJS SSR.
- **Bundler & Build Tool:** **Vite 6.3.2** kết hợp plugin chính thức `@vitejs/plugin-react` (4.4.1) và `@tailwindcss/vite` (4.1.4).
- **Ngôn ngữ:** **TypeScript ~5.7.3** (100% mã nguồn viết dưới dạng `.ts` và `.tsx`, có `tsconfig.json`).
- **Phiên bản React:** **React 18.3.1** (`react` và `react-dom`).
- **Trình quản lý gói:** **npm** (sở hữu `package-lock.json` lockfileVersion 3).
- **Scripts hiện có trong mẫu:**
  - `dev`: `vite`
  - `build`: `tsc --noEmit && vite build`
  - `preview`: `vite preview`
  - `typecheck`: `tsc --noEmit`
- **Danh sách Dependencies hiện có trong mẫu:**
  ```json
  {
    "dependencies": {
      "framer-motion": "^11.18.2",
      "lucide-react": "^0.468.0",
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "react-router-dom": "^6.30.6"
    },
    "devDependencies": {
      "@tailwindcss/vite": "^4.1.4",
      "@types/react": "^18.3.18",
      "@types/react-dom": "^18.3.5",
      "@vitejs/plugin-react": "^4.4.1",
      "tailwindcss": "^4.1.4",
      "typescript": "~5.7.3",
      "vite": "^6.3.2"
    }
  }
  ```

---

## 3. CẤU TRÚC MÃ NGUỒN & THÀNH PHẦN

### 3.1. Các Trang (Pages) & Routing
- Mẫu sử dụng `react-router-dom` v6 (`BrowserRouter`, `Routes`, `Route`, `useLocation`) với 4 routes chính:
  1. `/` $\rightarrow$ `HomePage.tsx`: Trang chủ với 10 phân đoạn nội dung phong phú.
  2. `/danh-muc/:slug` $\rightarrow$ `CategoryPage.tsx`: Trang danh mục sản phẩm (điện thoại, laptop, tivi...), hỗ trợ lọc đa tiêu chí (hãng, giá, ram, nhu cầu, sắp xếp).
  3. `/san-pham/:slug` $\rightarrow$ `ProductDetailPage.tsx`: Trang chi tiết sản phẩm với thư viện ảnh, chọn cấu hình/màu sắc, bảo hành, khuyến mãi combo, thông số kỹ thuật, đánh giá và hỏi đáp.
  4. `*` $\rightarrow$ `NotFoundPage.tsx`: Trang báo lỗi 404.
- **Định hướng chuyển đổi:** Loại bỏ hoàn toàn `react-router-dom` ở phía client. Mỗi route sẽ chuyển thành một **Page Template** trong Treecraft (`/root/templates/Project/Pages/...`), URL do CMS Dynamic Router quản lý, liên kết nội bộ sử dụng helper `link()` / `navItems()`.

### 3.2. Cấu trúc Component
Toàn bộ mã giao diện nằm trong `src/components/`, chia thành 7 thư mục chức năng:

1. **`layout/`:**
   - `TopBar.tsx`: Thanh thông báo trên cùng, dropdown chọn tỉnh thành (`provinces`).
   - `Header.tsx`: Logo thương hiệu, ô tìm kiếm, hotline tư vấn, cửa hàng gần nhất, nút yêu thích (wishlist badge), giỏ hàng (cart badge) và nút mở menu mobile.
   - `CategoryMenu.tsx`: Menu danh mục dạng popover/accordion.
   - `MobileMenu.tsx`: Drawer trượt từ cạnh bên hiển thị navigation trên thiết bị di động.
   - `CartDrawer.tsx`: Drawer giỏ hàng trượt ra khi bấm icon giỏ, quản lý số lượng, xóa sản phẩm, tính tổng tiền.
   - `FloatingButtons.tsx`: Nút gọi nhanh hotline, chat Zalo/Messenger, nút cuộn lên đầu trang (Back-to-top).
   - `Footer.tsx`: Chân trang hiển thị thông tin công ty, chứng nhận, phương thức thanh toán, liên kết mạng xã hội.

2. **`home/` (Các khối trang chủ):**
   - `Hero.tsx`: Carousel banner chính 23:10 tự động chạy (`AUTOPLAY_MS = 5000`), có tab danh mục theo dõi tiến trình (progress bar), hỗ trợ dừng khi rê chuột (`onMouseEnter`).
   - `PromoStrip.tsx`: Dải 4 huy hiệu cam kết bán hàng (chính hãng, đổi trả 30 ngày, bảo hành toàn quốc, giao hàng siêu tốc).
   - `FlashSale.tsx`: Khung flash sale nền đỏ gradient có đếm ngược (`Countdown`), 2 khung giờ lựa chọn (`slotsFromToday`), carousel sản phẩm giảm giá sốc.
   - `DealTabs.tsx`: Tab lựa chọn phân khúc hot (Apple, Samsung, Laptop AI, Phụ kiện...) chuyển tab bằng hiệu ứng framer-motion, hiển thị lưới sản phẩm tương ứng.
   - `CategorySection.tsx`: Component hiển thị một ngành hàng (điện thoại, laptop, đồng hồ, tivi, điện gia dụng) gồm banner quảng cáo bên trái + tab phụ + carousel sản phẩm bên phải.
   - `AccessoryGrid.tsx`: Lưới danh mục phụ kiện nhanh.
   - `Reviews.tsx`: Đánh giá của khách hàng tiêu biểu kèm avatar và số sao.
   - `Offers.tsx`: Khối banner ưu đãi đối tác (thẻ ngân hàng, ví điện tử).
   - `News.tsx`: 4 bài viết tin tức công nghệ mới nhất.

3. **`category/` (Khối trang danh mục):**
   - `FilterBar.tsx`: Thanh công cụ lọc trên đỉnh trang danh mục, tích hợp dropdown bộ lọc và sắp xếp giá/bán chạy.
   - `FacetDropdown.tsx`: Dropdown chọn đa tiêu chí (thương hiệu, tính năng, chip xử lý...).
   - `PriceFilter.tsx`: Thanh trượt dải giá kép (dual range slider) kết hợp các mốc giá nhanh.
   - `ActiveFilters.tsx`: Các tag bộ lọc đang kích hoạt kèm nút "Xóa tất cả".
   - `FilterDrawer.tsx`: Drawer bộ lọc đầy đủ dành cho màn hình di động.
   - `VoucherList.tsx`: Danh sách mã giảm giá độc quyền áp dụng cho danh mục.

4. **`detail/` (Khối trang chi tiết sản phẩm):**
   - `ProductGallery.tsx`: Trình xem ảnh sản phẩm chính kèm dải thumbnail cuộn ngang, popup phóng to.
   - `OptionPicker.tsx`: Chọn phiên bản bộ nhớ (128GB, 256GB...), màu sắc thiết bị; tự động cập nhật giá tương ứng.
   - `WarrantySelector.tsx`: Chọn gói bảo hành mở rộng (bảo hành 1 đổi 1, bảo hành rơi vỡ ngấm nước).
   - `BuyActions.tsx`: Nút "Mua ngay" và "Thêm vào giỏ hàng" kèm hiệu ứng thêm vào giỏ.
   - `StickyBottomBar.tsx`: Thanh mua hàng dính đáy màn hình trên di động khi cuộn qua cụm nút chính.
   - `CommitmentCards.tsx`: 4 thẻ cam kết dịch vụ (hàng mới nguyên seal, VAT, giao nhanh, trả góp).
   - `BundleDeals.tsx`: Khối mua kèm combo phụ kiện ưu đãi (củ sạc, ốp lưng, tai nghe).
   - `AccessoryUpsell.tsx`: Carousel gợi ý phụ kiện tương thích.
   - `CompareProducts.tsx`: Bảng so sánh nhanh cấu hình với sản phẩm cùng tầm giá.
   - `HighlightContent.tsx`: Bài viết giới thiệu đặc điểm nổi bật có nút "Xem thêm / Thu gọn".
   - `TechSpecs.tsx`: Bảng thông số kỹ thuật chi tiết kèm modal xem toàn bộ.
   - `ReviewSection.tsx`: Thống kê số sao, danh sách đánh giá của khách hàng, form gửi đánh giá mới.
   - `QnASection.tsx`: Khu vực hỏi đáp sản phẩm dạng accordion, form đặt câu hỏi.

5. **`product/` (Thành phần sản phẩm dùng chung):**
   - `ProductCard.tsx`: Thẻ hiển thị sản phẩm chuẩn với hình ảnh SVG vector, badge giảm giá, tên, giá bán, giá gạch, sao đánh giá, nút thêm vào yêu thích.
   - `ProductCarousel.tsx`: Thanh trượt sản phẩm ngang có nút điều hướng trái/phải và tính năng kéo lướt.
   - `DeviceImage.tsx`: Render đồ họa vector SVG procedurally (điện thoại, laptop, đồng hồ, tablet, TV, tủ lạnh) dựa trên tham số `kind` và mã màu `color`.
   - `Badge.tsx`: Huy hiệu nhãn khuyến mãi, trả góp 0%, độc quyền.
   - `QuickViewModal.tsx`: Modal xem nhanh sản phẩm mà không cần chuyển trang.
   - `CompareDrawer.tsx`: Thanh so sánh sản phẩm ghim cạnh dưới màn hình.

6. **`ui/` (Thư viện Primitives tương tác):**
   - `Banner.tsx`, `Carousel.tsx`, `Countdown.tsx`, `Drawer.tsx`, `Expandable.tsx`, `Reveal.tsx`, `Stars.tsx`, `Tabs.tsx`.

7. **`shared/`:**
   - `DeviceMockup.tsx`, `RichTextContent.tsx`.

### 3.3. Quản lý Trạng thái (Context & State)
- **`ShopContext.tsx`:** Lưu trữ và quản lý:
  - `cart`: Mảng sản phẩm trong giỏ hàng (`CartItem`), tự động lưu vào `localStorage` (key `maoshop.cart`).
  - `wishlist`: Tập hợp ID sản phẩm yêu thích (`Set<string>`), đồng bộ `localStorage` (key `maoshop.wishlist`).
  - `province`: Tỉnh thành đang chọn (key `maoshop.province`).
  - `toasts`: Danh sách thông báo dạng toast tự động biến mất sau 2.6 giây.
  - Các hành động: `addToCart`, `updateQuantity`, `removeFromCart`, `toggleWishlist`, `setCartOpen`, `notify`.
- **Đánh giá kiến trúc Island:** Các island React khi mount độc lập trên trang EJS sẽ cần truy cập chung dữ liệu giỏ hàng (ví dụ: nút bấm `BuyActions` trong thân trang cần tăng số lượng badge giỏ hàng trên `Header` và mở `CartDrawer`). Ta sẽ giải quyết bằng cơ chế **Shared Event Bus qua DOM CustomEvent** (`window.dispatchEvent(new CustomEvent('shop:cart-change'))`) kết hợp nạp chung `ShopProvider` hoặc module trạng thái đơn giản đọc `localStorage`.

### 3.4. Dữ liệu & Gọi API
- **Không có bất kỳ lệnh gọi API mạng (`fetch` hoặc `axios`) nào trong toàn bộ dự án.**
- 100% dữ liệu là dữ liệu tĩnh (static mock data) nằm trong thư mục `src/data/`:
  - `catalog.ts`: Danh mục phân cấp chi tiết.
  - `categories.ts`: Metadata ngành hàng, tiêu chí lọc.
  - `products.ts`: Danh sách hàng chục sản phẩm mẫu (iPhone 16 Pro Max, Galaxy S25 Ultra, MacBook Pro...).
  - `productDetails.ts`: Chi tiết cấu hình, biến thể màu sắc/dung lượng của từng dòng máy.
  - `feedback.ts`: Danh sách bình luận, review, Q&A mẫu.
  - `site.ts`: Danh sách slide Hero banner, thông tin hotline, chính sách.

---

## 4. GIAO DIỆN, CSS, FONT & TÀI NGUYÊN TĨNH

- **Hệ thống CSS:** Mẫu sử dụng **Tailwind CSS v4** với cấu hình `@theme` định nghĩa trực tiếp trong `src/index.css` (bảng màu đỏ chủ đạo `#d70018`, token shadow, keyframe animations `shimmer`, `float`).
- **Font chữ:** Sử dụng font `Inter`, đã được Treecraft nạp sẵn trong `site/views/partials/head.ejs` qua Google Fonts CDN.
- **Icon:** Sử dụng thư viện **`lucide-react`** (~0.468.0). Toàn bộ icon là SVG component nội suy trong bundle JavaScript.
- **Hình ảnh sản phẩm:** **100% vector SVG nội suy qua component `DeviceImage.tsx`**, không cần ảnh chụp sản phẩm bên ngoài, không lo bản quyền hình ảnh!
- **Tài nguyên ảnh lớn trong repo mẫu:**
  - `UI.png` (7.37 MB), `UI_Category_Page.jpg` (943 KB), `UI_Detail_Product.jpg` (976 KB) chỉ là ảnh chụp màn hình thiết kế để Claude tham chiếu, **tuyệt đối không copy vào dự án site**.

---

## 5. RÀ SOÁT RỦI RO & BẢN QUYỀN (LEGAL / SECURITY AUDIT)

| Tiêu chí | Kết quả khảo sát | Biện pháp xử lý |
| :--- | :--- | :--- |
| **Biến môi trường / Khóa API / URL nội bộ** | Không phát hiện bất kỳ file `.env` hay URL nội bộ/khóa bí mật nào trong mã nguồn mẫu. | Hoàn toàn an toàn. |
| **Giấy phép thư viện mã nguồn** | Toàn bộ dependencies (`react`, `react-dom`, `framer-motion`, `lucide-react`, `tailwindcss`, `vite`) đều mang giấy phép mã nguồn mở chuẩn (MIT / ISC / Apache-2.0). | Đủ điều kiện sử dụng thương mại và tích hợp vào dự án. |
| **Bản quyền hình ảnh / Font** | Không có ảnh tải từ bên ngoài có bản quyền. Sản phẩm vẽ bằng SVG thuần. Font Inter là mã nguồn mở (OFL). | Không có rủi ro bản quyền tài nguyên. |
| **Thư mục cấm sao chép** | `node_modules/`, `.git/`, `.claude/`, `dist/`, các ảnh chụp thiết kế `UI*.png/jpg`. | Loại trừ nghiêm ngặt trong kịch bản copy. Chỉ đưa thư mục `src/` cần thiết vào `site/react/`. |
| **Tương thích SSR / Next.js** | Mẫu là Vite SPA thuần túy, không có SSR. | Hoàn toàn tương thích với kiến trúc React Island của Treecraft. |

---

## 6. BẢNG PHÂN LOẠI THÀNH PHẦN (REACT $\rightarrow$ EJS / REACT ISLAND)

Nguyên tắc chuyển đổi:
- **Thành phần tĩnh/trình bày thuần:** Chuyển sang **EJS partial/component** để máy chủ render trực tiếp ra HTML, tối ưu SEO, không tốn chi phí bundle JS và nạp trang tức thì khi tắt JavaScript.
- **Thành phần tương tác cao:** Giữ nguyên mã nguồn **React Island**, đóng gói vào bundle JS và mount tự động vào các vùng `[data-react="..."]` thông qua `data-props`.

| Thành phần React mẫu | Cách chuyển đổi | Template CMS / File tương ứng | Rủi ro & Cách khắc phục |
| :--- | :--- | :--- | :--- |
| **TopBar** | Chuyển sang EJS thuần (hoặc Island nhỏ cho dropdown tỉnh thành) | `site/views/partials/topbar.ejs` | Dropdown đổi tỉnh thành: có thể dùng EJS + HTML `<select>` hoặc mount island nhỏ. Đề xuất: EJS thuần với select đơn giản. |
| **Header (Logo, Tìm kiếm, Hotline)** | EJS render khung chính, island React mount cụm actions (Wishlist counter + Cart badge + Mobile trigger) | `site/views/partials/header.ejs` + wrapper `HeaderActions` | Đồng bộ số lượng giỏ hàng giữa các island: xử lý qua DOM CustomEvent. |
| **MobileMenu & CartDrawer** | Giữ React Island (mount ở cuối body) | `site/views/partials/cart-drawer.ejs` (wrapper `CartDrawerIsland`) | Drawer cần overlay toàn màn hình: mount ra ngoài container, lắng nghe toggle event từ Header. |
| **Footer** | Chuyển sang EJS thuần | `site/views/partials/footer.ejs` | Không có rủi ro. |
| **Hero Carousel** | Giữ React Island (Auto-slide, pause on hover, tabs progress) | Rendering: `HeroCarousel` $\rightarrow$ `views/components/HeroCarousel.ejs` | Dữ liệu slides cần truyền qua `data-props`. Cần nội dung HTML dự phòng (slide đầu tiên) cho SEO/No-JS. |
| **PromoStrip** | Chuyển sang EJS thuần | Rendering: `PromoStrip` $\rightarrow$ `views/components/PromoStrip.ejs` | Không có rủi ro. |
| **FlashSale** | Giữ React Island (Countdown timer, chuyển slots, carousel sản phẩm) | Rendering: `FlashSale` $\rightarrow$ `views/components/FlashSale.ejs` | Timer chạy ở client; EJS render sẵn danh sách sản phẩm slot 1 dạng tĩnh để crawl được nội dung khi tắt JS. |
| **DealTabs** | Giữ React Island (Chuyển tab hiệu ứng framer-motion, grid sản phẩm) | Rendering: `DealTabs` $\rightarrow$ `views/components/DealTabs.ejs` | Tab đầu tiên render dự phòng trong HTML SSR. |
| **CategorySection (Phone, Laptop, etc.)** | Giữ React Island (Carousel sản phẩm, filter tabs) | Rendering: `CategorySection` $\rightarrow$ `views/components/CategorySection.ejs` | **Hạn chế danh sách lặp:** Xem mục 7 bên dưới. |
| **AccessoryGrid** | Chuyển sang EJS thuần | Rendering: `AccessoryGrid` $\rightarrow$ `views/components/AccessoryGrid.ejs` | Lưới tĩnh gồm icon và liên kết danh mục. |
| **Reviews & Offers & News** | Chuyển sang EJS thuần (Cards bài viết / đánh giá) | Rendering: `Reviews`, `Offers`, `News` | Không cần JS; EJS kết xuất HTML ngữ nghĩa chuẩn SEO. |
| **CategoryPage: FilterBar, FacetDropdown, PriceFilter, ActiveFilters** | Giữ React Island (Bộ lọc đa diện, tương tác tức thì) | Rendering: `CategoryFilters` $\rightarrow$ `views/components/CategoryFilters.ejs` | Lọc client-side kết hợp query URL params. |
| **ProductDetailPage: Gallery, OptionPicker, BuyActions, Warranty, StickyBottomBar** | Giữ React Island (Chuyển ảnh thumbnail, đổi màu/bộ nhớ cập nhật giá, thêm vào giỏ hàng) | Rendering: `ProductDetailInteractive` $\rightarrow$ `views/components/ProductDetailInteractive.ejs` | Dữ liệu chi tiết sản phẩm và các biến thể nạp qua `data-props`. SEO: EJS render sẵn tiêu đề, giá gốc và mô tả text trong HTML. |
| **TechSpecs & HighlightContent** | Chuyển sang EJS (Nội dung bài viết & bảng thông số) | Rendering: `TechSpecs`, `HighlightContent` | Toggle xem thêm có thể viết inline JS 5 dòng hoặc thẻ `<details>` thuần HTML5. |
| **FloatingButtons** | Giữ React Island (hoặc EJS + CSS fixed) | `views/partials/floating-buttons.ejs` | Có thể dùng HTML/CSS fixed thuần; phần toast thông báo kết nối với ShopContext. |

---

## 7. HẠN CHẾ VỀ DANH SÁCH LẶP (REPEATED LISTS) & YÊU CẦU CHO CORE

### Hạn chế hiện tại của Treecraft:
Trong Treecraft CMS hiện tại, các Component Rendering đọc trường dữ liệu (Effective Fields) từ chính **Page Item** đang được duyệt thông qua cơ chế kế thừa Standard Values và Component Template (`resolveEffectiveTemplate`). Hệ thống **chưa hỗ trợ sẵn Datasource Item độc lập** hay trường kiểu **Treelist / Multi-Item Reference** để một Component trên trang có thể liên kết động tới danh sách hàng chục item con nằm rải rác ở nhánh khác (ví dụ: gán 10 sản phẩm cụ thể vào một Carousel).

### Phương án xử lý khả thi cho Giai đoạn R-SITE:
1. **Phương án A (Khuyến nghị cho GĐ này):** Các component danh sách lặp (như sản phẩm Flash Sale, Banner Slides, Deal Tabs) lưu dữ liệu cấu hình hoặc danh sách ID/JSON mẫu dưới dạng trường `Multi-Line Text` (JSON) hoặc sử dụng file mock catalog chuẩn đặt trong `site/react/data/` làm nguồn mặc định; các trường tiêu đề, banner, thời gian đếm ngược được quản lý trực tiếp qua trường CMS của Component Template.
2. **Phương án B:** Chờ Core phát triển tính năng Datasource / Treelist Reference.

### Yêu cầu cho Core (Đề xuất tính năng bổ sung trong tương lai):
1. **Hỗ trợ trường Datasource trên Rendering Reference:** Cho phép tác giả nội dung trong Content Editor (tab Presentation Details) chọn một thư mục con làm nguồn cấp dữ liệu cho Rendering thay vì chỉ đọc từ trang hiện tại.
2. **Field Type `Treelist` / `ItemPickerMulti`:** Cho phép chọn danh sách nhiều Items (sản phẩm, tin tức) và lưu trữ mảng ID trong trường dữ liệu của Item.
3. **Cung cấp helper `dataProps()` an toàn trong View Helper:** Hàm tiện ích tự động JSON stringify, escape HTML và sanitize các trường dữ liệu trước khi in ra thuộc tính `data-props="..."`.

---

## 8. ĐỀ XUẤT DANH SÁCH DEPENDENCIES CẦN THÊM VÀO `package.json` DỰ ÁN

Để phục vụ build React Island, ta cần bổ sung các package sau vào `package.json` của dự án (`d:\Project\Personal\Mao Phone\package.json`), **tuyệt đối không đụng vào `core/package.json`**:

### Dependencies chạy production (cho frontend bundle):
- `"react"`: `"^18.3.1"`
- `"react-dom"`: `"^18.3.1"`
- `"framer-motion"`: `"^11.18.2"`
- `"lucide-react"`: `"^0.468.0"`

*(Lưu ý: Không cần `react-router-dom` vì đã chuyển sang routing của CMS).*

### DevDependencies (cho toolchain build Vite):
- `"vite"`: `"^6.3.2"`
- `"@vitejs/plugin-react"`: `"^4.4.1"`
- `"@types/react"`: `"^18.3.18"`
- `"@types/react-dom"`: `"^18.3.5"`
- `"typescript"`: `"~5.7.3"`
- `"tailwindcss"`: `"^4.1.4"`
- `"@tailwindcss/vite"`: `"^4.1.4"`

*(Các dependencies này sẽ được cài đặt chuẩn thông qua npm sau khi người dùng phê duyệt).*
