import React from 'react'
import { render } from 'react-dom'
import ARGS from '../args'
import { create } from '../stores/about'
import { Main } from '../components/main'
import { PrintContainer } from '../components/print'
import { intl } from '../actions'
import win from '../window'

export const store = create()
const { locale } = ARGS

store
  .dispatch(intl.load({ locale }))
  .then(() => {
    render(
      <Main store={store} window={win}>
        <PrintContainer/>
      </Main>,
      document.getElementById('main'))
  })
