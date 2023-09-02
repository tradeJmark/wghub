import { FormField, TextInput } from "grommet"
import { useContext, useState } from "react"
import { Hub } from "./model/Hub"
import { expandHub, newHub } from "./features/hubs/hubsSlice"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { Dialog, DialogProps } from "./Dialog"
import { AppContext } from "./AppContext"

interface FormData {
  name: string,
  description: string
}

const emptyForm = {name: '', description: ''}

export const NewHubDialog = ({ onDone, ...props }: DialogProps<FormData>) => {
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState<FormData>(emptyForm)

  const ctx = useContext(AppContext)
  const submitData = (formData: FormData) => {
    const hub: Hub = { 
      name: formData.name, 
      description: formData.description,
      dnsServers: [],
      searchDomains: [],
      allowedIPs: []
    }
    dispatch(newHub(ctx.server, hub))
    dispatch(expandHub(hub.name))
  }

  const hubNames = useAppSelector(state => state.hubs.ids)
  const isDup = (name: string) => hubNames.includes(name)

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