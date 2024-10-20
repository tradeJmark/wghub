import { grommet, Box, Grommet, Header, Page, PageContent, Text, HeaderExtendedProps, ThemeContext, Spinner } from 'grommet'
import { deepMerge } from 'grommet/utils'
import { useState } from 'react';
import { NewHubDialog } from './NewHubDialog';
import { HubDisplay } from './HubDisplay';
import { Add } from 'grommet-icons';
import { FloatingActionButton } from './FloatingActionButton';
import { Warning } from './Warning';
import { ImpExpFooter } from './ImpExpFooter';
import { useGetHubsQuery } from './features/api';
import { Hub } from 'wghub-frontend';

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
    },
    formField: {
        label: {
            requiredIndicator: true
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
            justify='around'
            {...props}
        >
            {children}
        </Header>
    </ThemeContext.Extend>
)

export const App = () => {
    const [newHubVisible, setNewHubVisible] = useState(false)
    const [expandedHubs, setExpandedHubs] = useState(new Set<string>())
    const expandHub = (hubId: string) => {
        const newExpandedHubs = new Set(expandedHubs)
        newExpandedHubs.add(hubId)
        setExpandedHubs(newExpandedHubs)
    }
    const collpaseHub = (hubId: string) => {
        const newExpandedHubs = new Set(expandedHubs)
        newExpandedHubs.delete(hubId)
        setExpandedHubs(newExpandedHubs)
    }
    const showNewHub = () => setNewHubVisible(true)
    const closeNewHub = () => setNewHubVisible(false)
    const { data: hubs, error, isLoading } = useGetHubsQuery()
    if (error) { console.log(error) }
    return (
        <Grommet theme={theme} full>
            <NewHubDialog
                visible={newHubVisible}
                onDone={() => {
                    closeNewHub()
                }}
                onPositive={(hubId) => expandHub(hubId)}
            />
            <Page>
                <AppBar>
                    <Text textAlign='center' size="xxlarge"><strong>WGHub</strong></Text>
                </AppBar>
                <PageContent pad='medium' align='center'>
                    <Box gap='medium'>
                        {isLoading && <Spinner />}
                        {!isLoading && hubs?.length === 0 && <Warning>No hubs available, create one to begin.</Warning>}
                        {hubs?.map(shub => {
                            const hub = Hub.fromJSON(shub)
                            return <HubDisplay
                                key={hub.id.toString()}
                                hubId={hub.id}
                                expanded={expandedHubs.has(hub.id)}
                                onExpandSet={value => {
                                    if (value) {
                                        expandHub(hub.id)
                                    }
                                    else {
                                        collpaseHub(hub.id)
                                    }
                                }}
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
            <ImpExpFooter showExport={hubs?.length > 0} />
        </Grommet>
    );
}