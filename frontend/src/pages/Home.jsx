import { useMemo, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'

import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import PaletteRounded from '@mui/icons-material/PaletteRounded'
import CodeRounded from '@mui/icons-material/CodeRounded'
import GraphicEqRounded from '@mui/icons-material/GraphicEqRounded'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import ViewQuiltRounded from '@mui/icons-material/ViewQuiltRounded'
import ThreeDRotationRounded from '@mui/icons-material/ThreeDRotationRounded'
import CampaignRounded from '@mui/icons-material/CampaignRounded'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import SearchRounded from '@mui/icons-material/SearchRounded'
import StarRounded from '@mui/icons-material/StarRounded'
import GroupsRounded from '@mui/icons-material/GroupsRounded'
import CastForEducationRounded from '@mui/icons-material/CastForEducationRounded'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import FormatQuoteRounded from '@mui/icons-material/FormatQuoteRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'

import { useAppPreferences } from '../context/appPreferencesContext.js'
import { STRINGS } from '../lib/mesonStrings.js'
import Footer from '../components/ui/Footer.jsx'
import heroImg from '../assets/images/ubt.webp'
import { useNavigate } from 'react-router-dom'

const SLIDE_ACCENTS = [
  'from-sky-600/90 via-cyan-600/75 to-indigo-800/85',
  'from-indigo-700/90 via-violet-600/80 to-sky-700/85',
  'from-teal-700/88 via-sky-600/80 to-blue-900/88',
  'from-slate-800/90 via-sky-800/75 to-indigo-900/88',
]

const universities = [
  { title: 'Universiteti UBT', meta: 'Prishtinë · Kosovë', icon: SchoolRounded },
  { title: 'Universiteti i Prishtinës', meta: 'Prishtinë · Kosovë', icon: SchoolRounded },
  { title: 'Universiteti i Tiranës', meta: 'Tiranë · Shqipëri', icon: SchoolRounded },
  { title: 'Universiteti Politeknik i Tiranës', meta: 'Tiranë · Shqipëri', icon: SchoolRounded },
  { title: 'Universiteti i Shkodrës', meta: 'Shkodër · Shqipëri', icon: SchoolRounded },
  { title: 'Universiteti i Prizrenit', meta: 'Prizren · Kosovë', icon: SchoolRounded },
]

const categories = [
  { title: 'Histori e artit', meta: '-50% · 3 kurse', icon: PaletteRounded, chipKey: 'offer', chipColor: 'error' },
  { title: 'UI & UX', meta: 'Së shpejti · 16 kurse', icon: ViewQuiltRounded, chipKey: 'soon', chipColor: 'default' },
  { title: 'Programim', meta: 'E re · 2 kurse', icon: CodeRounded, chipKey: 'new', chipColor: 'success' },
  { title: 'Dizajn 3D', meta: '4 kurse', icon: ThreeDRotationRounded, chipKey: null, chipColor: 'default' },
]

export function SpotlightCard({ title, meta, icon, chip, chipColor, imgLoading }) {
  const IconGlyph = icon
  return (
      <Card elevation={0} className="group overflow-hidden rounded-[2rem] border border-sky-100/90 bg-white/90 shadow-md shadow-sky-100/40 transition-all duration-500 hover:-translate-y-2 hover:border-sky-300 hover:shadow-2xl hover:shadow-sky-200/50 dark:!border-slate-700 dark:!bg-slate-800 dark:!shadow-black/50 dark:hover:!border-slate-500 dark:hover:!shadow-black/60">
        <Box className="relative aspect-[16/10] overflow-hidden rounded-t-[2rem] bg-slate-100 dark:bg-slate-800">
          <img
              src={heroImg}
              alt=""
              loading={imgLoading ?? 'lazy'}
              className="h-full w-full object-cover transition duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
          {chip ? (
              <div className="absolute left-4 top-4">
                <Chip
                    label={chip}
                    size="small"
                    color={chipColor === 'default' ? 'default' : chipColor}
                    className="!font-black !px-2 shadow-lg"
                />
              </div>
          ) : null}
          <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 text-sky-600 shadow-xl backdrop-blur-md transition-all duration-500 group-hover:scale-110 dark:bg-slate-800/95 dark:text-sky-400">
            <IconGlyph fontSize="medium" />
          </div>
        </Box>
        <CardContent className="!p-6">
          <Typography variant="h6" className="!font-black !text-slate-800 dark:!text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {title}
          </Typography>
          <Typography variant="body2" className="!mt-1 !font-medium !text-slate-500 dark:!text-slate-400">
            {meta}
          </Typography>
        </CardContent>
      </Card>
  )
}

function StatsSection({ t }) {
  const stats = [
    { label: t('home.stats.students'), value: '12k+', icon: GroupsRounded, color: 'text-blue-600' },
    { label: t('home.stats.courses'), value: '500+', icon: CastForEducationRounded, color: 'text-indigo-600' },
    { label: t('home.stats.mentors'), value: '300+', icon: SchoolRounded, color: 'text-sky-600' },
    { label: t('home.stats.satisfaction'), value: '98%', icon: StarRounded, color: 'text-amber-500' },
  ]

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8 animate-fadeIn">
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col items-center p-6 rounded-[2.5rem] bg-white/60 border border-white/60 dark:bg-slate-800/60 dark:border-slate-700/60 backdrop-blur-sm shadow-xl transition-transform hover:scale-105">
          <div className={`mb-3 rounded-2xl bg-white p-3 shadow-md dark:bg-slate-700 ${s.color}`}>
            <s.icon fontSize="medium" />
          </div>
          <Typography variant="h4" className="!font-black !text-slate-800 dark:!text-white">
            {s.value}
          </Typography>
          <Typography variant="caption" className="!font-bold !uppercase !tracking-widest !text-slate-500 dark:!text-slate-400">
            {s.label}
          </Typography>
        </div>
      ))}
    </div>
  )
}

