import { Provider } from "react-redux";
import Bottom from "./components/Bottom";
import Header from "./components/Header";
import React, { FC } from "react";
import ReactDOM from "react-dom";
import store from "./state/store";
import WorldTool from "./components/WorldTool";

const App: FC = () => {
  return (
    <Provider store={store}>
      <Header />
      <WorldTool />
      <Bottom />
    </Provider>
  );
};
ReactDOM.render(<App />, document.querySelector("#root"));
