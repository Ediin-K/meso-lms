import { useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, Chip, LinearProgress, Typography } from '@mui/material'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import PlayCircleFilledRounded from '@mui/icons-material/PlayCircleFilledRounded'

export default function ProfileCoursesSection({ enrollments, t }) {
  const navigate = useNavigate()

  return (
    <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!border-slate-700/80 dark:!bg-slate-900">
      <CardContent className="!p-6">
        <Typography variant="subtitle1" className="!mb-4 !flex !items-center !gap-2 !font-bold !text-slate-900 dark:!text-white">
          <SchoolRounded className="text-sky-600" fontSize="small" />
          {t('studentProfile.courses')}
        </Typography>
        {!enrollments?.length ? (
          <Box>
            <Typography variant="body2" className="!text-slate-500">
              {t('studentProfile.noCourses')}
            </Typography>
            <button
              type="button"
              className="mt-3 text-sm font-semibold text-sky-600 hover:underline dark:text-sky-400"
              onClick={() => navigate('/courses')}
            >
              {t('studentProfile.browseCourses')}
            </button>
          </Box>
        ) : (
          <div className="flex flex-col gap-3">
            {enrollments.map((enrollment) => (
              <Box
                key={enrollment.id}
                className="cursor-pointer rounded-xl border border-slate-100 bg-slate-50/30 p-4 transition-colors hover:bg-sky-50/50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                onClick={() => navigate(`/course/${enrollment.courseId}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/course/${enrollment.courseId}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                      {enrollment.courseTitulli}
                    </Typography>
                    {(enrollment.courseGroupName || enrollment.professorName) && (
                      <Typography variant="caption" className="!mt-1 !block !text-slate-500">
                        {[enrollment.courseGroupName, enrollment.professorName].filter(Boolean).join(' · ')}
                      </Typography>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Chip
                        label={enrollment.statusi}
                        size="small"
                        color={enrollment.statusi === 'AKTIV' ? 'success' : 'default'}
                        className="!text-xs !font-bold"
                      />
                      <Typography variant="caption" className="!text-slate-500">
                        {new Date(enrollment.dataRegjistrimit).toLocaleDateString()}
                      </Typography>
                    </div>
                    {enrollment.progresi != null && (
                      <Box className="mt-3">
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, Math.max(0, enrollment.progresi))}
                          className="!h-2 !rounded-full"
                        />
                        <Typography variant="caption" className="!mt-1 !text-slate-500">
                          {Math.round(enrollment.progresi)}% {t('studentProfile.progressLabel')}
                        </Typography>
                      </Box>
                    )}
                  </div>
                  <PlayCircleFilledRounded className="shrink-0 text-sky-500" fontSize="small" />
                </div>
              </Box>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
