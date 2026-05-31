import { Box, Card, CardContent, Typography } from '@mui/material'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'

export default function ProfileCertificatesSection({ certificates, t }) {
  return (
    <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!border-slate-700/80 dark:!bg-slate-900">
      <CardContent className="!p-6">
        <Typography variant="subtitle1" className="!mb-4 !flex !items-center !gap-2 !font-bold !text-slate-900 dark:!text-white">
          <WorkspacePremiumRounded className="text-green-600" fontSize="small" />
          {t('studentProfile.certificates')}
        </Typography>
        {!certificates?.length ? (
          <Typography variant="body2" className="!text-slate-500">
            {t('studentProfile.noCertificates')}
          </Typography>
        ) : (
          <div className="flex flex-col gap-3">
            {certificates.map((cert) => (
              <Box
                key={cert.id}
                className="rounded-xl border border-green-100 bg-green-50/50 p-4 dark:border-green-900/40 dark:bg-green-900/10"
              >
                <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                  {cert.courseTitulli}
                </Typography>
                <Typography variant="caption" className="!mt-1 !block !text-slate-500">
                  {t('studentProfile.issued')}: {new Date(cert.dataLeshimit).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" className="!mt-1 !block !font-mono !text-green-600 dark:!text-green-400">
                  #{cert.kodiUnik}
                </Typography>
              </Box>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
