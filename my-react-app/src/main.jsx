import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Logo from './assets/CaseChatLogo.png';

function BannerBar(){
  return (
    <div id='bannerBar'>
      <img src={Logo} alt="Case Chat Logo" id='caseChatLogo'/>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <>
  <BannerBar />
  <App />
  </>
  
  // </StrictMode>,
)
