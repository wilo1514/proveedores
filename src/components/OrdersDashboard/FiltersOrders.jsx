import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import "../../css/ComponentesAdicionales/Tabla.css";

const FiltrosPedidos = ({
  datosProveedores,
  datosSucursal,
  proveedor,
  sucursal,
  estado,
  estados,
  inicio,
  fin,
  setProveedor,
  setSucursal,
  setEstado,
  setInicio,
  setFin,
  setCodigoo,
  filtrarReportes,
  reiniciarDatos,
  handleProveedorChange,
  handleSucursal,
  handleStatus,
  handleInicio,
  handleFin,
  handleCodigo,
}) => {
  return (
    <div className="panel-grid">
      <div className="panel-item">
        <label className="input-label">Proveedor:</label>
        <Autocomplete
          options={datosProveedores}
          getOptionLabel={(option) => option.supName}
          value={datosProveedores.find((prov) => prov.supCode === proveedor) || null}
          onChange={handleProveedorChange}
          renderInput={(params) => <TextField {...params} variant="outlined" />}
          disableClearable
        />
      </div>
      <div className="panel-item">
        <label className="input-label">Almacén:</label>
        <select className="select-empleados" value={sucursal} onChange={handleSucursal}>
          <option value="">Todos</option>
          {datosSucursal.map((suc) => (
            <option key={suc.whsCode} value={suc.whsCode}>
              {suc.whsName}
            </option>
          ))}
        </select>
      </div>

      <div className="panel-item">
        <label className="input-label">Estado:</label>
        <select className="select-empleados" value={estado} onChange={handleStatus}>
          <option value="PRE">Para Revisión</option>
          {estados.map((estado) => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="panel-item">
        <label className="input-label">N° Orden:</label>
        <input type="text" className="input-filtros" placeholder="Código del Pedido" onChange={handleCodigo} maxLength={10} />
      </div>
      <div className="panel-item">
        <label className="input-label">Desde:</label>
        <input type="date" className="input-filtros" value={inicio} onChange={handleInicio} />
      </div>
      <div className="panel-item">
        <label className="input-label">Hasta:</label>
        <input type="date" className="input-filtros" value={fin} onChange={handleFin} />
      </div>
      <div className="panel-item">
        <Stack direction="row" spacing={2}>
          <button className="boton-ordenes" style={{ background: "#06ac2e" }} onClick={filtrarReportes}>
            Filtrar
          </button>
          <button className="boton-ordenes" style={{ background: "#128496" }} onClick={reiniciarDatos}>
            Reiniciar
          </button>
        </Stack>
      </div>
    </div>
  );
};

export default FiltrosPedidos;
