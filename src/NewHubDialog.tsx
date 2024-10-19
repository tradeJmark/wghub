import { FormField, TextInput } from "grommet"
import { useState } from "react"
import { Dialog, DialogProps } from "./Dialog"
import { useCreateHubMutation, useGetHubsQuery } from "./features/api"
import { Hub } from "wghub-rust-web"

interface FormData {
  name: string,
  description: string
}

const emptyForm = {name: '', description: ''}

export const NewHubDialog = ({ onDone, ...props }: DialogProps<FormData, string>) => {
  const [formData, setFormData] = useState<FormData>(emptyForm)

  const [createHub] = useCreateHubMutation()
  const submitData = (formData: FormData) => {
    const hub = Hub.new_bare( 
      formData.name, 
      formData.description
    )
    createHub(hub)
    return hub.id
  }

  //const hubNames = useAppSelector(state => state.hubs.ids)
  const { data } = useGetHubsQuery()
  const hubNames = data?.map(hub => hub.name)
  const isDup = (name: string) => hubNames?.includes(name)

  return <Dialog
    title='New Hub'
    value={formData}
    onChange={setFormData}
    onSubmit={({ value }) => submitData(value)}
    positiveButtonText='Create'
    onDone={() => {
      onDone?.()
      setFormData(emptyForm)
    }}
    {...props}
  >
    <FormField
      required
      label='Name'
      name='name'
      validate={() => isDup(formData.name) ? "This name is already in use." : undefined}
    >
      <TextInput name='name' autoFocus autoCapitalize='off' placeholder='e.g. wg0' />
    </FormField>
    <FormField label='Description' name='description'><TextInput name='description' placeholder='(optional)' /></FormField>
  </Dialog>
}