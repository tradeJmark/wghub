import { Box, ButtonExtendedProps, Layer } from "grommet";
import { RoundedButton } from "./ui-util";

export const FloatingActionButton = (props: ButtonExtendedProps) => {
  return <Layer
    modal={false}
    plain={true}
    position='bottom-right'
    margin='medium'
    responsive={false}
  >
    <Box justify='end' align='end'>
      <RoundedButton {...props} />
    </Box>
  </Layer>
}