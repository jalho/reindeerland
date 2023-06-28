import { Provider } from "react-redux";
import React, { FC } from "react";
import ReactDOM from "react-dom";
import store from "./state/store";
import RestrictedView from "./components/RestrictedView";

const App: FC = () => {
  return (
    <Provider store={store}>
      <RestrictedView />
    </Provider>
  );
};
ReactDOM.render(<App />, document.querySelector("#root"));
