// UI System – OneLog Africa (charte graphique intégrée)
// Phase 1 - Supervision MVP

import React from 'react';

// CSS Custom Properties pour OneLog Africa
export const onelogColors = {
  primary: '#1A3C40',     // Bleu-vert foncé principal
  accent: '#F9A825',      // Jaune/orange accent
  secondary: '#E65100',   // Orange secondaire
  success: '#009688',     // Vert succès
  dark: '#263238',        // Gris foncé texte
  light: '#F4F4F4',       // Gris clair fond
};

// Injection des variables CSS globales
if (typeof document !== 'undefined') {
  const root = document.documentElement;
  root.style.setProperty('--onelog-primary', onelogColors.primary);
  root.style.setProperty('--onelog-accent', onelogColors.accent);
  root.style.setProperty('--onelog-secondary', onelogColors.secondary);
  root.style.setProperty('--onelog-success', onelogColors.success);
  root.style.setProperty('--onelog-dark', onelogColors.dark);
  root.style.setProperty('--onelog-light', onelogColors.light);
}

// Import des fonts Montserrat et Open Sans
const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;500;600&display=swap');
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = fontImport;
  document.head.appendChild(style);
}

// 1. Button Component
export function Button({ children, variant = 'primary', ...props }) {
  const base = 'px-4 py-2 rounded font-semibold transition-colors duration-300 focus:outline-none focus:ring-2';
  const variants = {
    primary: 'bg-[#E65100] text-white hover:bg-[#bf360c] focus:ring-[#E65100]',
    secondary: 'bg-[#F9A825] text-[#263238] hover:bg-[#f57f17] focus:ring-[#F9A825]',
    outline: 'border border-[#E65100] text-[#E65100] hover:bg-[#e6510010] focus:ring-[#E65100]'
  };
  return <button className={`${base} ${variants[variant]}`} {...props}>{children}</button>;
}

// 2. Card Component
export function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow p-6 border border-[#f0f0f0] ${className}`}>
      {title && <h2 className="text-xl font-bold text-[#1A3C40] mb-4">{title}</h2>}
      {children}
    </div>
  );
}

// 3. Badge Component
export function Badge({ text, color = 'accent' }) {
  const colors = {
    accent: 'bg-[#E65100] text-white',
    secondary: 'bg-[#F9A825] text-[#1A3C40]',
    success: 'bg-[#009688] text-white',
    neutral: 'bg-[#263238] text-white'
  };
  return <span className={`px-3 py-1 text-sm rounded-full ${colors[color]}`}>{text}</span>;
}

// 4. NotificationBanner Component
export function NotificationBanner({ message }) {
  return (
    <div className="fixed top-0 left-0 w-full bg-[#F9A825] text-[#1A3C40] py-2 px-4 z-50 shadow-md">
      <div className="max-w-screen-xl mx-auto text-center font-semibold">{message}</div>
    </div>
  );
}

// 5. Input Field
export function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-[#263238] font-medium">{label}</label>
      <input
        className="p-2 border rounded-lg bg-white text-[#263238] border-gray-300 focus:border-[#009688] focus:ring-2 focus:ring-[#009688]"
        {...props}
      />
    </div>
  );
}

// 6. Header (with animated truck placeholder)
export function Header() {
  return (
    <header className="bg-[#1A3C40] text-white py-6 relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4">
        <h1 className="text-3xl font-bold">OneLog Africa</h1>
        <img src="/assets/truck-animated.svg" alt="Camion animé" className="w-24 animate-pulse" />
      </div>
    </header>
  );
}

// 7. Responsive Section Wrapper
export function Section({ children, className = '' }) {
  return <section className={`px-4 py-8 md:px-12 ${className}`}>{children}</section>;
}

// 8. Typography – Usage Examples
export function Title({ children }) {
  return <h2 className="text-2xl font-bold text-[#1A3C40]">{children}</h2>;
}

export function Paragraph({ children }) {
  return <p className="text-[#263238] leading-relaxed text-base">{children}</p>;
}

// 9. Layout Component (header, fonds)
export function Layout({ children, showHeader = true, className = '' }) {
  return (
    <div className={`min-h-screen bg-[#F4F4F4] font-['Open_Sans'] ${className}`}>
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

// 10. Enhanced Button avec variants étendus
export function ButtonVariants({ children, variant = 'primary', size = 'md', ...props }) {
  const baseClasses = 'font-semibold transition-all duration-300 focus:outline-none focus:ring-2 rounded-lg font-["Montserrat"]';
  
  const variants = {
    primary: 'bg-[#E65100] text-white hover:bg-[#bf360c] focus:ring-[#E65100] shadow-md hover:shadow-lg',
    secondary: 'bg-[#F9A825] text-[#263238] hover:bg-[#f57f17] focus:ring-[#F9A825] shadow-md hover:shadow-lg',
    outline: 'border-2 border-[#E65100] text-[#E65100] hover:bg-[#E65100] hover:text-white focus:ring-[#E65100]',
    ghost: 'text-[#1A3C40] hover:bg-[#1A3C40]/10 focus:ring-[#1A3C40]',
    success: 'bg-[#009688] text-white hover:bg-[#00796b] focus:ring-[#009688] shadow-md hover:shadow-lg',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`} 
      {...props}
    >
      {children}
    </button>
  );
}
