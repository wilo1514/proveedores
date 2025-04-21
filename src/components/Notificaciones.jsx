import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useMediaQuery from '@mui/material/useMediaQuery';
import fetchApi from '../utils/fechtData';

/**
 * Componente de notificaciones que muestra alertas del sistema agrupadas por tipo.
 */
const Notificaciones = () => {
  const [open, setOpen] = useState(false); // Estado para manejar la visibilidad del menú de notificaciones
  const [notificaciones, setNotificaciones] = useState([]); // Estado que almacena las notificaciones obtenidas del backend
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const matchesMobile = useMediaQuery('(max-width:768px)'); // Detecta si el usuario está en un dispositivo móvil
  const SlpCode = useSelector((state) => state.auth.datos_Usuario?.SLPCODE ?? ""); // Código del usuario desde Redux

  // Función para alternar la visibilidad del menú de notificaciones
  const handleClickOpen = () => {
    setOpen(!open);
  };

  // Función que cierra el menú de notificaciones si se hace clic fuera del contenedor
  const handleClickOutside = (event) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  // Función que maneja la autorización de órdenes de compra
  const autorizar = async (datos_notificacion) => {
    navigate('/mesatrabajo/autorizacion');
    sessionStorage.setItem('datosOrden', JSON.stringify(datos_notificacion.notificacionId));

    const tokenId = localStorage.getItem("token");
    const datosEstado = { estado: "lei" };

    // Petición para actualizar el estado de la notificación en el backend
    const datos = await fetchApi({
      endPoint: `/purchaseorder/ordernotificationsqlserver/${datos_notificacion.id}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
      body: datosEstado,
      paginacion: false,
    });

    if (datos.datos) {
      console.log("Respuesta exitosa:", datos.datos);
    } else {
      console.log("Respuesta vacía o sin cuerpo JSON.");
    }
    
    await fetchNotificaciones(); 
  };

  // Función que maneja la autorización de actualizaciones de precios
  const autorizarPrecios = async (datos_notificacion) => {
    navigate('/mesatrabajoprecio/autorizacion');
    sessionStorage.setItem('datosOrden', JSON.stringify(datos_notificacion.notificacionId));

    const tokenId = localStorage.getItem("token");
    const datosEstado = { estado: "lei" };

    // Petición para actualizar el estado de la notificación en el backend
    const datos = await fetchApi({
      endPoint: `/items/preciosugeridonotificacionsqlserver/${datos_notificacion.id}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
      body: datosEstado,
      paginacion: false,
    });

    if (datos.error) {
      console.error("Error al autorizar la notificación:", datos.error);
      return;
    }

    if (datos.datos) {
      console.log("Respuesta exitosa:", datos.datos);
    } else {
      console.log("Respuesta vacía o sin cuerpo JSON.");
    }
    
    await fetchNotificaciones(); 
  };

  // Función para obtener las notificaciones desde el backend
  const fetchNotificaciones = async () => {
    const tokenId = localStorage.getItem("token");

    const datos = await fetchApi({
      endPoint: `/notification/${SlpCode}`,
      method: "GET",
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

    // Agrupa las notificaciones por tipo
    const groupedNotifications = datos.datos.reduce((acc, notification) => {
      const group = notification.tipo;
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(notification);
      return acc;
    }, {});

    setNotificaciones(groupedNotifications);
  };

  // useEffect que obtiene las notificaciones al montar el componente y cada 30 minutos
  useEffect(() => {
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 1800000); // Actualización cada 30 min
    return () => clearInterval(interval);
  }, []);

  // useEffect que maneja el cierre del menú al hacer clic fuera
  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Colores asociados a cada tipo de notificación
  const groupColors = {
    'Orden Compra': '#D1E9F6',
    'Actualizacion Precio': '#F6EACB',
    'Información': '#F1D3CE',
    'undifined': '#84888b',
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Botón de notificaciones */}
      <button onClick={handleClickOpen} style={styles.button}>
        <div style={styles.iconContainer}>
          <div style={styles.circle}></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ccc" strokeWidth={1.5} height="1.5rem" style={styles.svg}>
            <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248A9.72 9.72 0 0 0 19.266 2.5Z" />
            <path fillRule="evenodd" d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 1 0 7.48 0 24.583 24.583 0 0 0 4.83-1.244.75.75 0 0 0 .298-1.205 8.217 8.217 0 0 1-2.118-5.52V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 0 0 4.496 0l.002.1a2.25 2.25 0 1 1-4.5 0Z" clipRule="evenodd" />
          </svg>
        </div>
      </button>
    </div>
  );
};
const styles = {
  button: {
    position: 'relative',
    display: 'inline-flex',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  iconContainer: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: '37px',
    height: '37px',
    backgroundColor: '#ffff',
    borderRadius: '50%',
    zIndex: 1,
  },
  svg: {
    position: 'relative',
    zIndex: 2,
  },
  badge: {
    position: 'absolute',
    top: '-9px',
    right: '-14px',
    background: '#39a934',
    color: 'white',
    borderRadius: '80px',
    padding: '3px 5px',
    fontSize: '12px',
    zIndex: 3,
  },
  dialog: {
    position: 'absolute',
    top: '35px',
    left: '-480px', 
    width: '480px',
    background: 'white',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    zIndex: 1000,
    maxHeight: '450px',
    overflowY: 'auto',
  },
  dialogMobile: {
    width: '200px',
    left: '-200px',
  },
  dialogTitle: {
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'black',
  },
  dialogContent: {
    padding: '10px 15px',
    backgroundColor: '#ffffff',
    scrollbarWidth: 'thin',
    scrollbarColor: '#f3f3f3 #ffffff',
  },
  groupTitle: {
    padding: '10px 15px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'black',
    borderRadius: '8px 8px 0 0',
  },
  groupNotifications: {
    maxHeight: '150px',
    overflowY: 'auto',
    padding: '5px 0',
  },
  notification: {
    padding: '10px 0',
    borderBottom: '1px solid #ddd',
    cursor: 'pointer',
    textDecoration: 'none',
    color: '#84888b',
    fontSize: '13px',
  },
};
export default Notificaciones;
