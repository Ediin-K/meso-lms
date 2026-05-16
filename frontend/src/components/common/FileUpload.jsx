import React, { useState, useRef } from 'react';
import { Button, Typography, Box, CircularProgress, IconButton, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateNewFolderRoundedIcon from '@mui/icons-material/CreateNewFolderRounded';
import CloseIcon from '@mui/icons-material/Close';

export default function FileUpload({ onUpload, loading, allowedTypes = "" }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles(files);
        }
    };

    const handleUpload = () => {
        if (selectedFiles.length > 0) {
            onUpload(selectedFiles);
            setSelectedFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (folderInputRef.current) folderInputRef.current.value = "";
        }
    };

    const clearSelection = () => {
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (folderInputRef.current) folderInputRef.current.value = "";
    };

    return (
        <Box className="flex flex-col gap-3">
            <input
                type="file"
                multiple
                accept={allowedTypes}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
            />
            <input
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={folderInputRef}
            />
            
            {selectedFiles.length === 0 ? (
                <Box className="flex gap-3">
                    <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => fileInputRef.current.click()}
                        fullWidth
                        className="!rounded-xl !border-dashed !py-4"
                    >
                        Zgjidh Skedarë
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<CreateNewFolderRoundedIcon />}
                        onClick={() => folderInputRef.current.click()}
                        fullWidth
                        className="!rounded-xl !border-dashed !py-4"
                    >
                        Zgjidh Dosje
                    </Button>
                </Box>
            ) : (
                <Box className="flex items-center justify-between p-3 border rounded-xl bg-slate-50 dark:bg-slate-800">
                    <Box className="flex flex-col overflow-hidden">
                        <Typography variant="body2" className="truncate font-semibold">
                            {selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} skedarë të zgjedhur`}
                        </Typography>
                        <Typography variant="caption" className="text-slate-500">
                            {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB total
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
