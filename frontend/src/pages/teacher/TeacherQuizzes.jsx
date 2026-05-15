import { Typography, Container, Box, Button } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import { useNavigate } from "react-router-dom";
import QuizRounded from "@mui/icons-material/QuizRounded";
import Footer from "../../components/ui/Footer";

export default function TeacherQuizzes() {
  const navigate = useNavigate();

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 flex-grow">
        <Box className="mb-8">
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate("/teacher")}
            className="!rounded-2xl !px-6 !py-2 !normal-case !font-bold !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200/50 dark:hover:!bg-slate-800/50"
          >
            Kthehu te Paneli
          </Button>
        </Box>

        <Box className="mb-10 p-6 sm:p-12 rounded-[3rem] border border-slate-200/60 bg-white/80 shadow-2xl shadow-slate-200/20 dark:border-slate-700/60 dark:bg-slate-900/50 dark:shadow-none">
          <Box className="flex items-center gap-4 mb-6">
            <Box className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <QuizRounded />
            </Box>
            <div>
              <Typography variant="h4" className="!font-black dark:!text-white">Kuizet</Typography>
              <Typography variant="body1" className="text-slate-500 dark:text-slate-400">Menaxhoni kuizet dhe vlerësimet.</Typography>
            </div>
          </Box>
          <Typography variant="body2" className="text-slate-400 dark:text-slate-600 italic">
            Sistemi i kuizeve është duke u integruar në faqet e leksioneve.
          </Typography>
        </Box>

        <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
          <Footer />
        </div>
      </Container>
    </Box>
  );
}
