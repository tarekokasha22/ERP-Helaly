import { v4 as uuidv4 } from 'uuid';

// ============= PERSISTENT STORAGE UTILITY FUNCTIONS =============

// Function to load data from localStorage with fallback to default
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
  }
  return defaultValue;
};

// CRITICAL FIX: Enhanced function to save data to localStorage with proper event dispatching
const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    
    // Dispatch multiple events to ensure dashboard updates immediately
    window.dispatchEvent(new CustomEvent('localStorageChanged', { 
      detail: { key, data } 
    }));
    
    // Also dispatch specific events based on data type
    if (key.includes('projects')) {
      window.dispatchEvent(new CustomEvent('projectDataChanged', { 
        detail: { key, data, timestamp: Date.now() } 
      }));
    }
    if (key.includes('sections')) {
      window.dispatchEvent(new CustomEvent('sectionDataChanged', { 
        detail: { key, data, timestamp: Date.now() } 
      }));
    }
    if (key.includes('spendings')) {
      window.dispatchEvent(new CustomEvent('spendingDataChanged', { 
        detail: { key, data, timestamp: Date.now() } 
      }));
    }
    
    console.log(`💾 localStorage saved: ${key} with ${Array.isArray(data) ? data.length : 'data'} items`);
    console.log(`📡 Events dispatched for ${key} data change`);
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

// Clear all app data from localStorage
export const clearAllStoredData = () => {
  const keys = ['helaly_users', 'helaly_egypt_projects', 'helaly_libya_projects', 
                'helaly_egypt_sections', 'helaly_libya_sections', 'helaly_egypt_spendings', 
                'helaly_libya_spendings', 'helaly_inventory'];
  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
  });
};

// ============= DEFAULT DATA =============

// Default Users Data
const defaultUsers = [
  {
    id: '1',
    name: 'Admin User (Egypt)',
    email: 'admin@helaly.com',
    password: 'admin123',
    role: 'admin',
    position: 'System Administrator',
    country: 'egypt',
  },
  {
    id: '2',
    name: 'Admin User (Libya)',
    email: 'admin@helaly.com',
    password: 'admin123',
    role: 'admin',
    position: 'System Administrator',
    country: 'libya',
  }
];

// Load users from localStorage or use defaults
let users = loadFromStorage('helaly_users', defaultUsers);

// Default Projects Data - Road Construction Projects (Egypt)
const defaultEgyptProjects = [
  {
    id: 'eg-1',
    name: 'طريق القاهرة - الإسكندرية الصحراوي (المرحلة الأولى)',
    description: 'إنشاء وتطوير 50 كيلومتر من الطريق الصحراوي الجديد بين القاهرة والإسكندرية',
    startDate: '2024-06-01',
    endDate: '2025-06-01',
    status: 'in_progress',
    budget: 2500000,
    manager: 'أحمد محمد علي',
    totalLength: 50,
    unit: 'km',
    progress: 44,
    location: 'القاهرة - الإسكندرية',
    clientName: 'هيئة الطرق والكباري المصرية',
    clientEmail: 'info@roads.gov.eg',
    clientPhone: '+201234567890',
    country: 'egypt',
    createdAt: '2023-06-01T08:00:00Z'
  },
  {
    id: 'eg-2',
    name: 'طريق الساحل الشمالي الجديد',
    description: 'إنشاء طريق ساحلي جديد بطول 120 كيلومتر مع جسور ومحطات خدمة',
    startDate: '2024-04-15',
    endDate: '2025-12-31',
    status: 'in_progress',
    budget: 6000000,
    manager: 'سارة أحمد حسن',
    totalLength: 120,
    unit: 'km',
    progress: 30,
    location: 'الساحل الشمالي المصري',
    clientName: 'وزارة النقل المصرية',
    clientEmail: 'contact@transport.gov.eg',
    clientPhone: '+201234567891',
    country: 'egypt',
    createdAt: '2023-04-15T08:00:00Z'
  },
  {
    id: 'eg-3',
    name: 'تطوير طريق أسوان - أبو سمبل',
    description: 'تطوير وتوسيع الطريق السياحي من أسوان إلى أبو سمبل',
    startDate: '2024-08-01',
    endDate: '2025-08-01',
    status: 'not_started',
    budget: 1800000,
    manager: 'محمد عبدالرحمن',
    totalLength: 80,
    unit: 'km',
    progress: 0, // Auto-calculated from sections
    location: 'أسوان',
    clientName: 'وزارة السياحة والآثار المصرية',
    clientEmail: 'info@tourism.gov.eg',
    clientPhone: '+201234567892',
    country: 'egypt',
    createdAt: '2023-08-01T08:00:00Z'
  },
  {
    id: 'eg-4',
    name: 'طريق مدينة العبور الداخلي',
    description: 'إنشاء شبكة طرق داخلية لمدينة العبور بطول إجمالي 25 كيلومتر',
    startDate: '2024-01-01',
    endDate: '2024-10-31',
    status: 'completed',
    budget: 1200000,
    manager: 'فاطمة الزهراء',
    totalLength: 25,
    unit: 'km',
    progress: 100, // Auto-calculated from sections
    location: 'مدينة العبور',
    clientName: 'هيئة المجتمعات العمرانية الجديدة المصرية',
    clientEmail: 'info@newcities.gov.eg',
    clientPhone: '+201234567893',
    country: 'egypt',
    createdAt: '2023-01-01T08:00:00Z'
  }
];

// Load Egypt projects from localStorage or use defaults
let egyptProjects = loadFromStorage('helaly_egypt_projects', defaultEgyptProjects);

// Default Projects Data - Road Construction Projects (Libya)
const defaultLibyaProjects = [
  {
    id: 'ly-1',
    name: 'طريق طرابلس - بنغازي الساحلي',
    description: 'تطوير وصيانة الطريق الساحلي الرئيسي بين طرابلس وبنغازي بطول 1200 كيلومتر',
    startDate: '2024-05-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    budget: 8500000,
    manager: 'عبدالله الليبي',
    totalLength: 1200,
    unit: 'km',
    progress: 25,
    location: 'طرابلس - بنغازي',
    clientName: 'وزارة النقل الليبية',
    clientEmail: 'info@transport.gov.ly',
    clientPhone: '+218123456780',
    country: 'libya',
    createdAt: '2023-05-01T08:00:00Z'
  },
  {
    id: 'ly-2',
    name: 'طريق سبها - الكفرة الصحراوي',
    description: 'إنشاء طريق صحراوي جديد يربط بين سبها والكفرة لتسهيل النقل التجاري',
    startDate: '2024-07-15',
    endDate: '2025-07-15',
    status: 'in_progress',
    budget: 3200000,
    manager: 'فاطمة السراج',
    totalLength: 400,
    unit: 'km',
    progress: 15,
    location: 'سبها - الكفرة',
    clientName: 'الهيئة العامة للطرق الليبية',
    clientEmail: 'info@roads.gov.ly',
    clientPhone: '+218123456781',
    country: 'libya',
    createdAt: '2023-07-15T08:00:00Z'
  },
  {
    id: 'ly-3',
    name: 'تطوير مطار طرابلس العالمي',
    description: 'تطوير وتوسيع مطار طرابلس العالمي وطرق الوصول المحيطة',
    startDate: '2024-09-01',
    endDate: '2025-09-01',
    status: 'not_started',
    budget: 5500000,
    manager: 'محمد القذافي',
    totalLength: 15,
    unit: 'km',
    progress: 0,
    location: 'طرابلس',
    clientName: 'هيئة الطيران المدني الليبية',
    clientEmail: 'info@aviation.gov.ly',
    clientPhone: '+218123456782',
    country: 'libya',
    createdAt: '2023-09-01T08:00:00Z'
  }
];

