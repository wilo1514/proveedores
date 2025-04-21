import React from "react";

export default function DetallePedido({ datosPedidos }) {
  return (
      <div className="panel-grid">
        <div className="panel-item">
          <label className="input-label-autor">Proveedor: </label>
          <input className="dashboard-input" type="text" value={datosPedidos.nombreProveedor ?? ""} readOnly />
        </div>
        <div className="panel-item">
          <label className="input-label-autor">Sucursal</label>
          <input className="dashboard-input" type="text" value={datosPedidos.nombreAlmacen ?? ""} readOnly />
        </div>
        <div className="panel-item">
          <label className="input-label-autor">Fecha Pedido</label>
          <input
            className="dashboard-input"
            type="text"
            value={datosPedidos.fechaDocumento ? new Date(datosPedidos.fechaDocumento).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }) : ""}
            readOnly
          />
        </div>
        <div className="panel-item">
          <label className="input-label-autor">Fecha Entrega</label>
          <input
            className="dashboard-input"
            type="text"
            value={datosPedidos.fechaEntrega ? new Date(datosPedidos.fechaEntrega).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }) : ""}
            readOnly
          />
        </div>
      </div>
  );
}
