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

import '../../../css/Proveedores/Home.css';

/**
 * Componente principal de la vista Home para los proveedores.
 * Muestra información general sobre la aplicación, estadísticas de órdenes y opciones de soporte.
 */
export default function HomeView() {
    // Hook para la navegación entre rutas
    console.log("HomeView se montó");

    const navigate = useNavigate();
    
    // Hook para acceder al tema de Material UI
    const theme = useTheme();
    
    // Determina si la pantalla es móvil
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Alerta de SweetAlert2

    
    // Obtiene el código de usuario desde el estado global
    const CardCode = useSelector((state) => state.auth.datos_Usuario.CARDCODE);
    console.log("CardCode:", CardCode);
    
    // Estados para almacenar los contadores de órdenes
    const [enviadas, setEnviadas] = useState(0);
    const [pendientes, setPendientes] = useState(0);
    const [canceladas, setCanceladas] = useState(0);

    /**
     * Obtiene los datos de las órdenes del usuario desde la API.
     * Realiza validaciones y actualiza los estados correspondientes.
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
    
                // Realiza múltiples solicitudes en paralelo
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


                

                // Destructura y asigna los valores de las respuestas
                const [enviadas, pendientes, canceladas] = respuestas;
                console.log("Ordenes entregadas:", enviadas);
                console.log("Ordenes pendientes:", pendientes);
                console.log("Ordenes canceladas:", canceladas);
                if (enviadas !== null) setEnviadas(enviadas);
                if (pendientes !== null) setPendientes(pendientes);
                if (canceladas !== null) setCanceladas(canceladas);
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
    
    /**
     * Redirige a la página de soporte técnico.
     */
    const soporteSistemas = () => {
        navigate("/sistemas");
    };

    /**
     * Abre un enlace de video tutorial en una nueva pestaña.
     */
    const videoTutorial = () => {
        window.open("https://youtu.be/T8gx37Fo2eU", "_blank");
    };

    /**
     * Descarga el manual en formato PDF.
     */
    const manualPortal = () => {
        const pdfUrl = '/MANUAL.pdf'; 
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'ManualPortal.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Hook de efecto para ejecutar la obtención de datos al montar el componente
    useEffect(() => {
        obtenerDatos();
    }, []);
    
    return (
        <>
            <Container className="container-home" fluid>
                <Grid container>
                    <Grid item xs={12} sm={12} md={12}>
                        <div className="container-rightHome">
                            <Grid container spacing={4}>
                                <Grid item xs={12} sm={12} md={12}>
                                    <Typography component="div" className="title-home" style={{ textAlign: "center" }}>
                                        Bienvenidos a la APP Proveedores
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={12}>
                                    <Typography component="div" className="textoInicio" style={{ textAlign: "justify" }}>
                                        Plataforma para el manejo y control de órdenes de pedidos. A través de la app podrás consultar tus órdenes, en qué estado se encuentran, entre otras funciones que buscan agilizar los procesos.
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={12}>
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
                                <Grid item xs={12} sm={12} md={12} style={{ backgroundColor: '#f5f5f5' }}>
                                    <div className="cards-Home">
                                        <DeliveryStatusCard delivered={enviadas} pending={pendientes} canceled={canceladas} />
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
