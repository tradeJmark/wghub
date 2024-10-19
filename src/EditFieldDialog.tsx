import { FormField, TextInput } from 'grommet'
import { useCallback, useEffect, useState } from 'react'
import { KeyOfType, NoID } from './util'
import { Dialog, DialogProps } from './Dialog'
import { selectSingleHub, useGetHubsQuery, useUpdateHubMutation } from './features/api'
import { Hub } from 'wghub-rust-web'

export type FieldName = NoID<KeyOfType<Hub, string | string[]>>

interface EditFieldDialogProps extends DialogProps<FormData> {
  hubId: string,
  fieldName: FieldName
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
  hubId,
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
  const [updateHub] = useUpdateHubMutation()
  const { data: shub } = useGetHubsQuery(undefined, selectSingleHub(hubId))
  const getDefaultValue = useCallback(() => {
    const hub = Hub.fromJSON(shub)
    return {newValue: array ? '' : hub[fieldName as NoID<KeyOfType<Hub, string>>] ?? ''}
  }, [shub, fieldName, array])
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
      const hub = Hub.fromJSON(shub)
      const finalizedValue = finalize?.(value.newValue) ?? value.newValue
      if (array) {
        const arrayName = fieldName as NoID<KeyOfType<Hub, string[]>>
        hub[arrayName] = hub[arrayName].concat(finalizedValue)
        updateHub(hub)
      }
      else {
        const strFieldName = fieldName as NoID<KeyOfType<Hub, string>>
        hub[strFieldName] = finalizedValue
        updateHub(hub)
      }
    }}
    onDone={() => {
      onDone?.()
      setFormData({newValue: ''})
    }}
    {...props}
  >
    <FormField label={fieldDisplayName} name='newValue' validate={validation} required={array ? {indicator: false} : false}>
      <TextInput name='newValue' autoFocus autoCapitalize='off' placeholder={placeholder} />
    </FormField>
  </Dialog>
}