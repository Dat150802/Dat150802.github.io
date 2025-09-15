/* =========================
   KLC Bến Lức – Frontend JS
   ========================= */

/** CONFIG – cập nhật 2 dòng dưới cho đúng env của bạn */
const GOOGLE_CLIENT_ID = "229964671691-jvq8pstlajqa9v6g0rhfi0u8ei39453u.apps.googleusercontent.com";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx9MFNR0qc3udfgcG26_T0rtnHZYePBhyRn3iEM06GDYqp4VQanJkq8rRdBPzV_3Hsn/exec";

/** MOCK (để test UI nếu backend chưa sẵn) */
const USE_MOCK = false;

const TZ = "Asia/Ho_Chi_Minh";
const CACHE_TTL_MS = 8 * 60 * 1000; // 8 phút
const DEBOUNCE_MS = 500;

let ID_TOKEN = "";
let ME = null;

/** Abort controllers theo module */
const controllers = {
  dash: null, cl: null, w: null, fin: null, stock: null
};

/** Simple memory cache + localStorage */
const memCache = new Map();

/* =========================
   TIME & RANGE HELPERS
   ========================= */
const pad = (n) => (n<10? "0"+n : ""+n);

function toLocalParts(d, timeZone=TZ){
  const fmt = new Intl.DateTimeFormat('vi-VN', {
    timeZone, year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit'
  });
  const parts = fmt.formatToParts(d)
    .reduce((acc,p)=>{ acc[p.type]=p.value; return acc; }, {});
  // vi-VN gives 24h, great
  return {
    y: parts.year, m: parts.month, d: parts.day,
    H: parts.hour, M: parts.minute, S: parts.second
  };
}

/** ISO string với offset +07:00 theo TZ */
function toISOInTZ(date, timeZone=TZ){
  const p = toLocalParts(date, timeZone);
  const isoNoTz = `${p.y}-${p.m}-${p.d}T${pad(p.H)}:${pad(p.M)}:${pad(p.S)}`;
  // Việt Nam là UTC+07:00 (không DST)
  return `${isoNoTz}+07:00`;
}

/** format dd/MM/yyyy theo TZ */
function toDDMMYYYY(date, timeZone=TZ){
  const p = toLocalParts(date, timeZone);
  return `${p.d}/${p.m}/${p.y}`;
}

function startOfMonth(y,m){ return new Date(Number(y), Number(m)-1, 1, 0,0,0); }
function endOfMonth(y,m){ return new Date(Number(y), Number(m), 0, 23,59,59); }
function startOfYear(y){ return new Date(Number(y), 0, 1, 0,0,0); }
function endOfYear(y){ return new Date(Number(y), 11, 31, 23,59,59); }

/** Parse yyyy-mm-dd từ <input type="date"> thành Date tại 00:00:00 TZ */
function parseDateInput(val){
  if(!val) return null;
  const [Y,M,D] = val.split('-').map(Number);
  return new Date(Y, M-1, D, 0,0,0);
}

/** Validate M (1..12), Y (4-digit) */
function validMY(m,y){
  const okM = (m && Number(m)>=1 && Number(m)<=12);
  const okY = (y && String(y).length===4);
  return {okM, okY};
}

/**
 * buildQueryParamsFromFilters(prefix)
 * Đọc: #{prefix}From, #{prefix}To, #{prefix}Month, #{prefix}Year
 * Trả: { startDateISO, endDateISO, from, to, month, year }
 *  - from/to: dd/MM/yyyy (cho Apps Script)
 *  - startDateISO/endDateISO: ISO +07:00 (nếu backend cần)
 * Quy tắc ưu tiên: có range => disable M/Y (UI), không range thì dùng M/Y
 * Nếu có M mà thiếu Y => tự gán Y = năm hiện tại
 */
