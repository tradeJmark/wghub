import { FormField, TextInput } from "grommet"
import { useContext, useState } from "react"
// import { Hub } from "./model/Hub"
// import { expandHub, newHub } from "./features/hubs/hubsSlice"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { Dialog, DialogProps } from "./Dialog"
import { useCreateHubMutation, useGetHubsQuery } from "./features/api"
import { Hub } from "wghub-rust-web"

interface FormData {
  name: string,
  description: string
}

const emptyForm = {name: '', description: ''}

export const NewHubDialog = ({ onDone, ...props }: DialogProps<FormData>) => {
  // const dispatch = useAppDispatch()
  const [formData, setFormData] = useState<FormData>(emptyForm)

  const [createHub] = useCreateHubMutation()
  const submitData = (formData: FormData) => {
    const hub = Hub.new_bare( 
      formData.name, 
      formData.description
    )
    //dispatch(expandHub(hub.name))
    createHub(hub)
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