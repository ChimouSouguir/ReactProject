import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "react-bootstrap";

export default function Logout() {
   const { logout } = useAuth0();

  return (
    <Button
      id="btnLogin"
      className="btn margin"
      onClick={() => logout({ returnTo: window.location.origin })}
      variant="danger"
      style={{ marginLeft: '8px' }}
    >
      Logout
    </Button>
  );
}
