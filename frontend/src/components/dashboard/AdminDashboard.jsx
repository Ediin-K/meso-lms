import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { useAppPreferences } from "../../context/appPreferencesContext";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
} from "@mui/material";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import WorkspacePremiumRounded from "@mui/icons-material/WorkspacePremiumRounded";
import CategoryRounded from "@mui/icons-material/CategoryRounded";
import AnalyticsRounded from "@mui/icons-material/AnalyticsRounded";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import Footer from "../ui/Footer";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-md">
        <Typography
          variant="caption"
          className="!font-bold !text-slate-500 !block mb-1"
        >
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            className="!font-black"
            style={{ color: entry.color || entry.fill }}
          >
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t, mode } = useAppPreferences();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isDark = mode === "dark";

  useEffect(() => {
    axiosInstance
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const registrationData = [
    { month: t("months.jan"), students: 400, courses: 20 },
    { month: t("months.feb"), students: 700, courses: 25 },
    { month: t("months.mar"), students: 600, courses: 28 },
    { month: t("months.apr"), students: 1200, courses: 35 },
    { month: t("months.may"), students: 1500, courses: 42 },
    { month: t("months.jun"), students: 1800, courses: 50 },
  ];

  const categoryData = [
    { name: t("home.admin.services.charts.prog"), value: 45, color: "#6366f1" },
    {
      name: t("home.admin.services.charts.design"),
      value: 30,
      color: "#0ea5e9",
    },
    { name: t("home.admin.services.charts.biz"), value: 15, color: "#f59e0b" },
    { name: t("home.admin.services.charts.lang"), value: 10, color: "#10b981" },
  ];

  const enrollmentStatusData = [
    {
      name: t("home.admin.services.charts.active"),
      students: 850,
      fill: "#0ea5e9",
    },
    {
      name: t("home.admin.services.charts.completed"),
      students: 420,
      fill: "#10b981",
    },
    {
      name: t("home.admin.services.charts.pending"),
      students: 150,
      fill: "#f59e0b",
    },
  ];

  const adminServices = [
    {
      title: t("home.admin.services.users.title"),
      desc: t("home.admin.services.users.desc"),
      icon: PeopleRounded,
      path: "/admin/users",
      color: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-900/40",
    },
    {
      title: t("home.admin.services.courses.title"),
      desc: t("home.admin.services.courses.desc"),
      icon: SchoolRounded,
      path: "/admin/courses",
      color: "text-sky-600",
      bg: "bg-sky-100 dark:bg-sky-900/40",
    },
    {
      title: t("home.admin.services.categories.title"),
      desc: t("home.admin.services.categories.desc"),
      icon: CategoryRounded,
      path: "/admin/categories",
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/40",
    },
    {
      title: t("home.admin.services.enrollments.title"),
      desc: t("home.admin.services.enrollments.desc"),
      icon: AssignmentRounded,
      path: "/admin/enrollments",
      color: "text-rose-600",
      bg: "bg-rose-100 dark:bg-rose-900/40",
    },
    {
      title: t("home.admin.services.certificates.title"),
      desc: t("home.admin.services.certificates.desc"),
      icon: WorkspacePremiumRounded,
      path: "/admin/certificates",
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
    {
      title: "Oraret",
      desc: "Pamje e pergjithshme e orareve. Krijimi behet brenda wizard-it te grupit.",
      icon: CalendarMonthRounded,
      path: "/admin/schedules",
      color: "text-cyan-600",
      bg: "bg-cyan-100 dark:bg-cyan-900/40",
    },
    {
      title: "Menaxhimi i grupeve",
      desc: "Krijoni grupe sipas drejtimit dhe semestrit (G1, G2, G3), kapacitet dhe status.",
      icon: GroupsRounded,
      path: "/admin/groups",
      color: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-900/40",
    },
  ];

  return (
    <Container maxWidth="xl" className="py-8 mt-4 sm:mt-8">
      <Box className="mb-10 rounded-[3rem] border border-slate-200/60 bg-white/80 p-6 shadow-2xl shadow-slate-200/20 sm:p-12 dark:!border-slate-700/60 dark:!bg-slate-900/50 dark:shadow-none">
        {}
        <Box className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Typography
              variant="overline"
              className="!font-bold !tracking-widest !text-sky-600 dark:!text-sky-400"
            >
              {t("home.admin.overline")}
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              className="!mt-1 !font-black !text-slate-900 dark:!text-white"
            >
              {t("home.admin.title")}
            </Typography>
            <Typography
              variant="body1"
              className="!mt-3 !max-w-2xl !text-slate-600 dark:!text-slate-400 text-lg !font-medium"
            >
              {t("home.admin.body")}
            </Typography>
          </div>
          <div className="flex gap-4">
            <Box className="h-16 w-16 rounded-3xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-inner">
              <AnalyticsRounded fontSize="large" />
            </Box>
          </div>
        </Box>

        {}
        {!loading && stats ? (
          <Box className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: t("home.admin.stats.users"),
                value: stats.totalUsers,
                icon: PeopleRounded,
                color: "text-indigo-600",
                bg: "bg-indigo-50 dark:bg-indigo-900/20",
              },
              {
                label: t("home.admin.stats.courses"),
                value: stats.totalCourses,
                icon: SchoolRounded,
                color: "text-sky-600",
                bg: "bg-sky-50 dark:bg-sky-900/20",
              },
              {
                label: t("home.admin.stats.enrollments"),
                value: stats.totalEnrollments,
                icon: AssignmentRounded,
                color: "text-amber-600",
                bg: "bg-amber-50 dark:bg-amber-900/20",
              },
              {
                label: t("home.admin.services.certificates.title"),
                value: stats.totalCertificates,
                icon: WorkspacePremiumRounded,
                color: "text-emerald-600",
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
              },
            ].map((s, i) => (
              <Box
                key={i}
                className="p-6 rounded-3xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]"
              >
                <div
                  className={`h-10 w-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}
                >
                  <s.icon fontSize="small" />
                </div>
                <Typography
                  variant="caption"
                  className="!text-slate-500 !uppercase !font-bold !tracking-widest !block"
                >
                  {s.label}
                </Typography>
                <Typography
                  variant="h4"
                  className="!font-black dark:!text-white"
                >
                  {s.value}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box className="mt-10 flex justify-center p-12">
            <CircularProgress color="inherit" />
          </Box>
        )}

        {}
        <Typography
          variant="h5"
          className="!mt-16 !mb-8 !font-black !text-slate-800 dark:!text-white flex items-center justify-center gap-3"
        >
          <AnalyticsRounded className="text-sky-600" />
          {t("home.admin.services.reports.title")}
        </Typography>

        <Box className="max-w-[1400px] mx-auto">
          <Grid container spacing={4} justifyContent="center">
            {}
            <Grid item xs={12} md={4}>
              <Card className="!rounded-[2.5rem] !border-none !bg-slate-50/50 dark:!bg-slate-800/30 !p-8 shadow-inner h-full">
                <Typography
                  variant="subtitle1"
                  className="!font-black !mb-8 !text-slate-800 dark:!text-white uppercase tracking-widest text-center"
                >
                  {t("home.admin.services.charts.registrations")}
                </Typography>
                <Box className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={registrationData}>
                      <defs>
                        <linearGradient
                          id="colorStudents"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366f1"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#334155" : "#e2e8f0"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: isDark ? "#94a3b8" : "#64748b",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="students"
                        name={t("home.admin.services.charts.students")}
                        stroke="#6366f1"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorStudents)"
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            {}
            <Grid item xs={12} md={4}>
              <Card className="!rounded-[2.5rem] !border-none !bg-slate-50/50 dark:!bg-slate-800/30 !p-8 shadow-inner h-full">
                <Typography
                  variant="subtitle1"
                  className="!font-black !mb-8 !text-slate-800 dark:!text-white uppercase tracking-widest text-center"
                >
                  {t("home.admin.services.charts.categories")}
                </Typography>
                <Box className="h-[300px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={8}
                        dataKey="value"
                        animationBegin={500}
                        animationDuration={1500}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            cornerRadius={10}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            {}
            <Grid item xs={12} md={4}>
              <Card className="!rounded-[2.5rem] !border-none !bg-slate-50/50 dark:!bg-slate-800/30 !p-8 shadow-inner h-full">
                <Typography
                  variant="subtitle1"
                  className="!font-black !mb-8 !text-slate-800 dark:!text-white uppercase tracking-widest text-center"
                >
                  {t("home.admin.services.charts.enrollments")}
                </Typography>
                <Box className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrollmentStatusData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#334155" : "#e2e8f0"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: isDark ? "#94a3b8" : "#64748b",
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      />
                      <YAxis hide />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "transparent" }}
                      />
                      <Bar
                        dataKey="students"
                        name={t("home.admin.services.charts.students")}
                        radius={[15, 15, 0, 0]}
                        barSize={40}
                        animationDuration={1500}
                      >
                        {enrollmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {}
        <Typography
          variant="h5"
          className="!mt-20 !mb-8 !font-black !text-slate-800 dark:!text-white flex items-center justify-center gap-3"
        >
          <CategoryRounded className="text-sky-600" />
          {t("home.admin.services.title")}
        </Typography>

        <Box
          className="max-w-[1400px] mx-auto mb-16"
          sx={{
            display: "grid",
            gap: 4,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
          }}
        >
          {adminServices.map((service) => (
            <Card
              key={service.title}
              elevation={0}
              className="group relative flex flex-col rounded-[2.5rem] border border-slate-200/80 bg-white dark:!bg-slate-800/40 dark:!border-slate-800 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-sky-500/10 cursor-pointer overflow-hidden"
              onClick={() => navigate(service.path)}
            >
              <CardContent className="!p-8 flex flex-col h-full relative z-10">
                <Box
                  className={`h-16 w-16 rounded-3xl ${service.bg} flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}
                >
                  <service.icon className={`${service.color} !text-3xl`} />
                </Box>
                <Typography
                  variant="h6"
                  className="!font-black !text-slate-900 dark:!text-white mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"
                >
                  {service.title}
                </Typography>
                <Typography
                  variant="body2"
                  className="!text-slate-500 dark:!text-slate-400 mb-10 flex-grow leading-relaxed !font-medium !text-base"
                >
                  {service.desc}
                </Typography>
                <Box className="flex items-center text-sky-600 dark:text-sky-400 font-black text-xs uppercase tracking-[0.2em] mt-auto">
                  {t("home.admin.services.enter")}
                  <ArrowForwardRounded className="ml-2 !text-lg transition-transform group-hover:translate-x-3" />
                </Box>
              </CardContent>

              {}
              <Box className="absolute inset-0 bg-gradient-to-br from-sky-500/0 via-transparent to-sky-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
            </Card>
          ))}
        </Box>

        <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
          <Footer />
        </div>
      </Box>
    </Container>
  );
}