// Load Libya projects from localStorage or use defaults
let libyaProjects = loadFromStorage('helaly_libya_projects', defaultLibyaProjects);

// Helper function to get user's country from token
const getUserCountryFromToken = (): 'egypt' | 'libya' => {
  const token = localStorage.getItem('token');
  if (!token || !token.startsWith('mock-jwt-token-')) {
    return 'egypt'; // Default to egypt
  }
  
  // Extract user ID from token
  const userId = token.split('-')[3];
  const user = users.find(u => u.id === userId);
  return (user?.country as 'egypt' | 'libya') || 'egypt';
};

// Helper function to get projects by country - always reads fresh data from localStorage
const getProjectsByCountry = (country: 'egypt' | 'libya') => {
  // Always get fresh data from localStorage to ensure we have the latest data
  const freshEgyptProjects = loadFromStorage('helaly_egypt_projects', defaultEgyptProjects);
  const freshLibyaProjects = loadFromStorage('helaly_libya_projects', defaultLibyaProjects);
  
  console.log(`🔄 Getting fresh ${country} projects: ${country === 'egypt' ? freshEgyptProjects.length : freshLibyaProjects.length} found`);
  
  return (country === 'egypt' ? freshEgyptProjects : freshLibyaProjects) as Project[];
};

// Function to rebuild combined projects array
const rebuildProjectsArray = () => {
  projects = [...egyptProjects, ...libyaProjects];
};

// Combined projects array (for backward compatibility, but will be filtered by country)
let projects = [...egyptProjects, ...libyaProjects];

// Default Sections Data - Egypt
const defaultEgyptSections = [
  // Project eg-1: Cairo-Alexandria Desert Road sections
  {
    id: 'eg-s-1',
    name: 'أعمال الحفر والتسوية',
    description: 'حفر وتسوية الأرض للطريق وإزالة العوائق',
    status: 'in_progress',
    manager: 'أحمد محمد علي',
    budget: 300000,
    employees: 25,
    details: 'يتضمن حفر التربة وإزالة الصخور وتسوية المنحدرات',
    notes: 'تم الانتهاء من 60% من الأعمال بجودة عالية',
    projectId: 'eg-1',
    targetQuantity: 30,
    completedQuantity: 18,
    progress: 60,
    country: 'egypt',
    createdAt: '2023-06-01T08:00:00Z'
  },
  {
    id: 'eg-s-2',
    name: 'أعمال الردم والضغط',
    description: 'ردم الطريق بالمواد المناسبة وضغطها حسب المواصفات',
    status: 'in_progress',
    manager: 'محمود السيد',
    budget: 250000,
    employees: 20,
    details: 'استخدام مواد الردم المعتمدة وضغطها بالمعدات الثقيلة',
    notes: 'العمل يسير وفق الجدول الزمني المحدد',
    projectId: 'eg-1',
    targetQuantity: 25, // كيلومتر
    completedQuantity: 7, // كيلومتر
    progress: 28, // (7/25) * 100
    country: 'egypt',
    createdAt: '2023-06-05T08:00:00Z'
  },
  // Project 2: North Coast Road sections
  {
    id: 'eg-s-3',
    name: 'أعمال الحفر والتنقيب',
    description: 'حفر وتنقيب الطريق الساحلي مع مراعاة الظروف الجيولوجية',
    status: 'in_progress',
    manager: 'سارة أحمد حسن',
    budget: 800000,
    employees: 40,
    details: 'حفر متخصص للتربة الرملية والطمي الساحلي',
    notes: 'تحدي التعامل مع التربة الساحلية',
    projectId: 'eg-2',
    targetQuantity: 60, // كيلومتر
    completedQuantity: 18, // كيلومتر  
    progress: 30, // (18/60) * 100
    country: 'egypt',
    createdAt: '2023-04-20T08:00:00Z'
  },
  {
    id: 'eg-s-4',
    name: 'أعمال الردم والطبقة الأساسية',
    description: 'ردم وإنشاء الطبقة الأساسية للطريق الساحلي',
    status: 'in_progress',
    manager: 'علي حسن',
    budget: 900000,
    employees: 35,
    details: 'طبقة أساسية مقاومة للمياه والأملاح البحرية',
    notes: 'استخدام مواد مقاومة للتآكل',
    projectId: 'eg-2',
    targetQuantity: 60, // كيلومتر
    completedQuantity: 18, // كيلومتر
    progress: 30, // (18/60) * 100  
    country: 'egypt',
    createdAt: '2023-04-25T08:00:00Z'
  },
  // Project eg-4: Obour City Internal Roads (Completed project)
  {
    id: 'eg-s-5',
    name: 'أعمال الحفر الأساسية',
    description: 'حفر وإعداد الطرق الداخلية لمدينة العبور',
    status: 'completed',
    manager: 'فاطمة الزهراء',
    budget: 200000,
    employees: 15,
    details: 'تم الانتهاء من جميع أعمال الحفر بنجاح',
    notes: 'تم انجاز العمل قبل الموعد المحدد',
    projectId: 'eg-4',
    targetQuantity: 25, // كيلومتر
    completedQuantity: 25, // كيلومتر
    progress: 100, // (25/25) * 100
    country: 'egypt',
    createdAt: '2023-01-15T08:00:00Z'
  },
  {
    id: 'eg-s-6',
    name: 'أعمال الردم والرصف',
    description: 'ردم ورصف الطرق الداخلية بالأسفلت',
    status: 'completed',
    manager: 'خالد عبدالله',
    budget: 180000,
    employees: 12,
    details: 'رصف عالي الجودة بالأسفلت المطاطي',
    notes: 'تم استخدام تقنيات حديثة في الرصف',
    projectId: 'eg-4',
    targetQuantity: 25,
    completedQuantity: 25,
    progress: 100,
    country: 'egypt',
    createdAt: '2023-02-01T08:00:00Z'
  }
];

// Load Egypt sections from localStorage or use defaults
let egyptSections = loadFromStorage('helaly_egypt_sections', defaultEgyptSections);

