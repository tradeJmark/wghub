import { Box, Button, Form, FormExtendedEvent, FormProps, Heading, Layer, LayerExtendedProps, ResponsiveContext } from "grommet";
import { useContext } from "react";

export interface DialogProps<T, R=void> extends FormProps<T> {
  visible: boolean
  title?: string
  children?: React.ReactNode
  layerProps?: LayerExtendedProps
  onSubmit?(event: FormExtendedEvent<T, Element>): R
  onPositive?: (result: R) => void
  onNegative?: () => void
  onDone?: () => void
  positiveButtonText?: string
  negativeButtonText?: string
}

export const Dialog = <T,R=void>({ 
  visible,
  title,
  layerProps,
  children,
  onPositive,
  onNegative,
  onSubmit,
  onDone,
  positiveButtonText,
  negativeButtonText,
  ...props
}: DialogProps<T, R>) => {
  const fullOnNegative = () => {
    onNegative?.()
    onDone?.()
  }
  const fullOnPositive = (res) => {
    onPositive?.(res)
    onDone?.()
  }

  const size = useContext(ResponsiveContext)

  return visible ? <Layer
    position={size === 'small' ? 'top' : 'center'}
    margin={layerProps?.responsive ?? true ? undefined : 'large'}
    onEsc={fullOnNegative}
    onClickOutside={fullOnNegative}
    {...layerProps}
  >
    <Box pad='medium'>
      {title && <Heading level='3' margin={{top: 'none', bottom: 'small'}}>{title}</Heading>}
      <Form<T>
        onSubmit={event => {
          const res = onSubmit?.(event)
          fullOnPositive(res)
        }}
        validate="change"
        {...props}
      >
        {children}
        <Box margin={{top: 'medium'}} direction='row' justify='between'>
          <Button secondary type='button' label={negativeButtonText ?? 'Cancel'} onClick={fullOnNegative} />
          <Button primary type='submit' label={positiveButtonText ?? 'Submit'} />
        </Box>
      </Form>
    </Box>
  </Layer> : <></>
}