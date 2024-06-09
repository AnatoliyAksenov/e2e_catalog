import { configureStore } from '@reduxjs/toolkit';
import userSetup  from './state/userSlice';


export default configureStore({
  reducer: {
    user: userSetup,
  },
})

//export type RootState = ReturnType<typeof store.getState>
//export type AppDispatch = typeof store.dispatch

//export default store