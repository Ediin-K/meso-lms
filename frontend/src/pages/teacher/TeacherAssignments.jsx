import { useCallback, useEffect, useState } from 'react'
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, IconButton, InputLabel, MenuItem, Select,
    TextField, Tooltip, Typography,
} from '@mui/material'
import AssignmentRounded    from '@mui/icons-material/AssignmentRounded'
import AddRounded           from '@mui/icons-material/AddRounded'
import EditRounded          from '@mui/icons-material/EditRounded'
import DeleteRounded        from '@mui/icons-material/DeleteRounded'
import PeopleRounded        from '@mui/icons-material/PeopleRounded'
import CloseRounded         from '@mui/icons-material/CloseRounded'
import AttachFileRounded    from '@mui/icons-material/AttachFileRounded'
import FileDownloadRounded  from '@mui/icons-material/FileDownloadRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import UploadFileRounded    from '@mui/icons-material/UploadFileRounded'
import assignmentService    from '../../services/assignmentService'
import Footer               from '../../components/ui/Footer'

function fmtDeadline(dl) {
    return new Date(dl).toLocaleString('sq-AL', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

function openStatusChip(isOpen) {
    return (
        <Chip
            label={isOpen ? 'Hapur' : 'Mbyllur'}
            size="small"
            color={isOpen ? 'success' : 'default'}
            className="!font-semibold"
        />
    )
}

const EMPTY_FORM = { title: '', description: '', deadline: '', lessonId: '' }

export default function TeacherAssignments() {
    const [assignments, setAssignments]   = useState([])
    const [lessons, setLessons]           = useState([])
    const [loading, setLoading]           = useState(true)
    const [error, setError]               = useState('')

    const [formOpen, setFormOpen]         = useState(false)
    const [editing, setEditing]           = useState(null)
    const [form, setForm]                 = useState(EMPTY_FORM)
    const [saving, setSaving]             = useState(false)

    const [attachOpen, setAttachOpen]     = useState(false)
    const [attachTarget, setAttachTarget] = useState(null)
    const [attachFile, setAttachFile]     = useState(null)
    const [attachSaving, setAttachSaving] = useState(false)

    const [subsOpen, setSubsOpen]         = useState(false)
    const [subsTarget, setSubsTarget]     = useState(null)
    const [submissions, setSubmissions]   = useState([])
    const [subsLoading, setSubsLoading]   = useState(false)

    const [deleteId, setDeleteId]         = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [aRes, lRes] = await Promise.all([
                assignmentService.getAll(),
                assignmentService.getLessonsForAssignment(),
            ])
            setAssignments(aRes.data)
            setLessons(lRes.data)
        } catch {
            setError('Ngarkimi dështoi.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const openCreate = () => {
        setEditing(null)
        setForm(EMPTY_FORM)
        setFormOpen(true)
    }

    const openEdit = (a) => {
        setEditing(a)
        setForm({
            title: a.title,
            description: a.description || '',
            deadline: a.deadline ? a.deadline.slice(0, 16) : '',
            lessonId: a.lessonId,
        })
        setFormOpen(true)
    }

    const handleSave = async () => {
        if (!form.title.trim() || !form.deadline || !form.lessonId) return
        setSaving(true)
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim() || null,
                deadline: form.deadline + ':00',
                lessonId: form.lessonId,
            }
            if (editing) {
                await assignmentService.update(editing.id, payload)
            } else {
                await assignmentService.create(payload)
            }
            setFormOpen(false)
            load()
        } catch (err) {
            setError(err.response?.data?.message || 'Ruajtja dështoi.')
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async () => {
        try {
            await assignmentService.remove(deleteId)
            setDeleteId(null)
            load()
        } catch {
            setError('Fshirja dështoi.')
        }
    }

    const openAttach = (a) => {
        setAttachTarget(a)
        setAttachFile(null)
        setAttachOpen(true)
    }

    const handleUploadAttachment = async () => {
        if (!attachFile) return
        setAttachSaving(true)
        try {
            await assignmentService.uploadAttachment(attachTarget.id, attachFile)
            setAttachOpen(false)
            load()
        } catch {
            setError('Ngarkimi i skedarit dështoi.')
        } finally {
            setAttachSaving(false)
        }
    }

    const handleRemoveAttachment = async (id) => {
        try {
            await assignmentService.removeAttachment(id)
            load()
        } catch {
            setError('Heqja e skedarit dështoi.')
        }
    }

    const openSubs = async (a) => {
        setSubsTarget(a)
        setSubsOpen(true)
        setSubsLoading(true)
        try {
            const res = await assignmentService.getSubmissions(a.id)
            setSubmissions(res.data)
        } catch {
            setSubmissions([])
        } finally {
            setSubsLoading(false)
        }
    }

    const downloadSub = async (sub) => {
        try {
            const res = await assignmentService.downloadSubmissionFile(sub.id)
            const url = URL.createObjectURL(res.data)
            const a = document.createElement('a')
            a.href = url
            a.download = sub.fileName || 'submission'
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            setError('Shkarkimi dështoi.')
        }
    }

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="lg" className="flex-grow py-8 px-4 sm:px-6">

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <AssignmentRounded className="text-sky-600 !text-3xl" />
                        <Typography variant="h5" className="!font-extrabold !text-slate-900 dark:!text-white">
                            Detyrat
                        </Typography>
                    </div>
                    <Button
                        variant="contained"
                        startIcon={<AddRounded />}
                        onClick={openCreate}
                        className="!rounded-xl !normal-case !bg-sky-600 hover:!bg-sky-700"
                    >
                        Detyrë e re
                    </Button>
                </div>

                {error && <Alert severity="error" className="!mb-4 !rounded-xl" onClose={() => setError('')}>{error}</Alert>}

                {loading ? (
                    <Box className="flex justify-center py-16"><CircularProgress className="!text-sky-500" /></Box>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">Nuk keni detyra ende.</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {assignments.map(a => (
                            <Card key={a.id} elevation={0} className="rounded-2xl border border-slate-200 dark:!bg-slate-900/50 dark:!border-slate-700">
                                <CardContent className="!p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white">
                                                    {a.title}
                                                </Typography>
                                                {openStatusChip(a.isOpen)}
                                            </div>
                                            <Typography variant="caption" className="!text-slate-500 !block">
                                                {a.lessonTitle}
                                            </Typography>
                                            <Typography variant="caption" className="!text-slate-400 !block !mt-0.5">
                                                ⏰ {fmtDeadline(a.deadline)}
                                            </Typography>
                                            {a.description && (
                                                <Typography variant="body2" className="!text-slate-600 dark:!text-slate-400 !mt-2 line-clamp-2">
                                                    {a.description}
                                                </Typography>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                                            <Tooltip title="Dorëzimet">
                                                <IconButton size="small" onClick={() => openSubs(a)} className="!text-slate-600 dark:!text-slate-400">
                                                    <PeopleRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={a.hasAttachment ? 'Menaxho skedarin' : 'Bashkëngjit skedar'}>
                                                <IconButton size="small" onClick={() => openAttach(a)} className={a.hasAttachment ? '!text-sky-600' : '!text-slate-400'}>
                                                    <AttachFileRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Ndrysho">
                                                <IconButton size="small" onClick={() => openEdit(a)} className="!text-slate-600 dark:!text-slate-400">
                                                    <EditRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Fshi">
                                                <IconButton size="small" onClick={() => setDeleteId(a.id)} className="!text-red-500">
                                                    <DeleteRounded fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </Container>

            <Footer />

            {}
            <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ className: 'rounded-2xl! dark:bg-slate-900!' }}>
                <DialogTitle className="!font-bold dark:!text-white">
                    {editing ? 'Ndrysho detyrën' : 'Detyrë e re'}
                </DialogTitle>
                <DialogContent className="flex flex-col gap-4 !pt-2">
                    <FormControl fullWidth size="small">
                        <InputLabel>Leksioni</InputLabel>
                        <Select
                            value={form.lessonId}
                            onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}
                            label="Leksioni"
                            disabled={!!editing}
                        >
                            {lessons.map(l => (
                                <MenuItem key={l.id} value={l.id}>
                                    {l.courseTitle} › {l.moduleTitle} › {l.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Titulli"
                        size="small"
                        fullWidth
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    />
                    <TextField
                        label="Përshkrimi (opsional)"
                        size="small"
                        fullWidth
                        multiline
                        rows={3}
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                    <TextField
                        label="Afati"
                        type="datetime-local"
                        size="small"
                        fullWidth
                        value={form.deadline}
                        onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions className="!px-6 !pb-4">
                    <Button onClick={() => setFormOpen(false)} className="!normal-case !text-slate-600">Anulo</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || !form.title.trim() || !form.deadline || !form.lessonId}
                        className="!rounded-xl !normal-case !bg-sky-600 hover:!bg-sky-700"
                    >
                        {saving ? <CircularProgress size={18} className="!text-white" /> : 'Ruaj'}
                    </Button>
                </DialogActions>
            </Dialog>

            {}
            <Dialog open={attachOpen} onClose={() => setAttachOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{ className: 'rounded-2xl! dark:bg-slate-900!' }}>
                <DialogTitle className="!font-bold dark:!text-white flex items-center justify-between">
                    Skedari i udhëzimeve
                    <IconButton size="small" onClick={() => setAttachOpen(false)}><CloseRounded fontSize="small" /></IconButton>
                </DialogTitle>
                <DialogContent className="!pt-2">
                    {attachTarget?.hasAttachment && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 mb-4">
                            <AttachFileRounded className="text-sky-600" fontSize="small" />
                            <Typography variant="body2" className="!flex-1 truncate dark:!text-slate-300">
                                {attachTarget.attachmentName}
                            </Typography>
                            <Tooltip title="Hiq skedarin">
                                <IconButton size="small" onClick={() => { handleRemoveAttachment(attachTarget.id); setAttachOpen(false) }} className="!text-red-500">
                                    <DeleteOutlineRounded fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </div>
                    )}
                    <label className="block cursor-pointer">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-sky-400 transition-colors">
                            <UploadFileRounded className="text-sky-600" />
                            <span className="text-sm text-slate-600 dark:text-slate-400 flex-1 truncate">
                                {attachFile ? attachFile.name : 'Zgjidhni skedarin e ri…'}
                            </span>
                        </div>
                        <input type="file" className="sr-only" onChange={e => setAttachFile(e.target.files?.[0] || null)} />
                    </label>
                </DialogContent>
                <DialogActions className="!px-6 !pb-4">
                    <Button onClick={() => setAttachOpen(false)} className="!normal-case !text-slate-600">Anulo</Button>
                    <Button
                        variant="contained"
                        disabled={!attachFile || attachSaving}
                        onClick={handleUploadAttachment}
                        className="!rounded-xl !normal-case !bg-sky-600 hover:!bg-sky-700"
                    >
                        {attachSaving ? <CircularProgress size={18} className="!text-white" /> : 'Ngarko'}
                    </Button>
                </DialogActions>
            </Dialog>

            {}
            <Dialog open={subsOpen} onClose={() => setSubsOpen(false)} maxWidth="md" fullWidth
                PaperProps={{ className: 'rounded-2xl! dark:bg-slate-900!' }}>
                <DialogTitle className="!font-bold dark:!text-white flex items-center justify-between">
                    <span>
                        Dorëzimet · <span className="text-sky-600">{subsTarget?.title}</span>
                    </span>
                    <IconButton size="small" onClick={() => setSubsOpen(false)}><CloseRounded fontSize="small" /></IconButton>
                </DialogTitle>
                <DialogContent className="!pt-2">
                    {subsLoading ? (
                        <Box className="flex justify-center py-8"><CircularProgress className="!text-sky-500" /></Box>
                    ) : submissions.length === 0 ? (
                        <Typography variant="body2" className="!text-slate-500 text-center py-8">
                            Asnjë student nuk ka dorëzuar ende.
                        </Typography>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {submissions.map(sub => (
                                <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex-1 min-w-0">
                                        <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                                            {sub.studentName}
                                        </Typography>
                                        <Typography variant="caption" className="!text-slate-500 !block">
                                            {sub.studentEmail}
                                        </Typography>
                                        <Typography variant="caption" className="!text-slate-500 !block">
                                            Leksioni: {sub.lessonTitle} · {new Date(sub.submittedAt).toLocaleString('sq-AL')}
                                        </Typography>
                                        <Typography variant="caption" className="!text-slate-400 truncate !block">
                                            {sub.fileName}
                                        </Typography>
                                    </div>
                                    <Tooltip title="Shkarko skedarin">
                                        <IconButton size="small" onClick={() => downloadSub(sub)} className="!text-sky-600">
                                            <FileDownloadRounded fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {}
            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth
                PaperProps={{ className: 'rounded-2xl! dark:bg-slate-900!' }}>
                <DialogTitle className="!font-bold dark:!text-white">Konfirmo fshirjen</DialogTitle>
                <DialogContent>
                    <Typography className="dark:!text-slate-300">
                        Jeni i sigurt që doni ta fshini këtë detyrë? Të gjitha dorëzimet do të fshihen gjithashtu.
                    </Typography>
                </DialogContent>
                <DialogActions className="!px-6 !pb-4">
                    <Button onClick={() => setDeleteId(null)} className="!normal-case !text-slate-600">Anulo</Button>
                    <Button variant="contained" onClick={confirmDelete} className="!rounded-xl !normal-case !bg-red-600 hover:!bg-red-700">
                        Fshi
                    </Button>
                </DialogActions>
            </Dialog>
        </section>
    )
}
