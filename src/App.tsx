import { grommet, Select, Box, Button, Grommet, Header, Page, PageContent, Text, HeaderExtendedProps} from 'grommet'
import { deepMerge } from 'grommet/utils'
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { selectHub } from './features/hubs/hubsSlice';
import NewHubDialog from './NewHubDialog';
import { HubDisplay } from './HubDisplay';

const theme = deepMerge(grommet, {
  global: {
    colors: {
      brand: '#F63400',
      focus: 'brand'
    },
    font: {
      family: "Roboto",
      size: "18px",
      height: "20px",
    }
  },
  select: {
    icons: {
      color: 'brand'
    }
  }
})

const appBarTheme = deepMerge(theme, {
  select: {
    background: 'white'
  }
})

const AppBar = ({children, ...props}: HeaderExtendedProps) => (
  <Grommet theme={appBarTheme}>
    <Header
      className='appBar'
      background="brand"
      gap='none'
      pad={{ left: "medium", right: "small", vertical: "small"}}
      elevation="medium"
      {...props}
    >
      {children}
    </Header>
  </Grommet>
)

function App() {
  const [newHubVisible, setNewHubVisible] = useState(false)
  const showNewHub = () => setNewHubVisible(true)
  const closeNewHub = () => setNewHubVisible(false)
  const selectHubNames = useAppSelector(state => state.hubs.ids)
  const currentHubName = useAppSelector(state => state.hubs.currentHubName)
  const dispatch = useAppDispatch()
  return (
    <Grommet theme={theme} full>
      {newHubVisible && <NewHubDialog 
        onSubmit={closeNewHub}
        onEsc={closeNewHub}
        onCancel={closeNewHub}
        onClickOutside={closeNewHub}
      />}
      <Page>
        <AppBar>
          <Box justify='start' direction='row' gridArea='left'>
            <Button primary color="white" label="New Hub Config" onClick={showNewHub} />
          </Box>
          <Text textAlign='center' size="xxlarge"><strong>WGHub</strong></Text>
          <Box justify='end' direction='row'>
            <Select 
              placeholder="Select a config" 
              emptySearchMessage="No configs available"
              value={currentHubName}
              options={selectHubNames}
              onChange={({ option }) => dispatch(selectHub(option))}
            />
          </Box>
        </AppBar>
        <PageContent align='center'>
          {currentHubName && <HubDisplay margin={{top: 'medium'}} />}
        </PageContent>
      </Page>
    </Grommet>
  );
}

export default App;
