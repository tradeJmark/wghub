import { Tag, Box, Card, Heading, Paragraph, CardHeader, BoxExtendedProps, CardBody, Button, Collapsible } from 'grommet'
import { useState } from 'react'
import { EditFieldDialog } from './EditFieldDialog'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { collapseHub, deleteHub, expandHub, removeArrayItem } from './features/hubs/hubsSlice'
import { Add, Down, Trash, Up } from 'grommet-icons'
import { Hub } from './model/Hub'
import { KeyOfType, unzip } from './util'
import { SpokeList } from './SpokeList'
import { HubConfig, HubData, SpokeData, presentHubConfigFile } from 'wghub-rust-web/wghub_rust_web'
import { getSpokesSelectorForHub } from './features/spokes/spokesSlice'

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
  const expanded = useAppSelector(state => state.hubs.expanded[hub.name])
  const spokes = useAppSelector(getSpokesSelectorForHub(hub.name))
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

  const HubField = ({ name, displayName, editPlaceholder }: FieldProps<KeyOfType<Hub, string>>) => {
    return <Tag
      name={displayName}
      value={hub[name] || '<empty>'}
      onClick={() => setEditField(name, displayName, false, editPlaceholder)}
    />
  }
  const HubArrayField = ({ name, displayName, editPlaceholder }: FieldProps<KeyOfType<Hub, string[]>>) => {
    return <Box
      direction='column'
      gap='small'
      align='center'
    >
      <Heading margin='none' alignSelf='center' level='4'>{displayName}</Heading>
      {hub[name]?.map(value => {
        return <Tag
          key={value}
          value={value}
          onRemove={() => dispatch(removeArrayItem({hubName: hub.name, arrayName: name, arrayValue: value}))}
        />
      })}
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
            <Heading level={2} margin={{bottom: 'none'}} onClick={() => presentHubConfigFile(getHubConfig())}>{hub.name}</Heading>
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
            <HubArrayField name='dnsServers' displayName='DNS Servers' />
            <HubArrayField name='searchDomains' displayName='Search Domains' />
            <HubArrayField name='allowedIPs' displayName='Allowed IPs' editPlaceholder='<network>/<mask>' />
            <SpokeList hubName={hub.name} />
          </Box>
        </CardBody>
      </Collapsible>
    </Card>
  </>
}