function PartnersSection({ t }) {
  const partners = ['UBT', 'UP', 'UT', 'UPT', 'UNISHK', 'Kolegji AAB', 'Univ. i Korçës', 'Univ. i Vlorës', 'Univ. i Prizrenit', 'Univ. i Gjakovës']
  
  const marqueeItems = [...partners, ...partners]

  return (
    <Box className="mt-24 text-center animate-fadeIn overflow-hidden">
      <Typography variant="caption" className="!font-black !uppercase !tracking-[0.4em] !text-slate-400 dark:!text-slate-500">
        {t('home.partnersTitle')}
      </Typography>
      <div className="mt-12 relative flex overflow-hidden py-4 border-y border-slate-200/40 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
        <div className="animate-marquee whitespace-nowrap flex">
          {marqueeItems.map((p, i) => (
            <Typography key={i} variant="h3" className="!font-black !text-slate-300 dark:!text-slate-700 hover:!text-sky-600 transition-colors cursor-default px-12 inline-block">
              {p}
            </Typography>
          ))}
          {}
          {marqueeItems.map((p, i) => (
            <Typography key={`dup-${i}`} variant="h3" className="!font-black !text-slate-300 dark:!text-slate-700 hover:!text-sky-600 transition-colors cursor-default px-12 inline-block">
              {p}
            </Typography>
          ))}
        </div>
      </div>
    </Box>
  )
}

function TestimonialsSection({ t }) {
  return (
    <Container maxWidth="lg" className="mt-32 animate-fadeIn">
      <Box className="text-center mb-16">
        <Typography variant="overline" className="!font-black !text-sky-600 dark:!text-sky-400 !tracking-widest">
          FEEDBACK
        </Typography>
        <Typography variant="h3" className="!font-black !text-slate-800 dark:!text-white !mt-2">
          {t('home.testimonials.title')}
        </Typography>
      </Box>
      <div className="grid md:grid-cols-3 gap-8">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="!rounded-[2.5rem] !p-8 !border-none !bg-white/50 dark:!bg-slate-800/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all group">
            <FormatQuoteRounded className="!text-sky-200 dark:!text-sky-800 !text-6xl mb-4 group-hover:scale-110 transition-transform" />
            <Typography variant="body1" className="!italic !text-slate-700 dark:!text-slate-300 !leading-relaxed !text-lg">
              "{t(`home.testimonials.items.${i}.text`)}"
            </Typography>
            <div className="mt-8 flex items-center gap-4">
              <Avatar className="!bg-sky-600 !font-black shadow-lg">
                {t(`home.testimonials.items.${i}.name`)?.[0] || 'U'}
              </Avatar>
              <div>
                <Typography variant="subtitle1" className="!font-black !text-slate-800 dark:!text-white">
                  {t(`home.testimonials.items.${i}.name`)}
                </Typography>
                <Typography variant="caption" className="!font-bold !text-sky-600 dark:!text-sky-400 uppercase tracking-tighter">
                  {t(`home.testimonials.items.${i}.role`)}
                </Typography>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  )
}

