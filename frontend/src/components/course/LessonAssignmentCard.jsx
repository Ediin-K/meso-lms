import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Chip, CircularProgress, Typography, Tooltip } from '@mui/material'
import AssignmentRounded from '@mui/icons-material/AssignmentRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import UploadFileRounded from '@mui/icons-material/UploadFileRounded'
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded'
import AttachFileRounded from '@mui/icons-material/AttachFileRounded'
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded'
import assignmentService from '../../services/assignmentService'

export default function LessonAssignmentCard({ lessonId }) {
    const navigate = useNavigate()
    const [assignment, setAssignment] = useState(null)
    const [submitted, setSubmitted]   = useState(false)
    const [loading, setLoading]       = useState(true)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const res = await assignmentService.getByLesson(lessonId)
                if (!mounted) return
                if (res.status === 204 || !res.data) { setLoading(false); return }
                setAssignment(res.data)
                try {
                    const subRes = await assignmentService.getMySubmission(res.data.id)
                    if (mounted && subRes.data) setSubmitted(true)
                } catch { void 0 }
            } catch { void 0 }
            finally { if (mounted) setLoading(false) }
        })()
        return () => { mounted = false }
    }, [lessonId])

    const handleDownloadAttachment = async () => {
        if (!assignment) return
        setDownloading(true)
        try {
            const res = await assignmentService.downloadAttachment(assignment.id)
            const url = URL.createObjectURL(res.data)
            const a = document.createElement('a')
            a.href = url
            a.download = assignment.attachmentName || 'udhezimet'
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) { console.error(err) }
        finally { setDownloading(false) }
    }

    if (loading) {
        return (
            <Box className="mt-2 flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3">
                <CircularProgress size={16} className="!text-emerald-500" />
                <Typography variant="caption" className="!text-slate-400">Duke ngarkuar detyrën…</Typography>
            </Box>
        )
    }

    if (!assignment) {
        return (
            <Box className="mt-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/20 p-3">
                <div className="flex items-center gap-2">
                    <AssignmentRounded className="!text-slate-400" fontSize="small" />
                    <Typography variant="caption" className="!text-slate-400">
                        Detyra nuk është caktuar ende nga mësuesi.
                    </Typography>
                </div>
            </Box>
        )
    }

    const isOpen = assignment.isOpen
    const deadline = new Date(assignment.deadline).toLocaleString('sq-AL', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })

    return (
        <Box
            className={`mt-2 rounded-xl border p-4 dark:bg-slate-900/30 ${
                submitted
                    ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/50'
                    : isOpen
                        ? 'border-sky-200 bg-sky-50/60 dark:border-sky-800/50'
                        : 'border-slate-200 bg-slate-50/60 dark:border-slate-700'
            }`}
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                    <AssignmentRounded
                        className={`mt-0.5 flex-shrink-0 ${submitted ? '!text-emerald-600' : isOpen ? '!text-sky-600' : '!text-slate-400'}`}
                        fontSize="small"
                    />
                    <div className="min-w-0 flex-1">
                        <Typography variant="body2" className="!font-bold dark:!text-white">
                            {assignment.title}
                        </Typography>
                        <div className="flex items-center gap-1 mt-0.5">
                            <AccessTimeRounded style={{ fontSize: 13 }} className="!text-slate-400" />
                            <Typography variant="caption" className={`${isOpen ? '!text-slate-500' : '!text-red-500 !font-semibold'}`}>
                                Afati: {deadline}
                            </Typography>
                        </div>
                        {assignment.description && (
                            <Typography variant="caption" className="!text-slate-500 !block !mt-1 line-clamp-2">
                                {assignment.description}
                            </Typography>
                        )}

                        {}
                        {assignment.hasAttachment && (
                            <Box
                                className="mt-2 flex items-center gap-2 px-2 py-1 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/30 cursor-pointer hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors w-fit"
                                onClick={handleDownloadAttachment}
                            >
                                {downloading
                                    ? <CircularProgress size={12} className="!text-sky-500" />
                                    : <AttachFileRounded style={{ fontSize: 13 }} className="!text-sky-600" />
                                }
                                <Typography variant="caption" className="!text-sky-700 dark:!text-sky-400 !font-semibold max-w-[160px] truncate">
                                    {assignment.attachmentName || 'Udhëzimet'}
                                </Typography>
                                <FileDownloadRounded style={{ fontSize: 13 }} className="!text-sky-500" />
                            </Box>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {submitted && (
                        <Chip
                            icon={<CheckCircleRounded style={{ fontSize: 14 }} />}
                            label="Dorëzuar"
                            size="small"
                            color="success"
                            className="!font-semibold"
                        />
                    )}
                    {!submitted && !isOpen && (
                        <Chip label="Afati kaloi" size="small" color="error" variant="outlined" className="!font-semibold" />
                    )}

                    <Button
                        size="small"
                        variant="contained"
                        startIcon={submitted ? <CheckCircleRounded /> : <UploadFileRounded />}
                        disabled={!isOpen && !submitted}
                        onClick={() => navigate(`/assignment/${assignment.id}`)}
                        className={`!normal-case !font-bold !rounded-lg ${
                            submitted
                                ? '!bg-emerald-600 hover:!bg-emerald-700'
                                : isOpen
                                    ? '!bg-sky-600 hover:!bg-sky-700'
                                    : '!bg-slate-400'
                        }`}
                    >
                        {submitted ? 'Shiko dorëzimin' : isOpen ? 'Dorëzo detyrën' : 'Afati kaloi'}
                    </Button>
                </div>
            </div>
        </Box>
    )
}
