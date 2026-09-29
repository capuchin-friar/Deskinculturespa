import AuthPage from "@/src/components/customer/AuthPage";

export const metadata = {
  title: "Sign in | Deskinculture Spa",
  description: "Sign in to your Deskinculture Spa account.",
};

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
