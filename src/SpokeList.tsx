import { Box, Button, Heading, List } from 'grommet'
import { Spoke } from './model/Spoke'
import { addSpoke, getSpokesSelectorForHub } from './features/spokes/spokesSlice'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { Add } from 'grommet-icons'
import { useState } from 'react'

export interface SpokeListProps {
  hubName: string
}

export const SpokeList = ({ hubName }: SpokeListProps) => {
  const spokes = useAppSelector(getSpokesSelectorForHub(hubName))

  const dispatch = useAppDispatch()

  const [newSpokeVisible, setNewSpokeVisible] = useState(false)
  const showNewSpokeDialog = () => setNewSpokeVisible(true)
  const hideNewSpokeDialog = () => setNewSpokeVisible(false)

  return <Box gap='medium'>
    <Heading margin='none' alignSelf='center' level='3'>Spokes</Heading>
    <List<Spoke>
      primaryKey='name'
      secondaryKey='publicKey'
      data={spokes}
    />
    <Button 
      icon={<Add />}
      primary
      label='New Spoke'
      onClick={() => {
        dispatch(addSpoke({name: 'test', hub: hubName, publicKey: 'test'}))
      }}
    />
  </Box>
}