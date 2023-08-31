import { hash } from "ohash"


export type SpokeID = {hubName: string, spokeName: string}

export const genSpokeId = (id: SpokeID): string => hash(id)
export const idForSpoke = (spoke: Spoke): string => genSpokeId({hubName: spoke.hub, spokeName: spoke.name})
export const idFromSpoke = (spoke: Spoke): SpokeID => ({spokeName: spoke.name, hubName: spoke.hub})

export interface Spoke {
  hub: string
  name: string
  ipAddress: string
  publicKey?: string
  disabled: boolean
}

export const newSpoke = (hub: string, name: string, ipAddress: string, publicKey?: string, disabled?: boolean): Spoke => {
    return {
      hub,
      name,
      ipAddress,
      publicKey: publicKey || null,
      disabled: disabled ?? false
  }
}