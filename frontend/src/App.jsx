import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import TicketDetail from './pages/TicketDetail.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tickets/:id" element={<TicketDetail />} />
    </Routes>
  )
}

export default App
