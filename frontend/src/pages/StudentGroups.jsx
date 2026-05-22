import ErrorBoundary from "../components/ErrorBoundary";
import StudentSchedulePage from "./StudentSchedulePage";

export default function StudentGroups() {
  return (
    <ErrorBoundary>
      <StudentSchedulePage />
    </ErrorBoundary>
  );
}
