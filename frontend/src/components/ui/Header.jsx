import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppPreferences } from '../../context/appPreferencesContext.js'
import { GB, AL } from 'country-flag-icons/react/3x2'

function ThemeToggleIcon({ dark }) {
  if (dark) {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    )
  }
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  )
}

export default function Header() {
  const { locale, setLocale, role, colorMode, toggleColorMode, t, isAuthenticated, logout } = useAppPreferences()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const langWrapRef = useRef(null)
  const profileWrapRef = useRef(null)
  const langBtnRef = useRef(null)
  const profileBtnRef = useRef(null)
  const navigate = useNavigate()

  const [isScrolled, setIsScrolled] = useState(false)

  const langMenuId = useId()
  const profileMenuId = useId()
  const profileHref = role === 'student' ? '/student/profile' : '/profile'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    // check initially
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getNavLinks = () => {
    const contactLink = { label: t('header.navContact'), href: '/contact' }
    const libraryLink = { label: t('header.navLibrary'), href: 'https://www.ubt-uni.net/sq/ubt/jeta-ne-kampus/ubt-biblioteka/' }

    if (!isAuthenticated) {
      return [
        { label: t('header.navHome'), href: '/' },
        { label: t('header.navAbout'), href: '/about' },
        contactLink,
        libraryLink,
      ]
    }

    switch (role) {
      case 'admin':
        return [
          { label: t('header.navAdminDashboard'), href: '/admin' },
          { label: t('home.admin.services.users.title'), href: '/admin/users' },
          { label: t('home.admin.services.courses.title'), href: '/admin/courses' },
          contactLink,
        ]
      case 'teacher':
        return [
          { label: t('header.navDashboard'), href: '/teacher' },
          { label: t('home.teacher.manageClasses'), href: '/classes' },
          { label: t('header.navAssignments'), href: '/assignments' },
          contactLink,
          libraryLink,
        ]
      case 'student':
      default:
        return [
          { label: t('header.navDashboard'), href: '/student' },
          { label: t('header.navCourses'), href: '/courses' },
          { label: t('header.navAssignments'), href: '/assignments' },
          contactLink,
          libraryLink,
        ]
    }
  }

  const navLinks = getNavLinks()

  const closeAllDropdowns = useCallback(() => {
    setLangOpen(false)
    setProfileOpen(false)
  }, [])

  useEffect(() => {
    if (!langOpen && !profileOpen) return
    const onDoc = (e) => {
      const tEl = e.target
      if (langOpen && langWrapRef.current && !langWrapRef.current.contains(tEl)) {
        setLangOpen(false)
      }
      if (
        profileOpen &&
        profileWrapRef.current &&
        !profileWrapRef.current.contains(tEl)
      ) {
        setProfileOpen(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') closeAllDropdowns()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [langOpen, profileOpen, closeAllDropdowns])

  const linkFocusClass =
    'rounded-full px-2.5 py-2 text-sm font-medium text-slate-800 no-underline outline-none ring-sky-500/0 transition hover:bg-slate-900/[0.07] hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-sky-500 lg:px-3 dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white'

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${isScrolled
          ? 'border-b border-slate-200/80 bg-white/95 shadow-md backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95'
          : 'border-b border-white/40 bg-white/30 shadow-sm backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/40'
        }`}>
        <a
          href="#"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          {t('header.skip')}
        </a>
        <div
          className="h-1 w-full bg-gradient-to-r from-slate-900 via-sky-500 to-indigo-900"
          aria-hidden
        />
        <div className="flex w-full items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6 md:gap-8">
            <a
              href="/"
              className="-mt-2 shrink-0 select-none bg-gradient-to-r from-slate-900 via-sky-700 to-sky-600 bg-clip-text text-3xl font-black tracking-tight text-transparent no-underline outline-none ring-sky-500/0 focus-visible:ring-2 focus-visible:ring-offset-2 dark:from-sky-200 dark:via-sky-400 dark:to-indigo-300 sm:text-4xl"
              style={{
                fontFamily:
                  'ui-rounded, "Nunito", "Segoe UI", system-ui, -apple-system, sans-serif',
              }}
            >
              meson
            </a>

            <nav
              className="hidden min-w-0 items-center gap-0.5 overflow-x-auto md:flex lg:gap-1"
              aria-label={t('header.mainNav')}
            >
              {navLinks.map(({ label, href }) =>
                href.startsWith('/') && href !== '#' ? (
                  <Link key={label} to={href} className={`whitespace-nowrap ${linkFocusClass}`}>
                    {label}
                  </Link>
                ) : (
                  <a key={label} href={href} className={`whitespace-nowrap ${linkFocusClass}`}>
                    {label}
                  </a>
                ),
              )}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
            <button
              type="button"
              onClick={toggleColorMode}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/80 bg-white/95 text-slate-700 shadow-sm outline-none ring-sky-500/0 transition hover:border-sky-400/60 hover:bg-sky-50 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-800/95 dark:text-amber-200 dark:hover:border-slate-500 dark:hover:bg-slate-700/90"
              aria-label={colorMode === 'dark' ? t('header.themeLight') : t('header.themeDark')}
            >
              <ThemeToggleIcon dark={colorMode === 'dark'} />
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/notifications')}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/80 bg-white/95 text-slate-700 shadow-sm outline-none ring-sky-500/0 transition hover:border-sky-400/60 hover:bg-sky-50 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-800/95 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700/90"
                aria-label={t('header.notifications')}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              </button>
            ) : null}

            <div className="relative" ref={langWrapRef}>
              <button
                ref={langBtnRef}
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/80 bg-white/95 text-2xl leading-none shadow-sm outline-none ring-sky-500/0 transition hover:border-sky-400/60 hover:bg-sky-50 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-800/95 dark:hover:border-slate-500 dark:hover:bg-slate-700/80"
                aria-expanded={langOpen}
                aria-haspopup="menu"
                aria-controls={langMenuId}
                aria-label={`${t('header.languageMenu')}: ${locale === 'sq' ? t('header.languageSq') : t('header.languageEn')}`}
                onClick={() => {
                  setLangOpen((o) => !o)
                  setProfileOpen(false)
                }}
              >
                <span aria-hidden className="w-6 h-4">
                  {locale === 'sq' ? <AL /> : <GB />}
                </span>
              </button>
              {langOpen ? (
                <div
                  id={langMenuId}
                  role="menu"
                  aria-orientation="vertical"
                  className="absolute right-0 top-full z-[55] mt-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-slate-600 dark:bg-slate-800"
                >
                  <button
                    type="button"
                    role="menuitem"
                    aria-label={t('header.languageSq')}
                    className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-2xl outline-none hover:bg-sky-50 focus-visible:bg-sky-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
                    onClick={() => {
                      setLocale('sq')
                      setLangOpen(false)
                    }}
                  >
                    <span aria-hidden className="select-none"><AL className="w-6 h-4" /></span>
                    {locale === 'sq' ? (
                      <span className="text-sm font-bold text-sky-600">✓</span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    aria-label={t('header.languageEn')}
                    className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-2xl outline-none hover:bg-sky-50 focus-visible:bg-sky-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
                    onClick={() => {
                      setLocale('en')
                      setLangOpen(false)
                    }}
                  >
                    <span aria-hidden className="select-none"><GB className="w-6 h-4" /></span>
                    {locale === 'en' ? (
                      <span className="text-sm font-bold text-sky-600">✓</span>
                    ) : null}
                  </button>
                </div>
              ) : null}
            </div>

            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await logout()
                  navigate('/login')
                }}
                className="hidden rounded-full px-2 py-2 text-sm font-semibold text-slate-600 md:inline-flex md:px-3"
              >
                {t('header.logout')}
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full border-2 border-slate-300/90 bg-white/95 px-3 py-2 text-sm font-semibold text-slate-800 sm:inline-flex"
              >
                {t('header.login')}
              </Link>
            )}

            <div className="relative hidden md:block" ref={profileWrapRef}>
              <button
                ref={profileBtnRef}
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-400/40 bg-gradient-to-br from-sky-500 to-indigo-700 text-sm font-bold text-white shadow-md shadow-slate-900/15 outline-none ring-sky-500/0 transition hover:border-sky-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-controls={profileMenuId}
                aria-label={t('header.profileMenu')}
                onClick={() => {
                  setProfileOpen((o) => !o)
                  setLangOpen(false)
                }}
              >
                {role?.toLowerCase() === 'admin' ? 'A' : 
                 role?.toLowerCase() === 'teacher' ? 'T' : 
                 role?.toLowerCase() === 'student' ? 'S' : 'G'}
              </button>
              {profileOpen ? (
                <div
                  id={profileMenuId}
                  className="absolute right-0 top-full z-[55] mt-2 w-56 rounded-2xl border border-slate-200/90 bg-white/98 p-2 shadow-xl shadow-slate-900/12"
                  role="menu"
                >
                  {[
                    { label: t('header.profile'), href: profileHref },
                    { label: t('header.accountSettings'), href: null },
                    {
                      label: t('header.grades'),
                      href: role === 'student' ? '/student/grades' : role === 'teacher' ? '/teacher/grades' : null,
                    },
                    { label: t('header.messages'), href: null },
                    { label: t('header.help'), href: null },
                  ].map(({ label, href }) => (
                    <button
                      key={label}
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-800 outline-none hover:bg-sky-50/90 focus-visible:bg-sky-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
                      onClick={() => {
                        setProfileOpen(false)
                        if (href) navigate(href)
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  <div className="my-1 h-px bg-slate-200" />
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 outline-none hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-400"
                    onClick={async () => {
                      setProfileOpen(false)
                      await logout()
                      navigate('/login')
                    }}
                  >
                    {t('header.logout')}
                  </button>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="inline-flex rounded-xl p-2 text-slate-800 outline-none ring-sky-500/0 hover:bg-slate-900/[0.06] focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-100 dark:hover:bg-white/10 md:hidden"
              aria-label={mobileOpen ? t('header.closeMenu') : t('header.openMenu')}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-200/80 bg-gradient-to-b from-white/98 to-slate-50/90 px-4 py-4 dark:border-slate-700/80 dark:from-slate-900/98 dark:to-slate-950/95 md:hidden sm:px-6">
            <div className="mb-4">
              <button
                type="button"
                onClick={toggleColorMode}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                aria-label={colorMode === 'dark' ? t('header.themeLight') : t('header.themeDark')}
              >
                <ThemeToggleIcon dark={colorMode === 'dark'} />
                {colorMode === 'dark' ? t('header.themeLight') : t('header.themeDark')}
              </button>
            </div>

            <div className="mb-4 flex gap-3">
              <button
                type="button"
                aria-label={t('header.languageSq')}
                className={`flex flex-1 items-center justify-center rounded-xl border-2 py-4 text-4xl leading-none outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${locale === 'sq'
                  ? 'border-sky-500 bg-sky-50 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700'
                  }`}
                onClick={() => setLocale('sq')}
              >
                <span aria-hidden className="select-none">🇦🇱</span>
              </button>
              <button
                type="button"
                aria-label={t('header.languageEn')}
                className={`flex flex-1 items-center justify-center rounded-xl border-2 py-4 text-4xl leading-none outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${locale === 'en'
                  ? 'border-sky-500 bg-sky-50 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700'
                  }`}
                onClick={() => setLocale('en')}
              >
                <span aria-hidden className="select-none">🇬🇧</span>
              </button>
            </div>
            <nav className="flex flex-col gap-1" aria-label={t('header.mainNav')}>
              {navLinks.map(({ label, href }) =>
                href.startsWith('/') && href !== '#' ? (
                  <Link
                    key={label}
                    to={href}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-slate-800 no-underline outline-none ring-sky-500/0 hover:bg-slate-900/[0.06] focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-100 dark:hover:bg-white/10"
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    key={label}
                    href={href}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-slate-800 no-underline outline-none ring-sky-500/0 hover:bg-slate-900/[0.06] focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-100 dark:hover:bg-white/10"
                  >
                    {label}
                  </a>
                ),
              )}
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-200/80 pt-4">
              <div className="flex items-center gap-3 rounded-xl bg-sky-50/70 px-3 py-2 ring-1 ring-slate-200/60">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-700 text-sm font-bold text-white shadow-sm">
                  {role?.toLowerCase() === 'admin' ? 'A' : 
                   role?.toLowerCase() === 'teacher' ? 'T' : 
                   role?.toLowerCase() === 'student' ? 'S' : 'G'}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {role === 'admin' ? 'Admin' : role === 'teacher' ? 'Teacher' : t('header.studentLabel')}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">{role}</p>
                </div>
              </div>
              <button
                type="button"
                className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-800 outline-none hover:bg-slate-900/[0.06] focus-visible:ring-2 focus-visible:ring-sky-500"
                onClick={() => {
                  setMobileOpen(false)
                  navigate(profileHref)
                }}
              >
                {t('header.profile')}
              </button>
              <Link
                to="/login"
                className="w-full rounded-xl border-2 border-slate-300 bg-white py-3 text-sm font-semibold text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {t('header.login')}
              </Link>
              <button
                type="button"
                className="w-full text-left rounded-xl py-3 text-sm font-semibold text-slate-600 outline-none hover:bg-slate-900/[0.05] focus-visible:ring-2 focus-visible:ring-sky-500"
                onClick={async () => {
                  await logout()
                  navigate('/login')
                }}
              >
                {t('header.logout')}
              </button>
            </div>
          </div>
        ) : null}
      </header>
      <div className="hidden" aria-hidden="true" />
    </>
  )
}
