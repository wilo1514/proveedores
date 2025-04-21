import { configureStore } from '@reduxjs/toolkit'
import updateAuth from '../features/auth/authSlice'
import updateRenovar from '../features/auth/authSlice'
import updateOrder from '../features/order/orderSlice'

export default configureStore({
  reducer: {
    auth: updateAuth, updateRenovar,
    order: updateOrder
  },
});