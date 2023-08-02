import { createEntityAdapter, createSlice } from "@reduxjs/toolkit"
import { Spoke } from '../../model/Spoke'
import { hash } from 'ohash'
import { RootState } from "../../app/store"

const spokesAdapter = createEntityAdapter<Spoke>({
  selectId: ({ name, hub }) => hash({ name, hub })
})

const spokesSlice = createSlice({
  name: 'spokes',
  initialState: spokesAdapter.getInitialState(),
  reducers: {
    addSpoke: spokesAdapter.addOne
  }
})

export const getSpokesSelectorForHub = (hubName: string) => {
  return (state: RootState) => Object.values(state.spokes.entities).filter(spoke => spoke.hub === hubName)
}

export const { addSpoke } = spokesSlice.actions

export default spokesSlice.reducer