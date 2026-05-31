import { useState } from 'react'
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, Typography,
} from '@mui/material'
import PersonRounded from '@mui/icons-material/PersonRounded'
import EditRounded from '@mui/icons-material/EditRounded'

function initials(emri, mbiemri) {
  const a = (emri || '').trim().charAt(0)
  const b = (mbiemri || '').trim().charAt(0)
  return `${a}${b}`.toUpperCase() || '?'
}

export default function ProfileHeaderCard({ profile, t, onSave, saving }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ emri: '', mbiemri: '', phoneNumber: '' })

  const openEdit = () => {
    setForm({
      emri: profile?.emri || '',
      mbiemri: profile?.mbiemri || '',
      phoneNumber: profile?.phoneNumber || '',
    })
    setOpen(true)
  }

  const handleSave = async () => {
    await onSave(form)
    setOpen(false)
  }

  if (!profile) return null

  return (
    <>
      <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!border-slate-700/80 dark:!bg-slate-900">
        <CardContent className="!p-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
              {initials(profile.emri, profile.mbiemri)}
            </div>
            <Typography variant="h6" className="!font-bold !text-slate-900 dark:!text-white">
              {profile.emri} {profile.mbiemri}
            </Typography>
            <Chip label={t('studentProfile.roleStudent')} size="small" color="primary" className="!mt-2 !font-bold" />
            <Typography variant="body2" className="!mt-3 !text-slate-600 dark:!text-slate-300">
              {profile.email}
            </Typography>
            {profile.phoneNumber ? (
              <Typography variant="body2" className="!text-slate-500">
                {profile.phoneNumber}
              </Typography>
            ) : null}
            {profile.dataKrijimit ? (
              <Typography variant="caption" className="!mt-2 !text-slate-500">
                {t('studentProfile.memberSince')}: {new Date(profile.dataKrijimit).toLocaleDateString()}
              </Typography>
            ) : null}
            {profile.categoryName ? (
              <Typography variant="caption" className="!mt-1 !block !text-sky-600 dark:!text-sky-400">
                {profile.categoryName}
                {profile.currentSemester ? ` · ${t('studentProfile.semester')} ${profile.currentSemester}` : ''}
              </Typography>
            ) : null}
            <Button
              startIcon={<EditRounded />}
              variant="outlined"
              size="small"
              className="!mt-4"
              onClick={openEdit}
              aria-label={t('studentProfile.edit')}
            >
              {t('studentProfile.edit')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('studentProfile.editTitle')}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          <TextField
            label={t('studentProfile.firstName')}
            value={form.emri}
            onChange={(e) => setForm((f) => ({ ...f, emri: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label={t('studentProfile.lastName')}
            value={form.mbiemri}
            onChange={(e) => setForm((f) => ({ ...f, mbiemri: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label={t('studentProfile.phone')}
            value={form.phoneNumber}
            onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('studentProfile.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {t('studentProfile.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
