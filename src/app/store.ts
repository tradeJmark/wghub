import { AnyAction, ThunkAction, configureStore } from "@reduxjs/toolkit"
// import hubsReducer from "../features/hubs/hubsSlice"
// import spokesReducer from '../features/spokes/spokesSlice'
import { api } from '../features/api'

export const store = configureStore({
    reducer: {
        // hubs: hubsReducer,
        // spokes: spokesReducer,
        [api.reducerPath]: api.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)
})

export type StoreType = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>