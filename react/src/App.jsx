import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout.jsx'
import Dashboard from './components/pages/Dashboard/Dashboard.jsx'
import NotFound from './components/pages/NotFound/NotFound.jsx'
import Articles from './components/pages/Articles/Articles.jsx'
import Focus from './components/pages/Focus/Focus.jsx'
import Forum from './components/pages/Forum/Forum.jsx'
import Progress from './components/pages/Progress/Progress.jsx'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="articles" element={<Articles />} />
          <Route path="focus" element={<Focus />} />
          <Route path="forum" element={<Forum />} />
          <Route path="progress" element={<Progress />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
