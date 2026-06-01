import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axiosInstance from '../services/axiosInstance'
import { useAppPreferences } from '../context/appPreferencesContext'
import Footer from '../components/ui/Footer'
import {
    Typography, Container, Box, Button, CircularProgress,
    Card, CardContent, Chip, Dialog, DialogContent, Tooltip,
} from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import PlayCircleFilledRounded from '@mui/icons-material/PlayCircleFilledRounded'
import DescriptionRounded from '@mui/icons-material/DescriptionRounded'
import LinkRounded from '@mui/icons-material/LinkRounded'
import QuizRounded from '@mui/icons-material/QuizRounded'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
import FolderOpenRounded from '@mui/icons-material/FolderOpenRounded'
import PictureAsPdfRounded from '@mui/icons-material/PictureAsPdfRounded'
import ImageRounded from '@mui/icons-material/ImageRounded'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import InsertDriveFileRounded from '@mui/icons-material/InsertDriveFileRounded'
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded'
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded'
import SlideshowRounded from '@mui/icons-material/SlideshowRounded'
import TableChartRounded from '@mui/icons-material/TableChartRounded'
import FolderZipRounded from '@mui/icons-material/FolderZipRounded'
import LessonQuizCard from '../components/quiz/LessonQuizCard'
import LessonAssignmentCard from '../components/course/LessonAssignmentCard'
import progressService from '../services/progressService'
import { downloadResource, openResourcePreview, getViewUrl } from '../services/resourceService'

function ResourceTypeIcon({ type, className }) {
    switch (type) {
        case 'PDF':          return <PictureAsPdfRounded className={className} />
        case 'IMAGE':        return <ImageRounded className={className} />
        case 'VIDEO':        return <VideocamRounded className={className} />
        case 'DOCUMENT':     return <DescriptionRounded className={className} />
        case 'PRESENTATION': return <SlideshowRounded className={className} />
        case 'SPREADSHEET':  return <TableChartRounded className={className} />
        case 'ARCHIVE':      return <FolderZipRounded className={className} />
        default:             return <InsertDriveFileRounded className={className} />
    }
}

