import React from 'react'
import ReactDOM from 'react-dom/client'
import { Button } from '@repo/ui'
import { add } from '@repo/utils'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{ width: 300, padding: 10 }}>
      <h1>Browser Ext</h1>
      <p>1 + 5 = {add(1, 5)}</p>
      <Button>Click Me</Button>
    </div>
  </React.StrictMode>,
)
