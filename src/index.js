import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import ATE from "./components/AsyncTableExample";
import Search from "./components/SearchExample";
import store from "./store";

import "./styles.css";

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <div className="header-container">
          <Search />
        </div>

        <div className="app-container">
          <div className="grid-container">
            <ATE />
          </div>
        </div>
      </div>
    </Provider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