function formatSize(bytes) {
    if (!bytes && bytes !== 0) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function ResourceCard({ resource }) {
    const [previewOpen, setPreviewOpen] = useState(false)
    const canEmbedPreview = resource.resourceType === 'IMAGE' || resource.resourceType === 'VIDEO'
    const canOpenPreview  = resource.previewable || resource.resourceType === 'PDF'

    const iconColor = {
        PDF:          'text-red-500',
        IMAGE:        'text-sky-500',
        VIDEO:        'text-violet-500',
        DOCUMENT:     'text-blue-500',
        PRESENTATION: 'text-orange-500',
        SPREADSHEET:  'text-emerald-500',
        ARCHIVE:      'text-amber-500',
    }[resource.resourceType] || 'text-slate-500'

    const bgColor = {
        PDF:          'bg-red-50 dark:bg-red-950/30',
        IMAGE:        'bg-sky-50 dark:bg-sky-950/30',
        VIDEO:        'bg-violet-50 dark:bg-violet-950/30',
        DOCUMENT:     'bg-blue-50 dark:bg-blue-950/30',
        PRESENTATION: 'bg-orange-50 dark:bg-orange-950/30',
        SPREADSHEET:  'bg-emerald-50 dark:bg-emerald-950/30',
        ARCHIVE:      'bg-amber-50 dark:bg-amber-950/30',
    }[resource.resourceType] || 'bg-slate-50 dark:bg-slate-800/50'

    return (
        <>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {}
                {resource.resourceType === 'IMAGE' && (
                    <div
                        className="cursor-zoom-in bg-slate-100 dark:bg-slate-800 flex items-center justify-center max-h-64 overflow-hidden"
                        onClick={() => setPreviewOpen(true)}
                    >
                        <img
                            src={getViewUrl(resource.id)}
                            alt={resource.emriOrigjinal}
                            className="w-full h-full object-contain max-h-64"
                            loading="lazy"
                        />
                    </div>
                )}

                {}
                {resource.resourceType === 'VIDEO' && (
                    <div className="bg-black">
                        <video
                            controls
                            className="w-full max-h-64"
                            preload="metadata"
                        >
                            <source src={getViewUrl(resource.id)} type={resource.tipi || 'video/mp4'} />
                            Shfletuesi juaj nuk mbështet videot.
                        </video>
                    </div>
                )}

                {}
                <div className={`flex items-center gap-3 px-4 py-3 ${bgColor}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-900 shadow-sm">
                        <ResourceTypeIcon type={resource.resourceType} className={`!text-xl ${iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <Tooltip title={resource.emriOrigjinal} placement="top">
                            <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-slate-100 truncate">
                                {resource.emriOrigjinal}
                            </Typography>
                        </Tooltip>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                {resource.resourceType}
                            </span>
                            {resource.madhesia > 0 && (
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                    · {formatSize(resource.madhesia)}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {(canOpenPreview || canEmbedPreview) && resource.resourceType !== 'VIDEO' && resource.resourceType !== 'IMAGE' && (
                            <Tooltip title="Hap pamjen">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => openResourcePreview(resource)}
                                    className="!rounded-lg !normal-case !min-w-0 !px-2 !border-slate-300 !text-slate-600 dark:!border-slate-600 dark:!text-slate-300"
                                >
                                    <OpenInNewRounded style={{ fontSize: 16 }} />
                                </Button>
                            </Tooltip>
                        )}
                        {resource.resourceType === 'IMAGE' && (
                            <Tooltip title="Zmadhoje">
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setPreviewOpen(true)}
                                    className="!rounded-lg !normal-case !min-w-0 !px-2 !border-slate-300 !text-slate-600 dark:!border-slate-600 dark:!text-slate-300"
                                >
                                    <OpenInNewRounded style={{ fontSize: 16 }} />
                                </Button>
                            </Tooltip>
                        )}
                        <Tooltip title="Shkarko">
                            <Button
                                size="small"
                                variant="contained"
                                onClick={() => downloadResource(resource)}
                                className="!rounded-lg !normal-case !min-w-0 !px-2 !bg-sky-600 hover:!bg-sky-700"
                            >
                                <FileDownloadRounded style={{ fontSize: 16 }} />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {}
            {resource.resourceType === 'IMAGE' && (
                <Dialog
                    open={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    maxWidth="xl"
                    fullWidth
                    PaperProps={{ className: 'rounded-2xl! bg-black!' }}
                    onClick={() => setPreviewOpen(false)}
                >
                    <DialogContent className="!p-2 flex items-center justify-center">
                        <img
                            src={getViewUrl(resource.id)}
                            alt={resource.emriOrigjinal}
                            className="max-w-full max-h-[85vh] object-contain rounded-xl"
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}

export default function LessonDetail() {
    const { lessonId } = useParams()
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    const [lesson, setLesson]     = useState(null)
    const [courseId, setCourseId] = useState(null)
    const [loading, setLoading]   = useState(true)
    const [completion, setCompletion] = useState(null)

    useEffect(() => {
        progressService.markViewed(lessonId)
            .then(res => {
                if (res.data?.courseCompleted) setCompletion(res.data)
            })
            .catch(() => {})
    }, [lessonId])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const lessonRes = await axiosInstance.get(`/lessons/${lessonId}`)
                setLesson(lessonRes.data)
                if (lessonRes.data?.moduleId) {
                    try {
                        const modRes = await axiosInstance.get(`/modules/${lessonRes.data.moduleId}`)
                        setCourseId(modRes.data?.courseId || null)
                    } catch { void 0 }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [lessonId])

    if (loading) {
        return (
            <Box className="flex justify-center items-center py-24">
                <CircularProgress className="!text-sky-500" />
            </Box>
        )
    }

    if (!lesson) {
        return (
            <Container maxWidth="lg" sx={{ mt: 6 }}>
                <Typography variant="h5" className="!text-slate-800 dark:!text-white">
                    {t('lessonDetail.notFound')}
                </Typography>
                <Button startIcon={<ArrowBackRounded />} onClick={() => navigate(-1)} className="!mt-4 !normal-case !text-sky-600">
                    {t('lessonDetail.back')}
                </Button>
            </Container>
        )
    }

    const resources = lesson.resources || []

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="lg" className="flex-grow py-8 px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">

                <Button
                    startIcon={<ArrowBackRounded />}
                    onClick={() => navigate(-1)}
                    className="!mb-8 !normal-case !text-slate-600 dark:!text-slate-400 hover:!bg-sky-50 dark:hover:!bg-slate-800/50 !rounded-full !px-4 !py-2"
                >
                    {t('lessonDetail.backToCourse')}
                </Button>

                {}
                <Box className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <Chip label={lesson.lloji} size="small" className="!font-bold !bg-sky-100 !text-sky-700 dark:!bg-sky-900/50 dark:!text-sky-400" />
                        <Typography variant="caption" className="!text-slate-500">{lesson.moduleTitulli}</Typography>
                    </div>
                    <Typography variant="h3" component="h1" className="!font-extrabold !text-slate-900 dark:!text-white">
                        {lesson.titulli}
                    </Typography>
                </Box>

                {}
                {lesson.lloji === 'ASSIGNMENT' && (
                    <Box className="mb-6">
                        <LessonAssignmentCard lessonId={lessonId} />
                    </Box>
                )}

                <div className="grid gap-6 lg:grid-cols-3">

                    {}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {}
                        {lesson.videoUrl && (
                            <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/50 dark:!border-slate-700/80">
                                <CardContent className="!p-5">
                                    <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white !mb-4 flex items-center gap-2">
                                        <PlayCircleFilledRounded className="text-sky-600" fontSize="small" />
                                        {t('lessonDetail.video')}
                                    </Typography>
                                    <Box className="relative aspect-video rounded-xl overflow-hidden bg-slate-900">
                                        <iframe
                                            src={lesson.videoUrl.replace('watch?v=', 'embed/')}
                                            className="w-full h-full"
                                            allowFullScreen
                                            title={lesson.titulli}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {}
                        {lesson.permbajtja && (
                            <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/50 dark:!border-slate-700/80">
                                <CardContent className="!p-5">
                                    <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white !mb-4 flex items-center gap-2">
                                        <DescriptionRounded className="text-sky-600" fontSize="small" />
                                        {t('lessonDetail.content')}
                                    </Typography>
                                    <Typography variant="body1" className="!text-slate-700 dark:!text-slate-300 !leading-relaxed whitespace-pre-wrap">
                                        {lesson.permbajtja}
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}

                        {}
                        {lesson.resourceUrl && (
                            <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/50 dark:!border-slate-700/80">
                                <CardContent className="!p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <LinkRounded className="text-sky-600" />
                                        <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                                            {t('lessonDetail.extraMaterial')}
                                        </Typography>
                                    </div>
                                    <Button variant="outlined" size="small" href={lesson.resourceUrl} target="_blank" className="!normal-case !rounded-full !border-sky-300 !text-sky-600">
                                        {t('lessonDetail.openLink')}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {}
                        {resources.length > 0 && (
                            <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/50 dark:!border-slate-700/80">
                                <CardContent className="!p-5">
                                    <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white !mb-4 flex items-center gap-2">
                                        <FolderOpenRounded className="text-sky-600" fontSize="small" />
                                        Materialet e lëndës
                                        <span className="ml-1 rounded-full bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5 text-xs font-black text-sky-600 dark:text-sky-400">
                                            {resources.length}
                                        </span>
                                    </Typography>
                                    <div className="flex flex-col gap-3">
                                        {resources.map(res => (
                                            <ResourceCard key={res.id} resource={res} />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {}
                    <div className="flex flex-col gap-6">

                        {}
                        <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/50 dark:!border-slate-700/80">
                            <CardContent className="!p-5">
                                <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white !mb-4 flex items-center gap-2">
                                    <QuizRounded className="text-sky-600" fontSize="small" />
                                    {t('lessonDetail.quizzes')}
                                </Typography>
                                <LessonQuizCard lessonId={lessonId} courseId={courseId} />
                            </CardContent>
                        </Card>

                        {}
                        {lesson.lloji !== 'ASSIGNMENT' && (
                            <LessonAssignmentCard lessonId={lessonId} />
                        )}
                    </div>
                </div>
            </Container>

            <Footer />

            {}
            <Dialog
                open={!!completion}
                onClose={() => setCompletion(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ className: 'rounded-[2rem]! overflow-hidden dark:bg-slate-900!' }}
            >
                <DialogContent className="!p-0">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-8 py-10 text-center">
                        <WorkspacePremiumRounded className="!text-6xl text-white/90 !mb-3" />
                        <Typography variant="h4" className="!font-black !text-white !leading-tight">Urime!</Typography>
                        <Typography className="!mt-2 !text-white/80">E ke përfunduar kursin me sukses</Typography>
                    </div>
                    <div className="px-8 py-6">
                        <Typography variant="h6" className="!font-black !text-slate-900 dark:!text-white !text-center !mb-1">
                            {completion?.courseTitulli}
                        </Typography>
                        <Typography variant="body2" className="!text-slate-500 !text-center !mb-5">
                            Certifikata jote është gjeneruar automatikisht.
                        </Typography>
                        <div className="rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center mb-6">
                            <Typography variant="caption" className="!font-bold !uppercase !tracking-widest !text-emerald-600 dark:!text-emerald-400 !block !mb-1">
                                Kodi unik i certifikatës
                            </Typography>
                            <Typography
                                variant="body2"
                                className="!font-mono !font-bold !text-slate-700 dark:!text-slate-200 !break-all cursor-pointer"
                                onClick={() => navigator.clipboard?.writeText(completion?.certificateCode || '')}
                                title="Klikoni për ta kopjuar"
                            >
                                {completion?.certificateCode}
                            </Typography>
                            <Typography variant="caption" className="!text-slate-400 !mt-1 !block">Klikoni kodin për ta kopjuar</Typography>
                        </div>
                        <div className="flex gap-3">
                            <Button fullWidth variant="outlined" onClick={() => setCompletion(null)} className="!rounded-xl !normal-case !border-slate-300 !text-slate-600 dark:!text-slate-300">
                                Mbyll
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => { setCompletion(null); navigate('/profile') }}
                                className="!rounded-xl !normal-case !bg-emerald-600 hover:!bg-emerald-700"
                                startIcon={<WorkspacePremiumRounded />}
                            >
                                Shiko certifikatën
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    )
}
