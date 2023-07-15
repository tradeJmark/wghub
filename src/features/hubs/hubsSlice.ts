import { createEntityAdapter, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Hub } from "../../model/Hub"
import { RootState } from "../../app/store"
import { KeyOfType } from "../../util"

export interface ArrayItem {
  hubName: string
  arrayName: KeyOfType<Hub, string[]>
  arrayValue: string
}

const hubsAdapter = createEntityAdapter<Hub>({
  selectId: hub => hub.name
})

interface HubState {
  currentHubName?: string
  candidateName?: string
  duplicate: boolean
}

const initialState = hubsAdapter.getInitialState<HubState>({
  duplicate: false
})

const hubsSlice = createSlice({
  name: 'hubs',
  initialState: initialState,
  reducers: {
    newHub: hubsAdapter.addOne,
    editHub: hubsAdapter.updateOne,
    addArrayItem: (state, { payload: { hubName, arrayName, arrayValue } }: PayloadAction<ArrayItem>) => {
      state.entities[hubName][arrayName].push(arrayValue)
    },
    removeArrayItem: (state, { payload: {hubName, arrayName, arrayValue}}: PayloadAction<ArrayItem>) => {
      state.entities[hubName][arrayName] = state.entities[hubName][arrayName].filter(item => item !== arrayValue)
    },
    selectHub: (state, { payload }: PayloadAction<string>) => {
      state.currentHubName = payload
    },
    submitCandidateName: (state, { payload }: PayloadAction<string>) => {
      state.candidateName = payload
    }
  }
})

export const selectIsDuplicate = createSelector(
  (state: RootState) => state.hubs.ids.map(id => id.valueOf()),
  (state: RootState) => state.hubs.candidateName,
  (ids, candidate) => ids.includes(candidate)
)

export const selectCurrentHub = createSelector(
  (state: RootState) => state.hubs.currentHubName,
  (state: RootState) => state.hubs.entities,
  (name, entities) => entities[name]
)

export const { newHub, editHub, addArrayItem, removeArrayItem, selectHub, submitCandidateName } = hubsSlice.actions

export default hubsSlice.reducer