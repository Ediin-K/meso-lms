import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import { useAppPreferences } from '../../context/appPreferencesContext.js';
import CookieIcon from '@mui/icons-material/Cookie';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const COOKIE_STORAGE_KEY = 'meson-cookie-consent';

const CookieModal = ({ open, onClose, onSave }) => {
  const { colorMode } = useAppPreferences();
  const [currentPreferences, setCurrentPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (!open) return
    const stored = localStorage.getItem(COOKIE_STORAGE_KEY)
    const raf = window.requestAnimationFrame(() => {
      if (stored) {
        const parsed = JSON.parse(stored)
        setCurrentPreferences({
          necessary: true,
          analytics: parsed.analytics || false,
          marketing: parsed.marketing || false,
        })
      } else {
        setCurrentPreferences({
          necessary: true,
          analytics: false,
          marketing: false,
        })
      }
    })
    return () => window.cancelAnimationFrame(raf)
  }, [open])

  const handleToggle = (key) => (event) => {
    if (key === 'necessary') return; // always enabled
    setCurrentPreferences((prev) => ({ ...prev, [key]: event.target.checked }));
  };

  const handleSave = () => {
    const consent = {
      accepted: false,
      rejected: false,
      custom: true,
      ...currentPreferences,
    };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consent));
    onSave();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      BackdropProps={{
        style: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      }}
      PaperProps={{
        className: `rounded-2xl shadow-2xl border ${
          colorMode === 'dark'
            ? '!bg-slate-900/95 backdrop-blur-xl border-slate-700/50 text-white'
            : '!bg-white/95 backdrop-blur-xl border-gray-200/50 text-gray-900'
        }`,
        sx: {
          animation: 'modalFadeScale 0.4s ease-out',
          '@keyframes modalFadeScale': {
            from: { opacity: 0, transform: 'scale(0.9) translateY(-20px)' },
            to: { opacity: 1, transform: 'scale(1) translateY(0)' },
          },
          boxShadow: colorMode === 'dark'
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)',
        },
      }}
    >
      <DialogTitle className="text-center px-2 pt-4 pb-1 !bg-transparent">
        <Typography
          variant="h5"
          component="div"
          className="font-black text-slate-900 dark:text-slate-50"
          sx={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}
        >
          Menaxho Preferencat e Cookies
        </Typography>
        <IconButton
          type="button"
          aria-label="Close"
          onClick={onClose}
          size="small"
          className={`absolute right-2 top-2 z-[60] transition-all active:scale-95 ${
            colorMode === 'dark' ? '!text-sky-400 hover:!text-sky-300' : '!text-blue-600 hover:!text-blue-700'
          }`}
        >
          <CloseRoundedIcon />
        </IconButton>
        <Typography
          variant="body2"
          className="text-slate-500 dark:text-slate-400 mt-2 block"
          sx={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}
        >
          Përditësuar së fundmi: Maj 2026
        </Typography>
      </DialogTitle>
      <DialogContent dividers className="max-h-96 overflow-y-auto px-6 py-5 !bg-transparent">
        <Box className="mb-6 rounded-3xl border border-slate-200/80 bg-slate-50 p-5 text-center shadow-sm dark:border-slate-600/90 dark:bg-slate-900/95">
          <Typography
            variant="body1"
            className="font-medium text-slate-800 dark:text-slate-200"
            sx={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.9, letterSpacing: '0.01em' }}
          >
            Zgjidhni preferencat tuaja të cookies për Meson. <span className="font-semibold text-cyan-600 dark:text-cyan-300">Cookies e nevojshme mbeten gjithmonë të aktivizuara</span> për funksionimin e sigurt dhe të qëndrueshëm të platformës. Ju mund të kontrolloni Analytics dhe Marketing sipas dëshirës.
          </Typography>
        </Box>

        <Box className="space-y-6">
          <Box className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-blue-200 dark:border-slate-600">
            <CookieIcon className="text-blue-600 dark:text-cyan-300 mt-1 text-2xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-white" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem' }}>
                  Cookies e Nevojshme
                </Typography>
                <Chip
                  label="Gjithmonë aktive"
                  size="small"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold"
                  sx={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <Typography variant="body1" className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed" sx={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}>
                Këto cookies janë të nevojshme për funksionimin bazë të faqes dhe nuk mund të çaktivizohen.
              </Typography>
              <FormControlLabel
                control={<Switch checked={currentPreferences.necessary} disabled />}
                label={<span className="text-slate-900 dark:text-slate-100 font-medium">Aktiv</span>}
              />
            </div>
          </Box>

          <Divider className="my-4" />

          <Box className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 border border-purple-200 dark:border-slate-600">
            <AnalyticsIcon className="text-purple-600 dark:text-fuchsia-300 mt-1 text-2xl" />
            <div className="flex-1">
              <Typography variant="subtitle1" className="font-semibold text-slate-900 dark:text-slate-100 mb-2" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', letterSpacing: '0.01em' }}>
                Cookies Analitike
              </Typography>
              <Typography variant="body1" className="mb-3 text-slate-700 dark:text-slate-200 leading-relaxed" sx={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}>
                Na ndihmojnë të kuptojmë se si përdoret platforma për të përmirësuar përvojën.
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentPreferences.analytics}
                    onChange={handleToggle('analytics')}
                    color="primary"
                    className="transition-all duration-200"
                  />
                }
                label={
                  <span className={`font-medium ${currentPreferences.analytics ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {currentPreferences.analytics ? 'Aktiv' : 'Joaktiv'}
                  </span>
                }
              />
            </div>
          </Box>

          <Divider className="my-4" />

          <Box className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-900 dark:to-slate-800 border border-orange-200 dark:border-slate-600">
            <AdsClickIcon className="text-orange-600 dark:text-amber-300 mt-1 text-2xl" />
            <div className="flex-1">
              <Typography variant="subtitle1" className="font-semibold text-slate-900 dark:text-slate-100 mb-2" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', letterSpacing: '0.01em' }}>
                Cookies Marketing
              </Typography>
              <Typography variant="body1" className="mb-3 text-slate-700 dark:text-slate-200 leading-relaxed" sx={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}>
                Përdoren për të personalizuar reklamat dhe përmbajtjen bazuar në interesat tuaja.
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentPreferences.marketing}
                    onChange={handleToggle('marketing')}
                    color="primary"
                    className="transition-all duration-200"
                  />
                }
                label={
                  <span className={`font-medium ${currentPreferences.marketing ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {currentPreferences.marketing ? 'Aktiv' : 'Joaktiv'}
                  </span>
                }
              />
            </div>
          </Box>
        </Box>

        <Typography variant="body2" className="mt-6 text-sm text-center text-slate-500 dark:text-slate-300 font-medium" sx={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}>
          Për më shumë informacion, lexoni{' '}
          <a href="#" className="text-cyan-500 hover:text-cyan-400 dark:text-cyan-300 dark:hover:text-cyan-200 underline underline-offset-2 transition-colors font-semibold">
            Privacy Policy
          </a>{' '}
          dhe{' '}
          <a href="#" className="text-cyan-500 hover:text-cyan-400 dark:text-cyan-300 dark:hover:text-cyan-200 underline underline-offset-2 transition-colors font-semibold">
            Cookie Policy
          </a>{' '}
          tonë.
        </Typography>
      </DialogContent>
      <DialogActions className="px-6 py-4 !bg-gray-50 dark:!bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
        <Button
          onClick={onClose}
          className="font-semibold rounded-xl transition-all duration-200 hover:scale-105"
          sx={{
            textTransform: 'none',
            color: colorMode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
            '&:hover': {
              color: colorMode === 'dark' ? 'white' : 'black',
              backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            },
          }}
        >
          Anulo
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          className="font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
            },
          }}
        >
          Ruaj Preferencat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CookieModal;