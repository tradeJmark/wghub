import { Box, Button, Text } from "grommet"
import { Spoke, idForSpoke } from "./model/Spoke"
import { Checkbox, CheckboxSelected, Download, Edit, Trash } from "grommet-icons"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { toggleDisableSpoke, deleteSpoke } from "./features/spokes/spokesSlice"
import { useEffect, useState } from "react"
import { HubData, SpokeCommonData, SpokeConfig, SpokeData, generateSpokeConfigFile } from "wghub-rust-web"
import { hubSplitEndpoint } from "./model/Hub"

export interface SpokeListSecondaryProps {
  spoke: Spoke
  onEdit: (spoke: Spoke) => void
}
export const SpokeListSecondary = ({ spoke, onEdit }: SpokeListSecondaryProps) => {
  const dispatch = useAppDispatch()
  const hub = useAppSelector(state => state.hubs.entities[spoke.hub])
  const [downloadUrl, setDownloadUrl] = useState<string>(null)
  useEffect(() => {
    if (Boolean(hub.publicKey) && Boolean(hub.endpoint)) {
      const [endpointAddress, endpointPort] = hubSplitEndpoint(hub)
      const hubData = new HubData(hub.publicKey, hub.ipAddress ?? '', endpointAddress, endpointPort)
      const spokeData = new SpokeData(spoke.ipAddress, spoke.publicKey ?? '')
      const common = new SpokeCommonData(hub.dnsServers, hub.searchDomains, hub.allowedIPs)
      const config = new SpokeConfig(hubData, spokeData, common)
      const blob = generateSpokeConfigFile(config)
      const address = URL.createObjectURL(blob)
      setDownloadUrl(address)
    } else setDownloadUrl(null)
  }, [hub, spoke])

  return <Box direction='row' justify='between' gap='medium'>
    <Text>{spoke.ipAddress}</Text>
    <Box direction='row' gap='small'>
      <Button
        icon={spoke.disabled || !Boolean(spoke.publicKey) ? <Checkbox /> : <CheckboxSelected />}
        disabled={!Boolean(spoke.publicKey)}
        pad='xxsmall'
        onClick={() => dispatch(toggleDisableSpoke(idForSpoke(spoke)))}
      />
      <Button
        icon={<Download />}
        pad='xxsmall'
        disabled={!Boolean(downloadUrl)}
        href={Boolean(downloadUrl) ? downloadUrl : undefined}
        download={Boolean(downloadUrl) ? `${spoke.name}.conf` : undefined}
      />
      <Button icon={<Edit />} pad='xxsmall' onClick={() => onEdit(spoke)} />
      <Button icon={<Trash />} pad='xxsmall' onClick={() => dispatch(deleteSpoke(idForSpoke(spoke)))} />
    </Box>
  </Box>
}