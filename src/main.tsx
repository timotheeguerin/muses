// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
import "./index.css";
import { animate, createAnimation } from "./lib";
// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )
const animation = createAnimation({
  height: 300,
  width: 600,
})
  .type(`import fs from "`)
  .typeWithAutoComplete("fs/", {
    completions: ["assert", "fs", "fs/promises", "node:fs", "node:fs/promises", "path", "url"],
    selectAfter: "node:fs/promises",
  })
  .type(`";\n\n`)
  .type(`const content = await fs.`)
  .typeWithAutoComplete(`read`, {
    completions: ["readFile", "read", "writeFile", "write"],
    selectAfter: "readFile",
  })
  .type(`("foo.json");`);

animate(document.getElementById("root")!, animation.build());
