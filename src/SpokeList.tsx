import { Box, BoxExtendedProps, Button, Heading, List, ResponsiveContext, Text } from 'grommet'
import { Spoke, idForSpoke } from './model/Spoke'
import { getSpokesForHubSelector } from './features/spokes/spokesSlice'
import { useAppSelector } from './app/hooks'
import { Add } from 'grommet-icons'
import { useContext, useMemo, useState } from 'react'
import { NewSpokeDialog } from './NewSpokeDialog'
import { SpokeListSecondary } from './SpokeListSecondary'

export interface SpokeListProps extends BoxExtendedProps {
  hubName: string
}

export const SpokeList = ({ hubName, ...props }: SpokeListProps) => {
  const spokeSelector = useMemo(getSpokesForHubSelector, [])
  const spokes = useAppSelector(state => spokeSelector(state, hubName))

  const [spokeToEdit, setEditSpoke] = useState<string>(undefined)

  const [newSpokeVisible, setNewSpokeVisible] = useState(false)
  const showNewSpokeDialog = () => setNewSpokeVisible(true)
  const hideNewSpokeDialog = () => {
    setNewSpokeVisible(false)
    setEditSpoke(undefined)
  }

  const editSpoke = (spoke: Spoke) => {
    setEditSpoke(spoke.name)
    showNewSpokeDialog()
  }

  const size = useContext(ResponsiveContext)

  return <>
    <NewSpokeDialog hubName={hubName} spokeName={spokeToEdit} visible={newSpokeVisible} onPositive={hideNewSpokeDialog} onNegative={hideNewSpokeDialog} />
    <Box {...props} gap='medium' align='center'>
      <Heading margin='none' alignSelf='center' level='3'>Spokes</Heading>
      {spokes.length > 0 ? <List<Spoke>
        primaryKey={spoke => <Box key={'!name ' + spoke.name} width={size === 'small' ? '100px' : undefined}><Text  truncate>{spoke.name}</Text></Box>}
        itemKey={idForSpoke}
        secondaryKey={spoke => <SpokeListSecondary key={spoke.name} spoke={spoke} onEdit={editSpoke} />}
        data={spokes}
        disabled={spokes.filter(spoke => spoke.disabled).map(idForSpoke)}
      /> : <Text>No spokes associated with this hub.</Text>}
      <Button 
        icon={<Add />}
        primary
        label='New Spoke'
        onClick={showNewSpokeDialog}
      />
    </Box>
  </>
}