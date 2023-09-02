import { PayloadAction, createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit"
import { Spoke, SpokeID, genSpokeId, idForSpoke } from '../../model/Spoke'
import { AppThunk, RootState } from "../../app/store"
import { ServerContext } from "wghub-rust-web"

const spokesAdapter = createEntityAdapter<Spoke>({
  selectId: idForSpoke
})

const spokesSlice = createSlice({
  name: 'spokes',
  initialState: spokesAdapter.getInitialState(),
  reducers: {
    setSpoke: spokesAdapter.upsertOne,
    deleteSpoke: spokesAdapter.removeOne,
    toggleSpokeDisabled: (state, { payload }: PayloadAction<string>) => {
      state.entities[payload].disabled = !state.entities[payload].disabled
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

export const getSpokesForHubSelector = () => createSelector(
  (state: RootState) => state.spokes.entities,
  (_: RootState, hubName: string) => hubName,
  (entities, hubName) => Object.values(entities).filter(spoke => spoke.hub === hubName)
)

export const { importSpokes } = spokesSlice.actions

export default spokesSlice.reducer