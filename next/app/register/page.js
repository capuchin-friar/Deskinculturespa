import AuthPage from "@/src/components/customer/AuthPage";

export const metadata = {
  title: "Create an account | Deskinculture Spa",
  description: "Create your Deskinculture Spa account.",
};

export default function RegisterPage() {
  return <AuthPage mode="register" />;
}
