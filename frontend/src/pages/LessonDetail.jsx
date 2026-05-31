import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axiosInstance from '../services/axiosInstance'
import { useAppPreferences } from '../context/appPreferencesContext'
import Footer from '../components/ui/Footer'
import {
    Typography, Container, Box, Button, CircularProgress,
    Card, CardContent, Chip
} from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import PlayCircleFilledRounded from '@mui/icons-material/PlayCircleFilledRounded'
import DescriptionRounded from '@mui/icons-material/DescriptionRounded'
import LinkRounded from '@mui/icons-material/LinkRounded'
import QuizRounded from '@mui/icons-material/QuizRounded'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import LessonQuizCard from '../components/quiz/LessonQuizCard'

export default function LessonDetail() {
    const { lessonId } = useParams()
    const navigate = useNavigate()
    const { t } = useAppPreferences()

    const [lesson, setLesson] = useState(null)
    const [courseId, setCourseId] = useState(null)
    const [assignments, setAssignments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [lessonRes, assignmentsRes] = await Promise.all([
                    axiosInstance.get(`/lessons/${lessonId}`),
                    axiosInstance.get(`/assignments/lesson/${lessonId}`),
                ])
                setLesson(lessonRes.data)
                setAssignments(assignmentsRes.data)
                if (lessonRes.data?.moduleId) {
                    try {
                        const modRes = await axiosInstance.get(`/modules/${lessonRes.data.moduleId}`)
                        setCourseId(modRes.data?.courseId || null)
                    } catch {
                        setCourseId(null)
                    }
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
                <Button
                    startIcon={<ArrowBackRounded />}
                    onClick={() => navigate(-1)}
                    className="!mt-4 !normal-case !text-sky-600"
                >
                    {t('lessonDetail.back')}
                </Button>
            </Container>
        )
    }

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="lg" className="flex-grow py-8 px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">

                {/* BACK */}
                <Button
                    startIcon={<ArrowBackRounded />}
                    onClick={() => navigate(-1)}
                    className="!mb-8 !normal-case !text-slate-600 dark:!text-slate-400 hover:!bg-sky-50 dark:hover:!bg-slate-800/50 !rounded-full !px-4 !py-2"
                >
                    {t('lessonDetail.backToCourse')}
                </Button>

                {/* HEADER */}
                <Box className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <Chip
                            label={lesson.lloji}
                            size="small"
                            className="!font-bold !bg-sky-100 !text-sky-700 dark:!bg-sky-900/50 dark:!text-sky-400"
                        />
                        <Typography variant="caption" className="!text-slate-500">
                            {lesson.moduleTitulli}
                        </Typography>
                    </div>
                    <Typography variant="h3" component="h1" className="!font-extrabold !text-slate-900 dark:!text-white">
                        {lesson.titulli}
                    </Typography>
                </Box>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* CONTENT — majtas */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* VIDEO */}
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

                        {/* PERMBAJTJA */}
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

                        {/* RESOURCE URL */}
                        {lesson.resourceUrl && (
                            <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/50 dark:!border-slate-700/80">
                                <CardContent className="!p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <LinkRounded className="text-sky-600" />
                                        <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                                            {t('lessonDetail.extraMaterial')}
                                        </Typography>
                                    </div>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        href={lesson.resourceUrl}
                                        target="_blank"
                                        className="!normal-case !rounded-full !border-sky-300 !text-sky-600"
                                    >
                                        {t('lessonDetail.openLink')}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* SIDEBAR — djathtas */}
                    <div className="flex flex-col gap-6">

                        {/* QUIZZES */}
                        <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/50 dark:!border-slate-700/80">
                            <CardContent className="!p-5">
                                <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white !mb-4 flex items-center gap-2">
                                    <QuizRounded className="text-sky-600" fontSize="small" />
                                    {t('lessonDetail.quizzes')}
                                </Typography>
                                <LessonQuizCard lessonId={lessonId} courseId={courseId} />
                            </CardContent>
                        </Card>

                        {/* ASSIGNMENTS */}
                        <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/50 dark:!border-slate-700/80">
                            <CardContent className="!p-5">
                                <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white !mb-4 flex items-center gap-2">
                                    <AssignmentRounded className="text-sky-600" fontSize="small" />
                                    {t('lessonDetail.assignments')}
                                </Typography>
                                {assignments.length === 0 ? (
                                    <Typography variant="body2" className="!text-slate-500">
                                        {t('lessonDetail.noAssignments')}
                                    </Typography>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {assignments.map(assignment => (
                                            <Box
                                                key={assignment.id}
                                                className="p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-sky-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                                onClick={() => navigate(`/assignment/${assignment.id}`)}
                                            >
                                                <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                                                    {assignment.titulli}
                                                </Typography>
                                                <Typography variant="caption" className="!text-slate-500 !block !mt-1">
                                                    ⏰ {t('lessonDetail.deadline')} {new Date(assignment.deadline).toLocaleDateString()}
                                                </Typography>
                                                <Chip
                                                    label={assignment.statusi}
                                                    size="small"
                                                    className="!mt-2 !text-xs"
                                                    color={assignment.statusi === 'AKTIV' ? 'success' : 'default'}
                                                />
                                            </Box>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>
            <Footer />
        </section>
    )
}