// Default Sections Data - Libya
const defaultLibyaSections = [
  // Project ly-1: Tripoli-Benghazi Coastal Road sections
  {
    id: 'ly-s-1',
    name: 'أعمال تطوير الطريق الساحلي',
    description: 'تطوير وصيانة الطريق الساحلي الرئيسي',
    status: 'in_progress',
    manager: 'عبدالله الليبي',
    budget: 1200000,
    employees: 60,
    details: 'تطوير شامل للطريق الساحلي مع تحسين البنية التحتية',
    notes: 'العمل متقدم بشكل جيد رغم التحديات اللوجستية',
    projectId: 'ly-1',
    targetQuantity: 600,
    completedQuantity: 150,
    progress: 25,
    country: 'libya',
    createdAt: '2023-05-01T08:00:00Z'
  },
  {
    id: 'ly-s-2',
    name: 'أعمال الصيانة والتشطيب',
    description: 'صيانة الطريق وأعمال التشطيب النهائية',
    status: 'not_started',
    manager: 'فاطمة السراج',
    budget: 800000,
    employees: 35,
    details: 'صيانة دورية وأعمال التشطيب والعلامات المرورية',
    notes: 'في انتظار انتهاء المرحلة الأولى',
    projectId: 'ly-1',
    targetQuantity: 600,
    completedQuantity: 0,
    progress: 0,
    country: 'libya',
    createdAt: '2023-05-10T08:00:00Z'
  },
  // Project ly-2: Sabha-Kufra Desert Road sections
  {
    id: 'ly-s-3',
    name: 'أعمال الطريق الصحراوي',
    description: 'إنشاء طريق صحراوي جديد',
    status: 'in_progress',
    manager: 'محمد التركي',
    budget: 500000,
    employees: 25,
    details: 'إنشاء طريق صحراوي يتحمل الظروف القاسية',
    notes: 'تحديات خاصة بالطقس الصحراوي والرمال',
    projectId: 'ly-2',
    targetQuantity: 200,
    completedQuantity: 30,
    progress: 15,
    country: 'libya',
    createdAt: '2023-07-15T08:00:00Z'
  }
];

// Load Libya sections from localStorage or use defaults
let libyaSections = loadFromStorage('helaly_libya_sections', defaultLibyaSections);

// Helper function to get sections by country - always reads fresh data from localStorage
const getSectionsByCountry = (country: 'egypt' | 'libya') => {
  // Always get fresh data from localStorage to ensure we have the latest data
  const freshEgyptSections = loadFromStorage('helaly_egypt_sections', defaultEgyptSections);
  const freshLibyaSections = loadFromStorage('helaly_libya_sections', defaultLibyaSections);
  
  console.log(`🔄 Getting fresh ${country} sections: ${country === 'egypt' ? freshEgyptSections.length : freshLibyaSections.length} found`);
  
  return (country === 'egypt' ? freshEgyptSections : freshLibyaSections);
};

// Function to rebuild combined sections array
const rebuildSectionsArray = () => {
  sections = [...egyptSections, ...libyaSections];
};

// Combined sections array (for backward compatibility, but will be filtered by country)
let sections = [...egyptSections, ...libyaSections];

// Default Spendings Data - Egypt
const defaultEgyptSpendings = [
  {
    id: 'eg-sp-1',
    projectId: 'eg-1',
    projectName: 'طريق القاهرة - الإسكندرية الصحراوي',
    sectionId: 'eg-s-1',
    sectionName: 'أعمال الحفر والتسوية',
    amount: 75000,
    category: 'Materials',
    description: 'مواد بناء وخرسانة مسلحة',
    date: '2023-08-05',
    approvedBy: 'أحمد محمد علي',
    country: 'egypt',
    createdAt: '2023-08-05T10:00:00Z'
  },
  {
    id: 'eg-sp-2',
    projectId: 'eg-1',
    projectName: 'طريق القاهرة - الإسكندرية الصحراوي',
    sectionId: 'eg-s-2',
    sectionName: 'أعمال الردم والضغط',
    amount: 25000,
    category: 'Labor',
    description: 'أجور العمالة للأسبوع الأول',
    date: '2023-08-08',
    approvedBy: 'محمود السيد',
    country: 'egypt',
    createdAt: '2023-08-08T10:00:00Z'
  },
  {
    id: '3',
    projectId: '2',
    projectName: 'مجمع سكني الياسمين',
    sectionId: '2',
    sectionName: 'قسم الكهرباء والميكانيكا',
    amount: 120000,
    category: 'equipment',
    description: 'معدات كهربائية وأنظمة تكييف',
    date: '2023-08-15',
    approvedBy: 'سارة أحمد حسن',
    createdAt: '2023-08-15T10:00:00Z'
  },
  {
    id: '4',
    projectId: '2',
    projectName: 'مجمع سكني الياسمين',
    sectionId: '1',
    sectionName: 'قسم الهندسة المدنية',
    amount: 180000,
    category: 'materials',
    description: 'حديد وأسمنت للأساسات',
    date: '2023-08-20',
    approvedBy: 'سارة أحمد حسن',
    createdAt: '2023-08-20T10:00:00Z'
  },
  {
    id: '5',
    projectId: '4',
    projectName: 'مركز تجاري النخيل',
    sectionId: '3',
    sectionName: 'قسم التشطيبات والديكور',
    amount: 90000,
    category: 'materials',
    description: 'مواد تشطيب وديكور راقية',
    date: '2023-07-10',
    approvedBy: 'فاطمة الزهراء',
    createdAt: '2023-07-10T10:00:00Z'
  },
  {
    id: '6',
    projectId: '4',
    projectName: 'مركز تجاري النخيل',
    sectionId: '4',
    sectionName: 'قسم الأمان والجودة',
    amount: 15000,
    category: 'consulting',
    description: 'استشارات فنية وتدقيق جودة',
    date: '2023-07-15',
    approvedBy: 'فاطمة الزهراء',
    createdAt: '2023-07-15T10:00:00Z'
  },
  {
    id: '7',
    projectId: '1',
    projectName: 'مشروع تطوير المكاتب الإدارية',
    sectionId: '2',
    sectionName: 'قسم الكهرباء والميكانيكا',
    amount: 45000,
    category: 'equipment',
    description: 'أجهزة كهربائية ومولدات احتياطية',
    date: '2023-08-25',
    approvedBy: 'أحمد محمد علي',
    createdAt: '2023-08-25T10:00:00Z'
  },
  {
    id: '8',
    projectId: '2',
    projectName: 'مجمع سكني الياسمين',
    sectionId: '3',
    sectionName: 'قسم التشطيبات والديكور',
    amount: 65000,
    category: 'Labor',
    description: 'أجور عمال التشطيبات والديكور',
    date: '2023-08-30',
    approvedBy: 'سارة أحمد حسن',
    country: 'egypt',
    createdAt: '2023-08-30T10:00:00Z'
  }
];

// Load Egypt spendings from localStorage or use defaults
let egyptSpendings = loadFromStorage('helaly_egypt_spendings', defaultEgyptSpendings);

