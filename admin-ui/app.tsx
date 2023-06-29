import { Provider } from "react-redux";
import React, { FC } from "react";
import ReactDOM from "react-dom";
import store from "./state/store";
import Dashboard from "./components/Dashboard";

const App: FC = () => {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
};
ReactDOM.render(<App />, document.querySelector("#root"));
