import { Box, Button, Heading, List } from 'grommet'
import { Spoke } from './model/Spoke'
import { getSpokesSelectorForHub } from './features/spokes/spokesSlice'
import { useAppSelector } from './app/hooks'
import { Add } from 'grommet-icons'
import { useState } from 'react'
import { NewSpokeDialog } from './NewSpokeDialog'

export interface SpokeListProps {
  hubName: string
}

export const SpokeList = ({ hubName }: SpokeListProps) => {
  const spokes = useAppSelector(getSpokesSelectorForHub(hubName))

  const [newSpokeVisible, setNewSpokeVisible] = useState(false)
  const showNewSpokeDialog = () => setNewSpokeVisible(true)
  const hideNewSpokeDialog = () => setNewSpokeVisible(false)

  return <>
    <NewSpokeDialog hubName={hubName} visible={newSpokeVisible} onPositive={hideNewSpokeDialog} onNegative={hideNewSpokeDialog} />
    <Box gap='medium'>
      <Heading margin='none' alignSelf='center' level='3'>Spokes</Heading>
      <List<Spoke>
        primaryKey='name'
        secondaryKey='ipAddress'
        data={spokes}
      />
      <Button 
        icon={<Add />}
        primary
        label='New Spoke'
        onClick={showNewSpokeDialog}
      />
    </Box>
  </>
}