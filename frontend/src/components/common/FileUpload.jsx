import { useRef, useState } from 'react'
import { Button, Typography, Box, CircularProgress, IconButton, Chip, LinearProgress } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CreateNewFolderRoundedIcon from '@mui/icons-material/CreateNewFolderRounded'
import CloseIcon from '@mui/icons-material/Close'
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded'

export default function FileUpload({ onUpload, loading, allowedTypes = "" }) {
    const [selectedFiles, setSelectedFiles] = useState([])
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef(null)
    const folderInputRef = useRef(null)

    const acceptFiles = (fileList) => {
        const files = Array.from(fileList || [])
        if (files.length > 0) {
            setSelectedFiles(files)
        }
    }

    const handleUpload = () => {
        if (selectedFiles.length > 0) {
            onUpload(selectedFiles)
            setSelectedFiles([])
            if (fileInputRef.current) fileInputRef.current.value = ""
            if (folderInputRef.current) folderInputRef.current.value = ""
        }
    }

    const clearSelection = () => {
        setSelectedFiles([])
        if (fileInputRef.current) fileInputRef.current.value = ""
        if (folderInputRef.current) folderInputRef.current.value = ""
    }

    const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0)

    return (
        <Box className="flex flex-col gap-3">
            <input
                type="file"
                multiple
                accept={allowedTypes}
                onChange={(e) => acceptFiles(e.target.files)}
                style={{ display: 'none' }}
                ref={fileInputRef}
            />
            <input
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                onChange={(e) => acceptFiles(e.target.files)}
                style={{ display: 'none' }}
                ref={folderInputRef}
            />

            <Box
                onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    acceptFiles(e.dataTransfer.files)
                }}
                className="rounded-2xl border border-dashed p-4 transition-colors"
                sx={{
                    borderColor: isDragging ? 'var(--lms-schedule-accent)' : 'var(--lms-schedule-border)',
                    bgcolor: isDragging ? 'var(--lms-schedule-hover)' : 'var(--lms-schedule-surface)',
                    color: 'var(--lms-schedule-text)',
                }}
            >
                {selectedFiles.length === 0 ? (
                    <Box className="flex flex-col gap-3">
                        <Box className="flex items-start gap-3">
                            <Box
                                className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                                sx={{ bgcolor: 'var(--lms-schedule-sky-bg)' }}
                            >
                                <CloudUploadIcon sx={{ color: 'var(--lms-schedule-accent)' }} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: 'var(--lms-schedule-text)', fontWeight: 800 }}>
                                    Zvarrit materialet ketu
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--lms-schedule-muted)' }}>
                                    PDF, Office, ZIP, imazhe dhe video. Mund te zgjedhesh edhe nje dosje.
                                </Typography>
                            </Box>
                        </Box>
                        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Button
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => fileInputRef.current.click()}
                                className="!rounded-xl !border-dashed !py-3"
                                sx={{ color: 'var(--lms-schedule-text)', borderColor: 'var(--lms-schedule-border)' }}
                            >
                                Zgjidh Skedare
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<CreateNewFolderRoundedIcon />}
                                onClick={() => folderInputRef.current.click()}
                                className="!rounded-xl !border-dashed !py-3"
                                sx={{ color: 'var(--lms-schedule-text)', borderColor: 'var(--lms-schedule-border)' }}
                            >
                                Zgjidh Dosje
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box className="flex flex-col gap-3">
                        <Box className="flex items-start justify-between gap-3">
                            <Box className="min-w-0">
                                <Typography variant="body2" sx={{ color: 'var(--lms-schedule-text)', fontWeight: 800 }} noWrap>
                                    {selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} skedare te zgjedhur`}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'var(--lms-schedule-muted)' }}>
                                    {(totalSize / 1024 / 1024).toFixed(2)} MB total
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={clearSelection} disabled={loading}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Box className="flex flex-wrap gap-1">
                            {selectedFiles.slice(0, 4).map((file) => (
                                <Chip
                                    key={`${file.name}-${file.size}`}
                                    icon={<InsertDriveFileRoundedIcon />}
                                    label={file.name}
                                    size="small"
                                    variant="outlined"
                                    sx={{ color: 'var(--lms-schedule-text)', borderColor: 'var(--lms-schedule-border)' }}
                                />
                            ))}
                            {selectedFiles.length > 4 && (
                                <Chip size="small" label={`+${selectedFiles.length - 4}`} />
                            )}
                        </Box>
                        {loading && <LinearProgress />}
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={loading}
                            className="!rounded-xl !font-bold !normal-case"
                            sx={{
                                bgcolor: 'var(--lms-schedule-accent-strong)',
                                color: 'var(--lms-schedule-card)',
                                '&:hover': { bgcolor: 'var(--lms-schedule-accent)' },
                            }}
                        >
                            {loading ? <CircularProgress size={20} color="inherit" /> : "Ngarko materialet"}
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    )
}
