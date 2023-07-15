import { Tag, Box, Card, Heading, Paragraph, CardHeader, BoxExtendedProps, CardBody, Button } from 'grommet'
import { useState } from 'react'
import { EditFieldDialog } from './EditFieldDialog'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { removeArrayItem, selectCurrentHub } from './features/hubs/hubsSlice'
import { Add } from 'grommet-icons'
import { Hub } from './model/Hub'
import { KeyOfType } from './util'

interface EditHubData {
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

export const HubDisplay = (props: BoxExtendedProps) => {
  const [editField, _setEditField] = useState<EditHubData>(null)
  const setEditField = (name: keyof Hub, displayName: string, array=false, placeholder: string=null) => {
    _setEditField({
      fieldName: name,
      fieldDisplayName: displayName,
      placeholder,
      array
    })
  }
  const clearEditField = () => _setEditField(null)
  const currentHub = useAppSelector(selectCurrentHub)
  const dispatch = useAppDispatch()

  const HubField = ({ name, displayName, editPlaceholder }: FieldProps<KeyOfType<Hub, string>>) => {
    return <Tag
      name={displayName}
      value={currentHub[name] || '<empty>'}
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
      {currentHub[name]?.map(value => {
        return <Tag
          key={value}
          value={value}
          onRemove={() => dispatch(removeArrayItem({hubName: currentHub.name, arrayName: name, arrayValue: value}))}
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
    {editField != null && <EditFieldDialog
      fieldName={editField.fieldName}
      fieldDisplayName={editField.fieldDisplayName}
      placeholder={editField.placeholder}
      array={editField.array}
      onCancel={() => clearEditField()}
      onEsc={() => clearEditField()}
      onClickOutside={() => clearEditField()}
      onSubmit={() => clearEditField()}
    />}
    <Card pad="small" elevation='large' width='large' {...props}>
      <CardHeader>
        <Box align='center' direction='column' fill='horizontal'>
          <Heading level={2} margin={{bottom: 'none'}}>{currentHub?.name}</Heading>
          <Paragraph>{currentHub?.description}</Paragraph>
        </Box>
      </CardHeader>
      <CardBody>
        <Box align='center' gap='small'>
          <HubField name='publicKey' displayName='Public Key' />
          <HubField name='endpoint' displayName='Endpoint' editPlaceholder='<server>:<port>' />
          <HubField name='ipAddress' displayName='Hub IP Address' />
          <HubArrayField name='dnsServers' displayName='DNS Servers' />
          <HubArrayField name='searchDomains' displayName='Search Domains' />
          <HubArrayField name='allowedIPs' displayName='Allowed IPs' editPlaceholder='<network>/<mask>' />
        </Box>
      </CardBody>
    </Card>
  </>
}