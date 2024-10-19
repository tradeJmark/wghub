import { Tag, Box, Card, Heading, Paragraph, CardHeader, BoxExtendedProps, CardBody, Button, Collapsible, CardFooter, ResponsiveContext, Spinner } from 'grommet'
import { useContext, useEffect, useState } from 'react'
import { EditFieldDialog, FieldName } from './EditFieldDialog'
// import { collapseHub, deleteHub, expandHub, removeArrayItem } from './features/hubs/hubsSlice'
import { Add, Down, Download, Trash, Up } from 'grommet-icons'
import { KeyOfType, NoID, ipv4RegExpOptional, ipv4RegExpPartial } from './util'
import { SpokeList } from './SpokeList'
import { Hub, HubConfig, HubData, SpokeData, generateHubConfigFile } from 'wghub-rust-web'
import { RoundedButton, TruncatableTag } from './ui-util'
// import { getSpokesForHubSelector } from './features/spokes/spokesSlice'
import { useGetHubQuery, useUpdateHubMutation } from './features/api'

const hubSplitEndpoint = (hub: Hub): [string, string] => {
  const [address, port] = hub.endpoint?.split(":")
  return [address, port]
}

const EMPTY = []

interface HubEditData {
  fieldName?: FieldName
  fieldDisplayName?: string
  placeholder?: string
  array?: boolean
  inputValidation?: {regexp: RegExp, message?: string}
  inputFinalize?: (newValue: string) => string
}

interface FieldProps<T extends FieldName> {
  name: T
  displayName: string
  editPlaceholder?: string
  inputValidation?: {regexp: RegExp, message?: string}
  inputFinalize?: (newValue: string) => string
}

interface ArrayFieldProps extends FieldProps<KeyOfType<Hub, string[]>> {
  wrap?: boolean
}

export interface HubDisplayProps extends BoxExtendedProps {
  hubId: string
}

