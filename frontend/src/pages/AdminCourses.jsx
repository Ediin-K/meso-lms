import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPreferences } from '../context/appPreferencesContext'
import {
    Typography, Container, Box, Card, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress,
    Tooltip, Zoom, Grid
} from '@mui/material'
import SearchRounded from '@mui/icons-material/SearchRounded'
import AddRounded from '@mui/icons-material/AddRounded'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import DeleteRounded from '@mui/icons-material/DeleteRounded'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import BookRounded from '@mui/icons-material/BookRounded'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded'
import LayersRounded from '@mui/icons-material/LayersRounded'
import Footer from '../components/ui/Footer'

const SEMESTER_COLORS = {
    1: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    2: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    3: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    4: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    5: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    6: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
}

const EMPTY_FORM = { title: '', description: '', categoryName: '', semester: 1, credits: 6, instructorName: '' }

export default function AdminCourses() {
    const navigate = useNavigate()
    const { t, mode, locale } = useAppPreferences()
    const isDark = mode === 'dark'

    // MOCK DATA FOR LËNDËT (Bilingual)
    const coursesSq = [
        { id: 1, title: 'Matematikë I', description: 'Bazat e analizës matematike dhe algjebrës lineale.', categoryName: 'Shkencë', semester: 1, credits: 6, instructorName: 'Dr. Agim Rama' },
        { id: 2, title: 'Programim në Java', description: 'Hyrje në programimin e orientuar nga objektet.', categoryName: 'Programim', semester: 2, credits: 7, instructorName: 'Msc. Elira Krasniqi' },
        { id: 3, title: 'Dizajn Grafik', description: 'Teoria e ngjyrave dhe bazat e Photoshop.', categoryName: 'Dizajn', semester: 1, credits: 5, instructorName: 'Sara Gashi' },
        { id: 4, title: 'Bazat e të Dhënave', description: 'Modelimi SQL dhe menaxhimi i sistemeve DBMS.', categoryName: 'TI', semester: 3, credits: 6, instructorName: 'Dritan Leka' },
        { id: 5, title: 'Gjuhë Angleze', description: 'Anglisht teknike për studentët e TI.', categoryName: 'Gjuhë', semester: 1, credits: 3, instructorName: 'Besnik Vata' },
    ]

    const coursesEn = [
        { id: 1, title: 'Mathematics I', description: 'Basics of mathematical analysis and linear algebra.', categoryName: 'Science', semester: 1, credits: 6, instructorName: 'Dr. Agim Rama' },
        { id: 2, title: 'Java Programming', description: 'Introduction to object-oriented programming.', categoryName: 'Programming', semester: 2, credits: 7, instructorName: 'Msc. Elira Krasniqi' },
        { id: 3, title: 'Graphic Design', description: 'Color theory and basics of Photoshop.', categoryName: 'Design', semester: 1, credits: 5, instructorName: 'Sara Gashi' },
        { id: 4, title: 'Database Basics', description: 'SQL modeling and DBMS system management.', categoryName: 'IT', semester: 3, credits: 6, instructorName: 'Dritan Leka' },
        { id: 5, title: 'English Language', description: 'Technical English for IT students.', categoryName: 'Languages', semester: 1, credits: 3, instructorName: 'Besnik Vata' },
    ]

    const courses = locale === 'en' ? coursesEn : coursesSq;

    const [loading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [openDialog, setOpenDialog] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [formData, setFormData] = useState(EMPTY_FORM)

    const filtered = courses.filter(c =>
        (c.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.categoryName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )

    const handleOpenAdd = () => {
        setIsEdit(false); setSelectedCourse(null)
        setFormData(EMPTY_FORM); setOpenDialog(true)
    }

    const handleOpenEdit = (course) => {
        setIsEdit(true); setSelectedCourse(course)
        setFormData({ ...course })
        setOpenDialog(true)
    }

    const field = (k) => (e) => setFormData(f => ({ ...f, [k]: e.target.value }))

    return (
        <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
            <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 flex-grow">
                
                {/* BACK BUTTON */}
                <Box className="mb-8">
                    <Button 
                        startIcon={<ArrowBackRounded />} 
                        onClick={() => navigate('/admin')}
                        className="!rounded-2xl !px-6 !py-2 !normal-case !font-bold !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200/50 dark:hover:!bg-slate-800/50"
                    >
                        {t('home.admin.services.backToPanel', 'Kthehu te Paneli')}
                    </Button>
                </Box>

                {/* HEADER SECTION */}
                <Box className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <Typography variant="overline" className="!font-bold !tracking-[0.3em] !text-sky-600 dark:!text-sky-400">
                            {t('adminCourses.overline', 'KURIKULA AKADEMIKE')}
                        </Typography>
                        <Typography variant="h3" component="h1" className="!mt-2 !font-black !text-slate-900 dark:!text-white">
                            {t('adminCourses.title', 'Lëndët')}
                        </Typography>
                        <Typography variant="body1" className="!mt-4 !max-w-2xl !text-slate-500 dark:!text-slate-400 text-lg !font-medium">
                            {t('adminCourses.subtitle', 'Menaxhoni planin mësimor, kreditet ECTS dhe instruktorët për çdo lëndë.')}
                        </Typography>
                    </div>

                    <Box className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <TextField
                            placeholder={t('adminCourses.searchPlaceholder', 'Kërko lëndët...')}
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full lg:w-80"
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchRounded className="text-slate-400" /></InputAdornment>,
                                className: "!rounded-[1.5rem] !bg-white dark:!bg-slate-900 !border-none shadow-sm shadow-slate-200/50 dark:shadow-none"
                            }}
                            sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                        />
                        <Button 
                            variant="contained" 
                            startIcon={<AddRounded />} 
                            onClick={handleOpenAdd}
                            className="!rounded-[1.5rem] !py-4 !px-8 !normal-case !font-black !bg-sky-600 hover:!bg-sky-700 shadow-xl shadow-sky-500/30 transition-all hover:scale-105 active:scale-95"
                        >
                            {t('adminCourses.addTitle', 'Shto Lëndë')}
                        </Button>
                    </Box>
                </Box>

                {/* QUICK STATS STRIP */}
                <Grid container spacing={3} className="mb-10">
                    {[
                        { label: t('adminCourses.stats.total'), value: courses.length, icon: BookRounded, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
                        { label: t('adminCourses.stats.credits'), value: courses.reduce((acc, c) => acc + c.credits, 0), icon: LayersRounded, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                        { label: t('adminCourses.stats.categories'), value: new Set(courses.map(c => c.categoryName)).size, icon: AutoStoriesRounded, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: t('adminCourses.stats.average'), value: (courses.reduce((acc, c) => acc + c.credits, 0) / courses.length).toFixed(1), icon: SchoolRounded, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { label: t('adminCourses.stats.active'), value: '2', icon: LayersRounded, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                    ].map((s, i) => (
                        <Grid item xs={6} sm={4} md={2.4} key={i}>
                            <Box className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center font-black text-xl`}>
                                    <s.icon fontSize="small" />
                                </div>
                                <div>
                                    <Typography variant="h5" className="!font-black dark:!text-white leading-none mb-1">{s.value}</Typography>
                                    <Typography variant="caption" className="!text-slate-500 !font-bold !tracking-widest !uppercase !block">
                                        {s.label}
                                    </Typography>
                                </div>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* TABLE CONTAINER */}
                <Card elevation={0} className="!rounded-[2.5rem] border border-slate-200/60 bg-white/80 dark:!bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-none">
                    <Box className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <Typography variant="h6" className="!font-black !text-slate-800 dark:!text-white">
                            {t('adminCourses.catalogTitle')}
                        </Typography>
                    </Box>

                    {loading ? (
                        <Box className="flex justify-center py-32"><CircularProgress className="!text-sky-500" /></Box>
                    ) : (
                        <TableContainer>
                            <Table sx={{ minWidth: 900 }}>
                                <TableHead className="bg-slate-50/50 dark:!bg-slate-800/30">
                                    <TableRow>
                                        <TableCell className="!font-black !text-slate-400 !uppercase !text-[10px] !tracking-widest !py-6 !pl-8">{t('adminCourses.table.title', 'Lënda')}</TableCell>
                                        <TableCell className="!font-black !text-slate-400 !uppercase !text-[10px] !tracking-widest !py-6">{t('adminCourses.table.category', 'Kategoria')}</TableCell>
                                        <TableCell className="!font-black !text-slate-400 !uppercase !text-[10px] !tracking-widest !py-6">{t('adminCourses.table.semester', 'Semestri')}</TableCell>
                                        <TableCell className="!font-black !text-slate-400 !uppercase !text-[10px] !tracking-widest !py-6">{t('adminCourses.table.credits', 'ECTS')}</TableCell>
                                        <TableCell className="!font-black !text-slate-400 !uppercase !text-[10px] !tracking-widest !py-6">{t('adminCourses.table.instructor', 'Instruktori')}</TableCell>
                                        <TableCell align="right" className="!font-black !text-slate-400 !uppercase !text-[10px] !tracking-widest !py-6 !pr-8">{t('adminCourses.table.actions', 'Veprime')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <Box className="flex flex-col items-center justify-center py-24 gap-6">
                                                    <div className="h-24 w-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                                                        <MenuBookRounded className="!text-5xl text-slate-200 dark:text-slate-700" />
                                                    </div>
                                                    <div className="text-center">
                                                        <Typography variant="h6" className="!font-black !text-slate-800 dark:!text-white mb-1">Nuk u gjet asnjë lëndë</Typography>
                                                        <Typography variant="body2" className="!text-slate-400">Provo të ndryshosh kërkimin tend.</Typography>
                                                    </div>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map((course) => (
                                        <TableRow key={course.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <TableCell className="!pl-8 !py-6">
                                                <Box className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-inner">
                                                        <AutoStoriesRounded fontSize="small" />
                                                    </div>
                                                    <div>
                                                        <Typography variant="body1" className="!font-black !text-slate-900 dark:!text-white">
                                                            {course.title}
                                                        </Typography>
                                                        <Typography variant="caption" className="!text-slate-500 !font-medium line-clamp-1 max-w-[250px]">
                                                            {course.description}
                                                        </Typography>
                                                    </div>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={course.categoryName} 
                                                    size="small" 
                                                    className="!font-bold !bg-slate-100 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-400 !rounded-lg"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${SEMESTER_COLORS[course.semester] || SEMESTER_COLORS[1]}`}>
                                                    {t('adminCourses.table.semester')} {course.semester}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Box className="flex items-center gap-2">
                                                    <LayersRounded className="text-violet-400 !text-sm" />
                                                    <Typography variant="body2" className="!font-black !text-slate-700 dark:!text-slate-300">
                                                        {course.credits} ECTS
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell className="!text-slate-600 dark:!text-slate-400 !font-bold !text-sm">
                                                {course.instructorName}
                                            </TableCell>
                                            <TableCell align="right" className="!pr-8">
                                                <Box className="flex justify-end gap-1">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleOpenEdit(course)}
                                                        className="!bg-slate-100 dark:!bg-slate-800 !text-slate-400 hover:!text-sky-600 !rounded-xl transition-all"
                                                    >
                                                        <EditRounded fontSize="small" />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small" 
                                                        className="!bg-slate-100 dark:!bg-slate-800 !text-slate-400 hover:!text-rose-600 !rounded-xl transition-all"
                                                    >
                                                        <DeleteRounded fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Card>

                {/* MODERN DIALOG FOR LËNDËT */}
                <Dialog 
                    open={openDialog} 
                    onClose={() => setOpenDialog(false)} 
                    maxWidth="sm" 
                    fullWidth 
                    TransitionComponent={Zoom}
                    PaperProps={{ 
                        sx: { 
                            borderRadius: '2.5rem', 
                            p: 2, 
                            backgroundImage: isDark ? 'linear-gradient(to bottom right, #0f172a, #020617)' : 'white',
                            border: isDark ? '1px solid #1e293b' : 'none'
                        } 
                    }}
                >
                    <DialogTitle className="!px-6 !pt-6 !pb-2">
                        <Typography variant="h5" className="!font-black !text-slate-900 dark:!text-white">
                            {isEdit ? 'Ndrysho Lëndën' : 'Shto Lëndë të Re'}
                        </Typography>
                        <Typography variant="body2" className="!text-slate-500 dark:!text-slate-400 !mt-1">
                            Planimetria e lëndës, kreditet dhe instruktori përgjegjës.
                        </Typography>
                    </DialogTitle>
                    <DialogContent className="!px-6 !py-4">
                        <Box className="flex flex-col gap-5 mt-4">
                            <TextField 
                                label="Titulli i Lëndës" 
                                fullWidth 
                                value={formData.title} 
                                onChange={field('title')} 
                                InputProps={{ className: "!rounded-2xl" }}
                            />
                            <TextField 
                                label="Përshkrimi i Shkurtër" 
                                fullWidth 
                                multiline 
                                rows={3}
                                value={formData.description} 
                                onChange={field('description')} 
                                InputProps={{ className: "!rounded-2xl" }}
                            />
                            <Box className="flex gap-4">
                                <TextField 
                                    label={t('adminCourses.table.category')} 
                                    fullWidth 
                                    value={formData.categoryName} 
                                    onChange={field('categoryName')} 
                                    InputProps={{ className: "!rounded-2xl" }}
                                />
                                <TextField 
                                    label={t('adminCourses.table.instructor')} 
                                    fullWidth 
                                    value={formData.instructorName} 
                                    onChange={field('instructorName')} 
                                    InputProps={{ className: "!rounded-2xl" }}
                                />
                            </Box>
                            <Box className="flex gap-4">
                                <FormControl fullWidth>
                                    <InputLabel>{t('adminCourses.table.semester')}</InputLabel>
                                    <Select 
                                        value={formData.semester} 
                                        label={t('adminCourses.table.semester')} 
                                        onChange={field('semester')} 
                                        sx={{ borderRadius: '1rem' }}
                                    >
                                        {[1,2,3,4,5,6,7,8].map(s => <MenuItem key={s} value={s}>{t('adminCourses.table.semester')} {s}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel>{t('adminCourses.table.credits')}</InputLabel>
                                    <Select 
                                        value={formData.credits} 
                                        label={t('adminCourses.table.credits')} 
                                        onChange={field('credits')} 
                                        sx={{ borderRadius: '1rem' }}
                                    >
                                        {[2,3,4,5,6,7,8,10].map(c => <MenuItem key={c} value={c}>{c} ECTS</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions className="!px-8 !pb-8 !pt-4 gap-2">
                        <Button 
                            onClick={() => setOpenDialog(false)} 
                            className="!rounded-2xl !px-6 !py-3 !normal-case !font-bold !text-slate-500 hover:!bg-slate-100 dark:hover:!bg-slate-800"
                        >
                            Anulo
                        </Button>
                        <Button 
                            variant="contained" 
                            disabled={!formData.title}
                            className="!rounded-2xl !px-10 !py-3 !normal-case !font-black !bg-sky-600 hover:!bg-sky-700 shadow-lg shadow-sky-500/20"
                        >
                            {isEdit ? 'Përditëso' : 'Shto Lëndën'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
            <Footer />
        </Box>
    )
}
