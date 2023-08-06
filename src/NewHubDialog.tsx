import { FormField, TextInput } from "grommet"
import { useState } from "react"
import { Hub } from "./model/Hub"
import { expandHub, newHub, selectIsDuplicate, submitCandidateName } from "./features/hubs/hubsSlice"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { Warning } from "./Warning"
import { Dialog, DialogProps } from "./Dialog"

interface FormData {
  name?: string,
  description?: string
  publicKey?: string
}

function NewHubDialog(props: DialogProps<FormData>) {
  const dispatch = useAppDispatch()
  const [formData, _setFormData] = useState<FormData>({})
  const setFormData = (newtData: FormData) => {
    dispatch(submitCandidateName(newtData.name))
    _setFormData(newtData)
  }
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
    setFormData({})
  }
  const isDuplicate = useAppSelector(selectIsDuplicate)

  return <Dialog
    title='New Hub'
    value={formData}
    onChange={setFormData}
    onSubmit={({ value }) => submitData(value)}
    positiveButtonText="Create"
    {...props}
  >
    <FormField label='Name'><TextInput name='name' autoFocus placeholder='e.g. wg0' /></FormField>
    <FormField label='Description'><TextInput name='description' placeholder='(optional)' /></FormField>
    <FormField label='Public Key'><TextInput width='medium' name='publicKey' placeholder='Leave blank for placeholder' /></FormField>
    <Warning hidden={!isDuplicate}>This name is already in use.</Warning>
  </Dialog>
}

export default NewHubDialog