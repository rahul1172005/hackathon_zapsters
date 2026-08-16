'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Menu, X, LogOut, Edit3, Settings, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { AuthRequiredModal } from '@/components/modals/AuthRequiredModal';
import { SignOutModal } from '@/components/modals/SignOutModal';

export const PublicNavbar: React.FC = () => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
    handle?: string;
  } | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const userAuth = localStorage.getItem('zapsters_auth');
      const loggedIn = userAuth === 'true';
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        const storedUser = localStorage.getItem('zapsters_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser({
              name: 'Rahul Sharma',
              email: 'student@zapsters.dev',
              role: 'Participant',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            });
          }
        } else {
          setUser({
            name: 'Rahul Sharma',
            email: 'student@zapsters.dev',
            role: 'Participant',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          });
        }
      } else {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();
    }, 0);

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleConfirmSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zapsters_auth');
      localStorage.removeItem('zapsters_user');
      window.dispatchEvent(new Event('storage'));
    }
    setIsLoggedIn(false);
    setUser(null);
    setShowUserDropdown(false);
    setShowSignOutModal(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md font-inter border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">

        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <img
              src="/images (4)/navbar.png"
              alt="Logo"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              style={{ transform: 'scale(3) translate(12px, -2px)' }}
              className="h-10 w-auto object-contain transition-transform"
            />
          </Link>
        </div>

        {/* Center: Nav Menu Links — desktop only */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#777777] dark:text-neutral-400 absolute left-1/2 -translate-x-1/2 transition-transform">
          <Link href="/explore" className="hover:text-[#111111] dark:hover:text-white transition-colors">
            Explore
          </Link>
          <Link href="/hackathons" className="hover:text-[#111111] dark:hover:text-white transition-colors">
            Hackathons
          </Link>
          <Link href="/leaderboard" className="hover:text-[#111111] dark:hover:text-white transition-colors">
            Leaderboard
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          <ThemeToggle />

          {isLoggedIn ? (
            /* Logged In User Profile Dropdown Button */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  alt={user?.name || 'User Profile'}
                  className="w-7 h-7 rounded-full object-cover border border-[#800000]/20"
                />
                <span className="hidden sm:inline text-xs font-bold text-[#111111] dark:text-white truncate max-w-[120px]">
                  {user?.name || 'Rahul Sharma'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#777777] dark:text-neutral-400" />
              </button>

              {/* User Dropdown Menu Popover */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-xl py-3 px-3 space-y-2 z-50 font-inter animate-in fade-in duration-150">
                  {/* User Profile Header */}
                  <div className="p-3 bg-[#F7F7F5] dark:bg-neutral-900/80 rounded-2xl flex items-center gap-3">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                      alt={user?.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border border-[#800000]/30 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-geist font-bold text-xs text-[#111111] dark:text-white truncate">
                        {user?.name || 'Rahul Sharma'}
                      </div>
                      <div className="text-[10px] text-[#777777] dark:text-neutral-400 truncate">
                        {user?.email || 'student@zapsters.dev'}
                      </div>
                      <span className="inline-block mt-1 text-[9px] font-bold text-[#800000] dark:text-red-400 bg-[#800000]/10 px-2 py-0.5 rounded-full uppercase">
                        {user?.role || 'Participant'}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  <div className="space-y-0.5 pt-1 text-xs">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#111111] dark:text-neutral-200 hover:bg-[#F7F7F5] dark:hover:bg-neutral-800 transition-colors font-medium"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#800000]" />
                      <span>Workspace Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#111111] dark:text-neutral-200 hover:bg-[#F7F7F5] dark:hover:bg-neutral-800 transition-colors font-medium"
                    >
                      <Edit3 className="w-4 h-4 text-[#800000]" />
                      <span>Edit Profile</span>
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#111111] dark:text-neutral-200 hover:bg-[#F7F7F5] dark:hover:bg-neutral-800 transition-colors font-medium"
                    >
                      <Settings className="w-4 h-4 text-[#777777] dark:text-neutral-400" />
                      <span>Account Settings</span>
                    </Link>

                    <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowSignOutModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#800000] dark:text-red-400 hover:bg-[#800000]/10 transition-colors font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out Buttons */
            <>
              <Link
                href="/auth/login"
                className="hidden sm:inline text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white px-4 py-2 rounded-full font-medium transition-colors"
              >
                Sign in
              </Link>

              <Link
                href="/auth/register"
                className="hidden sm:inline text-white bg-[#800000] hover:bg-[#660000] px-5 py-2 rounded-full font-bold transition-colors shadow-xs"
              >
                Get started
              </Link>
            </>
          )}

          <button
            onClick={handleDashboardClick}
            className="hidden lg:flex items-center gap-2 text-[#111111] dark:text-white bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-full font-semibold transition-colors cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-[#800000]" />
            Dashboard
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-[#F0F0EE] dark:bg-neutral-900 text-[#111111] dark:text-white transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 z-50 bg-white dark:bg-black shadow-xl px-4 py-5 space-y-3 font-inter rounded-b-3xl border-b border-neutral-200 dark:border-neutral-800">
          {isLoggedIn && (
            <div className="p-3 bg-[#F7F7F5] dark:bg-neutral-900 rounded-2xl flex items-center gap-3 mb-2">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                alt={user?.name || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-[#800000]/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-geist font-bold text-xs text-[#111111] dark:text-white truncate">
                  {user?.name || 'Rahul Sharma'}
                </div>
                <div className="text-[10px] text-[#777777] dark:text-neutral-400 truncate">
                  {user?.email || 'student@zapsters.dev'}
                </div>
              </div>
            </div>
          )}

          <Link
            href="/explore"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-full text-sm font-medium text-[#111111] dark:text-white hover:bg-[#E5E5E2] dark:hover:bg-neutral-900 transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/hackathons"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-full text-sm font-medium text-[#111111] dark:text-white hover:bg-[#E5E5E2] dark:hover:bg-neutral-900 transition-colors"
          >
            Hackathons
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-full text-sm font-medium text-[#111111] dark:text-white hover:bg-[#E5E5E2] dark:hover:bg-neutral-900 transition-colors"
          >
            Leaderboard
          </Link>

          <div className="pt-2 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold text-[#111111] dark:text-white bg-[#F0F0EE] dark:bg-neutral-900 hover:bg-[#E5E5E2] transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-[#800000]" />
                  Edit Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setShowSignOutModal(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold text-white bg-[#800000] hover:bg-[#660000] transition-colors cursor-pointer w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-3 rounded-full text-sm font-medium text-[#777777] dark:text-neutral-400 hover:text-[#111111] dark:hover:text-white border border-[#E5E5E2] dark:border-neutral-700 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-4 py-3 rounded-full text-sm font-bold text-white bg-[#800000] hover:bg-[#660000] transition-colors"
                >
                  Get started
                </Link>
              </>
            )}

            <button
              onClick={(e) => {
                setMobileOpen(false);
                handleDashboardClick(e);
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold text-[#111111] dark:text-white bg-[#F0F0EE] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 transition-colors cursor-pointer w-full"
            >
              <LayoutDashboard className="w-4 h-4 text-[#800000]" />
              Dashboard Workspace
            </button>
          </div>
        </div>
      )}

      {/* Hyper-Aesthetic Auth Required Popup Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Sign Out Confirmation Pop-up Modal */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
      />
    </header>
  );
};
