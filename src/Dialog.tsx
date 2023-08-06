import { Box, Button, Form, FormProps, Heading, Layer, LayerExtendedProps } from "grommet";
import React from "react";

export interface DialogProps<T> extends FormProps<T> {
  visible: boolean
  title?: string
  children?: React.ReactNode
  layerProps?: LayerExtendedProps
  onPositive?: () => void
  onNegative?: () => void
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
  positiveButtonText,
  negativeButtonText,
  ...props
}: DialogProps<T>) => {
  return visible ? <Layer onEsc={onNegative} onClickOutside={onNegative} {...layerProps}>
    <Box pad='medium'>
      {title && <Heading level='3' margin={{top: 'none', bottom: 'small'}}>{title}</Heading>}
      <Form<T> 
        onSubmit={event => {
          onSubmit(event)
          onPositive()
        }} 
        {...props}
      >
        {children}
        <Box margin={{top: 'medium'}} direction='row' justify='between'>
          <Button secondary type='button' label={negativeButtonText ?? 'Cancel'} onClick={onNegative} />
          <Button primary type='submit' label={positiveButtonText ?? 'Submit'} />
        </Box>
      </Form>
    </Box>
  </Layer> : <></>
}