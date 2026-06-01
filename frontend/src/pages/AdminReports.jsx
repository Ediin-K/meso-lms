import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppPreferences } from "../context/appPreferencesContext";
import {
  Typography, Container, Box, Card, CardContent, Grid,
  Button, CircularProgress,
} from "@mui/material";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import AnalyticsRounded from "@mui/icons-material/AnalyticsRounded";
import PeopleOutlineRounded from "@mui/icons-material/PeopleOutlineRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import axiosInstance from "../services/axiosInstance";
import Footer from "../components/ui/Footer";

const PIE_COLORS = [
  "#6366f1", "#0ea5e9", "#f59e0b", "#10b981",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

const STATUS_COLORS = {
  "Aktiv":      "#0ea5e9",
  "Përfunduar": "#10b981",
  "Anuluar":    "#ef4444",
};

function StatCard({ label, value, icon: Icon, color, bg, loading }) {
  return (
    <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 shadow-sm">
      <CardContent className="!p-5">
        <Box className="flex items-start justify-between mb-3">
          <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon className={`${color} !text-xl`} />
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center gap-0.5">
            <TrendingUpRounded className="!text-xs" />
          </span>
        </Box>
        {loading ? (
          <div className="h-7 w-20 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse mb-1" />
        ) : (
          <Typography variant="h5" className="!font-black !text-slate-900 dark:!text-white !mb-0.5">
            {value?.toLocaleString() ?? "—"}
          </Typography>
        )}
        <Typography variant="caption" className="!text-slate-500 !font-medium">{label}</Typography>
      </CardContent>
    </Card>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box className="bg-white/95 dark:bg-slate-800/95 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl">
      {label && (
        <Typography variant="caption" className="!font-bold !text-slate-500 !block !mb-1">{label}</Typography>
      )}
      {payload.map((entry, i) => (
        <Typography key={i} variant="body2" className="!font-black" style={{ color: entry.color || entry.fill }}>
          {entry.name}: {entry.value?.toLocaleString()}
        </Typography>
      ))}
    </Box>
  );
}

export default function AdminReports() {
  const navigate = useNavigate();
  const { t, mode } = useAppPreferences();
  const isDark = mode === "dark";

  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    axiosInstance.get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const axisStyle = { fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 };
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";

  const statCards = [
    { label: "Përdorues Gjithsej", key: "totalUsers",        icon: PeopleOutlineRounded,         color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/40" },
    { label: "Studentë",           key: "totalStudents",     icon: SchoolOutlinedIcon,            color: "text-sky-600",    bg: "bg-sky-100 dark:bg-sky-900/40" },
    { label: "Regjistrime",        key: "totalEnrollments",  icon: AssignmentOutlinedIcon,        color: "text-rose-600",   bg: "bg-rose-100 dark:bg-rose-900/40" },
    { label: "Certifikata",        key: "totalCertificates", icon: WorkspacePremiumOutlinedIcon,  color: "text-emerald-600",bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  ];

  return (
    <section className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container maxWidth="lg" className="flex-grow py-8 mt-4 sm:mt-8">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin")}
          className="!mb-6 !normal-case !text-slate-600 dark:!text-slate-400"
        >
          {t("home.admin.services.backToPanel", "Kthehu te Paneli")}
        </Button>

        {}
        <Box className="mb-8">
          <Box className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <AnalyticsRounded className="text-violet-600 !text-xl" />
            </div>
            <Typography variant="h4" component="h1" className="!font-extrabold !text-slate-900 dark:!text-white">
              {t("home.admin.services.reports.title", "Raportet")}
            </Typography>
          </Box>
          <Typography variant="body1" className="!text-slate-600 dark:!text-slate-400">
            {t("home.admin.services.reports.desc", "Statistika të detajuara mbi performancën e platformës.")}
          </Typography>
        </Box>

        {}
        <Box className="flex gap-2 mb-8 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-fit">
          {[
            { key: "overview", label: "Pasqyrë" },
            { key: "users",    label: "Përdoruesit" },
            { key: "courses",  label: "Kurset" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </Box>

        {loading ? (
          <Box className="flex justify-center py-24">
            <CircularProgress className="!text-violet-500" />
          </Box>
        ) : error ? (
          <Box className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-8 text-center">
            <Typography className="!text-red-600 dark:!text-red-400">
              Të dhënat nuk u ngarkuan. Kontrolloni serverin.
            </Typography>
          </Box>
        ) : (
          <>
            {}
            <Grid container spacing={3} className="!mb-8">
              {statCards.map((card) => (
                <Grid item xs={12} sm={6} md={3} key={card.key}>
                  <StatCard
                    label={card.label}
                    value={stats?.[card.key]}
                    icon={card.icon}
                    color={card.color}
                    bg={card.bg}
                    loading={false}
                  />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              {}
              {(activeTab === "overview" || activeTab === "users") && (
                <Grid item xs={12} md={activeTab === "overview" ? 8 : 12}>
                  <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 shadow-sm">
                    <CardContent className="!p-6">
                      <Typography variant="h6" className="!font-bold !text-slate-900 dark:!text-white !mb-0.5">
                        Regjistrimet sipas Muajit
                      </Typography>
                      <Typography variant="caption" className="!text-slate-500">
                        Numri i regjistrimeve të reja — {new Date().getFullYear()}
                      </Typography>
                      <Box className="mt-5 h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.enrollmentsByMonth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="month" tick={axisStyle} />
                            <YAxis tick={axisStyle} allowDecimals={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="count"
                              name="Regjistrime"
                              stroke="#6366f1"
                              strokeWidth={2.5}
                              fill="url(#gradArea)"
                              dot={{ fill: "#6366f1", r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {}
              {(activeTab === "overview" || activeTab === "users") && (
                <Grid item xs={12} md={activeTab === "overview" ? 4 : 6}>
                  <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 shadow-sm h-full">
                    <CardContent className="!p-6">
                      <Typography variant="h6" className="!font-bold !text-slate-900 dark:!text-white !mb-0.5">
                        Gjendja e Regjistrimeve
                      </Typography>
                      <Typography variant="caption" className="!text-slate-500">
                        Aktiv · Përfunduar · Anuluar
                      </Typography>
                      <Box className="mt-5 h-56 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.enrollmentsByStatus}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius="45%"
                              outerRadius="70%"
                              paddingAngle={3}
                            >
                              {stats.enrollmentsByStatus.map((entry) => (
                                <Cell
                                  key={entry.name}
                                  fill={STATUS_COLORS[entry.name] || "#94a3b8"}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                            <Legend
                              iconType="circle"
                              iconSize={8}
                              wrapperStyle={{ fontSize: 11, color: isDark ? "#94a3b8" : "#64748b" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {}
              {(activeTab === "overview" || activeTab === "courses") && (
                <Grid item xs={12} md={activeTab === "overview" ? 12 : 12}>
                  <Card elevation={0} className="rounded-2xl border border-slate-200/80 bg-white dark:!bg-slate-900/60 dark:!border-slate-700/80 shadow-sm">
                    <CardContent className="!p-6">
                      <Typography variant="h6" className="!font-bold !text-slate-900 dark:!text-white !mb-0.5">
                        Kurset sipas Kategorisë
                      </Typography>
                      <Typography variant="caption" className="!text-slate-500">
                        Numri i kurseve për çdo kategori
                      </Typography>
                      <Box className="mt-5 h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats.coursesByCategory}
                            margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis
                              dataKey="name"
                              tick={{ ...axisStyle, fontSize: 10 }}
                              interval={0}
                              angle={stats.coursesByCategory.length > 5 ? -20 : 0}
                              textAnchor={stats.coursesByCategory.length > 5 ? "end" : "middle"}
                            />
                            <YAxis tick={axisStyle} allowDecimals={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="value" name="Kurse" radius={[6, 6, 0, 0]}>
                              {stats.coursesByCategory.map((entry, i) => (
                                <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Container>
      <Footer />
    </section>
  );
}
