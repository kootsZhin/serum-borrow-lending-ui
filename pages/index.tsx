import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material'
import { Container } from '@mui/system'
import type { NextPage } from 'next'
import AllMarkets from '../src/AllMarkets'
import AllStats from '../src/AllStats'


const Home: NextPage = () => {
  return (
    <Container>
      <Grid container spacing={2}>
        <AllStats />
        <AllMarkets />
      </Grid>
    </Container>
  )
}

export default Home
