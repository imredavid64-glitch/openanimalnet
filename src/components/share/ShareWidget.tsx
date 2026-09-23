'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareWidgetProps {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  animalId?: string;
}

export default function ShareWidget({ title, description, url, image, animalId }: ShareWidgetProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [embedCode, setEmbedCode] = useState('');

  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = encodeURIComponent(title);
  const shareDesc = encodeURIComponent(description ?? title);
  const shareLink = encodeURIComponent(shareUrl);

  const shareLinks = [
    { name: 'Twitter', url: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareLink}`, icon: '𝕏' },
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`, icon: 'f' },
    { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareLink}`, icon: 'in' },
    { name: 'Reddit', url: `https://reddit.com/submit?url=${shareLink}&title=${shareTitle}`, icon: 'r' },
    { name: 'Email', url: `mailto:?subject=${shareTitle}&body=${shareDesc}%0A%0A${shareLink}`, icon: '@' },
    { name: 'WhatsApp', url: `https://wa.me/?text=${shareTitle}%20${shareLink}`, icon: 'W' },
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateEmbed = () => {
    const id = animalId ?? title.toLowerCase().replace(/\s+/g, '-');
    const code = `<iframe src="https://openanimalnet.vercel.app/embed/animal/${id}" width="400" height="320" frameborder="0" style="border-radius:16px;border:1px solid #e2e8f0" loading="lazy" title="${title}"></iframe>`;
    setEmbedCode(code);
    return code;
  };

  const handleCopyEmbed = async () => {
    const code = embedCode || generateEmbed();
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors"
      >
        <span>↗</span> Share
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-secondary-800 rounded-2xl shadow-2xl border border-secondary-200 dark:border-secondary-700 z-50 p-4"
          >
            <div className="text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-3">Share</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {shareLinks.map(link => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-600 flex items-center justify-center text-sm font-bold text-secondary-700 dark:text-secondary-200">{link.icon}</span>
                  <span className="text-[10px] text-secondary-500">{link.name}</span>
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 rounded-lg bg-secondary-50 dark:bg-secondary-900 text-xs text-secondary-600 dark:text-secondary-400 border border-secondary-200 dark:border-secondary-700"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg text-xs font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>

            <div className="border-t border-secondary-200 dark:border-secondary-700 pt-3">
              <div className="text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">Embed</div>
              <button
                onClick={handleCopyEmbed}
                className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 transition-colors"
              >
                {copied ? 'Copied embed code!' : 'Copy embed code'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}