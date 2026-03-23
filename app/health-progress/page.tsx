import ProtectedRoute from "@/components/ProtectedRoute";
import HealthProgress from "@/screens/HealthProgress";

export default function HealthProgressPage() {
  return (
    <ProtectedRoute>
      <HealthProgress />
    </ProtectedRoute>
  );
}
