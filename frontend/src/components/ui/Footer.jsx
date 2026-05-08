import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded'
import PhoneInTalkRounded from '@mui/icons-material/PhoneInTalkRounded'
import ScheduleRounded from '@mui/icons-material/ScheduleRounded'
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined'
import LinkedIn from '@mui/icons-material/LinkedIn'
import XIcon from '@mui/icons-material/X'

import { useAppPreferences } from '../../context/appPreferencesContext.js'
import { useState } from 'react'
import LegalDocumentModal from '../legal/LegalDocumentModal.jsx'
import {
  PRIVACY_POLICY,
  TERMS_OF_SERVICE,
  COOKIE_POLICY,
} from '../../legal/mesonLegalDocuments.js'

const footerLinkClass =
  'inline-flex text-slate-300 no-underline transition-colors hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'

const legalLinkClass =
  'font-medium text-indigo-600 underline decoration-indigo-600/50 underline-offset-2 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:decoration-indigo-400/50 dark:hover:text-indigo-300'

const columnTitleClass =
  '!text-xs !font-bold !uppercase !tracking-[0.2em] !text-sky-400/95'

export default function Footer() {
  const year = new Date().getFullYear()
  const { t, locale } = useAppPreferences()
  const [activeLegalDoc, setActiveLegalDoc] = useState(null)

  const quick = [
    [t('header.navHome'), '#'],
    [t('header.navCourses'), '#'],
    [t('header.navAssignments'), '#'],
    [t('header.navLibrary'), 'https://www.ubt-uni.net/sq/ubt/jeta-ne-kampus/ubt-biblioteka/'],
  ]

  const legal = [
    { label: t('footer.privacy'), document: PRIVACY_POLICY[locale] },
    { label: t('footer.terms'), document: TERMS_OF_SERVICE[locale] },
    { label: t('footer.cookies'), document: COOKIE_POLICY[locale] },
  ]

  return (
    <Box
      component="footer"
      className="mb-0 w-full rounded-t-3xl rounded-b-none border-t border-sky-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-200 shadow-[0_-16px_48px_-12px_rgba(15,23,42,0.45)]"
    >
      <div
        className="h-1 w-full bg-gradient-to-r from-slate-950 via-sky-500 to-indigo-900 opacity-90"
        aria-hidden
      />

      <Container
        maxWidth={false}
        className="!mx-auto !max-w-7xl !px-5 !py-12 sm:!px-8 lg:!px-12"
      >
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Typography
              className="!mb-3 !bg-gradient-to-r !from-white !to-sky-200 !bg-clip-text !text-3xl !font-black !tracking-tight !text-transparent sm:!text-4xl"
              style={{
                fontFamily:
                  'ui-rounded, "Nunito", "Segoe UI", system-ui, -apple-system, sans-serif',
              }}
              component="div"
            >
              meson
            </Typography>
            <Typography
              variant="body2"
              className="!mb-8 !max-w-md !leading-relaxed !text-slate-400"
            >
              {t('footer.tagline')}
            </Typography>
            <div className="flex gap-2">
              <IconButton
                component="a"
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="!border !border-white/15 !text-slate-300 transition hover:!scale-105 hover:!border-sky-400/60 hover:!bg-sky-500/20 hover:!text-sky-100 active:!scale-95"
                size="small"
              >
                <LinkedIn fontSize="small" />
              </IconButton>
              <IconButton
                component="a"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="!border !border-white/15 !text-slate-300 transition hover:!scale-105 hover:!border-sky-400/60 hover:!bg-sky-500/20 hover:!text-sky-100 active:!scale-95"
                size="small"
              >
                <XIcon fontSize="small" />
              </IconButton>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
            <div>
              <Typography variant="overline" className={columnTitleClass}>
                {t('footer.quick')}
              </Typography>
              <ul className="mt-5 flex list-none flex-col gap-3 p-0">
                {quick.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className={footerLinkClass} variant="body2">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Typography variant="overline" className={columnTitleClass}>
                {t('footer.support')}
              </Typography>
              <ul className="mt-5 flex list-none flex-col gap-4 p-0">
                <li className="flex gap-3">
                  <MailOutlineRounded
                    className="mt-0.5 shrink-0 text-sky-400"
                    fontSize="small"
                  />
                  <div>
                    <Typography variant="caption" className="!block !text-slate-500">
                      {t('footer.email')}
                    </Typography>
                    <Link
                      href="mailto:support@meson-lms.com"
                      className={`${footerLinkClass} !text-sm !font-medium`}
                    >
                      support@meson-lms.com
                    </Link>
                  </div>
                </li>
                <li className="flex gap-3">
                  <PhoneInTalkRounded
                    className="mt-0.5 shrink-0 text-sky-400"
                    fontSize="small"
                  />
                  <div>
                    <Typography variant="caption" className="!block !text-slate-500">
                      {t('footer.phone')}
                    </Typography>
                    <Link
                      href="tel:+38344111222"
                      className={`${footerLinkClass} !text-sm !font-medium`}
                    >
                      +383 44 111 222
                    </Link>
                  </div>
                </li>
                <li className="flex gap-3">
                  <ScheduleRounded
                    className="mt-0.5 shrink-0 text-sky-400"
                    fontSize="small"
                  />
                  <div>
                    <Typography variant="caption" className="!block !text-slate-500">
                      {t('footer.hours')}
                    </Typography>
                    <Typography variant="body2" className="!text-slate-300">
                      {t('footer.hoursVal')}
                    </Typography>
                  </div>
                </li>
              </ul>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <Typography variant="overline" className={columnTitleClass}>
                {t('footer.office')}
              </Typography>
              <div className="mt-5 flex gap-3">
                <LocationOnOutlined
                  className="mt-0.5 shrink-0 text-sky-400"
                  fontSize="small"
                />
                <Typography
                  variant="body2"
                  className="!leading-relaxed !whitespace-pre-line !text-slate-400"
                >
                  {t('footer.officeVal')}
                </Typography>
              </div>
              <ul className="mt-6 flex list-none flex-col gap-2.5 p-0">
                {legal.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => setActiveLegalDoc(item.document)}
                      className={legalLinkClass}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Divider className="!my-12 !border-slate-700/70" />

        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <Typography variant="body2" className="!text-slate-500">
            © {year} Meson LMS. {t('footer.copy')}
          </Typography>
          <Typography variant="body2" className="!max-w-md !text-slate-500">
            {t('footer.helpNote')}
          </Typography>
        </div>
      </Container>
      <LegalDocumentModal
        open={Boolean(activeLegalDoc)}
        onClose={() => setActiveLegalDoc(null)}
        document={activeLegalDoc}
        onAcknowledge={() => {}}
      />
    </Box>
  )
}
