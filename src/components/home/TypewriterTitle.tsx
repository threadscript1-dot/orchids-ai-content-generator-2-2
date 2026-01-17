'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTitleProps {
    phrases: string[];
    prefix?: string;
}

export function TypewriterTitle({ phrases, prefix = 'Сделай' }: TypewriterTitleProps) {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleType = () => {
            const i = loopNum % phrases.length;
            const fullText = phrases[i];

            setText(
                isDeleting
                    ? fullText.substring(0, text.length - 1)
                    : fullText.substring(0, text.length + 1)
            );

            setTypingSpeed(isDeleting ? 50 : 100);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 1500);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
                setTypingSpeed(300);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed, phrases]);

    return (
        <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl font-mono uppercase text-center flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden"
        >
            <span className="font-bold">{prefix}</span>
            <span className="text-white/80 font-normal">{text}</span>
            <span className="animate-pulse inline-block w-[2px] h-[0.7em] bg-[#6F00FF] align-middle" />
        </motion.h1>
    );
}
