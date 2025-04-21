import React from 'react';
import { Container, Card, CardContent, Grid, Typography } from '@mui/material';
import '../css/ComponentesAdicionales/Card.css';

/**
 * Componente de barra de progreso personalizada.
 * 
 * @param {Object} props 
 * @param {number} props.value - Valor numérico que representa el progreso.
 * @param {string} props.status - Estado de la barra de progreso ('entregadas', 'pendientes', 'canceladas').
 * 
 * @returns {JSX.Element} - Barra de progreso estilizada con colores dinámicos.
 */
const CustomProgressBar = ({ value, status }) => {
  /**
   * Determina los colores de la barra según el estado.
   * @returns {string[]} - Arreglo con los colores principales para el degradado.
   */
  const getColor = () => {
    switch (status) {
      case 'entregadas':
        return ['#40A578', '#B0EBB4']; // Verde para entregadas
      case 'pendientes':
        return ['#2C4E80', '#4D869C']; // Azul para pendientes
      case 'canceladas':
        return ['#C40C0C', '#C73659']; // Rojo para canceladas
      default:
        return ['#6c757d']; // Gris por defecto
    }
  };

  /**
   * Calcula el ancho de la barra basado en el valor proporcionado.
   * @returns {number} - Ancho en porcentaje con un máximo de 80%.
   */
  const getWidth = () => {
    const width = (value + 5) * 2; 
    return width <= 80 ? width : 80; 
  };

  return (
    <div style={{ width: '100%', height: 15, marginTop: '12px' }}>
      <div
        style={{
          width: `${getWidth()}%`,
          background: `linear-gradient(-45deg, ${getColor()[0]} 25%, ${getColor()[1]} 25%, ${getColor()[1]} 50%, ${getColor()[0]} 50%, ${getColor()[0]} 75%, ${getColor()[1]} 75%, ${getColor()[1]} 100%)`,
          backgroundSize: '20px 20px', 
          height: '100%',
          borderTopLeftRadius: 10,
          borderBottomLeftRadius: 10,
          animation: 'striped-animation 1s linear infinite',
        }}
      ></div>
    </div>
  );
};

/**
 * Componente de tarjeta que muestra métricas de entregas, pendientes y cancelaciones.
 * 
/**
 * @param {Object} props 
 * @param {number} props.delivered - Number of delivered orders.
 * @param {number} props.pending - Number of pending orders.
 * @param {number} props.canceled - Number of canceled orders.
 * 
 * @returns {JSX.Element} - Card with progress bars for each status.
 */
const DeliveryStatusCard = ({ delivered, pending, canceled }) => {

  return (
    <Container className='contenedorTarjeta'>
      <Card>
        <CardContent>
          <Grid container spacing={3} justifyContent="center" style={{ background: '#fff' }}>
            {/* Sección de Entregadas */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" align="center">Entregadas</Typography>
              <div style={{ backgroundColor: '#c4c9cd73', borderRadius: '10px', marginBottom: '5px' }}>
                <CustomProgressBar value={delivered} status="entregadas" />
              </div>
              <Typography variant="body1" align="center" className='valorEntregadas'>{delivered}</Typography>
            </Grid>

            {/* Sección de Pendientes */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" align="center">Pendientes</Typography>
              <div style={{ backgroundColor: '#c4c9cd73', borderRadius: '10px', marginBottom: '5px' }}>
                <CustomProgressBar value={pending} status="pendientes" />
              </div>
              <Typography variant="body1" align="center" className='valorPendientes'>{pending}</Typography>
            </Grid>

            {/* Sección de Canceladas */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" align="center">Canceladas</Typography>
              <div style={{ backgroundColor: '#c4c9cd73', borderRadius: '10px', marginBottom: '5px' }}>
                <CustomProgressBar value={canceled} status="canceladas" />
              </div>
              <Typography variant="body1" align="center" className='valorCanceladas'>{canceled}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DeliveryStatusCard;
