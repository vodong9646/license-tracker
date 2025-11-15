# Trình Theo Dõi Bản Quyền (License Tracker)

Đây là một ứng dụng desktop đơn giản được xây dựng bằng Electron để theo dõi ngày hết hạn của các giấy phép phần mềm. Ứng dụng sẽ tự động gửi thông báo hệ thống khi một giấy phép sắp hết hạn (còn 10 ngày, 1 ngày và vào ngày hết hạn).

## 1. Cấu trúc Thư mục

Dự án này bao gồm 6 tệp cốt lõi:

```markdown
license-tracker/
├── 📄 package.json (Định nghĩa dự án và các gói phụ thuộc)
├── 📄 main.js (Logic chính - Main Process của Electron)
├── 📄 preload.js (Cầu nối an toàn giữa main và renderer)
├── 📄 index.html (Giao diện người dùng - UI)
├── 📄 style.css (Tệp CSS tạo kiểu cho giao diện)
└── 📄 renderer.js (Logic của giao diện người dùng)
```

## 2. Giải thích Chức năng các Tệp

### `package.json`

- Tác dụng: Giống như "chứng minh nhân dân" của dự án.

- Chi tiết: Nó định nghĩa tên dự án, phiên bản, và quan trọng nhất là các gói phụ thuộc (như electron) và các "scripts" (như npm start) để chạy ứng dụng.

### `main.js` (Main Process)

- Tác dụng: Đây là "bộ não" của ứng dụng. Nó chạy ở nền.

- Chi tiết:

  - Tạo cửa sổ trình duyệt (BrowserWindow) để hiển thị index.html.
  - Lắng nghe các yêu cầu từ giao diện (thông qua ipcMain) để Thêm/Xóa/Tải dữ liệu.
  - Đọc và ghi dữ liệu từ tệp data.json (được lưu trong thư mục dữ liệu người dùng của hệ điều hành).
  - Chạy một vòng lặp setInterval (hiện tại là mỗi 1 giờ) để gọi hàm checkExpirations.
  - Gửi thông báo hệ thống (Notification) khi phát hiện giấy phép sắp hết hạn.

### `preload.js`

- Tác dụng: Đây là "cầu nối" an toàn.

- Chi tiết: Do main.js (nền) và renderer.js (giao diện) chạy ở các tiến trình khác nhau, preload.js sử dụng contextBridge để "phơi bày" một cách an toàn các hàm của main.js (như getSubs, addSub) cho renderer.js sử dụng thông qua đối tượng window.electronAPI.

### `index.html` (Renderer Process)

- Tác dụng: Cấu trúc HTML của giao diện người dùng.

- Chi tiết: Nó định nghĩa các thành phần bạn thấy: nút "Thêm bản quyền mới", phần Lịch (Calendar), và khu vực "Danh sách bản quyền". Nó cũng chứa cấu trúc HTML cho cửa sổ "Modal" (popup) để thêm mới.

### `style.css` (Renderer Process)

- Tác dụng: Làm đẹp cho index.html.

- Chi tiết: Chứa toàn bộ mã CSS để tạo kiểu cho các nút, thẻ (card), lịch, modal, và hiệu ứng hover.

### `renderer.js` (Renderer Process)

- Tác dụng: Logic điều khiển giao diện người dùng.

- Chi tiết:

  - Xử lý sự kiện click vào nút "Thêm bản quyền mới" để hiển thị modal.

  - Xử lý sự kiện click nút "Đóng" modal.

  - Xử lý sự kiện submit form để lấy dữ liệu (tên, ngày, email, note) và gửi nó đến main.js (thông qua window.electronAPI.addSub).

  - Xử lý sự kiện click nút "Xóa".

  - Vẽ (render) Lịch và Danh sách bản quyền ra màn hình dựa trên dữ liệu nhận được.

## 3. Cách Chạy Ứng Dụng (Chế độ Phát triển)

### 1. Mở terminal (hoặc Command Prompt) và di chuyển đến thư mục dự án này.

### 2. Chạy lệnh sau để cài đặt Electron (chỉ cần làm lần đầu tiên):

```markdown
npm install
```

### 3. Sau khi cài đặt xong, chạy lệnh sau để khởi động ứng dụng:

```markdown
npm start
```

### 4. Điểm Lưu Ý

- Lưu trữ Dữ liệu: Dữ liệu của bạn (các bản quyền) được lưu trong một tệp data.json. Tệp này không nằm cùng thư mục dự án. Nó được lưu tại thư mục dữ liệu người dùng của hệ điều hành (ví dụ: `C:\Users\<TênBạn>\AppData\Roaming\license-tracker` trên Windows). Điều này đảm bảo dữ liệu không bị mất ngay cả khi bạn đóng gói hoặc di chuyển ứng dụng.

- Thời gian Kiểm tra: Trong `main.js`, hàm `checkExpirations` được đặt để chạy 1 giờ một lần `(60 * 60 * 1000)`. Nếu bạn muốn kiểm tra thường xuyên hơn (ví dụ: mỗi 1 phút để thử nghiệm), bạn có thể đổi thành `60 * 1000`.

### 5. Cách Đóng Gói Ứng Dụng (Tạo file .exe)

Cách tiêu chuẩn và được khuyên dùng hiện nay là sử dụng Electron Forge.

- Bước 1: Thêm Electron Forge vào dự án

  - Chạy lệnh sau trong terminal tại thư mục dự án của bạn. Lệnh này sẽ cài đặt các công cụ cần thiết của Forge:

    ```markdown
    npm install --save-dev @electron-forge/cli
    ```

- Bước 2: Import dự án vào Forge

  - Vì dự án của chúng ta đã tồn tại, chúng ta cần "import" nó để Forge cấu hình tự động. Chạy lệnh:

    ```markdown
    npx electron-forge import
    ```

    (Lệnh này có thể sẽ hỏi bạn vài câu hỏi, thường bạn chỉ cần nhấn Enter. Nó cũng sẽ tự động chỉnh sửa package.json để thêm các scripts mới.)

- Bước 3: Tạo file .exe

  Bây giờ, bạn chỉ cần chạy lệnh "make" (được Forge thêm vào package.json):

  ```markdown
  npm run make
  ```

  Electron Forge sẽ tự động thực hiện các việc sau:

  1. Đóng gói mã nguồn của bạn.

  2. Tạo ra một bộ cài đặt .exe hoàn chỉnh (thường là một trình cài đặt Setup.exe).

- Bước 4: Tìm tệp đã đóng gói

  Sau khi chạy xong, bạn sẽ thấy một thư mục mới tên là out. Bên trong thư mục out/make, bạn sẽ tìm thấy tệp cài đặt (ví dụ: out/make/squirrel.windows/x64/license-tracker-1.0.0 Setup.exe).

  Bạn có thể gửi tệp "Setup" này cho người khác hoặc sử dụng nó để cài đặt ứng dụng lên máy của mình.
