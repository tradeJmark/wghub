import { Box, Button, Text } from "grommet"
import { Checkbox, CheckboxSelected, Download, Edit, Trash } from "grommet-icons"
import { useEffect, useState } from "react"
import { Hub, HubData, Spoke, SpokeCommonData, SpokeConfig, SpokeData, generateSpokeConfigFile } from "wghub-frontend"
import { splitAddressAndPort, Serialized } from "./util"
import { selectSingleHub, useDeleteSpokeMutation, useGetHubsQuery, useToggleSpokeDisabledMutation } from "./features/api"

export interface SpokeListSecondaryProps {
  spoke: Serialized<Spoke>
  onEdit: (spoke: Serialized<Spoke>) => void
}
export const SpokeListSecondary = ({ spoke: serSpoke, onEdit }: SpokeListSecondaryProps) => {
  const spoke = Spoke.fromJSON(serSpoke)
  const { data: hubData, isLoading: hubDataLoading } = useGetHubsQuery(undefined, selectSingleHub(spoke.hub_id))
  const [deleteSpoke] = useDeleteSpokeMutation()
  const [toggleSpokeDisabled] = useToggleSpokeDisabledMutation()
  const [downloadUrl, setDownloadUrl] = useState<string>(null)
  useEffect(() => {
    const hub = Hub.fromJSON(hubData)
    const spoke = Spoke.fromJSON(serSpoke)
    if (!hubDataLoading && Boolean(hub.public_key) && Boolean(hub.endpoint)) {
      const [endpointAddress, endpointPort] = splitAddressAndPort(hub.endpoint!)
      const hubData = new HubData(hub.public_key!, hub.ip_address ?? '', endpointAddress, endpointPort)
      const spokeData = new SpokeData(spoke.ip_address, spoke.public_key ?? '')
      const common = new SpokeCommonData(hub.dns_servers, hub.search_domains, hub.allowed_ips)
      const config = new SpokeConfig(hubData, spokeData, common)
      const blob = generateSpokeConfigFile(config)
      const address = URL.createObjectURL(blob)
      setDownloadUrl(address)
    }
    else setDownloadUrl(null)
  }, [hubData, serSpoke, hubDataLoading])

  return <Box direction='row' justify='between' gap='medium'>
    <Text>{spoke.ip_address}</Text>
    <Box direction='row' gap='small'>
      <Button
        icon={!spoke.generable() ? <Checkbox /> : <CheckboxSelected />}
        disabled={!spoke.public_key}
        pad='xxsmall'
        onClick={() => toggleSpokeDisabled({ hubId: spoke.hub_id, spokeId: spoke.id })}
      />
      <Button
        icon={<Download />}
        pad='xxsmall'
        disabled={!downloadUrl}
        href={downloadUrl || undefined}
        download={downloadUrl ? `${spoke.name}.conf` : undefined}
      />
      <Button icon={<Edit />} pad='xxsmall' onClick={() => onEdit(serSpoke)} />
      <Button icon={<Trash />} pad='xxsmall' onClick={() => deleteSpoke({ hubId: spoke.hub_id, spokeId: spoke.id })} />
    </Box>
  </Box>
}