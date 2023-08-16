import { PayloadAction, createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit"
import { Spoke } from '../../model/Spoke'
import { hash } from 'ohash'
import { RootState } from "../../app/store"

const hashSpoke = (name: string, hub: string) => hash({ name, hub })

const spokesAdapter = createEntityAdapter<Spoke>({
  selectId: ({ name, hub }) => hashSpoke(name, hub)
})

interface SpokeState {
  candidateName?: string
}

const spokesSlice = createSlice({
  name: 'spokes',
  initialState: spokesAdapter.getInitialState<SpokeState>({}),
  reducers: {
    addSpoke: spokesAdapter.addOne,
    submitCandidateName: (state, { payload }: PayloadAction<string>) => {
      state.candidateName = payload
    }
  }
})

export const getSpokesSelectorForHub = (hubName: string) => {
  return createSelector(
    (state: RootState) => state.spokes.entities,
    (entities) => Object.values(entities).filter(spoke => spoke.hub === hubName)
  )
}

export const getSelectIsDuplicateSpokeForHub = (hubName: string) => createSelector(
  (state: RootState) => hashSpoke(state.spokes.candidateName, hubName),
  (state: RootState) => state.spokes.ids,
  (candidateHash, names) => names.includes(candidateHash)
)

export const { addSpoke, submitCandidateName } = spokesSlice.actions

export default spokesSlice.reducer