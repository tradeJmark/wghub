import { Box, Button, ButtonExtendedProps, Layer, ThemeContext } from "grommet";

export const FloatingActionButton = (props: ButtonExtendedProps) => {
  return <ThemeContext.Extend
    value={{
      button: {
        border: {
          radius: '1000px'
        }
      }
    }}
  >
    <Layer
      modal={false}
      plain={true}
      position='bottom-right'
      margin='medium'
      responsive={false}
    >
      <Box justify='end' align='end'>
        <Button {...props} />
      </Box>
    </Layer>
  </ThemeContext.Extend>
}