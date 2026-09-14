import React, { createContext, useContext, useState } from 'react';

export type Language = 'vi' | 'en';

export const translations = {
  vi: {
    // App Header
    appName: 'VKU Field Survey',
    appSubtitle: 'Hệ thống Quản lý Khảo sát Cơ sở vật chất',
    diagnostics: 'Bảng thông tin kỹ thuật',

    // Bottom Nav
    navHome: 'Tổng quan',
    navNewSurvey: 'Lập biên bản',
    navHistory: 'Sổ biên bản',

    // Network & Sync Status
    online: 'TRỰC TUYẾN',
    offline: 'NGOẠI TUYẾN',
    syncing: 'ĐANG ĐỒNG BỘ...',
    synced: 'ĐÃ ĐỒNG BỘ',
    syncError: 'LỖI ĐỒNG BỘ',
    offlineSubtitle: 'Chế độ lưu trữ an toàn trên thiết bị',
    pendingSurveysToSync: '{count} biên bản chờ đồng bộ',
    syncingSubtitle: 'Đang truyền {count} biên bản về máy chủ VKU...',
    syncErrorSubtitle: 'Chưa có kết nối mạng. Dữ liệu được lưu trữ an toàn trên máy.',
    allSyncedSubtitle: 'Đã đồng bộ toàn bộ dữ liệu với máy chủ',
    onlineSubtitle: 'Kết nối máy chủ trường VKU ổn định',
    localQueueLabel: 'Hàng đợi gửi:',
    localQueueCount: '{count} biên bản',
    loadingData: 'Đang tải dữ liệu...',

    // Home Page
    heroBadge: 'HỆ THỐNG QUẢN LÝ CƠ SỞ VẬT CHẤT VKU',
    heroTitle: 'Khảo sát & Kiểm định Hiện trường',
    heroDesc: 'Quản lý hiện trạng kỹ thuật, ghi nhận hư hỏng trang thiết bị phòng học, giảng đường và phòng thí nghiệm tại VKU.',
    btnCreateInspection: 'Lập biên bản mới',
    btnViewHistory: 'Xem danh sách biên bản',
    newSurveyTitle: 'Lập biên bản khảo sát',
    newSurveyDesc: 'Ghi nhận hiện trạng, thông số phòng & ảnh tư liệu',
    startNow: 'Bắt đầu',
    historyTitle: 'Hồ sơ khảo sát',
    historyDesc: 'Theo dõi tiến trình xử lý & trạng thái đồng bộ',
    viewList: 'Xem tất cả',
    demoGuideTitle: 'Quy trình khảo sát hiện trường & Lưu trữ ngoại tuyến',
    demoStep1: 'Chế độ ngoại tuyến: Có thể làm việc bình thường ngay cả khi không có Wi-Fi hoặc 4G.',
    demoStep2: 'Ghi nhận hiện trạng: Chọn tòa nhà, phòng học, phân loại thiết bị, đánh giá tình trạng và chụp ảnh.',
    demoStep3: 'Lưu an toàn trên máy: Biên bản cùng ảnh nén được lưu ngay vào bộ nhớ máy (CHỜ ĐỒNG BỘ).',
    demoStep4: 'Tự động gửi khi có mạng: Khi thiết bị kết nối mạng trở lại, hệ thống tự động truyền dữ liệu về máy chủ.',
    demoStep5: 'Đảm bảo toàn vẹn dữ liệu: Mã định danh duy nhất chống trùng lặp dữ liệu trên hệ thống.',

    // Business KPI & Dashboard
    kpiTotalInspections: 'Tổng biên bản',
    kpiGoodCondition: 'Hoạt động tốt',
    kpiDefectAlert: 'Cần sửa chữa / Sự cố',
    kpiPendingSync: 'Chờ gửi máy chủ',
    recentSurveysTitle: 'Biên bản khảo sát gần đây',
    recentSurveysSubtitle: 'Ghi nhận thực tế từ các khu giảng đường VKU',
    noRecentSurveys: 'Chưa có biên bản khảo sát nào',
    noRecentSurveysSub: 'Nhấn "Lập biên bản mới" để bắt đầu ghi nhận hiện trường cơ sở vật chất.',
    campusZonesTitle: 'Khu vực khảo sát trọng điểm',
    zoneKDesc: 'Khu Kỹ thuật & Thực hành CNTT',
    zoneVDesc: 'Khu Nhà Hiệu bộ & Giảng đường Việt - Hàn',
    zoneADesc: 'Khu Giảng đường Trung tâm A',
    zoneBDesc: 'Khu Thí nghiệm & Nghiên cứu B',
    bannerOfflineNotice: 'Thiết bị đang ngoại tuyến. Dữ liệu sẽ lưu trên máy và tự động đồng bộ khi có kết nối mạng.',
    bannerSyncingNotice: 'Đang gửi {count} biên bản về máy chủ VKU...',

    // Sync Status Card
    queueTitle: 'Trạng thái đồng bộ dữ liệu',
    allSurveysUpToDate: 'Dữ liệu đã được đồng bộ đầy đủ',
    pendingCountSubtitle: '{count} biên bản đang chờ chuyển về máy chủ',
    btnSyncNow: 'Gửi dữ liệu ngay',
    btnSyncing: 'Đang gửi...',
    statPending: 'Chờ gửi',
    statSynced: 'Đã gửi',
    statFailed: 'Cần gửi lại',
    lastSyncLabel: 'Đồng bộ lần cuối:',
    neverSynced: 'Chưa có',

    // Form
    stepIndicator: 'Phiếu khảo sát',
    formHeaderTitle: 'Biên bản Khảo sát Cơ sở vật chất',
    formHeaderSubtitle: 'Ghi nhận hiện trạng tài sản, trang thiết bị phòng học khuôn viên VKU',
    fieldBuilding: 'Khu vực / Tòa nhà',
    buildingPlaceholder: 'VD: Khu V, Khu K, Khu A, Khu B...',
    fieldFloor: 'Tầng (Tầng 1 - Tầng 5)',
    floorPlaceholder: 'Chọn tầng...',
    fieldRoom: 'Phòng học / Vị trí',
    roomPlaceholder: 'VD: V.101, K.204, A.302...',
    customRoomOption: 'Tự nhập khác',
    quickSelectRoom: 'Danh sách phòng học',
    fieldCategory: 'Hạng mục trang thiết bị',
    fieldCondition: 'Đánh giá hiện trạng',
    conditionScale: 'Mức độ từ 1 (Hỏng nặng) đến 5 (Rất tốt)',
    fieldDefectNotes: 'Mô tả sự cố / Hiện trạng hư hỏng',
    optionalLabel: '(Tùy chọn)',
    notesPlaceholder: 'Mô tả chi tiết: máy chiếu không nhận tín hiệu, điều hòa chảy nước, bàn ghế gãy hỏng, đèn chập chờn...',
    fieldPhoto: 'Ảnh chụp hiện trường',
    photoStoredLocally: 'Tự động nén tối ưu & lưu an toàn trên máy',
    btnSaveSurvey: 'Lưu biên bản khảo sát',
    btnSaving: 'Đang lưu biên bản vào thiết bị...',
    surveySavedSuccess: 'Đã lưu thành công biên bản #{id} vào thiết bị!',
    surveySavedNotice: 'Biên bản được lưu tạm trên máy và sẽ tự động gửi về máy chủ khi có mạng.',
    validationBuildingRequired: 'Vui lòng chọn khu vực / tòa nhà',
    validationFloorRequired: 'Vui lòng chọn tầng',
    validationRoomRequired: 'Vui lòng chọn hoặc nhập số phòng kiểm tra',
    validationCategoryRequired: 'Vui lòng chọn hạng mục trang thiết bị',
    validationConditionRequired: 'Vui lòng đánh giá tình trạng từ 1 đến 5 sao',

    // Categories
    catHardware: 'Máy tính & Thiết bị CNTT',
    catProjector: 'Máy chiếu & Âm thanh',
    catAC: 'Điều hòa & Quạt mát',
    catElectrical: 'Hệ thống Điện & Chiếu sáng',
    catFurniture: 'Bàn ghế & Nội thất phòng',

    // Rating labels
    rating1Title: '1 - Hỏng nặng (Dừng sử dụng)',
    rating1Desc: 'Hư hỏng nghiêm trọng, mất an toàn hoặc không thể sử dụng',
    rating2Title: '2 - Kém (Cần sửa chữa)',
    rating2Desc: 'Hoạt động không ổn định, xuống cấp cần sửa chữa bảo trì',
    rating3Title: '3 - Bình thường',
    rating3Desc: 'Vận hành ổn định, hao mòn tự nhiên theo thời gian',
    rating4Title: '4 - Tốt',
    rating4Desc: 'Trang thiết bị hoạt động tốt, đáp ứng tốt việc học tập & giảng dạy',
    rating5Title: '5 - Rất tốt / Mới',
    rating5Desc: 'Trang thiết bị mới hoặc duy trì ở tình trạng hoàn hảo',

    // Photo Capture
    takePhotoOrChoose: 'Chụp ảnh hiện trường hoặc tải ảnh từ máy',
    photoCompressedNotice: 'Ảnh được tự động nén tối ưu (JPEG 1280px) giúp lưu và gửi nhanh chóng',
    accessingCamera: 'Đang mở máy ảnh & xử lý ảnh...',
    compressedBadge: '{size} KB (Đã tối ưu)',
    removePhoto: 'Xóa ảnh này',

    // History & List
    searchPlaceholder: 'Tìm theo tòa nhà, số phòng, hạng mục, mô tả sự cố...',
    filterAll: 'Tất cả ({count})',
    filterPending: 'Chờ gửi ({count})',
    filterSynced: 'Đã gửi ({count})',
    filterFailed: 'Lỗi gửi ({count})',
    emptyHistoryTitle: 'Không có biên bản nào phù hợp',
    emptyHistorySubtitle: 'Khởi tạo biên bản khảo sát mới hoặc điều chỉnh từ khóa tìm kiếm.',
    badgePendingSync: 'CHỜ GỬI',
    badgeSyncing: 'ĐANG GỬI',
    badgeSynced: 'ĐÃ GỬI MÁY CHỦ',
    badgeFailed: 'LỖI GỬI',
    btnRetry: 'Gửi lại',
    btnDelete: 'Xóa',
    confirmDelete: 'Xác nhận xóa biên bản khảo sát này khỏi bộ nhớ máy?',
    viewPhoto: 'Ảnh hiện trường',
    closePreview: 'Đóng xem ảnh',
    syncErrorPrefix: 'Thông báo lỗi:',
    attemptsCount: '({count} lần thử)',
    btnSyncAll: 'Gửi tất cả',
    btnNew: 'Lập biên bản',
    btnBack: 'Quay lại',

    // Diagnostics Drawer
    diagTitle: 'Bảng chẩn đoán & Trạng thái Runtime',
    diagIdbTitle: 'Cơ sở dữ liệu cục bộ: \'vku-field-survey\'',
    totalSurveys: 'Tổng số bản ghi:',
    pendingSync: 'Chờ đồng bộ:',
    syncedSurveys: 'Đã chuyển thành công:',
    failedSurveys: 'Truyền tải thất bại:',
    runtimeState: 'Trạng thái kiến trúc phần mềm',
    netStatusLabel: 'Trạng thái mạng:',
    swSupport: 'Service Worker (Cache-First):',
    bgSyncSupport: 'Background Sync Engine:',
    swActive: 'Kích hoạt (Khởi động Offline 100%)',
    swNotSupported: 'Không khả dụng',
    bgSyncSupported: 'Khả dụng (Tag: "sync-surveys")',
    bgSyncFallback: 'Dự phòng (Online-Event Listener)',
    btnSeedSample: 'Chèn biên bản mẫu (Thử nghiệm lưu trữ)',
    btnTestBgSync: 'Kích hoạt Background Sync (\'sync-surveys\')',
    btnTriggerSyncNow: 'Thực thi đồng bộ tuần tự',
    seedSuccess: 'Đã khởi tạo thành công bản ghi mẫu #{id} trong cơ sở dữ liệu!',
    bgSyncSuccess: 'Đã đăng ký thành công Background Sync tag: "sync-surveys"',
    bgSyncFail: 'Trình duyệt chuyển sang cơ chế giám sát mạng Online Event Fallback'
  },
  en: {
    // App Header
    appName: 'VKU Field Survey',
    appSubtitle: 'Campus Asset Inspection System',
    diagnostics: 'Runtime Diagnostics',

    // Bottom Nav
    navHome: 'Dashboard',
    navNewSurvey: 'New Audit',
    navHistory: 'Records',

    // Network & Sync Status
    online: 'ONLINE',
    offline: 'OFFLINE',
    syncing: 'SYNCING...',
    synced: 'SYNCED',
    syncError: 'SYNC ERROR',
    offlineSubtitle: 'Operating in standalone local-storage mode',
    pendingSurveysToSync: '{count} record(s) queued for upload',
    syncingSubtitle: 'Sequentially dispatching {count} record(s)...',
    syncErrorSubtitle: 'Network unreachable. Records safely queued.',
    allSyncedSubtitle: 'Synchronized with primary backend server',
    onlineSubtitle: 'Connected to VKU Infrastructure',
    localQueueLabel: 'Sync Queue:',
    localQueueCount: '{count} record(s)',
    loadingData: 'Loading local records...',

    // Home Page
    heroBadge: 'VKU FACILITY MANAGEMENT SYSTEM',
    heroTitle: 'Campus Facility Inspection',
    heroDesc: 'Inspect and manage technical conditions, classroom assets, and IT laboratory equipment across VKU campus.',
    btnCreateInspection: 'Start Inspection',
    btnViewHistory: 'View Records',
    newSurveyTitle: 'New Field Audit',
    newSurveyDesc: 'Record room state, defect logs & photographic evidence',
    startNow: 'Start',
    historyTitle: 'Audit Records',
    historyDesc: 'Track dispatch queues & server sync logs',
    viewList: 'View all',
    demoGuideTitle: 'Field Inspection Workflow & Offline Persistence',
    demoStep1: 'Offline Capability: Conduct audits seamlessly without Wi-Fi or cellular network.',
    demoStep2: 'Field Data Capture: Select building, room, classify equipment, assess conditions and snap photo.',
    demoStep3: 'Safe Local Storage: Record and compressed photo are immediately committed locally (QUEUED).',
    demoStep4: 'Auto Sync Online: Once connectivity is restored, records automatically dispatch to the server.',
    demoStep5: 'Data Integrity: Unique UUID guarantees no duplicate records on the central database.',

    // Business KPI & Dashboard
    kpiTotalInspections: 'Total Audits',
    kpiGoodCondition: 'Operational',
    kpiDefectAlert: 'Defects / Repairs',
    kpiPendingSync: 'Local Queue',
    recentSurveysTitle: 'Recent Inspections',
    recentSurveysSubtitle: 'Live updates from campus facilities',
    noRecentSurveys: 'No inspection records yet',
    noRecentSurveysSub: 'Tap "Start Inspection" to begin your first audit.',
    campusZonesTitle: 'Priority Inspection Zones',
    zoneKDesc: 'IT Engineering & Practice Labs',
    zoneVDesc: 'Korea-Vietnam Administration & Complex',
    zoneADesc: 'Central Lecture Halls',
    zoneBDesc: 'Research & Advanced Laboratories',
    bannerOfflineNotice: 'You are working offline. Inspections are saved securely on device and will auto-sync when online.',
    bannerSyncingNotice: 'Syncing {count} record(s) to VKU backend server...',

    // Sync Status Card
    queueTitle: 'Data Synchronization Pipeline',
    allSurveysUpToDate: 'All records synchronized',
    pendingCountSubtitle: '{count} record(s) queued for dispatch',
    btnSyncNow: 'Sync Now',
    btnSyncing: 'Dispatching...',
    statPending: 'Queued',
    statSynced: 'Verified',
    statFailed: 'Requires Action',
    lastSyncLabel: 'Last updated:',
    neverSynced: 'None',

    // Form
    stepIndicator: 'Inspection Form',
    formHeaderTitle: 'Technical Asset Audit',
    formHeaderSubtitle: 'Facility defect and maintenance log for VKU campus',
    fieldBuilding: 'Facility / Building',
    buildingPlaceholder: 'e.g. Building V, Building K, Building A...',
    fieldFloor: 'Floor Level (Floor 1 - 5)',
    floorPlaceholder: 'Select floor...',
    fieldRoom: 'Room / Facility Location',
    roomPlaceholder: 'e.g. V.101, K.204, A.302...',
    customRoomOption: 'Custom / Other',
    quickSelectRoom: 'Floor Room Directory',
    fieldCategory: 'Asset Classification',
    fieldCondition: 'Condition Assessment',
    conditionScale: 'Rating scale from 1 (Critical) to 5 (Optimal)',
    fieldDefectNotes: 'Defect & Damage Description',
    optionalLabel: '(Optional)',
    notesPlaceholder: 'Describe defect: projector signal failure, loose structural arm, AC refrigerant leak...',
    fieldPhoto: 'Photographic Evidence',
    photoStoredLocally: 'Optimized & secured locally on device',
    btnSaveSurvey: 'Save Inspection Record',
    btnSaving: 'Writing record to local storage...',
    surveySavedSuccess: 'Record #{id} committed to local storage!',
    surveySavedNotice: 'Marked as QUEUED. Will be sequentially dispatched when network connection resumes.',
    validationBuildingRequired: 'Please identify facility / building',
    validationFloorRequired: 'Please identify floor level',
    validationRoomRequired: 'Please enter room or location identifier',
    validationCategoryRequired: 'Please select asset classification',
    validationConditionRequired: 'Condition rating must be between 1 and 5',

    // Categories
    catHardware: 'IT Hardware / PC',
    catProjector: 'AV / Projector',
    catAC: 'HVAC / Climate',
    catElectrical: 'Electrical Infrastructure',
    catFurniture: 'Facility Furniture',

    // Rating labels
    rating1Title: '1 - Critical Failure',
    rating1Desc: 'Severe defect, immediate shutdown recommended',
    rating2Title: '2 - Substandard',
    rating2Desc: 'Functional impairment requiring maintenance',
    rating3Title: '3 - Acceptable',
    rating3Desc: 'Operational with standard wear and tear',
    rating4Title: '4 - Good',
    rating4Desc: 'Fully functional, well maintained',
    rating5Title: '5 - Optimal',
    rating5Desc: 'Like new or meeting peak operational standards',

    // Photo Capture
    takePhotoOrChoose: 'Capture via Camera or Select File',
    photoCompressedNotice: 'Optimized JPEG (max 1280px) for rapid queue dispatch',
    accessingCamera: 'Accessing camera & applying compression...',
    compressedBadge: '{size} KB (Optimized)',
    removePhoto: 'Remove photo',

    // History & List
    searchPlaceholder: 'Filter by building, room, classification, notes...',
    filterAll: 'All ({count})',
    filterPending: 'Queued ({count})',
    filterSynced: 'Synced ({count})',
    filterFailed: 'Failed ({count})',
    emptyHistoryTitle: 'No records matching query',
    emptyHistorySubtitle: 'Create a new audit entry or adjust search filters.',
    badgePendingSync: 'QUEUED',
    badgeSyncing: 'DISPATCHING',
    badgeSynced: 'VERIFIED',
    badgeFailed: 'DISPATCH ERROR',
    btnRetry: 'Retry',
    btnDelete: 'Delete',
    confirmDelete: 'Delete this inspection from local storage?',
    viewPhoto: 'Evidence Photo',
    closePreview: 'Close View',
    syncErrorPrefix: 'Error Log:',
    attemptsCount: '({count} retries)',
    btnSyncAll: 'Dispatch Queue',
    btnNew: 'New',
    btnBack: 'Overview',

    // Diagnostics Drawer
    diagTitle: 'Diagnostics & Runtime Architecture',
    diagIdbTitle: 'Local Database: \'vku-field-survey\'',
    totalSurveys: 'Total Records:',
    pendingSync: 'Pending Dispatch:',
    syncedSurveys: 'Synced to Server:',
    failedSurveys: 'Failed Retries:',
    runtimeState: 'System Architectural State',
    netStatusLabel: 'Network Interface:',
    swSupport: 'Service Worker (Cache-First):',
    bgSyncSupport: 'Background Sync Engine:',
    swActive: 'Active (100% Offline Capable)',
    swNotSupported: 'Unavailable',
    bgSyncSupported: 'Available (Tag: "sync-surveys")',
    bgSyncFallback: 'Fallback Active (Online Event Listener)',
    btnSeedSample: 'Insert Test Record (Verify Local Persistence)',
    btnTestBgSync: 'Trigger Background Sync (\'sync-surveys\')',
    btnTriggerSyncNow: 'Execute Sequential Dispatch',
    seedSuccess: 'Sample record #{id} inserted into local storage!',
    bgSyncSuccess: 'Registered Background Sync tag: "sync-surveys"',
    bgSyncFail: 'Background Sync unavailable; fell back to Online Event Listener'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['vi'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('vku_lang') as Language;
      return saved === 'en' ? 'en' : 'vi';
    } catch {
      return 'vi';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('vku_lang', lang);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
