import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

/**
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} props.value
 * @param {(e: import('react').ChangeEvent<HTMLInputElement>) => void} props.onChange
 * @param {(e: import('react').FocusEvent<HTMLInputElement>) => void} [props.onBlur]
 * @param {string} [props.error]
 * @param {import('react').ReactNode} [props.helperText]
 * @param {string} [props.type]
 * @param {boolean} [props.autoFocus]
 * @param {string} [props.autoComplete]
 * @param {import('react').ElementType | null} [props.startIcon]
 * @param {string} [props.placeholder]
 * @param {string} [props['aria-describedby']]
 */
export default function InputField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  type = 'text',
  autoFocus,
  autoComplete,
  startIcon: StartIcon,
  placeholder,
  inputProps,
  'aria-describedby': ariaDescribedBy,
}) {
  const hasError = Boolean(error)
  const describedBy = [ariaDescribedBy, hasError ? `${id}-error-text` : null]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <TextField
      id={id}
      name={id}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={hasError}
      type={type}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      placeholder={placeholder}
      fullWidth
      variant="outlined"
      aria-invalid={hasError}
      aria-describedby={describedBy}
      slotProps={{
        htmlInput: {
          'aria-describedby': describedBy,
          ...inputProps,
        },
      }}
      FormHelperTextProps={{
        id: hasError ? `${id}-error-text` : undefined,
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
        ) : (
          helperText
        )
      }
      InputProps={{
        ...(StartIcon && {
          startAdornment: (
            <InputAdornment position="start">
              <StartIcon className="text-slate-400 dark:text-slate-500" fontSize="small" />
            </InputAdornment>
          ),
        }),
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
  )
}
