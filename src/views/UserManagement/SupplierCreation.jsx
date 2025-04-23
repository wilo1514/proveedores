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
 * Vista para registrar proveedores.
 * 
 * La vista contiene un formulario para registrar los datos del proveedor,
 * incluyendo el RUC, el usuario del proveedor, el código del proveedor,
 * el nombre del proveedor, el correo electrónico del proveedor y la
 * contraseña para el proveedor. El formulario se envía al servidor para
 * registrar al proveedor.
 * 
 * La vista también contiene un botón para cancelar el registro y regresar
 * a la vista de registro.
 * 
 * @returns {JSX.Element} La vista para registrar proveedores.
 */
export default function SuppliersView() {
  const navigate = useNavigate();
  const [reset, setReset] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [ruc, setRuc] = useState("");
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("Conorque2024.");
  const [rol] = useState("supplier")
  const handleRuc = (e) => setRuc(e.target.value);
  const handleUsuario = (e) => setUsuario(e.target.value);
  const handleCodigo = (e) => setCodigo(e.target.value);
  const handleNombre = (e) => setNombre(e.target.value);
  const handleContraseña = (e) => setContraseña(e.target.value);
  const regresar = () => { navigate("/registro") };

  /**
   * Función para manejar el input del email del proveedor.
   * 
   * La función recibe el evento de input del email y extrae el primer
   * email separado por punto y coma. Si el valor del input es un objeto
   * JSON, se extrae el primer email de la propiedad "email". Si el valor
   * no es un objeto JSON, se extrae el primer email separado por punto y
   * coma. La función actualiza el estado con el primer email extraido.
   * 
   * @param {object} e - Evento de input del email.
   */
  const handleEmail = (e) => {
    const { value } = e.target;
    let firstEmail = '';

    try {
      const emailsObject = JSON.parse(value);
      if (emailsObject.email) {
        firstEmail = emailsObject.email.split(';')[0].trim();
      } else {
        firstEmail = value.split(';')[0].trim();
      }
    } catch (error) {
      firstEmail = value.split(';')[0].trim();
    }

    setEmail(firstEmail);
  };


  /**
   * Muestra una alerta de error y redirige al inicio en caso de fallo de autenticación.
   * 
   * La función muestra una alerta de error con el título "TIEMPO EXCEDIDO" y el texto "Vuelve a ingresar a la APP".
   * La alerta no tiene botón de confirmar y se cierra automáticamente después de 2200 milisegundos.
   * Luego, se redirige al usuario a la ruta "/" y se eliminan los items "token" y "expiracion" del localStorage.
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
   * Limpia los campos de la vista de registro de proveedores.
   * 
   * Al ser llamado, este método resetea los valores de los
   * campos de la vista de registro de proveedores y 
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
 * Busca un proveedor en la base de datos.
 * 
 * Realiza una solicitud a la API para buscar un proveedor utilizando
 * el RUC proporcionado. Si el proveedor no existe, se muestra una
 * alerta de error. Si el proveedor existe, se llama a la función 
 * `procesamiento` para manejar los datos del proveedor.
 * 
 * @function
 * @async
 * @returns {void} No devuelve nada.
 */

  const buscar = async () => {
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token")


      const datos = await fetchApi({
        endPoint: `/supplier/${ruc}`,
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenId}`,
        },
        paginacion: false,
    });

    if (datos.error) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Ruc no Encontadro",
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
 * Extrae el primer email separado por punto y coma de una cadena de email.
 * 
 * La función recibe una cadena de email separados por punto y coma y devuelve
 * el primer email separado por punto y coma. Si no hay emails separados por
 * punto y coma, se devuelve una cadena vacía.
 * 
 * @param {string} emailString - Cadena de email separados por punto y coma.
 * @returns {string} El primer email separado por punto y coma.
 */
  const extractFirstEmail = (emailString) => {
    return emailString.split(';')[0].trim();
  };
  const procesamiento = (datos) => {
    setUsuario(datos.licTradNum);
    setCodigo(datos.cardCode);
    setNombre(datos.cardName);

    const correo = datos.email;
    const firstEmail = extractFirstEmail(correo);

    setEmail(firstEmail);
  };


/**
 * Registra un nuevo usuario en el sistema
 * 
 * La función recibe los valores de ruc, usuario, email, contraseña, nombre y
 * rol de un nuevo usuario y los utiliza para registrar un nuevo usuario en el
 * sistema. Si el registro es exitoso, borra los campos de la vista de registro
 * de proveedores.
 * 
 * @function
 * @async
 * @returns {void} No devuelve nada.
 */
  const registrar = async () => {
    const registro = {
      "userName": usuario,
      "email": email,
      "password": contraseña,
      "userNameComplete": nombre,
      "cardCode": codigo,
      "ruc": ruc,
      "rol": rol,
    }
    console.log("ingreso", registro)
    const validado = await validacion();
    if (validado === 1) {
      const tokenId = localStorage.getItem("token")
      const datos = await fetchApi({
        endPoint: `/user/register`,
        method: "POST",
        body: registro,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenId}`,
        },
        paginacion: false,
    });

    if (datos.error) {
        console.error(datos.error);
        return;
    }
    registrado(datos.datos)
      setReset(!reset);
      setRuc(0)
      setUsuario("")
      setCodigo("")
      setNombre("")
      setEmail("")
      setContraseña("")
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

  return (
    <>
      <Container fluid className="container-grid">
        <Grid container className="container-supplier">
          <div className="text-register">
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12} md={12}>
                <Typography component="div" variant="h7" className="title-register" style={{ textAlign: "center" }}>
                  REGISTRO DE PROVEEDORES
                </Typography>
              </Grid>
              <Grid item xs={12} sm={12} md={12}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <TextField key={reset} onChange={handleRuc} className="inputregistro" inputProps={{ style: { textTransform: "uppercase" } }} required name='ruc' fullWidth label="Búsqueda RUC Proveedor" type="int" />
                  <img scr={SearchIcon} onClick={() => { buscar() }} />
                  <img src={DeleteIcon} onClick={() => { limpiarCampos() }} />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={12} md={12}>
                <Typography component="div" variant="h7" className="title-item" style={{ textAlign: "left" }}>
                  Información Personal
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField key={reset} onChange={handleUsuario} value={usuario} className="inputregistro" inputProps={{ style: { textTransform: "uppercase" } }} required name='usuario' fullWidth label="Usuario del Proveedor" type="text" />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField key={reset} onChange={handleCodigo} value={codigo} className="inputregistro" inputProps={{ style: { textTransform: "uppercase" } }} required name='codigo' fullWidth label="Código del Proveedor" type="text" />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField key={reset} onChange={handleNombre} value={nombre} className="inputregistro" inputProps={{ style: { textTransform: "uppercase" } }} required name='nombre' fullWidth label="Nombre del Proveedor" type="text" />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  onChange={handleEmail}
                  value={email}
                  className="inputregistro"
                  inputProps={{ style: { textTransform: "uppercase" } }}
                  required
                  name='email'
                  fullWidth
                  label="Correo del Proveedor"
                  type="text"
                />
              </Grid>
              <Grid item xs={12} sm={12} md={12}>
                <Typography component="div" variant="h7" className="title-item" style={{ textAlign: "left" }}>
                  Seguridad de Cuenta
                </Typography>
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