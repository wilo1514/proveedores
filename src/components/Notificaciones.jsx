import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useMediaQuery from '@mui/material/useMediaQuery';
import fetchApi from '../utils/fechtData';

/**
 * Componente de notificaciones que muestra alertas del sistema agrupadas por tipo.
 */
const Notificaciones = () => {
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState({});
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const matchesMobile = useMediaQuery('(max-width:768px)');
  const SlpCode = useSelector((state) => state.auth.datos_Usuario?.SLPCODE ?? "");

  // Alterna visibilidad del menú y refresca notificaciones
  const handleClickOpen = () => {
    if (!open && SlpCode) {
      fetchNotificaciones();  // refresca antes de abrir
    }
    setOpen((prev) => !prev);
  };

  // Cierra menú al hacer clic fuera
  const handleClickOutside = (event) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  // Autoriza orden de compra
  const autorizar = async (datos_notificacion) => {
    navigate('/mesatrabajo/autorizacion');
    sessionStorage.setItem('datosOrden', JSON.stringify(datos_notificacion.notificacionId));

    const tokenId = localStorage.getItem("token");
    const datosEstado = { estado: "lei" };

    await fetchApi({
      endPoint: `/purchaseorder/ordernotificationsqlserver/${datos_notificacion.id}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
      body: datosEstado,
      paginacion: false,
    });

    await fetchNotificaciones();
  };

  // Autoriza actualización de precios
  const autorizarPrecios = async (datos_notificacion) => {
    navigate('/mesatrabajoprecio/autorizacion');
    sessionStorage.setItem('datosOrden', JSON.stringify(datos_notificacion.notificacionId));

    const tokenId = localStorage.getItem("token");
    const datosEstado = { estado: "lei" };

    await fetchApi({
      endPoint: `/items/preciosugeridonotificacionsqlserver/${datos_notificacion.id}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
      body: datosEstado,
      paginacion: false,
    });

    await fetchNotificaciones();
  };

    const autorizarPedidos = async (datos_notificacion) => {
    navigate('/sugeridosmegas');
    sessionStorage.setItem('datosOrden', JSON.stringify(datos_notificacion.notificacionId));

    const tokenId = localStorage.getItem("token");
    const datosEstado = { estado: "lei" };

    await fetchApi({
      endPoint: `/items/sugeridonotificacionsqlserver/${datos_notificacion.id}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenId}`,
      },
      body: datosEstado,
      paginacion: false,
    });

    await fetchNotificaciones();
  };

  // Obtiene y agrupa notificaciones
  const fetchNotificaciones = async () => {
    if (!SlpCode) return;
    try {
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

      const grouped = datos.datos.reduce((acc, notification) => {
        const { tipo } = notification;
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(notification);
        return acc;
      }, {});
      setNotificaciones(grouped);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    }
  };

  // Efecto: carga inicial y refresco periódico cuando SlpCode cambia
  useEffect(() => {
    if (!SlpCode) return;
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 1800000); // 30 min
    return () => clearInterval(interval);
  }, [SlpCode]);

  // Efecto: manejo cierre al clic fuera
  useEffect(() => {
    if (open) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Colores por tipo
  const groupColors = {
    'Orden Compra': '#D1E9F6',
    'Actualizacion Precio': '#F6EACB',
    'Sugeridos Megas': '#9affabff',
    'Información': '#F1D3CE',
  };

  const totalCount = Object.values(notificaciones).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={handleClickOpen} style={styles.button}>
        <div style={styles.iconContainer}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ccc" strokeWidth={1.5} height="1.5rem" style={styles.svg}>
            <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248A9.72 9.72 0 0 0 19.266 2.5Z" />
            <path fillRule="evenodd" d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 1 0 7.48 0 24.583 24.583 0 0 0 4.83-1.244.75.75 0 0 0 .298-1.205 8.217 8.217 0 0 1-2.118-5.520V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 0 0 4.496 0l.002.1a2.25 2.25 0 1 1-4.5 0Z" clipRule="evenodd" />
          </svg>
          {totalCount > 0 && <span style={styles.badge}>{totalCount}</span>}
        </div>
      </button>

      {open && (
        <div
          ref={dialogRef}
          style={{
            ...styles.dialog,
            ...(matchesMobile ? styles.dialogMobile : {}),
          }}
        >
          <div style={styles.dialogTitle}>Notificaciones</div>
          <div style={styles.dialogContent}>
            {totalCount === 0 ? (
              <div style={styles.noNotifications}>No hay notificaciones.</div>
            ) : (
              Object.entries(notificaciones).map(([tipo, items]) => (
                <div key={tipo} style={{ marginBottom: '10px' }}>
                  <div
                    style={{
                      ...styles.groupTitle,
                      backgroundColor: groupColors[tipo] || '#F0F0F0',
                    }}
                  >
                    {tipo} ({items.length})
                  </div>
                  <div style={styles.groupNotifications}>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        style={styles.notification}
                        onClick={() =>{
                          if (tipo === 'Orden Compra') {
                            autorizar(item);
                          } else if (tipo === 'Sugeridos Megas') {
                            autorizarPedidos(item);
                          } else {
                            autorizarPrecios(item);
                          }
                        }}
                      >
                        {item.texto || 'Sin descripción'}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  button: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  iconContainer: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    width: '1.5rem',
    height: '1.5rem',
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#e53935',
    color: '#fff',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  dialog: {
    position: 'absolute',
    top: '35px',
    right: 0,
    width: '400px',
    background: '#fff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    zIndex: 1000,
    maxHeight: '450px',
    overflowY: 'auto',
  },
  dialogMobile: {
    width: '90vw',
    left: '5vw',
  },
  dialogTitle: {
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  dialogContent: {
    padding: '10px 0',
  },
  groupTitle: {
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    borderRadius: '4px 4px 0 0',
  },
  groupNotifications: {
    backgroundColor: '#fafafa',
    maxHeight: '150px',
    overflowY: 'auto',
    padding: '5px 0',
  },
  notification: {
    padding: '8px 12px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#555',
    transition: 'background 0.2s',
  },
  noNotifications: {
    padding: '20px',
    textAlign: 'center',
    color: '#777',
    fontSize: '14px',
  },
};

export default Notificaciones;
