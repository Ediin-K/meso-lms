import { Link } from 'react-router-dom'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded'

const DAY_NAMES = {
  MONDAY: 'E hënë',
  TUESDAY: 'E martë',
  WEDNESDAY: 'E mërkurë',
  THURSDAY: 'E enjte',
  FRIDAY: 'E premte',
  SATURDAY: 'E shtunë',
  SUNDAY: 'E diel',
}

export default function ProfileSchedulePreview({ schedules, t }) {
  const preview = (schedules || []).slice(0, 5)

  return (
    <Card elevation={0} className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80">
      <CardContent className="!p-6">
        <Typography variant="subtitle1" className="!mb-4 !flex !items-center !gap-2 !font-bold !text-slate-900 dark:!text-white">
          <CalendarMonthRounded className="text-sky-600" fontSize="small" />
          {t('studentProfile.schedule')}
        </Typography>
        {!preview.length ? (
          <Typography variant="body2" className="!text-slate-500">
            {t('studentProfile.noSchedule')}
          </Typography>
        ) : (
          <div className="flex flex-col gap-2">
            {preview.map((session) => (
              <Box
                key={session.id}
                className="rounded-xl border border-slate-100 p-3 dark:border-slate-700"
              >
                <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                  {session.courseTitle}
                </Typography>
                <Typography variant="caption" className="!mt-1 !block !text-slate-500">
                  {DAY_NAMES[session.dayOfWeek] || session.dayOfWeek}
                  {session.startTime ? ` · ${String(session.startTime).slice(0, 5)}` : ''}
                  {session.endTime ? `–${String(session.endTime).slice(0, 5)}` : ''}
                  {session.room ? ` · ${session.room}` : ''}
                </Typography>
              </Box>
            ))}
          </div>
        )}
        <Button component={Link} to="/student/schedules" variant="text" size="small" className="!mt-4">
          {t('studentProfile.fullSchedule')}
        </Button>
      </CardContent>
    </Card>
  )
}
