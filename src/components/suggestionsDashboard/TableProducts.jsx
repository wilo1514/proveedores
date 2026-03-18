import React, { useState, useEffect } from "react";
import TablePagination from "@mui/material/TablePagination";
import { Stack, Tooltip } from "@mui/material";
import Modal from "../../components/Modal";

import fetchApi from "../../utils/fechtData";
import { validacion } from "../../utils/apiUtils";
import "../../css/ComponentesAdicionales/Tabla.css";

const TableOrders = ({ data, page, rowsPerPage, setPage, eliminarProducto }) => {
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalAnalisis, setModalAnalisis] = useState(false);
  const [stockAlmacenes, setStockAlmacenes] = useState([]);
  const [stockTotal, setStockTotal] = useState(0);
  const [avgTotal, setAvgTotal] = useState(0);

  useEffect(() => {
    setRows(data);
    setSelectedRows([]);
  }, [data]);

  const handleRowSelect = (index) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((row) => row !== index)
        : [...prevSelected, index]
    );
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const analisiStock = async (dato) => {
    const validado = await validacion();
    if (validado === 1) {
      const codeSup = sessionStorage.getItem("codeSup");
      const tokenId = localStorage.getItem("token");
      const numero = 2;
      try {
        const datos = await fetchApi({
          endPoint: `/warehouse/stockwarehouse/${codeSup}?itemCode=${dato}&whsCode=${numero}`,
          method: "GET",
          paginacion: false,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + tokenId,
          },
        });

        if (datos.error) {
          console.error("Error en respuesta:", datos.error);
          return;
        }

        setStockAlmacenes(datos.datos || []);
        const totalOnHand = datos.datos.reduce((acc, item) => {
          const val = parseFloat(item.onHand?.toString().replace(/[^\d.-]/g, ""));
          return acc + (isNaN(val) ? 0 : val);
        }, 0);
        const totalAvg = datos.datos.reduce((acc, item) => {
          const val = parseFloat(item.avgSales?.toString().replace(/[^\d.-]/g, ""));
          return acc + (isNaN(val) ? 0 : Math.abs(val));
        }, 0);

        setStockTotal(totalOnHand.toFixed(2));
        setAvgTotal(totalAvg.toFixed(2));
        setModalAnalisis(true);
      } catch (error) {
        console.error("Error en fetchApi:", error);
      }
    } else {
      console.error("Sesión no válida");
    }
  };

  const cerrarModalStock = () => {
    setModalAnalisis(false);
  };

  return (
    <div className="panel">
      <table className="table table-light table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Proveedor</th>
            <th>Sucursal</th>
            <th>Codigo SAP</th>
            <th>Producto</th>
            <th>Fecha Pedido</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, i) => {
            const currentIndex = i + 1;
            const isSelected = selectedRows.includes(currentIndex);
            let codigoSap = "";
            let producto = "";
            const regex = /^Item\s+(\d{12})-(.+?)\s+es\s+/i;
            const match = item.texto.match(regex);
            if (match) {
              codigoSap = match[1];
              producto = match[2];
            }

            return (
              <tr key={item.id} className={isSelected ? "selected-row" : ""}>
                <td>{currentIndex}</td>
                <td>{item.nombreProveedor}</td>
                <td>{item.nombreAlmacen}</td>
                <td style={{ textAlign: "center" }}>{codigoSap}</td>
                <td style={{ textAlign: "start" }}>{producto}</td>
                <td style={{ textAlign: "center" }}>
                  {new Date(item.fechaNotificacion).toLocaleDateString("es")}
                </td>
                <td style={{ textAlign: "center" }}>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title={isSelected ? "Deseleccionar" : "Seleccionar"}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className={`svg-check2 ${isSelected ? "selected" : ""}`}
                        onClick={() => handleRowSelect(currentIndex)}
                        style={{
                          cursor: "pointer",
                          width: "1.5rem",
                          height: "1.5rem",
                          strokeWidth: 2
                        }}
                      >
                        <path
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    </Tooltip>
                    <Tooltip title="Ver Stock">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="#151635"
                        height="1.2rem"
                        onClick={() => analisiStock(codigoSap)}
                        style={{ cursor: "pointer" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
                        />
                      </svg>
                    </Tooltip>
                  </Stack>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <TablePagination
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[]}
      />

      <Modal
        isOpen={modalAnalisis}
        onClose={cerrarModalStock}
        title="STOCK ALMACENES"
        size="md"
      >
        <div className="Scroll">
          <table className="table table-light table-hover">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Almacén</th>
                <th style={{ textAlign: "center" }}>Cantidad</th>
                <th style={{ textAlign: "center" }}>AVG</th>
              </tr>
            </thead>
            <tbody>
              {stockAlmacenes.map((item, i) => (
                <tr key={i}>
                  <td style={{ textAlign: "start" }}>{item.whsName}</td>
                  <td style={{ textAlign: "end" }}>{item.onHand}</td>
                  <td style={{ textAlign: "center", background: "#d1f4cb" }}>{item.avgSales}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="table table-light table-hover">
            <tbody>
              <tr style={{ background: "#128496", color: "white" }}>
                <th style={{ textAlign: "start", width: "190px", fontSize: "16px" }}>TOTAL</th>
                <td style={{ textAlign: "center", fontSize: "18px" }}>{stockTotal}</td>
                <td style={{ textAlign: "center", fontSize: "18px" }}>{avgTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default TableOrders;
