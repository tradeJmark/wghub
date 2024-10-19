import { FormField, TextInput } from "grommet"
import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogProps } from "./Dialog"
import { ipv4RegExp, Serialized } from "./util"
import { useCreateSpokeMutation, useGetSpokesForHubQuery, useUpdateSpokeMutation } from "./features/api"
import { Spoke } from "wghub-rust-web"

interface FormData {
  name: string
  ipAddress: string
  publicKey: string
}

const emptyForm: FormData = {name: '', ipAddress: '', publicKey: ''}

interface NewSpokeDialogProps extends DialogProps<FormData> {
  hubId: string
  original?: Serialized<Spoke>
}

export const NewSpokeDialog = ({ hubId, original, onDone, ...props }: NewSpokeDialogProps)  => {
  const editing = Boolean(original)
  const spoke = editing ? Spoke.fromJSON(original) : undefined
  const { data: otherSpokesData, isLoading: otherSpokesLoading } = useGetSpokesForHubQuery(hubId)
  let otherSpokes = !otherSpokesLoading ? otherSpokesData.map(Spoke.fromJSON) : []
  if (editing) otherSpokes = otherSpokes.filter(s => s.id !== spoke.id)
  const [createSpoke] = useCreateSpokeMutation()
  const [updateSpoke] = useUpdateSpokeMutation()
  const isDup = (name: string) => otherSpokes.some(s => s.name === name)
  const defaultFormData: FormData = useMemo(() => editing ? {
    name: original.name,
    ipAddress: original.ip_address,
    publicKey: original.public_key ?? ''
  } : emptyForm, [original, editing])
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  useEffect(() => setFormData(defaultFormData), [defaultFormData])

  const submitData = (formData: FormData) => {
    if (editing) {
      spoke.name = formData.name
      spoke.ip_address = formData.ipAddress
      spoke.public_key = formData.publicKey
      updateSpoke(spoke)
    }
    else {
      const newSpoke = Spoke.newUnbound(formData.name, formData.ipAddress, formData.publicKey, false)
      createSpoke({ hubId, spoke: newSpoke })
    }
  }

  return <Dialog
    title={`${editing ? 'Edit' : 'New'} Spoke`}
    value={formData}
    onChange={setFormData}
    onSubmit={({ value }) => submitData(value)}
    positiveButtonText={editing ? "Update" : "Add"}
    onDone={() => {
      onDone?.()
      setFormData(emptyForm)
    }}
    {...props}
  >
    <FormField label='Name' name='name' required validate={() => isDup(formData.name) ? "This name is already in use." : undefined}>
      <TextInput name='name' autoFocus autoCapitalize='off' placeholder='Human-readable name' />
    </FormField>
    <FormField
      label='IP Address'
      name='ipAddress'
      required
      validate={{
        regexp: ipv4RegExp,
        message: "Must be in format x.x.x.x"
      }}
      validateOn="blur"
    >
      <TextInput name='ipAddress' autoCapitalize='off' placeholder="x.x.x.x" />
    </FormField>
    <FormField name='publicKey' label='Public Key'>
      <TextInput name='publicKey' autoCapitalize='off' placeholder='(or specify later)' />
    </FormField>
  </Dialog>
}