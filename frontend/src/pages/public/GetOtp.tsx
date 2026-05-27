import { Navigate } from "react-router-dom";

/** Legacy route — sign-in now sends an offer link by SMS. */
export default function GetOtp() {
  return <Navigate to="/login" replace />;
}