function buildQueryParamsFromFilters(prefix){
  const now = new Date();
  const monthEl = document.getElementById(`${prefix}Month`);
  const yearEl  = document.getElementById(`${prefix}Year`);
  const fromEl  = document.getElementById(`${prefix}From`) || document.getElementById(`${prefix}_from`);
  const toEl    = document.getElementById(`${prefix}To`)   || document.getElementById(`${prefix}_to`);

  const m = monthEl ? Number(monthEl.value||0) : 0;
  let y   = yearEl  ? Number(yearEl.value||0)  : 0;
  const rangeFrom = fromEl ? parseDateInput(fromEl.value) : null;
  const rangeTo   = toEl   ? parseDateInput(toEl.value)   : null;

  const {okM, okY} = validMY(m, y);
  if (!okY && okM){ y = now.getFullYear(); } // auto-fill năm hiện tại

  let start=null, end=null, month= (okM? m: undefined), year=(okY? y: undefined);

  // ƯU TIÊN RANGE
  if (rangeFrom && rangeTo){
    start = new Date(rangeFrom.getFullYear(), rangeFrom.getMonth(), rangeFrom.getDate(), 0,0,0);
    end   = new Date(rangeTo.getFullYear(),   rangeTo.getMonth(),   rangeTo.getDate(),   23,59,59);
    // Disable M/Y tại UI (chỉ style/disabled, không xoá value)
    if (monthEl) monthEl.disabled = true;
    if (yearEl)  yearEl.disabled  = true;
  } else {
    // Không có range -> enable lại M/Y
    if (monthEl) monthEl.disabled = false;
    if (yearEl)  yearEl.disabled  = false;

    if (okM && (okY || y)){ // có M/Y
      start = startOfMonth(y, m);
      end   = endOfMonth(y, m);
    } else if (!okM && okY){ // chỉ Năm
      start = startOfYear(y);
      end   = endOfYear(y);
    } else {
      // fallback: tháng/năm hiện tại
      const cm = now.getMonth()+1, cy = now.getFullYear();
      start = startOfMonth(cy, cm);
      end   = endOfMonth(cy, cm);
      month = cm; year = cy;
    }
  }

  const startDateISO = toISOInTZ(start);
  const endDateISO   = toISOInTZ(end);
  const from = toDDMMYYYY(start);
  const to   = toDDMMYYYY(end);

  return { startDateISO, endDateISO, from, to, month, year };
}

/* =========================
   UI HELPERS: overlay, toast, skeleton, loading, debounce
   ========================= */
function overlay(on){
  const el = document.getElementById('overlay');
  if (!el) return;
  el.classList.toggle('hidden', !on);
}
function toast(msg, type='info'){
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const id = `t${Date.now()}`;
  const item = document.createElement('div');
  item.className = `klc-toast ${type}`;
  item.id = id;
  item.textContent = msg;
  wrap.appendChild(item);
  setTimeout(()=> item.classList.add('show'), 10);
  setTimeout(()=>{
    item.classList.remove('show');
    setTimeout(()=> item.remove(), 300);
  }, 3800);
}

function skeleton(containerId, rows=6){
  const el = document.getElementById(containerId);
  if (!el) return;
  const arr = [];
  for(let i=0;i<rows;i++){
    arr.push(`<div class="skeleton-row"></div>`);
  }
  el.innerHTML = arr.join('');
}

function clearSkeleton(containerId){
  const el = document.getElementById(containerId);
  if(el) el.innerHTML = '';
}

