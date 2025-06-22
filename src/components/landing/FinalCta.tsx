"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function FinalCta() {
    return (
        <div className="relative mt-28 sm:mt-36 md:mt-52 flex items-center justify-center">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-4xl font-bold text-white md:text-5xl mb-4">
              Ready to beat the ATS game?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands who are getting more interviews by optimizing their resumes to pass through ATS filters first, so their skills can actually be seen.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/app">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-4">
                Beat ATS & Get Interviews
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
} 