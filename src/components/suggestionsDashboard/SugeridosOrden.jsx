import React from "react";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { ArrowLeft, ShoppingCart, Download, Upload, ListFilter } from "lucide-react";

export default function SugeridosOrden({ titulo, onRegresar,onDescargarExcel}) {
  return (
    <div className="panel-title">
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <p className="panel-title">{titulo}</p>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
          <Tooltip title="Descargar Excel">
            <Download size={20} onClick={onDescargarExcel} style={{ cursor: "pointer" }} />
          </Tooltip>
        </Stack>
      </Stack>
    </div>
  );
}
