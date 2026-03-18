import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { validacion } from "../../../utils/apiUtils";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Swal from 'sweetalert2';

import DeliveryStatusCard from "../../../components/DeliveryStatusCard";
import Container from "../../../components/Container";
import fetchApi from "../../../utils/fechtData";

import popupHome from '../../../assets/images/1.webp';
import '../../../css/Proveedores/Home.css';

/**
 * Home de Proveedores: bienvenida, tutoriales y KPI de órdenes.
 */
export default function HomeView() {
  console.log("HomeView se montó");

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Obtiene el código de usuario desde Redux
  const CardCode = useSelector((state) => state.auth.datos_Usuario.CARDCODE);
  console.log("CardCode:", CardCode);

  // Contadores de órdenes
  const [enviadas, setEnviadas] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [canceladas, setCanceladas] = useState(0);

// Popup de bienvenida (solo una vez por sesión y por usuario)
  useEffect(() => {
    if (!CardCode) return; // esperar a que cargue el usuario
    const key = `homePopupShown:${CardCode}`;
    const alreadyShown = sessionStorage.getItem(key);

    if (!alreadyShown) {
      Swal.fire({
        imageUrl: popupHome,
        imageAlt: 'Bienvenida Proveedores',
        width: 640,
        imageWidth: 600,
        padding: '0',
        backdrop: true,
        showConfirmButton: true,
        confirmButtonText: 'Entrar',
        confirmButtonColor: '#1976d2',
        // --- BOTÓN DE DESCARGA ---
        showDenyButton: true,
        denyButtonText: 'Descargar Información',
        denyButtonColor: '#06ac2e', // Color verde para descarga
        // -------------------------
        customClass: { popup: 'swal2-no-padding' },
      }).then((result) => {
        // Si hace clic en Descargar 
        if (result.isDenied) {
          const link = document.createElement("a");
          link.href = "/informacion.pdf"; // Ruta al archivo en la carpeta public
          link.download = "informacion.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Marcamos como mostrado incluso si descargó el archivo
          sessionStorage.setItem(key, '1');
        } 
        // Si hace clic en Entrar (Confirm)
        else if (result.isConfirmed) {
          sessionStorage.setItem(key, '1');
        }
      });
    }
  }, [CardCode]);

  /**
   * Obtiene datos de órdenes del usuario desde la API.
   */
  const obtenerDatos = async () => {
    const validado = await validacion();
    console.log("Validando token...");
    console.log("Respuesta validacion():", validado);

    if (validado === 1) {
      try {
        const tokenId = localStorage.getItem("token");
        const endpoints = [
          `/purchaseorder/countordersdelivered/${CardCode}`,
          `/purchaseorder/countpendingorders/${CardCode}`,
          `/purchaseorder/countcanceledorders/${CardCode}`
        ];

        const respuestas = await Promise.all(
          endpoints.map(endPoint =>
            fetchApi({
              endPoint,
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenId}`,
              },
              paginacion: false,
            }).then(respuesta => {
              if (respuesta.error) {
                console.error(respuesta.error);
                return null;
              }
              return respuesta.datos;
            })
          )
        );

        const [enviadasR, pendientesR, canceladasR] = respuestas;
        console.log("Ordenes entregadas:", enviadasR);
        console.log("Ordenes pendientes:", pendientesR);
        console.log("Ordenes canceladas:", canceladasR);

        if (enviadasR !== null) setEnviadas(enviadasR);
        if (pendientesR !== null) setPendientes(pendientesR);
        if (canceladasR !== null) setCanceladas(canceladasR);
      } catch (error) {
        console.error("Network error:", error);
      }
    } else {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "TIEMPO EXCEDIDO",
        text: 'Vuelve a ingresar a la APP',
        showConfirmButton: false,
        timer: 2200
      });
      navigate('/');
    }
  };

  // Cargar datos al montar
  useEffect(() => {
    obtenerDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Acciones auxiliares
  const soporteSistemas = () => navigate("/sistemas");

  const videoTutorial = () => {
    window.open("https://youtu.be/T8gx37Fo2eU", "_blank");
  };

  const manualPortal = () => {
    const pdfUrl = '/MANUAL.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'ManualPortal.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Container className="container-home" fluid>
        <Grid container>
          <Grid item xs={12}>
            <div className="container-rightHome">
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography component="div" className="title-home" style={{ textAlign: "center" }}>
                    Bienvenidos a la APP Proveedores
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography component="div" className="textoInicio" style={{ textAlign: "justify" }}>
                    Plataforma para el manejo y control de órdenes de pedidos. A través de la app podrás consultar tus órdenes, en qué estado se encuentran, entre otras funciones que buscan agilizar los procesos.
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center" justifyContent="center">
                    <Button variant="outlined" className="video" onClick={manualPortal}>
                      Manual Portal
                    </Button>
                    <Button variant="contained" className="button-disystem" onClick={videoTutorial}>
                      Videos Tutoriales
                    </Button>
                    <Button variant="outlined" className="video" onClick={soporteSistemas}>
                      Soporte Técnico
                    </Button>
                  </Stack>
                </Grid>

                <Grid item xs={12} style={{ backgroundColor: '#f5f5f5' }}>
                  <div className="cards-Home">
                    <DeliveryStatusCard
                      delivered={enviadas}
                      pending={pendientes}
                      canceled={canceladas}
                    />
                  </div>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
