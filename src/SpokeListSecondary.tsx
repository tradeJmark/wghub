import { Box, Button, Text } from "grommet"
import { Spoke, idForSpoke } from "./model/Spoke"
import { FormView, Hide, Trash } from "grommet-icons"
import { useAppDispatch } from "./app/hooks"
import { toggleDisableSpoke, deleteSpoke } from "./features/spokes/spokesSlice"

export interface SpokeListSecondaryProps {
  spoke: Spoke
}
export const SpokeListSecondary = ({ spoke }: SpokeListSecondaryProps) => {
  const dispatch = useAppDispatch()

  return <Box direction='row' justify='between' gap='medium'>
    <Text>{spoke.ipAddress}</Text>
    <Box direction='row' gap='small'>
      <Button icon={spoke.disabled ? <FormView /> : <Hide />} pad='xxsmall' onClick={() => dispatch(toggleDisableSpoke(idForSpoke(spoke)))} />
      <Button icon={<Trash />} pad='xxsmall' onClick={() => dispatch(deleteSpoke(idForSpoke(spoke)))} />
    </Box>
  </Box>
}