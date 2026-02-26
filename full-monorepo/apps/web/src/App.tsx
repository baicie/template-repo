import { Button } from '@repo/ui'
import { add } from '@repo/utils'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: 20 }}>
      <h1>Web App</h1>
      <p>Using Shared UI and Utils</p>
      <p>1 + 2 = {add(1, 2)}</p>
      <div style={{ marginTop: 20 }}>
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
      </div>
    </div>
  )
}

export default App
