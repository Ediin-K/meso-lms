import { Box, Card, CardContent, Chip, Typography } from '@mui/material'
import QuizRounded from '@mui/icons-material/QuizRounded'

export default function ProfileQuizActivitySection({ attempts, t }) {
  return (
    <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!border-slate-700/80 dark:!bg-slate-900">
      <CardContent className="!p-6">
        <Typography variant="subtitle1" className="!mb-4 !flex !items-center !gap-2 !font-bold !text-slate-900 dark:!text-white">
          <QuizRounded className="text-violet-600" fontSize="small" />
          {t('studentProfile.quizzes')}
        </Typography>
        {!attempts?.length ? (
          <Typography variant="body2" className="!text-slate-500">
            {t('studentProfile.noQuizzes')}
          </Typography>
        ) : (
          <div className="flex flex-col gap-2">
            {attempts.map((attempt) => (
              <Box
                key={attempt.id}
                className="rounded-xl border border-slate-100 bg-slate-50/30 p-3 dark:border-slate-700 dark:bg-slate-800/40"
              >
                <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                  {attempt.quizTitulli}
                </Typography>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Chip
                    label={attempt.submitted ? t('studentProfile.quizSubmitted') : t('studentProfile.quizInProgress')}
                    size="small"
                    color={attempt.submitted ? 'default' : 'primary'}
                  />
                  {attempt.startedAt && (
                    <Typography variant="caption" className="!text-slate-500">
                      {new Date(attempt.startedAt).toLocaleString()}
                    </Typography>
                  )}
                  {!attempt.submitted && attempt.pikete != null && (
                    <Typography variant="caption" className="!text-slate-500">
                      {t('studentProfile.quizScoreHidden')}
                    </Typography>
                  )}
                </div>
              </Box>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
