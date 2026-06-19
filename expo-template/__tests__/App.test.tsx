import ReactTestRenderer from 'react-test-renderer'

import App from '../App'

it('renders the starter screen', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />)
  })
})