// Default Spendings Data - Libya
const defaultLibyaSpendings = [
  {
    id: 'ly-sp-1',
    projectId: 'ly-1',
    projectName: 'طريق طرابلس - بنغازي الساحلي',
    sectionId: 'ly-s-1',
    sectionName: 'أعمال تطوير الطريق الساحلي',
    amount: 150000,
    category: 'Materials',
    description: 'مواد الأسفلت ومعدات الطريق',
    date: '2023-08-10',
    approvedBy: 'عبدالله الليبي',
    country: 'libya',
    createdAt: '2023-08-10T10:00:00Z'
  },
  {
    id: 'ly-sp-2',
    projectId: 'ly-1',
    projectName: 'طريق طرابلس - بنغازي الساحلي',
    sectionId: 'ly-s-1',
    sectionName: 'أعمال تطوير الطريق الساحلي',
    amount: 80000,
    category: 'Labor',
    description: 'أجور العمالة الليبية',
    date: '2023-08-15',
    approvedBy: 'عبدالله الليبي',
    country: 'libya',
    createdAt: '2023-08-15T10:00:00Z'
  },
  {
    id: 'ly-sp-3',
    projectId: 'ly-2',
    projectName: 'طريق سبها - الكفرة الصحراوي',
    sectionId: 'ly-s-3',
    sectionName: 'أعمال الطريق الصحراوي',
    amount: 95000,
    category: 'Equipment',
    description: 'معدات الحفر والتسوية',
    date: '2023-08-20',
    approvedBy: 'محمد التركي',
    country: 'libya',
    createdAt: '2023-08-20T10:00:00Z'
  }
];

// Load Libya spendings from localStorage or use defaults
let libyaSpendings = loadFromStorage('helaly_libya_spendings', defaultLibyaSpendings);

// Helper function to get spendings by country - always reads fresh data from localStorage
const getSpendingsByCountry = (country: 'egypt' | 'libya') => {
  // Always get fresh data from localStorage to ensure we have the latest data
  const freshEgyptSpendings = loadFromStorage('helaly_egypt_spendings', defaultEgyptSpendings);
  const freshLibyaSpendings = loadFromStorage('helaly_libya_spendings', defaultLibyaSpendings);
  
  console.log(`🔄 Getting fresh ${country} spendings: ${country === 'egypt' ? freshEgyptSpendings.length : freshLibyaSpendings.length} found`);
  
  return (country === 'egypt' ? freshEgyptSpendings : freshLibyaSpendings) as Spending[];
};

// Function to rebuild combined spendings array
const rebuildSpendingsArray = () => {
  spendings = [...egyptSpendings, ...libyaSpendings];
};

// Combined spendings array (for backward compatibility, but will be filtered by country)
let spendings = [...egyptSpendings, ...libyaSpendings];

// --- Authentication ---

export const mockLogin = async (email: string, password: string, country?: 'egypt' | 'libya') => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // If country is provided, find user with email, password, and country
  // Otherwise, find the first user with email and password (backward compatibility)
  const user = country 
    ? users.find(u => u.email === email && u.password === password && u.country === country)
    : users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    const errorMsg = country 
      ? `Invalid email, password, or country selection`
      : 'Invalid email or password';
    throw new Error(errorMsg);
  }
  
  // Create mock token
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;
  
  // Return user data without password
  const { password: _, ...userData } = user;
  
  return { token, user: userData };
};

export const mockGetUserProfile = async (token: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!token.startsWith('mock-jwt-token-')) {
    throw new Error('Invalid token');
  }
  
  // Extract user ID from token
  const userId = token.split('-')[3];
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Return user data without password
  const { password: _, ...userData } = user;
  return userData;
};

// --- Projects ---

// Helper function to calculate project progress from sections
const calculateProjectProgress = (projectId: string) => {
  const userCountry = getUserCountryFromToken();
  const countrySections = getSectionsByCountry(userCountry);
  const projectSections = countrySections.filter(s => s.projectId === projectId);
  if (projectSections.length === 0) return 0;
  
  const totalProgress = projectSections.reduce((sum, section) => sum + (section.progress || 0), 0);
  return Math.round(totalProgress / projectSections.length);
};

export const mockGetProjects = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log('🔄 mockGetProjects: Starting to fetch projects...');
  
  // Get user's country and filter projects - ALWAYS read fresh from localStorage
  const userCountry = getUserCountryFromToken();
  console.log('🔄 mockGetProjects: User country:', userCountry);
  
  // Force fresh read from localStorage each time
  const freshEgyptProjects = loadFromStorage('helaly_egypt_projects', defaultEgyptProjects);
  const freshLibyaProjects = loadFromStorage('helaly_libya_projects', defaultLibyaProjects);
  
  const countryProjects = userCountry === 'egypt' ? freshEgyptProjects : freshLibyaProjects;
  console.log(`🔄 mockGetProjects: Found ${countryProjects.length} projects for ${userCountry}`);
  
  // Update project progress based on sections
  const updatedProjects = countryProjects.map(project => ({
    ...project,
    progress: calculateProjectProgress(project.id)
  }));
  
  console.log('✅ mockGetProjects: Returning projects:', updatedProjects.map(p => ({ name: p.name, status: p.status })));
  return updatedProjects;
};

export const mockGetProjectById = async (id: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  console.log(`🔍 Looking for project with ID: ${id}`);
  
  // Get user's country and search in country-specific array for fresh data
  const userCountry = getUserCountryFromToken();
  const countryProjects = getProjectsByCountry(userCountry);
  
  const project = countryProjects.find(p => p.id === id);
  
  if (!project) {
    console.error(`❌ Project ${id} not found in ${userCountry} projects`);
    throw new Error('Project not found');
  }
  
  console.log(`✅ Found project: ${project.name}`);
  
  // Get sections for this project
  const countrySections = getSectionsByCountry(userCountry);
  const projectSections = countrySections.filter(s => s.projectId === id);
  
  // Get spendings for this project
  const countrySpendings = getSpendingsByCountry(userCountry);
  const projectSpendings = countrySpendings.filter(s => s.projectId === id);
  
  // Return project with sections, updated progress and spendings
  return {
    ...project,
    progress: calculateProjectProgress(id),
    sections: projectSections,
    spendings: projectSpendings
  };
};

export const mockCreateProject = async (project: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get current user's country to add project to correct country-specific array
  const userCountry = getUserCountryFromToken();
  
  const newProject = {
    ...project,
    id: uuidv4(),
    country: userCountry,
    createdAt: new Date().toISOString()
  };
  
  // Add to the combined projects array
  projects.push(newProject);
  
  // IMPORTANT: Also add to the appropriate country-specific array
  // so that getProjectsByCountry can find it
  if (userCountry === 'egypt') {
    egyptProjects.push(newProject);
    // Save Egypt projects to localStorage
    saveToStorage('helaly_egypt_projects', egyptProjects);
  } else {
    libyaProjects.push(newProject);
    // Save Libya projects to localStorage
    saveToStorage('helaly_libya_projects', libyaProjects);
  }
  
  // Update in-memory arrays from localStorage
  if (userCountry === 'egypt') {
    egyptProjects.length = 0;
    egyptProjects.push(...loadFromStorage('helaly_egypt_projects', defaultEgyptProjects));
  } else {
    libyaProjects.length = 0;
    libyaProjects.push(...loadFromStorage('helaly_libya_projects', defaultLibyaProjects));
  }
  
  // Rebuild combined projects array
  rebuildProjectsArray();
  
  // Save users to localStorage (in case user data was updated)
  saveToStorage('helaly_users', users);
  
  // Automatically update sections cache if any sections reference this project
  // This ensures that when sections are queried, they will include the new project
  
  return newProject;
};

