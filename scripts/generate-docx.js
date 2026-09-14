import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'TECHNICAL_REPORT.docx');

const primaryColor = '0369A1';
const secondaryColor = '0284C7';
const darkTextColor = '1E293B';
const mutedTextColor = '64748B';
const lightBg = 'F1F5F9';
const cardBg = 'F8FAFC';
const calloutBg = 'F0F9FF';
const successColor = '15803D';

function makeHeading(title, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: level === HeadingLevel.HEADING_1 ? 24 : 20, // 12pt or 10pt
        color: primaryColor,
        font: 'Segoe UI'
      })
    ]
  });
}

function makeParagraph(runs, options = {}) {
  const children = runs.map(r => {
    if (typeof r === 'string') {
      return new TextRun({ text: r, size: 19, color: darkTextColor, font: 'Segoe UI' });
    }
    return new TextRun({
      text: r.text,
      bold: r.bold || false,
      italics: r.italics || false,
      color: r.color || darkTextColor,
      size: r.size || 19,
      font: 'Segoe UI',
      ...r
    });
  });

  return new Paragraph({
    spacing: { before: options.before || 60, after: options.after || 60, line: 260 },
    alignment: options.alignment || AlignmentType.LEFT,
    children
  });
}

function makeBullet(runs) {
  const children = runs.map(r => {
    if (typeof r === 'string') {
      return new TextRun({ text: r, size: 19, color: darkTextColor, font: 'Segoe UI' });
    }
    return new TextRun({
      text: r.text,
      bold: r.bold || false,
      color: r.color || darkTextColor,
      size: r.size || 19,
      font: 'Segoe UI',
      ...r
    });
  });

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40, line: 250 },
    children
  });
}

