import React from "react";
import TablePagination from "@mui/material/TablePagination";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import "../../css/ComponentesAdicionales/Tabla.css";

const TablaPedidos = ({ data, page, rowsPerPage, cantItems, setPage, visualizar, autorizar }) => {
  const claseEstado = (idEstado) => {
    switch (idEstado) {
      case "PARA REVISION":
      case "REVISADO":
        return "azul";
      case "APROBADO":
        return "verde";
      case "CANCELADO":
        return "rojo";
      default:
        return "blanco";
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <div className="panel">
      <table className="table table-light table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Proveedor</th>
            <th>Sucursal</th>
            <th>Tipo</th>
            <th>Código Pedido</th>
            <th>Estado</th>
            <th>Fecha Pedido</th>
            <th>Fecha Entrega</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => {
            const index = i + 1 + page * rowsPerPage;
            const isDisabledVis = ["PARA REVISION", "REVISADO"].includes(item.estado);
            const isDisabledEdit =
            item.estado === "APROBADO" || item.estado === "NO APROBADA";
            return (
              <tr key={index}>
                <td>{index}</td>
                <td>{item.nombreProveedor}</td>
                <td>{item.nombreAlmacen}</td>
                <td>{item.ordenEspecial ? "ESPECIAL" : "NORMAL"}</td>
                <td>{item.id}</td>
                <td className={`center ${claseEstado(item.estado)}`}>{item.estado}</td>
                <td>{new Date(item.fechaDocumento).toLocaleDateString("es")}</td>
                <td>{new Date(item.fechaEntrega).toLocaleDateString("es")}</td>
                <td style={{ textAlign: "center" }}>
                      <Stack
                        spacing={2}
                        direction={"row"}
                        justifyContent={"center"}
                      >
                        <Tooltip title="Editar">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="#151635"
                            height="1.5rem"
                            onClick={() => {
                              if (!isDisabledEdit) autorizar(item);
                            }}
                            style={{
                              cursor: isDisabledEdit
                                ? "not-allowed"
                                : "pointer",
                              opacity: isDisabledEdit ? 0.3 : 1,
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </Tooltip>
                        <Tooltip title="Visualizar">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            onClick={() => {
                              if (!isDisabledVis) visualizar(item);
                            }}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="#1dbb3a"
                            height="1.5rem"
                            style={{
                              cursor: isDisabledVis ? "not-allowed" : "pointer",
                              opacity: isDisabledVis ? 0.3 : 1,
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
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
      <TablePagination component="div" count={cantItems} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} rowsPerPageOptions={[]} />
    </div>
  );
};

export default TablaPedidos;
