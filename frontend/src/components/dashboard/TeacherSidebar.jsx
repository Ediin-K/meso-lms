import { NavLink } from "react-router-dom";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import ViewModuleRounded from "@mui/icons-material/ViewModuleRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import QuizRounded from "@mui/icons-material/QuizRounded";
import AssignmentRounded from "@mui/icons-material/AssignmentRounded";
import PeopleRounded from "@mui/icons-material/PeopleRounded";
import { useAppPreferences } from "../../context/appPreferencesContext";

const SidebarLink = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`
    }
  >
    <Icon fontSize="small" />
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </NavLink>
);

export default function TeacherSidebar() {
  const { t } = useAppPreferences();

  const links = [
    { to: "/teacher", icon: DashboardRounded, label: "Dashboard" },
    { to: "/teacher/courses", icon: SchoolRounded, label: "My Courses" },
    { to: "/teacher/modules", icon: ViewModuleRounded, label: "Modules" },
    { to: "/teacher/lessons", icon: MenuBookRounded, label: "Lessons" },
    { to: "/teacher/quizzes", icon: QuizRounded, label: "Quizzes" },
    { to: "/teacher/assignments", icon: AssignmentRounded, label: "Assignments" },
    { to: "/teacher/students", icon: PeopleRounded, label: "Students" },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md h-[calc(100vh-80px)] sticky top-20 hidden md:block">
      <div className="p-6 flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">
          Menu e Mësuesit
        </p>
        {links.map((link) => (
          <SidebarLink key={link.to} {...link} />
        ))}
      </div>
    </aside>
  );
}
