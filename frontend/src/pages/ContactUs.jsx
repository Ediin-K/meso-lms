import { useMemo, useState } from 'react'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import { useAppPreferences } from '../context/appPreferencesContext.js'
import Footer from "../components/ui/Footer.jsx";

const inputStyle = {
    '& .MuiInputBase-input': { color: '#0f172a' },
    '& .MuiInputBase-input::placeholder': { color: '#64748b', opacity: 1 },
    '& .MuiInputLabel-root': { color: '#475569' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#4F46E5' },
    '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#e2e8f0' },
        '&:hover fieldset': { borderColor: '#94a3b8' },
        '&.Mui-focused fieldset': { borderColor: '#4F46E5' },
    },
    '.dark & .MuiInputBase-input': { color: '#f1f5f9' },
    '.dark & .MuiInputBase-input::placeholder': { color: '#94a3b8', opacity: 1 },
    '.dark & .MuiInputLabel-root': { color: '#94a3b8' },
    '.dark & .MuiOutlinedInput-root fieldset': { borderColor: '#334155' },
}

const SELECT_SLOT_PROPS = {
    select: {
        MenuProps: { disableScrollLock: true },
    },
}

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const initialForm = {
    name: '',
    email: '',
    role: '',
    topic: '',
    message: '',
}

function validate(form) {
    const e = {}
    if (!form.name.trim()) e.name = 'E detyrueshme.'
    if (!isValidEmail(form.email)) e.email = 'Email i pavlefshëm.'
    if (!form.role) e.role = 'E detyrueshme.'
    if (!form.topic) e.topic = 'E detyrueshme.'
    if (form.message.trim().length < 15) e.message = 'Minimum 15 karaktere.'
    return e
}

export default function Contact() {
    const [form, setForm] = useState(initialForm)
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const { t } = useAppPreferences()

    const charCount = useMemo(() => Math.min(form.message.length, 600), [form.message])

    const handleChange = (field) => (e) => {
        let value = e.target.value
        if (field === 'message' && value.length > 600) value = value.slice(0, 600)
        setForm((p) => ({ ...p, [field]: value }))
        setErrors((p) => ({ ...p, [field]: undefined }))
        setSubmitted(false)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = validate(form)
        setErrors(err)
        if (Object.keys(err).length) return
        setSubmitted(true)
        setForm(initialForm)
    }

    const handleReset = () => {
        setForm(initialForm)
        setErrors({})
        setSubmitted(false)
    }

    return (
        <>
        <Container maxWidth="sm" className="!py-10">
            <Box className="space-y-6 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl dark:border-slate-700/90 dark:bg-slate-900">

                <Box className="text-center">
                    <Typography variant="h5" className="font-bold text-slate-900 dark:text-white">
                        {t('contact.title')}
                    </Typography>
                    <Typography variant="body2" className="mt-1 text-slate-500 dark:text-slate-400">
                        {t('contact.header')}
                    </Typography>
                </Box>

                {submitted && (
                    <Alert severity="success" onClose={() => setSubmitted(false)}>
                        {t('contact.alert')}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate className="space-y-4">

                    <TextField
                        label={t('contact.name')}
                        value={form.name}
                        onChange={handleChange('name')}
                        error={!!errors.name}
                        helperText={errors.name}
                        fullWidth
                        autoComplete="name"
                        sx={inputStyle}
                    />

                    <TextField
                        label={t('contact.email')}
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        error={!!errors.email}
                        helperText={errors.email}
                        fullWidth
                        autoComplete="email"
                        sx={inputStyle}
                    />

                    <TextField
                        select
                        label={t('contact.role.r')}
                        value={form.role}
                        onChange={handleChange('role')}
                        error={!!errors.role}
                        helperText={errors.role}
                        fullWidth
                        sx={inputStyle}
                        slotProps={SELECT_SLOT_PROPS}
                    >
                        <MenuItem value="student">{t('contact.role.r1')}</MenuItem>
                        <MenuItem value="teacher">{t('contact.role.r2')}</MenuItem>
                        <MenuItem value="parent">{t('contact.role.r3')}</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label={t('contact.topic.t')}
                        value={form.topic}
                        onChange={handleChange('topic')}
                        error={!!errors.topic}
                        helperText={errors.topic}
                        fullWidth
                        sx={inputStyle}
                        slotProps={SELECT_SLOT_PROPS}
                    >
                        <MenuItem value="access">{t('contact.topic.t1')}</MenuItem>
                        <MenuItem value="course">{t('contact.topic.t2')}</MenuItem>
                        <MenuItem value="grade">{t('contact.topic.t3')}</MenuItem>
                        <MenuItem value="technical">{t('contact.topic.t4')}</MenuItem>
                        <MenuItem value="billing">{t('contact.topic.t5')}</MenuItem>
                        <MenuItem value="other">{t('contact.topic.t6')}</MenuItem>
                    </TextField>

                    <TextField
                        label={t('contact.message')}
                        value={form.message}
                        onChange={handleChange('message')}
                        error={!!errors.message}
                        helperText={
                            errors.message ?? (
                                <span className="dark:text-slate-400">{charCount} / 600</span>
                            )
                        }
                        multiline
                        minRows={5}
                        fullWidth
                        sx={inputStyle}
                    />

                    <Box className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{
                                backgroundColor: '#4F46E5',
                                '&:hover': { backgroundColor: '#4338CA' },
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                paddingY: '10px',
                            }}
                        >
                            {t('contact.btn')}
                        </Button>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={handleReset}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                borderColor: '#e2e8f0',
                                color: '#64748b',
                                '&:hover': { borderColor: '#94a3b8' },
                            }}
                        >
                            {t('contact.clr')}
                        </Button>
                    </Box>

                </Box>

                <Typography variant="caption" className="block text-center text-slate-400 dark:text-slate-500">
                    {t('contact.link')}
                    <a
                        href="mailto:support@meson.edu"
                        className="text-indigo-500 hover:underline"
                    >
                        support@meson.edu
                    </a>
                </Typography>

            </Box>
        </Container>
            <Footer/>
        </>
    )
}
