import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const contactLinks = [
  {
    label: 'ایمیل',
    href: 'mailto:studio@activelegend.ir',
    icon: (
      <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12l-4-4-4 4m8 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6" /></svg>
    ),
    value: 'studio@activelegend.ir',
  },
  {
    label: 'کانال تلگرام',
    href: 'https://t.me/ActiveLegend_ir',
    icon: (
      <svg className="w-7 h-7 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M9.04 16.29l-.39 3.67c.56 0 .8-.24 1.09-.53l2.62-2.5 5.44 3.98c1 .55 1.72.26 1.97-.92l3.58-16.76c.33-1.53-.56-2.13-1.53-1.77L2.2 9.47c-1.5.6-1.48 1.46-.27 1.85l4.6 1.44 10.7-6.74c.5-.32.96-.14.58.2" /></svg>
    ),
    value: '@ActiveLegend_ir',
  },
  {
    label: 'گروه تلگرام',
    href: 'https://t.me/ActiveLegendGroup',
    icon: (
      <svg className="w-7 h-7 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M9.04 16.29l-.39 3.67c.56 0 .8-.24 1.09-.53l2.62-2.5 5.44 3.98c1 .55 1.72.26 1.97-.92l3.58-16.76c.33-1.53-.56-2.13-1.53-1.77L2.2 9.47c-1.5.6-1.48 1.46-.27 1.85l4.6 1.44 10.7-6.74c.5-.32.96-.14.58.2" /></svg>
    ),
    value: '@ActiveLegendGroup',
  },
  {
    label: 'اینستاگرام',
    href: 'https://www.instagram.com/activelegend.ir',
    icon: (
      <svg className="w-7 h-7 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5zm0 1.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm6.25 1.25a1 1 0 110 2 1 1 0 010-2z" /></svg>
    ),
    value: '@activelegend.ir',
  },
  {
    label: 'دیسکورد',
    href: 'https://discord.gg/w7pqAwJfta',
    icon: (
      <svg className="w-7 h-7 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.369A19.791 19.791 0 0016.885 3.1a.074.074 0 00-.079.037c-.34.607-.719 1.396-.984 2.013a18.736 18.736 0 00-5.664 0 12.683 12.683 0 00-.988-2.013.077.077 0 00-.079-.037A19.736 19.736 0 003.684 4.369a.069.069 0 00-.032.027C.533 9.093-.32 13.579.099 18.021a.082.082 0 00.031.056c2.137 1.57 4.21 2.527 6.281 3.155a.077.077 0 00.084-.027c.484-.66.915-1.356 1.289-2.084a.076.076 0 00-.041-.104c-.693-.263-1.353-.588-1.98-.965a.077.077 0 01-.008-.127c.133-.1.266-.204.392-.308a.074.074 0 01.077-.01c4.178 1.91 8.695 1.91 12.832 0a.074.074 0 01.078.009c.126.104.259.208.392.308a.077.077 0 01-.007.127c-.628.377-1.288.702-1.98.965a.076.076 0 00-.04.105c.375.728.806 1.424 1.288 2.084a.076.076 0 00.084.028c2.071-.628 4.144-1.585 6.281-3.155a.077.077 0 00.031-.056c.5-5.177-.838-9.663-3.553-13.625a.061.061 0 00-.031-.027zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.085 2.156 2.418 0 1.334-.946 2.419-2.156 2.419zm7.96 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.085 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z" /></svg>
    ),
    value: 'Discord',
  },
  {
    label: 'یوتیوب',
    href: 'https://www.youtube.com/@ActiveLegend',
    icon: (
      <svg className="w-7 h-7 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 00-2.107-2.117C19.403 3.5 12 3.5 12 3.5s-7.403 0-9.391.569A2.994 2.994 0 00.502 6.186C0 8.174 0 12 0 12s0 3.826.502 5.814a2.994 2.994 0 002.107 2.117C4.597 20.5 12 20.5 12 20.5s7.403 0 9.391-.569a2.994 2.994 0 002.107-2.117C24 15.826 24 12 24 12s0-3.826-.502-5.814zM9.75 15.568V8.432L15.818 12 9.75 15.568z"/></svg>
    ),
    value: 'YouTube',
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

export default function Contact() {
  const [hovered, setHovered] = React.useState<number|null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-gray-900/70 backdrop-blur-md px-4 py-12 pt-24">
      <Helmet>
        <title>تماس با اکتیو لجند | Active Legend - ارتباط با تیم بازی‌سازی</title>
        <meta name="description" content="تماس با اکتیو لجند (Active Legend)؛ راه‌های ارتباط با تیم بازی‌سازی و جامعه گیمرها. پشتیبانی، ایمیل، تلگرام، اینستاگرام، دیسکورد و یوتیوب." />
        <meta name="keywords" content="تماس با ما, اکتیو لجند, Active Legend, ارتباط, Game Studio, support, پشتیبانی, بازی, گیم, استودیو بازی‌سازی, تیم بازی‌سازی, گیمر, بازی ایرانی, تماس active legend, contact active legend" />
        <link rel="canonical" href="https://activelegend.ir/contact" />
        <meta property="og:title" content="تماس با اکتیو لجند | Active Legend" />
        <meta property="og:description" content="راه‌های ارتباط با استودیو بازی‌سازی اکتیو لجند (Active Legend) و تیم توسعه‌دهنده." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://activelegend.ir/contact" />
        <meta property="og:image" content="https://activelegend.ir/AE%20logo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="تماس با اکتیو لجند | Active Legend" />
        <meta name="twitter:description" content="تماس با استودیو بازی‌سازی اکتیو لجند (Active Legend) و جامعه گیمرها." />
        <meta name="twitter:image" content="https://activelegend.ir/AE%20logo.svg" />
      </Helmet>
      <motion.div
        className="w-full max-w-2xl bg-white/10 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-md border border-white/20 text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 className="text-3xl md:text-4xl font-bold text-center text-white mb-6" variants={itemVariants}>
          تماس با ما
        </motion.h1>
        <motion.p className="text-center text-gray-200 mb-10 text-lg" variants={itemVariants}>
          برای ارتباط با تیم اکتیو لجند از راه‌های زیر استفاده کنید. ما همیشه پاسخگوی شما هستیم!
        </motion.p>
        {/* Add extra margin-top to the links list for spacing from header */}
        <div className="flex flex-col gap-6 mt-10">
          {contactLinks.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={
                `flex items-center gap-4 bg-white/20 hover:bg-white/30 transition rounded-xl px-6 py-4 shadow-lg backdrop-blur-md border border-white/10 justify-center relative min-h-[56px]`
              }
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              style={{ textAlign: 'center' }}
            >
              <span>{link.icon}</span>
              <span className="flex flex-col flex-1 items-center justify-center w-full">
                <motion.span
                  initial={false}
                  animate={hovered === i
                    ? { x: 20, opacity: 1, textAlign: 'right', color: '#FACC15', fontSize: '1.5rem', textShadow: '0 2px 12px #FACC1580' }
                    : { x: 0, opacity: 1, textAlign: 'center', color: '#fff', fontSize: '1.25rem', textShadow: 'none' }
                  }
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="text-xl md:text-2xl font-extrabold w-full block transition-all duration-300"
                  style={{
                    minWidth: '120px',
                    width: '100%',
                    display: 'inline-block',
                    textAlign: hovered === i ? 'right' : 'center',
                    transition: 'text-align 0.2s, color 0.2s, font-size 0.2s, text-shadow 0.2s',
                  }}
                >
                  {link.label}
                </motion.span>
                <motion.span
                  initial={false}
                  animate={hovered === i
                    ? { x: -20, opacity: 1, textAlign: 'left' }
                    : { x: 0, opacity: 0, textAlign: 'center' }
                  }
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="mt-1 text-base md:text-lg text-primary-300 bg-black/30 rounded-full px-3 py-1 font-mono select-all w-full max-w-full overflow-hidden text-ellipsis"
                  style={{
                    minWidth: '140px',
                    width: '100%',
                    minHeight: '1.8em',
                    display: 'inline-block',
                    pointerEvents: hovered === i ? 'auto' : 'none',
                    userSelect: hovered === i ? 'all' : 'none',
                    textAlign: hovered === i ? 'left' : 'center',
                    verticalAlign: 'middle',
                    transition: 'text-align 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.value}
                </motion.span>
              </span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 