HƯỚNG DẪN TRIỂN KHAI NHANH

I. APPS SCRIPT (API)
1) Mở Google Sheets (trống) → Extensions (Tiện ích) → Apps Script.
2) Xoá code mặc định → dán nội dung file KLC_API.gs (đính kèm).
3) Deploy → New deployment → Web app:
   - Execute as: Me
   - Who has access: Anyone with the link
   - Copy URL nhận được (API URL).
4) Trở về Google Sheets, menu 'KLC API' → 'Init sheets...' để tạo sheet & header.

II. DASHBOARD
1) Mở klc_internal_dashboard.html → tab Cài đặt → dán API URL → Lưu.
2) Đăng nhập (PIN ≥ 4 ký tự) → test các form.

III. DEPLOY FIREBASE (tuỳ chọn)
- Tải 2 gói:
  * klc_landing_firebase.zip → cho trang bán hàng (public/index.html)
  * klc_dashboard_firebase.zip → cho dashboard nội bộ
- Giải nén → trong thư mục mỗi gói chạy:
   npm i -g firebase-tools
   firebase login
   firebase init hosting  (public = public, SPA = N)
   firebase deploy
