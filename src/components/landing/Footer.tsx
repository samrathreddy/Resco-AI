"use client";

import Link from 'next/link';
import { Twitter, Linkedin, MessageCircle, FileText } from 'lucide-react';

export function Footer() {
    const socialLinks = [
      {
        name: 'Twitter',
        href: 'https://twitter.com/resco',
        icon: Twitter,
      },
      {
        name: 'LinkedIn',
        href: 'https://linkedin.com/company/resco',
        icon: Linkedin,
      },
      {
        name: 'Discord',
        href: 'https://discord.gg/resco',
        icon: MessageCircle,
      },
    ];
  
    return (
      <div className="bg-[#202020] mx-4 mb-4 mt-16 flex flex-col items-center justify-center rounded-xl">
        <div className="w-full max-w-6xl px-6 py-10 sm:py-16">
          {/* Footer Header with Logo and Social Links */}
          <div className="flex flex-col items-center sm:items-start mb-10">
            <Link href="/" className="mb-6">
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-indigo-400" />
                <span className="text-lg font-bold text-white">Resco</span>
              </div>
            </Link>
            
            <div className="flex items-center justify-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-full bg-white/10 p-2.5 transition-colors hover:bg-white/20"
                >
                  <social.icon className="h-4 w-4 text-white" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Footer Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-white/60 mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/features" className="text-sm text-white/80 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="text-sm text-white/80 hover:text-white transition-colors">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/app" className="text-sm text-white/80 hover:text-white transition-colors">
                    Editor
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-white/60 mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-sm text-white/80 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com/yourusername/resco" target="_blank" className="text-sm text-white/80 hover:text-white transition-colors">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-sm text-white/80 hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-white/60 mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/blog" className="text-sm text-white/80 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-white/80 hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-sm text-white/80 hover:text-white transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-white/60 mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/terms" className="text-sm text-white/80 hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-white/80 hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-sm text-white/80 hover:text-white transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Footer Divider */}
          <div className="h-px w-full bg-white/10 mb-6"></div>
          
          {/* Footer Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/60">© 2025 Resco. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-xs text-white/60 hover:text-white/80 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-xs text-white/60 hover:text-white/80 transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="text-xs text-white/60 hover:text-white/80 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } 