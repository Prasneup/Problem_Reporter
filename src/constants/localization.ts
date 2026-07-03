export type Language = 'en' | 'ne';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    appName: 'Ghorahi Smart City Portal',
    tagline: 'Digital Governance & Problem Reporting Platform',
    subhead: 'Ghorahi Sub-Metropolitan City',
    citizen: 'Citizen',
    verifier: 'Community Verifier',
    inspector: 'Field Inspector',
    wardOfficer: 'Ward Officer',
    muniOfficer: 'Municipality Officer',
    distAdmin: 'District Administrator',
    superAdmin: 'Super Admin',

    // Categories
    'Garbage / Waste Management': 'Garbage / Waste Management',
    'Road Damage': 'Road Damage',
    'Water Supply Problems': 'Water Supply Problems',
    'Drainage / Sewer': 'Drainage / Sewer',
    'Street Light / Electricity': 'Street Light / Electricity',
    'Public Infrastructure': 'Public Infrastructure',
    'Accident / Traffic Emergency': 'Accident / Traffic Emergency',
    'Fire Emergency': 'Fire Emergency',
    'Public Safety / Crime': 'Public Safety / Crime',

    // Statuses
    'Submitted': 'Submitted',
    'Under_Review': 'Under Review',
    'Assigned': 'Assigned to Department',
    'In_Progress': 'In Progress',
    'Resolved': 'Resolved',
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
    appName: 'घोराही स्मार्ट सिटी पोर्टल',
    tagline: 'डिजिटल सुशासन र समस्या दर्ता प्लेटफर्म',
    subhead: 'घोराही उपमहानगरपालिका',
    citizen: 'नागरिक',
    verifier: 'समुदाय प्रमाणीकरणकर्ता',
    inspector: 'क्षेत्रीय निरीक्षक',
    wardOfficer: 'वडा अधिकारी',
    muniOfficer: 'नगरपालिका अधिकारी',
    distAdmin: 'जिल्ला प्रशासक',
    superAdmin: 'सुपर एडमिन',

    // Categories
    'Garbage / Waste Management': 'फोहोरमैला व्यवस्थापन',
    'Road Damage': 'सडक क्षति',
    'Water Supply Problems': 'खानेपानी समस्या',
    'Drainage / Sewer': 'ढल निकास',
    'Street Light / Electricity': 'सडक बत्ती तथा विद्युत',
    'Public Infrastructure': 'सार्वजनिक पूर्वाधार',
    'Accident / Traffic Emergency': 'दुर्घटना तथा ट्राफिक आपतकाल',
    'Fire Emergency': 'आगलागी आपतकाल',
    'Public Safety / Crime': 'जनसुरक्षा तथा अपराध',

    // Statuses
    'Submitted': 'पेश गरिएको',
    'Under_Review': 'समीक्षा अन्तर्गत',
    'Assigned': 'विभागमा पठाइएको',
    'In_Progress': 'कार्य प्रगतिमा',
    'Resolved': 'समाधान भएको',
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
