import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Hub } from 'wghub-rust-web'
import { Serialized } from '../util'

const HUBS_TAG = "Hubs"
const LIST_ID = "LIST"

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080/api', credentials: "same-origin" }),
  tagTypes: [HUBS_TAG],

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
      invalidatesTags: (_result, _error, hub) => [{ type: HUBS_TAG, id: hub.id.toString() }]
    })
  })
})

export const { useGetHubsQuery, useCreateHubMutation, useUpdateHubMutation } = api

export const useGetHubQuery = (hubId: string) => useGetHubsQuery(undefined, {
  selectFromResult: ({ data, isLoading }) => {
    let hub = data.find(h => h.id === hubId)
    if (!hub) console.warn("dafuq", {searched: hubId, stored: data[0].id})
    return { data: hub, isLoading }
  }
})