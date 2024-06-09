import { createSlice } from '@reduxjs/toolkit'
//import { RootState } from '../store'


export const userSlice = createSlice({
  name: 'user',
  initialState:{
    value: {id: "", name: "", email: ""}
  },
  reducers: {
    userSetup: (state, action) => {
      state.value = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { userSetup } = userSlice.actions

//export const selectUser = (state: RootState) => state

export default userSlice.reducer