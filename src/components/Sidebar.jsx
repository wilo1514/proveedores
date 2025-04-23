import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import Tienda from "../assets/images/mega4.png";
import LogoFinal from "../assets/images/mega.avif";

// Importación de íconos SVG para cada opción del menú
import IconHome from "../assets/iconos/home.svg";
import IconCompras from "../assets/iconos/carritoCompra.svg";
import IconCheckDocumento from "../assets/iconos/checkDocumento.svg";
import IconStartDocumento from  "../assets/iconos/startDocumento.svg";
import IconMaletinCompras from  "../assets/iconos/notasCredito.svg";
import IconEtiquetasCompras from  "../assets/iconos/etiquetaPrecio.svg";
import IconDocumento from  "../assets/iconos/documento.svg";
import IconUserSecurity from  "../assets/iconos/seguridadUsuario.svg";
import IconContraseña from  "../assets/iconos/contraseña.svg";
import IconFileAdd from  "../assets/iconos/carpetaAdd.svg";
import IconStart from  "../assets/iconos/start.svg";
import IconDevoluciones from  "../assets/iconos/carritoDevoluciones.svg";

import "../css/ComponentesAdicionales/Sidebar.css";

/**
 * Componente de barra lateral (Sidebar) que muestra el menú de navegación basado en los permisos del usuario.
 *
 * @param {Object} props
 * @param {Function} props.onRouteChange - Función que se ejecuta cuando se cambia de ruta.
 * 
 * @returns {JSX.Element} - Barra lateral con menú de navegación.
 */
const Sidebar = ({ onRouteChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(false); // Estado para controlar si el sidebar está expandido o colapsado
  const permissions = useSelector((state) => state.auth.permissions); // Obtiene los permisos del usuario desde Redux
  const location = useLocation(); // Obtiene la ubicación actual en el router

  // Agrupa los permisos por grupo (ejemplo: "Proveedores", "Compras", etc.)
  const groupedPermissions = groupBy(
    permissions.filter((item) => item.permiso && item.menu),
    "grupo"
  );

  // Expande el sidebar cuando el mouse está sobre él
  const handleMouseEnter = () => setIsExpanded(true);

  // Colapsa el sidebar cuando el mouse sale
  const handleMouseLeave = () => setIsExpanded(false);

  /**
   * Maneja el cambio de ruta en la navegación.
   * 
   * @param {string} group - Grupo de la opción seleccionada.
   * @param {string} ruta - Ruta de la opción seleccionada.
   */
  const handleLinkClick = (group, ruta) => {
    if (onRouteChange) {
      onRouteChange(group, ruta);
    }
  };

  return (
    <div
      className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo y nombre de la empresa */}
      <div className="section">
        <div className="side-logo">
          <img src={LogoFinal} height={40} alt="Logo" />
          <span
            className={`nav-text ${isExpanded ? "visible" : "hidden"}`}
            style={{ marginLeft: "8px" }}
          >
            <img src={Tienda} height={40} alt="complemento" />
          </span>
        </div>
      </div>

      {/* Secciones del menú según permisos */}
      <div className="section">
        {Object.keys(groupedPermissions).length > 0 ? (
          Object.keys(groupedPermissions).map((group) => (
            <div key={group}>
              <label
                className={`section-label ${isExpanded ? "expanded" : "collapsed"}`}
              >
                {isExpanded ? group : "-"}
              </label>
              <nav className="nav">
                <ul>
                  {groupedPermissions[group].map((perm) => (
                    <li key={perm.nombre}>
                      <Link
                        to={perm.ruta}
                        className={`nav-item ${location.pathname === perm.ruta ? "active" : ""}`}
                        style={{ display: "flex", alignItems: "center" }}
                        onClick={() => handleLinkClick(group, perm.nombre)}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span
                            className={`icon ${location.pathname === perm.ruta ? "active" : ""}`}
                          >
                            {getIcon(perm.ruta)} {/* Se obtiene el ícono según la ruta */}
                          </span>
                          <span
                            className={`nav-text ${isExpanded ? "visible" : "hidden"}`}
                            style={{ marginLeft: "8px" }}
                          >
                            {perm.nombre}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))
        ) : (
          <p>No permissions available</p> // Mensaje si no hay permisos disponibles
        )}
      </div>
    </div>
  );
};

/**
 * Agrupa un array de objetos por una clave específica.
 *
 * @param {Array} array - Array a agrupar.
 * @param {string} key - Clave por la que se agruparán los elementos.
 * @returns {Object} - Objeto con los elementos agrupados.
 */
const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
};

/**
 * Retorna el ícono correspondiente a cada ruta.
 *
 * @param {string} ruta - Ruta de la opción del menú.
 * @returns {JSX.Element|null} - Ícono correspondiente o null si no hay coincidencia.
 */
/*const getIcon = (ruta) => {
  if (!ruta) {
    return null;
  }

  switch (ruta) {
    case "/home":
      return (<IconHome />);
    case "/ordencompra":
      return (<IconCompras />);
    case "/ordenes":
    case "/mesatrabajo":
      return (<IconCheckDocumento />);
    case "/enprogreso":
      return (<IconStartDocumento />);
    case "/mesatrabajodevoluciones":
    case "/pagosefectuados":
      return (<IconMaletinCompras />);
    case "/devoluciones":
      return (<IconDevoluciones />);
    case "/mesatrabajoprecio":
    case "/actualizacionprecio":
      return (<IconEtiquetasCompras />);
    case "/actualizacioninformacion":
      return (<IconDocumento />);
    case "/actualizaciondatos":
      return (<IconUserSecurity />);
    case "/configuracion":
      return (<IconContraseña />);
    case "/nuevoproducto":
      return (<IconFileAdd />);
    default:
      return (<IconStart />);
  }
};*/
const getIcon = (ruta) => {
  switch (ruta) {
    case "/home":
      return <img src={IconHome} alt="Home" height={24} />;
    case "/ordencompra":
      return <img src={IconCompras} alt="Compras" height={24} />;
    case "/ordenes":
    case "/mesatrabajo":
      return <img src={IconCheckDocumento} alt="Check" height={24} />;
    case "/enprogreso":
      return <img src={IconStartDocumento} alt="En progreso" height={24} />;
    case "/mesatrabajodevoluciones":
    case "/pagosefectuados":
      return <img src={IconMaletinCompras} alt="Pagos" height={24} />;
    case "/devoluciones":
      return <img src={IconDevoluciones} alt="Devoluciones" height={24} />;
    case "/mesatrabajoprecio":
    case "/actualizacionprecio":
      return <img src={IconEtiquetasCompras} alt="Precios" height={24} />;
    case "/actualizacioninformacion":
      return <img src={IconDocumento} alt="Documento" height={24} />;
    case "/actualizaciondatos":
      return <img src={IconUserSecurity} alt="Usuario" height={24} />;
    case "/configuracion":
      return <img src={IconContraseña} alt="Config" height={24} />;
    case "/nuevoproducto":
      return <img src={IconFileAdd} alt="Nuevo Producto" height={24} />;
    default:
      return <img src={IconStart} alt="Inicio" height={24} />;
  }
};


export default Sidebar;
