export interface Hub {
  name: string
  description?: string
  publicKey?: string
  endpoint?: string
  ipAddress?: string
  dnsServers: string[]
  searchDomains: string[]
  allowedIPs: string[]
}

export const hubSplitEndpoint = (hub: Hub): [string, string] => {
  const [address, port] = hub.endpoint?.split(":")
  return [address, port]
}

export const newHub = (name: string, description?: string): Hub => ({name, description, dnsServers: [], searchDomains: [], allowedIPs: []})