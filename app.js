
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzA9pN_sizNjxFMbUzRSGKJ0Z6Upw9T8xuRGu1UL-PPew5yYrN0BUKtdFkRfny0AFkKng/exec";

function genTicket(prefix) {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  const rnd = Math.floor(1000 + Math.random()*9000);
  return `${prefix}${y}${m}${day}-${rnd}`;
}

function validPhone(p) {
  return /^(0|\+84)[0-9]{8,10}$/.test((p||'').replace(/\s|\./g,''));
}

function wireForm(form, successBoxId, errorBoxId, label) {
  if (!form) return;
  const successBox = document.getElementById(successBoxId);
  const errorBox = document.getElementById(errorBoxId);
  form.addEventListener('submit', function(e) {
    const ticketInput = form.querySelector('input[name="ticketId"]');
    const submittedAt = form.querySelector('input[name="submittedAt"]');
    if (ticketInput) ticketInput.value = genTicket('KLC');
    if (submittedAt) submittedAt.value = new Date().toISOString();

    const phoneEl = form.querySelector('input[name="phone"]');
    if (phoneEl && !validPhone(phoneEl.value)) {
      e.preventDefault();
      if (successBox) successBox.style.display = 'none';
      if (errorBox) {
        errorBox.textContent = 'Số điện thoại không hợp lệ. Vui lòng nhập dạng 0xxxxxxxxx hoặc +84...';
        errorBox.style.display = 'block';
      }
      return;
    }

    if (successBox) {
      const code = ticketInput ? ticketInput.value : '(chưa có mã)';
      successBox.textContent = `${label} đã được ghi nhận. Mã tra cứu: ${code}. Chúng tôi sẽ liên hệ trong 15–30 phút (8:00–21:00).`;
      successBox.style.display = 'block';
    }
    if (errorBox) errorBox.style.display = 'none';

    setTimeout(() => form.reset(), 300);
  });
}

function lookupStatus(ticketId) {
  const resultEl = document.getElementById('lookup-result');
  const loadingEl = document.getElementById('lookup-loading');
  resultEl.innerHTML = '';
  loadingEl.classList.remove('hidden');
  fetch(`${APPS_SCRIPT_URL}?action=status&ticketId=${encodeURIComponent(ticketId)}`)
    .then(r => r.json())
    .then(data => {
      loadingEl.classList.add('hidden');
      resultEl.innerHTML = `
        <div class="card p-4">
          <div class="text-sm text-gray-600">Mã tra cứu</div>
          <div class="font-semibold text-lg">${ticketId}</div>
          <div class="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
            <div><span class="text-gray-500">Trạng thái:</span> <span class="font-medium">${data.status || 'Đang tiếp nhận'}</span></div>
            <div><span class="text-gray-500">Cập nhật:</span> <span class="font-medium">${data.lastUpdate || '-'}</span></div>
            <div class="sm:col-span-2"><span class="text-gray-500">Ghi chú:</span> <span class="font-medium">${data.note || '—'}</span></div>
            <div class="sm:col-span-2"><span class="text-gray-500">Kỹ thuật phụ trách:</span> <span class="font-medium">${data.assignee || '—'} </span></div>
          </div>
        </div>`;
    })
    .catch(err => {
      loadingEl.classList.add('hidden');
      resultEl.innerHTML = `<div class="card p-4 border-red-200">
        <div class="text-red-700 font-medium">Chưa lấy được dữ liệu.</div>
        <div class="text-sm text-gray-600 mt-1">Vui lòng gọi hotline 0886.99.22.11 hoặc chat Zalo để tra cứu nhanh. (Cần bật CORS & JSON ở Apps Script).</div>
      </div>`;
    });
}

window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});
