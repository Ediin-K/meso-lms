import { Link } from 'react-router-dom'
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material'
import GroupsRounded from '@mui/icons-material/GroupsRounded'

export default function ProfileGroupSection({ groupStatus, t }) {
  const approved = groupStatus?.approvedGroup
  const pending = groupStatus?.pendingRequest

  return (
    <Card elevation={0} className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80">
      <CardContent className="!p-6">
        <Typography variant="subtitle1" className="!mb-4 !flex !items-center !gap-2 !font-bold !text-slate-900 dark:!text-white">
          <GroupsRounded className="text-indigo-600" fontSize="small" />
          {t('studentProfile.group')}
        </Typography>
        <div className="flex flex-col gap-2">
          {groupStatus?.categoryName && (
            <Typography variant="body2" className="!text-slate-700 dark:!text-slate-200">
              <span className="font-semibold">{t('studentProfile.category')}:</span> {groupStatus.categoryName}
            </Typography>
          )}
          {groupStatus?.currentSemester != null && (
            <Typography variant="body2" className="!text-slate-700 dark:!text-slate-200">
              <span className="font-semibold">{t('studentProfile.semester')}:</span> {groupStatus.currentSemester}
            </Typography>
          )}
          {approved ? (
            <Box className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/40 dark:bg-indigo-900/10">
              <Typography variant="body2" className="!font-semibold">
                {approved.name || t('studentProfile.approvedGroup')}
              </Typography>
              <Chip label={t('studentProfile.approved')} size="small" color="success" className="!mt-2" />
            </Box>
          ) : pending ? (
            <Chip label={t('studentProfile.pendingRequest')} color="warning" size="small" />
          ) : (
            <Typography variant="body2" className="!text-slate-500">
              {t('studentProfile.noGroup')}
            </Typography>
          )}
        </div>
        <Button component={Link} to="/student/groups" variant="text" size="small" className="!mt-4">
          {t('studentProfile.manageGroup')}
        </Button>
      </CardContent>
    </Card>
  )
}