function setBtnLoading(btnId, isLoading){
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (isLoading){
    btn.dataset._text = btn.textContent;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Đang tải…`;
    btn.disabled = true;
  } else {
    const t = btn.dataset._text || 'Xong';
    btn.textContent = t;
    btn.disabled = false;
  }
}

function setFilterDisabled(prefix, disabled){
  const box = document.getElementById(`${prefix}Filter`);
  if (!box) return;
  box.querySelectorAll('input, select, button').forEach(el => el.disabled = disabled);
}

/** Debounce */
function debounce(fn, wait=DEBOUNCE_MS){
  let t;
  return (...args)=>{
    clearTimeout(t);
    t = setTimeout(()=>fn(...args), wait);
  };
}

/* =========================
   CACHE & FETCH
   ========================= */
function cacheKey(action, payload){
  const base = `${action}|${payload.from}|${payload.to}|${payload.month||''}|${payload.year||''}`;
  return base;
}
function setCache(action, payload, data){
  const key = cacheKey(action, payload);
  const val = { t: Date.now(), data };
  memCache.set(key, val);
  try{
    localStorage.setItem(key, JSON.stringify(val));
  }catch(_){}
}
function getCache(action, payload){
  const key = cacheKey(action, payload);
  let hit = memCache.get(key);
  if (!hit){
    try{
      const raw = localStorage.getItem(key);
      if (raw) hit = JSON.parse(raw);
    }catch(_){}
  }
  if (hit && (Date.now()-hit.t <= CACHE_TTL_MS)) return hit.data;
  return null;
}

async function api(action, payload, modKey=null, signal=null){
  if (USE_MOCK){
    // Mock nhanh cho UI
    await new Promise(r=>setTimeout(r, 700));
    return { ok:true, data: { mock:true, action, payload, now: new Date().toISOString() } };
  }
  const body = { action, payload, idToken: ID_TOKEN };
  const res = await fetch(WEB_APP_URL, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify(body),
    signal
  });
  return res.json();
}

function abortPrev(mod){
  if (controllers[mod]) {
    try{ controllers[mod].abort(); }catch(_){}
  }
  controllers[mod] = new AbortController();
  return controllers[mod].signal;
}

/* =========================
   LOGIN / GATING / MENU
   ========================= */
function dlog(m){ const e=document.getElementById('debug'); if(e) e.textContent=m; console.error(m); }

function initLogin(){
  try{
    if (!window.google || !google.accounts || !google.accounts.id){
      dlog('Không tải được Google Sign-In. Kiểm tra mạng/extension.');
      return;
    }
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp)=>{ ID_TOKEN = resp.credential||""; postLogin(); },
      auto_select: false,
      cancel_on_tap_outside: true
    });
    google.accounts.id.renderButton(
      document.getElementById("gbtnWrap"),
      { theme: "outline", size: "large", width: 250 }
    );
  }catch(e){ dlog('Lỗi init GIS: ' + e); }
}

async function postLogin(){
  try{
    const r = await api('me', {});
    if (!r.ok) throw new Error(r.error||'LOGIN_FAIL');
    ME = r.data;
    // gating
    document.getElementById('signedOut').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('meBox').textContent = `${ME.email} (${ME.role})`;
    if ((ME.role||'staff')==='admin'){
      document.getElementById('adminTab').classList.remove('d-none');
    } else {
      document.getElementById('adminTab').classList.add('d-none');
    }
    bindMenu();
    // set default current month/year
    const now = new Date();
    const cm = now.getMonth()+1, cy = now.getFullYear();
    ['dash','cl','w','fin'].forEach(p=>{
      const mEl = document.getElementById(`${p}Month`) || document.getElementById(`${p}_month`);
      const yEl = document.getElementById(`${p}Year`)  || document.getElementById(`${p}_year`);
      if (mEl) mEl.value = cm;
      if (yEl) yEl.value = cy;
    });
    // Tải dashboard ngay
    loadDashboard();
  }catch(err){
    toast('Không có quyền hoặc token không hợp lệ', 'error');
  }
}

function bindMenu(){
  document.querySelectorAll('#menu .nav-link').forEach(a=>{
    a.onclick = (e)=>{
      e.preventDefault();
      document.querySelectorAll('#menu .nav-link').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      const sec = a.getAttribute('data-section');
      document.querySelectorAll('section[id^="section-"]').forEach(s=>s.classList.add('hidden'));
      const box = document.getElementById('section-'+sec);
      box.classList.remove('hidden');

      // Lazy load mỗi module
      if (sec==='dashboard') loadDashboard();
      if (sec==='customers') loadCustomers();
      if (sec==='warranty')  loadWarranty();
      if (sec==='inventory') {/* chỉ khi bấm Xem tồn kho */}
      if (sec==='finance')   loadFinance();
    };
  });
}

/* =========================
   MODULE: DASHBOARD
   ========================= */
async function loadDashboard(){
  const mod='dash';
  const prefix='dash';
  const btnId='dashBtn';
  const metaEl = document.getElementById('dashMeta');

  const q = buildQueryParamsFromFilters(prefix);
  const payload = { month:q.month||'', year:q.year||'', from:q.from, to:q.to };
  const cacheHit = getCache('dashboard', payload);

  overlay(true); setBtnLoading(btnId,true); setFilterDisabled(prefix,true);
  skeleton('dashSkeleton', 6);
  const t0 = performance.now();
  try{
    let data;
    if (cacheHit){
      data = cacheHit;
    } else {
      const signal = abortPrev(mod);
      const res = await api('dashboard', payload, mod, signal);
      if (!res.ok) throw new Error(res.error||'ERR');
      data = res.data;
      setCache('dashboard', payload, data);
    }
    renderDashboard(data);
    metaEl.textContent = `Xong – bộ lọc: ${q.from} → ${q.to}`;
  }catch(err){
    console.error(err);
    toast('Lỗi tải Trang chủ. Thử lại!', 'error');
  }finally{
    const t1 = performance.now();
    metaEl.textContent += ` • (${Math.round(t1-t0)} ms)`;
    clearSkeleton('dashSkeleton');
    overlay(false); setBtnLoading(btnId,false); setFilterDisabled(prefix,false);
  }
}

function renderDashboard(d){
  const cards = [];
  cards.push(cardKPI("Khách mới", d.khachHangMoi||0));
  cards.push(cardKPI("Đã mua", d.daMua||0) + cardKPI("Chưa mua", d.chuaMua||0));
  cards.push(cardKPI("CSKH (phiên)", d.soPhienCSKH||0) + cardKPI("Tỉ lệ có next", ((d.tiLeNext||0)*100).toFixed(0)+"%"));
  const bd = d.baoDuong||{denKy:0,daXL:0,quaHan:0};
  cards.push(cardKPI("Bảo dưỡng: Đến kỳ", bd.denKy||0) + cardKPI("Đã xử lý", bd.daXL||0) + cardKPI("Quá hạn", bd.quaHan||0));
  const ton = (d.tonKho||[]).map(x=>`${x.model}: ${x.ton_cuoi}${x.thap?' 🔻':''}`).join("<br>");
  cards.push(`<div class="col-md-4"><div class="card p-3"><div class="fw-bold">Top tồn thấp</div><div class="small mt-2">${ton||'—'}</div></div></div>`);
  const sell = (d.topSell||[]).map(x=>`${x.model}: ${x.qty}`).join("<br>");
  cards.push(`<div class="col-md-4"><div class="card p-3"><div class="fw-bold">Mẫu bán chạy</div><div class="small mt-2">${sell||'—'}</div></div></div>`);
  document.getElementById("dashCards").innerHTML = cards.join("");
}
function cardKPI(label, value){
  return `<div class="col-md-4"><div class="card p-3"><div class="text-muted small">${label}</div><div class="fs-3 fw-bold">${value}</div></div></div>`;
}

/* =========================
   MODULE: CUSTOMERS
   ========================= */
let _CUSTOMERS = [];
const debouncedFilterCustomers = debounce(()=> filterCustomerList(), DEBOUNCE_MS);

async function loadCustomers(){
  const mod='cl', prefix='cl', btnId='clBtn';
  const metaEl = document.getElementById('clMeta');
  const q = buildQueryParamsFromFilters(prefix);
  const payload = { month:q.month||'', year:q.year||'', from:q.from, to:q.to };

  overlay(true); setBtnLoading(btnId,true); setFilterDisabled(prefix,true);
  skeleton('clSkeleton', 8);
  const t0=performance.now();
  try{
    const signal = abortPrev(mod);
    const res = await api('customer.list', payload, mod, signal);
    if (!res.ok) throw new Error(res.error||'ERR');
    _CUSTOMERS = res.data||[];
    renderCustomerList(_CUSTOMERS);
    metaEl.textContent = `Tìm thấy ${_CUSTOMERS.length} bản ghi • ${q.from} → ${q.to}`;
  }catch(err){
    console.error(err); toast('Lỗi tải Khách hàng', 'error');
  }finally{
    const t1=performance.now();
    metaEl.textContent += ` • (${Math.round(t1-t0)} ms)`;
    clearSkeleton('clSkeleton'); overlay(false); setBtnLoading(btnId,false); setFilterDisabled(prefix,false);
  }
}

function renderCustomerList(list){
  const html = list.map(x=>{
    const btnCSKH = `<button class="btn btn-sm btn-outline-secondary me-2" onclick="prefillCSKH('${x.customer_id||""}','${String(x.ten||"").replace(/'/g,"\\'")}','${x.so_dien_thoai||""}')">Chuyển Sang CSKH</button>`;
    const btnInfo = `<button class="btn btn-sm btn-outline-primary" onclick="viewCustomer('${x.customer_id||""}')">Xem thông tin</button>`;
    return `<div class="border rounded p-2 mb-2">
      <div class="d-flex justify-content-between">
        <div><b>${x.ten||"-"}</b> • ${x.so_dien_thoai||"-"} • ${x.nguon_khach||"-"} • ${x.trang_thai_mua||"-"} • ${x.mau_ghe||""}</div>
        <div class="small text-muted">${fmtDate(x.ngay)}</div>
      </div>
      <div class="mt-1">${x.dia_chi||""}</div>
      <div class="mt-2">${btnCSKH}${btnInfo}</div>
    </div>`;
  }).join("");
  document.getElementById("c_list").innerHTML = html || "<div class='text-muted'>Không có dữ liệu</div>";
}

