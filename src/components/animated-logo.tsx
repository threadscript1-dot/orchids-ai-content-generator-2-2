"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";

export function AnimatedLogo() {
  const [isAnimating, setIsAnimating] = useState(false);
  const { language } = useLanguage();
  const letters = language === "ru" ? "СДЕЛAI".split("") : "SDELAI".split("");

  const handleMouseEnter = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }
  };
  
  return (
    <span 
      className="text-xl font-black tracking-tighter flex cursor-pointer"
      onMouseEnter={handleMouseEnter}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          animate={isAnimating ? {
            color: ["#fff", "#6F00FF", "#a855f7", "#6F00FF", "#fff"],
            textShadow: [
              "0 0 0px rgba(111,0,255,0)",
              "0 0 20px rgba(111,0,255,0.8)",
              "0 0 30px rgba(168,85,247,0.6)",
              "0 0 20px rgba(111,0,255,0.8)",
              "0 0 0px rgba(111,0,255,0)"
            ],
          } : {}}
          transition={{
            duration: 1.2,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
          style={{ display: "inline-block" }}
        >
          {letter}
        </motion.span>
      ))}
    </span>
  );
}
