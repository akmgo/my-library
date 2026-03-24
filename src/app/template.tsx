// src/app/template.tsx
"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(8px)", y: 20 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      exit={{ opacity: 0, filter: "blur(8px)", y: -20 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}