function filterCustomerList(){
  const q=(document.getElementById("c_search").value||"").trim().toLowerCase();
  const list=_CUSTOMERS.filter(x=> String(x.ten||"").toLowerCase().includes(q) || String(x.so_dien_thoai||"").includes(q) );
  renderCustomerList(list);
}

/** tiện ích cũ */
function fmtDate(v){
  try{
    if(!v) return "";
    if (typeof v==="string" && v.includes("/")) return v;
    const d=new Date(v);
    const dd=pad(d.getDate()), mm=pad(d.getMonth()+1), yyyy=d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }catch(e){ return v; }
}

function prefillCSKH(cid,name,phone){
  document.querySelector('#menu [data-section="cskh"]').click();
  document.getElementById("care_customer_id").value=cid;
  document.getElementById("care_noi_dung").value="CSKH khách "+name+" ("+phone+")";
}

function viewCustomer(cid){
  const x = _CUSTOMERS.find(v=> String(v.customer_id)===String(cid));
  if(!x){ toast('Không tìm thấy khách', 'warn'); return; }
  const detail = [
    `ID: ${x.customer_id||''}`,
    `Ngày: ${fmtDate(x.ngay)}`,
    `Tên: ${x.ten||''}`,
    `Điện thoại: ${x.so_dien_thoai||''}`,
    `Địa chỉ: ${x.dia_chi||''}`,
    `Nguồn: ${x.nguon_khach||''}`,
    `Trạng thái: ${x.trang_thai_mua||''}`,
    `Mẫu ghế: ${x.mau_ghe||''} • Giá: ${x.gia_ban||''} • BH: ${x.so_nam_bao_hanh||''} năm`,
    `Ghi chú: ${x.ghi_chu||''}`
  ].join('\n');
  alert(detail);
}