export const mockUpdateProject = async (id: string, projectData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`✏️ Updating project with ID: ${id}`);
  
  // Get user's country to update in correct country-specific array
  const userCountry = getUserCountryFromToken();
  
  let updatedProject;
  
  // Find and update in country-specific arrays
  if (userCountry === 'egypt') {
    const index = egyptProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found in Egypt projects');
    }
    
    // Update Egypt project
    egyptProjects[index] = {
      ...egyptProjects[index],
      ...projectData,
      updatedAt: new Date().toISOString()
    };
    
    updatedProject = egyptProjects[index];
    
    // Save updated Egypt projects to localStorage
    saveToStorage('helaly_egypt_projects', egyptProjects);
    console.log(`✅ Project updated in Egypt projects. Total: ${egyptProjects.length}`);
    
  } else {
    const index = libyaProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found in Libya projects');
    }
    
    // Update Libya project
    libyaProjects[index] = {
      ...libyaProjects[index],
      ...projectData,
      updatedAt: new Date().toISOString()
    };
    
    updatedProject = libyaProjects[index];
    
    // Save updated Libya projects to localStorage
    saveToStorage('helaly_libya_projects', libyaProjects);
    console.log(`✅ Project updated in Libya projects. Total: ${libyaProjects.length}`);
  }
  
  // Update combined projects array
  rebuildProjectsArray();
  
  console.log(`✅ Project ${id} updated successfully!`);
  return updatedProject;
};

export const mockDeleteProject = async (id: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  console.log(`🗑️ Deleting project with ID: ${id}`);
  
  // Get user's country to delete from correct country-specific array
  const userCountry = getUserCountryFromToken();
  
  // Find and delete from country-specific arrays
  if (userCountry === 'egypt') {
    const index = egyptProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found in Egypt projects');
    }
    
    // Remove from Egypt projects array
    egyptProjects.splice(index, 1);
    
    // Save updated Egypt projects to localStorage
    saveToStorage('helaly_egypt_projects', egyptProjects);
    console.log(`✅ Project deleted from Egypt projects. Remaining: ${egyptProjects.length}`);
    
  } else {
    const index = libyaProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found in Libya projects');
    }
    
    // Remove from Libya projects array
    libyaProjects.splice(index, 1);
    
    // Save updated Libya projects to localStorage
    saveToStorage('helaly_libya_projects', libyaProjects);
    console.log(`✅ Project deleted from Libya projects. Remaining: ${libyaProjects.length}`);
  }
  
  // Update combined projects array
  rebuildProjectsArray();
  
  // Delete associated spendings
  if (userCountry === 'egypt') {
    const beforeCount = egyptSpendings.length;
    egyptSpendings = egyptSpendings.filter(s => s.projectId !== id);
    saveToStorage('helaly_egypt_spendings', egyptSpendings);
    console.log(`🧹 Deleted ${beforeCount - egyptSpendings.length} associated spendings from Egypt`);
  } else {
    const beforeCount = libyaSpendings.length;
    libyaSpendings = libyaSpendings.filter(s => s.projectId !== id);
    saveToStorage('helaly_libya_spendings', libyaSpendings);
    console.log(`🧹 Deleted ${beforeCount - libyaSpendings.length} associated spendings from Libya`);
  }
  
  // Rebuild combined spendings array
  rebuildSpendingsArray();
  
  console.log(`✅ Project ${id} deleted successfully!`);
  return { success: true };
};

// --- Sections ---

export const mockGetSections = async (projectId?: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get user's country and filter sections
  const userCountry = getUserCountryFromToken();
  const countrySections = getSectionsByCountry(userCountry);
  const countryProjects = getProjectsByCountry(userCountry);
  
  // Enhance sections with project names
  const sectionsWithProjectNames = countrySections.map(section => {
    const project = countryProjects.find(p => p.id === section.projectId);
    return {
      ...section,
      projectName: project?.name || 'مشروع غير محدد'
    };
  });
  
  // If projectId is provided, filter by projectId as well
  if (projectId) {
    return sectionsWithProjectNames.filter(section => section.projectId === projectId);
  }
  
  return sectionsWithProjectNames;
};

export const mockGetSectionById = async (id: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Get user's country and filter sections
  const userCountry = getUserCountryFromToken();
  const countrySections = getSectionsByCountry(userCountry);
  
  const section = countrySections.find(s => s.id === id);
  
  if (!section) {
    throw new Error('Section not found');
  }
  
  // Get project information if section has projectId
  let projectName = '';
  if (section.projectId) {
    const countryProjects = getProjectsByCountry(userCountry);
    const project = countryProjects.find(p => p.id === section.projectId);
    projectName = project?.name || '';
  }
  
  return {
    ...section,
    projectName
  };
};

export const mockCreateSection = async (sectionData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Calculate progress automatically from quantities
  const progress = sectionData.targetQuantity && sectionData.targetQuantity > 0 
    ? Math.round((sectionData.completedQuantity / sectionData.targetQuantity) * 100) 
    : 0;
  
  // Get user's country to add to correct sections array
  const userCountry = getUserCountryFromToken();
  
  const newSection = {
    id: uuidv4(),
    name: sectionData.name,
    description: sectionData.description,
    status: sectionData.status || 'not_started',
    manager: sectionData.manager || sectionData.assignedTo || '',
    budget: sectionData.budget || 0,
    employees: sectionData.employees || 0,
    details: sectionData.details || '',
    notes: sectionData.notes || '',
    projectId: sectionData.projectId,
    targetQuantity: sectionData.targetQuantity || 0,
    completedQuantity: sectionData.completedQuantity || 0,
    progress: progress,
    country: userCountry,
    createdAt: new Date().toISOString()
  };
  
  // Add to correct country-specific sections array and save to localStorage
  if (userCountry === 'egypt') {
    egyptSections.push(newSection);
    // Save Egypt sections to localStorage
    saveToStorage('helaly_egypt_sections', egyptSections);
  } else {
    libyaSections.push(newSection);
    // Save Libya sections to localStorage
    saveToStorage('helaly_libya_sections', libyaSections);
  }
  
  // Also add to combined array for backward compatibility
  sections.push(newSection);
  
  console.log(`✅ Section created and saved to localStorage for ${userCountry}. Total: ${userCountry === 'egypt' ? egyptSections.length : libyaSections.length}`);
  
  return newSection;
};

