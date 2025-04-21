import React from "react";
import BotonesAccion from "./Buttons";
import "../../css/DepartamentoCompras/Autorizar.css";
import "../../css/ComponentesAdicionales/Tabla.css";
import "../../css/EmpleadosMegas/Employees.css";

const ResumenPedido = ({
  subtotal,
  totalDescuento,
  iva,
  total,
  showAlert,
  handleAlertOption,
  setShowAlert,
  anular,
  datosPedidos,
  loading,
  scrollToTop,
  scrollToBottom
}) => {
  return (
    <>
      <div className="panel">
        <div className="panel-grid">
          <div className="panel-item">
            <label className="input-label-autor">Subtotal sin impuestos:</label>
            <input
              className="dashboard-input"
              type="text"
              value={`$${subtotal}`}
              readOnly
            />
          </div>
          <div className="panel-item">
            <label className="input-label-autor">Descuento:</label>
            <input
              className="dashboard-input"
              type="text"
              value={`$${totalDescuento}`}
              readOnly
            />
          </div>
          <div className="panel-item">
            <label className="input-label-autor">IVA:</label>
            <input
              className="dashboard-input"
              type="text"
              value={`$${iva}`}
              readOnly
            />
          </div>
          <div className="panel-item">
            <label className="input-label-autor">Total:</label>
            <input
              className="dashboard-input"
              type="text"
              value={`$${total}`}
              readOnly
            />
          </div>
          <BotonesAccion 
            showAlert={showAlert} 
            handleAlertOption={handleAlertOption} 
            setShowAlert={setShowAlert} 
            anular={anular} 
            datosPedidos={datosPedidos} 
            loading={loading} 
          />
        </div>
      </div>
      
      <div className="scroll-buttons">
        <button className="scroll-button" onClick={scrollToTop}>↑</button>
        <button className="scroll-button" onClick={scrollToBottom}>↓</button>
      </div>
    </>
  );
};

export default ResumenPedido;