/* Thêm/xoá dòng mẫu ghế tham khảo */
function addModelRow(){
  const box = document.getElementById('c_models_list');
  const id = 'm_'+Date.now();
  box.insertAdjacentHTML('beforeend', `
    <div class="row g-2 align-items-center" data-id="${id}">
      <div class="col-4"><input class="form-control" placeholder="Mẫu (VD: KY02)"></div>
      <div class="col-4"><input type="number" class="form-control" placeholder="Giá tham khảo"></div>
      <div class="col-3"><input type="number" class="form-control" placeholder="BH (năm)"></div>
      <div class="col-1 text-end"><button class="btn btn-sm btn-outline-danger" onclick="this.closest('[data-id]').remove()">×</button></div>
    </div>
  `);
}

/* =========================
   MODULE: WARRANTY
   ========================= */
async function loadWarranty(){
  const mod='w', prefix='w', btnId='wBtn';
  const metaEl = document.getElementById('wMeta');
  const q = buildQueryParamsFromFilters(prefix);
  const payload = { month:q.month||'', year:q.year||'', from:q.from, to:q.to };

  overlay(true); setBtnLoading(btnId,true); setFilterDisabled(prefix,true);
  skeleton('wSkeleton', 8);
  const t0=performance.now();
  try{
    const signal = abortPrev(mod);
    const res = await api('warranty.byMonth', payload, mod, signal);
    if (!res.ok) throw new Error(res.error||'ERR');
    const list = res.data||[];
    const html=list.map(w=>{
      const handledBtn=(String(w.trang_thai)==="Đến kỳ")? `<button class="btn btn-sm btn-outline-success">Đánh dấu đã xử lý</button>` : "";
      return `<div class="border rounded p-2 mb-2">
        <div><b>${w.customer_id||''}</b> • ${w.mau_ghe||""} • ${w.loai||""}</div>
        <div class="small text-muted">Trạng thái: ${w.trang_thai||""} • Kỳ: ${w.ky_bao_duong_thang||""} • Dự kiến: ${fmtDate(w.ngay_du_kien)}</div>
        <div class="mt-1">${handledBtn}</div>
      </div>`;
    }).join("");
    document.getElementById("w_list").innerHTML = html || "<div class='text-muted'>Không có lịch trong kỳ</div>";
    metaEl.textContent = `Tìm thấy ${list.length} bản ghi • ${q.from} → ${q.to}`;
  }catch(err){
    console.error(err); toast('Lỗi tải Bảo hành/BD', 'error');
  }finally{
    const t1=performance.now();
    metaEl.textContent += ` • (${Math.round(t1-t0)} ms)`;
    clearSkeleton('wSkeleton'); overlay(false); setBtnLoading(btnId,false); setFilterDisabled(prefix,false);
  }
}

