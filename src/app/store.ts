import { configureStore } from "@reduxjs/toolkit"
import hubsReducer from "../features/hubs/hubsSlice"

export const store = configureStore({
    reducer: {
        hubs: hubsReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch