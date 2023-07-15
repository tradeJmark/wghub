import { Box, BoxExtendedProps, Button } from 'grommet'

interface SubmitOrCancelProps extends BoxExtendedProps {
  disableSubmit?: boolean
  onCancel?(): void
  cancelLabel?: string
  submitLabel?: string
}

export const SubmitOrCancel = ({
    disableSubmit,
    onCancel,
    cancelLabel,
    submitLabel,
    ...props
  }: SubmitOrCancelProps) => {
  return <Box {...props} direction='row' justify='between'>
    <Button secondary type='button' label={cancelLabel ?? 'Cancel'} onClick={onCancel} />
    <Button primary disabled={disableSubmit} type='submit' label={submitLabel ?? 'Submit'} />
  </Box>
}