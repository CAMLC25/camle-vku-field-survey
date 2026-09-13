import React, { createContext, useContext, useState } from 'react';

export type Language = 'vi' | 'en';

export const translations = {
  vi: {
    // App Header
    appName: 'VKU Field Survey',
    appSubtitle: 'Hệ thống Kiểm định Hiện trường',
    diagnostics: 'Bảng chẩn đoán kỹ thuật',

    // Bottom Nav
    navHome: 'Tổng quan',
    navNewSurvey: 'Kiểm định mới',
    navHistory: 'Hồ sơ lưu trữ',

    // Network & Sync Status
    online: 'TRỰC TUYẾN',
    offline: 'NGOẠI TUYẾN',
    syncing: 'ĐANG ĐỒNG BỘ...',
    synced: 'ĐÃ ĐỒNG BỘ',
    syncError: 'LỖI ĐỒNG BỘ',
    offlineSubtitle: 'Chế độ lưu trữ độc lập trên thiết bị',
    pendingSurveysToSync: '{count} biên bản chờ đồng bộ',
    syncingSubtitle: 'Đang truyền tuần tự {count} biên bản về máy chủ...',
    syncErrorSubtitle: 'Không thể kết nối. Dữ liệu được bảo toàn trong hàng đợi.',
    allSyncedSubtitle: 'Đã cập nhật đồng bộ với máy chủ trung tâm',
    onlineSubtitle: 'Kết nối máy chủ VKU ổn định',
    localQueueLabel: 'Hàng đợi đồng bộ:',
    localQueueCount: '{count} bản ghi',
    loadingData: 'Đang tải dữ liệu...',

    // Home Page
    heroBadge: 'HỆ THỐNG KIỂM ĐỊNH HIỆN TRƯỜNG',
    heroTitle: 'Cơ sở vật chất VKU',
    heroDesc: 'Quản lý hiện trạng kỹ thuật, thiết bị giảng đường và phòng thí nghiệm tại khuôn viên Đại học CNTT&TT Việt - Hàn.',
    btnCreateInspection: 'Lập biên bản mới',
    btnViewHistory: 'Tra cứu hồ sơ',
    newSurveyTitle: 'Lập biên bản kiểm tra',
    newSurveyDesc: 'Ghi nhận hiện trạng, thông số phòng & ảnh tư liệu',
    startNow: 'Bắt đầu',
    historyTitle: 'Hồ sơ kiểm định',
    historyDesc: 'Theo dõi tiến trình xử lý & trạng thái truyền tải',
    viewList: 'Xem chi tiết',
    demoGuideTitle: 'Kiến trúc Offline & Kịch bản kiểm thử thực địa',
    demoStep1: 'Mô phỏng ngắt kết nối: Vô hiệu hóa Wi-Fi/4G hoặc chuyển sang chế độ Offline trên thiết bị.',
    demoStep2: 'Thu thập biên bản thực địa: Ghi nhận vị trí, phân loại trang thiết bị, mức độ hao mòn và chụp ảnh hiện trường.',
    demoStep3: 'Lưu trữ cục bộ (Local Persistence): Bản ghi cùng ảnh nén được cam kết an toàn vào bộ nhớ máy (PENDING_SYNC).',
    demoStep4: 'Khôi phục mạng & Đẩy tuần tự: Khi có tín hiệu mạng, hàng đợi tự động xử lý tuần tự từng bản ghi về máy chủ.',
    demoStep5: 'Kiểm chứng Idempotency: Khóa định danh UUID chống ghi đè hoặc trùng lặp bản ghi trên cơ sở dữ liệu trung tâm.',

    // Business KPI & Dashboard
    kpiTotalInspections: 'Tổng biên bản',
    kpiGoodCondition: 'Đạt chuẩn / Tốt',
    kpiDefectAlert: 'Sự cố / Bảo trì',
    kpiPendingSync: 'Lưu tạm trên máy',
    recentSurveysTitle: 'Biên bản kiểm tra gần đây',
    recentSurveysSubtitle: 'Cập nhật trực tiếp từ khuôn viên trường',
    noRecentSurveys: 'Chưa có biên bản nào trong hệ thống',
    noRecentSurveysSub: 'Hãy nhấn "Lập biên bản mới" để bắt đầu khảo sát hiện trường.',
    campusZonesTitle: 'Khu vực khảo sát trọng điểm',
    zoneKDesc: 'Khu Kỹ thuật & Thực hành CNTT',
    zoneVDesc: 'Khu Nhà hiệu bộ & Đa năng Việt Hàn',
    zoneADesc: 'Khu Giảng đường trung tâm',
    zoneBDesc: 'Khu Thí nghiệm & Nghiên cứu',
    bannerOfflineNotice: 'Bạn đang làm việc ngoại tuyến. Dữ liệu sẽ lưu an toàn trong máy và tự động gửi đi khi có mạng.',
    bannerSyncingNotice: 'Đang đồng bộ {count} biên bản về máy chủ VKU...',

    // Sync Status Card
    queueTitle: 'Tiến trình đồng bộ dữ liệu',
    allSurveysUpToDate: 'Dữ liệu đã được đồng bộ đầy đủ',
    pendingCountSubtitle: '{count} biên bản đang chờ truyền tải',
    btnSyncNow: 'Đồng bộ ngay',
    btnSyncing: 'Đang truyền...',
    statPending: 'Chờ đồng bộ',
    statSynced: 'Đã xác nhận',
    statFailed: 'Cần xử lý',
    lastSyncLabel: 'Cập nhật lần cuối:',
    neverSynced: 'Chưa có',

    // Form
    stepIndicator: 'Phiếu kiểm định',
    formHeaderTitle: 'Biên bản Kiểm định Kỹ thuật',
    formHeaderSubtitle: 'Ghi nhận tình trạng tài sản, trang thiết bị phòng học khuôn viên VKU',
    fieldBuilding: 'Khu vực / Tòa nhà',
    buildingPlaceholder: 'VD: Khu K, Khu V, Khu A, Khu B...',
    fieldFloor: 'Tầng (Tầng 1 - Tầng 5)',
    floorPlaceholder: 'Chọn tầng...',
    fieldRoom: 'Phòng học / Vị trí',
    roomPlaceholder: 'VD: K.204, V.301...',
    customRoomOption: 'Tự nhập khác',
    quickSelectRoom: 'Danh sách phòng tầng',
    fieldCategory: 'Phân loại tài sản',
    fieldCondition: 'Đánh giá kỹ thuật',
    conditionScale: 'Mức độ từ 1 (Hỏng nặng) đến 5 (Rất tốt)',
    fieldDefectNotes: 'Nội dung phản ánh / Tình trạng kỹ thuật',
    optionalLabel: '(Tùy chọn)',
    notesPlaceholder: 'Mô tả chi tiết: máy chiếu chập chờn tín hiệu, bàn gãy tay đỡ, rò rỉ gas điều hòa...',
    fieldPhoto: 'Hình ảnh hiện trường',
    photoStoredLocally: 'Tối ưu dung lượng & lưu trữ an toàn trên thiết bị',
    btnSaveSurvey: 'Lưu biên bản kiểm định',
    btnSaving: 'Đang ghi dữ liệu vào bộ nhớ máy...',
    surveySavedSuccess: 'Đã lưu thành công biên bản #{id} vào bộ nhớ máy!',
    surveySavedNotice: 'Bản ghi được đánh dấu CHỜ ĐỒNG BỘ và sẽ tự động chuyển về máy chủ khi có kết nối mạng.',
    validationBuildingRequired: 'Vui lòng xác định khu vực / tòa nhà',
    validationFloorRequired: 'Vui lòng xác định tầng',
    validationRoomRequired: 'Vui lòng nhập số phòng hoặc vị trí kiểm tra',
    validationCategoryRequired: 'Vui lòng phân loại trang thiết bị',
    validationConditionRequired: 'Vui lòng đánh giá tình trạng từ 1 đến 5 sao',

    // Categories
    catHardware: 'Thiết bị CNTT / PC',
    catProjector: 'Máy chiếu & Trình chiếu',
    catAC: 'Hệ thống Điều hòa',
    catElectrical: 'Hạ tầng Điện lưới',
    catFurniture: 'Bàn ghế & Nội thất',

    // Rating labels
    rating1Title: '1 - Hỏng nặng',
    rating1Desc: 'Hư hỏng nghiêm trọng, yêu cầu dừng vận hành',
    rating2Title: '2 - Kém',
    rating2Desc: 'Lỗi chức năng hoặc xuống cấp kỹ thuật cần sửa chữa',
    rating3Title: '3 - Đạt yêu cầu',
    rating3Desc: 'Vận hành bình thường, có hao mòn tự nhiên',
    rating4Title: '4 - Tốt',
    rating4Desc: 'Thiết bị hoạt động ổn định, bảo quản tốt',
    rating5Title: '5 - Rất tốt',
    rating5Desc: 'Thiết bị mới hoặc duy trì tiêu chuẩn xuất sắc',

    // Photo Capture
    takePhotoOrChoose: 'Chụp ảnh camera hoặc tải ảnh từ tệp',
    photoCompressedNotice: 'Tự động tối ưu dung lượng (JPEG 1280px) đảm bảo tốc độ truyền tải',
    accessingCamera: 'Đang mở máy ảnh & xử lý nén...',
    compressedBadge: '{size} KB (Đã tối ưu)',
    removePhoto: 'Xóa ảnh này',

    // History & List
    searchPlaceholder: 'Tìm theo tòa nhà, số phòng, thiết bị, ghi chú sự cố...',
    filterAll: 'Tất cả ({count})',
    filterPending: 'Chờ gửi ({count})',
    filterSynced: 'Đã gửi ({count})',
    filterFailed: 'Lỗi ({count})',
    emptyHistoryTitle: 'Không có dữ liệu phù hợp',
    emptyHistorySubtitle: 'Khởi tạo biên bản kiểm tra mới hoặc điều chỉnh bộ lọc tìm kiếm.',
    badgePendingSync: 'CHỜ ĐỒNG BỘ',
    badgeSyncing: 'ĐANG ĐỒNG BỘ',
    badgeSynced: 'ĐÃ XÁC NHẬN',
    badgeFailed: 'LỖI ĐỒNG BỘ',
    btnRetry: 'Thử lại',
    btnDelete: 'Xóa',
    confirmDelete: 'Xác nhận xóa biên bản kiểm tra này khỏi bộ nhớ thiết bị?',
    viewPhoto: 'Ảnh tư liệu',
    closePreview: 'Đóng cửa sổ xem ảnh',
    syncErrorPrefix: 'Mã lỗi:',
    attemptsCount: '({count} lần thử)',
    btnSyncAll: 'Đồng bộ hàng đợi',
    btnNew: 'Tạo mới',
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
    heroBadge: 'FIELD AUDIT PLATFORM',
    heroTitle: 'VKU Campus Facilities',
    heroDesc: 'Manage technical conditions, classrooms, and IT laboratory assets across Vietnam-Korea University campus.',
    btnCreateInspection: 'Start Inspection',
    btnViewHistory: 'View Records',
    newSurveyTitle: 'New Field Audit',
    newSurveyDesc: 'Record room state, defect logs & photographic evidence',
    startNow: 'Start',
    historyTitle: 'Audit Records',
    historyDesc: 'Track dispatch queues & server sync logs',
    viewList: 'View all',
    demoGuideTitle: 'Offline Architecture & Verification Sandbox',
    demoStep1: 'Simulate Network Disruption: Disconnect Wi-Fi/cellular or toggle "Offline" in DevTools/device settings.',
    demoStep2: 'Field Data Capture: Enter facility parameters, asset category, rating, and attach evidence photo.',
    demoStep3: 'Local-First Persistence: Record and compressed media are safely committed locally under PENDING_SYNC.',
    demoStep4: 'Network Recovery & Auto-Dispatch: Queued records are transmitted sequentially with exponential backoff.',
    demoStep5: 'Idempotency Assurance: Client-generated UUID guarantees duplicate-free records upon retry.',

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
    buildingPlaceholder: 'e.g. Building K, Building V, Building A...',
    fieldFloor: 'Floor Level (Floor 1 - 5)',
    floorPlaceholder: 'Select floor...',
    fieldRoom: 'Room / Facility Location',
    roomPlaceholder: 'e.g. K.204, V.301...',
    customRoomOption: 'Custom / Other',
    quickSelectRoom: 'Floor Room Directory',
    fieldCategory: 'Asset Classification',
    fieldCondition: 'Condition Assessment',
    conditionScale: 'Rating scale from 1 (Critical) to 5 (Optimal)',
    fieldDefectNotes: 'Technical Observations / Defect Description',
    optionalLabel: '(Optional)',
    notesPlaceholder: 'Describe defect: projector signal failure, loose structural arm, refrigerant leak...',
    fieldPhoto: 'Photographic Evidence',
    photoStoredLocally: 'Optimized & secured locally on device',
    btnSaveSurvey: 'Commit Inspection Record',
    btnSaving: 'Writing record to local storage...',
    surveySavedSuccess: 'Record #{id} committed to local storage!',
    surveySavedNotice: 'Marked as PENDING_SYNC. Will be sequentially dispatched when network connection resumes.',
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
