import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { validacion } from "../../utils/apiUtils";
import fetchApi from "../../utils/fechtData";
import Swal from 'sweetalert2';


import '../../css/VistasGenerales/Settings.css';

/**
 * Vista de configuraciones, donde se puede cambiar la contraseña del usuario.
 * @returns {ReactElement} La vista de configuraciones.
 */
export default function SettingsView() {
  const [password, setPassword] = useState("");
  const [passwordA, setPasswordA] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [errorv, setErrorv] = useState("");
  const [reset, setReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  /**
   * Maneja el cambio de la contraseña actual.
   * @param {object} e - Evento que activa esta funci n.
   */
  const handlePasswordChangeA = (e) => {
    const aPassword = e.target.value;
    setPasswordA(aPassword);
  }

  /**
   * Maneja el cambio de la nueva contraseña.
   * @param {object} e - Evento que activa esta funci n.
   * Valida la nueva contraseña y actualiza el estado de la misma.
   */
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    if (newPassword !== "") {
      setPassword(newPassword);
      validatePassword(newPassword);
    } else {
      setPassword("")
      setError("")
    }
  };

  /**
   * Maneja el cambio en el campo de confirmación de contraseña.
   * 
   * La función recibe el evento del input de confirmación de contraseña
   * y actualiza el estado con el valor del input. Si el input está vacío,
   * se restablece el estado de confirmación de contraseña y se limpia el error de validación.
   * 
   * @param {object} e - Evento de cambio en el input de confirmación de contraseña.
   */

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    if (newConfirmPassword !== "") {
      setConfirmPassword(newConfirmPassword);
    } else {
      setConfirmPassword("")
      setErrorv("")
    }
  };

  /**
   * Cambia la contraseña del usuario actual.
   * 
   * La función se encarga de verificar la autenticación del usuario, y si es válida,
   * envía una solicitud POST a la API para cambiar la contraseña. Si la contraseña
   * fue cambiada correctamente, muestra una alerta de éxito y redirige a la pantalla
   * de inicio de sesión. Si ocurre un error, muestra una alerta de error y redirige
   * a la pantalla de inicio de sesión.
   * 
   * @returns {void}
   */
  const ChangePassword = async () => {
    const validado = await validacion();
    
    if (validado === 1) {
      if (password === confirmPassword) {
        const informacion = {
          currentPassword: passwordA,
          newPassword: password,
        };
  
        console.log("Contraseña enviada", informacion);
        
        const tokenId = localStorage.getItem("token");
  
        const { datos, error } = await fetchApi({
          endPoint: `/user/changepassword`,
          method: 'POST',
          paginacion: false,
          body: informacion,
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + tokenId,
          },
        });
  
        // Si hay un error pero NO es un 204 (No Content), mostramos el error
        if (error && error !== "Error 204") {
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Error al cambiar la contraseña",
            text: error, // Muestra el error detallado
            showConfirmButton: false,
            timer: 2200,
          });
          setPasswordA(""); // Limpiamos el campo de contraseña actual
          return;
        }
  
        // Si la contraseña fue cambiada correctamente (204 No Content)
        if (!error || error === "Error 204") {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "CONTRASEÑA CAMBIADA",
            showConfirmButton: false,
            timer: 1500,
          });
  
          setReset(!reset);
          setPassword("");
          setConfirmPassword("");
  
          setTimeout(() => {
            navigate("/");
            localStorage.removeItem("token");
            localStorage.removeItem("expiracion");
          }, 2000);
        }
      } else {
        // Si las contraseñas no coinciden, mostramos el error
        setErrorv("Las contraseñas no coinciden");
      }
    } else {
      // Si el token ha expirado o es inválido
      Swal.fire({
        position: "center",
        icon: "error",
        title: "TIEMPO EXCEDIDO",
        text: 'Vuelve a ingresar a la APP',
        showConfirmButton: false,
        timer: 2200,
      });
      navigate('/');
      localStorage.removeItem("token");
      localStorage.removeItem("expiracion");
    }
  };
  


/**
 * Valida si una contraseña cumple con los requisitos de seguridad
 * (al menos 6 caracteres, letras, números y símbolos)
 * @param {string} newPassword - Nueva contraseña a validar
 * @private
 */
  const validatePassword = (newPassword) => {
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#$%.])[A-Za-z\d@$!%*?&#$%.]+$/g.test(newPassword)) {
      setError("La contraseña debe contener letras, números y símbolos");
    } else {
      setError("");
    }
  };

/**
 * Alterna la visibilidad de la contraseña en el input.
 * 
 * @returns {void}
 */
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="panel">
<div className="text-register">
      <div className="card">
        {/* <div className="card-header">
          <h3  className="text-settings">Bienvenido a Configuraciones</h3>
        </div> */}
        <div className="card-body">
          <div className="container-password">
            <div className="instructions">

              <p className="text-config">Su nueva contraseña debe contener:</p>
              <p className="text-config">- Seis o más caracteres</p>
              <p className="text-config">- Mezcla de letras, números y símbolos</p>
            </div>
            <div className="inputs">
              <div className="input-group">
                <label>Contraseña Actual</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordA}
                  onChange={handlePasswordChangeA}
                  className={error ? "error" : ""}
                />
              </div>

              <div className="input-group">
                <label>Contraseña Nueva</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className={error ? "error" : ""}
                />
                {error && <span className="helper-text">{error}</span>}
              </div>

              <div className="input-group">
                <label>Confirmar Contraseña</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={errorv ? "error" : ""}
                />
                {errorv && <span className="helper-text">{errorv}</span>}
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={toggleShowPassword}
                />
                <label>Mostrar Contraseñas</label>
              </div>

              <div className="button-group">
                <button className="boton-modal" onClick={ChangePassword}>
                  Cambiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
</div>
</div>
  );
}
