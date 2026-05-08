import { useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import InputField from '../components/register/InputField.jsx'
import RoleCard from '../components/register/RoleCard.jsx'
import PasswordField from '../components/register/PasswordField.jsx'
import RegisterButton from '../components/register/RegisterButton.jsx'
import {
  getPasswordStrength,
  isValidEmailFormat,
  suggestRoleFromEmail,
} from '../lib/registerValidation.js'
import { useAppPreferences } from '../context/appPreferencesContext.js'
import LegalDocumentModal from '../components/legal/LegalDocumentModal.jsx'
import {
  PRIVACY_POLICY,
  TERMS_OF_SERVICE,
  COOKIE_POLICY,
} from '../legal/mesonLegalDocuments.js'
import { register } from '../services/authService.js'

/** Set true to require scrolling to the end before “I have read” is enabled (stricter UX). */
const REQUIRE_SCROLL_TO_ACKNOWLEDGE_LEGAL = false

const ROLES = [
  {
    id: 'student',
    title: 'Student',
    subtitle: 'Take classes and submit work.',
    highlights: ['Courses & lessons', 'Assignments & grades'],
  },
  {
    id: 'instructor',
    title: 'Teacher',
    subtitle: 'Teach classes and grade work.',
    highlights: ['Lessons & assessments', 'Classes & feedback'],
  },
  {
    id: 'parent',
    title: 'Parent',
    subtitle: 'Follow your child’s progress.',
    highlights: ['Progress & news', 'Schedules & updates'],
  },
]

function roleLabelForUi(id, t) {
  if (id === 'instructor') return t('auth.roleTeacherTitle')
  if (id === 'parent') return t('auth.roleParentTitle')
  if (id === 'student') return t('auth.roleStudentTitle')
  return id
}

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  terms: false,
}

function validateFirstName(v, t) {
  if (!v.trim()) return t('auth.errFirstReq')
  return ''
}

function validateLastName(v, t) {
  if (!v.trim()) return t('auth.errLastReq')
  return ''
}

function validateEmail(v, t) {
  if (!v.trim()) return t('auth.emailReq')
  if (!isValidEmailFormat(v)) return t('auth.emailInv')
  return ''
}

function validatePassword(v, t) {
  if (!v) return t('auth.passReq')
  if (v.length < 8) return t('auth.errPassLength')
  return ''
}

function validateConfirm(password, confirm, t) {
  if (!confirm) return t('auth.errPassConfirm')
  if (confirm !== password) return t('auth.errPassMatch')
  return ''
}

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

