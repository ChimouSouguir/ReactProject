import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useAuth0 } from "@auth0/auth0-react";

function ReactionsModal({ show, onHide, filteredReactions, openReactionsModal }) {
  const { isAuthenticated, user } = useAuth0();

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Reactions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="reaction-buttons">
          <Button variant="outline-danger" onClick={() => openReactionsModal('heart')}>
            Hearts
          </Button>
          <Button variant="outline-primary" onClick={() => openReactionsModal('thumb')}>
            Thumbs Up
          </Button>
          <Button variant="outline-warning" onClick={() => openReactionsModal('laugh')}>
            Laugh
          </Button>
          <Button variant="outline-danger" onClick={() => openReactionsModal('angry')}>
            Angry
          </Button>
        </div>
        <ul className="reaction-list">
          {filteredReactions.map((reaction, index) => (
            <li key={index}>
              {reaction.user_name} reacted with {reaction.reaction_type === 'heart' ? '❤️' : reaction.reaction_type === 'thumb' ? '👍' : reaction.reaction_type === 'laugh' ? '😂' : '😡'}
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );
}

export default ReactionsModal;
