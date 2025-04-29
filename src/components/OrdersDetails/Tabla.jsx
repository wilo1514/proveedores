import React from "react";
import { Stack, Tooltip } from "@mui/material";
import CustomInput from "../UnitInputField";
import { DollarSign, BarChart, Trash2 } from "lucide-react";

const TablaProductos = ({
  items,
  selectedRows,
  handleRowSelect,
  handleCantidadChange,
  handlePrecioChange,
  historicoPrecios,
  eliminarProducto,
  abrirComentario,
  analisisVentas,
  datosPedidos,
  selectedOption,
}) => {
  return (
    <table className="table table-ligh table-hover">
      <thead>
        <tr>
          <th style={{ textAlign: "center" }}>#</th>
          <th style={{ textAlign: "center" }}>CÓDIGO</th>
          <th style={{ textAlign: "center" }}>BARRAS</th>
          <th style={{ textAlign: "center" }}>DESCRIP.</th>
          <th style={{ textAlign: "center" }}>CANT.</th>
          <th style={{ textAlign: "center" }}>UND.</th>
          <th style={{ textAlign: "center" }}>UND. X CAJA</th>
          <th style={{ textAlign: "center" }}>P.U.</th>
          <th style={{ textAlign: "center" }}>IVA</th>
          <th style={{ textAlign: "center" }}>DESCT.</th>
          <th style={{ textAlign: "center" }}>TOTAL</th>
          <th style={{ textAlign: "center" }}>PROMO</th>
          <th style={{ textAlign: "center" }}>ACCIONES</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          const currentIndex = i + 1;
          const isSelected = selectedRows.includes(currentIndex);
          const promocion = item.esPromocion ? "SÍ" : "NO";
          const hasNota = Boolean(item.comentario && item.comentario.trim());
          return (
            <tr key={i} className={isSelected ? "selected-row" : ""}>
              <td style={{ textAlign: "center" }}>{currentIndex}</td>
              <td style={{ textAlign: "center" }}>{item.codigoConorque}</td>
              <td style={{ textAlign: "center" }}>{item.codigoPrincipal}</td>
              <td style={{ textAlign: "start" }}>{item.descripcion}</td>
              <td style={{ textAlign: "center" }}>
                <CustomInput
                  value={item.cantidadAutorizada ?? ""}
                  onChange={(newCantidad) => handleCantidadChange(newCantidad, item)}
                  unit={item.unidad}
                />
              </td>
              <td style={{ textAlign: "center" }}>{item.unidad}</td>
              <td style={{ textAlign: "center" }}>{item.unidadXCaja}</td>
              <td style={{ textAlign: "center" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-around">
                  <CustomInput
                    value={item.precioUnitario ?? ""}
                    onChange={(newPrecio) => handlePrecioChange(newPrecio, item)}
                    unit={"KG"}
                  />
                  <Tooltip title="Histórico Precios">
                    <DollarSign
                      size={20}
                      color="green"
                      onClick={() => historicoPrecios(item)}
                      style={{ cursor: "pointer" }}
                    />
                  </Tooltip>
                </Stack>
              </td>
              <td style={{ textAlign: "center" }}>{item.tarifa}%</td>
              <td style={{ textAlign: "center" }}>{item.descuento}</td>
              <td style={{ textAlign: "center" }}>
                ${(
                  (parseFloat(item.precioUnitario) -
                    (parseFloat(item.precioUnitario) * parseFloat(item.descuento)) / 100) *
                  parseFloat(item.cantidadAutorizada)
                ).toFixed(4)}
              </td>
              <td style={{ textAlign: "center" }}>{promocion}</td>
              <td>
                <Stack direction="row" alignItems="center" justifyContent="end" spacing={2}>
                  <button
                    className={`remark ${hasNota ? 'enabled' : 'disabled'}`}
                    style={{ backgroundColor: "transparent" }}
                    onClick={() => abrirComentario(item.comentario)}
                    disabled={!hasNota}
                  >
                    Nota
                  </button>
                  <Tooltip>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`svg-check ${isSelected ? "selected" : ""
                        }`}
                      viewBox="0 0 24 24"
                      onClick={() => handleRowSelect(currentIndex)}
                    >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  </Tooltip>
                  <Tooltip title="Análisis Ventas">
                    <BarChart
                      size={20}
                      color="#151635"
                      onClick={() => analisisVentas(item)}
                      style={{ cursor: "pointer" }}
                    />
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <Trash2
                      size={20}
                      color="red"
                      onClick={() => eliminarProducto(item.codigoPrincipal)}
                      style={{ cursor: "pointer" }}
                    />
                  </Tooltip>
                </Stack>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TablaProductos;
