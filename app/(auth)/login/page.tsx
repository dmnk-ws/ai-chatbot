import Auth from "@/components/auth/auth";
import { AuthType } from "@/components/auth/types";

export default function LoginPage() {
  return <Auth mode={AuthType.SIGN_IN} />;
}