export const mockUpdateSection = async (id: string, sectionData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Get user's country and find section in country-specific array
  const userCountry = getUserCountryFromToken();
  const countrySections = getSectionsByCountry(userCountry);
  const countryIndex = countrySections.findIndex(s => s.id === id);
  
  if (countryIndex === -1) {
    throw new Error('Section not found');
  }
  
  // Find in combined array too
  const index = sections.findIndex(s => s.id === id);
  
  // Calculate progress automatically from quantities if they are being updated
  const currentSection = countrySections[countryIndex];
  const targetQuantity = sectionData.targetQuantity !== undefined ? sectionData.targetQuantity : currentSection.targetQuantity;
  const completedQuantity = sectionData.completedQuantity !== undefined ? sectionData.completedQuantity : currentSection.completedQuantity;
  
  const progress = targetQuantity && targetQuantity > 0 
    ? Math.round((completedQuantity / targetQuantity) * 100) 
    : 0;
  
  // Update section data
  const updatedSection = {
    ...currentSection,
    ...sectionData,
    progress: progress,
    manager: sectionData.manager || sectionData.assignedTo || currentSection.manager,
    updatedAt: new Date().toISOString()
  };
  
  // Update in country-specific array
  countrySections[countryIndex] = updatedSection;
  
  // Update in combined array if found
  if (index !== -1) {
    sections[index] = updatedSection;
  }
  
  // Save to localStorage based on country
  if (userCountry === 'egypt') {
    // Update the actual egyptSections array reference
    egyptSections[countryIndex] = updatedSection;
    saveToStorage('helaly_egypt_sections', egyptSections);
  } else {
    // Update the actual libyaSections array reference
    libyaSections[countryIndex] = updatedSection;
    saveToStorage('helaly_libya_sections', libyaSections);
  }
  
  console.log(`✅ Section updated and saved to localStorage for ${userCountry}. Total: ${userCountry === 'egypt' ? egyptSections.length : libyaSections.length}`);
  
  return updatedSection;
};

export const mockDeleteSection = async (id: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get user's country and find section in country-specific array
  const userCountry = getUserCountryFromToken();
  const countrySections = getSectionsByCountry(userCountry);
  const countryIndex = countrySections.findIndex(s => s.id === id);
  
  if (countryIndex === -1) {
    throw new Error('Section not found');
  }
  
  // Delete from country-specific array
  if (userCountry === 'egypt') {
    egyptSections.splice(countryIndex, 1);
    // Save updated Egypt sections to localStorage
    saveToStorage('helaly_egypt_sections', egyptSections);
  } else {
    libyaSections.splice(countryIndex, 1);
    // Save updated Libya sections to localStorage
    saveToStorage('helaly_libya_sections', libyaSections);
  }
  
  // Delete from combined array
  sections = sections.filter(s => s.id !== id);
  
  console.log(`✅ Section deleted and localStorage updated for ${userCountry}. Total: ${userCountry === 'egypt' ? egyptSections.length : libyaSections.length}`);
  
  return { success: true };
};

// --- Spendings ---

export const mockGetSpendings = async (projectId?: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get user's country and filter spendings
  const userCountry = getUserCountryFromToken();
  const countrySpendings = getSpendingsByCountry(userCountry);
  
  if (projectId) {
    return countrySpendings.filter(s => s.projectId === projectId);
  }
  
  return [...countrySpendings];
};

export const mockCreateSpending = async (spendingData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Get user's country to add to correct spendings array
  const userCountry = getUserCountryFromToken();
  
  const newSpending = {
    id: uuidv4(),
    ...spendingData,
    country: userCountry,
    createdAt: new Date().toISOString()
  };
  
  // Add to correct country-specific spendings array
  if (userCountry === 'egypt') {
    egyptSpendings.push(newSpending);
    // Save Egypt spendings to localStorage
    saveToStorage('helaly_egypt_spendings', egyptSpendings);
  } else {
    libyaSpendings.push(newSpending);
    // Save Libya spendings to localStorage
    saveToStorage('helaly_libya_spendings', libyaSpendings);
  }
  
  // Rebuild combined spendings array
  rebuildSpendingsArray();
  
  return newSpending;
};

export const mockUpdateSpending = async (id: string, spendingData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Get user's country and find spending in country-specific array
  const userCountry = getUserCountryFromToken();
  const countrySpendings = getSpendingsByCountry(userCountry);
  const countryIndex = countrySpendings.findIndex(s => s.id === id);
  
  if (countryIndex === -1) {
    throw new Error('Spending not found');
  }
  
  // Find in combined array too
  const index = spendings.findIndex(s => s.id === id);
  
  // Update spending data
  const updatedSpending = {
    ...countrySpendings[countryIndex],
    ...spendingData
  };
  
  // Update in country-specific array
  countrySpendings[countryIndex] = updatedSpending;
  
  // Update in combined array if found
  if (index !== -1) {
    spendings[index] = updatedSpending;
  }
  
  // Save to localStorage based on country
  if (userCountry === 'egypt') {
    // Update the actual egyptSpendings array reference
    egyptSpendings[countryIndex] = updatedSpending;
    saveToStorage('helaly_egypt_spendings', egyptSpendings);
  } else {
    // Update the actual libyaSpendings array reference
    libyaSpendings[countryIndex] = updatedSpending;
    saveToStorage('helaly_libya_spendings', libyaSpendings);
  }
  
  console.log(`✅ Spending ${id} updated and saved to localStorage for ${userCountry}. Total: ${userCountry === 'egypt' ? egyptSpendings.length : libyaSpendings.length}`);
  
  return updatedSpending;
};

export const mockDeleteSpending = async (id: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get user's country and find spending in country-specific array
  const userCountry = getUserCountryFromToken();
  const countrySpendings = getSpendingsByCountry(userCountry);
  const countryIndex = countrySpendings.findIndex(s => s.id === id);
  
  if (countryIndex === -1) {
    throw new Error('Spending not found');
  }
  
  // Delete from country-specific array and save to localStorage
  if (userCountry === 'egypt') {
    egyptSpendings.splice(countryIndex, 1);
    // Save updated Egypt spendings to localStorage
    saveToStorage('helaly_egypt_spendings', egyptSpendings);
  } else {
    libyaSpendings.splice(countryIndex, 1);
    // Save updated Libya spendings to localStorage
    saveToStorage('helaly_libya_spendings', libyaSpendings);
  }
  
  // Delete from combined array
  spendings = spendings.filter(s => s.id !== id);
  
  console.log(`✅ Spending ${id} deleted and localStorage updated for ${userCountry}. Total: ${userCountry === 'egypt' ? egyptSpendings.length : libyaSpendings.length}`);
  
  return { success: true };
};

// --- Users ---

export const mockGetUsers = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return users.map(user => {
    const { password, ...userData } = user;
    return userData;
  });
};

