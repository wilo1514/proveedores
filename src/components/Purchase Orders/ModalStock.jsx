import React from "react";
import Modal from "../Modal"; 

const ModalStock = ({ isOpen, onClose, title, stockData}) => {
  const totalStock = (stockData || []).reduce((acc, curr) => {
  const valor = parseFloat(curr.onHand) || 0;
  return acc + valor;
}, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`STOCK ALMACENES - ${title}`} size="md">
      <div style={{ padding: "10px" }}>
        
        <div className="Scroll" style={{ maxHeight: "400px" }}>
          <table className="table table-hover">
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ textAlign: "center" }}>Almacen</th>
                <th style={{ textAlign: "center" }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {stockData?.map((item, i) => (
                <tr key={i}>
                  <td style={{ textAlign: "left" }}>{item.whsName}</td>
                  <td style={{ textAlign: "right" }}>{item.onHand}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: "#128496", color: "white", fontWeight: "bold" }}>
                <td>TOTAL</td>
                <td style={{ textAlign: "right" }}>{totalStock.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Modal>
  );
};

export default ModalStock;