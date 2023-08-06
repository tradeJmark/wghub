import { FormField, TextInput } from 'grommet'
import { useState } from 'react'
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
}

interface FormData {
  newValue?: string
}

export const EditFieldDialog = ({
  hubName,
  fieldName, 
  fieldDisplayName,
  placeholder,
  array,
  layerProps,
  ...props
}: EditFieldDialogProps) => {
  const [formData, setFormData] = useState<FormData>({})
  const dispatch = useAppDispatch()
  const hub = useAppSelector(state => state.hubs.entities[hubName])

  return <Dialog 
    layerProps={{responsive: false, ...layerProps}}
    value={formData}
    onChange={setFormData}
    positiveButtonText={array ? 'Add' : 'Update'}
    onSubmit={({ value }) => {
      if (array) {
        const arrayName = fieldName as KeyOfType<Hub, string[]>
        dispatch(addArrayItem({hubName: hub.name, arrayName, arrayValue: value.newValue}))
      }
      else {
        const update = {
          id: hub.name,
          changes: {[fieldName]: value.newValue}
        }
        dispatch(editHub(update))
        setFormData({})
      }
    }}
    {...props}
  >
    <FormField label={fieldDisplayName}>
      <TextInput name="newValue" autoFocus placeholder={placeholder} defaultValue={array ? null : hub[fieldName]} />
    </FormField>
  </Dialog>
}