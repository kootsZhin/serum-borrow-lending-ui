import { Stack, Box } from '@mui/material'
import { Container } from '@mui/system'
import type { NextPage } from 'next'
import Statistics from '../src/components/Statistics'
import Markets from '../src/components/Markets'


const Home: NextPage = () => {

  return (
    <Container  >
      <Box style={{ background: '#f2f6fc' }}>
        <Stack spacing={2}>
          <Statistics />
          <Markets />
        </Stack>
      </Box>
    </Container>
  )
}

export default Home
