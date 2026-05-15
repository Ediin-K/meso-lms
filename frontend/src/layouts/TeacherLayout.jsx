import { Outlet } from "react-router-dom";

export default function TeacherLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