function makeCallout(title, bodyLines) {
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: calloutBg },
          margins: { top: 120, bottom: 120, left: 180, right: 180 },
          borders: {
            left: { style: BorderStyle.SINGLE, size: 24, color: secondaryColor },
            top: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE }
          },
          children: [
            new Paragraph({
              spacing: { before: 0, after: 60 },
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 20,
                  color: primaryColor,
                  font: 'Segoe UI'
                })
              ]
            }),
            ...bodyLines.map(line =>
              new Paragraph({
                spacing: { before: 40, after: 40, line: 240 },
                children: [
                  new TextRun({
                    text: line,
                    size: 18,
                    color: darkTextColor,
                    font: 'Segoe UI'
                  })
                ]
              })
            )
          ]
        })
      ]
    })
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
    margins: { top: 100, bottom: 100 }
  });
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Segoe UI',
          color: darkTextColor
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1080, // 0.75 in
            bottom: 1080,
            left: 1080,
            right: 1080
          }
        }
      },
      children: [
        // Title Banner
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({
              text: 'BÁO CÁO KỸ THUẬT TIỂU LUẬN 1 (MINI-PROJECT 1)',
              bold: true,
              size: 28, // 14pt
              color: primaryColor,
              font: 'Segoe UI'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 40 },
          children: [
            new TextRun({
              text: 'Học phần: Phát triển Ứng dụng Di động Đa nền tảng (Cross-Platform Mobile App Development)',
              bold: true,
              size: 21,
              color: darkTextColor,
              font: 'Segoe UI'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({
              text: 'Đề tài: Hệ Thống Số Hóa Khảo Sát & Kiểm Định Hiện Trường Cơ Sở Vật Chất (VKU Field Survey)',
              bold: true,
              size: 20,
              color: secondaryColor,
              font: 'Segoe UI'
            })
          ]
        }),

        // Author meta table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: lightBg },
                  margins: { top: 100, bottom: 100, left: 140, right: 140 },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 12, color: secondaryColor },
                    bottom: { style: BorderStyle.SINGLE, size: 12, color: secondaryColor },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE }
                  },
                  children: [
                    makeParagraph([
                      { text: 'Sinh viên thực hiện: ', bold: true },
                      { text: 'Lê Cảm', bold: true, color: primaryColor },
                      { text: '  |  ' },
                      { text: 'Mã số sinh viên: ', bold: true },
                      { text: '23IT022', bold: true },
                      { text: '  |  ' },
                      { text: 'Đóng góp: ', bold: true },
                      { text: '100% Solo Contribution', bold: true, color: successColor }
                    ], { alignment: AlignmentType.CENTER }),
                    makeParagraph([
                      { text: 'Đơn vị: ' },
                      { text: 'Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)' },
                      { text: '  |  ' },
                      { text: 'Ngày nộp: ' },
                      { text: '14/09/2026' }
                    ], { alignment: AlignmentType.CENTER })
                  ]
                })
              ]
            })
          ]
        }),

        new Paragraph({ spacing: { before: 120, after: 0 }, children: [] }),

        // SECTION 1
        makeHeading('1. THÔNG TIN CHUNG & ĐƯỜNG DẪN BÀN GIAO (DELIVERABLES)'),
        makeBullet([
          { text: 'Bản Demo Trực tiếp (Live Production PWA): ', bold: true },
          { text: 'https://camle-vku-field-survey.pages.dev', color: primaryColor, bold: true }
        ]),
        makeBullet([
          { text: 'Máy chủ Đám mây & Cơ sở dữ liệu KV (Cloudflare Workers): ', bold: true },
          { text: 'https://camle-vku-field-survey.lecam.workers.dev', color: primaryColor, bold: true }
        ]),
        makeBullet([
          { text: 'Kho mã nguồn công khai (GitHub Repository): ', bold: true },
          { text: 'https://github.com/CAMLC25/camle-vku-field-survey', color: primaryColor, bold: true },
          { text: ' (Kèm đầy đủ tài liệu hướng dẫn README.md chi tiết)' }
        ]),
        makeBullet([
          { text: 'Tệp cài đặt Native Android APK độc lập: ', bold: true },
          { text: 'vku-field-survey-debug.apk', bold: true },
          { text: ' (6.7 MB — Biên dịch hoàn tất từ Gradle & Android Studio)' }
        ]),
        makeBullet([
          { text: 'Phạm vi đảm nhiệm: ', bold: true },
          { text: 'Lê Cảm (23IT022) — 100% Khối lượng dự án (Kiến trúc Offline-First, PWA UI, Dexie IndexedDB, Background Sync, Capacitor Android, Cloudflare Backend API).' }
        ]),

        // SECTION 2
        makeHeading('2. BẢNG KIỂM TRA TÍNH NĂNG BẮT BUỘC (FEATURE CHECKLIST)'),
        makeParagraph([
          { text: 'Bảng đánh giá mức độ hoàn thành các yêu cầu cốt lõi theo đề cương Mini-Project 1:' }
        ]),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Table Header
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  width: { size: 6, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: primaryColor },
                  margins: { top: 80, bottom: 80, left: 80, right: 80 },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'STT', bold: true, color: 'FFFFFF', size: 18 })] })]
                }),
                new TableCell({
                  width: { size: 28, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: primaryColor },
                  margins: { top: 80, bottom: 80, left: 80, right: 80 },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Tính năng / Yêu cầu Kỹ thuật', bold: true, color: 'FFFFFF', size: 18 })] })]
                }),
                new TableCell({
                  width: { size: 16, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: primaryColor },
                  margins: { top: 80, bottom: 80, left: 80, right: 80 },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Trạng thái', bold: true, color: 'FFFFFF', size: 18 })] })]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: primaryColor },
                  margins: { top: 80, bottom: 80, left: 80, right: 80 },
                  children: [new Paragraph({ children: [new TextRun({ text: 'Mức độ Đáp ứng & Chi tiết Kỹ thuật Triển khai', bold: true, color: 'FFFFFF', size: 18 })] })]
                })
              ]
            }),
            // Row 1
            new TableRow({
              children: [
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '1', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Responsive Mobile-First Viewport', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '✅ Hoàn thành', bold: true, color: successColor, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Chuẩn Safe-area insets cho tai thỏ/notch trên iOS và Android. Thanh điều hướng 3 tab chân trang tiện lợi. Hỗ trợ song ngữ tức thì (Tiếng Việt / English).', size: 18 })] })] })
              ]
            }),
            // Row 2
            new TableRow({
              children: [
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '2', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Lưu trữ Ngoại tuyến Cục bộ (Local Persistence)', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '✅ Hoàn thành', bold: true, color: successColor, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Sử dụng Dexie.js (IndexedDB) quản lý 2 bảng surveys và syncQueue. Khởi động và ghi nhận 100% không cần mạng. Lưu ảnh binary Blob an toàn.', size: 18 })] })] })
              ]
            }),
            // Row 3
            new TableRow({
              children: [
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '3', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Đồng bộ Tự động & Ngầm (Background Sync)', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '✅ Hoàn thành', bold: true, color: successColor, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Tích hợp Background Sync API (sync-surveys) kết hợp @capacitor/network và sự kiện online. Tự động đồng bộ tuần tự khi có mạng trở lại.', size: 18 })] })] })
              ]
            }),
            // Row 4
            new TableRow({
              children: [
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '4', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Kiểm soát Bất biến & Chống trùng (Idempotency)', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '✅ Hoàn thành', bold: true, color: successColor, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Mỗi biên bản sinh mã UUIDv4 ngẫu nhiên tại máy khách. Máy chủ sử dụng UUID làm khóa duy nhất để tránh nhân đôi bản ghi khi gửi lại (Safe Retry).', size: 18 })] })] })
              ]
            }),
            // Row 5
            new TableRow({
              children: [
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '5', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Chụp ảnh Native & Nén Canvas Tối ưu', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '✅ Hoàn thành', bold: true, color: successColor, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Tích hợp @capacitor/camera trên Android Native và HTML5 Canvas fallback trên Web. Tự động nén ảnh xuống chuẩn 1280px (~180KB), giảm 90% dung lượng.', size: 18 })] })] })
              ]
            }),
            // Row 6
            new TableRow({
              children: [
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '6', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Phân quyền & Cách ly Dữ liệu (Data Isolation)', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '✅ Hoàn thành', bold: true, color: successColor, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Cán bộ khảo sát chỉ xem và xóa các bản nháp của chính mình (createdByEmail). Quản trị viên (Admin) toàn quyền giám sát toàn trường, quản trị tài khoản và xuất CSV.', size: 18 })] })] })
              ]
            }),
            // Row 7
            new TableRow({
              children: [
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '7', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Đồng bộ 2 Chiều Đa Thiết Bị (Cross-Device Sync)', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '✅ Hoàn thành', bold: true, color: successColor, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Hàm pullSurveysFromCloud() tự động kéo biên bản từ Cloudflare KV khi đăng nhập trên máy mới, bảo toàn và hiển thị đầy đủ thumbnail ảnh tư liệu hiện trường.', size: 18 })] })] })
              ]
            }),
            // Row 8
            new TableRow({
              children: [
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '8', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Bảng Điều Hành Quản Trị (Admin Center)', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '✅ Hoàn thành', bold: true, color: successColor, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Dashboard giám sát trực quan: Thống kê KPI, lọc theo 4 khu tòa nhà VKU, bộ lọc 5 mức độ hư hỏng, xem ảnh tư liệu phóng to, tạo cán bộ mới và xuất CSV UTF-8.', size: 18 })] })] })
              ]
            }),
            // Row 9
            new TableRow({
              children: [
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '9', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Khả năng Phục hồi trên iOS Safari PWA', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '✅ Hoàn thành', bold: true, color: successColor, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Xử lý triệt để lỗi treo Promise WebKit: Non-blocking IndexedDB, Active Network Probe chống báo mạng ảo, và kích hoạt kiểm tra đồng bộ qua visibilitychange.', size: 18 })] })] })
              ]
            }),
            // Row 10
            new TableRow({
              children: [
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '10', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Đóng gói Native APK (Capacitor Android)', bold: true, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '✅ Hoàn thành', bold: true, color: successColor, size: 18 })] })] }),
                new TableCell({ margins: { top: 60, bottom: 60, left: 60, right: 60 }, children: [new Paragraph({ children: [new TextRun({ text: 'Cấu hình Capacitor 7, đồng bộ Android Studio, cấp quyền phần cứng Camera và Network. Biên dịch thành công tệp APK độc lập vku-field-survey-debug.apk.', size: 18 })] })] })
              ]
            })
          ]
        }),

        // SECTION 3
        makeHeading('3. KIẾN TRÚC KỸ THUẬT & CƠ CẤU DỰ ÁN'),
        makeParagraph([
          { text: '3.1. Luồng Xử lý Ngoại tuyến Chuẩn mực (Strict Offline-First Flow):', bold: true }
        ]),
        makeBullet([
          { text: 'Bước 1 (Ghi nhận tức thì): ', bold: true },
          { text: 'Cán bộ lập biên bản, ảnh nén tự động qua HTML5 Canvas. Dữ liệu ghi vào Dexie IndexedDB (<30ms) với trạng thái PENDING_SYNC. Ứng dụng không bao giờ bị chặn hay phụ thuộc vào mạng.' }
        ]),
        makeBullet([
          { text: 'Bước 2 (Xếp hàng đợi FIFO): ', bold: true },
          { text: 'Mã định danh UUIDv4 của biên bản được nạp vào bảng syncQueue, bảo đảm thứ tự trước sau khi truyền tải.' }
        ]),
        makeBullet([
          { text: 'Bước 3 (Giám sát Mạng Đa tầng): ', bold: true },
          { text: 'Kết hợp Background Sync API (sync-surveys), @capacitor/network, sự kiện online và Active Network Probe ping kiểm tra thực tế máy chủ trung tâm.' }
        ]),
        makeBullet([
          { text: 'Bước 4 (Đồng bộ Tuần tự & Idempotent): ', bold: true },
          { text: 'Sequential Sync Engine duyệt từng biên bản, đẩy lên REST API Cloudflare Workers và lưu vĩnh viễn vào Cloudflare KV. Máy chủ dùng UUID chống trùng lặp tuyệt đối.' }
        ]),

        makeParagraph([
          { text: '3.2. Cấu trúc Thư mục Dự án:', bold: true }
        ]),
        new Paragraph({
          children: [
            new TextRun({
              text: `vku-field-survey/
├── android/                   # Dự án Native Android đóng gói Capacitor (Gradle)
├── functions/api/surveys.js   # Cloudflare Pages Function Proxy
├── public/                    # Tài nguyên tĩnh PWA (Manifest, Icons 192/512px)
├── src/
│   ├── components/            # UI components (SurveyForm, SurveyList, Header...)
│   ├── db/                    # Dexie IndexedDB setup ('vku-field-survey') & syncQueue
│   ├── pages/                 # Home, Survey, History, Admin Dashboard, Auth
│   ├── services/              # Sync, Camera, Network, API, Auth
│   └── types/                 # TypeScript domain interfaces
├── worker.js                  # Cloudflare Edge Worker API & KV Storage
├── TECHNICAL_REPORT.md        # Bản báo cáo kỹ thuật Markdown
├── TECHNICAL_REPORT.pdf       # Bản báo cáo kỹ thuật PDF (3 trang A4)
└── vku-field-survey-debug.apk # Tệp APK Android hoàn chỉnh (6.7 MB)`,
              font: 'Consolas',
              size: 16
            })
          ]
        }),

        // SECTION 4
        makeHeading('4. MINH CHỨNG THỰC NGHIỆM & GIAO DIỆN HOẠT ĐỘNG'),
        makeParagraph([
          { text: '4.1. Màn hình Tổng quan Điều hành (Home KPI Dashboard): ', bold: true },
          { text: 'Tổng hợp trực quan số lượng biên bản tại 4 khu giảng đường VKU (Khu V, Khu K, Khu A, Khu B), hiển thị tỷ lệ thiết bị vận hành tốt, số lượng sự cố cần sửa chữa và số biên bản đang chờ đồng bộ. Huy hiệu trạng thái mạng hiển thị động TRỰC TUYẾN (Xanh) hoặc NGOẠI TUYẾN (Hổ phách).' }
        ]),
        makeParagraph([
          { text: '4.2. Bộ Chọn Vị Trí Nhanh 1-Chạm (Fast Location Picker): ', bold: true },
          { text: 'Hỗ trợ cán bộ ghi nhận hiện trường tốc độ cao, không cần gõ phím: 4 Khu tòa nhà, 5 Tầng học, 10 Phòng học tiêu chuẩn tự động cập nhật theo tầng. Có tùy chọn nhập phòng đặc thù (Lab IoT, Phòng Server...).' }
        ]),
        makeParagraph([
          { text: '4.3. Sổ Biên bản Khảo sát & Thumbnail Minh chứng Ảnh: ', bold: true },
          { text: 'Danh sách hồ sơ phân loại rõ ràng: ĐÃ GỬI MÁY CHỦ, CHỜ GỬI, LỖI GỬI. Mỗi thẻ biên bản gắn Thumbnail ảnh thu nhỏ (48x48px). Nhấn vào ảnh để mở cửa sổ phóng to toàn màn hình. Cán bộ chỉ được xóa các bản nháp chưa gửi của chính mình.' }
        ]),
        makeParagraph([
          { text: '4.4. Bảng Điều Hành Quản Trị Trung Tâm (Admin Command Center): ', bold: true },
          { text: 'Dành riêng cho Ban Quản trị Cơ sở vật chất: Giám sát toàn trường theo thời gian thực, lọc linh hoạt theo Tòa nhà / Phân loại / Mức độ hư hỏng (1 đến 5 sao), cấp tài khoản cán bộ mới và xuất báo cáo CSV UTF-8.' }
        ]),

        // SECTION 5
        makeHeading('5. THÁCH THỨC KỸ THUẬT & GIẢI PHÁP ĐÃ GIẢI QUYẾT'),
        makeCallout(
          '5.1. Thách thức 1: Treo giao diện (UI Freeze) do Service Worker .ready khi Mất mạng sâu',
          [
            'Hiện tượng: Khi thiết bị ở trong hầm kín hoặc chế độ máy bay, lệnh await navigator.serviceWorker.ready trong WebKit/Chromium có thể bị treo vô hạn (Pending Promise), khiến nút "Lưu biên bản" quay mãi không dứt.',
            'Giải pháp: Tách rời hoàn toàn tác vụ ghi Dexie IndexedDB (<30ms). Bọc lệnh đăng ký Background Sync bằng Promise.race với Timeout 1.000ms: nếu Service Worker chưa phản hồi trong 1s, ứng dụng vẫn lập tức trả thông báo lưu thành công và dự phòng đồng bộ sau.'
          ]
        ),
        new Paragraph({ spacing: { before: 40, after: 40 }, children: [] }),
        makeCallout(
          '5.2. Thách thức 2: Quá tải Băng thông & Trùng lặp Dữ liệu (Congestion & Idempotency)',
          [
            'Hiện tượng: Cán bộ lập 15-20 biên bản ngoại tuyến và bước ra khu vực có Wi-Fi, việc gửi đồng thời (Promise.all) gây nghẽn socket di động dẫn đến thất bại hàng loạt, hoặc sinh bản ghi trùng khi người dùng bấm gửi lại.',
            'Giải pháp: Xây dựng Sequential Sync Engine đẩy tuần tự từng biên bản kèm độ trễ 300ms. Sử dụng mã UUIDv4 làm khóa chính trên Cloudflare KV: nếu nhận lại cùng một UUID, server trả về mã HTTP 200 và cập nhật bản ghi mà không bao giờ nhân đôi dữ liệu.'
          ]
        ),
        new Paragraph({ spacing: { before: 40, after: 40 }, children: [] }),
        makeCallout(
          '5.3. Thách thức 3: Ổn định Đồng bộ Ngoại tuyến trên iOS Safari / WebKit PWA',
          [
            'Hiện tượng: Safari trên iOS không hỗ trợ Web Background Sync API; đồng thời navigator.onLine hay báo mạng ảo (false-positive), gây lỗi TypeError: Load failed và làm hệ thống đánh nhầm biên bản thành FAILED.',
            'Giải pháp: Xây dựng cơ chế Active Network Probe ping kiểm tra máy chủ /api/health với timeout 3s và tham số chống cache ?_t=Date.now(). Khi gặp lỗi mạng, bảo toàn trạng thái PENDING_SYNC. Lắng nghe sự kiện visibilitychange và pageshow để kích hoạt đồng bộ khi người dùng mở lại Safari.'
          ]
        ),
        new Paragraph({ spacing: { before: 40, after: 40 }, children: [] }),
        makeCallout(
          '5.4. Thách thức 4: Cách ly Dữ liệu & Đồng bộ Ảnh 2 Chiều Đa Thiết Bị (Cross-Device Hydration)',
          [
            'Hiện tượng: Cán bộ chuyển sang điện thoại hoặc trình duyệt khác thì IndexedDB máy mới bị trống; đồng thời ảnh lưu trên server dưới dạng Data URL khi tải về client không hiển thị do component chỉ nhận Blob cục bộ.',
            'Giải pháp: Lưu trường createdByEmail vào từng biên bản, đảm bảo cán bộ chỉ xem và quản lý biên bản của chính mình. Xây dựng hàm pullSurveysFromCloud() tự động kéo biên bản từ Cloudflare KV khi đăng nhập, kết hợp Media Hydration hiển thị linh hoạt cả binary Blob và remote Data URL.'
          ]
        ),

        // SECTION 6
        makeHeading('6. KẾT LUẬN & ĐÁNH GIÁ TỔNG KẾT'),
        makeParagraph([
          { text: 'Ứng dụng VKU Field Survey đã hoàn thành xuất sắc ', bold: false },
          { text: '100% các mục tiêu và tiêu chí kỹ thuật', bold: true },
          { text: ' đề ra của Mini-Project 1:' }
        ]),
        makeBullet([
          { text: 'Kiến trúc Ngoại tuyến Chuẩn mực (Strict Offline-First): ', bold: true },
          { text: 'Khởi động tức thì không cần mạng, lưu trữ an toàn trên IndexedDB, tự động phục hồi và đồng bộ tuần tự không xung đột dữ liệu.' }
        ]),
        makeBullet([
          { text: 'Trải nghiệm Người dùng Tối ưu (UX Excellence): ', bold: true },
          { text: 'Thiết kế Mobile-First hiện đại, nhận diện thương hiệu VKU, bộ chọn vị trí 1-chạm, thumbnail hình ảnh trực quan, hỗ trợ song ngữ Tiếng Việt & English.' }
        ]),
        makeBullet([
          { text: 'Chất lượng Đóng gói Đa nền tảng: ', bold: true },
          { text: 'Triển khai hoàn tất trên Web PWA (Cloudflare Pages HTTPS), đóng gói Native APK Android độc lập (Capacitor 7), mã nguồn và tài liệu kỹ thuật hoàn chỉnh.' }
        ])
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  const stats = fs.statSync(outputPath);
  console.log(`Successfully generated TECHNICAL_REPORT.docx (${(stats.size / 1024).toFixed(1)} KB)`);
});
