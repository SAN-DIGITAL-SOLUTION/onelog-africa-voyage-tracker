import React from "react";
import { motion } from "framer-motion";

interface CardFadeProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CardFade: React.FC<CardFadeProps> = ({ children, className = "", style }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`bg-white dark:bg-onelog-nuit rounded-lg shadow-md p-4 mb-4 transition-all card-fade ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
};