export default function Register() {
  const { colorMode, t, locale } = useAppPreferences()
  const [values, setValues] = useState(initialValues)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [roleSuggestion, setRoleSuggestion] = useState(null)
  const [roleDismissed, setRoleDismissed] = useState(false)
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [cookieModalOpen, setCookieModalOpen] = useState(false)
  const [termsReadAcknowledged, setTermsReadAcknowledged] = useState(false)
  const [privacyReadAcknowledged, setPrivacyReadAcknowledged] = useState(false)
  const [cookieReadAcknowledged, setCookieReadAcknowledged] = useState(false)
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

  const passwordStrength = useMemo(() => getPasswordStrength(values.password), [values.password])

  const validationErrors = useMemo(() => {
    let termsMsg = ''
    if (attemptedSubmit) {
      if (!termsReadAcknowledged || !privacyReadAcknowledged || !cookieReadAcknowledged) {
        termsMsg = t('auth.errTermsMsg1')
      } else if (!values.terms) {
        termsMsg = t('auth.errTermsMsg2')
      }
    }
    return {
      firstName: validateFirstName(values.firstName, t),
      lastName: validateLastName(values.lastName, t),
      email: validateEmail(values.email, t),
      password: validatePassword(values.password, t),
      confirmPassword: validateConfirm(values.password, values.confirmPassword, t),
      terms: termsMsg,
    }
  }, [values, attemptedSubmit, termsReadAcknowledged, privacyReadAcknowledged, cookieReadAcknowledged, t])

  const getFieldError = (field) => {
    if (!attemptedSubmit) return ''
    if (field === 'terms') return validationErrors.terms
    return validationErrors[field] || ''
  }

  const handleChange = (field) => (e) => {
    const value = field === 'terms' ? e.target.checked : e.target.value
    setValues((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'email') {
        const s = suggestRoleFromEmail(value)
        setRoleSuggestion(s)
        setRoleDismissed(false)
      }
      return next
    })
  }

  const handleEmailBlur = () => {
    const s = suggestRoleFromEmail(values.email)
    setRoleSuggestion(s)
  }

  const applySuggestedRole = () => {
    if (!roleSuggestion) return
    setValues((prev) => ({ ...prev, role: roleSuggestion }))
    setRoleDismissed(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const termsErr =
      !termsReadAcknowledged || !privacyReadAcknowledged
        ? 'ack'
        : !values.terms
          ? 'tick'
          : ''

    const errs = {
      firstName: validateFirstName(values.firstName, t),
      lastName: validateLastName(values.lastName, t),
      email: validateEmail(values.email, t),
      password: validatePassword(values.password, t),
      confirmPassword: validateConfirm(values.password, values.confirmPassword, t),
      terms: termsErr,
    }

    setAttemptedSubmit(true)
    if (Object.values(errs).some(Boolean)) return

    setLoading(true)
    setGlobalError('')

    try {
      await register(
        values.firstName,
        values.lastName,
        values.email,
        values.password,
        values.role
      )

      navigate('/login')

    } catch (error) {
      setGlobalError(
        error.message || t('auth.registerError')
      )
    } finally {
      setLoading(false)
    }
  }

  const showRoleHint =
    roleSuggestion &&
    roleSuggestion !== values.role &&
    isValidEmailFormat(values.email) &&
    !roleDismissed

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="flex min-h-dvh flex-col bg-[#F9FAFB] text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">

        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-sky-50/70 via-[#F9FAFB] to-indigo-50/40 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/40">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-30"
            aria-hidden
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 10%, rgba(14, 165, 233, 0.12), transparent 42%), radial-gradient(circle at 85% 30%, rgba(79, 70, 229, 0.08), transparent 38%), radial-gradient(circle at 50% 100%, rgba(148, 163, 184, 0.15), transparent 50%)',
            }}
          />
          <div className="relative flex w-full flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
            <div className="relative w-full max-w-5xl rounded-[12px] border border-slate-200/90 bg-white/90 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-md transition-colors dark:border-slate-700/90 dark:bg-slate-900/85 dark:shadow-black/40 sm:p-8 lg:p-10">
              <div className="text-center">
                <Typography
                  variant="h4"
                  component="h1"
                  className="font-bold tracking-tight text-slate-900 dark:text-white sm:text-[2rem]"
                >
                  {t('auth.registerTitle')}
                </Typography>
                <Typography variant="body2" className="mx-auto mt-2 max-w-xl text-slate-600 dark:text-slate-400">
                  {t('auth.registerSubtitle')}
                </Typography>
              </div>

              <form
                className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-10 md:gap-y-5"
                onSubmit={handleSubmit}
                noValidate
              >
                {globalError && (
                  <p className="text-red-500 text-sm text-center">
                    {globalError}
                  </p>
                )}
                <div className="flex min-w-0 flex-col gap-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputField
                      id="firstName"
                      label={t('auth.firstName')}
                      value={values.firstName}
                      onChange={handleChange('firstName')}
                      error={getFieldError('firstName')}
                      autoFocus
                      autoComplete="given-name"
                      startIcon={PersonOutlineIcon}
                    />
                    <InputField
                      id="lastName"
                      label={t('auth.lastName')}
                      value={values.lastName}
                      onChange={handleChange('lastName')}
                      error={getFieldError('lastName')}
                      autoComplete="family-name"
                      startIcon={PersonOutlineIcon}
                    />
                  </div>

                  <InputField
                    id="email"
                    label={t('auth.schoolEmail')}
                    value={values.email}
                    onChange={handleChange('email')}
                    onBlur={handleEmailBlur}
                    error={getFieldError('email')}
                    type="email"
                    autoComplete="email"
                    startIcon={EmailOutlinedIcon}
                  />

                  {showRoleHint && (
                    <div
                      className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/40"
                      role="status"
                    >
                      <span className="text-slate-700 dark:text-slate-200">
                        {t('auth.suggestedRoleText')} {' '}
                        <strong className="text-emerald-800 dark:text-emerald-300">
                          {roleLabelForUi(roleSuggestion, t)}
                        </strong>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={applySuggestedRole}
                          className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                        >
                          {t('auth.suggestedRoleBtn')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoleDismissed(true)}
                          className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-400"
                        >
                          {t('auth.dismissBtn')}
                        </button>
                      </div>
                    </div>
                  )}

                  <PasswordField
                    id="password"
                    label={t('auth.password')}
                    value={values.password}
                    onChange={handleChange('password')}
                    error={getFieldError('password')}
                    showPassword={showPassword}
                    onToggleVisibility={() => setShowPassword((s) => !s)}
                    strength={passwordStrength}
                    showStrength
                  />

                  <PasswordField
                    id="confirmPassword"
                    label={t('auth.confirmPassword')}
                    value={values.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    error={getFieldError('confirmPassword')}
                    showPassword={showConfirmPassword}
                    onToggleVisibility={() => setShowConfirmPassword((s) => !s)}
                    showStrength={false}
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-5">
                  <fieldset className="min-w-0 border-0 p-0">
                    <legend
                      id="role-legend"
                      className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                    >
                      {t('auth.chooseRoleTitle')}
                    </legend>
                    <p
                      id="role-field-hint"
                      className="mt-1 max-w-2xl text-xs leading-snug text-slate-600 dark:text-slate-400"
                    >
                      {t('auth.chooseRoleHint')}
                    </p>
                    <div
                      role="radiogroup"
                      aria-labelledby="role-legend"
                      aria-describedby="role-field-hint"
                      className="mt-3 grid grid-cols-3 gap-2.5 max-[340px]:grid-cols-1 sm:gap-3 sm:items-stretch"
                    >
                      {ROLES.map((r) => (
                        <RoleCard
                          key={r.id}
                          roleId={r.id}
                          title={r.id === 'student' ? t('auth.roleStudentTitle') : r.id === 'instructor' ? t('auth.roleTeacherTitle') : t('auth.roleParentTitle')}
                          subtitle={r.id === 'student' ? t('auth.roleStudentSub') : r.id === 'instructor' ? t('auth.roleTeacherSub') : t('auth.roleParentSub')}
                          highlights={r.id === 'student' ? [t('auth.roleStudentH1'), t('auth.roleStudentH2')] : r.id === 'instructor' ? [t('auth.roleTeacherH1'), t('auth.roleTeacherH2')] : [t('auth.roleParentH1'), t('auth.roleParentH2')]}
                          selected={values.role === r.id}
                          onSelect={() => {
                            setValues((prev) => ({ ...prev, role: r.id }))
                            setRoleDismissed(true)
                          }}
                        />
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div className="col-span-full flex flex-col items-center gap-4 border-t border-slate-200/90 pt-6 dark:border-slate-600/80 md:col-span-2 md:pt-7">
                  <FormControlLabel
                    className="m-0"
                    control={
                      <Checkbox
                        checked={values.terms}
                        onChange={handleChange('terms')}
                        color="primary"
                        disabled={!termsReadAcknowledged || !privacyReadAcknowledged || !cookieReadAcknowledged}
                        aria-describedby="terms-description terms-legal-hint"
                      />
                    }
                    label={
                      <span
                        id="terms-description"
                        className="text-center text-sm text-slate-600 dark:text-slate-400"
                      >
                        {t('auth.iAgreeTo')} {' '}
                        <button
                          type="button"
                          className="font-medium text-indigo-600 underline decoration-indigo-600/50 underline-offset-2 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:decoration-indigo-400/50 dark:hover:text-indigo-300"
                          onClick={() => setTermsModalOpen(true)}
                        >
                          {t('auth.termsOfService')}
                        </button>{' '}
                        {t('auth.and')} {' '}
                        <button
                          type="button"
                          className="font-medium text-indigo-600 underline decoration-indigo-600/50 underline-offset-2 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:decoration-indigo-400/50 dark:hover:text-indigo-300"
                          onClick={() => setPrivacyModalOpen(true)}
                        >
                          {t('auth.privacyPolicy')}
                        </button>{' '}
                        {t('auth.and')} {' '}
                        <button
                          type="button"
                          className="font-medium text-indigo-600 underline decoration-indigo-600/50 underline-offset-2 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:decoration-indigo-400/50 dark:hover:text-indigo-300"
                          onClick={() => setCookieModalOpen(true)}
                        >
                          {t('auth.cookiePolicy')}
                        </button>
                      </span>
                    }
                  />
                  {(!termsReadAcknowledged || !privacyReadAcknowledged) && (
                    <p
                      id="terms-legal-hint"
                      className="max-w-md text-center text-xs leading-snug text-slate-500 dark:text-slate-400"
                    >
                      {t('auth.termsHint')}
                    </p>
                  )}
                  {attemptedSubmit && validationErrors.terms && (
                    <p
                      className="flex items-center justify-center gap-1 text-center text-sm text-red-600 dark:text-red-400"
                      role="alert"
                    >
                      <span aria-hidden className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      {validationErrors.terms}
                    </p>
                  )}

                  <div className="w-full max-w-xs">
                    <RegisterButton type="submit" disabled={loading}>{t('auth.registerSubmit')}</RegisterButton>
                  </div>

                  <div className="flex w-full max-w-md items-center gap-3 py-1">
                    <span
                      className="h-px flex-1 bg-slate-200 transition-colors dark:bg-slate-600"
                      aria-hidden
                    />
                    <span className="shrink-0 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      {t('auth.orContinueWith')}
                    </span>
                    <span
                      className="h-px flex-1 bg-slate-200 transition-colors dark:bg-slate-600"
                      aria-hidden
                    />
                  </div>

                  <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-slate-300 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                      aria-label="Continue with Google"
                    >
                      <GoogleIcon />
                      Google
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-slate-300 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                      aria-label="Continue with Microsoft"
                    >
                      <MicrosoftIcon />
                      Microsoft
                    </button>
                  </div>
                </div>

                <Typography
                  variant="body2"
                  className="col-span-full text-center text-slate-600 dark:text-slate-400 md:col-span-2"
                >
                  {t('auth.alreadyHaveAccount')} {' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    className="font-semibold text-indigo-600 underline-offset-2 transition-colors hover:text-indigo-500 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {t('auth.logIn')}
                  </Link>
                </Typography>
              </form>
            </div>
          </div>
        </main>
      </div>
      <LegalDocumentModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        document={TERMS_OF_SERVICE[locale]}
        onAcknowledge={() => setTermsReadAcknowledged(true)}
        requireScrollToAcknowledge={REQUIRE_SCROLL_TO_ACKNOWLEDGE_LEGAL}
      />
      <LegalDocumentModal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        document={PRIVACY_POLICY[locale]}
        onAcknowledge={() => setPrivacyReadAcknowledged(true)}
        requireScrollToAcknowledge={REQUIRE_SCROLL_TO_ACKNOWLEDGE_LEGAL}
      />
      <LegalDocumentModal
        open={cookieModalOpen}
        onClose={() => setCookieModalOpen(false)}
        document={COOKIE_POLICY[locale]}
        onAcknowledge={() => setCookieReadAcknowledged(true)}
        requireScrollToAcknowledge={REQUIRE_SCROLL_TO_ACKNOWLEDGE_LEGAL}
      />
    </ThemeProvider>
  )
}
