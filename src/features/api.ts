import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Hub, Spoke } from 'wghub-rust-web'
import { Serialized } from '../util'

const HUBS_TAG = "Hubs"
const SPOKES_TAG = "Spokes"
const LIST_ID = "LIST"

interface UnboundSpoke {
  hubId: string,
  spoke: Spoke
}

interface SpokeDescriptor {
  hubId: string,
  spokeId: string
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080/api', credentials: "same-origin" }),
  tagTypes: [HUBS_TAG, SPOKES_TAG],
  endpoints: (builder) => ({
    getHubs: builder.query<Serialized<Hub>[], void>({
      query: () => ({ url: 'hubs' }),
      transformResponse: (res: any[]) => res.map(({...h}) => ({ ...h, id: h._id })),
      providesTags: result => result ? [
        ...result.map(hub => {
          return { type: HUBS_TAG, id: hub.id } as const
        }),
        { type: HUBS_TAG, id: LIST_ID }
      ] : [{ type: HUBS_TAG, id: LIST_ID }]
    }),
    createHub: builder.mutation<void, Hub>({
      query: (hub) => ({
        url: 'hubs/upsert',
        method: 'POST',
        body: hub
      }),
      invalidatesTags: [{ type: HUBS_TAG, id: LIST_ID }]
    }),
    updateHub: builder.mutation<void, Hub>({
      query: (hub) => ({
        url: 'hubs/upsert',
        method: 'POST',
        body: hub
      }),
      invalidatesTags: (_result, _error, hub) => [{ type: HUBS_TAG, id: hub.id }]
    }),
    deleteHub: builder.mutation<void, string>({
      query: (hubId) => ({
        url: `hubs/${hubId}`,
        method: 'DELETE'
      }),
      invalidatesTags: () => [{ type: HUBS_TAG, id: LIST_ID }]
    }),
    getSpokesForHub: builder.query<Serialized<Spoke>[], string>({
      query: (hubId) => ({ url: `hubs/${hubId}/spokes` }),
      transformResponse: (res: any[]) => res.map(({ ...s }) => ({ ...s, id: s._id })),
      providesTags: result => result ? [
        ...result.map(spoke => {
          return { type: SPOKES_TAG, id: spoke.id } as const
        }),
        { type: SPOKES_TAG, id: LIST_ID }
      ] : [{ type: SPOKES_TAG, id: LIST_ID }]
    }),
    createSpoke: builder.mutation<void, UnboundSpoke>({
      query: ({ hubId, spoke }) => ({
        url: `hubs/${hubId}/spokes/upsert`,
        method: 'POST',
        body: spoke
      }),
      invalidatesTags: [{ type: SPOKES_TAG, id: LIST_ID }]
    }),
    updateSpoke: builder.mutation<void, Spoke>({
      query: (spoke) => ({
        url: `hubs/${spoke.hub_id}/spokes/upsert`,
        method: 'POST',
        body: spoke
      }),
      invalidatesTags: (_result, _error, spoke) => [{ type: SPOKES_TAG, id: spoke.id }]
    }),
    deleteSpoke: builder.mutation<void, SpokeDescriptor>({
      query: ({ hubId, spokeId }) => ({
        url: `hubs/${hubId}/spokes/${spokeId}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: SPOKES_TAG, id: LIST_ID }]
    }),
    toggleSpokeDisabled: builder.mutation<void, SpokeDescriptor>({
      query: ({ spokeId, hubId }) => ({
        url: `hubs/${hubId}/spokes/${spokeId}/toggle-disabled`,
        method: 'POST'
      }),
      invalidatesTags: (_result, _error, sd) => [{ type: SPOKES_TAG, id: sd.spokeId }]
    })
  })
})

export const {
  useGetHubsQuery,
  useCreateHubMutation,
  useUpdateHubMutation,
  useDeleteHubMutation,
  useGetSpokesForHubQuery,
  useCreateSpokeMutation,
  useUpdateSpokeMutation,
  useDeleteSpokeMutation,
  useToggleSpokeDisabledMutation
} = api

export const selectSingleHub = (hubId: string): Parameters<typeof useGetHubsQuery>[1] => ({
  selectFromResult: ({ data, isLoading }) => {
    let hub = data?.find((h: Serialized<Hub>) => h.id === hubId)
    return { data: hub, isLoading }
  }
})

export const selectSingleSpoke = (spokeId: String): Parameters<typeof useGetSpokesForHubQuery>[1] => ({
  selectFromResult: ({ data, error, isLoading }) => {
    let spoke = data?.find((s: Serialized<Spoke>) => s.id === spokeId)
    return ({ data: spoke, isLoading, error })
  }
})