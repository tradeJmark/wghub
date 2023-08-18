import { PayloadAction, createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit"
import { Spoke, genSpokeId, idForSpoke } from '../../model/Spoke'
import { RootState } from "../../app/store"

const spokesAdapter = createEntityAdapter<Spoke>({
  selectId: idForSpoke
})

interface SpokeState {
  candidateName?: string
}

const spokesSlice = createSlice({
  name: 'spokes',
  initialState: spokesAdapter.getInitialState<SpokeState>({}),
  reducers: {
    addSpoke: spokesAdapter.addOne,
    deleteSpoke: spokesAdapter.removeOne,
    toggleDisableSpoke: (state, { payload }: PayloadAction<string>) => {
      state.entities[payload].disabled = !state.entities[payload].disabled
    },
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

export const getDisabledSpokesForHub = (hubName: string) => {
  return createSelector(
    getSpokesSelectorForHub(hubName),
    (spokes) => spokes.filter(spoke => spoke.disabled || spoke.publicKey === null).map(idForSpoke)
  )
}

export const getEnabledSpokesForHub = (hubName: string) => {
  return createSelector(
    getSpokesSelectorForHub(hubName),
    (spokes) => spokes.filter(spoke => !spoke.disabled && spoke.publicKey !== null)
  )
}

export const getSelectIsDuplicateSpokeForHub = (hubName: string) => createSelector(
  (state: RootState) => genSpokeId(hubName, state.spokes.candidateName),
  (state: RootState) => state.spokes.ids,
  (candidateHash, names) => names.includes(candidateHash)
)

export const { addSpoke, deleteSpoke, toggleDisableSpoke, submitCandidateName } = spokesSlice.actions

export default spokesSlice.reducer