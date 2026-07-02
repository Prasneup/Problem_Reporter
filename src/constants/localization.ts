export type Language = 'en' | 'ne';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    appName: 'Dang Smart City Portal',
    tagline: 'Digital Governance & Problem Reporting Platform',
    subhead: 'Dang',
    citizen: 'Citizen',
    verifier: 'Community Verifier',
    inspector: 'Field Inspector',
    wardOfficer: 'Ward Officer',
    muniOfficer: 'Municipality Officer',
    distAdmin: 'District Administrator',
    superAdmin: 'Super Admin',

    // Categories
    'Road Damage': 'Road Damage',
    'Potholes': 'Potholes',
    'Garbage': 'Garbage',
    'Water Supply': 'Water Supply',
    'Drainage': 'Drainage',
    'Electricity': 'Electricity',
    'Street Lights': 'Street Lights',
    'Environmental Issues': 'Environmental Issues',
    'Public Safety': 'Public Safety',
    'Infrastructure Problems': 'Infrastructure Problems',
    'Other': 'Other',
    'Emergency': 'Emergency Incidents',

    // Statuses
    'Submitted': 'Submitted',
    'AI_Flagged': 'AI Verification Flagged',
    'Under_Review': 'Under Review',
    'Verified': 'Verified & Approved',
    'Assigned': 'Assigned to Inspector',
    'In_Progress': 'In Progress',
    'Resolved': 'Resolved',
    'Rejected': 'Rejected',
    'Reopened': 'Reopened by Citizen',
    'Closed': 'Closed',

    // Priorities
    'Low': 'Low Priority',
    'Medium': 'Medium Priority',
    'High': 'High Priority',
    'Critical': 'Critical Priority',

    // Form
    'title': 'Issue Title',
    'description': 'Describe the issue...',
    'submit': 'Submit Report',
    'selectMuni': 'Select Municipality',
    'selectWard': 'Select Ward',
    'address': 'Location / Address',
    'gps': 'GPS Coordinates',

    // General UI
    'dashboard': 'Dashboard',
    'reports': 'Reports',
    'notifications': 'Notifications',
    'reputation': 'Reputation Points',
    'badges': 'Badges Earned',
    'budgets': 'Budget Tracking',
    'analytics': 'Analytics',
    'openData': 'Open Data Portal',
    'language': 'Language / भाषा'
  },
  ne: {
    appName: 'दाङ स्मार्ट सिटी पोर्टल',
    tagline: 'डिजिटल सुशासन र समस्या दर्ता प्लेटफर्म',
    subhead: 'दाङ',
    citizen: 'नागरिक',
    verifier: 'समुदाय प्रमाणीकरणकर्ता',
    inspector: 'क्षेत्रीय निरीक्षक',
    wardOfficer: 'वडा अधिकारी',
    muniOfficer: 'नगरपालिका अधिकारी',
    distAdmin: 'जिल्ला प्रशासक',
    superAdmin: 'सुपर एडमिन',

    // Categories
    'Road Damage': 'सडक क्षति',
    'Potholes': 'खाल्डाखुल्डी',
    'Garbage': 'फोहोरमैला',
    'Water Supply': 'खानेपानी आपूर्ति',
    'Drainage': 'ढल निकास',
    'Electricity': 'विद्युत आपूर्ति',
    'Street Lights': 'सडक बत्ती',
    'Environmental Issues': 'वातावरणीय समस्या',
    'Public Safety': 'जनसुरक्षा',
    'Infrastructure Problems': 'पूर्वाधार समस्या',
    'Other': 'अन्य',
    'Emergency': 'आपतकालीन घटनाहरू',

    // Statuses
    'Submitted': 'पेश गरिएको',
    'AI_Flagged': 'एआई द्वारा चिन्हित',
    'Under_Review': 'समीक्षा अन्तर्गत',
    'Verified': 'प्रमाणित तथा स्वीकृत',
    'Assigned': 'निरीक्षकलाई तोकिएको',
    'In_Progress': 'कार्य प्रगतिमा',
    'Resolved': 'समाधान भएको',
    'Rejected': 'अस्वीकृत',
    'Reopened': 'नागरिकद्वारा पुन: खोलिएको',
    'Closed': 'बन्द गरिएको',

    // Priorities
    'Low': 'न्यून प्राथमिकता',
    'Medium': 'मध्यम प्राथमिकता',
    'High': 'उच्च प्राथमिकता',
    'Critical': 'अति आवश्यक',

    // Form
    'title': 'मुद्दाको शीर्षक',
    'description': 'समस्याको विवरण दिनुहोस्...',
    'submit': 'प्रतिवेदन पेश गर्नुहोस्',
    'selectMuni': 'नगरपालिका छान्नुहोस्',
    'selectWard': 'वडा छान्नुहोस्',
    'address': 'ठेगाना / स्थान',
    'gps': 'जीपीएस स्थान',

    // General UI
    'dashboard': 'ड्यासबोर्ड',
    'reports': 'प्रतिवेदनहरू',
    'notifications': 'सूचनाहरू',
    'reputation': 'प्रतिष्ठा अंक',
    'badges': 'प्राप्त ब्याजहरू',
    'budgets': 'बजेट ट्र्याकिङ',
    'analytics': 'विश्लेषण',
    'openData': 'खुला डाटा पोर्टल',
    'language': 'Language / भाषा'
  }
};
