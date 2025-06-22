// UI System – OneLog Africa (charte graphique intégrée)

import React from 'react';

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
