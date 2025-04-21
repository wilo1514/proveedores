import React, { useState, useEffect } from 'react';

/**
 * Componente de entrada de texto personalizado que permite la validación de valores numéricos
 * según la unidad especificada (UN o KG).
 *
 * @param {Object} props 
 * @param {string | number} props.value - Valor actual del input.
 * @param {Function} props.onChange - Función que se ejecuta cuando cambia el valor del input.
 * @param {"UN" | "KG"} props.unit - Unidad de medida para validar el input.
 * @param {boolean} [props.disabled=false] - Indica si el input debe estar deshabilitado.
 * 
 * @returns {JSX.Element} - Input con validaciones específicas según la unidad.
 */
const CustomInput = ({ value, onChange, unit, disabled }) => {
    const [formattedValue, setFormattedValue] = useState(value);

    // Actualiza el valor cuando cambia la prop `value`
    useEffect(() => {
        setFormattedValue(value);
    }, [value]);

    /**
     * Maneja el cambio de valor en el input con validaciones según la unidad seleccionada.
     *
     * - Si la unidad es "UN" (unidades), solo permite números enteros y un máximo de 20,000.
     * - Si la unidad es "KG" (kilogramos), permite números con decimales y un máximo de 15,000.
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} e - Evento del input.
     */
    const handleChange = (e) => {
        let input = e.target.value;

        if (unit === "UN") {
            input = input.replace(/[^\d]/g, ''); // Permite solo números
            input = input.replace(/^0+/, ''); // Elimina ceros iniciales

            if (input === '') {
                input = '0'; // Si el input está vacío, establece "0"
            }

            if (parseInt(input, 10) > 20000) {
                input = '0'; // Límite máximo de 20,000 unidades
            }

            setFormattedValue(input);
            onChange(input);
        } else if (unit === "KG") {
            input = input.replace(/[^\d.]/g, ''); // Permite números y punto decimal
            input = input.replace(/^0+/, ''); // Elimina ceros iniciales
            input = input.replace(',', '.'); // Reemplaza coma por punto (formato decimal)

            if (input === '') {
                input = '0';
            }

            if (parseFloat(input) > 15000) {
                input = '0'; // Límite máximo de 15,000 kg
            }

            setFormattedValue(input);
            onChange(input);
        }
    };

    return (
        <input
            type="text"
            value={formattedValue}
            onChange={handleChange}
            disabled={disabled}
            style={{
                width: '70px',
                padding: '3px',
                borderRadius: '4px',
                border: '1px solid gray',
                textAlign: 'center',
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.3 : 1,
            }}
            onDrop={(e) => e.preventDefault()}  // Evita que se arrastren valores al input
            onPaste={(e) => e.preventDefault()} // Evita pegar valores en el input
            onCopy={(e) => e.preventDefault()}  // Evita copiar valores desde el input
        />
    );
};

export default CustomInput;
