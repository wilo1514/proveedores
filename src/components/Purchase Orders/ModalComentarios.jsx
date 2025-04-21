import React from "react";
import Modal from "../Modal";

const ModalComentarios = ({
    isOpen,
    onClose,
    productoNombre,
    comentario,
    handleComentario,
    agregarComentario
}) => {   
    return (
        
        <Modal isOpen={isOpen} onClose={onClose} title={productoNombre} size="md">
        <div className="inicial">
          <textarea
            className="modal-input"
            name="comentario"
            placeholder="Ingrese su comentario"
            value={comentario}
            onChange={handleComentario}
            maxLength={100}
            rows={3}
          />
        </div>
        <button variant="contained" className="boton-modal" onClick={agregarComentario}>
          Guardar
        </button>
      </Modal>
    
    );
};
export default ModalComentarios;