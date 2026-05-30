import { Card, CardContent, Typography } from '@mui/material'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded'
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded'

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <Card elevation={0} className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80">
      <CardContent className="!flex !items-center !gap-3 !p-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
          <Icon fontSize="small" />
        </div>
        <div>
          <Typography variant="caption" className="!font-semibold !uppercase !tracking-wide !text-slate-500">
            {label}
          </Typography>
          <Typography variant="h5" className="!font-extrabold !text-slate-900 dark:!text-white">
            {value}
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfileStatsRow({ stats, t }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={SchoolRounded}
        label={t('studentProfile.stats.courses')}
        value={stats.courseCount}
        colorClass="bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400"
      />
      <StatCard
        icon={WorkspacePremiumRounded}
        label={t('studentProfile.stats.certificates')}
        value={stats.certificateCount}
        colorClass="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
      />
      <StatCard
        icon={TrendingUpRounded}
        label={t('studentProfile.stats.progress')}
        value={`${stats.avgProgress}%`}
        colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
      />
      <StatCard
        icon={AssignmentTurnedInRounded}
        label={t('studentProfile.stats.submissions')}
        value={stats.submissionCount}
        colorClass="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
      />
    </div>
  )
}
