import { Button, ButtonExtendedProps, Tag, TagExtendedProps, ThemeContext } from "grommet";

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

export interface TruncatableTagProps extends TagExtendedProps {
  limit: number
  truncate?: boolean
}
export const TruncatableTag = ({limit, truncate, value, ...props}: TruncatableTagProps) => {
  const origValue = value.toString()
  let preparedValue = origValue.slice(0, limit)
  if (origValue.length > limit) preparedValue = preparedValue + '...'
  const trunc = truncate ?? true
  return <Tag value={trunc ? preparedValue : origValue} {...props} />
}