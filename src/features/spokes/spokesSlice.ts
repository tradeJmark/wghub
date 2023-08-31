import { PayloadAction, createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit"
import { Spoke, SpokeID, genSpokeId, idForSpoke } from '../../model/Spoke'
import { AppThunk, RootState } from "../../app/store"
import { ServerContext } from "wghub-rust-web"

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
    setSpoke: spokesAdapter.upsertOne,
    deleteSpoke: spokesAdapter.removeOne,
    toggleSpokeDisabled: (state, { payload }: PayloadAction<string>) => {
      state.entities[payload].disabled = !state.entities[payload].disabled
    },
    submitCandidateName: (state, { payload }: PayloadAction<string>) => {
      state.candidateName = payload
    },
    importSpokes: spokesAdapter.addMany
  }
})

type SpokeThunkCreator<T> = (ctx: ServerContext, value: T) => AppThunk

export const setSpoke: SpokeThunkCreator<Spoke> = (ctx, spoke) => {
  return dispatch => {
    dispatch(spokesSlice.actions.setSpoke(spoke))
    ctx?.upsertSpoke(spoke)
  }
}

export const deleteSpoke: SpokeThunkCreator<SpokeID> = (ctx, id) => {
  return dispatch => {
    dispatch(spokesSlice.actions.deleteSpoke(genSpokeId(id)))
    ctx?.deleteSpoke(id.hubName, id.spokeName);
  }
}

export const toggleSpokeDisabled: SpokeThunkCreator<SpokeID> = (ctx, id) => {
  return dispatch => {
    dispatch(spokesSlice.actions.toggleSpokeDisabled(genSpokeId(id)))
    ctx?.toggleSpokeDisabled(id.hubName, id.spokeName)
  }
}

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
  (state: RootState) => genSpokeId({hubName, spokeName: state.spokes.candidateName}),
  (state: RootState) => state.spokes.ids,
  (candidateHash, names) => names.includes(candidateHash)
)

export const { submitCandidateName, importSpokes } = spokesSlice.actions

export default spokesSlice.reducer