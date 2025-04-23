import React from "react";
import CustomInput from "../../components/UnitInputField"
import { Stack, Checkbox, Tooltip, TablePagination } from "@mui/material";
import DeleteIcon from "../../assets/iconos/trash.svg";

const TablaPurchase = ({
    items,
    page,
    rowsPerPageProduct,
    handleCantidadChange,
    handlePrecioChange,
    handlePromocion,
    abrirComentarios,
    handleDescuentoChange,
    eliminarProducto,
    handleChangePageProduct,
  }) => {
    return (
      <div>
        <table className="table table-ligh table-hover">
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>#</th>
              <th style={{ textAlign: "center" }}>CÓDIGO BARRAS</th>
              <th style={{ textAlign: "center" }}>CANT.</th>
              <th style={{ textAlign: "center" }}>UND.</th>
              <th style={{ textAlign: "center" }}>DESCRIP.</th>
              <th style={{ textAlign: "center" }}>P.U.</th>
              <th style={{ textAlign: "center" }}>IVA</th>
              <th style={{ textAlign: "center" }}>PROMO</th>
              <th style={{ textAlign: "center" }}>DESCT. (%)</th>
              <th style={{ textAlign: "center" }}>TOTAL</th>
              <th style={{ textAlign: "center" }}> </th>
            </tr>
          </thead>
          <tbody>
            {items
              .slice(page * rowsPerPageProduct, page * rowsPerPageProduct + rowsPerPageProduct)
              .map((item, i) => {
                const currentIndex = i + 1 + page * rowsPerPageProduct;
                const isDisabled = item.esPromocion === false;
  
                return (
                  <tr key={i}>
                    <td style={{ textAlign: "center" }}>{currentIndex}</td>
                    <td style={{ textAlign: "center" }}>{item.codigoPrincipal}</td>
                    <td style={{ textAlign: "center" }}>
                      <CustomInput
                        value={item.cantidad}
                        onChange={(newCantidad) => handleCantidadChange(newCantidad, item)}
                        unit={item.unidad}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>{item.unidad}</td>
                    <td style={{ textAlign: "justify" }}>{item.descripcion}</td>
                    <td style={{ textAlign: "center" }}>
                      <CustomInput
                        value={item.precioUnitario}
                        onChange={(newPrecio) => handlePrecioChange(newPrecio, item)}
                        unit={"KG"}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>{item.tarifa}%</td>
                    <td style={{ textAlign: "center" }}>
                      <Stack spacing={1} direction={"row"} justifyContent={"center"} alignItems={"center"}>
                        <Checkbox
                          checked={item.esPromocion}
                          onChange={(event) => handlePromocion(event, item)}
                          className="check"
                        />
                        <Tooltip title="Agregar Comentario">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            disabled={isDisabled}
                            style={{
                              cursor: isDisabled ? "not-allowed" : "pointer",
                              opacity: isDisabled ? 0.3 : 1,
                            }}
                            fill="none"
                            viewBox="0 0 24 24"
                            onClick={() => {
                              if (!isDisabled) {
                                abrirComentarios(item.descripcion);
                              }
                            }}
                            strokeWidth={2}
                            stroke="#151635"
                            height="1.5rem"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                            />
                          </svg>
                        </Tooltip>
                      </Stack>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <CustomInput
                        value={item.descuento}
                        disabled={isDisabled}
                        onChange={(newDescuento) => handleDescuentoChange(newDescuento, item)}
                        unit={"KG"}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      ${(
                        (parseFloat(item.precioUnitario) -
                          (parseFloat(item.precioUnitario) * parseFloat(item.descuento)) / 100) *
                        parseFloat(item.cantidad)
                      ).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Tooltip title="Eliminar">
                        <img src={DeleteIcon} alt="Cerrar" onClick={() => eliminarProducto(item.codigoPrincipal)} />
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
  
        {/* Agregamos el paginador dentro del componente */}
        <TablePagination
          component="div"
          count={items.length}
          rowsPerPage={rowsPerPageProduct}
          page={page}
          onPageChange={handleChangePageProduct}
          rowsPerPageOptions={[]}
        />
      </div>
    );
  };
  
export default TablaPurchase;