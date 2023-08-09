import { FormField, TextInput } from "grommet"
import { useState } from "react"
import { addSpoke, submitCandidateName, getSelectIsDuplicateSpokeForHub } from "./features/spokes/spokesSlice"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { Dialog, DialogProps } from "./Dialog"
import { Spoke } from "./model/Spoke"

interface FormData {
  name?: string,
  ipAddress?: string
  publicKey?: string
}

interface NewSpokeDialogProps extends DialogProps<FormData> {
  hubName: string
}

export const NewSpokeDialog = ({ hubName, onDone, ...props }: NewSpokeDialogProps)  => {
  const dispatch = useAppDispatch()
  const [formData, _setFormData] = useState<FormData>({})
  const setFormData = (newtData: FormData) => {
    dispatch(submitCandidateName(newtData.name))
    _setFormData(newtData)
  }
  const submitData = (formData: FormData) => {
    const spoke: Spoke = {
      hub: hubName, 
      name: formData.name,
      publicKey: formData.publicKey ?? '--placeholder--',
      ipAddress: formData.ipAddress
    }
    dispatch(addSpoke(spoke))
  }
  const isDuplicateSpoke = useAppSelector(getSelectIsDuplicateSpokeForHub(hubName))

  return <Dialog
    title='New Spoke'
    value={formData}
    onChange={setFormData}
    onSubmit={({ value }) => submitData(value)}
    positiveButtonText="Add"
    onDone={() => {
      onDone?.()
      setFormData({})
    }}
    canSubmit={!isDuplicateSpoke}
    {...props}
  >
    <FormField label='Name'><TextInput name='name' autoFocus placeholder='Human-readable name' /></FormField>
    <FormField label='IP Address'><TextInput name='ipAddress'/></FormField>
    <FormField label='Public Key'><TextInput width='medium' name='publicKey' placeholder='Leave blank for placeholder' /></FormField>
  </Dialog>
}