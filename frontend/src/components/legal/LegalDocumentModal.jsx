import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { useAppPreferences } from '../../context/appPreferencesContext.js'

/**
 * Scrollable legal document modal.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {{ title: string, subtitle: string, sections: { id: string, heading: string, paragraphs: string[] }[] }} props.document
 */
export default function LegalDocumentModal({
  open,
  onClose,
  document: doc,
}) {
  const { colorMode } = useAppPreferences()
  if (!doc) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="legal-modal-title"
      slotProps={{
        paper: {
          className:
            'rounded-2xl border border-slate-200/90 !bg-sky-100/95 shadow-2xl dark:border-slate-600 dark:!bg-slate-950/95 sm:rounded-2xl',
        },
      }}
    >
      <DialogTitle
        id="legal-modal-title"
        className="relative flex items-start justify-between gap-3 border-b border-slate-200/80 pr-12 dark:border-slate-600/80 !bg-sky-100/95 dark:!bg-slate-950/95"
      >
        <span>
          <Typography
            component="span"
            variant="h5"
            className="block font-semibold text-slate-900 dark:text-slate-50"
            sx={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}
          >
            {doc.title}
          </Typography>
          <Typography
            variant="body2"
            className="mt-1 block text-slate-500 dark:text-slate-400"
            sx={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}
          >
            {doc.subtitle}
          </Typography>
        </span>
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
      </DialogTitle>

      <DialogContent
        dividers
        className="max-h-[min(80vh,600px)] px-4 py-4 sm:px-6 !bg-sky-100/80 dark:!bg-slate-950/80"
        tabIndex={0}
      >
        <div className="space-y-5 pb-2">
          {doc.sections.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`legal-section-${section.id}`}
              className="overflow-hidden rounded-3xl border border-sky-200/70 bg-sky-50/95 p-4 shadow-sm transition-colors duration-200 dark:border-slate-700/80 dark:bg-slate-900/95"
            >
              <Typography
                id={`legal-section-${section.id}`}
                variant="subtitle1"
                component="h2"
                className="mb-3 font-semibold text-slate-900 dark:text-cyan-200"
                sx={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}
              >
                {section.heading}
              </Typography>
              <div className="space-y-3">
                {section.paragraphs.map((p, i) => (
                  <Typography
                    key={`${section.id}-${i}`}
                    variant="body1"
                    component="p"
                    className="whitespace-pre-line text-slate-700 leading-8 dark:text-slate-200"
                    sx={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}
                  >
                    {p}
                  </Typography>
                ))}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
