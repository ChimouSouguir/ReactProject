import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useAuth0 } from "@auth0/auth0-react";



function AuthModal({ show, onHide }) {
  const { loginWithRedirect } = useAuth0();
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header>
        <Modal.Title>Authentication Required</Modal.Title>
        <button type="button" className="close" aria-label="Close" onClick={onHide}>
          <span aria-hidden="true">&times;</span>
        </button>
      </Modal.Header>
      <Modal.Body>
      You need to authenticate to perform this action.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => loginWithRedirect()}>
          Log In
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AuthModal;
