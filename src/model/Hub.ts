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