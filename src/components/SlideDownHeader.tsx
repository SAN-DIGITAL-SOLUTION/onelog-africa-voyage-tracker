import React from "react";
import { motion } from "framer-motion";

interface SlideDownHeaderProps {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  illustration?: React.ReactNode;
  onBack?: () => void;
}

export const SlideDownHeader: React.FC<SlideDownHeaderProps> = ({
  title,
  icon,
  children,
  illustration,
  onBack,
}) => {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="relative flex items-center gap-4 px-4 py-4 bg-white dark:bg-onelog-nuit shadow-sm rounded-lg mb-6"
    >
      {onBack && (
        <button
          onClick={onBack}
          className="mr-2 p-2 rounded-full bg-gray-100 dark:bg-onelog-bleu/20 hover:bg-gray-200 focus:outline-accent"
          aria-label="Retour"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M12.293 16.293a1 1 0 010-1.414L15.586 11H4a1 1 0 110-2h11.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" /></svg>
        </button>
      )}
      {icon}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-onelog-nuit dark:text-white flex items-center gap-2">{title}</h1>
        {children && <div className="mt-1">{children}</div>}
      </div>
      {illustration && (
        <div className="ml-auto w-16 h-16 flex items-center justify-center animate-fade-in">
          {illustration}
        </div>
      )}
    </motion.header>
  );
};
