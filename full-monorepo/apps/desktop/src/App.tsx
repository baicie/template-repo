import { Button } from '@repo/ui'
import { add } from '@repo/utils'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: 20 }}>
      <h1>Desktop App (Electron)</h1>
      <p>Using Shared UI and Utils</p>
      <p>1 + 4 = {add(1, 4)}</p>
      <div style={{ marginTop: 20 }}>
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
      </div>
    </div>
  )
}

export default App
