import { useId, useState } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

/**
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} props.value
 * @param {(e: import('react').ChangeEvent<HTMLInputElement>) => void} props.onChange
 * @param {(e: import('react').FocusEvent<HTMLInputElement>) => void} [props.onBlur]
 * @param {string} [props.error]
 * @param {boolean} props.showPassword
 * @param {() => void} props.onToggleVisibility
 * @param {{ label: string, level: string, segments: number }} [props.strength]
 * @param {boolean} [props.showStrength]
 * @param {string} [props.autoComplete]
 * @param {boolean} [props.showCapsLockHint]
 */
export default function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  showPassword,
  onToggleVisibility,
  strength,
  showStrength,
  autoComplete = 'new-password',
  showCapsLockHint = false,
}) {
  const [capsLockOn, setCapsLockOn] = useState(false)
  const hasError = Boolean(error)
  const errId = useId()
  const strengthId = `${id}-strength`
  const capsId = `${id}-caps-hint`
  const describedBy =
    [
      hasError ? errId : null,
      showStrength && strength?.level !== 'none' ? strengthId : null,
      showCapsLockHint && capsLockOn ? capsId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  const syncCapsLock = (e) => {
    if (!showCapsLockHint) return
    try {
      if (typeof e.getModifierState === 'function') {
        setCapsLockOn(e.getModifierState('CapsLock'))
      }
    } catch {
      /* ignore */
    }
  }

  const handleBlur = (e) => {
    if (showCapsLockHint) setCapsLockOn(false)
    onBlur?.(e)
  }

  const strengthColor =
    strength?.level === 'weak'
      ? 'bg-rose-500'
      : strength?.level === 'medium'
        ? 'bg-amber-500'
        : strength?.level === 'strong'
          ? 'bg-emerald-500'
          : 'bg-slate-200'

  return (
    <div className="w-full">
      <TextField
        id={id}
        name={id}
        label={label}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        error={hasError}
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        fullWidth
        variant="outlined"
        aria-invalid={hasError}
        aria-describedby={describedBy}
        slotProps={{
          htmlInput: {
            'aria-describedby': describedBy,
            ...(showCapsLockHint
              ? {
                  onKeyDown: (e) => syncCapsLock(e),
                  onKeyUp: (e) => syncCapsLock(e),
                }
              : {}),
          },
        }}
        FormHelperTextProps={{
          id: hasError ? errId : undefined,
          component: 'div',
          sx: hasError
            ? {
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mx: 0,
              }
            : { mx: 0 },
        }}
        helperText={
          hasError ? (
            <>
              <ErrorOutlineIcon sx={{ fontSize: 16, flexShrink: 0 }} aria-hidden />
              <span>{error}</span>
            </>
          ) : null
        }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlinedIcon className="text-slate-400 dark:text-slate-500" fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={onToggleVisibility}
                edge="end"
                size="small"
                className="text-slate-500 dark:text-slate-400"
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'box-shadow 0.2s ease, transform 0.15s ease',
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.2)',
            },
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(79, 70, 229, 0.45)',
              },
            },
          },
        }}
      />

      {showCapsLockHint && capsLockOn && (
        <p
          id={capsId}
          className="mt-1.5 flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400"
          role="status"
          aria-live="polite"
        >
          <span aria-hidden>⇪</span>
          Caps Lock is on
        </p>
      )}

      {showStrength && value && strength && strength.level !== 'none' && (
        <div
          id={strengthId}
          className="mt-2"
          role="status"
          aria-live="polite"
        >
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Password strength</span>
            <span
              className={
                strength.level === 'weak'
                  ? 'font-medium text-rose-600'
                  : strength.level === 'medium'
                    ? 'font-medium text-amber-600'
                    : 'font-medium text-emerald-600'
              }
            >
              {strength.label}
            </span>
          </div>
          <div className="flex gap-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  i < strength.segments ? strengthColor : 'bg-slate-200 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