/* =========================
   MODULE: FINANCE
   ========================= */
async function loadFinance(){
  const mod='fin', prefix='fin', btnId='finBtn';
  const metaEl = document.getElementById('finMeta');
  const sumEl  = document.getElementById('fin_summary');

  const q = buildQueryParamsFromFilters(prefix);
  const payload = { month:q.month||'', year:q.year||'', from:q.from, to:q.to };

  overlay(true); setBtnLoading(btnId,true); setFilterDisabled(prefix,true);
  skeleton('finSkeleton', 6);
  const t0=performance.now();
  try{
    const signal = abortPrev(mod);
    const res = await api('fin.monthly', payload, mod, signal);
    if (!res.ok) throw new Error(res.error||'ERR');
    const r = res.data||{sumThu:0,sumChi:0,loiNhuan:0};
    const nf=(v)=>new Intl.NumberFormat("vi-VN").format(v);
    sumEl.innerHTML =
      `<div>Tổng Thu: <b>${nf(r.sumThu)}</b></div>
       <div>Tổng Chi: <b>${nf(r.sumChi)}</b></div>
       <div>Lợi nhuận gộp: <b>${nf(r.loiNhuan)}</b></div>`;
    metaEl.textContent = `Khoảng: ${q.from} → ${q.to}`;
  }catch(err){
    console.error(err); toast('Lỗi tải Thu/Chi', 'error');
  }finally{
    const t1=performance.now();
    metaEl.textContent += ` • (${Math.round(t1-t0)} ms)`;
    clearSkeleton('finSkeleton'); overlay(false); setBtnLoading(btnId,false); setFilterDisabled(prefix,false);
  }
}

/* =========================
   MODULE: STOCK (nút Xem)
   ========================= */
async function loadStock(){
  const mod='stock';
  overlay(true); setBtnLoading('stockBtn',true);
  skeleton('stockSkeleton', 6);
  const t0=performance.now();
  try{
    const signal = abortPrev(mod);
    const res = await api('inv.stockView', {}, mod, signal);
    if (!res.ok) throw new Error(res.error||'ERR');
    const rows=res.data||[];
    const html=rows.map(x=>`<div class="border rounded p-2 mb-2"><b>${x.mau_ghe}</b> — tồn: ${x.ton_cuoi} (đầu: ${x.ton_dau}, nhập: ${x.nhap}, xuất: ${x.xuat})</div>`).join("");
    document.getElementById("stock").innerHTML = html || "<div class='text-muted'>Chưa có</div>";
    document.getElementById('stockMeta').textContent = `Có ${rows.length} dòng • ${Math.round(performance.now()-t0)} ms`;
  }catch(err){
    console.error(err); toast('Lỗi tải Tồn kho', 'error');
  }finally{
    clearSkeleton('stockSkeleton'); overlay(false); setBtnLoading('stockBtn',false);
  }
}

/* =========================
   EVENT BINDINGS
   ========================= */
