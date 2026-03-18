import React from "react";
import Modal from "../Modal";
import TarjetasMt from "../TarjetaMttr";
import { Grid } from "@mui/material";
import "../../css/DepartamentoCompras/Autorizar.css";
import "../../css/ComponentesAdicionales/Tabla.css";
import "../../css/EmpleadosMegas/Employees.css";

const ModalAnalisis = ({
  isOpen,
  onClose,
  nombreProducto,
  promedioVentas,
  promedioCompras,
  cantMensual,
  freProduct,
  stockActual,
  ventas2024,
  ventas2025,
  pedidosTabla,
  stockAlmacenes,
  stockTotal,
  avgTotal,
  claseEstado,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={nombreProducto.descripcion} size="xl">
      <Grid container spacing={2} style={{ background: 'white' }}>
               <Grid item xs={12} sm={12} md={2}>
                 <TarjetasMt
                   valor1={nombreProducto.cantidadAutorizada}
                   bgicon={"#151635"}
                   titulo={"CANT. ORDEN"}
                   colort={"#fff"}
                 />
               </Grid>
               <Grid item xs={12} sm={12} md={2}>
                 <TarjetasMt
                   valor1={promedioVentas}
                   bgicon={"#151635"}
                   titulo={"AVG VENTAS"}
                   colort={"#fff"}
                 />
               </Grid>
               <Grid item xs={12} sm={12} md={2}>
                 <TarjetasMt
                   valor1={promedioCompras}
                   bgicon={"#151635"}
                   titulo={"AVG COMPRAS"}
                   colort={"#fff"}
                 />
               </Grid>
               <Grid item xs={12} sm={12} md={2}>
                 <TarjetasMt
                   valor1={cantMensual}
                   bgicon={"#151635"}
                   titulo={"CANT. PEDIDA MENSUAL"}
                   colort={"#fff"}
                 />
               </Grid>
               <Grid item xs={12} sm={12} md={2}>
                 <TarjetasMt
                   valor1={freProduct.frequency}
                   bgicon={"#151635"}
                   titulo={"FRECUENCIA"}
                   colort={"#fff"}
                 />
               </Grid>
               <Grid item xs={12} sm={12} md={2}>
                 <TarjetasMt
                   valor1={stockActual.onHand}
                   bgicon={"#151635"}
                   titulo={"STOCK " + stockActual.whsName}
                   colort={"#ffff"}
                 />
               </Grid>
               <Grid item xs={12} sm={12} md={4}>
                 <div className="carta-modal">
                   <Grid container spacing={2} style={{ background: 'white' }}>
                     <Grid item xs={12} sm={12} md={12}>
                       {" "}
                       <p className="titulos">
                         PROMEDIO DE VENTAS MENSUALES 2025-2026
                       </p>{" "}
                     </Grid>
                     <Grid item xs={12} md={6}>
                       <p
                         style={{
                           background: "#23bf07",
                           color: "#ffff",
                           textAlign: "center",
                           border: "1px solid #23bf07",
                           padding: "5px",
                           marginBottom: "20px",
                         }}
                       >
                         2025
                       </p>
                       <table className="table table-ligh table-hover">
                         <thead>
                           <tr>
                             <th style={{ textAlign: "center" }}>MES</th>
                             <th style={{ textAlign: "center" }}>CANT.</th>
                           </tr>
                         </thead>
                         <tbody>
                           {ventas2024 &&
                             ventas2024.map((venta, i) => {
                               const currentIndex = i + 1;
                               return (
                                 <tr key={currentIndex}>
                                   <td style={{ textAlign: "center" }}>
                                     {venta.month}
                                   </td>
                                   <td style={{ textAlign: "end" }}>
                                     {venta.quantity}
                                   </td>
                                 </tr>
                               );
                             })}
                         </tbody>
                       </table>
                     </Grid>
                     <Grid item xs={12} md={6}>
                       <p
                         style={{
                           background: "#128496",
                           color: "#ffff",
                           textAlign: "center",
                           border: "1px solid #128496",
                           padding: "5px",
                           marginBottom: "20px",
                         }}
                       >
                         2026
                       </p>
                       <table className="table table-ligh table-hover">
                         <thead>
                           <tr>
                             <th style={{ textAlign: "center" }}>MES</th>
                             <th style={{ textAlign: "center" }}>CANT.</th>
                           </tr>
                         </thead>
                         <tbody>
                           {ventas2025 &&
                             ventas2025.map((venta, i) => {
                               const currentIndex = i + 1;
                               return (
                                 <tr key={currentIndex}>
                                   <td style={{ textAlign: "center" }}>
                                     {venta.month}
                                   </td>
                                   <td style={{ textAlign: "end" }}>
                                     {venta.quantity}
                                   </td>
                                 </tr>
                               );
                             })}
                         </tbody>
                       </table>
                     </Grid>
                   </Grid>
                 </div>
               </Grid>
     
               <Grid item xs={12} sm={12} md={4}>
                 <div className="carta-modal">
                   <p className="titulos">PEDIDOS MES ACTUAL</p>
                   <div className="Scroll">
                     <table className="table table-ligh table-hover">
                       <thead>
                         <tr>
                           <th style={{ textAlign: "center" }}>N° Orden</th>
                           <th style={{ textAlign: "center" }}>Estado</th>
                           <th style={{ textAlign: "center" }}>Solicitado</th>
                           <th style={{ textAlign: "center" }}>Ingresado</th>
                           <th style={{ textAlign: "center" }}>Cump.</th>
                           <th style={{ textAlign: "center" }}>Precio</th>
                           <th style={{ textAlign: "center" }}>Fecha Entrega</th>
                         </tr>
                       </thead>
                       <tbody>
                         {pedidosTabla &&
                           pedidosTabla.map((item, i) => {
                             const currentIndex = i + 1;
                             const isPendingOrCancelled =
                               item.status === "POR DESPACHAR" ||
                               item.status === "CANCELADO";
                             return (
                               <tr key={currentIndex}>
                                 <td style={{ textAlign: "center" }}>
                                   {item.docNum}
                                 </td>
                                 <td
                                   className={`center ${claseEstado(item.status)}`}
                                 >
                                   {item.status}
                                 </td>
                                 <td style={{ textAlign: "center" }}>
                                   {item.required}
                                 </td>
                                 <td style={{ textAlign: "center" }}>
                                   {isPendingOrCancelled ? "" : item.quantity}
                                 </td>
                                 <td style={{ textAlign: "center" }}>
                                   {isPendingOrCancelled
                                     ? ""
                                     : `${item.compliance}%`}
                                 </td>
                                 <td style={{ textAlign: "center" }}>
                                   ${item.unitPrice}
                                 </td>
                                 <td style={{ textAlign: "center" }}>
                                   {new Date(item.docDueDate).toLocaleDateString(
                                     "es",
                                     {
                                       day: "numeric",
                                       month: "short",
                                       year: "numeric",
                                     }
                                   )}
                                 </td>
                               </tr>
                             );
                           })}
                       </tbody>
                     </table>
                   </div>
                 </div>
               </Grid>
     
               <Grid item xs={12} sm={12} md={4}>
                 <div className="carta-modal">
     
                   <p className="titulos">STOCK ALMACENES</p>
                   <p style={{ padding: "0.5rem" }}>Analizar Stock: {freProduct.checkStock}</p>
                   <div className="Scroll">
                     <table className="table table-ligh table-hover">
                       <thead>
                         <tr>
                           <th style={{ textAlign: "center" }}>Almacen</th>
                           <th style={{ textAlign: "center" }}>Cantidad</th>
                           <th style={{ textAlign: "center" }}>AVG</th>
                         </tr>
                       </thead>
                       <tbody>
                         {stockAlmacenes &&
                           stockAlmacenes.map((item, i) => {
                             const currentIndex = i + 1;
                             return (
                               <tr key={currentIndex}>
                                 <td style={{ textAlign: "start" }}>
                                   {item.whsName}
                                 </td>
                                 <td style={{ textAlign: "end" }}>{item.onHand}</td>
                                 <td
                                   style={{
                                     textAlign: "center",
                                     background: "#d1f4cb",
                                   }}
                                 >
                                   {item.avgSales}
                                 </td>
                               </tr>
                             );
                           })}
                       </tbody>
                     </table>
                     <table className="table table-ligh table-hover">
                       <tbody>
                         <tr style={{ background: "#128496", color: "white" }}>
                           <th
                             style={{
                               textAlign: "start",
                               width: "190px",
                               fontSize: "16px",
                             }}
                           >
                             <p>TOTAL</p>
                           </th>
                           <td style={{ textAlign: "center", fontSize: "18px" }}>
                             <p>{stockTotal}</p>
                           </td>
                           <td style={{ textAlign: "center", fontSize: "18px" }}>
                             <p>{avgTotal}</p>
                           </td>
                         </tr>
                       </tbody>
                     </table>
                   </div>
                 </div>
               </Grid>
             </Grid>
    </Modal>
  );
};

export default ModalAnalisis;
