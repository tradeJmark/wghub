import { FormField, TextInput } from "grommet"
import { useCallback, useContext, useEffect, useState } from "react"
import { setSpoke } from "./features/spokes/spokesSlice"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { Dialog, DialogProps } from "./Dialog"
import { genSpokeId, newSpoke } from "./model/Spoke"
import { ipv4RegExp } from "./util"
import { AppContext } from "./AppContext"

interface FormData {
  name: string
  ipAddress: string
  publicKey: string
}

const emptyForm: FormData = {name: '', ipAddress: '', publicKey: ''}

interface NewSpokeDialogProps extends DialogProps<FormData> {
  hubName: string
  spokeName?: string
}

export const NewSpokeDialog = ({ hubName, spokeName, onDone, ...props }: NewSpokeDialogProps)  => {
  const ctx = useContext(AppContext)
  const dispatch = useAppDispatch()
  const editing = Boolean(spokeName)
  const spoke = useAppSelector(state => state.spokes.entities[genSpokeId({hubName, spokeName})])
  const otherSpokes = useAppSelector(state => state.spokes.ids)
  const isDup = (name: string) => otherSpokes.includes(genSpokeId({spokeName: name, hubName}))
  const defaultFormData: () => FormData = useCallback(() => {
    return editing ?
      {name: spoke.name, ipAddress: spoke.ipAddress, publicKey: spoke.publicKey ?? ''}
      : emptyForm
  }, [spoke, editing])
  const [formData, setFormData] = useState<FormData>(defaultFormData())
  useEffect(() => setFormData(defaultFormData()), [defaultFormData])

  const submitData = (formData: FormData) => {
    const spoke = newSpoke(hubName, formData.name, formData.ipAddress, formData.publicKey)
    dispatch(setSpoke(ctx.server, spoke))
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
      <TextInput name='name' autoFocus autoCapitalize='off' placeholder='Human-readable name' disabled={editing} />
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