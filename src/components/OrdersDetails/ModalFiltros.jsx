import React from "react";
import Modal from "../Modal";
import { Autocomplete, TextField, FormControlLabel, Switch, Stack } from "@mui/material";

const ModalFiltros = ({
  isOpen,
  onClose,
  codigosPrincipales,
  codigoConorque,
  descripcion,
  isDisabled,
  selectedOption,
  handleChange,
  handleSwitchChange,
  filterProducts,
  cleanProducts
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="FILTRAR ITEMS" size="md">
      <Autocomplete
        disablePortal
        sx={{ marginTop: "20px" }}
        options={codigosPrincipales}
        disabled={isDisabled.codigoPrincipal && selectedOption.codigoPrincipal === null}
        onChange={(event, value) => handleChange(event, value, "codigoPrincipal")}
        renderInput={(params) => (
          <TextField {...params} className="laterales" label="Código Barras" fullWidth margin="normal" />
        )}
      />
      <Autocomplete
        disablePortal
        options={codigoConorque}
        disabled={isDisabled.codigoConorque && selectedOption.codigoConorque === null}
        onChange={(event, value) => handleChange(event, value, "codigoConorque")}
        renderInput={(params) => (
          <TextField {...params} className="laterales" label="Código Conorque" fullWidth margin="normal" />
        )}
      />
      <Autocomplete
        disablePortal
        options={descripcion}
        disabled={isDisabled.descripcion && selectedOption.descripcion === null}
        onChange={(event, value) => handleChange(event, value, "descripcion")}
        renderInput={(params) => (
          <TextField {...params} className="laterales" label="Descripción" fullWidth margin="normal" />
        )}
      />
      <FormControlLabel
        control={<Switch checked={selectedOption.descuentoFilter === "Con"} onChange={(e) => handleSwitchChange(e, "descuentoFilter")} />}
        label="Filtro de Descuento"
      />
      <Stack direction="column" alignItems="center" justifyContent="center" spacing={2}>
        <button variant="contained" className="boton-gestion" onClick={filterProducts}>Filtrar</button>
        <button variant="contained" className="boton-gestion" onClick={cleanProducts}>Reiniciar</button>
      </Stack>
    </Modal>
  );
};

export default ModalFiltros;