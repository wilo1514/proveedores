import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import styled from 'styled-components';
import '../css/VistasGenerales/Registro.css';

/**
 * Botón estilizado con `styled-components`.
 * Se usa en la tarjeta para activar la función de registro.
 */
const StyledButton = styled.button`
  background: #06ac2e;
  text-transform: uppercase;
  letter-spacing: 0.2rem;
  width: 80%;
  height: 3rem;
  border: none;
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
`;

/**
 * Componente de tarjeta para registrar información.
 * 
 * @param {Object} props 
 * @param {string} props.texto - Texto a mostrar en la tarjeta.
 * @param {Function} props.funcion - Función que se ejecuta al hacer clic en el botón "REGISTRAR".
 * 
 * @returns {JSX.Element} - Tarjeta con un título y un botón de registro.
 */
export default function RegisterCard({ texto, funcion }) {
  return (
    <Card className='card-register'>
      {/* Área clickeable de la tarjeta */}
      <CardActionArea>
        <CardContent className='body-cardregister'>
          <Typography gutterBottom variant="h5" component="div" className='title-cardregister'>
            {texto} {/* Muestra el texto dinámico */}
          </Typography>
        </CardContent>
      </CardActionArea>

      {/* Sección del botón de registro */}
      <CardActions className='Button-Card'>
        <StyledButton type="submit" onClick={() => { funcion() }}>REGISTRAR</StyledButton>
      </CardActions>
    </Card>
  );
}
