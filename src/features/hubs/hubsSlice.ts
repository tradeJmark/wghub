import { createEntityAdapter, createSelector, createSlice, PayloadAction, Update } from "@reduxjs/toolkit"
import { Hub } from "../../model/Hub"
import { AppThunk, RootState } from "../../app/store"
import { KeyOfType } from "../../util"
import { ServerContext } from "wghub-rust-web"

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

type HubThunkCreator<T> = (ctx: ServerContext, value: T) => AppThunk

export const newHub: HubThunkCreator<Hub> = (ctx, hub) => {
  return dispatch => {
    dispatch(hubsSlice.actions.newHub(hub))
    ctx?.upsertHub(hub)
  }
}

export const deleteHub: HubThunkCreator<string> = (ctx, hubName) => {
  return dispatch => {
    dispatch(hubsSlice.actions.deleteHub(hubName))
    ctx?.deleteHub(hubName)
  }
}

export const editHub: HubThunkCreator<Update<Hub>> = (ctx, update) => {
  return (dispatch, getState) => {
    dispatch(hubsSlice.actions.editHub(update))
    const hub = getState().hubs.entities[update.id]
    ctx?.upsertHub(hub)
  }
}

export const addArrayItem: HubThunkCreator<ArrayItem> = (ctx, item) => {
  return (dispatch, getState) => {
    dispatch(hubsSlice.actions.addArrayItem(item))
    const hub = getState().hubs.entities[item.hubName]
    ctx?.upsertHub(hub)
  }
}

export const removeArrayItem: HubThunkCreator<ArrayItem> = (ctx, item) => {
  return (dispatch, getState) => {
    dispatch(hubsSlice.actions.removeArrayItem(item))
    const hub = getState().hubs.entities[item.hubName]
    ctx?.upsertHub(hub)
  }
}

export const selectIsDuplicate = createSelector(
  (state: RootState) => state.hubs.ids.map(id => id.valueOf()),
  (state: RootState) => state.hubs.candidateName,
  (ids, candidate) => ids.includes(candidate)
)

export const { expandHub, collapseHub, submitCandidateName, importHubs } = hubsSlice.actions

export default hubsSlice.reducer