import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import GroupsRounded from '@mui/icons-material/GroupsRounded'
import HubRounded from '@mui/icons-material/HubRounded'
import LockRounded from '@mui/icons-material/LockRounded'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import SecurityRounded from '@mui/icons-material/SecurityRounded'
import SpeedRounded from '@mui/icons-material/SpeedRounded'
import SupportAgentRounded from '@mui/icons-material/SupportAgentRounded'
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded'
import GradingRounded from '@mui/icons-material/GradingRounded'
import ForumRounded from '@mui/icons-material/ForumRounded'

import { useAppPreferences } from '../context/appPreferencesContext.js'
import Footer from '../components/ui/Footer.jsx'
import heroImg from '../assets/images/ubt.webp'

const cardBase =
  'rounded-2xl border border-slate-200/90 bg-slate-50/50 shadow-md shadow-sky-100/30 transition duration-300 dark:!border-slate-700/90 dark:!bg-slate-900/50 dark:shadow-slate-950/40'

const cardHover =
  'hover:-translate-y-1 hover:border-sky-200/90 hover:shadow-lg hover:shadow-sky-200/40 dark:hover:border-sky-600/50 dark:hover:shadow-sky-900/30'

const TEAM = [
  { img: 'https://i.pravatar.cc/400?img=33', key: '1' },
  { img: 'https://i.pravatar.cc/400?img=47', key: '2' },
  { img: 'https://i.pravatar.cc/400?img=12', key: '3' },
  { img: 'https://i.pravatar.cc/400?img=45', key: '4' },
]

const FEATURE_ICONS = [
  MenuBookRounded,
  AssignmentTurnedInRounded,
  GradingRounded,
  ForumRounded,
]

const FEATURE_KEYS = ['featureCourses', 'featureAssignments', 'featureGrades', 'featureCommunication']

const WHY_ICONS = [AutoAwesomeRounded, HubRounded, TrendingUpRounded, SupportAgentRounded]
const WHY_KEYS = ['why1', 'why2', 'why3', 'why4']

