import React, { useState, useRef } from 'react';
import { Button, Typography, Box, CircularProgress, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

export default function FileUpload({ onUpload, loading, allowedTypes = "" }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile);
            setSelectedFile(null);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Box className="flex flex-col gap-3">
            <input
                type="file"
                accept={allowedTypes}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
            />
            
            {!selectedFile ? (
                <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => fileInputRef.current.click()}
                    fullWidth
                    className="!rounded-xl !border-dashed !py-4"
                >
                    Zgjidh Skedarin
                </Button>
            ) : (
                <Box className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-slate-800">
                    <Box className="flex flex-col overflow-hidden">
                        <Typography variant="body2" className="truncate font-semibold">
                            {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" className="text-slate-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                    </Box>
                    <Box className="flex items-center gap-1">
                        <IconButton size="small" onClick={clearSelection} disabled={loading}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                        <Button 
                            variant="contained" 
                            size="small" 
                            onClick={handleUpload}
                            disabled={loading}
                            className="!rounded-lg"
                        >
                            {loading ? <CircularProgress size={20} /> : "Ngarko"}
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
