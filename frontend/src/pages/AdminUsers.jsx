import {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPreferences } from '../context/appPreferencesContext'
import {
    Typography, Container, Box, Card, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, Avatar, CircularProgress,
    Tooltip, Zoom, Grid
} from '@mui/material'
import SearchRounded from '@mui/icons-material/SearchRounded'
import AddRounded from '@mui/icons-material/AddRounded'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import DeleteRounded from '@mui/icons-material/DeleteRounded'
import PeopleRounded from '@mui/icons-material/PeopleRounded'
import PersonAddRounded from '@mui/icons-material/PersonAddRounded'
import FilterListRounded from '@mui/icons-material/FilterListRounded'
import MoreVertRounded from '@mui/icons-material/MoreVertRounded'
import VerifiedUserRounded from '@mui/icons-material/VerifiedUserRounded'
import Footer from '../components/ui/Footer'

const ROLE_STYLE = {
    admin:   'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    teacher: 'bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300',
    student: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    parent:  'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300',
}

const AVATAR_GRADIENT = {
    admin:   'from-violet-500 to-purple-600',
    teacher: 'from-sky-500 to-blue-600',
    student: 'from-emerald-500 to-teal-600',
    parent:  'from-amber-500 to-orange-600',
}

const EMPTY_FORM = {
    emri: '',
    mbiemri: '',
    email: '',
    passwordHash: '',
    role: 'student',
    statusi: 'active'
}
export default function AdminUsers() {
    const navigate = useNavigate()
    const { t, mode } = useAppPreferences()
    const isDark = mode === 'dark'

    const [users ,setUsers] = useState([])
    const [loading,setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [openDialog, setOpenDialog] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [formData, setFormData] = useState(EMPTY_FORM)

    const filtered = users.filter(u => {
        const matchesSearch = `${u.emri} ${u.mbiemri} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'all' || u.role === roleFilter
        return matchesSearch && matchesRole
    })

    useEffect(() => {
        const token = localStorage.getItem("token")

        setLoading(true)

        fetch("http://localhost:8080/api/users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(async res => {
                if (!res.ok) {
                    const msg = await res.text()
                    throw new Error(msg || "Error fetching users")
                }
                return res.json()
            })
            .then(data => setUsers(data))
            .catch(err => {
                console.error("API ERROR:", err.message)
            })
            .finally(() => setLoading(false))
    }, [])

    const handleOpenAdd = () => {
        setIsEdit(false); setSelectedUser(null)
        setFormData(EMPTY_FORM); setOpenDialog(true)
    }

    const handleOpenEdit = (user) => {
        setIsEdit(true); setSelectedUser(user)
        setFormData({
            emri: user.emri || '',
            mbiemri: user.mbiemri || '',
            email: user.email || '',
            role: user.role || 'student',
            statusi: user.statusi || 'active',
            passwordHash: ''
        })
        setOpenDialog(true)
    }

    const field = (k) => (e) => setFormData(f => ({ ...f, [k]: e.target.value }))

    return (
        <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
            <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 flex-grow">
                
                {/* BACK BUTTON & TOP STRIP */}
                <Box className="flex items-center justify-between mb-8">
                    <Button 
                        startIcon={<ArrowBackRounded />} 
                        onClick={() => navigate('/admin')}
                        className="!rounded-2xl !px-6 !py-2 !normal-case !font-bold !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200/50 dark:hover:!bg-slate-800/50"
                    >
                        {t('home.admin.services.backToPanel', 'Kthehu te Paneli')}
                    </Button>
                    <Box className="flex gap-2">
                        <Tooltip title="Filtra të avancuar">
                            <IconButton className="!bg-white dark:!bg-slate-900 border border-slate-200 dark:border-slate-800 !rounded-xl">
                                <FilterListRounded className="text-slate-500" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* HEADER SECTION */}
                <Box className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <Typography variant="overline" className="!font-bold !tracking-[0.3em] !text-indigo-600 dark:!text-indigo-400">
                            {t('adminUsers.overline', 'MENAXHIMI I SISTEMIT')}
                        </Typography>
                        <Typography variant="h3" component="h1" className="!mt-2 !font-black !text-slate-900 dark:!text-white">
                            {t('adminUsers.title', 'Përdoruesit')}
                        </Typography>
                        <Typography variant="body1" className="!mt-4 !max-w-2xl !text-slate-500 dark:!text-slate-400 text-lg !font-medium">
                            {t('adminUsers.subtitle', 'Mbikëqyrni llogaritë, rolet dhe aktivitetin e të gjithë anëtarëve të platformës.')}
                        </Typography>
                    </div>

                    <Box className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <TextField
                            placeholder={t('adminUsers.searchPlaceholder', 'Kërko përdorues...')}
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
                            startIcon={<PersonAddRounded />} 
                            onClick={handleOpenAdd}
                            className="!rounded-[1.5rem] !py-4 !px-8 !normal-case !font-black !bg-indigo-600 hover:!bg-indigo-700 shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
                        >
                            {t('adminUsers.form.addTitle', 'Shto Përdorues')}
                        </Button>
                    </Box>
                </Box>

                {/* QUICK STATS STRIP */}
                <Grid container spacing={3} className="mb-10">
                    {[
                        { label: 'Gjithsej', value: users.length, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                        { label: 'Aktivë', value: users.filter(u => u.statusi === 'active').length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Mësues', value: users.filter(u => u.role === 'teacher').length, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
                        { label: 'Studentë', value: users.filter(u => u.role === 'student').length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    ].map((s, i) => (
                        <Grid item xs={6} md={3} key={i}>
                            <Box className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center font-black text-xl`}>
                                    {s.value}
                                </div>
                                <div>
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
                            Lista e Përdoruesve
                        </Typography>
                        <Box className="flex gap-2">
                            {['all', 'admin', 'teacher', 'student', 'parent'].map((role) => (
                                <Button 
                                    key={role}
                                    size="small"
                                    onClick={() => setRoleFilter(role)}
                                    className={`!rounded-full !px-4 !py-1 !normal-case !text-xs !font-bold ${roleFilter === role ? '!bg-slate-900 !text-white dark:!bg-white dark:!text-slate-900' : '!text-slate-500 hover:!bg-slate-100 dark:hover:!bg-slate-800'}`}
                                >
                                    {role === 'all' ? 'Të gjithë' : role.charAt(0).toUpperCase() + role.slice(1)}
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    {loading ? (
                        <Box className="flex justify-center py-32"><CircularProgress className="!text-indigo-500" /></Box>
                    ) : (
                        <TableContainer>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead className="bg-slate-50/50 dark:!bg-slate-800/30">
                                    <TableRow>
                                        <TableCell className="!font-black !text-slate-400 !uppercase !text-[10px] !tracking-widest !py-6 !pl-8">{t('adminUsers.table.name', 'Përdoruesi')}</TableCell>
                                        <TableCell className="!font-black !text-slate-400 !uppercase !text-[10px] !tracking-widest !py-6">{t('adminUsers.table.role', 'Roli')}</TableCell>
                                        <TableCell className="!font-black !text-slate-400 !uppercase !text-[10px] !tracking-widest !py-6">{t('adminUsers.table.status', 'Statusi')}</TableCell>
                                        <TableCell className="!font-black !text-slate-400 !uppercase !text-[10px] !tracking-widest !py-6">{t('adminUsers.table.joined', 'Anëtarësuar')}</TableCell>
                                        <TableCell align="right" className="!font-black !text-slate-400 !uppercase !text-[10px] !tracking-widest !py-6 !pr-8">{t('adminUsers.table.actions', 'Veprime')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <Box className="flex flex-col items-center justify-center py-24 gap-6">
                                                    <div className="h-24 w-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                                                        <PeopleRounded className="!text-5xl text-slate-200 dark:text-slate-700" />
                                                    </div>
                                                    <div className="text-center">
                                                        <Typography variant="h6" className="!font-black !text-slate-800 dark:!text-white mb-1">Nuk u gjet asnjë përdorues</Typography>
                                                        <Typography variant="body2" className="!text-slate-400">Provo të ndryshosh filtrat ose kërkimin tend.</Typography>
                                                    </div>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map((user) => (
                                        <TableRow key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <TableCell className="!pl-8 !py-6">
                                                <Box className="flex items-center gap-4">
                                                    <Avatar className={`!w-12 !h-12 !rounded-2xl !text-base !bg-gradient-to-br ${AVATAR_GRADIENT[user.role] || 'from-slate-400 to-slate-500'} shadow-lg shadow-indigo-500/10`}>
                                                        {user.emri?.charAt(0)}{user.mbiemri?.charAt(0)}
                                                    </Avatar>
                                                    <div>
                                                        <Typography variant="body1" className="!font-black !text-slate-900 dark:!text-white !flex items-center gap-1.5">
                                                            {user.emri} {user.mbiemri}
                                                            {user.role === 'admin' && <VerifiedUserRounded className="!text-sky-500 !text-sm" />}
                                                        </Typography>
                                                        <Typography variant="caption" className="!text-slate-500 !font-medium">{user.email}</Typography>
                                                    </div>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${ROLE_STYLE[user.role] || ''}`}>
                                                    {user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Box className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${user.statusi === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                                    <Typography variant="caption" className={`!font-black !uppercase !tracking-widest ${user.statusi === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                        {user.statusi === 'active' ? t('adminUsers.status.active', 'Aktiv') : t('adminUsers.status.inactive', 'Joaktiv')}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell className="!text-slate-500 !font-bold !text-xs">{user.joined}</TableCell>
                                            <TableCell align="right" className="!pr-8">
                                                <Box className="flex justify-end gap-1">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleOpenEdit(user)}
                                                        className="!bg-slate-100 dark:!bg-slate-800 !text-slate-400 hover:!text-indigo-600 !rounded-xl transition-all"
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

                {/* MODERN DIALOG */}
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
                            {isEdit ? 'Përditëso Përdoruesin' : 'Shto Përdorues të Ri'}
                        </Typography>
                        <Typography variant="body2" className="!text-slate-500 dark:!text-slate-400 !mt-1">
                            {isEdit ? 'Ndryshoni të dhënat e llogarisë ekzistuese.' : 'Plotësoni të dhënat për të krijuar një llogari të re.'}
                        </Typography>
                    </DialogTitle>
                    <DialogContent className="!px-6 !py-4">
                        <Box className="flex flex-col gap-5 mt-4">
                            <Box className="flex gap-4">
                                <TextField 
                                    label="Emri" 
                                    fullWidth 
                                    value={formData.emri}
                                    onChange={field('emri')}
                                    InputProps={{ className: "!rounded-2xl" }}
                                />
                                <TextField 
                                    label="Mbiemri" 
                                    fullWidth 
                                    value={formData.mbiemri}
                                    onChange={field('mbiemri')}
                                    InputProps={{ className: "!rounded-2xl" }}
                                />
                            </Box>
                            <TextField 
                                label="Email Adresa" 
                                type="email" 
                                fullWidth 
                                value={formData.email} 
                                onChange={field('email')} 
                                InputProps={{ className: "!rounded-2xl" }}
                            />
                            {!isEdit && (
                                <TextField 
                                    label="Fjalëkalimi" 
                                    type="password" 
                                    fullWidth 
                                    value={formData.passwordHash}
                                    onChange={field('passwordHash')}
                                    InputProps={{ className: "!rounded-2xl" }}
                                />
                            )}
                            <Box className="flex gap-4">
                                <FormControl fullWidth>
                                    <InputLabel>Roli i Përdoruesit</InputLabel>
                                    <Select 
                                        value={formData.role} 
                                        label="Roli i Përdoruesit" 
                                        onChange={field('role')} 
                                        sx={{ borderRadius: '1rem' }}
                                    >
                                        <MenuItem value="student">Student</MenuItem>
                                        <MenuItem value="teacher">Mësues</MenuItem>
                                        <MenuItem value="parent">Prind</MenuItem>
                                        <MenuItem value="admin">Administrator</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel>Statusi</InputLabel>
                                    <Select 
                                        value={formData.statusi}
                                        label="Statusi" 
                                        onChange={field('statusi')}
                                        sx={{ borderRadius: '1rem' }}
                                    >
                                        <MenuItem value="active">Aktiv</MenuItem>
                                        <MenuItem value="inactive">Joaktiv</MenuItem>
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
                            {t('adminUsers.form.cancel', 'Anulo')}
                        </Button>
                        <Button 
                            variant="contained" 
                            disabled={!formData.emri || !formData.email}
                            className="!rounded-2xl !px-10 !py-3 !normal-case !font-black !bg-indigo-600 hover:!bg-indigo-700 shadow-lg shadow-indigo-500/20"
                        >
                            {isEdit ? 'Përditëso' : 'Krijo Llogarinë'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
            <Footer />
        </Box>
    )
}
