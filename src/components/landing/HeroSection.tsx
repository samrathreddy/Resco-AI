"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Balancer } from 'react-wrap-balancer';
import { GradientButton } from '@/components/ui/gradient-button';

export function HeroSection() {
    return (
        <section className="z-10 mt-20 sm:mt-24 md:mt-32 flex flex-col items-center px-4 md:px-8 lg:px-16 relative w-full max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-purple-500/3 to-transparent rounded-3xl blur-3xl transform -translate-y-20 w-full"></div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-3xl sm:text-4xl font-medium md:text-6xl lg:text-7xl text-white mt-10 sm:mt-12 md:mt-16"
        >
          <Balancer className="mb-4 md:mb-6 max-w-[1130px]">
            Beat ATS Systems & Land More Interviews
          </Balancer> 
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto mb-6 md:mb-8 max-w-3xl text-center text-sm sm:text-base font-medium text-[#B7B7B7] md:text-xl lg:text-2xl px-2"
        >
          Getting past ATS is the first battle. Share your JD with Resco AI and talk with it live like a natural language and optimizes your resume to beat the algorithms that decide your fate before humans ever see your skills.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <GradientButton variant="variant"
            onClick={() => {
              window.location.href = '/auth/signup';
            }}
            className="bg-indigo-600 hover:bg-indigo-700 h-10 sm:h-12 px-6 sm:px-8 text-base sm:text-lg font-bold text-white"
          >
            Talk with Resume
          </GradientButton>
        </motion.div>
      </section>
    );
} 