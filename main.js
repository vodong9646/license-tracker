const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require("path");
const fs = require("fs");

// Đường dẫn để lưu file data.json.
// - Trong development: lưu tại thư mục project (__dirname)
// - Khi packaged (.exe): lưu tại thư mục chứa file exe
const dataPath = path.join(
  app.isPackaged ? path.dirname(app.getPath("exe")) : __dirname,
  "data.json"
);

// --- Quản lý Cửa sổ ---
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // contextIsolation: true, (mặc định là true)
      // nodeIntegration: false, (mặc định là false)
    },
  });

  mainWindow.loadFile("index.html");

  // Mở DevTools (có thể xóa khi deploy)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Bắt đầu vòng lặp kiểm tra hạn
  // Kiểm tra mỗi 1 giờ. Bạn có thể đặt 60 * 1000 (1 phút) để test.
  setInterval(checkExpirations, 60 * 1000);
  // Chạy kiểm tra ngay khi khởi động
  checkExpirations();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// --- Quản lý Dữ liệu ---

function readData() {
  try {
    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath);
      return JSON.parse(rawData);
    }
    return []; // Trả về mảng rỗng nếu file chưa tồn tại
  } catch (error) {
    console.error("Error when reading data file data.json:", error);
    return [];
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error when writing data file data.json:", error);
  }
}

// --- Xử lý IPC (Giao tiếp giữa Main và Renderer) ---

// Tải danh sách subscriptions
ipcMain.handle("get-subs", () => {
  return readData();
});

// Thêm subscription mới
ipcMain.handle("add-sub", (event, sub) => {
  const subs = readData();
  const newSub = {
    id: Date.now().toString(),
    ...sub,
    notified: { d10: false, d1: false, d0: false }, // Trạng thái thông báo
  };
  subs.push(newSub);
  writeData(subs);
  return subs; // Trả về danh sách đã cập nhật
});

// Xóa subscription
ipcMain.handle("delete-sub", (event, id) => {
  let subs = readData();
  subs = subs.filter((sub) => sub.id !== id);
  writeData(subs);
  return subs; // Trả về danh sách đã cập nhật
});

// --- Logic Thông báo ---

function getDaysRemaining(expiryStr) {
  const expiry = new Date(expiryStr);
  const today = new Date();

  // Chuẩn hóa về 00:00:00 để so sánh ngày
  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function showNotification(title, body) {
  new Notification({ title, body }).show();
}

function checkExpirations() {
  console.log("Check expirations app...");
  const subs = readData();
  let dataChanged = false; // Cờ theo dõi xem có cần ghi lại file không

  subs.forEach((sub) => {
    const daysLeft = getDaysRemaining(sub.expiryDate);

    // 1. Thông báo 10 ngày
    // if (daysLeft <= 10 && !sub.notified.d10) {
    //   showNotification(
    //     `Sắp hết hạn: ${sub.name}`,
    //     `Bản quyền sẽ hết hạn trong ${daysLeft} ngày (vào ngày ${sub.expiryDate}).`
    //   );
    //   sub.notified.d10 = true;
    //   dataChanged = true;
    // }

    // 2. Thông báo 1 ngày
    if (daysLeft <= 1 && !sub.notified.d1) {
      showNotification(`Sắp hết hạn: ${sub.name}`, `Bản quyền sẽ hết hạn vào NGÀY MAI (${sub.expiryDate}).`);
      sub.notified.d1 = true;
      dataChanged = true;
    }

    // 3. Thông báo đúng hạn
    if (daysLeft <= 0 && !sub.notified.d0) {
      showNotification(`HẾT HẠN: ${sub.name}`, `Bản quyền đã hết hạn vào hôm nay (${sub.expiryDate}).`);
      sub.notified.d0 = true;
      dataChanged = true;
    }
  });

  // Nếu có bất kỳ thay đổi nào (đã gửi tb), lưu lại trạng thái
  if (dataChanged) {
    console.log("Updated notification statuses.");
    writeData(subs);
  }
}
