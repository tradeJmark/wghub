import { Button, ButtonExtendedProps, ThemeContext } from "grommet";

export const RoundedButton = (props: ButtonExtendedProps) => {
  return <ThemeContext.Extend
    value={{
      button: {
        border: {
          radius: '1000px'
        }
      }
    }}
  >
    <Button {...props} />
  </ThemeContext.Extend>
}