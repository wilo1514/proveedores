import React, { useState, useEffect } from 'react';

/**
 * Componente de entrada numérica para manejar valores decimales con un número configurable de decimales.
 * 
 * @param {Object} props 
 * @param {string} props.value - Valor inicial del input.
 * @param {Function} props.onChange - Función que se ejecuta cuando el valor cambia.
 * @param {number} props.cantidad - Número de decimales permitidos en la entrada.
 * @param {boolean} [props.disabled=false] - Indica si el input está deshabilitado.
 * 
 * @returns {JSX.Element} - Campo de entrada de texto que solo permite números y un punto decimal.
 */
const CustomDecimalInput = ({ value, onChange, cantidad, disabled }) => {
    const [inputValue, setInputValue] = useState(value);

    // Actualiza el estado local si cambia la prop `value`
    useEffect(() => {
        setInputValue(value); 
    }, [value]);

    /**
     * Maneja el cambio en el input asegurando que solo se permitan números y un solo punto decimal.
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio en el input.
     */
    const handleInputChange = (e) => {
        const input = e.target.value;
        const formattedInput = input.replace(/[^\d.]/g, ''); // Permite solo números y un punto
        if (formattedInput.split('.').length > 2) return; // Evita múltiples puntos decimales
        setInputValue(formattedInput);
        onChange(formattedInput);
    };

    /**
     * Formatea el valor al perder el foco, asegurando que tenga el número correcto de decimales.
     */
    const handleBlur = () => {
        const numericValue = parseFloat(inputValue);
        const formattedValue = !isNaN(numericValue) ? numericValue.toFixed(cantidad) : '0.00';
        setInputValue(formattedValue);
        onChange(formattedValue);  
    };

    return (
        <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur} 
            disabled={disabled}
            style={{
                width: '70px',
                padding: '3px',
                borderRadius: '4px',
                border: '1px solid gray',
                textAlign: 'center'
            }}
        />
    );
};

export default CustomDecimalInput;
