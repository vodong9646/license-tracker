const subsListEl = document.getElementById("subs-list");
const addForm = document.getElementById("add-form");
const nameInput = document.getElementById("name");
const expiryDateInput = document.getElementById("expiry-date");
const emailInput = document.getElementById("email");
const noteInput = document.getElementById("note");

// Modal elements
const showAddModalBtn = document.getElementById("show-add-modal-btn");
const addModalOverlay = document.getElementById("add-modal-overlay");
const closeModalBtn = document.getElementById("close-modal-btn");

// Calendar elements
const calendarDaysEl = document.getElementById("calendar-days");
const monthYearHeaderEl = document.getElementById("month-year-header");
const prevMonthBtn = document.getElementById("prev-month-btn");
const nextMonthBtn = document.getElementById("next-month-btn");

let subscriptions = [];
let calendarDate = new Date(); // Ngày để hiển thị lịch

// --- Modal Logic ---
showAddModalBtn.addEventListener("click", () => {
  addModalOverlay.classList.add("modal-visible");
});

function hideModal() {
  addModalOverlay.classList.remove("modal-visible");
}

closeModalBtn.addEventListener("click", hideModal);

addModalOverlay.addEventListener("click", (e) => {
  // Chỉ đóng nếu click vào nền overlay (e.target),
  if (e.target === addModalOverlay) {
    hideModal();
  }
});
// --- (End Modal Logic) ---

// Hàm tính số ngày còn lại (giống hệt hàm bên main.js)
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

// Hàm render danh sách
function renderSubscriptions() {
  subsListEl.innerHTML = ""; // Xóa list cũ

  if (subscriptions.length === 0) {
    subsListEl.innerHTML = '<p class="card">Chưa có bản quyền nào.</p>';
    return;
  }

  // Sắp xếp: Hạn gần nhất lên đầu
  const sortedSubs = [...subscriptions].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  sortedSubs.forEach((sub) => {
    const itemEl = document.createElement("div");
    itemEl.classList.add("sub-item");

    const daysLeft = getDaysRemaining(sub.expiryDate);
    let daysText = "";

    // Thêm class CSS dựa trên trạng thái
    if (daysLeft <= 0) {
      itemEl.classList.add("expired");
      daysText = "ĐÃ HẾT HẠN";
    } else if (daysLeft <= 10) {
      itemEl.classList.add("soon");
      daysText = `Còn ${daysLeft} ngày`;
    } else {
      daysText = `Còn ${daysLeft} ngày`;
    }

    // Thêm email và note vào HTML
    const emailHtml = sub.email ? `<div class="sub-detail">Email: ${sub.email}</div>` : "";
    // Thay thế ký tự xuống dòng bằng thẻ <br> để hiển thị
    const noteHtml = sub.note ? `<div class="sub-detail note">${sub.note.replace(/\n/g, "<br>")}</div>` : "";

    itemEl.innerHTML = `
      <div class="info">
        <div class="name">Ứng dụng: ${sub.name}</div>
        <div class="expiry">Hết hạn: ${sub.expiryDate}</div>
        ${emailHtml}
        ${noteHtml}
      </div>
      <div class="days-left">${daysText}</div>
      <button class="delete-btn" data-id="${sub.id}">Xóa</button>
    `;

    subsListEl.appendChild(itemEl);
  });
}

// --- Calendar Logic ---

function renderCalendar(date) {
  calendarDaysEl.innerHTML = "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const month = date.getMonth();
  const year = date.getFullYear();

  // Đặt tên tháng bằng Tiếng Việt
  monthYearHeaderEl.textContent = `Tháng ${month + 1} năm ${year}`;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const lastDayDate = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Lấy danh sách hết hạn trong tháng này
  const expirationsThisMonth = subscriptions.filter((sub) => {
    const expiry = new Date(sub.expiryDate);
    return expiry.getMonth() === month && expiry.getFullYear() === year;
  });

  // 1. Tạo các ô trống cho đầu tháng
  for (let i = 0; i < startDayOfWeek; i++) {
    const emptyEl = document.createElement("div");
    emptyEl.classList.add("calendar-day-empty");
    calendarDaysEl.appendChild(emptyEl);
  }

  // 2. Tạo các ô ngày
  for (let day = 1; day <= lastDayDate; day++) {
    const dayEl = document.createElement("div");
    dayEl.classList.add("calendar-day");
    dayEl.textContent = day;

    const currentDayDate = new Date(year, month, day);

    // Kiểm tra ngày hiện tại
    if (currentDayDate.getTime() === today.getTime()) {
      dayEl.classList.add("current-day");
    }

    // Kiểm tra ngày hết hạn
    const expirationsOnThisDay = expirationsThisMonth.filter((sub) => {
      // Đảm bảo so sánh ngày chính xác (bỏ qua giờ)
      const expiryDay = new Date(sub.expiryDate);
      expiryDay.setHours(0, 0, 0, 0);
      return expiryDay.getTime() === currentDayDate.getTime();
    });

    if (expirationsOnThisDay.length > 0) {
      dayEl.classList.add("expiry-day");

      // Tạo tooltip để hiển thị tên app
      const tooltip = document.createElement("div");
      tooltip.classList.add("calendar-tooltip");
      tooltip.innerHTML = expirationsOnThisDay.map((sub) => `<span>+ ${sub.name}</span>`).join("");
      dayEl.appendChild(tooltip);
    }

    calendarDaysEl.appendChild(dayEl);
  }
}

prevMonthBtn.addEventListener("click", () => {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar(calendarDate);
});

nextMonthBtn.addEventListener("click", () => {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar(calendarDate);
});

// --- (End Calendar Logic) ---

// Xử lý sự kiện Xóa
subsListEl.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    // Gọi API từ preload để xóa
    subscriptions = await window.electronAPI.deleteSub(id);
    renderSubscriptions();
    renderCalendar(calendarDate); // Cập nhật lịch
  }
});

// Xử lý sự kiện Thêm
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value;
  const expiryDate = expiryDateInput.value;
  const email = emailInput.value;
  const note = noteInput.value;

  if (!name || !expiryDate) return;

  const newSub = { name, expiryDate, email, note }; // Thêm email và note

  // Gọi API từ preload để thêm
  subscriptions = await window.electronAPI.addSub(newSub);

  // Render lại và reset form
  renderSubscriptions();
  renderCalendar(calendarDate); // Cập nhật lịch
  nameInput.value = "";
  expiryDateInput.value = "";
  emailInput.value = "";
  noteInput.value = "";

  hideModal(); // Đóng modal sau khi thêm thành công
});

// Tải dữ liệu ban đầu khi mở app
async function loadInitialData() {
  subscriptions = await window.electronAPI.getSubs();
  renderSubscriptions();
  renderCalendar(calendarDate); // Vẽ lịch sau khi có data
}

loadInitialData();
