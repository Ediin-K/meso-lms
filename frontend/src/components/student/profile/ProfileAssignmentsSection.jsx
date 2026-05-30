import { useMemo, useState } from 'react'
import { Box, Card, CardContent, Chip, Tab, Tabs, Typography } from '@mui/material'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'

const TABS = ['all', 'submitted', 'graded']

export default function ProfileAssignmentsSection({ submissions, t }) {
  const [tab, setTab] = useState('all')

  const filtered = useMemo(() => {
    if (!submissions) return []
    if (tab === 'submitted') {
      return submissions.filter((s) => s.statusi === 'DOREZUAR')
    }
    if (tab === 'graded') {
      return submissions.filter((s) => s.statusi === 'VLERESUAR')
    }
    return submissions
  }, [submissions, tab])

  return (
    <Card elevation={0} className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80">
      <CardContent className="!p-6">
        <Typography variant="subtitle1" className="!mb-2 !flex !items-center !gap-2 !font-bold !text-slate-900 dark:!text-white">
          <AssignmentRounded className="text-amber-600" fontSize="small" />
          {t('studentProfile.assignments')}
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} className="!mb-3 !min-h-0">
          <Tab value="all" label={t('studentProfile.tabAll')} className="!min-h-0 !py-2 !text-xs" />
          <Tab value="submitted" label={t('studentProfile.tabSubmitted')} className="!min-h-0 !py-2 !text-xs" />
          <Tab value="graded" label={t('studentProfile.tabGraded')} className="!min-h-0 !py-2 !text-xs" />
        </Tabs>
        {!filtered.length ? (
          <Typography variant="body2" className="!text-slate-500">
            {t('studentProfile.noAssignments')}
          </Typography>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.slice(0, 10).map((sub) => (
              <Box
                key={sub.id}
                className="rounded-xl border border-slate-100 p-3 dark:border-slate-700"
              >
                <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                  {sub.assignmentTitulli}
                </Typography>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Chip label={sub.statusi} size="small" className="!text-xs" />
                  {sub.nota != null && (
                    <Typography variant="caption" className="!font-bold !text-sky-600">
                      {t('studentProfile.grade')}: {sub.nota}
                    </Typography>
                  )}
                  {sub.submittedAt && (
                    <Typography variant="caption" className="!text-slate-500">
                      {new Date(sub.submittedAt).toLocaleDateString()}
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
