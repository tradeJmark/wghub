import { Box, Form, FormField, Layer, LayerExtendedProps, TextInput } from 'grommet'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { addArrayItem, editHub, selectCurrentHub } from './features/hubs/hubsSlice'
import { SubmitOrCancel } from './SubmitOrCancel'
import { Hub } from './model/Hub'
import { KeyOfType } from './util'

interface EditFieldDialogProps extends LayerExtendedProps {
  fieldName: keyof Hub
  fieldDisplayName: string
  placeholder?: string
  array?: boolean
  index?: number
  onCancel?(): void
  onSubmit?(): void
}

interface FormData {
  newValue?: string
}

export const EditFieldDialog = ({
  fieldName, 
  fieldDisplayName,
  placeholder,
  array,
  onCancel,
  onSubmit,
  ...props
}: EditFieldDialogProps) => {
  const [formData, setFormData] = useState<FormData>({})
  const dispatch = useAppDispatch()
  const currentHub = useAppSelector(selectCurrentHub)

  return <Layer responsive={false} {...props}>
    <Box pad='medium'>
      <Form 
        value={formData}
        onChange={newData => setFormData(newData)}
        onSubmit={({ value }) => {
          if (array) {
            const arrayName = fieldName as KeyOfType<Hub, string[]>
            dispatch(addArrayItem({hubName: currentHub.name, arrayName, arrayValue: value.newValue}))
          }
          else {
            const update = {
              id: currentHub.name,
              changes: {[fieldName]: value.newValue}
            }
            dispatch(editHub(update))
         }
          onSubmit()
        }}
      >
        <FormField label={fieldDisplayName}>
          <TextInput name="newValue" autoFocus placeholder={placeholder} defaultValue={array ? null : currentHub[fieldName]} />
        </FormField>
        <SubmitOrCancel 
            margin={{top: 'medium'}}
            onCancel={onCancel}
            submitLabel={array ? 'Add' : 'Update'}
          />
      </Form>
    </Box>
  </Layer>
}