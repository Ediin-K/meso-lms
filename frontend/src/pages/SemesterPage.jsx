import { useParams, useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import axiosInstance from "../services/axiosInstance"
import { useAppPreferences } from "../context/appPreferencesContext"
import Footer from "../components/ui/Footer"
import { Typography, Container, Box, Button, CircularProgress, CardContent } from "@mui/material"
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded"
import LibraryBooksRounded from "@mui/icons-material/LibraryBooksRounded"
import PlayCircleFilledRounded from "@mui/icons-material/PlayCircleFilledRounded"

export default function SemesterPage() {
    const { semesterId } = useParams()
    const navigate = useNavigate()
    const { t, mode } = useAppPreferences()
    const isDark = mode === "dark"

    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true)
                const res = await axiosInstance.get(`/courses/by-semester/${semesterId}`)
                setCourses(res.data)
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }
        fetchCourses()
    }, [semesterId])

    return (
        <section className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
            <Container maxWidth="lg" className="flex-grow py-8 px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">

                {/* BACK BUTTON */}
                <Button 
                    startIcon={<ArrowBackRounded />} 
                    onClick={() => navigate(-1)}
                    className="!mb-8 !normal-case !text-slate-600 dark:!text-slate-400 hover:!bg-sky-50 dark:hover:!bg-slate-800/50 !rounded-full !px-4 !py-2"
                >
                    {t('semester.back', 'Back to Dashboard')}
                </Button>

                {/* HEADER */}
                <Box className="mb-10 text-center md:text-left">
                    <Typography variant="overline" className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400">
                        {t('semester.overline', 'COURSE BROWSER')}
                    </Typography>
                    <Typography variant="h3" component="h1" className="!mt-1 !font-extrabold !text-slate-900 dark:!text-white">
                        {t('semester.title', 'Semester')} {semesterId}
                    </Typography>
                    <Typography variant="body1" className="!mt-3 !max-w-2xl !text-slate-600 dark:!text-slate-400 md:mx-0 mx-auto text-lg">
                        {t('semester.subtitle', 'Explore and manage your enrolled subjects for this semester.')}
                    </Typography>
                </Box>

                {/* CONTENT */}
                {loading ? (
                    <Box className="flex justify-center items-center py-24">
                        <CircularProgress className="!text-sky-500" />
                    </Box>
                ) : courses.length === 0 ? (
                    <Box className="flex flex-col justify-center items-center py-20 px-4 text-center bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
                        <LibraryBooksRounded className="!text-6xl text-slate-300 dark:text-slate-600 mb-4" />
                        <Typography variant="h6" className="!font-bold !text-slate-800 dark:!text-slate-200">
                            {t('semester.empty.title', 'No Courses Found')}
                        </Typography>
                        <Typography variant="body2" className="!mt-2 !text-slate-500 dark:!text-slate-400 max-w-sm">
                            {t('semester.empty.desc', "We couldn't find any active courses for this semester. Please check back later or contact your administrator.")}
                        </Typography>
                    </Box>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map(course => (
                            <Link 
                                to={`/course/${course.id}`} 
                                key={course.id}
                                onClick={() => localStorage.setItem('lastCourseId', course.id)}
                                className="group block focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-[2.5rem]"
                                style={{ height: "240px", minHeight: "240px", maxHeight: "240px" }}
                            >
                                <Box
                                    className="relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-200/40 bg-white dark:bg-slate-900"
                                    sx={{
                                        height: "240px !important",
                                        minHeight: "240px !important",
                                        maxHeight: "240px !important",
                                        borderRadius: "2.5rem !important",
                                        border: "1px solid",
                                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
                                        overflow: "hidden !important",
                                        "&:hover": {
                                            borderColor: "primary.main",
                                        }
                                    }}
                                >
                                    <CardContent 
                                        sx={{ 
                                            p: "40px !important", 
                                            height: "100%", 
                                            display: "flex", 
                                            flexDirection: "column", 
                                            justifyContent: "space-between",
                                            overflow: "hidden"
                                        }}
                                    >
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, overflow: "hidden" }}>
                                            <Box className="h-14 w-14 rounded-2xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-inner flex-shrink-0 transition-transform group-hover:scale-110">
                                                <LibraryBooksRounded fontSize="large" />
                                            </Box>
                                            <Typography 
                                                variant="h5" 
                                                sx={{ 
                                                    fontWeight: 900,
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    lineHeight: 1.2,
                                                    fontSize: "1.25rem"
                                                }}
                                                className="dark:text-white"
                                            >
                                                {course.titulli}
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 3, borderTop: "1px solid", borderColor: "divider", flexShrink: 0 }}>
                                            <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em", color: "gray" }}>
                                                {course.categoryName || t('semester.courseBadge', 'SUBJECT')}
                                            </span>
                                            <PlayCircleFilledRounded className="!text-sky-600 dark:!text-sky-400 !text-2xl transition-all duration-300 group-hover:translate-x-3" />
                                        </Box>
                                    </CardContent>
                                </Box>
                            </Link>
                        ))}
                    </div>
                )}
            </Container>

            {/* FOOTER */}
            <div className="mt-auto">
                <Footer />
            </div>
        </section>
    )
}