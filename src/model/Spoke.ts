import { hash } from "ohash"

export const genSpokeId = (hub: string, name: string): string => hash({hub, name})
export const idForSpoke = (spoke: Spoke) => genSpokeId(spoke.hub, spoke.name)

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