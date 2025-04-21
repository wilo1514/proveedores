import React from "react";
import Modal from "../Modal";

const ModalComentario = ({ isOpen, onClose, lectComentario }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="COMENTARIO" size="md">
      <p className="texto_producto">{lectComentario}</p>
    </Modal>
  );
};

export default ModalComentario;
