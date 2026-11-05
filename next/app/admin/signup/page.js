import AdminAuthPage from "@/src/components/admin/AdminAuthPage";

export const metadata = {
  title: "Create admin account | Deskinculture Spa",
  description: "Create a Deskinculture Spa admin account.",
};

export default function AdminSignupPage() {
  return <AdminAuthPage mode="register" />;
}
