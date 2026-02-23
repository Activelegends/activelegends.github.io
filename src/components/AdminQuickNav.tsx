import { Link, useLocation } from 'react-router-dom';

type AdminNavItem = {
  to: string;
  label: string;
};

const ITEMS: AdminNavItem[] = [
  { to: '/admin/download-links', label: 'مدیریت لینک‌های دانلود' },
  { to: '/team-admin', label: 'مدیریت اعضای تیم' },
  { to: '/admin/terms', label: 'مدیریت قوانین و مقررات' },
  { to: '/admin/blog', label: 'مدیریت بلاگ' },
  { to: '/admin/users', label: 'مدیریت کاربران' },
  { to: '/admin/comments', label: 'مدیریت نظرات' },
];

export default function AdminQuickNav() {
  const location = useLocation();

  return (
    <div className="w-full mb-6">
      <div className="bg-black/50 border border-white/10 rounded-2xl p-3 md:p-4">
        <div className="flex flex-wrap gap-2">
          {ITEMS.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to));

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-xs md:text-sm px-3 py-2 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-primary text-black border-primary font-bold'
                    : 'bg-black/40 text-gray-200 border-white/10 hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

