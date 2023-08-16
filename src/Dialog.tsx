import { Box, Button, Form, FormProps, Heading, Layer, LayerExtendedProps } from "grommet";

export interface DialogProps<T> extends FormProps<T> {
  visible: boolean
  title?: string
  children?: React.ReactNode
  layerProps?: LayerExtendedProps
  onPositive?: () => void
  onNegative?: () => void
  onDone?: () => void
  positiveButtonText?: string
  negativeButtonText?: string
}

export const Dialog = <T,>({ 
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
}: DialogProps<T>) => {
  const fullOnNegative = () => {
    onNegative?.()
    onDone?.()
  }
  const fullOnPositive = () => {
    onPositive?.()
    onDone?.()
  }

  return visible ? <Layer onEsc={fullOnNegative} onClickOutside={fullOnNegative} {...layerProps}>
    <Box pad='medium'>
      {title && <Heading level='3' margin={{top: 'none', bottom: 'small'}}>{title}</Heading>}
      <Form<T>
        onSubmit={event => {
          onSubmit?.(event)
          fullOnPositive()
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