export default function About() {
  const { t } = useAppPreferences()

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      <div className="about-page flex min-h-0 flex-1 flex-col rounded-2xl border border-sky-200/45 bg-gradient-to-b from-white via-sky-50/35 to-slate-50 px-2 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-sky-100/40 transition-colors dark:border-slate-700/50 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 dark:ring-slate-800/50 sm:px-4 sm:py-7">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-3xl border border-sky-100/80 bg-slate-900 shadow-xl shadow-sky-200/25 dark:border-slate-700/80 dark:shadow-slate-950/50"
          aria-labelledby="about-hero-heading"
        >
          <div className="absolute inset-0">
            <img
              src={heroImg}
              alt=""
              className="h-full w-full object-cover opacity-90"
              loading="eager"
              decoding="async"
            />
            <div
              className="absolute inset-0 bg-gradient-to-br from-sky-900/92 via-indigo-900/88 to-slate-950/95 dark:from-slate-950/95 dark:via-indigo-950/92 dark:to-slate-950/98"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.15),_transparent_55%)]"
              aria-hidden
            />
          </div>
          <div className="about-hero-enter relative z-[1] mx-auto max-w-3xl px-6 py-14 text-center sm:py-20">
            <Typography
              variant="overline"
              className="!font-semibold !tracking-[0.25em] !text-sky-200/95"
            >
              {t('about.heroOverline')}
            </Typography>
            <Typography
              id="about-hero-heading"
              variant="h3"
              component="h1"
              className="!mt-3 !text-balance !font-bold !leading-tight !text-white sm:!text-4xl md:!text-[2.35rem]"
            >
              {t('about.heroTitle')}
            </Typography>
            <Typography
              variant="body1"
              className="!mx-auto !mt-4 !max-w-2xl !text-slate-100/95 !leading-relaxed"
            >
              {t('about.heroSubtitle')}
            </Typography>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRounded />}
              className="!mt-8 !rounded-full !bg-white !px-8 !py-2.5 !font-semibold !normal-case !text-sky-900 !shadow-lg transition hover:!scale-[1.02] hover:!bg-sky-50 hover:!shadow-xl active:!scale-[0.98] dark:!text-slate-900"
            >
              {t('about.ctaGetStarted')}
            </Button>
          </div>
        </section>

        <Container maxWidth="lg" className="!mt-12 !px-1 sm:!px-3" component="div">
          {/* Mission & Vision */}
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <Card
              elevation={0}
              className={`${cardBase} ${cardHover} about-section-enter border-l-4 border-l-sky-500`}
            >
              <CardContent className="!p-6 sm:!p-8">
                <Typography
                  variant="overline"
                  className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400"
                >
                  {t('about.missionTitle')}
                </Typography>
                <Typography variant="body1" className="!mt-3 !text-slate-700 !leading-relaxed dark:!text-slate-300">
                  {t('about.missionBody')}
                </Typography>
              </CardContent>
            </Card>
            <Card
              elevation={0}
              className={`${cardBase} ${cardHover} about-section-enter border-l-4 border-l-indigo-500`}
              style={{ animationDelay: '80ms' }}
            >
              <CardContent className="!p-6 sm:!p-8">
                <Typography
                  variant="overline"
                  className="!font-bold !tracking-widest !text-indigo-600 dark:!text-indigo-400"
                >
                  {t('about.visionTitle')}
                </Typography>
                <Typography variant="body1" className="!mt-3 !text-slate-700 !leading-relaxed dark:!text-slate-300">
                  {t('about.visionBody')}
                </Typography>
              </CardContent>
            </Card>
          </div>

          {/* What is Meson */}
          <Box className="mt-14 text-center md:text-left">
            <Typography
              variant="overline"
              className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400"
            >
              {t('about.whatTitle')}
            </Typography>
            <Typography
              variant="h4"
              component="h2"
              className="!mt-1 !font-bold !text-slate-900 dark:!text-white"
            >
              Meson LMS
            </Typography>
            <Typography
              variant="body1"
              className="!mx-auto !mt-3 !max-w-3xl !text-slate-600 !leading-relaxed dark:!text-slate-400 md:!mx-0"
            >
              {t('about.whatBody')}
            </Typography>
          </Box>

          <Typography
            variant="subtitle1"
            component="p"
            className="!mt-8 !text-center !font-bold !text-slate-800 dark:!text-slate-200 md:!text-left"
          >
            {t('about.featuresTitle')}
          </Typography>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_KEYS.map((k, i) => {
              const Icon = FEATURE_ICONS[i]
              return (
                <Card
                  key={k}
                  elevation={0}
                  className={`${cardBase} ${cardHover} group h-full`}
                >
                  <CardContent className="!flex !h-full !flex-col !p-5">
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-inner transition group-hover:bg-sky-200/90 dark:bg-sky-950/80 dark:text-sky-300 dark:group-hover:bg-sky-900/90">
                      <Icon fontSize="medium" />
                    </span>
                    <Typography variant="body2" className="!flex-1 !text-slate-600 !leading-relaxed dark:!text-slate-400">
                      {t(`about.${k}`)}
                    </Typography>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Team */}
          <Box className="mt-16">
            <Typography
              variant="overline"
              className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400"
            >
              {t('about.teamTitle')}
            </Typography>
            <Typography variant="h4" component="h2" className="!mt-1 !font-bold !text-slate-900 dark:!text-white">
              {t('about.teamSubtitle')}
            </Typography>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM.map(({ img, key }) => (
                <Card
                  key={key}
                  elevation={0}
                  className={`group ${cardBase} ${cardHover} overflow-hidden p-0`}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 to-transparent opacity-80 dark:from-slate-950/70" />
                  </div>
                  <CardContent className="!p-4">
                    <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white">
                      {t(`about.team${key}Name`)}
                    </Typography>
                    <Typography variant="body2" className="!mt-0.5 !text-sky-700 dark:!text-sky-400">
                      {t(`about.team${key}Role`)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Box>

          {/* Trust */}
          <Card
            elevation={0}
            className={`${cardBase} mt-14 border-sky-200/70 bg-gradient-to-br from-sky-50/90 via-white to-indigo-50/40 dark:border-slate-600/80 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40`}
          >
            <CardContent className="!flex !flex-col gap-4 !p-6 sm:!flex-row sm:!items-start sm:!gap-6 sm:!p-8">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-md ring-1 ring-sky-100 dark:bg-slate-800 dark:text-sky-400 dark:ring-slate-600">
                <SecurityRounded fontSize="large" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <LockRounded className="text-emerald-600 dark:text-emerald-400" fontSize="small" />
                  <Typography variant="h5" component="h2" className="!font-bold !text-slate-900 dark:!text-white">
                    {t('about.trustTitle')}
                  </Typography>
                </div>
                <Typography variant="body1" className="!mt-2 !text-slate-700 !leading-relaxed dark:!text-slate-300">
                  {t('about.trustBody')}
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Box className="mt-14 text-center">
            <Typography
              variant="overline"
              className="!font-semibold !tracking-widest !text-sky-600 dark:!text-sky-400"
            >
              {t('about.statsTitle')}
            </Typography>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'statStudents', value: 'statStudentsVal', icon: SchoolRounded },
                { label: 'statCourses', value: 'statCoursesVal', icon: MenuBookRounded },
                { label: 'statInstructors', value: 'statInstructorsVal', icon: GroupsRounded },
              ].map((stat) => {
                const Glyph = stat.icon
                return (
                  <Card
                    key={stat.label}
                    elevation={0}
                    className={`${cardBase} ${cardHover} !border-sky-100/80 dark:!border-slate-700`}
                  >
                    <CardContent className="!py-8 !text-center">
                      <Glyph className="mx-auto text-sky-600 dark:text-sky-400" fontSize="medium" />
                      <Typography
                        variant="h3"
                        className="!mt-3 !font-bold !tabular-nums !text-slate-900 dark:!text-white"
                      >
                        {t(`about.${stat.value}`)}
                      </Typography>
                      <Typography variant="body2" className="!mt-1 !text-slate-600 dark:!text-slate-400">
                        {t(`about.${stat.label}`)}
                      </Typography>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </Box>

          {/* Why choose us */}
          <Box className="mt-16 mb-4">
            <Typography
              variant="h4"
              component="h2"
              className="!text-center !font-bold !text-slate-900 dark:!text-white md:!text-left"
            >
              {t('about.whyTitle')}
            </Typography>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {WHY_KEYS.map((prefix, i) => {
                const Icon = WHY_ICONS[i]
                return (
                  <Card key={prefix} elevation={0} className={`${cardBase} ${cardHover}`}>
                    <CardContent className="!flex !gap-4 !p-5 sm:!p-6">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                        <Icon fontSize="small" />
                      </span>
                      <div>
                        <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white">
                          {t(`about.${prefix}Title`)}
                        </Typography>
                        <Typography variant="body2" className="!mt-1 !text-slate-600 dark:!text-slate-400">
                          {t(`about.${prefix}Body`)}
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </Box>

          {/* Final CTA */}
          <section
            className="relative mt-12 overflow-hidden rounded-3xl border border-sky-200/60 bg-gradient-to-br from-sky-600 via-indigo-700 to-slate-900 px-6 py-12 text-center shadow-xl dark:border-slate-700/80"
            aria-labelledby="about-cta-heading"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.12),_transparent_50%)]"
              aria-hidden
            />
            <SpeedRounded className="relative z-[1] mx-auto text-white/90" fontSize="large" />
            <Typography
              id="about-cta-heading"
              variant="h4"
              component="h2"
              className="relative z-[1] !mt-3 !font-bold !text-white"
            >
              {t('about.ctaFinalTitle')}
            </Typography>
            <Typography
              variant="body1"
              className="relative z-[1] !mx-auto !mt-2 !max-w-xl !text-sky-100/95"
            >
              {t('about.ctaFinalBody')}
            </Typography>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRounded />}
              className="relative z-[1] !mt-8 !rounded-full !border-0 !bg-white !px-8 !font-semibold !normal-case !text-sky-900 !shadow-lg hover:!bg-sky-50"
            >
              {t('about.ctaLogin')}
            </Button>
          </section>
        </Container>
      </div>

      <div className="relative z-0 mt-12 w-screen max-w-none flex-shrink-0 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] sm:mt-14">
        <Footer />
      </div>

      <style>{`
        @keyframes about-fade-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .about-hero-enter {
          animation: about-fade-up 0.65s ease-out both;
        }
        .about-section-enter {
          animation: about-fade-up 0.55s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .about-hero-enter,
          .about-section-enter {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
