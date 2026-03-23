import ProtectedRoute from "@/components/ProtectedRoute";
import DoctorDetail from "@/screens/DoctorDetail";

export default function DoctorDetailPage() {
  return (
    <ProtectedRoute>
      <DoctorDetail />
    </ProtectedRoute>
  );
}
