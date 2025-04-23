import React from "react";
import Icon from "../../assets/iconos/x.svg";
import DotSpinner from "../DotSpinner";
import "../../css/DepartamentoCompras/Autorizar.css";
import "../../css/ComponentesAdicionales/Tabla.css";
import "../../css/EmpleadosMegas/Employees.css";

export default function BotonesAccion({ showAlert, handleAlertOption, setShowAlert, anular, datosPedidos, loading }) {
  return (
    <div className="panel-item">
      <div>
        <button className="boton-gestion" onClick={() => setShowAlert(true)} disabled={datosPedidos.estado === "AUT" || datosPedidos.estado === "NAP"}>
          GUARDAR - AUTORIZAR
        </button>
        {showAlert && (
          <div className="alert">
            <div className="icon-container">
              <img src={Icon} onClick={() => handleAlertOption("cancelar")} />
            </div>
            <div className="alert-options">
              <div className="alert-header">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="#f8bb86" height="8rem">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <h2 className="title-alert">¿Qué acción desea realizar?</h2>
              </div>
              <p className="text-alert">Recuerda una vez autorizado no podrás modificar</p>
              <div className="alert-buttons">
                <button className="alert-button" style={{ background: "#128496" }} onClick={() => handleAlertOption("guardar")}>
                  GUARDAR
                </button>
                <button className="alert-button" style={{ background: "#23bf07" }} onClick={() => handleAlertOption("guardarActualizar")}>
                  AUTORIZAR
                </button>
                <button className="alert-button cancel" onClick={() => anular(datosPedidos.id)}>
                  ANULAR
                </button>
              </div>
            </div>
          </div>
        )}
        {loading && <DotSpinner />}
      </div>
    </div>
  );
}
