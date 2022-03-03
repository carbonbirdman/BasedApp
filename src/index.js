import { StrictMode } from "react";
import ReactDOM from "react-dom";

import App from "./App_injected.js";

//const rootElement = document.getElementById("root");
//ReactDOM.render(
// <StrictMode>
//   <App />
// </StrictMode>,
// rootElement
//);
ReactDOM.render(<App />, document.getElementById("root"));
