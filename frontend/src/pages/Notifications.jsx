import { useState } from 'react'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded'
import CheckCircleOutlineRounded from '@mui/icons-material/CheckCircleOutlineRounded'
import Button from '@mui/material/Button'
import { useAppPreferences } from '../context/appPreferencesContext.js'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Zoom from '@mui/material/Zoom'
import Footer from '../components/ui/Footer.jsx'

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Mbledhje kursi “Struktura diskrete”',
    message: 'E premte 10:00, salla 404. Pjesëmarrja është e detyrueshme për studentët e vitit të dytë.',
    date: '1 Maj 2026',
    unread: true,
  },
  {
    id: 2,
    title: 'Materialet e javës 7',
    message: 'Materialet janë publikuar në lëndën “Sisteme dhe sinjale”. Ju lutem kontrolloni seksionin e dokumenteve.',
    date: '28 Prill 2026',
    unread: false,
  },
  {
    id: 3,
    title: 'Provimi i ndërmjetëm',
    message: 'Afati i fundit për regjistrimin e provimit në SEMS është data 5 Maj.',
    date: '25 Prill 2026',
    unread: false,
  },
]

export default function Notifications() {
  const { t } = useAppPreferences()
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    )
    setSnackbarMessage("Njoftimi u shënua si i lexuar.")
    setOpenSnackbar(true)
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    setSnackbarMessage("Të gjitha njoftimet u shënuan si të lexuara.")
    setOpenSnackbar(true)
  }

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      <Container maxWidth="md" className="px-4! sm:px-6!" sx={{ mt: 4, mb: 6, flexGrow: 1 }}>
        <Box className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Typography variant="h4" component="h1" className="font-bold! text-slate-800! dark:text-white!">
              {t('notifications.title')}
            </Typography>
            <Typography variant="body1" className="mt-1! text-slate-600! dark:text-slate-400!">
              {t('notifications.subtitle')}
            </Typography>
          </div>
          {notifications.some(n => n.unread) && (
            <Button
              variant="outlined"
              size="small"
              onClick={markAllAsRead}
              className="rounded-lg! border-sky-200! text-sky-700! hover:bg-sky-50! dark:border-sky-800! dark:text-sky-400! dark:hover:bg-sky-950/40!"
            >
              {t('notifications.markAllRead')}
            </Button>
          )}
        </Box>

        <div className="flex flex-col gap-4">
          {notifications.length === 0 ? (
            <Card elevation={0} className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl! border! border-slate-200/80! bg-slate-50/60! shadow-sm! dark:border-slate-700/60! dark:bg-slate-900/80! dark:shadow-black/20!">
              <NotificationsActiveRounded className="text-slate-300 dark:text-slate-500 mb-4" sx={{ fontSize: 48 }} />
              <Typography variant="h6" className="font-semibold! text-slate-700! dark:text-slate-300!">
                {t('notifications.empty')}
              </Typography>
            </Card>
          ) : (
            notifications.map(notif => (
              <Card
                key={notif.id}
                className={`group relative overflow-hidden rounded-2xl! border! ${
                  notif.unread
                    ? 'border-sky-200/80! bg-gradient-to-r! from-sky-50/80! to-white/90! shadow-md! shadow-sky-100/50! dark:border-sky-700/50! dark:from-sky-900/40! dark:to-slate-900/80! dark:shadow-sky-900/20!'
                    : 'border-slate-200/80! bg-white/70! shadow-sm! dark:border-slate-700/60! dark:bg-slate-900/80! dark:shadow-black/20!'
                } transition-all hover:border-sky-300/80! hover:shadow-md! dark:hover:border-sky-600/60!`}
                elevation={0}
              >
                {notif.unread && (
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b! from-sky-400! to-sky-600! dark:from-sky-400! dark:to-sky-500!"></div>
                )}
                <div className="flex items-start gap-4 p-4 sm:p-5 pl-5 sm:pl-6">
                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                    notif.unread
                      ? 'bg-gradient-to-br! from-sky-100! to-sky-200! text-sky-700! ring-1 ring-sky-300/50 dark:from-sky-900/80! dark:to-sky-800/50! dark:text-sky-300! dark:ring-sky-700/50'
                      : 'bg-slate-100! text-slate-500! ring-1 ring-slate-200/50 dark:bg-slate-800! dark:text-slate-400! dark:ring-slate-700/50'
                  }`}>
                    <NotificationsActiveRounded fontSize="small" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <Typography variant="subtitle1" className={`!font-bold ${
                        notif.unread ? 'text-slate-900! dark:text-white!' : 'text-slate-700! dark:text-slate-200!'
                      }`}>
                        {notif.title}
                      </Typography>
                      <Typography variant="caption" className="font-medium! text-slate-500! dark:text-slate-400! whitespace-nowrap">
                        {notif.date}
                      </Typography>
                    </div>
                    <Typography variant="body2" className="text-slate-600! dark:text-slate-300! leading-relaxed!">
                      {notif.message}
                    </Typography>
                  </div>

                  {notif.unread && (
                    <IconButton
                      size="small"
                      onClick={() => markAsRead(notif.id)}
                      className="text-slate-400! hover:text-sky-600! hover:bg-sky-50! dark:text-slate-500! dark:hover:text-sky-400! dark:hover:bg-sky-900/40! transition-colors"
                      aria-label="Mark as read"
                    >
                      <CheckCircleOutlineRounded fontSize="small" />
                    </IconButton>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </Container>
      
      <div className="relative z-0 mt-auto w-screen max-w-none flex-shrink-0 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
        <Footer />
      </div>

      {}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Zoom}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ 
            width: "100%", 
            borderRadius: "1.25rem",
            fontWeight: "bold",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}
