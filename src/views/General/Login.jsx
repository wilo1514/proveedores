import React, { useState } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { updateAuth, updateRenovar } from "../../features/auth/authSlice";
import DotSpinner from "../../components/DotSpinner";
import fetchApi from "../../utils/fechtData";

import '../../css/VistasGenerales/Login.css';
import '../../css/VistasGenerales/General.css';
import logoImage from '../../assets/images/mega_largo.png';

const theme = createTheme();

/**
 * Página de inicio de sesión
 * 
 * Contiene un formulario de inicio de sesión donde se ingresa el usuario y la contraseña.
 * Al hacer clic en el botón "Ingresar", se envía una solicitud POST a la API con el usuario y la contraseña.
 * Si la respuesta es exitosa, se guardan los datos del usuario en el estado de Redux y se redirige a la
 * pantalla correspondiente según el rol del usuario.
 * 
 * @returns Un JSX con el formulario de inicio de sesión
 */
export default function Login() {
  const [nombre, setNombre] = useState("");
  const [contra, setContra] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const Swal = require('sweetalert2');
  const dispatch = useDispatch();

/**
 * Función que se encarga de procesar el ingreso del usuario.
 * 
 * Primero, se verifica que el usuario haya ingresado su usuario y contraseña.
 * Luego, se hace una solicitud POST a la API con el usuario y la contraseña.
 * Si la respuesta es exitosa, se guardan los datos del usuario en el estado de Redux
 * y se redirige a la pantalla correspondiente según el rol del usuario.
 * Si no se ingresa correctamente, se muestra un mensaje de error.
 */
  const IngresarLogin = async (event) => {
    event.preventDefault();

    if (nombre === "") {
      console.log("No está ingresando su usuario");
      return;
    } else if (contra === "") {
      console.log("No está ingresando su contraseña");
      return;
    }
    setLoading(true);

    const ingreso = {
      "userName": nombre,
      "password": contra
    };

  /**
   * Función que procesa la respuesta de la API de inicio de sesión.
   * 
   * Si la respuesta es exitosa, se guardan los datos del usuario en el estado de Redux
   * y se redirige a la pantalla correspondiente según el rol del usuario.
   * Si no se ingresa correctamente, se muestra un mensaje de error.
   * 
   * @param {object} datos - La respuesta de la API de inicio de sesión
   */
    const procesamiento = async (datos) => {
      setLoading(false);
      if (datos.token) {
        localStorage.setItem("token", datos.token);
        localStorage.setItem("expiracion", datos.expiracion);
        dispatch(updateRenovar({
          token: datos.token,
          expiracion: datos.expiracion,
          datos_Usuario: datos.datos_Usuario,
        }));
        console.log("datos", datos.datos_Usuario.ROL)
        try {
          const permisos = await fetchApi({
            endPoint: "/user/obtainPermission",
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${datos.token}`,
            },
            paginacion: false,
          });

          if (permisos.error) {
            console.error(permisos.error);
            return;
          }
          recuperardatos(permisos.datos);
        } catch (error) {
          console.error("Network error:", error);
        }
      } else {
        Swal.fire({
          position: "center",
          icon: "error",
          title: "ERROR",
          text: "Ingresa correctamente tu usuario y contraseña",
          showConfirmButton: false,
          timer: 2500
        });
      }
    };

    try {
      const datos = await fetchApi({
        endPoint: "/user/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: ingreso,
        paginacion: false,
      });

      if (datos.error) {
        console.error(datos.error);
        setLoading(false);
        return;
      }
      procesamiento(datos.datos);
    } catch (error) {
      console.error("Network error:", error);
      setLoading(false);
    }
  };

/**
 * Función que se encarga de guardar los datos del usuario en el estado de Redux
 * y redirigirlo a la pantalla correspondiente según su rol.
 * 
 * @param {object} datos - Los datos del usuario que se han recibido de la API
 */
  const recuperardatos = (datos) => {
    dispatch(updateAuth({
      datos_Usuario: datos.datos_Usuario,
      permissions: datos.permissions,
    }));
    if (datos.datos_Usuario.ROL === "employees") {
      navigate("/mesatrabajo");
    } else if (datos.datos_Usuario.ROL === "employeespago") {
      navigate("/mesatrabajodevoluciones");
    } else if (datos.datos_Usuario.ROL === "employeesmega") {
      navigate("/controlentrada");
    } else if (datos.datos_Usuario.ROL === "supplier") {
      navigate("/home");
    } else if (datos.datos_Usuario.ROL === "admin") {
      navigate("/registro")
    }
  };

  /**
   * Función que se encarga de actualizar el estado del nombre de usuario
   * 
   * @param {object} e - El evento que se genera al modificar el input
   */
  const handleNombre = (e) => {
    setNombre(e.target.value);
  };

  /**
   * Función que se encarga de actualizar el estado de la contraseña
   * 
   * @param {object} e - El evento que se genera al modificar el input
   */
  const handleContra = (e) => {
    setContra(e.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className='container-login'>
        {loading && <DotSpinner />}
        <div className='transparent-container'>
          <br />
          <div className="logo-container">
            <img src={logoImage} alt="Logo" className="logo" />
          </div>
          <br />
          <form className="login-form">
            <div className='InputContainer'>
              <input
                className="styled-input"
                required
                type="text"
                placeholder="Usuario"
                name="nombre"
                value={nombre}
                onChange={handleNombre}
                autoComplete="username"
              />
            </div>
            <div className='InputContainer'>
              <input
                className="styled-input"
                required
                placeholder="Contraseña"
                name="Contraseña"
                type="password"
                onChange={handleContra}
                autoComplete="current-password"
              />
            </div>
            <div className='ButtonContainer'>
              <button className="styled-button" type="submit" onClick={IngresarLogin}>Ingresar</button>
            </div>
            {/* <div>
              <a href="#" onClick={contraseña} className="recuperar_contraseña">
                ¿Olvidaste la contraseña?
              </a>
            </div> */}
          </form>
        </div>
      </div>
    </ThemeProvider>
  );
}