import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { validacion } from "../../utils/apiUtils";
import Container from "../../components/Container";
import fetchApi from "../../utils/fechtData";
import Swal from 'sweetalert2';


import SearchIcon from '../../assets/iconos/search.svg';
import DeleteIcon from '../../assets/iconos/trash.svg';
import '../../css/VistasGenerales/Supplier.css';

/**
 * Vista para el registro de empleados
 * 
 * Se utiliza para registrar un nuevo empleado 
 * en el sistema, permitiendo la búsqueda 
 * por CI y el registro de los datos del 
 * empleado.
 * 
 * @function
 * @returns {JSX.Element} Componente de la vista de registro de empleados
 * 
 */
export default function EmployeesView() {
  const navigate = useNavigate();
  const [reset, setReset] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [ruc, setRuc] = useState("");
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("Conorque2024.");
  const [rol, setRol] = useState("");
  const handleRuc = (e) => setRuc(e.target.value);
  const handleUsuario = (e) => setUsuario(e.target.value);
  const handleCodigo = (e) => setCodigo(e.target.value);
  const handleNombre = (e) => setNombre(e.target.value);
  const handleEmail = (e) => setEmail(e.target.value);
  const handleContraseña = (e) => setContraseña(e.target.value);
  const handleRol = (e) => setRol(e.target.value);
  const regresar = () => { navigate("/registro") };

  /**
   * Maneja errores de autenticación, mostrando una alerta y redirigiendo a la
   * pantalla de login.
   */
  const handleError = () => {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "TIEMPO EXCEDIDO",
      text: 'Vuelve a ingresar a la APP',
      showConfirmButton: false,
      timer: 2200
    });
    navigate('/');
    localStorage.removeItem("token");
    localStorage.removeItem("expiracion");
  };

  /**
   * Limpia los campos de la vista de registro de empleados.
   * 
   * Al ser llamado, este método resetea los valores de los
   * campos de la vista de registro de empleados y 
   * dispara un state para que se vuelvan a renderizar
   * los componentes que se encuentran en el estado
   * reset.
   */
  const limpiarCampos = () => {
    setReset(!reset)
    setRuc("")
    setUsuario("")
    setCodigo("")
    setNombre("")
    setEmail("")
  };

  /**
   * Busca un empleado en la base de datos
   * 
   * Realiza una petición a la API para buscar un
   * empleado por su CI. Si el empleado no existe,
   * se muestra una alerta de error. Si el empleado
   * existe, se llama a la función `procesamiento`
   * para procesar los datos del empleado.
   * 
   * @function
   * @async
   * @returns {void} No devuelve nada
   */
  const buscar = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token")
      const datos = await fetchApi({
        endPoint: `/employees/${ruc}`,
        method: "GET",
        paginacion: false,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokenId,
        },
      });
      if (datos.error) {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "CI no Encontadro",
          showConfirmButton: false,
          timer: 1500
        });
        return;
      }
      procesamiento(datos.datos)
    } else {
      handleError();
    }
  };

  /**
   * Procesa los datos de un empleado
   * 
   * Al ser llamado, este método setea los valores
   * de los campos de la vista de registro de empleados
   * a los valores correspondientes del objeto "datos"
   * pasado como parámetro. Los campos seteados son:
   * - usuario: `licTradNum` del empleado
   * - código: `slpCode` del empleado
   * - nombre: `slpName` del empleado
   * - email: `email` del empleado
   * 
   * @function
   * @param {object} datos - objeto con los datos del empleado
   * @returns {void} No devuelve nada
   */
  const procesamiento = (datos) => {
    setUsuario(datos.licTradNum)
    setCodigo(datos.slpCode)
    setNombre(datos.slpName)
    setEmail(datos.email)
  };

  /**
   * Registra un nuevo usuario en el sistema
   * 
   * Verifica que el usuario esté autenticado y, si es así, registra un nuevo usuario
   * en el sistema con los datos proporcionados en el objeto "registro". Si el registro
   * es exitoso, borra los campos de la vista de registro de empleados.
   * 
   * @function
   * @returns {void} No devuelve nada
   */
  const registrar = async () => {
    const registro = {
      "userName": usuario,
      "email": email,
      "password": contraseña,
      "userNameComplete": nombre,
      "slpCode": codigo,
      "ruc": ruc,
      "rol": rol,
    }
    const validado = await validacion();
    const tokenId = localStorage.getItem("token");
    if (validado === 1) {
      const datos = await fetchApi({
        endPoint:`/user/register`, 
        method:'POST', 
        paginacion:false,
        body: registro, 
        headers:{
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokenId,
    }})
   
    if (datos.error){
        // handleErrorSis(datos.error)
        return
    } 
registrado(datos.datos)
      setReset(!reset);
      setRuc(0)
      setUsuario("")
      setCodigo("")
      setNombre("")
      setEmail("")
      setContraseña("")
      setRol("")
    } else {
      handleError();
    }
  }

