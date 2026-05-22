import ErrorBoundary from "../components/ErrorBoundary";
import StudentSchedulePage from "./StudentSchedulePage";

export default function StudentSchedules() {
  return (
    <ErrorBoundary>
      <StudentSchedulePage />
    </ErrorBoundary>
  );
}
