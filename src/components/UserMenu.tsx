import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { HiUser, HiLogout, HiShieldCheck, HiUserGroup, HiTrash, HiHeart, HiLink, HiDocumentText } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { Link } from 'react-router-dom';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const isAdmin = user?.email === 'active.legendss@gmail.com';
  const avatarUrl = profile?.profile_image_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.display_name?.trim() || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'کاربر';

  if (!user) return null;

  return (
    <Menu as="div" className="relative inline-block text-right">
      <Menu.Button className="inline-flex items-center justify-center rounded-full w-10 h-10 bg-white/10 text-white hover:bg-white/20 transition-colors overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <HiUser className="w-5 h-5" />
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left rounded-md bg-black border border-white/10 shadow-lg focus:outline-none">
          <div className="p-2">
            <div className="px-3 py-2 text-sm text-gray-300" style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}>
              <span className="font-medium text-white">{displayName}</span>
              <span className="block text-xs text-gray-500 truncate">{user.email}</span>
              {isAdmin && (
                <span className="mr-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                  مدیر
                </span>
              )}
            </div>

            {isAdmin && (
              <>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/admin/download-links"
                      className={`${
                        active ? 'bg-white/10' : ''
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm text-white gap-2`}
                    >
                      <HiLink className="w-5 h-5" />
                      مدیریت لینک‌های دانلود
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/team-admin"
                      className={`${
                        active ? 'bg-white/10' : ''
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm text-white gap-2`}
                    >
                      <HiDocumentText className="w-5 h-5" />
                      مدیریت اعضای تیم
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/admin/terms"
                      className={`${
                        active ? 'bg-white/10' : ''
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm text-white gap-2`}
                    >
                      <HiDocumentText className="w-5 h-5" />
                      مدیریت قوانین و مقررات
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-white/10' : ''
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm text-white gap-2`}
                    >
                      <HiUserGroup className="w-5 h-5" />
                      مدیریت کاربران
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-white/10' : ''
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm text-white gap-2`}
                    >
                      <HiShieldCheck className="w-5 h-5" />
                      مدیریت نظرات
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-white/10' : ''
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm text-white gap-2`}
                    >
                      <HiTrash className="w-5 h-5" />
                      حذف محتوا
                    </button>
                  )}
                </Menu.Item>
                <div className="my-1 border-t border-white/10"></div>
              </>
            )}

            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/profile"
                  className={`${
                    active ? 'bg-white/10' : ''
                  } group flex w-full items-center rounded-md px-3 py-2 text-sm text-white gap-2`}
                >
                  <HiUser className="w-5 h-5" />
                  پروفایل من (اسم و عکس)
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/my-games"
                  className={`${
                    active ? 'bg-white/10' : ''
                  } group flex w-full items-center rounded-md px-3 py-2 text-sm text-white gap-2`}
                >
                  <HiHeart className="w-5 h-5" />
                  بازی‌های من
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut()}
                  className={`${
                    active ? 'bg-white/10' : ''
                  } group flex w-full items-center rounded-md px-3 py-2 text-sm text-white gap-2`}
                >
                  <HiLogout className="w-5 h-5" />
                  خروج
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}