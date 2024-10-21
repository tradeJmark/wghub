import { Box, Button, FileInput, Footer, FormField } from "grommet"
import { Dialog } from "./Dialog"
//import { Warning } from "./Warning"
import { Hub, Spoke } from "wghub-frontend"
import {useGetHubsQuery} from "./features/api.ts";
import {useCallback, useEffect, useState} from "react";
import {Serialized} from "./util.ts";

export interface ImpExpFooterProps {
  showExport: boolean
}

/*interface Data {
  hubs: Hub[],
  spokes: Spoke[]
}*/

/*const isData = (maybe: any): maybe is Data => {
  return 'hubs' in maybe && 'spokes' in maybe
}*/

interface FormData {
  file: File[]
}

const EMPTY: Serialized<Spoke>[] = []

export const ImpExpFooter = ({ showExport }: ImpExpFooterProps) => {
  const { data: hubData } = useGetHubsQuery()
  const spokeData: Serialized<Spoke>[] = EMPTY //Just to get it to compile
  const createExportUrl = useCallback(() => {
    const allHubs = hubData?.map(Hub.fromJSON) ?? []
    const allSpokes = spokeData.map(Spoke.fromJSON)
    const str = JSON.stringify({hubs: allHubs, spokes: allSpokes})
    const blob = new Blob([str])
    return URL.createObjectURL(blob)
  }, [hubData, spokeData])
  const [exportUrl, setExportUrl] = useState(createExportUrl())
  useEffect(() => setExportUrl(createExportUrl()), [createExportUrl])

  const [showImport, setShowImport] = useState(false)
  const [formData, setFormData] = useState({file: []})
  //const [errorMessage, setErrorMessage] = useState('')

  return <Footer margin='medium'>
    <Dialog<FormData>
      positiveButtonText='import'
      visible={showImport}
      onDone={() => {
        //setShowImport(false)
        setFormData({file: []})
      }}
      value={formData}
      //onChange={setFormData}
      /*onSubmit={async ({ value }) => {
        const text = await value.file[0].text()
        const data = JSON.parse(text)
        if (isData(data)) {
          dispatch(importHubs(data.hubs))
          dispatch(importSpokes(data.spokes))
          setErrorMessage('')
        } else {
          setErrorMessage('File format is incorrect.')
        }
      }}*/
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
      {/*errorMessage && <Warning>{errorMessage}</Warning>*/}
    </Box>
  </Footer>
}