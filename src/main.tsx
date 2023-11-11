// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
import './index.css'
import { animate, createAnimation } from './lib'

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )
const animation = createAnimation({
  height: 300,
  width: 600,
}).type(`import foo from "bar";`);

animate(document.getElementById('root')!, animation.build());