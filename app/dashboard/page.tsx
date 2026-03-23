import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/screens/Dashboard";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
