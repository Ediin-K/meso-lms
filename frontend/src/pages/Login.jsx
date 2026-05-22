import { useMemo, useState } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'

import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService.js'
import InputField from '../components/auth/InputField.jsx'
import PasswordField from '../components/auth/PasswordField.jsx'
import LoginSubmitButton from '../components/login/LoginSubmitButton.jsx'
import { isValidEmailFormat } from '../lib/authValidation.js'
import { useAppPreferences } from '../context/appPreferencesContext.js'

function MicrosoftIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 23 23" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M12 1h10v10H12z" />
      <path fill="#7fba00" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function validateEmail(v, t) {
  if (!v.trim()) return t('auth.emailReq')
  if (!isValidEmailFormat(v)) return t('auth.emailInv')
  return ''
}

function validatePassword(v, t) {
  if (!v) return t('auth.passReq')
  return ''
}

export default function Login() {
  const { setIsAuthenticated, colorMode, setRole, t } = useAppPreferences()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const navigate = useNavigate()

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: colorMode,
          primary: { main: '#4F46E5' },
          secondary: { main: '#22C55E' },
          background: {
            default: colorMode === 'dark' ? '#0f172a' : '#F9FAFB',
            paper: colorMode === 'dark' ? '#1e293b' : '#FFFFFF',
          },
          error: { main: '#EF4444' },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
        },
        components: {
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
        },
      }),
    [colorMode],
  )

  const errors = useMemo(
    () => ({
      email: validateEmail(email, t),
      password: validatePassword(password, t),
    }),
    [email, password, t],
  )

  const getFieldError = (field) => {
    if (!attemptedSubmit) return ''
    return errors[field] || ''
  }

  const clearGlobalError = () => setGlobalError('')

  const handleSubmit = async (e) => {

    e.preventDefault()

    const errs = {
      email: validateEmail(email, t),
      password: validatePassword(password, t),
    }

    setAttemptedSubmit(true)
    if (errs.email || errs.password) return

    setLoading(true)
    setGlobalError('')

    try {
      const data = await login(email, password)

      localStorage.setItem('email', data.email)
      localStorage.setItem('token', data.token)

      setIsAuthenticated(true)

      if (data.role) {
        setRole(data.role)
        localStorage.setItem('meson-role', data.role)
      }

      const role = data.role?.toLowerCase()
      const destination =
        role === 'admin'
          ? '/admin'
          : role === 'teacher'
            ? '/teacher'
            : role === 'student'
              ? '/student'
              : '/'
      navigate(destination, { replace: true })
    } catch (error) {
      setGlobalError(error?.message || 'Gabim në login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="flex min-h-dvh flex-col bg-[#F9FAFB] text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">

        <main
          className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-12"
          aria-labelledby="login-heading"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100/80 via-[#F9FAFB] to-indigo-100/70 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/40"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-30"
            aria-hidden
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 20%, rgba(79, 70, 229, 0.12), transparent 45%), radial-gradient(circle at 85% 10%, rgba(14, 165, 233, 0.1), transparent 40%), radial-gradient(circle at 50% 90%, rgba(148, 163, 184, 0.12), transparent 55%)',
            }}
          />

          <div className="relative w-full max-w-[420px]">
            <div className="rounded-[12px] border border-slate-200/90 bg-white/90 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-md transition-colors dark:border-slate-700/90 dark:bg-slate-900/85 dark:shadow-black/40 sm:p-9">
              <Typography
                id="login-heading"
                variant="h4"
                component="h1"
                className="font-bold tracking-tight text-slate-900 dark:text-white"
              >
                {t('auth.loginTitle')}
              </Typography>
              <Typography variant="body2" className="mt-2 text-slate-600 dark:text-slate-400">
                {t('auth.loginSubtitle')}
              </Typography>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                {globalError && (
                  <Alert
                    severity="error"
                    role="alert"
                    onClose={clearGlobalError}
                    className="rounded-[12px]"
                    sx={{ alignItems: 'center' }}
                  >
                    {globalError}
                  </Alert>
                )}

                <div className="mb-6 sm:mb-8">
                  <InputField
                    id="email"
                    label={t('auth.emailLabel')}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      clearGlobalError()
                    }}
                    error={getFieldError('email')}
                    type="email"
                    autoComplete="email"
                    autoFocus
                    startIcon={EmailOutlinedIcon}
                    inputProps={{ 'aria-label': 'Email address' }}
                  />
                </div>

                <div className="space-y-3">
                  <PasswordField
                    id="password"
                    label={t('auth.passwordLabel')}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearGlobalError()
                    }}
                    error={getFieldError('password')}
                    showPassword={showPassword}
                    onToggleVisibility={() => setShowPassword((s) => !s)}
                    showStrength={false}
                    showCapsLockHint
                    autoComplete="current-password"
                  />
                  <div className="flex justify-end">
                    <Link
                      href="#"
                      underline="hover"
                      className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                </div>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      color="primary"
                      slotProps={{
                        input: { 'aria-label': 'Remember me on this device' }
                      }}
                    />
                  }
                  label={
                    <span className="text-sm text-slate-600 dark:text-slate-400">{t('auth.rememberMe')}</span>
                  }
                />

                <LoginSubmitButton loading={loading}>{t('auth.loginSubmit')}</LoginSubmitButton>

                <div className="flex items-center gap-3 py-1">
                  <span
                    className="h-px flex-1 bg-slate-200 transition-colors dark:bg-slate-600"
                    aria-hidden
                  />
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    {t('auth.orContinueWith')}
                  </span>
                  <span
                    className="h-px flex-1 bg-slate-200 transition-colors dark:bg-slate-600"
                    aria-hidden
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-slate-300 hover:shadow-md  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                    aria-label="Continue with Google"
                  >
                    <GoogleIcon />
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-slate-300 hover:shadow-md  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                    aria-label="Continue with Microsoft"
                  >
                    <MicrosoftIcon />
                    Microsoft
                  </button>
                </div>

                <Typography variant="body2" className="text-center text-slate-600 dark:text-slate-400">
                  {t('auth.adminOnlyAccount')}
                </Typography>

              </form>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
