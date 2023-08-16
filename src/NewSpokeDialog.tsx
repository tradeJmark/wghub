import { FormField, TextInput } from "grommet"
import { useState } from "react"
import { addSpoke, submitCandidateName, getSelectIsDuplicateSpokeForHub } from "./features/spokes/spokesSlice"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { Dialog, DialogProps } from "./Dialog"
import { Spoke } from "./model/Spoke"
import { ipv4RegExp } from "./util"

interface FormData {
  name?: string,
  ipAddress?: string
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
    {...props}
  >
    <FormField label='Name' name='name' required validate={() => isDuplicateSpoke ? "This name is already in use." : undefined}>
      <TextInput name='name' autoFocus placeholder='Human-readable name' />
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
      <TextInput name='ipAddress' placeholder="x.x.x.x" />
    </FormField>
  </Dialog>
}