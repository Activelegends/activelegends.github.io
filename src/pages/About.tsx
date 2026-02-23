import { motion } from 'framer-motion';
import { Gamepad, Users, Rocket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Helmet } from 'react-helmet-async';

const cards = [
  {
    icon: <Gamepad className="w-10 h-10 text-blue-500 mb-4" />, 
    title: 'مأموریت ما',
    desc: 'ما در اکتیو لجند با هدف ارتقای سطح بازی‌سازی و سرگرمی در ایران فعالیت می‌کنیم. مأموریت ما ایجاد بستری برای کشف، معرفی و حمایت از بازی‌سازان و گیمرهای ایرانی است.'
  },
  {
    icon: <Users className="w-10 h-10 text-green-500 mb-4" />, 
    title: 'تیم ما',
    desc: 'تیم ما متشکل از توسعه‌دهندگان، طراحان و عاشقان بازی است که با همکاری و خلاقیت، بهترین تجربه را برای کاربران رقم می‌زنند. ما به جامعه و ارتباط نزدیک با گیمرها اهمیت می‌دهیم.'
  },
  {
    icon: <Rocket className="w-10 h-10 text-pink-500 mb-4" />, 
    title: 'چشم‌انداز',
    desc: 'هدف ما تبدیل شدن به مرجع اول بازی و سرگرمی در ایران و منطقه است. ما به آینده‌ای روشن برای صنعت گیم ایران باور داریم و برای آن تلاش می‌کنیم.'
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.15, duration: 0.7, type: 'spring', stiffness: 80 }
  })
};

export default function About() {
  const [team, setTeam] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => setTeam(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4 py-16 pt-24 pb-32">
      <Helmet>
        <title>درباره اکتیو لجند | Active Legend - استودیو بازی‌سازی و جامعه گیمرها</title>
        <meta name="description" content="درباره اکتیو لجند (Active Legend)؛ استودیو بازی‌سازی و جامعه آنلاین گیمرها و توسعه‌دهندگان ایرانی. معرفی تیم، اهداف، مأموریت و چشم‌انداز ما در صنعت گیم ایران." />
        <meta name="keywords" content="اکتیو لجند, Active Legend, بازی, گیم, استودیو بازی‌سازی, تیم بازی‌سازی, Game Studio, Game Development, گیمر, بازی ایرانی, بازی موبایل, بازی کامپیوتر, بازی آنلاین, بازی آفلاین, تیم اکتیو لجند, about active legend" />
        <link rel="canonical" href="https://activelegend.ir/about" />
        <meta property="og:title" content="درباره اکتیو لجند | Active Legend" />
        <meta property="og:description" content="معرفی استودیو بازی‌سازی اکتیو لجند (Active Legend) و تیم توسعه‌دهنده بازی‌های ایرانی." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://activelegend.ir/about" />
        <meta property="og:image" content="https://activelegend.ir/AE%20logo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="درباره اکتیو لجند | Active Legend" />
        <meta name="twitter:description" content="استودیو بازی‌سازی اکتیو لجند (Active Legend) و جامعه گیمرها و توسعه‌دهندگان ایرانی." />
        <meta name="twitter:image" content="https://activelegend.ir/AE%20logo.svg" />
      </Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Active Legend',
            url: 'https://activelegend.ir',
            logo: 'https://activelegend.ir/AE%20logo.svg',
            description: 'استودیو مستقل بازی‌سازی و جامعه آنلاین برای گیمرها و توسعه‌دهندگان ایرانی.',
            sameAs: [
              'https://t.me/ActiveLegend_ir',
              'https://www.instagram.com/activelegend.ir',
              'https://www.youtube.com/@ActiveLegend',
              'https://discord.gg/w7pqAwJfta',
            ],
          }),
        }}
      />
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="text-4xl md:text-5xl font-extrabold text-white text-center mb-8 md:mb-12 drop-shadow-lg"
      >
        درباره اکتیو لجند
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-lg md:text-xl text-gray-300 text-center max-w-2xl mb-12"
      >
        اکتیو لجند یک استودیو مستقل بازی‌سازی و جامعه آنلاین برای گیمرها و توسعه‌دهندگان ایرانی است. ما با الهام از بهترین استودیوهای دنیا، تلاش می‌کنیم تجربه‌ای نوآورانه، سرگرم‌کننده و اجتماعی برای کاربران ایرانی فراهم کنیم. ما به خلاقیت، همکاری و رشد فردی اعضای تیم و جامعه اهمیت می‌دهیم و همیشه به دنبال راه‌های تازه برای ارتقای صنعت گیم ایران هستیم.
      </motion.p>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            className="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl p-8 flex flex-col items-center text-center border border-white/10 hover:scale-105 hover:shadow-2xl transition-transform duration-300"
          >
            {card.icon}
            <h2 className="text-2xl font-bold text-white mb-3">{card.title}</h2>
            <p className="text-gray-200 text-base leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>
      {/* Team Section */}
      {team.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-5xl mx-auto mt-8 mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">تیم سازندگان</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.1 * i }}
                className="bg-white/10 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-white/10 hover:scale-105 hover:shadow-2xl transition-transform duration-300"
              >
                <img
                  src={member.img_url}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white/20 shadow-md"
                />
                <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                <span className="text-sm text-gray-300 mb-2">{member.role}</span>
                <div className="flex gap-3 justify-center mt-2">
                  {(member.socials || []).map((s: any, idx: number) => (
                    <a
                      key={s.icon+idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-blue-400 transition-colors"
                    >
                      {s.img
                        ? <img src={s.img} alt={s.icon} className="w-6 h-6 rounded-full object-cover" />
                        : s.icon === 'github' ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.686-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .267.18.577.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" /></svg>
                        : s.icon === 'linkedin' ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.599v5.597zm0 0"/></svg>
                        : s.icon === 'instagram' ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5zm0 1.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm6.25 1.25a1 1 0 110 2 1 1 0 010-2z"/></svg>
                        : s.icon === 'youtube' ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a2.994 2.994 0 00-2.107-2.117C19.403 3.5 12 3.5 12 3.5s-7.403 0-9.391.569A2.994 2.994 0 00.502 6.186C0 8.174 0 12 0 12s0 3.826.502 5.814a2.994 2.994 0 002.107 2.117C4.597 20.5 12 20.5 12 20.5s7.403 0 9.391-.569a2.994 2.994 0 002.107-2.117C24 15.826 24 12 24 12s0-3.826-.502-5.814zM9.75 15.568V8.432L15.818 12 9.75 15.568z"/></svg>
                        : null}
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="text-center text-gray-400 mt-8 mb-20">هنوز عضوی ثبت نشده است.</div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="flex flex-col items-center gap-4"
      >
        <span className="text-lg md:text-xl text-white font-medium">سوالی دارید یا می‌خواهید با ما همکاری کنید؟</span>
        <a
          href="https://activelegend.ir/contact"
          className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-pink-500 text-white font-bold text-lg shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
        >
          با ما تماس بگیرید
        </a>
      </motion.div>
    </div>
  );
} 