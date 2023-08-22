import { Box, Button, FileInput, Footer, FormField } from "grommet"
import { useCallback, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "./app/hooks"
import { Dialog } from "./Dialog"
import { importHubs } from "./features/hubs/hubsSlice"
import { importSpokes } from "./features/spokes/spokesSlice"
import { Hub } from "./model/Hub"
import { Spoke } from "./model/Spoke"
import { Warning } from "./Warning"

export interface ImpExpFooterProps {
  showExport: boolean
}

interface Data {
  hubs: Hub[],
  spokes: Spoke[]
}

const isData = (maybe: any): maybe is Data => {
  return 'hubs' in maybe && 'spokes' in maybe
}

interface FormData {
  file: File[]
}

export const ImpExpFooter = ({ showExport }: ImpExpFooterProps) => {
  const allHubs = useAppSelector(state => state.hubs.entities)
  const allSpokes = useAppSelector(state => state.spokes.entities)
  const createExportUrl = useCallback(() => {
    const str = JSON.stringify({hubs: allHubs, spokes: allSpokes})
    const blob = new Blob([str])
    return URL.createObjectURL(blob)
  }, [allHubs, allSpokes])
  const [exportUrl, setExportUrl] = useState(createExportUrl())
  useEffect(() => setExportUrl(createExportUrl()), [createExportUrl])

  const [showImport, setShowImport] = useState(false)
  const [formData, setFormData] = useState({file: []})
  const [errorMessage, setErrorMessage] = useState('')

  const dispatch = useAppDispatch()

  return <Footer margin='medium'>
    <Dialog<FormData>
      positiveButtonText='import'
      visible={showImport}
      onDone={() => {
        setShowImport(false)
        setFormData({file: []})
      }}
      value={formData}
      onChange={setFormData}
      onSubmit={async ({ value }) => {
        const text = await value.file[0].text()
        const data = JSON.parse(text)
        if (isData(data)) {
          dispatch(importHubs(data.hubs))
          dispatch(importSpokes(data.spokes))
          setErrorMessage('')
        } else {
          setErrorMessage('File format is incorrect.')
        }
      }}
    >
      <FormField name='file' required>
        <FileInput name='file' multiple={false} />
      </FormField>
    </Dialog>
    <Box direction='column' fill='horizontal' align='center'>
      <Box fill='horizontal' direction="row" justify='center' gap='medium'>
        {showExport && <Button label="Export" href={exportUrl} download="wghub.json" />}
        <Button label="Import" onClick={() => setShowImport(true)} />
      </Box>
      {errorMessage && <Warning>{errorMessage}</Warning>}
    </Box>
  </Footer>
}