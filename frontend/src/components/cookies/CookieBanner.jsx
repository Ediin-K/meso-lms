import React, { useState } from 'react';
import { Box, Button, Typography, Paper, IconButton, Fade } from '@mui/material';
import { useAppPreferences } from '../../context/appPreferencesContext.js';
import CookieModal from './CookieModal';
import CookieIcon from '@mui/icons-material/Cookie';
import SecurityIcon from '@mui/icons-material/Security';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const COOKIE_STORAGE_KEY = 'meson-cookie-consent';

const CookieBanner = () => {
  const { colorMode, t } = useAppPreferences();
  const [showBanner, setShowBanner] = useState(() => {
    const consent = localStorage.getItem(COOKIE_STORAGE_KEY);
    return !consent;
  });
  const [showModal, setShowModal] = useState(false);

  const handleAcceptAll = () => {
    const preferences = {
      accepted: true,
      rejected: false,
      necessary: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(preferences));
    setShowBanner(false);
  };

  const handleRejectNonEssential = () => {
    const preferences = {
      accepted: false,
      rejected: true,
      necessary: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(preferences));
    setShowBanner(false);
  };

  const handleManagePreferences = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <Paper
        elevation={0}
        className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[9999] max-w-md w-auto p-0 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border ${
          colorMode === 'dark'
            ? 'bg-slate-900/90 backdrop-blur-2xl border-slate-700/50 text-white'
            : 'bg-white/90 backdrop-blur-2xl border-white/60 text-slate-900'
        }`}
        sx={{
          animation: 'bannerAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          '@keyframes bannerAppear': {
            from: { opacity: 0, transform: 'translateY(100px) scale(0.9)' },
            to: { opacity: 1, transform: 'translateY(0) scale(1)' },
          },
        }}
      >
        {/* Top Accent Gradient Line */}
        <Box 
          className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400"
        />

        <Box className="p-6 md:p-8">
          <Box className="flex items-start gap-4 mb-5">
            <Box className={`p-3 rounded-2xl ${
              colorMode === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
            }`}>
              <CookieIcon fontSize="large" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                className="font-bold tracking-tight mb-1"
                sx={{ fontFamily: 'Inter, sans-serif' }}
              >
                {t('cookies.title')}
              </Typography>
              <Box className="flex items-center gap-1.5 opacity-70">
                <SecurityIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" className="font-medium">
                  {t('cookies.gdpr')}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography
            variant="body2"
            className="mb-8 leading-relaxed opacity-80"
            sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem' }}
          >
            {t('cookies.bannerText')}{' '}
            <button 
              onClick={handleManagePreferences}
              className="text-blue-500 hover:text-blue-400 underline underline-offset-4 font-bold transition-all"
            >
              {t('cookies.rulesLink')}
            </button>{' '}
            {t('cookies.privacySuffix')}
          </Typography>

          <Box className="flex flex-col gap-3">
            <Button
              variant="contained"
              onClick={handleAcceptAll}
              fullWidth
              className="py-3.5 font-bold rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
                },
              }}
            >
              {t('cookies.acceptAll')}
            </Button>
            
            <Box className="flex gap-3">
              <Button
                variant="outlined"
                onClick={handleRejectNonEssential}
                className="flex-1 py-2.5 font-semibold rounded-xl border-2 transition-all duration-200"
                sx={{
                  textTransform: 'none',
                  borderColor: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  color: colorMode === 'dark' ? 'white' : 'slate-700',
                  '&:hover': {
                    borderColor: colorMode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                    backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  },
                }}
              >
                {t('cookies.reject')}
              </Button>
              <Button
                variant="text"
                onClick={handleManagePreferences}
                className="flex-1 py-2.5 font-semibold rounded-xl transition-all duration-200"
                sx={{
                  textTransform: 'none',
                  color: colorMode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                  '&:hover': {
                    color: colorMode === 'dark' ? 'white' : 'black',
                    backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  },
                }}
              >
                {t('cookies.manage')}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Close button for minimalists */}
        <IconButton 
          size="small"
          onClick={handleRejectNonEssential}
          className={`absolute top-4 right-4 z-[60] transition-all active:scale-90 ${
            colorMode === 'dark' ? '!text-sky-400 opacity-80 hover:opacity-100' : '!text-blue-600 opacity-60 hover:opacity-100'
          }`}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Paper>
      <CookieModal open={showModal} onClose={handleCloseModal} onSave={() => setShowBanner(false)} />
    </>
  );
};

export default CookieBanner;