function FinalCtaSection({ t, navigate }) {
  return (
    <Container maxWidth="lg" className="mt-32 mb-16 animate-fadeIn">
      <Box className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-sky-600 via-indigo-700 to-slate-900 p-12 md:p-20 text-center shadow-2xl shadow-sky-900/30">
        <Box className="relative z-10">
           <Typography variant="h2" className="!font-black !text-white !leading-tight md:!text-5xl lg:!text-6xl">
             {t('home.ctaFinal.title')}
           </Typography>
           <Typography variant="h6" className="!mt-6 !text-sky-100/80 !max-w-2xl mx-auto !font-medium">
             {t('home.ctaFinal.subtitle')}
           </Typography>
           <div className="mt-12">
             <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                endIcon={<ArrowForwardRounded />}
                className="!rounded-full !bg-white !px-12 !py-5 !font-black !text-sky-800 shadow-2xl hover:!scale-105 hover:!bg-sky-50 transition-all active:!scale-95"
             >
               {t('home.ctaFinal.btn')}
             </Button>
           </div>
        </Box>
      </Box>
    </Container>
  )
}

export default function Home() {
  const swiperRef = useRef(null)
  const navigate = useNavigate()
  const { locale, t, isAuthenticated, role } = useAppPreferences()

  const slides = useMemo(() => {
    const copy = STRINGS[locale]?.home?.slides ?? STRINGS.sq.home.slides
    return copy.map((s, i) => ({
      ...s,
      accent: SLIDE_ACCENTS[i] ?? SLIDE_ACCENTS[0],
    }))
  }, [locale])

  const handleCtaClick = (ctaText) => {
    const text = ctaText?.toLowerCase() || ''
    if (text.includes('hyr') || text.includes('login') || text.includes('open')) {
      navigate('/login')
    } else if (isAuthenticated) {
      navigate(role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student')
    } else {
      navigate('/login')
    }
  }

  return (
      <div className="flex w-full min-h-0 flex-1 flex-col animate-fadeIn">
        <div className="flex min-h-0 flex-1 flex-col px-2 py-5 sm:px-4 sm:py-7">

          {}
          {isAuthenticated && (
            <Box className="mb-12 animate-fadeIn">
              {role === 'admin' ? (
                
                <Box className="glass-panel rounded-[3rem] p-8 shadow-2xl shadow-sky-900/10 border-sky-200/50">
                  <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                    <div className="flex items-center gap-6">
                      <Avatar className="!h-20 !w-20 !bg-slate-900 !text-3xl !font-black shadow-xl ring-4 ring-sky-500">A</Avatar>
                      <div>
                        <Typography variant="h4" className="!font-black !text-slate-900 dark:!text-white">
                          Sistemi Meson <Chip label="ADMIN" size="small" className="!bg-sky-600 !text-white !font-black !ml-2" />
                        </Typography>
                        <Typography variant="body1" className="!text-slate-500 dark:!text-slate-400 !font-medium">
                          Mirë se erdhe përsëri në qendrën e kontrollit.
                        </Typography>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => navigate('/admin/users')} variant="outlined" startIcon={<GroupsRounded />} className="!rounded-2xl !border-slate-200 !text-slate-700 !font-bold hover:!bg-sky-50 transition-all">{t('home.admin.services.users.title')}</Button>
                      <Button onClick={() => navigate('/admin/courses')} variant="outlined" startIcon={<CastForEducationRounded />} className="!rounded-2xl !border-slate-200 !text-slate-700 !font-bold hover:!bg-sky-50 transition-all">{t('home.admin.services.courses.title')}</Button>
                      <Button onClick={() => navigate('/admin/reports')} variant="contained" startIcon={<ArrowForwardRounded />} className="!rounded-2xl !bg-sky-600 !font-black shadow-lg shadow-sky-200/40">{t('header.navAdminDashboard')}</Button>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Përdorues të rinj', value: '+12', color: 'bg-emerald-50 text-emerald-600' },
                      { label: 'Kërkesa certifikatash', value: '5', color: 'bg-amber-50 text-amber-600' },
                      { label: 'Kurse në pritje', value: '2', color: 'bg-sky-50 text-sky-600' },
                      { label: 'Server Status', value: 'Online', color: 'bg-blue-50 text-blue-600' },
                    ].map((m, i) => (
                      <div key={i} className={`p-4 rounded-3xl ${m.color} flex flex-col items-center justify-center border border-current/10`}>
                         <Typography variant="h5" className="!font-black">{m.value}</Typography>
                         <Typography variant="caption" className="!font-bold !uppercase !tracking-tighter opacity-80">{m.label}</Typography>
                      </div>
                    ))}
                  </div>
                </Box>
              ) : (
                
                <Box className="px-6 py-8 glass-panel rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-sky-200/20">
                  <div className="flex items-center gap-6">
                    <Avatar className="!h-20 !w-20 !bg-gradient-to-tr !from-sky-500 !to-indigo-600 !text-3xl !font-black shadow-xl ring-4 ring-white/50">
                      {role?.toLowerCase() === 'teacher' ? 'T' : 'S'}
                    </Avatar>
                    <div>
                      <Typography variant="h4" className="!font-black !text-slate-800 dark:!text-white">
                        {t('home.student.welcome')}, {role}!
                      </Typography>
                      <Typography variant="body1" className="!text-slate-500 dark:!text-slate-400 !font-medium">
                        {t('home.student.continueTitle')}
                      </Typography>
                    </div>
                  </div>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate(role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student')}
                    endIcon={<ArrowForwardRounded />}
                    className="!rounded-full !bg-sky-600 !px-10 !py-4 !font-black shadow-xl shadow-sky-200/50 hover:!bg-sky-700 hover:!shadow-2xl transition-all"
                  >
                    {t('header.navDashboard')}
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {}
          <section className="relative overflow-hidden rounded-[3rem] border border-white/20 bg-slate-900 shadow-2xl shadow-sky-900/15">
            <IconButton className="!absolute !left-6 !top-1/2 !z-20 !-translate-y-1/2 !bg-white/10 !text-white !backdrop-blur-md" onClick={() => swiperRef.current?.slidePrev()}>
              <ChevronLeftRounded />
            </IconButton>
            <IconButton className="!absolute !right-6 !top-1/2 !z-20 !-translate-y-1/2 !bg-white/10 !text-white !backdrop-blur-md" onClick={() => swiperRef.current?.slideNext()}>
              <ChevronRightRounded />
            </IconButton>

            <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                effect="fade"
                speed={1200}
                loop
                autoplay={{ delay: 8000, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true }}
                onSwiper={(s) => { swiperRef.current = s }}
                className="hero-swiper min-h-[450px] md:min-h-[550px]"
            >
              {slides.map((slide, i) => (
                  <SwiperSlide key={i}>
                    <div className="relative flex min-h-[450px] md:min-h-[550px] items-center justify-center text-center p-8">
                      <div className="absolute inset-0">
                        <img src={heroImg} alt="" className="h-full w-full object-cover" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} mix-blend-multiply opacity-80`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      </div>
                      <div className="relative z-[1]">
                        <Typography variant="overline" className="!tracking-[0.5em] !text-sky-300 !font-black !mb-4 drop-shadow-md">{t('home.brand')}</Typography>
                        <Typography variant="h1" className="!font-black !leading-tight !text-white drop-shadow-2xl !text-5xl md:!text-7xl !max-w-5xl">{slide.title}</Typography>
                        <Typography variant="h6" className="!mt-6 !max-w-3xl !text-slate-100/90 !font-medium md:!text-2xl">{slide.subtitle}</Typography>
                        <div className="mt-12">
                          <Button variant="contained" size="large" onClick={() => handleCtaClick(slide.cta)} className="!rounded-full !bg-white !px-12 !py-5 !font-black !text-sky-800 shadow-2xl hover:!bg-sky-50 transition-all">{slide.cta}</Button>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
              ))}
            </Swiper>
          </section>

          {}
          <Container maxWidth="md" className="relative -mt-12 z-30">
            <Paper elevation={0} className="flex w-full items-center rounded-[2.5rem] border border-sky-100 bg-white/95 p-3 shadow-2xl shadow-sky-200/50 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/50">
              <div className="flex pl-4 items-center justify-center text-sky-600 dark:text-sky-400"><SearchRounded fontSize="large" /></div>
              <InputBase
                inputProps={{ style: { color: '#0f172a', fontWeight: 800 } }}
                sx={{ ml: 2, flex: 1, fontSize: '1.2rem', '& input::placeholder': { color: 'rgba(15, 23, 42, 0.4)', opacity: 1 } }}
                placeholder={t('home.searchPlaceholder')}
              />
              <Button variant="contained" size="large" onClick={() => navigate('/login')} className="!rounded-[1.75rem] !bg-sky-600 !px-10 !py-4 !font-black shadow-lg hover:!bg-sky-700 sm:!flex !hidden">{t('auth.loginSubmit')}</Button>
            </Paper>
          </Container>

          <PartnersSection t={t} />

          <Container maxWidth="lg" className="mt-20"><StatsSection t={t} /></Container>

          {}
          <Container maxWidth="lg" className="mt-32">
            <Box className="text-center mb-16">
              <Typography variant="overline" className="!font-black !text-sky-600 dark:!text-sky-400 !tracking-widest">{t('home.features.overline')}</Typography>
              <Typography variant="h3" className="!font-black !text-slate-800 dark:!text-white !mt-2">{t('home.features.title')}</Typography>
            </Box>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { title: t('home.features.f1Title'), desc: t('home.features.f1Desc'), icon: AssignmentRounded },
                 { title: t('home.features.f2Title'), desc: t('home.features.f2Desc'), icon: CastForEducationRounded },
                 { title: t('home.features.f3Title'), desc: t('home.features.f3Desc'), icon: StarRounded },
               ].map((f, i) => (
                 <div key={i} className="p-10 rounded-[3rem] glass-panel hover:border-sky-400 hover:shadow-2xl transition-all group">
                   <div className="h-16 w-16 rounded-3xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all"><f.icon fontSize="large" /></div>
                   <Typography variant="h5" className="!font-black !text-slate-800 dark:!text-white mb-4">{f.title}</Typography>
                   <Typography variant="body1" className="!text-slate-500 dark:!text-slate-400 !text-lg !leading-relaxed">{f.desc}</Typography>
                 </div>
               ))}
            </div>
          </Container>

          {}
          <Container maxWidth="lg" className="mt-32">
            <Box className="mb-12 flex items-end justify-between">
              <div>
                <Typography variant="overline" className="!font-black !tracking-widest !text-sky-600 dark:!text-sky-400">{t('home.univOverline')}</Typography>
                <Typography variant="h3" className="!font-black !text-slate-800 dark:!text-white">{t('home.univTitle')}</Typography>
              </div>
            </Box>
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
              autoplay={{ delay: 5000 }}
              className="!pb-4"
            >
              {universities.map((u, i) => (
                <SwiperSlide key={i}>
                  <SpotlightCard title={u.title} meta={u.meta} icon={u.icon} chip={t('home.chipPartner')} chipColor="primary" />
                </SwiperSlide>
              ))}
            </Swiper>
          </Container>

          <TestimonialsSection t={t} />

          {}
          <Container maxWidth="lg" className="mt-32">
            <Box className="mb-12">
              <Typography variant="overline" className="!font-black !tracking-widest !text-sky-600 dark:!text-sky-400">{t('home.catOverline')}</Typography>
              <Typography variant="h3" className="!font-black !text-slate-800 dark:!text-white">{t('home.catTitle')}</Typography>
            </Box>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((c, i) => (
                <SpotlightCard key={i} title={c.title} meta={c.meta} icon={c.icon} chip={c.chipKey ? t(`home.chip${c.chipKey[0].toUpperCase() + c.chipKey.slice(1)}`) : null} chipColor={c.chipColor} />
              ))}
            </div>
          </Container>

          <FinalCtaSection t={t} navigate={navigate} />

        </div>
        <Footer />
      </div>
  )
}