function bindEvents(){
  // Buttons
  document.getElementById('dashBtn').addEventListener('click', ()=>loadDashboard());
  document.getElementById('clBtn').addEventListener('click', ()=>loadCustomers());
  document.getElementById('wBtn').addEventListener('click', ()=>loadWarranty());
  document.getElementById('finBtn').addEventListener('click', ()=>loadFinance());
  document.getElementById('stockBtn').addEventListener('click', ()=>loadStock());

  // Debounce inputs
  ['dashMonth','dashYear','dashFrom','dashTo'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.addEventListener('input', debounce(loadDashboard));
  });
  ['cl_month','cl_year','cl_from','cl_to','c_search'].forEach(id=>{
    const el=document.getElementById(id);
    if(!el) return;
    if (id==='c_search') el.addEventListener('input', debouncedFilterCustomers);
    else el.addEventListener('input', debounce(loadCustomers));
  });
  ['w_month','w_year','w_from','w_to'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.addEventListener('input', debounce(loadWarranty));
  });
  ['fin_month','fin_year','fin_from','fin_to'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.addEventListener('input', debounce(loadFinance));
  });

  // Nguồn khách -> hiển thị ô “Người quen”
  const nguonEl = document.getElementById('c_nguon');
  const nguoiQuenWrap = document.getElementById('c_nguoi_quen_wrap');
  if (nguonEl && nguoiQuenWrap){
    const handleNguon = ()=>{
      const v = nguonEl.value||'';
      const need = ['Người quen giới thiệu','Khách cũ mua lại','Người quen nhân viên','Khác'].includes(v);
      nguoiQuenWrap.classList.toggle('hidden', !need);
    };
    nguonEl.addEventListener('change', handleNguon);
    handleNguon();
  }

  // Trạng thái mua -> “Chưa mua” hiện multi-models
  const statusEl = document.getElementById('c_status');
  const modelsWrap = document.getElementById('c_models_wrap');
  if (statusEl && modelsWrap){
    const handleStatus = ()=>{
      const isCM = (statusEl.value==='Chưa mua');
      modelsWrap.classList.toggle('hidden', !isCM);
    };
    statusEl.addEventListener('change', handleStatus);
    handleStatus();
  }

  const addModelBtn = document.getElementById('addModelBtn');
  if (addModelBtn) addModelBtn.addEventListener('click', addModelRow);

  // Khóa Ctrl+K -> focus search khách
  document.addEventListener('keydown', function(e){
    if (e.ctrlKey && e.key.toLowerCase()==="k"){
      e.preventDefault();
      const box = document.getElementById("c_search");
      if (!document.getElementById("section-customers").classList.contains("hidden")){ box?.focus(); }
      else { document.querySelector('#menu [data-section="customers"]').click(); setTimeout(()=>box?.focus(),150); }
    }
  });

  // Nút lưu/xoá/CSV (giữ placeholder – bạn đang có backend cũ)
  document.getElementById('saveCustomerBtn')?.addEventListener('click', ()=>toast('Lưu khách: vui lòng dùng API cũ', 'warn'));
  document.getElementById('clearCustomerBtn')?.addEventListener('click', ()=>{
    ['c_ten','c_phone','c_ngay','c_diachi','c_model','c_gia','c_bhn','c_note','c_nvnhap','c_nguoi_quen'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
    document.getElementById('c_nguon').value='Quảng cáo Page';
    document.getElementById('c_status').value='Chưa mua';
    document.getElementById('c_models_list').innerHTML='';
    toast('Đã xoá form', 'info');
  });
  document.getElementById('exportCustomersBtn')?.addEventListener('click', ()=>toast('Xuất CSV customers (API cũ)', 'info'));

  document.getElementById('saveCSKHBtn')?.addEventListener('click', ()=>toast('Lưu CSKH (API cũ)', 'warn'));
  document.getElementById('clearCSKHBtn')?.addEventListener('click', ()=>{
    ['care_ngay','care_noi_dung','care_phan_hoi','care_customer_id','care_nv','care_kq'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
    ['f1','f2','f3','f4'].forEach(id=>{ const el=document.getElementById(id); if(el) el.checked=false; });
    toast('Đã xoá nội dung CSKH', 'info');
  });
  document.getElementById('exportCSKHBtb')?.addEventListener('click', ()=>toast('Xuất CSV CSKH (API cũ)', 'info'));

  document.getElementById('saveInvBtn')?.addEventListener('click', ()=>toast('Lưu Phiếu (API cũ)', 'warn'));
  document.getElementById('exportInvBtn')?.addEventListener('click', ()=>toast('Xuất CSV inventory (API cũ)', 'info'));

  document.getElementById('saveFinanceBtn')?.addEventListener('click', ()=>toast('Lưu Thu/Chi (API cũ)', 'warn'));
  document.getElementById('exportFinanceBtn')?.addEventListener('click', ()=>toast('Xuất CSV finance (API cũ)', 'info'));
}

/* =========================
   BOOT
   ========================= */
window.addEventListener('load', ()=>{
  initLogin();
  bindEvents();
});
