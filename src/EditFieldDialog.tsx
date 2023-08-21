import { FormField, TextInput } from 'grommet'
import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { addArrayItem, editHub } from './features/hubs/hubsSlice'
import { Hub } from './model/Hub'
import { KeyOfType } from './util'
import { Dialog, DialogProps } from './Dialog'

interface EditFieldDialogProps extends DialogProps<FormData> {
  hubName: string,
  fieldName: keyof Hub
  fieldDisplayName: string
  placeholder?: string
  array?: boolean
  validation?: { regexp: RegExp, message?: string }
  finalize?: (newValue: string) => string
}

interface FormData {
  newValue: string
}

export const EditFieldDialog = ({
  hubName,
  fieldName, 
  fieldDisplayName,
  placeholder,
  array,
  layerProps,
  onDone,
  validation,
  finalize,
  ...props
}: EditFieldDialogProps) => {
  const dispatch = useAppDispatch()
  const hub = useAppSelector(state => state.hubs.entities[hubName])
  const getDefaultValue = useCallback(() => ({newValue: array ? '' : hub[fieldName as KeyOfType<Hub, string>] ?? ''}), [hub, fieldName, array])
  const [formData, setFormData] = useState<FormData>(getDefaultValue())
  useEffect(() => {
    setFormData(getDefaultValue())
  }, [getDefaultValue])

  return <Dialog 
    layerProps={{responsive: false, ...layerProps}}
    value={formData}
    onChange={setFormData}
    validate='submit'
    positiveButtonText={array ? 'Add' : 'Update'}
    onSubmit={({ value }) => {
      const finalizedValue = finalize?.(value.newValue) ?? value.newValue
      if (array) {
        const arrayName = fieldName as KeyOfType<Hub, string[]>
        dispatch(addArrayItem({hubName: hub.name, arrayName, arrayValue: finalizedValue}))
      }
      else {
        const update = {
          id: hub.name,
          changes: {[fieldName]: finalizedValue}
        }
        dispatch(editHub(update))
      }
    }}
    onDone={() => {
      onDone?.()
      setFormData({newValue: ''})
    }}
    {...props}
  >
    <FormField label={fieldDisplayName} name='newValue' validate={validation} required={array ? {indicator: false} : false}>
      <TextInput name='newValue' autoFocus placeholder={placeholder} />
    </FormField>
  </Dialog>
}