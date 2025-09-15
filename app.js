
/* =========================== KLC Bến Lức – Frontend JS =========================== */

/** CONFIG – cập nhật 2 dòng dưới cho đúng env của bạn */
const GOOGLE_CLIENT_ID = "229964671691-jvq8pstlajqa9v6g0rhfi0u8ei39453u.apps.googleusercontent.com";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx9MFNR0qc3udfgcG26_T0rtnHZYePBhyRn3iEM06GDYqp4VQanJkq8rRdBPzV_3Hsn/exec";

/** MOCK (để test UI nếu backend chưa sẵn) */
const USE_MOCK = false;

/** Abort controllers theo module */
const controllers = {};

/** TZ */
const TZ = "Asia/Ho_Chi_Minh";

/** Cache 8 phút */
const CACHE_TTL_MS = 8 * 60 * 1000;

/** Debounce */
const DEBOUNCE_MS = 500;

let ID_TOKEN = "";
let ME = null;

/* ===== Memory cache + localStorage ===== */
const memCache = new Map();
function setCache(key, payload){ memCache.set(key, {t:Date.now(), data:payload}); try{ localStorage.setItem(key, JSON.stringify({t:Date.now(), data:payload})); }catch(_){ } }
function getCache(key){
  const inMem = memCache.get(key);
  if (inMem && Date.now() - inMem.t < CACHE_TTL_MS) return inMem.data;
  try{
    const raw = localStorage.getItem(key); if(!raw) return null;
    const v = JSON.parse(raw);
    if (Date.now() - v.t < CACHE_TTL_MS) { memCache.set(key, v); return v.data; }
  }catch(_){}
  return null;
}

/* ===== TIME & RANGE HELPERS ===== */
const fmtDDMMYYYY = new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, year:'numeric', month:'2-digit', day:'2-digit'});
const fmtLocal = new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, hour:'2-digit', minute:'2-digit', second:'2-digit'});

