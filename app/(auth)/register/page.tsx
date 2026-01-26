import Auth from "@/components/auth/auth";
import { AuthType } from "@/components/auth/types";

export default function RegisterPage() {
  return <Auth mode={AuthType.SIGN_UP} />;
}
