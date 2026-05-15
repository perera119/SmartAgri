import React, { createContext, useState, useContext } from 'react';

const translations = {
  en: {
    dashboard: "Dashboard",
    predictions: "Predictions",
    alerts: "Alerts",
    monitoring: "Monitoring",
    farmMap: "Farm Map",
    settings: "Settings",
    commandCenter: "Command Center",
    systemControl: "System Control",
    applyChanges: "Apply Global Changes",
    regionalInterface: "Regional Interface",
    logout: "Secure Logout",
    home: "Home",
    viewProfile: "View Profile"
  },
  si: {
    dashboard: "දර්ශක පුවරුව",
    predictions: "අනාවැකි",
    alerts: "අනතුරු ඇඟවීම්",
    monitoring: "නිරීක්ෂණය",
    farmMap: "ගොවිපල සිතියම",
    settings: "සැකසුම්",
    commandCenter: "විධාන මධ්‍යස්ථානය",
    systemControl: "පද්ධති පාලනය",
    applyChanges: "වෙනස්කම් සුරකින්න",
    regionalInterface: "ප්‍රාදේශීය අතුරුමුහුණත",
    logout: "පද්ධතියෙන් ඉවත් වන්න",
    home: "මුල් පිටුව",
    viewProfile: "ගිණුම බලන්න"
  },
  ta: {
    dashboard: "டாஷ்போர்டு",
    predictions: "கணிப்புகள்",
    alerts: "எச்சரிக்கைகள்",
    monitoring: "கண்காணிப்பு",
    farmMap: "பண்ணை வரைபடம்",
    settings: "அமைப்புகள்",
    commandCenter: "கட்டளை மையம்",
    systemControl: "அமைப்பு கட்டுப்பாடு",
    applyChanges: "மாற்றங்களைப் பயன்படுத்து",
    regionalInterface: "பிராந்திய இடைமுகம்",
    logout: "வெளியேறு",
    home: "முகப்பு",
    viewProfile: "சுயவிவரம்"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
