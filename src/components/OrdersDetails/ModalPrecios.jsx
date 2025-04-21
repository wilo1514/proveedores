import React from "react";
import Modal from "../Modal";

const ModalPrecios = ({ isOpen, onClose, nombrePrecio, preciosHistorico }) => {
  return (
    <Modal isOpen={isOpen} title={nombrePrecio.descripcion} onClose={onClose} size="md">
      <p className="texto_producto">
        <strong>Precio Actual:</strong> ${nombrePrecio.precioUnitario}
      </p>
      <br />
      <table className="table table-light table-hover">
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>N° ORDEN</th>
            <th style={{ textAlign: "center" }}>FECHA</th>
            <th style={{ textAlign: "center" }}>CANT.</th>
            <th style={{ textAlign: "center" }}>P.U.</th>
            <th style={{ textAlign: "center" }}>DESCT.</th>
          </tr>
        </thead>
        <tbody>
          {preciosHistorico?.map((item, i) => (
            <tr key={i}>
              <td style={{ textAlign: "center" }}>{item.docNum}</td>
              <td style={{ textAlign: "end" }}>
                {new Date(item.docDate).toLocaleDateString("es", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td style={{ textAlign: "end" }}>{item.quantity}</td>
              <td style={{ textAlign: "end" }}>${item.price}</td>
              <td style={{ textAlign: "center" }}>{item.discount}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
};

export default ModalPrecios;