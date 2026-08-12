'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { PawIcon, GithubIcon, XIcon, MessageIcon, LinkedinIcon } from '@/components/icons';

const footerLinks = {
  platform: [
    { name: 'Home', path: '/' },
    { name: 'Animals', path: '/animal' },
    { name: 'Migrations', path: '/migration' },
    { name: 'Monitor', path: '/monitor' },
    { name: 'AI Analysis', path: '/ai' },
    { name: 'Companion Animals', path: '/reunite' },
    { name: 'Impact', path: '/impact' },
  ],
  data: [
    { name: 'Biological', path: '/data/biological' },
    { name: 'Behavioral', path: '/data/behavioral' },
    { name: 'Ecological', path: '/data/ecological' },
    { name: 'Population', path: '/data/population' },
    { name: 'Health', path: '/data/health' },
    { name: 'Conservation', path: '/conservation' },
  ],
  about: [
    { name: 'About Us', path: '/about' },
    { name: 'Methodology', path: '/methodology' },
    { name: 'Data Sources', path: '/sources' },
    { name: 'Partners', path: '/partners' },
    { name: 'Careers', path: '/careers' },
  ],
  support: [
    { name: 'Documentation', path: '/docs' },
    { name: 'API Reference', path: '/api' },
    { name: 'Community', path: '/community' },
    { name: 'Contact', path: '/contact' },
  ],
};

const socialLinks = [
  { name: 'GitHub', icon: <GithubIcon className="w-6 h-6" />, path: 'https://github.com/openanimalnet' },
  { name: 'X', icon: <XIcon className="w-6 h-6" />, path: 'https://twitter.com/openanimalnet' },
  { name: 'Discord', icon: <MessageIcon className="w-6 h-6" />, path: 'https://discord.gg/openanimalnet' },
  { name: 'LinkedIn', icon: <LinkedinIcon className="w-6 h-6" />, path: 'https://linkedin.com/company/openanimalnet' },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="bg-secondary-900 dark:bg-secondary-950 text-secondary-300 dark:text-secondary-400 border-t border-secondary-200 dark:border-secondary-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 mb-4"
            >
              <PawIcon className="w-9 h-9 text-primary-400" />
              <div>
                <div className="text-2xl font-bold text-white">OpenAnimalNet</div>
              </div>
            </motion.div>
            <p className="text-secondary-400 dark:text-secondary-500 mb-6">
              OpenAnimalNet is a global platform for monitoring, analyzing, and exploring
              comprehensive animal data. We provide real-time tracking, AI-powered insights,
              and interactive visualizations for researchers, conservationists, and animal lovers.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-2xl hover:text-primary-400 transition-colors duration-300"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="">
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className={`hover:text-primary-400 transition-colors duration-300 text-sm ${
                        pathname === link.path ? 'text-primary-400' : ''
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-secondary-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} OpenAnimalNet. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="hover:text-primary-400 transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary-400 transition-colors duration-300">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-primary-400 transition-colors duration-300">
              Cookie Policy
            </Link>
          </div>
        </div>

        {/* Large Background Text */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <motion.span
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 0.05, y: 0 }}
              transition={{ duration: 1 }}
              className="text-[20rem] font-black text-white select-none leading-none"
            >
              OpenAnimalNet
            </motion.span>
          </div>
        </div>
      </div>
    </footer>
  );
}
