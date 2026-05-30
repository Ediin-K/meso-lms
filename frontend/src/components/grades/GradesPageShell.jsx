import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Breadcrumbs, Link, Typography, Button } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import NavigateNextRounded from "@mui/icons-material/NavigateNextRounded";
import Footer from "../ui/Footer";

export default function GradesPageShell({
  backTo,
  backLabel = "Kthehu",
  breadcrumbs = [],
  title,
  subtitle,
  icon: Icon,
  children,
  actions,
}) {
  const navigate = useNavigate();

  return (
    <Box className="flex min-h-screen flex-col bg-[#eef2f6] dark:bg-slate-950">
      <Box className="mx-auto w-full max-w-7xl flex-grow px-4 py-6 sm:px-6 sm:py-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate(backTo)}
          className="!mb-5 !rounded-lg !px-0 !normal-case !font-semibold !text-slate-600 hover:!bg-transparent hover:!text-sky-700 dark:!text-slate-400 dark:hover:!text-sky-400"
        >
          {backLabel}
        </Button>

        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextRounded fontSize="small" />}
            className="!mb-4 !text-sm !text-slate-500"
          >
            {breadcrumbs.map((crumb) =>
              crumb.to ? (
                <Link
                  key={crumb.label}
                  component={RouterLink}
                  to={crumb.to}
                  underline="hover"
                  color="inherit"
                  className="!text-sm"
                >
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={crumb.label} color="text.primary" className="!text-sm !font-medium">
                  {crumb.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>
        )}

        <Box className="mb-5 overflow-hidden rounded-lg border border-slate-300 bg-[#e9ecef] dark:border-slate-600 dark:bg-slate-800">
          <Box className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Box className="flex items-center gap-3">
              {Icon && (
                <Box className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#1e3a5f] shadow-sm dark:bg-slate-900 dark:text-sky-400">
                  <Icon />
                </Box>
              )}
              <Box>
                <Typography variant="h6" className="!font-bold !text-[#1e3a5f] dark:!text-white">
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" className="!mt-0.5 !text-slate-600 dark:!text-slate-400">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            {actions}
          </Box>
        </Box>

        {children}
      </Box>

      <Box className="border-t border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80">
        <Box className="mx-auto max-w-7xl px-4 py-8">
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}
