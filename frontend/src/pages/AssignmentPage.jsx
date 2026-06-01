import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Typography, Alert,
} from '@mui/material'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import AttachFileRounded from '@mui/icons-material/AttachFileRounded'
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded'
import UploadFileRounded from '@mui/icons-material/UploadFileRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import assignmentService from '../services/assignmentService'

function DeadlineChip({ deadline, isOpen }) {
    const date = new Date(deadline)
    const label = date.toLocaleString('sq-AL', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
    return (
        <Chip
            label={`Afati: ${label}`}
            size="small"
            color={isOpen ? 'success' : 'error'}
            variant="outlined"
            className="!font-semibold"
        />
    )
}

export default function AssignmentPage() {
    const { assignmentId } = useParams()
    const navigate = useNavigate()

    const [assignment, setAssignment]   = useState(null)
    const [submission, setSubmission]   = useState(null)
    const [loading, setLoading]         = useState(true)
    const [uploading, setUploading]     = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [error, setError]             = useState('')
    const [success, setSuccess]         = useState('')
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const [aRes, sRes] = await Promise.allSettled([
                    assignmentService.getById(assignmentId),
                    assignmentService.getMySubmission(assignmentId),
                ])
                if (aRes.status === 'fulfilled') setAssignment(aRes.value.data)
                if (sRes.status === 'fulfilled') setSubmission(sRes.value.data)
            } catch {
                setError('Detyra nuk u gjet.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [assignmentId])

    const handleDownloadAttachment = async () => {
        setDownloading(true)
        try {
            const res = await assignmentService.downloadAttachment(assignmentId)
            const url = URL.createObjectURL(res.data)
            const a = document.createElement('a')
            a.href = url
            a.download = assignment.attachmentName || 'attachment'
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            setError('Shkarkimi dështoi.')
        } finally {
            setDownloading(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedFile) return
        setUploading(true)
        setError('')
        try {
            const res = await assignmentService.submit(assignmentId, selectedFile)
            setSubmission(res.data)
            setSelectedFile(null)
            setSuccess('Detyra u dorëzua me sukses!')
        } catch (err) {
            setError(err.response?.data?.message || 'Dorëzimi dështoi.')
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <Box className="flex justify-center items-center py-24">
                <CircularProgress className="!text-sky-500" />
            </Box>
        )
    }

    if (!assignment) {
        return (
            <Container maxWidth="lg" sx={{ mt: 6 }}>
                <Typography className="!text-slate-800 dark:!text-white">Detyra nuk u gjet.</Typography>
                <Button startIcon={<ArrowBackRounded />} onClick={() => navigate(-1)} className="!mt-4 !normal-case">Kthehu</Button>
            </Container>
        )
    }

    const isOpen = assignment.isOpen

    return (
        <Container maxWidth="md" className="py-8 mt-4 sm:mt-8">
            <Button
                startIcon={<ArrowBackRounded />}
                onClick={() => navigate(-1)}
                className="!mb-6 !normal-case !text-slate-600 dark:!text-slate-400"
            >
                Kthehu te leksioni
            </Button>

            {}
            <Card elevation={0} className="rounded-2xl border border-slate-200 dark:!bg-slate-900/50 dark:!border-slate-700 !mb-6">
                <CardContent className="!p-6">
                    <div className="flex items-start gap-3 mb-4">
                        <AssignmentRounded className="text-sky-600 !mt-1" />
                        <div className="flex-1">
                            <Typography variant="h5" className="!font-extrabold !text-slate-900 dark:!text-white !mb-1">
                                {assignment.title}
                            </Typography>
                            <Typography variant="caption" className="!text-slate-500">
                                {assignment.lessonTitle}
                            </Typography>
                        </div>
                        <DeadlineChip deadline={assignment.deadline} isOpen={isOpen} />
                    </div>

                    {!isOpen && (
                        <Alert severity="error" className="!mb-4 !rounded-xl">
                            Afati i dorëzimit ka kaluar. Nuk mund të dorëzoni më.
                        </Alert>
                    )}

                    {assignment.description && (
                        <Typography variant="body1" className="!text-slate-700 dark:!text-slate-300 !leading-relaxed whitespace-pre-wrap !mb-4">
                            {assignment.description}
                        </Typography>
                    )}

                    {}
                    {assignment.hasAttachment && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
                            <AttachFileRounded className="text-sky-600" fontSize="small" />
                            <Typography variant="body2" className="!flex-1 !text-slate-700 dark:!text-slate-300 !font-medium truncate">
                                {assignment.attachmentName || 'Udhëzime'}
                            </Typography>
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<FileDownloadRounded />}
                                onClick={handleDownloadAttachment}
                                disabled={downloading}
                                className="!rounded-lg !normal-case !bg-sky-600 hover:!bg-sky-700 !shrink-0"
                            >
                                {downloading ? <CircularProgress size={16} className="!text-white" /> : 'Shkarko'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {}
            <Card elevation={0} className="rounded-2xl border border-slate-200 dark:!bg-slate-900/50 dark:!border-slate-700">
                <CardContent className="!p-6">
                    <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white !mb-4">
                        Dorëzimi juaj
                    </Typography>

                    {success && <Alert severity="success" className="!mb-4 !rounded-xl">{success}</Alert>}
                    {error && <Alert severity="error" className="!mb-4 !rounded-xl">{error}</Alert>}

                    {submission ? (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircleRounded className="text-emerald-600" />
                            <div className="flex-1 min-w-0">
                                <Typography variant="body2" className="!font-semibold !text-emerald-800 dark:!text-emerald-300">
                                    Dorëzuar me sukses
                                </Typography>
                                <Typography variant="caption" className="!text-slate-500 truncate !block">
                                    {submission.fileName} · {new Date(submission.submittedAt).toLocaleString('sq-AL')}
                                </Typography>
                            </div>
                        </div>
                    ) : isOpen ? (
                        <div className="flex flex-col gap-4">
                            <label className="block">
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-600 cursor-pointer transition-colors">
                                    <UploadFileRounded className="text-sky-600" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400 flex-1 truncate">
                                        {selectedFile ? selectedFile.name : 'Zgjidhni skedarin për dorëzim…'}
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    className="sr-only"
                                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                                />
                            </label>
                            <Button
                                variant="contained"
                                disabled={!selectedFile || uploading}
                                onClick={handleSubmit}
                                className="!rounded-xl !normal-case !bg-sky-600 hover:!bg-sky-700 !py-2"
                            >
                                {uploading ? <CircularProgress size={20} className="!text-white" /> : 'Dorëzo detyrën'}
                            </Button>
                        </div>
                    ) : (
                        <Typography variant="body2" className="!text-slate-500">
                            Afati ka kaluar dhe nuk keni dorëzuar detyrën.
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Container>
    )
}
