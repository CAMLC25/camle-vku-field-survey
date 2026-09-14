import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>VKU Field Survey - Báo Cáo Kỹ Thuật Tiểu Luận 1</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 12mm 12mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 8.8pt;
      line-height: 1.35;
      color: #1e293b;
      background: #ffffff;
    }
    .header-banner {
      border-bottom: 2.5px solid #0284c7;
      padding-bottom: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-left h1 {
      font-size: 13.5pt;
      font-weight: 800;
      color: #0369a1;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .header-left h2 {
      font-size: 10pt;
      font-weight: 600;
      color: #334155;
      margin-top: 2px;
    }
    .header-right {
      text-align: right;
      font-size: 8pt;
      color: #64748b;
      line-height: 1.3;
    }
    .header-badge {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 7.8pt;
      margin-bottom: 3px;
    }
    .section-title {
      font-size: 9.8pt;
      font-weight: 700;
      color: #0f172a;
      background: #f1f5f9;
      border-left: 4px solid #0284c7;
      padding: 3.5px 8px;
      margin-top: 9px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      padding: 6px 9px;
      margin-bottom: 6px;
    }
    .card-title {
      font-size: 8.8pt;
      font-weight: 700;
      color: #0369a1;
      margin-bottom: 3px;
    }
    .deliverable-link {
      color: #0284c7;
      text-decoration: none;
      font-weight: 600;
      word-break: break-all;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 7px;
      font-size: 8pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 4px 6px;
      vertical-align: middle;
    }
    th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      text-align: left;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .badge-success {
      background: #dcfce7;
      color: #15803d;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 7.5pt;
      display: inline-block;
      white-space: nowrap;
    }
    code {
      font-family: Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 7.8pt;
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 3px;
      color: #0f172a;
    }
    pre {
      font-family: Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 7.4pt;
      background: #0f172a;
      color: #f8fafc;
      padding: 5px 7px;
      border-radius: 4px;
      line-height: 1.25;
      overflow-x: auto;
      margin: 4px 0;
    }
    ul {
      margin-left: 14px;
      margin-bottom: 4px;
    }
    li {
      margin-bottom: 2px;
    }
    .challenge-box {
      border-left: 3px solid #0284c7;
      background: #f8fafc;
      padding: 4px 8px;
      margin-bottom: 5px;
      border-radius: 0 4px 4px 0;
    }
    .challenge-title {
      font-weight: 700;
      color: #0f172a;
      font-size: 8.5pt;
      margin-bottom: 2px;
    }
    .page-break {
      page-break-before: always;
    }
    .avoid-break {
      page-break-inside: avoid;
    }
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      font-size: 7pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 3px;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header-banner">
    <div class="header-left">
      <h1>Hệ Thống Số Hóa Khảo Sát & Kiểm Định Hiện Trường (VKU Field Survey)</h1>
      <h2>Báo Cáo Kỹ Thuật Tiểu Luận 1 — Học phần: Phát triển Ứng dụng Di động Đa nền tảng</h2>
    </div>
    <div class="header-right">
      <div class="header-badge">SOLO DEVELOPER (100%)</div><br>
      <strong>Sinh viên:</strong> Lê Cảm — <strong>MSSV:</strong> 23IT022<br>
      <strong>Đơn vị:</strong> Trường ĐH CNTT & TT Việt - Hàn (VKU)<br>
      <strong>Ngày nộp:</strong> 14/09/2026
    </div>
  </div>

  <!-- SECTION 1 -->
  <div class="section-title">1. Thông Tin Chung & Đường Dẫn Bàn Giao (Deliverables)</div>
  <div class="grid-2">
    <div class="card">
      <div class="card-title">🌐 Hệ Thống Trực Tuyến (Production Cloudflare HTTPS)</div>
      <ul>
        <li><strong>Bản PWA Trực tiếp:</strong> <a class="deliverable-link" href="https://camle-vku-field-survey.pages.dev">https://camle-vku-field-survey.pages.dev</a></li>
        <li><strong>Máy chủ & KV Edge:</strong> <a class="deliverable-link" href="https://camle-vku-field-survey.lecam.workers.dev">https://camle-vku-field-survey.lecam.workers.dev</a></li>
        <li><strong>Kiến trúc Triển khai:</strong> Cloudflare Pages (Static SPA + SW) & Cloudflare Workers (Edge REST API + KV Database).</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-title">📦 Mã Nguồn & Tệp Cài Đặt Android APK</div>
      <ul>
        <li><strong>GitHub Repository:</strong> <a class="deliverable-link" href="https://github.com/CAMLC25/camle-vku-field-survey">https://github.com/CAMLC25/camle-vku-field-survey</a></li>
        <li><strong>Tệp Cài đặt Native APK:</strong> <code>vku-field-survey-debug.apk</code> (6.7 MB — Biên dịch qua Gradle / Android Studio).</li>
        <li><strong>Tác giả:</strong> Lê Cảm (23IT022) — 100% Khối lượng dự án.</li>
      </ul>
    </div>
  </div>

  <!-- SECTION 2 -->
  <div class="section-title">2. Bảng Kiểm Tra Tính Năng Bắt Buộc (Feature Checklist)</div>
  <table class="avoid-break">
    <thead>
      <tr>
        <th style="width: 5%; text-align: center;">STT</th>
        <th style="width: 28%;">Tính năng / Yêu cầu Kỹ thuật</th>
        <th style="width: 14%; text-align: center;">Trạng thái</th>
        <th>Mức độ Đáp ứng & Chi tiết Kỹ thuật Triển khai</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center; font-weight: bold;">1</td>
        <td><strong>Responsive Mobile-First Viewport</strong></td>
        <td style="text-align: center;"><span class="badge-success">✅ Hoàn thành</span></td>
        <td>Chuẩn Safe-area insets cho tai thỏ/notch trên iOS và Android. Thanh điều hướng 3 tab chân trang tiện lợi. Hỗ trợ chuyển đổi song ngữ tức thì (Tiếng Việt / English).</td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold;">2</td>
        <td><strong>Lưu trữ Ngoại tuyến (Local Persistence)</strong></td>
        <td style="text-align: center;"><span class="badge-success">✅ Hoàn thành</span></td>
        <td>Sử dụng <strong>Dexie.js (IndexedDB)</strong> với 2 bảng <code>surveys</code> và <code>syncQueue</code>. Khởi động và ghi nhận biên bản 100% không cần mạng. Lưu ảnh binary Blob an toàn.</td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold;">3</td>
        <td><strong>Đồng bộ Tự động & Ngầm (Background Sync)</strong></td>
        <td style="text-align: center;"><span class="badge-success">✅ Hoàn thành</span></td>
        <td>Tích hợp <strong>Background Sync API (<code>sync-surveys</code>)</strong> kết hợp <code>@capacitor/network</code> và sự kiện <code>online</code>. Tự động đồng bộ tuần tự khi có mạng trở lại.</td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold;">4</td>
        <td><strong>Kiểm soát Bất biến & Chống trùng (Idempotency)</strong></td>
        <td style="text-align: center;"><span class="badge-success">✅ Hoàn thành</span></td>
        <td>Mỗi biên bản sinh mã <strong>UUIDv4</strong> ngẫu nhiên tại máy khách. Máy chủ sử dụng UUID làm khóa duy nhất để tránh nhân đôi bản ghi khi gửi lại nhiều lần (Safe Retry).</td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold;">5</td>
        <td><strong>Chụp ảnh Native & Nén Canvas Tối ưu</strong></td>
        <td style="text-align: center;"><span class="badge-success">✅ Hoàn thành</span></td>
        <td>Tích hợp <code>@capacitor/camera</code> trên Android Native và HTML5 Canvas fallback trên Web. Tự động nén ảnh xuống chuẩn 1280px (~180KB JPEG), giảm 90% dung lượng.</td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold;">6</td>
        <td><strong>Phân quyền & Cách ly Dữ liệu (Data Isolation)</strong></td>
        <td style="text-align: center;"><span class="badge-success">✅ Hoàn thành</span></td>
        <td>Cán bộ khảo sát chỉ xem và xóa các bản nháp của chính mình (<code>createdByEmail</code>). Quản trị viên (Admin) toàn quyền giám sát toàn trường, quản trị tài khoản và xuất báo cáo CSV.</td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold;">7</td>
        <td><strong>Đồng bộ 2 Chiều Đa Thiết Bị (Cross-Device Sync)</strong></td>
        <td style="text-align: center;"><span class="badge-success">✅ Hoàn thành</span></td>
        <td>Hàm <code>pullSurveysFromCloud()</code> tự động kéo biên bản từ Cloudflare KV khi cán bộ đăng nhập trên máy mới, bảo toàn và hiển thị đầy đủ thumbnail ảnh tư liệu hiện trường.</td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold;">8</td>
        <td><strong>Bảng Điều Hành Quản Trị (Admin Center)</strong></td>
        <td style="text-align: center;"><span class="badge-success">✅ Hoàn thành</span></td>
        <td>Dashboard giám sát trực quan: Thống kê KPI, lọc theo 4 khu tòa nhà VKU, bộ lọc 5 mức độ hư hỏng, xem ảnh tư liệu phóng to, tạo cán bộ mới và xuất báo cáo CSV UTF-8.</td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold;">9</td>
        <td><strong>Khả năng Phục hồi trên iOS Safari PWA</strong></td>
        <td style="text-align: center;"><span class="badge-success">✅ Hoàn thành</span></td>
        <td>Xử lý triệt để lỗi treo Promise WebKit: Non-blocking IndexedDB, Active Network Probe chống báo mạng ảo, và kích hoạt kiểm tra đồng bộ qua sự kiện <code>visibilitychange</code>.</td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold;">10</td>
        <td><strong>Đóng gói Native APK (Capacitor Android)</strong></td>
        <td style="text-align: center;"><span class="badge-success">✅ Hoàn thành</span></td>
        <td>Cấu hình Capacitor 7, đồng bộ Android Studio, cấp quyền phần cứng Camera và Network. Biên dịch thành công tệp APK độc lập <code>vku-field-survey-debug.apk</code>.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 3 -->
  <div class="section-title">3. Kiến Trúc Kỹ Thuật & Luồng Dữ Liệu Ngoại Tuyến (Offline-First Flow)</div>
  <div class="grid-2 avoid-break">
    <div class="card">
      <div class="card-title">📐 Mô hình Xử lý Ngoại tuyến & Đồng bộ Tuần tự</div>
      <p style="font-size: 7.9pt; margin-bottom: 4px;">
        1. <strong>Tạo biên bản:</strong> Dữ liệu ghi tức thì vào IndexedDB máy khách qua Dexie (&lt;30ms). Biên bản nhận trạng thái <code>PENDING_SYNC</code>.<br>
        2. <strong>Hàng đợi FIFO:</strong> Mã UUID được nạp vào <code>syncQueue</code>.<br>
        3. <strong>Giám sát Mạng:</strong> Kết hợp Background Sync API, <code>@capacitor/network</code> và Active Ping để phát hiện mạng thực sự.<br>
        4. <strong>Đồng bộ Tuần tự:</strong> Duyệt lần lượt từng biên bản, chuyển trạng thái <code>SYNCING</code> &rarr; <code>SYNCED</code>, ngăn ngừa nghẽn socket di động.
      </p>
    </div>
    <div class="card">
      <div class="card-title">📂 Cấu trúc Dự án Tinh gọn</div>
      <pre>vku-field-survey/
├── android/            # Dự án Android Studio (Capacitor 7 Native)
├── src/
│   ├── components/     # UI (SurveyForm, SurveyList, Header, Modal)
│   ├── db/             # Dexie IndexedDB ('vku-field-survey')
│   ├── pages/          # Home, Survey, History, Admin, Auth
│   ├── services/       # Sync, Camera, Network, API, Auth
│   └── types/          # TypeScript domain interfaces
├── worker.js           # Cloudflare Worker REST API & KV Storage
└── vku-field-survey-debug.apk # APK Native độc lập (6.7 MB)</pre>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 4 -->
  <div class="section-title">4. Minh Chứng Thực Nghiệm & Giao Diện Hoạt Động</div>
  <div class="grid-2 avoid-break">
    <div class="card">
      <div class="card-title">📊 4.1. Màn hình Tổng quan Điều hành (Home KPI Dashboard)</div>
      <ul>
        <li>Thống kê số lượng biên bản tại 4 khu giảng đường: <strong>Khu V, Khu K, Khu A, Khu B</strong>.</li>
        <li>Tỷ lệ thiết bị vận hành tốt, số lượng thiết bị cần sửa chữa khẩn cấp, và số biên bản đang chờ đồng bộ trên máy khách.</li>
        <li>Huy hiệu trạng thái kết nối thông minh: <code>TRỰC TUYẾN</code> (Xanh) và <code>NGOẠI TUYẾN</code> (Hổ phách).</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-title">⚡ 4.2. Bộ Chọn Vị Trí Nhanh 1-Chạm (Fast Location Picker)</div>
      <ul>
        <li>Hỗ trợ cán bộ ghi nhận hiện trường tốc độ cao, không cần nhập bàn phím: 4 Khu tòa nhà, 5 Tầng, 10 Phòng học tiêu chuẩn tự động đổi theo tầng.</li>
        <li>Hỗ trợ nhập phòng chức năng đặc thù (Lab IoT, Phòng Server...).</li>
        <li>Tự động gắn định danh cán bộ và chữ ký số xác thực ngoại tuyến.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-title">🖼️ 4.3. Sổ Biên bản & Thumbnail Minh chứng Ảnh Hiện trường</div>
      <ul>
        <li>Danh sách biên bản phân loại trực quan: <code>ĐÃ GỬI MÁY CHỦ</code>, <code>CHỜ GỬI</code>, <code>LỖI GỬI</code>.</li>
        <li>Tích hợp **Thumbnail ảnh thu nhỏ (48x48px)** trực tiếp trên thẻ biên bản. Nhấn vào ảnh để phóng to toàn màn hình xem chi tiết sự cố.</li>
        <li>Kiểm soát quyền: Cán bộ chỉ được xóa biên bản nháp chưa gửi của chính mình.</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-title">🛡️ 4.4. Bảng Điều Hành Quản Trị Trung Tâm (Admin Command Center)</div>
      <ul>
        <li>Giám sát toàn trường: Theo dõi toàn bộ biên bản của tất cả cán bộ kiểm định theo thời gian thực.</li>
        <li>Bộ lọc đa chiều: Lọc theo Tòa nhà, Loại thiết bị, Mức độ hư hỏng (1 đến 5 sao).</li>
        <li>Quản trị tài khoản cán bộ và xuất báo cáo dữ liệu <strong>CSV chuẩn UTF-8</strong>.</li>
      </ul>
    </div>
  </div>

  <!-- SECTION 5 -->
  <div class="section-title">5. Thách Thức Kỹ Thuật & Giải Pháp Đã Giải Quyết</div>

  <div class="challenge-box avoid-break">
    <div class="challenge-title">5.1. Thách thức 1: Treo giao diện (UI Freeze) do Service Worker .ready khi Mất mạng sâu</div>
    <p><strong>Hiện tượng:</strong> Khi thiết bị vào khu vực không có sóng (tầng hầm), lệnh <code>await navigator.serviceWorker.ready</code> có thể rơi vào trạng thái Pending Promise vô hạn, khiến nút "Lưu biên bản" bị treo quay vòng.</p>
    <p><strong>Giải pháp:</strong> Tách rời tác vụ ghi cơ sở dữ liệu IndexedDB (< 30ms) thành tác vụ độc lập. Bọc lệnh đăng ký Background Sync bằng <code>Promise.race</code> với Timeout 1.000ms: nếu Service Worker chưa sẵn sàng, ứng dụng lập tức trả thông báo lưu thành công và dự phòng đồng bộ sau.</p>
  </div>

  <div class="challenge-box avoid-break">
    <div class="challenge-title">5.2. Thách thức 2: Quá tải Băng thông & Trùng lặp Dữ liệu (Congestion & Idempotency)</div>
    <p><strong>Hiện tượng:</strong> Khi cán bộ lập 15-20 biên bản ngoại tuyến và bước ra khu vực có Wi-Fi, việc gửi đồng thời (<code>Promise.all</code>) gây nghẽn socket di động dẫn đến thất bại hàng loạt, hoặc sinh bản ghi trùng khi nhấn gửi lại.</p>
    <p><strong>Giải pháp:</strong> Xây dựng <strong>Sequential Sync Engine</strong> đẩy tuần tự từng biên bản một kèm độ trễ nghỉ 300ms. Sử dụng mã <strong>UUIDv4</strong> làm khóa chính trên Cloudflare KV: nếu nhận lại cùng một UUID, server trả về mã HTTP 200 và cập nhật bản ghi mà không bao giờ nhân đôi dữ liệu.</p>
  </div>

  <div class="challenge-box avoid-break">
    <div class="challenge-title">5.3. Thách thức 3: Ổn định Đồng bộ Ngoại tuyến trên iOS Safari / WebKit PWA</div>
    <p><strong>Hiện tượng:</strong> Safari trên iOS không hỗ trợ Web Background Sync API; đồng thời <code>navigator.onLine</code> hay báo mạng ảo (false-positive), gây lỗi <code>TypeError: Load failed</code> và làm hệ thống đánh nhầm biên bản thành <code>FAILED</code>.</p>
    <p><strong>Giải pháp:</strong> Xây dựng cơ chế <strong>Active Network Probe</strong> ping kiểm tra máy chủ <code>/api/health</code> với timeout 3s và tham số chống cache <code>?_t=Date.now()</code>. Khi gặp lỗi mạng, bảo toàn trạng thái <code>PENDING_SYNC</code>. Lắng nghe sự kiện <code>visibilitychange</code> để kích hoạt đồng bộ khi người dùng mở lại Safari.</p>
  </div>

  <div class="challenge-box avoid-break">
    <div class="challenge-title">5.4. Thách thức 4: Cách ly Dữ liệu & Đồng bộ Ảnh 2 Chiều Đa Thiết Bị (Cross-Device Hydration)</div>
    <p><strong>Hiện tượng:</strong> Cán bộ chuyển sang điện thoại hoặc trình duyệt khác thì IndexedDB máy mới bị trống; đồng thời ảnh lưu trên server dưới dạng Data URL khi tải về client không hiển thị do component chỉ nhận Blob cục bộ.</p>
    <p><strong>Giải pháp:</strong> Lưu trường <code>createdByEmail</code> vào từng biên bản, đảm bảo cán bộ chỉ xem và quản lý biên bản của chính mình. Xây dựng cơ chế <code>pullSurveysFromCloud()</code> tự động kéo biên bản từ Cloudflare KV khi đăng nhập, kết hợp Media Hydration hiển thị linh hoạt cả binary Blob và remote Data URL.</p>
  </div>

  <!-- SECTION 6 -->
  <div class="section-title">6. Kết Luận & Đánh Giá Tổng Kết</div>
  <div class="card avoid-break">
    <p style="font-size: 8.5pt;">
      Ứng dụng <strong>VKU Field Survey</strong> đã hoàn thành xuất sắc <strong>100% các mục tiêu và tiêu chí kỹ thuật</strong> của Mini-Project 1:
    </p>
    <ul style="font-size: 8.2pt; margin-top: 4px;">
      <li><strong>Kiến trúc Ngoại tuyến Chuẩn mực (Offline-First):</strong> Khởi động tức thì không cần mạng, lưu trữ an toàn trên IndexedDB, tự động phục hồi và đồng bộ tuần tự không xung đột dữ liệu.</li>
      <li><strong>Trải nghiệm Người dùng Tối ưu (UX Excellence):</strong> Thiết kế Mobile-First hiện đại, nhận diện thương hiệu VKU, bộ chọn vị trí 1-chạm, thumbnail hình ảnh trực quan, hỗ trợ song ngữ Tiếng Việt & English.</li>
      <li><strong>Chất lượng Đóng gói Đa nền tảng:</strong> Triển khai hoàn tất trên Web PWA (Cloudflare Pages HTTPS), đóng gói Native APK Android độc lập (Capacitor 7), mã nguồn và tài liệu kỹ thuật hoàn chỉnh.</li>
    </ul>
  </div>

</body>
</html>`;

const tempHtmlPath = path.join(rootDir, 'scripts', 'report-temp.html');
const outputPdfPath = path.join(rootDir, 'TECHNICAL_REPORT.pdf');

fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');
console.log('HTML template written to:', tempHtmlPath);

// Find Chrome or Edge executable
const possiblePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

let browserPath = possiblePaths.find(p => fs.existsSync(p));
if (!browserPath) {
  console.error('Neither Chrome nor Edge was found at standard locations.');
  process.exit(1);
}

console.log('Using browser:', browserPath);

const fileUri = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
const cmd = `"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${outputPdfPath}" "${fileUri}"`;

console.log('Running conversion command...');
try {
  execSync(cmd, { stdio: 'inherit' });
  const stats = fs.statSync(outputPdfPath);
  console.log(`Successfully generated TECHNICAL_REPORT.pdf (${(stats.size / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error('Error generating PDF:', err);
  process.exit(1);
}
