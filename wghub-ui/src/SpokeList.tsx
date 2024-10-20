import { Box, BoxExtendedProps, Button, Heading, List, ResponsiveContext, Spinner, Text } from 'grommet'
import { Add } from 'grommet-icons'
import { useContext, useState } from 'react'
import { NewSpokeDialog } from './NewSpokeDialog'
import { SpokeListSecondary } from './SpokeListSecondary'
import { useGetSpokesForHubQuery } from './features/api'
import { Spoke } from 'wghub-frontend'
import { Serialized } from './util'

export interface SpokeListProps extends BoxExtendedProps {
  hubId: string
}

export const SpokeList = ({ hubId, ...props }: SpokeListProps) => {
  const { isLoading, data: spokes } = useGetSpokesForHubQuery(hubId)
  const [spokeToEdit, setEditSpoke] = useState<Serialized<Spoke>>(undefined)
  const [newSpokeVisible, setNewSpokeVisible] = useState(false)
  const showNewSpokeDialog = () => setNewSpokeVisible(true)
  const hideNewSpokeDialog = () => {
    setNewSpokeVisible(false)
    setEditSpoke(undefined)
  }

  const editSpoke = (spoke: Serialized<Spoke>) => {
    setEditSpoke(spoke)
    showNewSpokeDialog()
  }

  const size = useContext(ResponsiveContext)

  return <>
    <NewSpokeDialog hubId={hubId} original={spokeToEdit} visible={newSpokeVisible} onPositive={hideNewSpokeDialog} onNegative={hideNewSpokeDialog} />
    <Box {...props} gap='medium' align='center'>
      <Heading margin='none' alignSelf='center' level='3'>Spokes</Heading>
      {isLoading && <Spinner />}
      {spokes?.length > 0 ? <List<Serialized<Spoke>>
        primaryKey={spoke => <Box key={'!name ' + spoke.name} width={size === 'small' ? '100px' : undefined}><Text  truncate>{spoke.name}</Text></Box>}
        itemKey={spoke => spoke.id}
        secondaryKey={spoke => <SpokeListSecondary key={spoke.name} spoke={spoke} onEdit={editSpoke} />}
        data={spokes}
        disabled={spokes?.filter(spoke => spoke.disabled).map(spoke => spoke.id)}
      /> : (isLoading || <Text>No spokes associated with this hub.</Text>)}
      <Button 
        icon={<Add />}
        primary
        label='New Spoke'
        onClick={showNewSpokeDialog}
      />
    </Box>
  </>
}