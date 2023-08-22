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
  candidateName?: string
  duplicate: boolean
  expanded: Record<string, boolean>
}

const initialState = hubsAdapter.getInitialState<HubState>({
  duplicate: false,
  expanded: {}
})

const hubsSlice = createSlice({
  name: 'hubs',
  initialState: initialState,
  reducers: {
    newHub: hubsAdapter.addOne,
    editHub: hubsAdapter.updateOne,
    deleteHub: hubsAdapter.removeOne,
    addArrayItem: (state, { payload: { hubName, arrayName, arrayValue } }: PayloadAction<ArrayItem>) => {
      state.entities[hubName][arrayName].push(arrayValue)
    },
    removeArrayItem: (state, { payload: {hubName, arrayName, arrayValue}}: PayloadAction<ArrayItem>) => {
      state.entities[hubName][arrayName] = state.entities[hubName][arrayName].filter(item => item !== arrayValue)
    },
    submitCandidateName: (state, { payload }: PayloadAction<string>) => {
      state.candidateName = payload
    },
    expandHub: (state, { payload }: PayloadAction<string>) => {
      state.expanded[payload] = true
    },
    collapseHub: (state, { payload }: PayloadAction<string>) => {
      state.expanded[payload] = false
    },
    importHubs: hubsAdapter.addMany
  }
})

export const selectIsDuplicate = createSelector(
  (state: RootState) => state.hubs.ids.map(id => id.valueOf()),
  (state: RootState) => state.hubs.candidateName,
  (ids, candidate) => ids.includes(candidate)
)

export const { newHub, deleteHub, editHub, expandHub, collapseHub, addArrayItem, removeArrayItem, submitCandidateName, importHubs } = hubsSlice.actions

export default hubsSlice.reducer