export const mockCreateUser = async (userData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const newUser = {
    id: uuidv4(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Save users to localStorage
  saveToStorage('helaly_users', users);
  
  // Return user data without password
  const { password, ...newUserData } = newUser;
  return newUserData;
};

export const mockUpdateUser = async (id: string, userData: any) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    throw new Error('User not found');
  }
  
  // Do not allow updating the first admin user (essential for login)
  if (id === '1' && users[index].role === 'admin') {
    // Allow updating some fields but not critical ones
    const safeUpdate = { 
      name: userData.name, 
      position: userData.position,
      updatedAt: new Date().toISOString()
    };
    
    users[index] = {
      ...users[index],
      ...safeUpdate
    };
  } else {
    // Update user
    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
  }
  
  // Return user data without password
  const { password, ...updatedUserData } = users[index];
  return updatedUserData;
};

export const mockDeleteUser = async (id: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    throw new Error('User not found');
  }
  
  // Do not allow deleting the first admin user (essential for login)
  if (id === '1') {
    throw new Error('Cannot delete system admin user');
  }
  
  // Delete user
  users = users.filter(u => u.id !== id);
  
  return { success: true };
};

// --- Dashboard ---

export const mockGetDashboardData = async (timeRange: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('📊 Dashboard data calculation started...');

  // Get user's country and get fresh data from localStorage
  const userCountry = getUserCountryFromToken();
  
  // Load fresh data from localStorage (this ensures we get the latest data)
  const freshEgyptProjects = loadFromStorage('helaly_egypt_projects', defaultEgyptProjects);
  const freshLibyaProjects = loadFromStorage('helaly_libya_projects', defaultLibyaProjects);
  const freshEgyptSpendings = loadFromStorage('helaly_egypt_spendings', defaultEgyptSpendings);
  const freshLibyaSpendings = loadFromStorage('helaly_libya_spendings', defaultLibyaSpendings);
  const freshEgyptSections = loadFromStorage('helaly_egypt_sections', defaultEgyptSections);
  const freshLibyaSections = loadFromStorage('helaly_libya_sections', defaultLibyaSections);

  // Get country-specific data
  const countryProjects = userCountry === 'egypt' ? freshEgyptProjects : freshLibyaProjects;
  const countrySpendings = userCountry === 'egypt' ? freshEgyptSpendings : freshLibyaSpendings;
  const countrySections = userCountry === 'egypt' ? freshEgyptSections : freshLibyaSections;

  console.log(`🗂️ Found ${countryProjects.length} projects for ${userCountry}`);
  console.log(`📋 Found ${countrySections.length} sections for ${userCountry}`);
  console.log(`💰 Found ${countrySpendings.length} spendings for ${userCountry}`);

  // Calculate project statistics
  const totalProjects = countryProjects.length;
  const activeProjects = countryProjects.filter(p => p.status === 'in_progress' || p.status === 'active').length;
  const completedProjects = countryProjects.filter(p => p.status === 'completed').length;
  const notStartedProjects = countryProjects.filter(p => p.status === 'not_started' || p.status === 'pending').length;

  // Calculate financial statistics (include both projects and sections budgets)
  const projectsBudget = countryProjects.reduce((sum, project) => sum + (project.budget || 0), 0);
  const sectionsBudget = countrySections.reduce((sum, section) => sum + (section.budget || 0), 0);
  const totalBudget = projectsBudget + sectionsBudget;
  const totalSpending = countrySpendings.reduce((sum, spending) => sum + (spending.amount || 0), 0);
  const totalRemaining = totalBudget - totalSpending;

  // Calculate monthly trend (last 6 months)
  const monthlyTrend = [0, 0, 0, 0, 0, 0];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthSpending = countrySpendings
      .filter(s => {
        const spendingDate = new Date(s.date);
        return spendingDate >= monthStart && spendingDate <= monthEnd;
      })
      .reduce((sum, s) => sum + (s.amount || 0), 0);
    
    monthlyTrend[5 - i] = monthSpending;
  }

  // Get recent projects (latest 5)
  const recentProjects = countryProjects
    .sort((a, b) => new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime())
    .slice(0, 5)
    .map(project => ({
      id: project.id,
      name: project.name,
      budget: project.budget,
      status: project.status,
      startDate: project.startDate,
      manager: project.manager
    }));

  const dashboardData = {
    projectStats: {
      total: totalProjects,
      active: activeProjects,
      completed: completedProjects,
      notStarted: notStartedProjects,
      percentChange: totalProjects > 0 ? Math.round(((activeProjects / totalProjects) * 100)) : 0
    },
    financialStats: {
      totalBudget: totalBudget,
      totalSpending: totalSpending,
      totalRemaining: totalRemaining,
      monthlyTrend: monthlyTrend,
      percentChange: totalBudget > 0 ? Math.round(((totalSpending / totalBudget) * 100)) : 0
    },
    recentProjects: recentProjects,
    recentActivity: countrySpendings
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(spending => ({
        id: spending.id,
        type: 'spending',
        description: spending.description,
        amount: spending.amount,
        date: spending.date,
        projectId: spending.projectId
      }))
  };

  console.log('📊 Dashboard data calculated:', dashboardData);
  return dashboardData;
};

// --- Reports ---

