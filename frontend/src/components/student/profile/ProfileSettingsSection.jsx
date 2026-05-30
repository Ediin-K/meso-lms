import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Card, CardContent, TextField, Typography, ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import SettingsRounded from '@mui/icons-material/SettingsRounded'
import { useAppPreferences } from '../../../context/appPreferencesContext'
import { logout as authLogout } from '../../../services/authService'
import { changePassword } from '../../../services/studentProfileService'

export default function ProfileSettingsSection({ userId, t, onNotify }) {
  const navigate = useNavigate()
  const { locale, setLocale, colorMode, toggleColorMode } = useAppPreferences()
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)

  const handlePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      onNotify(t('studentProfile.passwordMismatch'), 'error')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      onNotify(t('studentProfile.passwordTooShort'), 'error')
      return
    }
    try {
      setSaving(true)
      await changePassword(userId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      onNotify(t('studentProfile.passwordChanged'), 'success')
    } catch (err) {
      onNotify(err.response?.data?.message || t('studentProfile.passwordError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    authLogout()
    navigate('/login')
  }

  return (
    <Card elevation={0} className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80">
      <CardContent className="!p-6">
        <Typography variant="subtitle1" className="!mb-4 !flex !items-center !gap-2 !font-bold !text-slate-900 dark:!text-white">
          <SettingsRounded fontSize="small" />
          {t('studentProfile.settings')}
        </Typography>

        <Typography variant="caption" className="!mb-2 !block !font-semibold !uppercase !text-slate-500">
          {t('studentProfile.appearance')}
        </Typography>
        <Box className="mb-4 flex flex-wrap gap-2">
          <ToggleButtonGroup
            exclusive
            size="small"
            value={locale}
            onChange={(_, v) => v && setLocale(v)}
            aria-label={t('studentProfile.language')}
          >
            <ToggleButton value="sq">SQ</ToggleButton>
            <ToggleButton value="en">EN</ToggleButton>
          </ToggleButtonGroup>
          <Button variant="outlined" size="small" onClick={toggleColorMode}>
            {colorMode === 'dark' ? t('studentProfile.themeLight') : t('studentProfile.themeDark')}
          </Button>
        </Box>

        <Typography variant="caption" className="!mb-2 !block !font-semibold !uppercase !text-slate-500">
          {t('studentProfile.changePassword')}
        </Typography>
        <form onSubmit={handlePassword} className="flex flex-col gap-3">
          <TextField
            type="password"
            label={t('studentProfile.currentPassword')}
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
            required
            size="small"
            fullWidth
          />
          <TextField
            type="password"
            label={t('studentProfile.newPassword')}
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
            required
            size="small"
            fullWidth
          />
          <TextField
            type="password"
            label={t('studentProfile.confirmPassword')}
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            required
            size="small"
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={saving}>
            {t('studentProfile.updatePassword')}
          </Button>
        </form>

        <Button
          variant="outlined"
          color="error"
          className="!mt-6 !w-full"
          onClick={handleLogout}
        >
          {t('studentProfile.logout')}
        </Button>
      </CardContent>
    </Card>
  )
}
