import { Box, BoxExtendedProps, Button, Heading, List, Text } from 'grommet'
import { Spoke } from './model/Spoke'
import { getSpokesSelectorForHub } from './features/spokes/spokesSlice'
import { useAppSelector } from './app/hooks'
import { Add } from 'grommet-icons'
import { useState } from 'react'
import { NewSpokeDialog } from './NewSpokeDialog'

export interface SpokeListProps extends BoxExtendedProps {
  hubName: string
}

export const SpokeList = ({ hubName, ...props }: SpokeListProps) => {
  const spokes = useAppSelector(getSpokesSelectorForHub(hubName))

  const [newSpokeVisible, setNewSpokeVisible] = useState(false)
  const showNewSpokeDialog = () => setNewSpokeVisible(true)
  const hideNewSpokeDialog = () => setNewSpokeVisible(false)

  return <>
    <NewSpokeDialog hubName={hubName} visible={newSpokeVisible} onPositive={hideNewSpokeDialog} onNegative={hideNewSpokeDialog} />
    <Box {...props} gap='medium' align='center'>
      <Heading margin='none' alignSelf='center' level='3'>Spokes</Heading>
      {spokes.length > 0 ? <List<Spoke>
        primaryKey='name'
        secondaryKey='ipAddress'
        data={spokes}
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