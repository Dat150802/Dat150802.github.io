\
/** KLC API v1 — đủ cho dashboard + landing */
const SHEETS = {
  orders: 'Sales_Orders',
  care: 'CSKH_Log',
  inventory: 'Inventory',
  warranty: 'Warranty_Service',
};

function onOpen() {
  SpreadsheetApp.getUi().createMenu('KLC API')
    .addItem('Init sheets (tạo/cập nhật các sheet & header)', 'initSheets_')
    .addToUi();
}

function initSheets_() {
  _header(_sheet(SHEETS.orders),   ['timestamp','date','customer','phone','sku','price','discount','channel']);
  _header(_sheet(SHEETS.care),     ['timestamp','date','customer','phone','status','next','source']);
  _header(_sheet(SHEETS.inventory),['sku','name','qty']);
  _header(_sheet(SHEETS.warranty), ['timestamp','serial','customer','phone','purchase','nextService']);
  SpreadsheetApp.getActive().toast('Đã tạo/cập nhật các sheet cần thiết.');
}

function _sheet(name) {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}
function _header(sh, cols) {
  if (sh.getLastRow() === 0) sh.appendRow(cols);
}
function _json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
function _payload(e) {
  let p = {};
  try { if (e.postData && e.postData.contents) p = JSON.parse(e.postData.contents); } catch (_) {}
  Object.keys(e.parameter || {}).forEach(k => { if (k !== 'action') p[k] = e.parameter[k]; });
  return p;
}
function doGet(e)  { return handle(e); }
function doPost(e) { return handle(e); }

function handle(e) {
  const action = (e.parameter && e.parameter.action) ? String(e.parameter.action) : '';
  const data = _payload(e);
  try {
    switch (action) {
      case 'logCare':       return _json({ ok: true, id: logCare(data) });
      case 'getCare':       return _json({ ok: true, data: getCare() });
      case 'createOrder':   return _json({ ok: true, id: createOrder(data) });
      case 'getOrders':     return _json({ ok: true, data: getOrders() });
      case 'stockMove':     return _json({ ok: true, id: stockMove(data) });
      case 'getInventory':  return _json({ ok: true, data: getInventory() });
      case 'regWarranty':   return _json({ ok: true, id: regWarranty(data) });
      case 'getWarranty':   return _json({ ok: true, data: getWarranty() });
      case 'getSummary':    return _json({ ok: true, data: getSummary() });
      default:              return _json({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

/** CSKH */
function logCare(d) {
  const sh = _sheet(SHEETS.care);
  _header(sh, ['timestamp','date','customer','phone','status','next','source']);
  const ts = d.timestamp || new Date().toISOString();
  const row = [ts, Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
               d.customer || d.name || '', d.phone || '', d.status || d.note || '', d.next || '', d.source || ''];
  sh.appendRow(row);
  return sh.getLastRow();
}
function getCare() {
  const sh = _sheet(SHEETS.care);
  const rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1).reverse().map(r => ({ date: r[1], customer: r[2], phone: r[3], status: r[4], next: r[5] }));
}

/** Đơn hàng */
function createOrder(d) {
  const sh = _sheet(SHEETS.orders);
  _header(sh, ['timestamp','date','customer','phone','sku','price','discount','channel']);
  const ts = d.timestamp || new Date().toISOString();
  const price = Number(d.price || 0), discount = Number(d.discount || 0);
  sh.appendRow([ts, Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
                d.customer || '', d.phone || '', d.sku || '', price, discount, d.channel || '']);
  return sh.getLastRow();
}
function getOrders() {
  const sh = _sheet(SHEETS.orders);
  const rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1).reverse().map(r => ({
    date: r[1], customer: r[2], phone: r[3], sku: r[4], price: r[5], channel: r[7]
  }));
}

/** Tồn kho (gộp theo SKU) */
function stockMove(d) {
  const sku = String(d.sku || '').trim();
  if (!sku) throw 'SKU_required';
  const qty = Number(d.qty || 0);
  const sh = _sheet(SHEETS.inventory);
  _header(sh, ['sku','name','qty']);
  const last = sh.getLastRow();
  const rng = last > 1 ? sh.getRange(2,1,last-1,3).getValues() : [];
  let found = false;
  for (let i=0;i<rng.length;i++){
    if (String(rng[i][0]).trim().toUpperCase() == sku.toUpperCase()){
      rng[i][2] = Number(rng[i][2] || 0) + qty;
      found = true;
      break;
    }
  }
  if (!found) rng.push([sku, d.name || '', qty]);
  sh.getRange(2,1, Math.max(1,rng.length), 3).clearContent();
  sh.getRange(2,1, rng.length, 3).setValues(rng);
  return 'OK';
}
function getInventory() {
  const sh = _sheet(SHEETS.inventory);
  const rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1).map(r => ({ sku: r[0], name: r[1], qty: Number(r[2] || 0) }));
}

/** Bảo hành */
function regWarranty(d) {
  const sh = _sheet(SHEETS.warranty);
  _header(sh, ['timestamp','serial','customer','phone','purchase','nextService']);
  const ts = d.timestamp || new Date().toISOString();
  const purchase = d.purchase || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const next = nextServiceDate_(purchase);
  sh.appendRow([ts, d.serial || '', d.customer || '', d.phone || '', purchase, next]);
  return sh.getLastRow();
}
function nextServiceDate_(purchase) {
  try {
    const dt = new Date(purchase);
    dt.setMonth(dt.getMonth()+6);
    return Utilities.formatDate(dt, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  } catch(e){ return ''; }
}
function getWarranty() {
  const sh = _sheet(SHEETS.warranty);
  const rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1).map(r => ({ serial: r[1], customer: r[2], phone: r[3], purchase: r[4], nextService: r[5] }));
}

/** Tổng quan */
function getSummary() {
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const orders = getOrders();
  const revenueToday = orders.filter(o => o.date === today).reduce((s,o)=> s + Number(o.price || 0), 0);
  const last7 = [];
  for (let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    const ds = Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const rev = orders.filter(o => o.date === ds).reduce((s,o)=> s + Number(o.price || 0), 0);
    last7.push({ date: ds, revenue: rev/1000000 });
  }
  return { revenueToday, ordersToday: orders.filter(o=>o.date===today).length, lowStock: 0, last7 };
}
