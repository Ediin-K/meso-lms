import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Typography,
  Container,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Breadcrumbs,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import LayersRounded from "@mui/icons-material/LayersRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import AutoStoriesRounded from "@mui/icons-material/AutoStoriesRounded";
import teacherContentService from "../../services/teacherContentService";
import { useAppPreferences } from "../../context/appPreferencesContext";
import Footer from "../../components/ui/Footer";

const EMPTY_MODULE = {
  titulli: "",
  pershkrimi: "",
  rradhitja: 1,
};

export default function TeacherModules() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState(EMPTY_MODULE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!courseId) {
      fetchCourses();
    } else {
      fetchCourseAndModules();
    }
  }, [courseId]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await teacherContentService.getCourses();
      setCourses(res.data);
    } catch (err) {
      setError("Gabim gjatë marrjes së kurseve.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseAndModules = async () => {
    setLoading(true);
    try {
      const [courseRes, modulesRes] = await Promise.all([
        teacherContentService.getCourseById(courseId),
        teacherContentService.getModules(courseId),
      ]);
      setSelectedCourse(courseRes.data);
      setModules(modulesRes.data);
    } catch (err) {
      setError("Gabim gjatë marrjes së të dhënave.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditingModule(null);
    setFormData({ ...EMPTY_MODULE, rradhitja: modules.length + 1 });
    setOpenDialog(true);
  };

  const handleOpenEdit = (mod) => {
    setIsEdit(true);
    setEditingModule(mod);
    setFormData({
      titulli: mod.titulli,
      pershkrimi: mod.pershkrimi,
      rradhitja: mod.rradhitja,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await teacherContentService.updateModule(editingModule.id, {
          ...formData,
          courseId: Number(courseId),
        });
      } else {
        await teacherContentService.createModule({
          ...formData,
          courseId: Number(courseId),
        });
      }
      const res = await teacherContentService.getModules(courseId);
      setModules(res.data);
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A jeni i sigurt që dëshironi të fshini këtë modul? Bashkë me të do të fshihen edhe të gjitha leksionet.")) return;
    try {
      await teacherContentService.deleteModule(id);
      setModules((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-32 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <CircularProgress className="!text-indigo-500" />
      </Box>
    );
  }

  return (
    <Box className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8 flex-grow">
        
        {/* BREADCRUMBS & NAVIGATION */}
        <Box className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumbs 
            separator={<Box className="w-1 h-1 rounded-full bg-slate-300 mx-2" />}
            className="!text-slate-500 dark:!text-slate-400"
          >
            <Link to="/teacher" className="hover:text-indigo-600 transition-colors font-bold uppercase tracking-wider text-xs">
              Paneli
            </Link>
            <Link to="/teacher/modules" className="hover:text-indigo-600 transition-colors font-bold uppercase tracking-wider text-xs">
              Modulet
            </Link>
            {selectedCourse && (
              <Typography className="!font-bold !text-indigo-600 !uppercase !tracking-wider !text-xs">
                {selectedCourse.titulli}
              </Typography>
            )}
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate(courseId ? "/teacher/modules" : "/teacher")}
            className="!rounded-2xl !px-6 !py-2 !normal-case !font-bold !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200/50 dark:hover:!bg-slate-800/50"
          >
            {courseId ? "Ndërro Kursin" : "Kthehu te Paneli"}
          </Button>
        </Box>

        {/* CONTENT */}
        {!courseId ? (
          /* STEP 1: COURSE SELECTION */
          <Box>
            <Box className="mb-12">
              <Typography variant="h3" className="!font-black !text-slate-900 dark:!text-white mb-2">
                Zgjidhni Kursin
              </Typography>
              <Typography variant="body1" className="text-slate-500 dark:text-slate-400 text-lg">
                Zgjidhni një nga kurset tuaja për të menaxhuar modulet.
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {courses.map((course) => (
                <Grid item xs={12} sm={6} lg={4} key={course.id}>
                  <Card 
                    elevation={0}
                    onClick={() => navigate(`/teacher/modules/${course.id}`)}
                    className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
                    sx={{
                      height: "240px !important",
                      minHeight: "240px !important",
                      maxHeight: "240px !important",
                      borderRadius: "2.5rem !important",
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden !important",
                      backgroundColor: "background.paper",
                      "&:hover": {
                        borderColor: "primary.main",
                      }
                    }}
                  >
                    <CardContent 
                      sx={{ 
                        p: "40px !important", 
                        height: "100%", 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "space-between",
                        overflow: "hidden"
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, overflow: "hidden" }}>
                        <Box className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner flex-shrink-0 transition-transform group-hover:scale-110">
                          <SchoolRounded fontSize="large" />
                        </Box>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 900,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.2,
                            fontSize: "1.25rem"
                          }}
                          className="dark:text-white"
                        >
                          {course.titulli}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 3, borderTop: "1px solid", borderColor: "divider", flexShrink: 0 }}>
                         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                           <Box className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                           <Typography sx={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em", color: "text.secondary" }}>
                              {course.moduleCount || 0} MODULE
                           </Typography>
                         </Box>
                         <ArrowForwardRounded className="!text-indigo-600 dark:!text-indigo-400 !text-2xl transition-all duration-300 group-hover:translate-x-3" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {courses.length === 0 && (
                <Grid item xs={12}>
                   <Box className="p-20 text-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <SchoolRounded className="!text-6xl text-slate-200 mb-4" />
                      <Typography variant="h6" className="text-slate-400">Nuk keni asnjë kurs të regjistruar akoma.</Typography>
                   </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        ) : (
          /* STEP 2: MODULE MANAGEMENT */
          <Box>
            <Box className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <Typography variant="h3" className="!font-black !text-slate-900 dark:!text-white mb-2">
                  Menaxhimi i Moduleve
                </Typography>
                <Typography variant="body1" className="text-slate-500 dark:text-slate-400 text-lg flex items-center gap-2">
                  <SchoolRounded className="text-indigo-600" /> {selectedCourse?.titulli}
                </Typography>
              </div>
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={handleOpenAdd}
                className="!rounded-2xl !bg-indigo-600 !px-8 !py-3 !normal-case !font-bold shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                Shto Modul të Ri
              </Button>
            </Box>

            <Grid container spacing={3}>
              {modules.map((mod, index) => (
                <Grid item xs={12} key={mod.id}>
                  <Card 
                    elevation={0}
                    className="!rounded-[2rem] border border-slate-200/80 bg-white/80 dark:!bg-slate-900/50 dark:!border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900 transition-all shadow-sm"
                  >
                    <CardContent className="!p-6 flex flex-col md:flex-row md:items-center gap-6">
                      <Box className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black text-xl flex-shrink-0">
                        {mod.rradhitja}
                      </Box>
                      <Box className="flex-grow">
                        <Typography variant="h6" className="!font-black dark:!text-white">
                          {mod.titulli}
                        </Typography>
                        <Typography variant="body2" className="text-slate-500 dark:text-slate-400 line-clamp-1">
                          {mod.pershkrimi || "Nuk ka përshkrim."}
                        </Typography>
                      </Box>
                      
                      <Box className="flex items-center gap-6 md:px-6 md:border-x border-slate-100 dark:border-slate-800">
                         <div className="flex flex-col items-center">
                            <Typography variant="caption" className="!font-bold !text-slate-400 uppercase">Leksione</Typography>
                            <Typography variant="subtitle1" className="!font-black dark:!text-white flex items-center gap-1">
                               <AutoStoriesRounded fontSize="small" className="text-indigo-500" /> {mod.lessonCount || 0}
                            </Typography>
                         </div>
                      </Box>

                      <Box className="flex gap-2">
                        <Tooltip title="Ndrysho">
                          <IconButton 
                            onClick={() => handleOpenEdit(mod)}
                            className="!bg-indigo-50 dark:!bg-indigo-900/20 !text-indigo-600 hover:!bg-indigo-100 transition-colors"
                          >
                            <EditRounded />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Fshij">
                          <IconButton 
                            onClick={() => handleDelete(mod.id)}
                            className="!bg-rose-50 dark:!bg-rose-900/20 !text-rose-600 hover:!bg-rose-100 transition-colors"
                          >
                            <DeleteRounded />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {modules.length === 0 && (
                <Grid item xs={12}>
                   <Box className="p-20 text-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
                      <LayersRounded className="!text-6xl text-slate-200 mb-4" />
                      <Typography variant="h6" className="text-slate-400">Nuk ka asnjë modul për këtë kurs akoma.</Typography>
                      <Button 
                        variant="outlined" 
                        className="!mt-4 !rounded-full !normal-case" 
                        onClick={handleOpenAdd}
                      >
                        Krijo Modulin e Parë
                      </Button>
                   </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
          <Footer />
        </div>
      </Container>

      {/* MODULE DIALOG */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "!rounded-[2.5rem] !p-2 shadow-2xl dark:!bg-slate-900" }}
      >
        <DialogTitle className="!font-black !text-2xl !pt-8 !px-8">
          {isEdit ? "Ndrysho Modulin" : "Shto Modul të Ri"}
        </DialogTitle>
        <DialogContent className="!px-8 !pt-4">
          <Box className="flex flex-col gap-6 py-4">
            <TextField
              label="Titulli i Modulit"
              fullWidth
              variant="outlined"
              value={formData.titulli}
              onChange={(e) => setFormData({ ...formData, titulli: e.target.value })}
              InputProps={{ className: "!rounded-2xl" }}
            />
            <TextField
              label="Përshkrimi"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.pershkrimi}
              onChange={(e) => setFormData({ ...formData, pershkrimi: e.target.value })}
              InputProps={{ className: "!rounded-2xl" }}
            />
            <TextField
              label="Rradhitja"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.rradhitja}
              onChange={(e) => setFormData({ ...formData, rradhitja: Number(e.target.value) })}
              InputProps={{ className: "!rounded-2xl" }}
            />
          </Box>
        </DialogContent>
        <DialogActions className="!px-8 !pb-8 !pt-2">
          <Button onClick={() => setOpenDialog(false)} className="!normal-case !font-bold !text-slate-500">
            Anulo
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !formData.titulli}
            className="!rounded-2xl !bg-indigo-600 !px-10 !py-3 !normal-case !font-bold shadow-lg"
          >
            {saving ? "Duke ruajtur..." : isEdit ? "Përditëso" : "Krijo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
