import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axiosInstance from '../services/axiosInstance'
import {
    Typography, Container, Box, Button, CircularProgress,
    Card, CardContent, Chip, TextField, Snackbar, Alert, Zoom
} from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import LinkRounded from '@mui/icons-material/LinkRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded'
import { useAppPreferences } from '../context/appPreferencesContext'

export default function AssignmentPage() {
    const { assignmentId } = useParams()
    const navigate = useNavigate()

    const [assignment, setAssignment] = useState(null)
    const [submission, setSubmission] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const [submissionUrl, setSubmissionUrl] = useState('')
    const [pershkrimi, setPershkrimi] = useState('')
    const { mode } = useAppPreferences()
    const isDark = mode === 'dark'

    // Toast States
    const [snackbarMessage, setSnackbarMessage] = useState("")
    const [openSnackbar, setOpenSnackbar] = useState(false)

    const userId = localStorage.getItem('userId')

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const assignmentRes = await axiosInstance.get(`/assignments/${assignmentId}`)
                setAssignment(assignmentRes.data)

                // Kontrollo nese studenti e ka dorezuar tashme
                const submissionsRes = await axiosInstance.get(`/assignments/submissions/student/${userId}`)
                const existing = submissionsRes.data.find(s => s.assignmentId === Number(assignmentId))
                if (existing) {
                    setSubmission(existing)
                    setSubmitted(true)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [assignmentId, userId])

    const handleSubmit = async () => {
        if (!submissionUrl.trim()) return
        try {
            setSubmitting(true)
            const res = await axiosInstance.post('/assignments/submissions', {
                assignmentId: Number(assignmentId),
                studentId: Number(userId),
                submissionUrl,
                pershkrimi
            })
            setSubmission(res.data)
            setSubmitted(true)
            setSnackbarMessage("Detyra u dorëzua me sukses.")
            setOpenSnackbar(true)
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    const isExpired = assignment && new Date(assignment.deadline) < new Date()

    if (loading) {
        return (
            <Box className="flex justify-center items-center py-24">
                <CircularProgress className="text-sky-500!" />
            </Box>
        )
    }

    if (!assignment) {
        return (
            <Container maxWidth="lg" sx={{ mt: 6 }}>
                <Typography variant="h5" className="text-slate-800! dark:text-white!">
                    Detyra nuk u gjet
                </Typography>
                <Button
                    startIcon={<ArrowBackRounded />}
                    onClick={() => navigate(-1)}
                    className="mt-4! normal-case! text-sky-600!"
                >
                    Kthehu mbrapa
                </Button>
            </Container>
        )
    }

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="md" className="grow py-8 px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">

                {/* BACK */}
                <Button
                    startIcon={<ArrowBackRounded />}
                    onClick={() => navigate(-1)}
                    className="mb-8! normal-case! text-slate-600! dark:text-slate-400! hover:bg-sky-50! dark:hover:bg-slate-800/50! rounded-full! px-4! py-2!"
                >
                    Kthehu te leksioni
                </Button>

                {/* HEADER */}
                <Box className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <AssignmentRounded className="text-sky-600" />
                        <Typography variant="overline" className="font-bold! tracking-widest! text-sky-600! dark:text-sky-400!">
                            Detyrë
                        </Typography>
                    </div>
                    <Typography variant="h3" component="h1" className="font-extrabold! text-slate-900! dark:text-white!">
                        {assignment.titulli}
                    </Typography>

                    {/* DEADLINE */}
                    <div className="flex items-center gap-2 mt-3">
                        <AccessTimeRounded fontSize="small" className={isExpired ? 'text-red-500' : 'text-amber-500'} />
                        <Typography variant="body2" className={`!font-semibold ${isExpired ? 'text-red-500!' : 'text-amber-600! dark:text-amber-400!'}`}>
                            Deadline: {new Date(assignment.deadline).toLocaleString()}
                            {isExpired && ' — Skaduar'}
                        </Typography>
                    </div>

                    <Chip
                        label={assignment.statusi}
                        size="small"
                        color={assignment.statusi === 'AKTIV' ? 'success' : 'default'}
                        className="mt-3! font-bold!"
                    />
                </Box>

                <div className="flex flex-col gap-6">

                    {/* PERSHKRIMI */}
                    {assignment.pershkrimi && (
                        <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900/50! dark:border-slate-700/80!">
                            <CardContent className="p-5!">
                                <Typography variant="subtitle1" className="font-bold! text-slate-900! dark:text-white! mb-3!">
                                    Instruksionet
                                </Typography>
                                <Typography variant="body1" className="text-slate-700! dark:text-slate-300! leading-relaxed! whitespace-pre-wrap">
                                    {assignment.pershkrimi}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}

                    {/* RESOURCE URL */}
                    {assignment.resourceUrl && (
                        <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900/50! dark:border-slate-700/80!">
                            <CardContent className="p-5! flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <LinkRounded className="text-sky-600" />
                                    <Typography variant="body2" className="font-semibold! text-slate-800! dark:text-white!">
                                        Material i detyrës
                                    </Typography>
                                </div>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    href={assignment.resourceUrl}
                                    target="_blank"
                                    className="normal-case! rounded-full! border-sky-300! dark:border-sky-500/30! text-sky-600! dark:text-sky-400! hover:dark:bg-sky-400/10!"
                                >
                                    Hap linkun
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* SUBMISSION */}
                    {submitted ? (
                        <Card elevation={0} className="rounded-2xl border border-green-200/80 dark:border-green-700/40! bg-green-50/50 dark:bg-green-900/10!">
                            <CardContent className="p-5!">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircleRounded className="text-green-500" />
                                    <Typography variant="subtitle1" className="font-bold! text-green-700! dark:text-green-400!">
                                        Detyra është dorëzuar
                                    </Typography>
                                </div>
                                <Typography variant="body2" className="text-slate-600! dark:text-slate-400!">
                                    <span className="font-semibold">Linku:</span> {submission?.submissionUrl}
                                </Typography>
                                {submission?.pershkrimi && (
                                    <Typography variant="body2" className="text-slate-600! dark:text-slate-400! mt-2!">
                                        <span className="font-semibold">Përshkrimi:</span> {submission?.pershkrimi}
                                    </Typography>
                                )}
                                <Chip
                                    label={submission?.statusi}
                                    size="small"
                                    color={submission?.statusi === 'VLERESUAR' ? 'success' : 'default'}
                                    className="mt-3! font-bold!"
                                />
                                {submission?.nota && (
                                    <Typography variant="h6" className="font-extrabold! text-sky-600! mt-3!">
                                        Nota: {submission.nota}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900/50! dark:border-slate-700/80!">
                            <CardContent className="p-5!">
                                <Typography variant="subtitle1" className="font-bold! text-slate-900! dark:text-white! mb-4!">
                                    Dorëzo detyrën
                                </Typography>

                                <div className="flex flex-col gap-4">
                                    <TextField
                                        label="Linku i punës (GitHub, Drive, etj.)"
                                        value={submissionUrl}
                                        onChange={(e) => setSubmissionUrl(e.target.value)}
                                        fullWidth
                                        size="small"
                                        placeholder="https://github.com/..."
                                        disabled={isExpired}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                                                '&:hover fieldset': { borderColor: '#0284c7' },
                                            },
                                            '& .MuiInputBase-input': { color: 'inherit' },
                                            '& .MuiInputLabel-root': { color: 'inherit' },
                                            '.dark &': {
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                    '&:hover fieldset': { borderColor: '#38bdf8' },
                                                },
                                                '& .MuiInputBase-input': { color: '#fff' },
                                                '& .MuiInputLabel-root': { color: '#94a3b8' },
                                            }
                                        }}
                                    />
                                    <TextField
                                        label="Përshkrim (opcionale)"
                                        value={pershkrimi}
                                        onChange={(e) => setPershkrimi(e.target.value)}
                                        fullWidth
                                        size="small"
                                        multiline
                                        rows={3}
                                        placeholder="Shënim për mësuesin..."
                                        disabled={isExpired}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                                                '&:hover fieldset': { borderColor: '#0284c7' },
                                            },
                                            '& .MuiInputBase-input': { color: 'inherit' },
                                            '& .MuiInputLabel-root': { color: 'inherit' },
                                            '.dark &': {
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                    '&:hover fieldset': { borderColor: '#38bdf8' },
                                                },
                                                '& .MuiInputBase-input': { color: '#fff' },
                                                '& .MuiInputLabel-root': { color: '#94a3b8' },
                                            }
                                        }}
                                    />

                                    {isExpired ? (
                                        <Typography variant="body2" className="text-red-500! font-semibold!">
                                            Deadline ka kaluar — nuk mund të dorëzosh më
                                        </Typography>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmit}
                                            disabled={!submissionUrl.trim() || submitting}
                                            className="normal-case! rounded-full! bg-sky-600! py-2.5!"
                                        >
                                            {submitting ? 'Duke dërguar...' : 'Dorëzo detyrën'}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </Container>
            {/* SUCCESS TOAST */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                TransitionComponent={Zoom}
            >
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity="success"
                    variant="filled"
                    sx={{ 
                        width: "100%", 
                        borderRadius: "1.25rem",
                        fontWeight: "bold",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </section>
    )
}