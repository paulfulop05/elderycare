import ProtectedRoute from "@/components/ProtectedRoute";
import PatientDetail from "@/screens/PatientDetail";

export default function PatientDetailPage() {
  return (
    <ProtectedRoute>
      <PatientDetail />
    </ProtectedRoute>
  );
}