function parts(d){ const p = new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'}).formatToParts(d).reduce((acc,p)=>{acc[p.type]=p.value;return acc;},{}); return p; }
function toLocalParts(date, timeZone){ const fmt = new Intl.DateTimeFormat('vi-VN', { timeZone: timeZone||TZ, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'}); const p = fmt.formatToParts(date).reduce((a,p)=>{a[p.type]=p.value; return a;},{}); return p; }
function toISOInTZ(date, timeZone=TZ){
  const p = toLocalParts(date, timeZone);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}+07:00`; // Vietnam TZ
}
function toDDMMYYYY(d){ return fmtDDMMYYYY.format(d); }
function parseDateInput(val){
  if(!val) return null;
  const [dd,mm,yyyy] = String(val).split('/').map(v=>Number(v));
  if(!yyyy || !mm || !dd) return null;
  return new Date(yyyy, mm-1, dd, 0,0,0);
}
function startOfMonth(y,m){ return new Date(y, m-1, 1, 0,0,0); }
function endOfMonth(y,m){ return new Date(y, m, 0, 23,59,59); }
function startOfYear(y){ return new Date(y,0,1,0,0,0); }
function endOfYear(y){ return new Date(y,11,31,23,59,59); }

/** buildQueryParamsFromFilters(prefix) – đọc các input theo tiền tố */
function buildQueryParamsFromFilters(prefix){
  const v = (id)=> document.getElementById(`${prefix}${id}`).value.trim();
  const month = Number(v('Month')||'');
  const year = Number(v('Year')||'');
  const fromI = parseDateInput(v('From'));
  const toI   = parseDateInput(v('To'));
  let start, end;

  // Ưu tiên range
  if (fromI && toI){
    start = fromI; end = new Date(toI.getFullYear(), toI.getMonth(), toI.getDate(), 23,59,59);
  } else if (year && !month){
    start = startOfYear(year); end = endOfYear(year);
  } else if (month){
    const y = year || (new Date()).getFullYear();
    start = startOfMonth(y, month); end = endOfMonth(y, month);
  } else {
    // default: current month
    const now = new Date(); const y = now.getFullYear(); const m = now.getMonth()+1;
    start = startOfMonth(y,m); end = endOfMonth(y,m);
  }

  // enable/disable month/year UI
  const mEl = document.getElementById(`${prefix}Month`);
  const yEl = document.getElementById(`${prefix}Year`);
  const usingRange = !!(fromI && toI);
  mEl.disabled = usingRange; yEl.disabled = usingRange;

  return { startDateISO: toISOInTZ(start), endDateISO: toISOInTZ(end), month: month||'', year: year||'', from: v('From')||'', to: v('To')||'' };
}

/* ===== UI helpers ===== */
function showToast(msg, type='info'){
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(()=>{ el.remove(); }, 3800);
}
function setLoading(on){
  document.getElementById('globalLoading').classList.toggle('show', !!on);
}

/* ===== Abort control + fetch with cache ===== */
function abortPrev(key){
  if(controllers[key]){ controllers[key].abort(); }
  controllers[key] = new AbortController();
  return controllers[key].signal;
}

async function callApi(action, payload){
  if(USE_MOCK){
    // simple mock
    await new Promise(r=>setTimeout(r,800));
    return { ok:true, data:{ mock:true, action, payload, time:new Date().toISOString() } };
  }
  const signal = abortPrev(action);
  const res = await fetch(WEB_APP_URL, {
    method:'POST',
    headers:{ 'content-type':'text/plain' },
    signal,
    body: JSON.stringify({ action, payload, idToken: ID_TOKEN })
  });
  return await res.json();
}

/* ===== Login (GIS) ===== */
function dlog(m){ const e=document.getElementById('debug'); if(e) e.textContent=m; console.error(m); }

function initLogin(){
  try{
    if (!window.google || !google.accounts || !google.accounts.id){
      dlog('Không tải được Google Sign-In. Kiểm tra mạng/extension.');
      return;
    }
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp)=>{ ID_TOKEN = resp.credential || ""; postLogin(); },
    });
    google.accounts.id.renderButton(document.getElementById("gbtnWrap"),
      { theme: "outline", size: "large", width: 250 });
  }catch(e){ dlog('Lỗi init GIS: ' + e); }
}

async function postLogin(){
  setLoading(true);
  try{
    const r = await callApi('me', {});
    if(!r.ok) throw new Error(r.error||'ME_FAILED');
    ME = r.data;
    // gate UI
    document.getElementById("signedOut").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("meBox").textContent = `${ME.email} (${ME.role})`;
    if ((ME.role||'staff')==='admin') document.getElementById('adminTab').classList.remove('d-none');

    // set defaults
    const now = new Date();
    document.getElementById('dashMonth').value = now.getMonth()+1;
    document.getElementById('dashYear').value = now.getFullYear();
    // first load
    await loadDashboard();
    bindMenu();
  }catch(err){
    showToast('Không có quyền hoặc lỗi đăng nhập', 'error');
    console.error(err);
  }finally{
    setLoading(false);
  }
}

/* ===== Menu ===== */
function bindMenu(){
  document.querySelectorAll('#menu .nav-link').forEach(a=>{
    a.onclick = (e)=>{
      e.preventDefault();
      document.querySelectorAll('#menu .nav-link').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      const sec = a.getAttribute('data-section');
      document.querySelectorAll('section[id^="section-"]').forEach(s=>s.classList.add('hidden'));
      document.getElementById('section-'+sec).classList.remove('hidden');
    };
  });
}

/* ===== Dashboard ===== */
function cardKPI(label, value){
  return `<div class="col-md-4"><div class="card p-3"><div class="text-muted small">${label}</div><div class="fs-3 fw-bold">${value}</div></div></div>`;
}

async function loadDashboard(){
  const btn = document.getElementById('dashBtn');
  btn.disabled = true; const oldText = btn.textContent; btn.textContent='Đang tải…'; setLoading(true);
  try{
    const q = buildQueryParamsFromFilters('dash');
    const t0 = performance.now();
    const res = await callApi('dashboard', { month: q.month, year: q.year, from:q.from, to:q.to });
    if(!res.ok) throw new Error(res.error||'API_ERROR');
    const d = res.data;
    const cards = [];
    cards.push(cardKPI("Khách mới", d.khachHangMoi));
    cards.push(cardKPI("Đã mua", d.daMua) + cardKPI("Chưa mua", d.chuaMua));
    cards.push(cardKPI("CSKH (phiên)", d.soPhienCSKH) + cardKPI("Tỉ lệ có next", (d.tiLeNext*100).toFixed(0)+"%"));
    const ton = (d.tonKho||[]).map(x=>`${x.model}: ${x.ton_cuoi}${x.thap?' 🔻':''}`).join("<br>");
    cards.push(`<div class="col-md-4"><div class="card p-3"><div class="fw-bold">Top tồn thấp</div><div class="small mt-2">${ton||'—'}</div></div></div>`);
    const sell = (d.topSell||[]).map(x=>`${x.model}: ${x.qty}`).join("<br>");
    cards.push(`<div class="col-md-4"><div class="card p-3"><div class="fw-bold">Mẫu bán chạy</div><div class="small mt-2">${sell||'—'}</div></div></div>`);
    document.getElementById("dashCards").innerHTML = cards.join("");
    document.getElementById("dashRaw").textContent = JSON.stringify(d, null, 2);
    const t1 = performance.now();
    document.getElementById('dashMeta').textContent = `Tìm thấy dữ liệu trong ${(t1-t0).toFixed(0)} ms • Khoảng: ${q.from && q.to ? (q.from + " → " + q.to) : ('Tháng '+(q.month||((new Date()).getMonth()+1)) + '/' + (q.year || (new Date()).getFullYear()))}`;
  }catch(err){
    showToast('Lỗi tải Trang chủ: '+err.message, 'error');
    console.error(err);
  }finally{
    btn.disabled=false; btn.textContent=oldText; setLoading(false);
  }
}

function bindDashboardFilters(){
  const ids = ['dashMonth','dashYear','dashFrom','dashTo'];
  let timer;
  ids.forEach(id=>{
    document.getElementById(id).addEventListener('input', ()=>{
      clearTimeout(timer);
      timer = setTimeout(()=>loadDashboard(), DEBOUNCE_MS);
    });
  });
  document.getElementById('dashBtn').addEventListener('click', (e)=>{
    e.preventDefault(); loadDashboard();
  });
}

/* ===== Customers (list minimal) ===== */
async function loadCustomers(){
  const m = Number(document.getElementById('cl_month').value||'');
  const y = Number(document.getElementById('cl_year').value||'');
  const box = document.getElementById('c_list');
  box.innerHTML = `<div class="skel"></div><div class="skel"></div><div class="skel"></div>`;
  try{
    const res = await callApi('customer.list', { month:m||'', year:y||'' });
    if(!res.ok) throw new Error(res.error||'API_ERROR');
    const list = res.data||[];
    const html = list.map(x=>{
      const ngay = (x.ngay && typeof x.ngay==='string') ? x.ngay : '';
      return `<div class="border rounded p-2 mb-2">
        <div class="d-flex justify-content-between">
          <div><b>${x.ten||"-"}</b> • ${x.so_dien_thoai||"-"} • ${x.nguon_khach||"-"} • ${x.trang_thai_mua||"-"} • ${x.mau_ghe||""}</div>
          <div class="small text-muted">${ngay}</div>
        </div>
      </div>`;
    }).join("");
    box.innerHTML = html || "<div class='text-muted'>Không có dữ liệu</div>";
  }catch(err){
    box.innerHTML = "<div class='text-danger'>Không tải được danh sách</div>";
  }
}

function bindCustomers(){
  document.getElementById('btnLoadCustomers').onclick = (e)=>{ e.preventDefault(); loadCustomers(); };
}

/* ===== init ===== */
window.addEventListener('DOMContentLoaded', ()=>{
  initLogin();
  bindDashboardFilters();
  bindCustomers();
});
