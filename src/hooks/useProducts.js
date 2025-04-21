// hooks/useProductos.js
import { useState, useEffect } from 'react';
import fetchApi from "../utils/fechtData";
import { validacion } from "../utils/apiUtils";

export const useProductos = () => {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);

    useEffect(() => {
        getProductos();
    }, []);

    const getProductos = async () => {
        const validado = await validacion();
        if (validado === 1) {
            const codeSup = sessionStorage.getItem("codeSup");
            const tokenId = localStorage.getItem("token");
            const datos = await fetchApi({
                endPoint: `/items/${codeSup}`,
                method: "GET",
                paginacion: false,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + tokenId,
                },
            });
            if (!datos.error) {
                setProductos(datos.datos);
                setProductosFiltrados(datos.datos);
            }
        }
    };

    return { productos, productosFiltrados, productosSeleccionados, setProductosSeleccionados };
};
