// src/views/modals/ModalVisualizar.js
import React from "react";
import Modal from "../Modal";
import { Grid, FormControl, FilledInput, InputAdornment, RadioGroup, FormControlLabel, Radio, Checkbox, TablePagination, Stack } from "@mui/material";
import { ReactComponent as SearchIcon } from "../../assets/iconos/search.svg";

const ModalVisualizar = ({
  isOpen,
  onClose,
  busquedaTexto,
  handleSearchProduct,
  busqueda,
  handleBusqueda,
  productosSeleccionados,
  productos,
  handleSelectAll,
  productosFiltrados,
  pageP,
  rowsPerPageProduct,
  handleChangePageModal,
  handleCheckboxChange,
  agregarProductos
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="LISTADO DE PRODUCTOS" size="lg">
      <Grid container spacing={2} style={{ background: "white" }}>
        <Grid item xs={12} sm={12} md={8}>
          <FormControl fullWidth variant="filled">
            <FilledInput
              hiddenLabel
              id="filled-adornment-password"
              type="text"
              className="buscar"
              size="small"
              value={busquedaTexto}
              onChange={handleSearchProduct}
              endAdornment={
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              }
              label="Buscar"
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <FormControl>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={busqueda}
              onChange={handleBusqueda}
            >
              <FormControlLabel value={true} control={<Radio />} label="Código" />
              <FormControlLabel value={false} control={<Radio />} label="Descrip." />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      <div className="Scroll">
        <table className="table table-light table-hover">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }} className="checkgeneral">
                <Checkbox
                  checked={productosSeleccionados.length === productos.length}
                  indeterminate={productosSeleccionados.length > 0 && productosSeleccionados.length < productos.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th style={{ textAlign: "center" }} className="encabezadosTabal">CÓDIGO BARRAS</th>
              <th style={{ textAlign: "center" }} className="encabezadosTabal">DESCRIPCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados
              .slice(pageP * rowsPerPageProduct, pageP * rowsPerPageProduct + rowsPerPageProduct)
              .map((item) => (
                <tr key={item.codigoPrincipal}>
                  <td style={{ textAlign: "start" }}>
                    <Checkbox
                      checked={productosSeleccionados.some(p => p.codigoPrincipal === item.codigoPrincipal)}
                      onChange={(event) => handleCheckboxChange(event, item)}
                      className="check"
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>{item.codigoPrincipal}</td>
                  <td style={{ textAlign: "center" }}>{item.descripcion}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <TablePagination
          component="div"
          count={productosFiltrados.length}
          rowsPerPage={rowsPerPageProduct}
          page={pageP}
          onPageChange={handleChangePageModal}
          rowsPerPageOptions={[]}
        />
      </div>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
        <button variant="contained" className="boton-modal" onClick={agregarProductos}>Agregar</button>
      </Stack>
    </Modal>
  );
};

export default ModalVisualizar;
