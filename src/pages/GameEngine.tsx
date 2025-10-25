import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Player from '../game/Player';
import { Helmet } from 'react-helmet-async';
// import logo from '../assets/AE-logo.svg'; // Uncomment and adjust path if logo exists

const MODES = [
  { key: 'offline', label: 'آفلاین' },
];

function randomColor() {
  const colors = ['#3b82f6', '#f59e42', '#10b981', '#e11d48', '#a21caf', '#fbbf24'];
  return colors[Math.floor(Math.random() * colors.length)];
}
function randomName() {
  const names = ['مهدی', 'سارا', 'آرش', 'نگین', 'علی', 'زهرا', 'رضا', 'نازنین'];
  return names[Math.floor(Math.random() * names.length)];
}

const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;
const PLAYER_SIZE = 48;
const SPEED = 14;

function OfflineGameArea() {
  const [player, setPlayer] = useState({
    name: randomName(),
    color: randomColor(),
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
  });
  const [distance, setDistance] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('best_distance') || 0));
  const lastPos = useRef({ x: player.x, y: player.y });
  const keys = useRef<{ [key: string]: boolean }>({});
  const animationRef = useRef<number>();
  const areaRef = useRef<HTMLDivElement>(null);

  // Focus game area on mount for keyboard events
  useEffect(() => {
    areaRef.current?.focus();
  }, []);

  // Handle keydown/keyup for smooth movement and prevent default for WSAD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowup", "w"].includes(key)) { keys.current["up"] = true; if (["w"].includes(key)) e.preventDefault(); }
      if (["arrowdown", "s"].includes(key)) { keys.current["down"] = true; if (["s"].includes(key)) e.preventDefault(); }
      if (["arrowleft", "a"].includes(key)) { keys.current["left"] = true; if (["a"].includes(key)) e.preventDefault(); }
      if (["arrowright", "d"].includes(key)) { keys.current["right"] = true; if (["d"].includes(key)) e.preventDefault(); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowup", "w"].includes(key)) keys.current["up"] = false;
      if (["arrowdown", "s"].includes(key)) keys.current["down"] = false;
      if (["arrowleft", "a"].includes(key)) keys.current["left"] = false;
      if (["arrowright", "d"].includes(key)) keys.current["right"] = false;
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Animation loop for smooth movement
  useEffect(() => {
    function animate() {
      let dx = 0, dy = 0;
      if (keys.current["up"]) dy -= SPEED;
      if (keys.current["down"]) dy += SPEED;
      if (keys.current["left"]) dx -= SPEED;
      if (keys.current["right"]) dx += SPEED;
      if (dx !== 0 || dy !== 0) {
        setPlayer((p) => {
          let nx = Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, p.x + dx));
          let ny = Math.max(0, Math.min(GAME_HEIGHT - PLAYER_SIZE, p.y + dy));
          return { ...p, x: nx, y: ny };
        });
      }
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Distance and best record
  useEffect(() => {
    const dx = player.x - lastPos.current.x;
    const dy = player.y - lastPos.current.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 0) {
      setDistance((prev) => {
        const newDist = prev + d;
        if (newDist > best) {
          setBest(newDist);
          localStorage.setItem('best_distance', String(Math.floor(newDist)));
        }
        return newDist;
      });
      lastPos.current = { x: player.x, y: player.y };
    }
  }, [player.x, player.y, best]);

  // Responsive game area
  return (
    <div className="w-full flex justify-center mt-8">
      <div
        ref={areaRef}
        tabIndex={0}
        className="relative bg-gradient-to-br from-blue-900/40 to-gray-800/60 rounded-2xl border border-white/10 overflow-hidden shadow-lg outline-none"
        style={{ width: '90vw', maxWidth: GAME_WIDTH, height: '50vh', maxHeight: GAME_HEIGHT, minWidth: 320, minHeight: 200 }}
      >
        <div className="absolute left-0 top-0 w-full flex items-center justify-between px-4 py-2 z-10 bg-black/30 text-blue-100 text-sm shadow border-b border-blue-400/30">
          <span className="font-bold text-green-400">حالت آفلاین</span>
          <span>مسافت طی‌شده: {Math.floor(distance)} px</span>
          <span>رکورد: {Math.floor(best)} px</span>
        </div>
        <Player x={player.x} y={player.y} color={player.color} name={player.name} isMe />
      </div>
    </div>
  );
}

export default function GameEngine() {
  const [mode, setMode] = useState<'offline' | null>(null);

  return (
    <>
      <Helmet>
        <title>موتور بازی | Active Legend - بازی ۲بعدی تحت وب</title>
        <meta name="description" content="موتور بازی ۲بعدی تحت وب Active Legend. تجربه بازی‌های آنلاین و آفلاین با گرافیک زیبا و عملکرد بالا." />
        <meta name="keywords" content="موتور بازی, بازی ۲بعدی, بازی تحت وب, Active Legend, بازی آنلاین, بازی آفلاین, موتور بازی ایرانی" />
        <link rel="canonical" href="https://activelegend.ir/game" />
        <meta property="og:title" content="موتور بازی | Active Legend" />
        <meta property="og:description" content="موتور بازی ۲بعدی تحت وب Active Legend" />
        <meta property="og:url" content="https://activelegend.ir/game" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="موتور بازی | Active Legend" />
        <meta name="twitter:description" content="موتور بازی ۲بعدی تحت وب Active Legend" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4 py-8">
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
        className="w-full max-w-2xl flex flex-col items-center mb-12"
      >
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center w-full">
            {/* <img src={logo} alt="ActiveLegend Logo" className="w-14 h-14 mb-2" /> */}
            <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow mb-2 animate-pulse">ActiveLegend Game</span>
            <span className="text-base text-blue-200/80 font-medium mb-4">موتور بازی ۲بعدی تحت وب</span>
            <div className="flex gap-4 mt-2">
              {MODES.map((m) => (
                <motion.button
                  key={m.key}
                  onClick={() => setMode(m.key as 'offline')}
                  whileHover={{ scale: 1.08, boxShadow: '0 4px 24px #3b82f6aa' }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-6 py-2 rounded-xl font-bold text-base transition-all duration-200 focus:outline-none shadow-md border-2 ${mode === m.key ? 'bg-blue-600/90 text-white border-blue-400 shadow-blue-400/40' : 'bg-white/10 text-blue-100 border-white/20 hover:bg-blue-500/80 hover:text-white'}`}
                >
                  {m.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.header>
      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-2xl flex flex-col items-center"
      >
        {!mode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-300 text-lg mt-12"
          >
            لطفاً حالت بازی را انتخاب کنید.
          </motion.div>
        )}
        {mode === 'offline' && <OfflineGameArea />}
      </motion.main>
      </div>
    </>
  );
} 