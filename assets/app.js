const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzA9pN_sizNjxFMbUzRSGKJ0Z6Upw9T8xuRGu1UL-PPew5yYrN0BUKtdFkRfny0AFkKng/exec";

function genTicket(prefix){const d=new Date();const y=String(d.getFullYear()).slice(-2);const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');const rnd=Math.floor(1000+Math.random()*9000);return `${prefix}${y}${m}${day}-${rnd}`;}
function validPhone(p){return /^(0|\+84)[0-9]{8,10}$/.test((p||'').replace(/\s|\./g,''));}
function wireForm(form, okId, errId, label){
  if(!form)return;const ok=document.getElementById(okId),err=document.getElementById(errId);
  form.addEventListener('submit',e=>{
    const t=form.querySelector('input[name="ticketId"]');const s=form.querySelector('input[name="submittedAt"]');
    if(t) t.value=genTicket('KLC'); if(s) s.value=new Date().toISOString();
    const phone=form.querySelector('input[name="phone"]');
    if(phone && !validPhone(phone.value)){e.preventDefault(); if(ok)ok.style.display='none'; if(err){err.textContent='Số điện thoại không hợp lệ. Vui lòng nhập 0xxxxxxxxx hoặc +84...'; err.style.display='block';} return;}
    if(ok){const code=t?t.value:'(chưa có mã)'; ok.textContent=`${label} đã được ghi nhận. Mã tra cứu: ${code}. Chúng tôi sẽ liên hệ trong 15–30 phút (8:00–21:00).`; ok.style.display='block';}
    if(err) err.style.display='none';
    setTimeout(()=>form.reset(),300);
  });
}
function lookupStatus(ticketId){
  const out=document.getElementById('lookup-result'),load=document.getElementById('lookup-loading');
  out.innerHTML=''; load.classList.remove('hidden');
  fetch(`${APPS_SCRIPT_URL}?action=status&ticketId=${encodeURIComponent(ticketId)}`)
    .then(r=>r.json()).then(data=>{load.classList.add('hidden'); out.innerHTML=`
      <div class="card p-4">
        <div class="text-sm text-gray-600">Mã tra cứu</div>
        <div class="font-semibold text-lg">${ticketId}</div>
        <div class="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
          <div><span class="text-gray-500">Trạng thái:</span> <span class="font-medium">${data.status||'Đang tiếp nhận'}</span></div>
          <div><span class="text-gray-500">Cập nhật:</span> <span class="font-medium">${data.lastUpdate||'-'}</span></div>
          <div class="sm:col-span-2"><span class="text-gray-500">Ghi chú:</span> <span class="font-medium">${data.note||'—'}</span></div>
          <div class="sm:col-span-2"><span class="text-gray-500">Kỹ thuật phụ trách:</span> <span class="font-medium">${data.assignee||'—'}</span></div>
        </div>
      </div>`;})
    .catch(()=>{load.classList.add('hidden'); out.innerHTML=`
      <div class="card p-4 border-red-200">
        <div class="text-red-700 font-medium">Chưa lấy được dữ liệu.</div>
        <div class="text-sm text-gray-600 mt-1">Gọi 0886.99.22.11 hoặc chat Zalo để tra cứu nhanh. (Cần bật CORS & JSON ở Apps Script).</div>
      </div>`;});
}
window.addEventListener('DOMContentLoaded',()=>{ if(window.lucide) lucide.createIcons(); });