export const mockGetReportData = async (reportType: string, dateRange: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  // Calculate date ranges
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now);

  switch (dateRange) {
    case 'month':
      // Last month (previous month, not last 30 days)
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
      break;
    case 'quarter':
      // Last quarter (previous quarter)
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const lastQuarterStart = currentQuarter === 0 ? 9 : (currentQuarter - 1) * 3; // Handle year transition
      const lastQuarterYear = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
      startDate = new Date(lastQuarterYear, lastQuarterStart, 1);
      endDate = new Date(lastQuarterYear, lastQuarterStart + 3, 0); // Last day of quarter
      break;
    case 'year':
      // Last year (previous calendar year)
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
  }

  // Filter data based on the date range
  const filteredProjects = projects.filter(project => {
    const projectDate = new Date(project.createdAt || project.startDate || now);
    return projectDate >= startDate && projectDate <= endDate;
  });

  const filteredSpendings = spendings.filter(spending => {
    const spendingDate = new Date(spending.date || spending.createdAt || now);
    return spendingDate >= startDate && spendingDate <= endDate;
  });

  // Generate comprehensive ERP report data
  switch (reportType) {
    case 'overview':
      return {
        totalRevenue: 2500000,
        totalExpenses: 1800000,
        netProfit: 700000,
        activeProjects: 12,
        completedProjects: 28,
        totalEmployees: 145,
        activeSections: 8,
        monthlyGrowth: 12.5,
        profitMargin: 28,
        customerSatisfaction: 94
      };

    case 'financial':
      return {
        revenue: [120000, 135000, 150000, 140000, 165000, 180000, 195000, 175000, 210000, 225000, 240000, 260000],
        expenses: [80000, 95000, 110000, 105000, 120000, 130000, 140000, 125000, 150000, 160000, 170000, 185000],
        categories: {
          materials: 850000,
          labor: 650000,
          equipment: 200000,
          overhead: 100000
        },
        cashFlow: 15000,
        accountsReceivable: 320000,
        accountsPayable: 180000,
        profitMargin: 28
      };

    case 'projects':
      return {
        statusDistribution: [15, 8, 5], // completed, in_progress, not_started
        budgetUtilization: 78,
        averageCompletion: 67,
        onTimeDelivery: 85,
        projectsByCategory: {
          construction: 12,
          renovation: 8,
          maintenance: 8
        }
      };

    case 'sections':
      return {
        performance: [92, 88, 95, 78, 85, 90, 87, 93],
        workload: [85, 92, 78, 88, 90, 82, 95, 87],
        efficiency: 88,
        activeSections: 8
      };

    case 'employees':
      return {
        totalCount: 145,
        departments: {
          engineering: 35,
          construction: 45,
          administration: 20,
          finance: 15,
          hr: 12,
          procurement: 18
        },
        attendance: 96,
        productivity: 89,
        satisfaction: 87
      };

    case 'performance':
      return {
        kpis: {
          efficiency: 88,
          quality: 92,
          customerSatisfaction: 94,
          employeeSatisfaction: 87
        },
        trends: {
          efficiency: [85, 86, 87, 88, 89, 88, 87, 88, 89, 90, 88, 89],
          quality: [90, 91, 92, 91, 93, 92, 91, 92, 93, 94, 92, 93]
        }
      };

    // Legacy report types for backward compatibility
    case 'project-status':
      const completedProjects = filteredProjects.filter(p => p.status === 'completed').length;
      const inProgressProjects = filteredProjects.filter(p => p.status === 'in_progress').length;
      const notStartedProjects = filteredProjects.filter(p => p.status === 'not_started').length;
      const totalProjects = filteredProjects.length;

      return {
        labels: ['Completed', 'In Progress', 'Not Started'],
        data: [completedProjects, inProgressProjects, notStartedProjects],
        total: totalProjects,
        details: {
          completed: completedProjects,
          inProgress: inProgressProjects,
          notStarted: notStartedProjects,
          completionRate: totalProjects ? ((completedProjects / totalProjects) * 100).toFixed(1) : 0
        }
      };

    case 'spending-category':
      const categoryTotals = {
        materials: 0,
        labor: 0,
        equipment: 0,
        permits: 0,
        consulting: 0,
        other: 0
      };

      filteredSpendings.forEach(spending => {
        const category = spending.category?.toLowerCase() || 'other';
        if (category in categoryTotals) {
          categoryTotals[category as keyof typeof categoryTotals] += spending.amount || 0;
        } else {
          categoryTotals.other += spending.amount || 0;
        }
      });

      const totalSpending = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

      return {
        labels: ['Materials', 'Labor', 'Equipment', 'Permits', 'Consulting', 'Other'],
        data: Object.values(categoryTotals),
        total: totalSpending,
        details: categoryTotals
      };

    case 'spending-timeline':
      // Create monthly data for the date range
      const monthlyData = [];
      const monthLabels = [];
      
      if (dateRange === 'year') {
        // For yearly data, show all 12 months of that year
        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(startDate.getFullYear(), i, 1);
          const monthEnd = new Date(startDate.getFullYear(), i + 1, 0);
          const monthlySpending = filteredSpendings
            .filter(s => {
              const spendingDate = new Date(s.date || s.createdAt || now);
              return spendingDate >= monthStart && spendingDate <= monthEnd;
            })
            .reduce((sum, s) => sum + (s.amount || 0), 0);
          
          monthlyData.push(monthlySpending);
          monthLabels.push(new Date(startDate.getFullYear(), i, 1).toLocaleString('default', { month: 'short' }));
        }
      } else if (dateRange === 'quarter') {
        // For quarterly data, show 3 months
        for (let i = 0; i < 3; i++) {
          const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
          const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 0);
          const monthlySpending = filteredSpendings
            .filter(s => {
              const spendingDate = new Date(s.date || s.createdAt || now);
              return spendingDate >= monthStart && spendingDate <= monthEnd;
            })
            .reduce((sum, s) => sum + (s.amount || 0), 0);
          
          monthlyData.push(monthlySpending);
          monthLabels.push(monthStart.toLocaleString('default', { month: 'short' }));
        }
      } else {
        // For monthly data, show daily data for that month
        const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= Math.min(daysInMonth, 10); i++) { // Show max 10 days for readability
          const dayStart = new Date(startDate.getFullYear(), startDate.getMonth(), i);
          const dayEnd = new Date(startDate.getFullYear(), startDate.getMonth(), i + 1);
          const dailySpending = filteredSpendings
            .filter(s => {
              const spendingDate = new Date(s.date || s.createdAt || now);
              return spendingDate >= dayStart && spendingDate < dayEnd;
            })
            .reduce((sum, s) => sum + (s.amount || 0), 0);
          
          monthlyData.push(dailySpending);
          monthLabels.push(`Day ${i}`);
        }
      }

      const totalTimelineSpending = monthlyData.reduce((sum, amount) => sum + amount, 0);
      const averageSpending = monthlyData.length ? totalTimelineSpending / monthlyData.length : 0;
      const maxSpending = Math.max(...monthlyData);
      const minSpending = Math.min(...monthlyData);

      return {
        labels: monthLabels,
        data: monthlyData,
        total: totalTimelineSpending,
        details: {
          average: averageSpending,
          highest: { month: monthLabels[monthlyData.indexOf(maxSpending)] || 'None', amount: maxSpending },
          lowest: { month: monthLabels[monthlyData.indexOf(minSpending)] || 'None', amount: minSpending }
        }
      };

    case 'progress-timeline':
      // Create progress datasets for filtered projects
      const progressDatasets = filteredProjects.map((project, index) => {
        const colors = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#06B6D4', '#EAB308'];
        const color = colors[index % colors.length];
        
        // Generate mock progress data over time
        const progressData = [];
        const currentProgress = project.progress || 0;
        
        // Generate 12 data points showing progress over time
        for (let i = 0; i < 12; i++) {
          const progressPoint = Math.min(currentProgress, (currentProgress / 12) * (i + 1));
          progressData.push(Math.round(progressPoint));
        }
        
        return {
          label: project.name,
          data: progressData,
          borderColor: color,
          backgroundColor: `${color}50`, // Add transparency
          tension: 0.4,
        };
      });

      const avgProgress = filteredProjects.length ? 
        filteredProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / filteredProjects.length : 0;
      const completedCount = filteredProjects.filter(p => (p.progress || 0) >= 100).length;
      const inProgressCount = filteredProjects.filter(p => (p.progress || 0) > 0 && (p.progress || 0) < 100).length;

      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: progressDatasets,
        details: {
          averageProgress: Math.round(avgProgress),
          completedProjects: completedCount,
          inProgressProjects: inProgressCount
        }
      };

    default:
      throw new Error('Invalid report type');
  }
}; 