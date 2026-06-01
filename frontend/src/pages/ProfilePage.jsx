import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'

import Footer from '../components/ui/Footer'
import {
    Typography, Container, Box, CircularProgress, Card, CardContent, Chip, Button
} from '@mui/material'
import PersonRounded from '@mui/icons-material/PersonRounded'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
import PlayCircleFilledRounded from '@mui/icons-material/PlayCircleFilledRounded'
import VerifiedRounded from '@mui/icons-material/VerifiedRounded'
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded'

function CertificateCard({ cert }) {
    const navigate = useNavigate()
    const [copied, setCopied] = useState(false)

    const copy = () => {
        navigator.clipboard?.writeText(cert.kodiUnik || '')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
            {}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 flex items-center gap-3">
                <WorkspacePremiumRounded className="!text-3xl text-white/90" />
                <div className="min-w-0 flex-1">
                    <Typography variant="subtitle2" className="!font-black !text-white !leading-snug truncate">
                        {cert.courseTitulli}
                    </Typography>
                    <Typography variant="caption" className="!text-white/70">
                        Certifikatë e Përfundimit
                    </Typography>
                </div>
                <VerifiedRounded className="!text-2xl text-white/80 shrink-0" />
            </div>

            {}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 px-5 py-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                        <Typography variant="caption" className="!font-bold !uppercase !tracking-wider !text-slate-400 dark:!text-slate-500">
                            Data e lëshimit
                        </Typography>
                        <Typography variant="body2" className="!font-semibold !text-slate-700 dark:!text-slate-200">
                            {new Date(cert.dataLeshimit).toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Typography>
                    </div>
                    <Chip
                        label="E vlefshme"
                        size="small"
                        icon={<VerifiedRounded style={{ fontSize: 13 }} />}
                        className="!bg-emerald-100 !text-emerald-700 dark:!bg-emerald-900/50 dark:!text-emerald-300 !font-bold"
                    />
                </div>

                {}
                <div
                    onClick={copy}
                    className="cursor-pointer rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-slate-900/60 px-3 py-2 flex items-center justify-between gap-2 hover:border-emerald-400 transition-colors"
                    title="Kopjo kodin"
                >
                    <Typography variant="caption" className="!font-mono !text-slate-600 dark:!text-slate-300 !break-all flex-1">
                        {cert.kodiUnik}
                    </Typography>
                    <ContentCopyRounded style={{ fontSize: 15 }} className={copied ? 'text-emerald-500' : 'text-slate-400'} />
                </div>
                {copied && (
                    <Typography variant="caption" className="!text-emerald-600 dark:!text-emerald-400 !block !mt-1 !text-center">
                        U kopjua!
                    </Typography>
                )}

                <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/certificate/${cert.kodiUnik}`)}
                    className="!mt-3 !rounded-xl !normal-case !border-emerald-400 !text-emerald-700 dark:!text-emerald-400 dark:!border-emerald-700"
                >
                    Shiko & Verifikoni
                </Button>
            </div>
        </div>
    )
}

export default function ProfilePage() {
    const navigate = useNavigate()

    const userId = localStorage.getItem('userId')

    const [enrollments, setEnrollments] = useState([])
    const [certificates, setCertificates] = useState([])
    const [loading, setLoading] = useState(true)

    const email = localStorage.getItem('email') || '—'
    const role = localStorage.getItem('meson-role') || '—'

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [enrollmentsRes, certificatesRes] = await Promise.all([
                    axiosInstance.get(`/enrollments/user/${userId}`),
                    axiosInstance.get(`/certificates/user/${userId}`)
                ])
                setEnrollments(enrollmentsRes.data)
                setCertificates(certificatesRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [userId])

    if (loading) {
        return (
            <Box className="flex justify-center items-center py-24">
                <CircularProgress className="!text-sky-500" />
            </Box>
        )
    }

    return (
        <section className="flex flex-col min-h-screen">
            <Container maxWidth="lg" className="flex-grow py-8 px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">

                {}
                <Box className="mb-10">
                    <Typography variant="overline" className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400">
                        Profili
                    </Typography>
                    <Typography variant="h3" component="h1" className="!mt-1 !font-extrabold !text-slate-900 dark:!text-white">
                        Llogaria ime
                    </Typography>
                </Box>

                <div className="grid gap-6 lg:grid-cols-3">

                    {}
                    <div className="lg:col-span-1">
                        <Card elevation={0} className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80">
                            <CardContent className="!p-6">
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/50 mb-4">
                                        <PersonRounded className="!text-4xl text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <Chip
                                        label={role}
                                        size="small"
                                        color="primary"
                                        className="!font-bold !capitalize"
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <Typography variant="caption" className="!text-slate-500 dark:!text-slate-400 !font-semibold !uppercase !tracking-wider">
                                            Email
                                        </Typography>
                                        <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white !mt-0.5">
                                            {email}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" className="!text-slate-500 dark:!text-slate-400 !font-semibold !uppercase !tracking-wider">
                                            Kurse të regjistruara
                                        </Typography>
                                        <Typography variant="h5" className="!font-extrabold !text-sky-600 dark:!text-sky-400 !mt-0.5">
                                            {enrollments.length}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" className="!text-slate-500 dark:!text-slate-400 !font-semibold !uppercase !tracking-wider">
                                            Certifikata
                                        </Typography>
                                        <Typography variant="h5" className="!font-extrabold !text-green-600 dark:!text-green-400 !mt-0.5">
                                            {certificates.length}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {}
                        <Card elevation={0} className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80">
                            <CardContent className="!p-6">
                                <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white !mb-4 flex items-center gap-2">
                                    <SchoolRounded className="text-sky-600" fontSize="small" />
                                    Kurset e mia
                                </Typography>

                                {enrollments.length === 0 ? (
                                    <Typography variant="body2" className="!text-slate-500">
                                        Nuk je i regjistruar në asnjë kurs
                                    </Typography>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {enrollments.map(enrollment => (
                                            <Box
                                                key={enrollment.id}
                                                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-sky-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                                onClick={() => navigate(`/course/${enrollment.courseId}`)}
                                            >
                                                <div>
                                                    <Typography variant="body2" className="!font-semibold !text-slate-800 dark:!text-white">
                                                        {enrollment.courseTitulli}
                                                    </Typography>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Chip
                                                            label={enrollment.statusi}
                                                            size="small"
                                                            color={enrollment.statusi === 'AKTIV' ? 'success' : enrollment.statusi === 'PERFUNDUAR' ? 'primary' : 'default'}
                                                            className="!text-xs !font-bold"
                                                        />
                                                        <Typography variant="caption" className="!text-slate-500">
                                                            {new Date(enrollment.dataRegjistrimit).toLocaleDateString()}
                                                        </Typography>
                                                    </div>
                                                </div>
                                                <PlayCircleFilledRounded className="text-sky-500" fontSize="small" />
                                            </Box>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {}
                        <Card elevation={0} className="rounded-2xl border border-slate-200/80 dark:!border-slate-700/80">
                            <CardContent className="!p-6">
                                <Typography variant="subtitle1" className="!font-bold !text-slate-900 dark:!text-white !mb-4 flex items-center gap-2">
                                    <WorkspacePremiumRounded className="text-emerald-600" fontSize="small" />
                                    Certifikatat e mia
                                </Typography>

                                {certificates.length === 0 ? (
                                    <Box className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
                                        <WorkspacePremiumRounded className="!text-4xl text-slate-300 dark:text-slate-600 !mb-2" />
                                        <Typography variant="body2" className="!text-slate-500">
                                            Nuk ke asnjë certifikatë ende.
                                        </Typography>
                                        <Typography variant="caption" className="!text-slate-400 !block !mt-1">
                                            Përfundo të gjitha leksionet e një kursi për të marrë certifikatën.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {certificates.map(cert => (
                                            <CertificateCard key={cert.id} cert={cert} />
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
