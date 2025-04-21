import React from "react";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { ArrowLeft, Filter, ShoppingCart, Download } from "lucide-react";

export default function HeaderOrden({ titulo, onRegresar, onAbrirFiltros, onAgregarProducto, onDescargarExcel }) {
  return (
    <div className="panel-title">
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <p className="panel-title">{titulo}</p>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>

          <Tooltip title="Regresar">
            <ArrowLeft size={20} onClick={onRegresar} style={{ cursor: "pointer" }} />
          </Tooltip>

          <Tooltip title="Filtros">
            <Filter size={20} onClick={onAbrirFiltros} style={{ cursor: "pointer" }} />
          </Tooltip>

          <Tooltip title="Agregar Producto">
            <ShoppingCart size={20} onClick={onAgregarProducto} style={{ cursor: "pointer" }} />
          </Tooltip>

          <Tooltip title="Descargar Excel">
            <Download size={20} onClick={onDescargarExcel} style={{ cursor: "pointer" }} />
          </Tooltip>

        </Stack>
      </Stack>
    </div>
  );
}