export const HubDisplay = ({ hubId, ...props }: HubDisplayProps) => { 
  const [editField, _setEditField] = useState<HubEditData>(null)
  const setEditField = (
    name: FieldName,
    displayName: string,
    placeholder=undefined,
    inputValidation=undefined,
    inputFinalize=undefined,
    array=false
  ) => {
    _setEditField({
      fieldName: name,
      fieldDisplayName: displayName,
      placeholder,
      array,
      inputValidation,
      inputFinalize
    })
  }
  const clearEditField = () => _setEditField(null)

  //const hub = useAppSelector(state => state.hubs.entities[hubName])
  const { isLoading, data: shub } = useGetHubQuery(hubId)
  const [updateHub] = useUpdateHubMutation()
  const hub = Hub.fromJSON(shub)
  const expanded = true//useAppSelector(state => state.hubs.expanded[hubName])
  //const spokesSelector = useMemo(getSpokesForHubSelector, [])
  //const spokes = []//useAppSelector(state => spokesSelector(state, hubName))
  //const dispatch = useAppDispatch()
  //const expand = () => dispatch(expandHub(hub.name))
  //const collapse = () => dispatch(collapseHub(hub.name))
  //const del = () => dispatch(deleteHub(ctx.server, hub.name))

  const [downloadLink, setDownloadLink] = useState<string>(null)

  useEffect(() => {
    if (Boolean(hub.endpoint) && Boolean(hub.ip_address)) {
      const [endpointAddress, endpointPort] = hubSplitEndpoint(hub)
      const hubData = new HubData(hub.public_key ?? '', hub.ip_address, endpointAddress, endpointPort)
      const spokeData = EMPTY//spokes.filter(spoke => !spoke.disabled).map(spoke => new SpokeData(spoke.ipAddress, spoke.publicKey))
      const config = new HubConfig(hub.name, hubData, spokeData)
      let blob = generateHubConfigFile(config)
      setDownloadLink(URL.createObjectURL(blob))
    }
    else setDownloadLink(null)
  }, [shub])

  const size = useContext(ResponsiveContext)

  const HubField = ({ name, displayName, editPlaceholder, inputValidation, inputFinalize }: FieldProps<NoID<KeyOfType<Hub, string>>>) => {
    return <TruncatableTag
      limit={size === 'small' ? 20 : 30}
      name={displayName}
      value={hub[name] || '<empty>'}
      onClick={() => setEditField(name, displayName, editPlaceholder, inputValidation, inputFinalize)}
    />
  }
  const HubArrayField = ({ name, displayName, editPlaceholder, inputValidation, inputFinalize, wrap }: ArrayFieldProps) => {
    return <Box
      direction='column'
      gap='small'
      align='center'
      fill='horizontal'
    >
      <Heading margin='none' alignSelf='center' level='4'>{displayName}</Heading>
      <Box direction={wrap ? 'row' : 'column'} align='center' wrap={wrap} justify='center'>
        {hub[name]?.map(value => {
          return <Box pad='xsmall' key={value}>
            <Tag
              value={value}
              onRemove={() => {
                const arr = hub[name]
                hub[name] = hub[name].filter(i => i !== value)
                updateHub(hub)
              }}
            />
          </Box>
        })}
      </Box>
      <Button 
        primary
        icon={<Add />}
        label="Add"
        onClick={() => setEditField(name, displayName, editPlaceholder, inputValidation, inputFinalize, true)}
      />
    </Box>
  }

  return <>
    <EditFieldDialog
      visible={editField != null}
      hubId={hub.id}
      fieldName={editField?.fieldName}
      fieldDisplayName={editField?.fieldDisplayName}
      placeholder={editField?.placeholder}
      array={editField?.array}
      validation={editField?.inputValidation}
      finalize={editField?.inputFinalize}
      onPositive={clearEditField}
      onNegative={clearEditField}
    />
    <Card pad="small" elevation='large' width='large' {...props}>
      { isLoading ?
        <Spinner />
        : <>
          <CardHeader>
            <Box direction='row' justify='between' fill='horizontal'>
              <Button icon={<Trash />} /*onClick={del}*/ />
              <Box align='center' direction='column' fill='horizontal'>
                <Heading level={2} margin={{bottom: 'none'}}>{hub.name}</Heading>
                <Paragraph>{hub.description}</Paragraph>
              </Box>
              <Button icon={expanded ? <Up /> : <Down />} /*onClick={expanded ? collapse : expand}*/ />
            </Box>
          </CardHeader>
          <Collapsible open={expanded}>
            <CardBody pad={{bottom: 'medium'}}>
              <Box align='center' gap='small'>
                <HubField name='public_key' displayName='Public Key' />
                <HubField
                  name='endpoint'
                  displayName='Endpoint'
                  editPlaceholder='<server>:<port>'
                  inputValidation={{
                    regexp: /^[\w.-]+:\d\d?\d?\d?$/,
                    message: 'Must specify address:port'
                  }}
                />
                <HubField
                  name='ip_address'
                  displayName='Hub IP Address'
                  inputValidation={{
                    regexp: ipv4RegExpOptional,
                    message: "Must use format x.x.x.x"
                  }}
                />
                <Box direction={size === 'small' ? 'column' : 'row'} gap='medium' justify='around' fill='horizontal' margin={{top: 'medium'}}>
                  <HubArrayField name='dns_servers' displayName='DNS Servers' inputValidation={{regexp: /^[\w.-]+$/}} />
                  <HubArrayField name='search_domains' displayName='Search Domains' inputValidation={{regexp: /^[\w.-]+$/}} />
                  <HubArrayField
                    name='allowed_ips'
                    displayName='Allowed IPs'
                    editPlaceholder='x.x.x.x/yy (default /24)'
                    inputValidation={{
                      regexp: RegExp(`^${ipv4RegExpPartial.source}(/\\d\\d?)?$`),
                      message: "Must use format x.x.x.x/yy"
                    }}
                    inputFinalize={(input) => input.includes('/') ? input : `${input}/24`}
                  />
                </Box>
                <SpokeList margin={{top: 'medium'}} hubName={hub.name} />
              </Box>
            </CardBody>
            <CardFooter justify={size === 'small' ? 'center' : 'end'}>
              <RoundedButton 
                primary
                label={size === 'small' ? 'Download' : undefined}
                icon={<Download />}
                disabled={!Boolean(downloadLink)}
                href={downloadLink || undefined}
                download={Boolean(downloadLink) ? `${hub.name}.conf` : undefined}
              />
            </CardFooter>
          </Collapsible>
        </>
      }
    </Card>
  </>
}