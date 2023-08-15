import { Tag, Box, Card, Heading, Paragraph, CardHeader, BoxExtendedProps, CardBody, Button, Collapsible, CardFooter } from 'grommet'
import { useState } from 'react'
import { EditFieldDialog } from './EditFieldDialog'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { collapseHub, deleteHub, expandHub, removeArrayItem } from './features/hubs/hubsSlice'
import { Add, Down, Download, Trash, Up } from 'grommet-icons'
import { Hub } from './model/Hub'
import { KeyOfType, unzip } from './util'
import { SpokeList } from './SpokeList'
import { HubConfig, HubData, SpokeData, generateHubConfigFile } from 'wghub-rust-web'
import { getSpokesSelectorForHub } from './features/spokes/spokesSlice'
import { RoundedButton } from './ui-util'

interface HubEditData {
  fieldName?: keyof Hub
  fieldDisplayName?: string
  placeholder?: string
  array?: boolean
}

interface FieldProps<T extends keyof Hub> {
  name: T
  displayName: string
  editPlaceholder?: string
}

interface ArrayFieldProps extends FieldProps<KeyOfType<Hub, string[]>> {
  wrap?: boolean
}

export interface HubDisplayProps extends BoxExtendedProps {
  hubName: string
}

export const HubDisplay = ({ hubName, ...props }: HubDisplayProps) => {
  const [editField, _setEditField] = useState<HubEditData>(null)
  const setEditField = (name: keyof Hub, displayName: string, array=false, placeholder: string=null) => {
    _setEditField({
      fieldName: name,
      fieldDisplayName: displayName,
      placeholder,
      array
    })
  }
  const clearEditField = () => _setEditField(null)
  const hub = useAppSelector(state => state.hubs.entities[hubName])
  const validFile = useAppSelector(state => {
    const hub = state.hubs.entities[hubName]
    return Boolean(hub.endpoint) && Boolean(hub.ipAddress)
  })
  const expanded = useAppSelector(state => state.hubs.expanded[hubName])
  const spokes = useAppSelector(getSpokesSelectorForHub(hubName))
  const dispatch = useAppDispatch()
  const expand = () => dispatch(expandHub(hub.name))
  const collapse = () => dispatch(collapseHub(hub.name))
  const del = () => dispatch(deleteHub(hub.name))

  const getHubConfig = () => {
    const hubData = new HubData(hub.ipAddress, hub.endpoint.split(":").at(-1))
    const spokeData = spokes.map(spoke => new SpokeData(spoke.ipAddress, spoke.publicKey))
    const [spokeIpAddresses, spokePublicKeys] = unzip(spokeData.map(data => [data.ip_address, data.public_key]))
    return new HubConfig(hub.name, hubData, spokeIpAddresses, spokePublicKeys)
  }

  const getDownloadLink = () => {
    let blob = generateHubConfigFile(getHubConfig())
    return URL.createObjectURL(blob)
  }

  const [downloadLink, setDownloadLink] = useState<string>(validFile ? getDownloadLink() : "#")

  const updateDownloadLink = () => setDownloadLink(getDownloadLink())

  const HubField = ({ name, displayName, editPlaceholder }: FieldProps<KeyOfType<Hub, string>>) => {
    return <Tag
      name={displayName}
      value={hub[name] || '<empty>'}
      onClick={() => setEditField(name, displayName, false, editPlaceholder)}
    />
  }
  const HubArrayField = ({ name, displayName, editPlaceholder, wrap }: ArrayFieldProps) => {
    return <Box
      direction='column'
      gap='small'
      align='center'
      fill='horizontal'
    >
      <Heading margin='none' alignSelf='center' level='4'>{displayName}</Heading>
      <Box direction={wrap ? 'row' : 'column'} align='center' wrap={wrap} justify='center'>
        {hub[name]?.map(value => {
          return <Box pad='xsmall'>
            <Tag
              key={value}
              value={value}
              onRemove={() => dispatch(removeArrayItem({hubName: hub.name, arrayName: name, arrayValue: value}))}
            />
          </Box>
        })}
      </Box>
      <Button 
        primary
        icon={<Add />}
        label="Add"
        onClick={() => setEditField(name, displayName, true, editPlaceholder)}
      />
    </Box>
  }

  return <>
    <EditFieldDialog
      visible={editField != null}
      hubName={hub.name}
      fieldName={editField?.fieldName}
      fieldDisplayName={editField?.fieldDisplayName}
      placeholder={editField?.placeholder}
      array={editField?.array}
      onPositive={clearEditField}
      onNegative={clearEditField}
    />
    <Card pad="small" elevation='large' width='large' {...props}>
      <CardHeader>
        <Box direction='row' justify='between' fill='horizontal'>
          <Button icon={<Trash />} onClick={del} />
          <Box align='center' direction='column' fill='horizontal'>
            <Heading level={2} margin={{bottom: 'none'}}>{hub.name}</Heading>
            <Paragraph>{hub.description}</Paragraph>
          </Box>
          <Button icon={expanded ? <Up /> : <Down />} onClick={expanded ? collapse : expand} />
        </Box>
      </CardHeader>
      <Collapsible open={expanded}>
        <CardBody pad={{bottom: 'medium'}}>
          <Box align='center' gap='small'>
            <HubField name='publicKey' displayName='Public Key' />
            <HubField name='endpoint' displayName='Endpoint' editPlaceholder='<server>:<port>' />
            <HubField name='ipAddress' displayName='Hub IP Address' />
            <Box direction='row' justify='around' fill='horizontal' margin={{top: 'medium'}}>
              <HubArrayField name='dnsServers' displayName='DNS Servers' />
              <HubArrayField name='searchDomains' displayName='Search Domains' />
              <HubArrayField name='allowedIPs' displayName='Allowed IPs' editPlaceholder='<network>/<mask>' />
            </Box>
            <SpokeList hubName={hub.name} />
          </Box>
        </CardBody>
        <CardFooter justify='end'>
          <RoundedButton 
            primary
            download={validFile ? `${hub.name}.conf` : undefined}
            icon={<Download />}
            href={validFile ? downloadLink : undefined}
            onFocus={validFile ? updateDownloadLink : undefined}
            disabled={!validFile}
          />
        </CardFooter>
      </Collapsible>
    </Card>
  </>
}