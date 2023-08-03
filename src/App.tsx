import { grommet, Box, Grommet, Header, Page, PageContent, Text, HeaderExtendedProps, ThemeContext } from 'grommet'
import { deepMerge } from 'grommet/utils'
import { useState } from 'react';
import { useAppSelector } from './app/hooks';
import NewHubDialog from './NewHubDialog';
import { HubDisplay } from './HubDisplay';
import { Add } from 'grommet-icons';
import { FloatingActionButton } from './FloatingActionButton';
import { Warning } from './Warning';

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

const appBarTheme = {
  select: {
    background: 'white'
  }
}

const AppBar = ({children, ...props}: HeaderExtendedProps) => (
  <ThemeContext.Extend value={appBarTheme}>
    <Header
      className='appBar'
      background="brand"
      pad='small'
      elevation="medium"
      {...props}
    >
      {children}
    </Header>
  </ThemeContext.Extend>
)

function App() {
  const [newHubVisible, setNewHubVisible] = useState(false)
  const showNewHub = () => setNewHubVisible(true)
  const closeNewHub = () => setNewHubVisible(false)
  const hubNames = useAppSelector(state => state.hubs.ids.map(name => name.valueOf() as string))
  return (
    <Grommet theme={theme} full>
      <NewHubDialog
        visible={newHubVisible}
        onSubmit={closeNewHub}
        onEsc={closeNewHub}
        onCancel={closeNewHub}
        onClickOutside={closeNewHub}
      />
      <Page>
        <AppBar>
          <Text textAlign='center' size="xxlarge"><strong>WGHub</strong></Text>
        </AppBar>
        <PageContent pad='medium' align='center'>
          <Box gap='medium'>
          {hubNames.length === 0 && <Warning>No hubs available, create one to begin.</Warning>}
          {hubNames.map(hubName => {
            return <HubDisplay
              key={hubName}
              hubName={hubName}
            />
          })}
          </Box>
        </PageContent>
      </Page>
      <FloatingActionButton
        primary
        icon={<Add />}
        onClick={showNewHub}
      />
    </Grommet>
  );
}

export default App;
