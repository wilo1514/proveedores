import React from "react";
import Modal from "../Modal";
import { Grid, FormControl, FilledInput, InputAdornment, RadioGroup, FormControlLabel, Radio, Checkbox, TablePagination } from "@mui/material";
import SearchIcon from "../../assets/iconos/search.svg";
const ModalVisualizarPurchase = ({
    isOpen,
    onClose,
    busquedaTexto,
    handleSearchProduct,
    busqueda,
    handleBusqueda,
    productos,
    productosFiltrados,
    productosSeleccionados,
    handleSelectAll,
    handleCheckboxChange,
    pageP,
    rowsPerPageProduct,
    handleChangePageModal,
    agregarProductos}) => {
    
    return(
        <Modal isOpen={isOpen} onClose={onClose} title="LISTADO DE PRODUCTOS" size="lg" className="Pruebas">
      <Grid container spacing={2} style={{ background: 'white' }}>
        <Grid item xs={12} sm={12} md={8}>
          <FormControl fullWidth variant="filled">
            <FilledInput
              hiddenLabel
              type="text"
              className="buscar"
              size="small"
              value={busquedaTexto}
              onChange={handleSearchProduct}
              endAdornment={
                <InputAdornment position="end">
                  <img src={SearchIcon} alt="buscar" />
                </InputAdornment>
              }
              label="Buscar"
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <FormControl>
            <RadioGroup row name="row-radio-buttons-group" value={busqueda} onChange={handleBusqueda}>
              <FormControlLabel value={true} control={<Radio />} label="Código" />
              <FormControlLabel value={false} control={<Radio />} label="Descrip." />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>

      <div className="Scroll">
        <table className="table table-ligh table-hover">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }} className="checkgeneral">
                <Checkbox
                  checked={productosSeleccionados.length === productos.length}
                  indeterminate={productosSeleccionados.length > 0 && productosSeleccionados.length < productos.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th style={{ textAlign: "center" }} className="encabezadosTabal">CÓDIGO BARRA</th>
              <th style={{ textAlign: "center" }} className="encabezadosTabal">DESCRIPCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length > 0 &&
              productosFiltrados
                .slice(pageP * rowsPerPageProduct, pageP * rowsPerPageProduct + rowsPerPageProduct)
                .map((item) => {
                  const isSelected = productosSeleccionados.some(p => p.codigoPrincipal === item.codigoPrincipal);
                  return (
                    <tr key={item.codigoPrincipal}>
                      <td style={{ textAlign: "start" }}>
                        <Checkbox checked={isSelected} onChange={(event) => handleCheckboxChange(event, item)} className="check" />
                      </td>
                      <td style={{ textAlign: "start" }}>{item.codigoPrincipal}</td>
                      <td style={{ textAlign: "start" }}>{item.descripcion}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
        <TablePagination
          component="div"
          count={productos ? productos.length : 0}
          rowsPerPage={rowsPerPageProduct}
          page={pageP}
          onPageChange={handleChangePageModal}
          rowsPerPageOptions={[]}
        />
      </div>

      <button variant="contained" className="boton-modal" onClick={agregarProductos}>
        Agregar
      </button>
    </Modal>
  );
    };
    export default ModalVisualizarPurchase