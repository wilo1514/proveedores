import { createSlice } from '@reduxjs/toolkit'

export const orderSlice = createSlice({
    name: 'order',
    initialState: {
        orden: "",
        proveedor: "",
        codeProveedor:"",
        sucursal: "",
        codeSucursal:"",
        fechaPedido: "",
        fechaEntrega: "",
        productos: [
            {
                codigoPrincipal: "",
                codigoConorque: "",
                cantidad: 0,
                unidad: "",
                descripcion: "",
                precioU: 0,
                iva:0,
                descuento:0,
                avg: 0,
                comentario: ""
            },
        ],
    },

    reducers: {
        updateInfoOrder: (state,action) => {
            state.orden = action.payload.orden
            state.proveedor = action.payload.proveedor
            state.codeProveedor = action.payload.codeProveedor
            state.sucursal = action.payload.sucursal
            state.codeSucursal = action.payload.codeSucursal
            state.fechaPedido = action.payload.fechaPedido
            state.fechaEntrega = action.payload.fechaEntrega
        },

        updateOrder: (state, action) => {
            state.productos = action.payload.productos
        },
    },

})

export const { updateOrder} = orderSlice.actions

export default orderSlice.reducer