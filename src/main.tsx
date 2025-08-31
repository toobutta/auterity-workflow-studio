import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import WorkflowStudioApp from './components/WorkflowStudioApp'
import './WorkflowStudioStyles.css'
import './index.css'

// Set document language for accessibility
document.documentElement.lang = 'en-US';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WorkflowStudioApp />
    </BrowserRouter>
  </React.StrictMode>,
)