/**
 * Muestra un mensaje de éxito cuando se registra un nuevo proveedor
 */
  const registrado = () => {
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Proveedor Registrado",
      showConfirmButton: false,
      timer: 1500
    });
  }

  const roles = [
    { label: 'EMPLEADO DISTRIBUIDORA',value:'employees'},
    { label: 'EMPLEADO MEGA',value:'employeesmega' },
    { label: 'EMPLEADO PAGOS',value:'employeespago' },
];

  return (
    <>
      <Container fluid className="container-grid">
          <Grid container className="container-supplier">
              <div className="text-register">
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={12} md={12}>
                    <Typography component="div" variant="h7" className="title-register" style={{ textAlign: "center" }}>
                      REGISTRO DE EMPLEADOS
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <TextField key={reset} onChange={handleRuc} className="inputregistro" inputProps={{ style: { textTransform: "uppercase" } }} required name='ruc' fullWidth label="Búsqueda CI Empleados" type="int" />
                      <img src={SearchIcon}  onClick={() => { buscar() }}/>
                      <img src={DeleteIcon} onClick={() => { limpiarCampos() }}/>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Typography component="div" variant="h7" className="title-item" style={{ textAlign: "left" }}>
                      Información Personal
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField key={reset} onChange={handleUsuario} value={usuario} className="inputregistro" inputProps={{ style: { textTransform: "uppercase" } }} required name='usuario' fullWidth label="Usuario del Empleado" type="text" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField key={reset} onChange={handleCodigo} value={codigo} className="inputregistro" inputProps={{ style: { textTransform: "uppercase" } }} required name='codigo' fullWidth label="Código del Empleado" type="text" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField key={reset} onChange={handleNombre} value={nombre} className="inputregistro" inputProps={{ style: { textTransform: "uppercase" } }} required name='nombre' fullWidth label="Nombre del Empleado" type="text" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <select
                      id="combo-box-demo"
                      className="select-empleados"
                      value={rol}
                      onChange={handleRol}>
                        <option value="" className="default-option">Rol del Empleado</option>
                          {roles.map((rol) => (
                            <option key={rol.label} value={rol.value}>
                              {rol.label}
                            </option>
                          ))}
                    </select>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Typography component="div" variant="h7" className="title-item" style={{ textAlign: "left" }}>
                      Seguridad de Cuenta
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField key={reset} onChange={handleEmail} value={email} className="inputregistro" inputProps={{ style: { textTransform: "uppercase" } }} required name='email' fullWidth label="Correo del Empleado" type="text" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField key={reset} onChange={handleContraseña} value={contraseña} className="inputregistro" required name='contraseña' fullWidth label="Contraseña" type="text" />
                  </Grid>
                  <Grid item xs={12} sm={12} md={12}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                      <Button variant="contained" className="register" onClick={() => { registrar() }}>
                        Registrar
                      </Button>
                      <Button variant="outlined" className="cancelar" onClick={regresar}>
                        Cancelar
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </div>
            </Grid>
      </Container>
    </>
  );
}