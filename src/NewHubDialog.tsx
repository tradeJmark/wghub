import { Box, Form, FormField, Heading, Layer, LayerExtendedProps, TextInput } from "grommet"
import { useEffect, useState } from "react"
import { Hub } from "./model/Hub"
import { expandHub, newHub, selectIsDuplicate, submitCandidateName } from "./features/hubs/hubsSlice"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { Warning } from "./Warning"
import { SubmitOrCancel } from "./SubmitOrCancel"

export interface NewHubDialogProps extends LayerExtendedProps {
  onSubmit?(): void
  onCancel?(): void
}

interface FormData {
  name?: string,
  description?: string
  publicKey?: string
}

function NewHubDialog({ onSubmit, onCancel, ...props }: NewHubDialogProps) {
  const dispatch = useAppDispatch()
  useEffect(() => { dispatch(submitCandidateName("")); return () => {} }, [dispatch])
  const [formData, setFormData] = useState<FormData>({})
  const isNameEmpty = () => (formData.name?.length ?? 0) === 0
  const submitData = (formData: FormData) => {
    const hub: Hub = { 
      name: formData.name, 
      description: formData.description,
      publicKey: formData.publicKey ?? '--placeholder--',
      dnsServers: [],
      searchDomains: [],
      allowedIPs: []
    }
    dispatch(newHub(hub))
    dispatch(expandHub(hub.name))
    onSubmit()
  }
  const isDuplicate = useAppSelector(selectIsDuplicate)

  return (
    <Layer {...props}>
      <Box pad='medium'>
        <Heading level='3' margin={{top: 'none', bottom: 'small'}}>New Hub</Heading>
        <Form
          value={formData}
          onChange={newData => {
            dispatch(submitCandidateName(newData.name))
            setFormData(newData)
          }}
          onSubmit={({ value }) => submitData(value)}
        >
          <FormField label='Name'><TextInput name='name' autoFocus placeholder='e.g. wg0' /></FormField>
          <FormField label='Description'><TextInput name='description' placeholder='(optional)' /></FormField>
          <FormField label='Public Key'><TextInput width='medium' name='publicKey' placeholder='Leave blank for placeholder' /></FormField>
          <Warning hidden={!isDuplicate}>This name is already in use.</Warning>
          <SubmitOrCancel 
            margin={{top: 'medium'}} 
            disableSubmit={isDuplicate || isNameEmpty()}
            onCancel={onCancel}
            submitLabel='Create'
          />
        </Form>
      </Box>
    </Layer>
  )
}

export default NewHubDialog