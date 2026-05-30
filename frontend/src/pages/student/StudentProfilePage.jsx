import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Box, CircularProgress, Container, Snackbar, Typography } from '@mui/material'
import { useAppPreferences } from '../../context/appPreferencesContext'
import Footer from '../../components/ui/Footer'
import ProfileHeaderCard from '../../components/student/profile/ProfileHeaderCard'
import ProfileStatsRow from '../../components/student/profile/ProfileStatsRow'
import ProfileCoursesSection from '../../components/student/profile/ProfileCoursesSection'
import ProfileCertificatesSection from '../../components/student/profile/ProfileCertificatesSection'
import ProfileGroupSection from '../../components/student/profile/ProfileGroupSection'
import ProfileAssignmentsSection from '../../components/student/profile/ProfileAssignmentsSection'
import ProfileQuizActivitySection from '../../components/student/profile/ProfileQuizActivitySection'
import ProfileSchedulePreview from '../../components/student/profile/ProfileSchedulePreview'
import ProfileSettingsSection from '../../components/student/profile/ProfileSettingsSection'
import {
  getStudentProfile,
  updateStudentProfile,
  getStudentEnrollments,
  getStudentCertificates,
  getStudentAssignmentSubmissions,
  getMyQuizAttempts,
} from '../../services/studentProfileService'
import { getStudentGroupStatus, getStudentScheduleOverview } from '../../services/studentGroupService'

export default function StudentProfilePage() {
  const { t } = useAppPreferences()
  const userId = localStorage.getItem('userId')

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [certificates, setCertificates] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [groupStatus, setGroupStatus] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [quizAttempts, setQuizAttempts] = useState([])
  const [savingProfile, setSavingProfile] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const notify = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  const loadData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const results = await Promise.allSettled([
      getStudentProfile(userId),
      getStudentEnrollments(userId),
      getStudentCertificates(userId),
      getStudentAssignmentSubmissions(userId),
      getStudentGroupStatus(userId),
      getStudentScheduleOverview(userId),
      getMyQuizAttempts(),
    ])

    if (results[0].status === 'fulfilled') setProfile(results[0].value)
    if (results[1].status === 'fulfilled') setEnrollments(results[1].value)
    if (results[2].status === 'fulfilled') setCertificates(results[2].value)
    if (results[3].status === 'fulfilled') setSubmissions(results[3].value)
    if (results[4].status === 'fulfilled') setGroupStatus(results[4].value)
    if (results[5].status === 'fulfilled') {
      setSchedules(results[5].value?.approvedSchedules || [])
    }
    if (results[6].status === 'fulfilled') setQuizAttempts(results[6].value)

    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const stats = useMemo(() => {
    const active = enrollments.filter((e) => e.statusi === 'AKTIV')
    const progressValues = active
      .map((e) => e.progresi)
      .filter((p) => p != null)
    const avgProgress = progressValues.length
      ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length)
      : 0
    return {
      courseCount: enrollments.length,
      certificateCount: certificates.length,
      avgProgress,
      submissionCount: submissions.length,
    }
  }, [enrollments, certificates, submissions])

  const handleSaveProfile = async (form) => {
    try {
      setSavingProfile(true)
      const updated = await updateStudentProfile(userId, form)
      setProfile(updated)
      notify(t('studentProfile.saveSuccess'))
    } catch (err) {
      notify(err.response?.data?.message || t('studentProfile.saveError'), 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-24">
        <CircularProgress className="!text-sky-500" />
      </Box>
    )
  }

  return (
    <section className="flex min-h-screen flex-col">
      <Container maxWidth="lg" className="mt-4 flex-grow px-4 py-8 sm:mt-8 sm:px-6 lg:px-8">
        <Box className="mb-10">
          <Typography variant="overline" className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400">
            {t('studentProfile.overline')}
          </Typography>
          <Typography variant="h3" component="h1" className="!mt-1 !font-extrabold !text-slate-900 dark:!text-white">
            {t('studentProfile.title')}
          </Typography>
        </Box>

        <div className="mb-6">
          <ProfileStatsRow stats={stats} t={t} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-1">
            <ProfileHeaderCard
              profile={profile}
              t={t}
              onSave={handleSaveProfile}
              saving={savingProfile}
            />
            <ProfileGroupSection groupStatus={groupStatus} t={t} />
            <ProfileSettingsSection userId={userId} t={t} onNotify={notify} />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-2">
            <ProfileCoursesSection enrollments={enrollments} t={t} />
            <ProfileCertificatesSection certificates={certificates} t={t} />
            <ProfileAssignmentsSection submissions={submissions} t={t} />
            <ProfileQuizActivitySection attempts={quizAttempts} t={t} />
            <ProfileSchedulePreview schedules={schedules} t={t} />
          </div>
        </div>
      </Container>
      <Footer />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </section>
  )
}
