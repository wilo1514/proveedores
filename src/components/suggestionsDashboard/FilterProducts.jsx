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
  inicio,
  fin,
  filtrarReportes,
  reiniciarDatos,
  handleProveedorChange,
  handleSucursal,
  handleInicio,
  handleFin,
  descargarExcel
}) => {
  return (
    <div className="panel-grid">
      <div className="panel-item">
        <label className="input-label">Proveedor:</label>
        <Autocomplete
          options={datosProveedores}
          getOptionLabel={(opt) => opt.supName}
          value={datosProveedores.find((p) => p.supCode === proveedor) || null}
          onChange={handleProveedorChange}
          renderInput={(params) => <TextField {...params} variant="outlined" />}
          disableClearable
        />
      </div>
      <div className="panel-item">
        <label className="input-label">Almacén:</label>
        <select
          className="select-empleados"
          value={sucursal}
          onChange={handleSucursal}
        >
          <option value="">Todos</option>
          {datosSucursal.map((s) => (
            <option key={s.whsCode} value={s.whsCode}>
              {s.whsName}
            </option>
          ))}
        </select>
      </div>
      <div className="panel-item">
        <label className="input-label">Desde:</label>
        <input
          type="date"
          className="input-filtros"
          value={inicio}
          onChange={handleInicio}
        />
      </div>
      <div className="panel-item">
        <label className="input-label">Hasta:</label>
        <input
          type="date"
          className="input-filtros"
          value={fin}
          onChange={handleFin}
        />
      </div>
      <div className="panel-item">
        <Stack direction="row" spacing={2}>
          <button
            className="boton-ordenes"
            style={{ background: "#06ac2e" }}
            onClick={filtrarReportes}
          >
            Filtrar
          </button>
          <button
            className="boton-ordenes"
            style={{ background: "#128496" }}
            onClick={reiniciarDatos}
          >
            Reiniciar
          </button>
        </Stack>
      </div>
    </div>
  );
};

export default FiltrosPedidos;
