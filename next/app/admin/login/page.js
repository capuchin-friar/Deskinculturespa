import AdminAuthPage from "@/src/components/admin/AdminAuthPage";

export const metadata = {
  title: "Admin sign in | Deskinculture Spa",
  description: "Sign in to the Deskinculture Spa admin dashboard.",
};

export default function AdminLoginPage() {
  return <AdminAuthPage mode="login" />;
}
