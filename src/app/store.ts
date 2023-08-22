import { configureStore } from "@reduxjs/toolkit"
import hubsReducer from "../features/hubs/hubsSlice"
import spokesReducer from '../features/spokes/spokesSlice'

export const store = configureStore({
    reducer: {
        hubs: hubsReducer,
        spokes: spokesReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch