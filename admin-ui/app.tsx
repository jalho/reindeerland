import { Provider } from "react-redux";
import Bottom from "./components/Bottom";
import Header from "./components/Header";
import React, { FC } from "react";
import ReactDOM from "react-dom";
import store from "./state/store";
import WorldTool from "./components/WorldTool";
import { MAP_UPSTREAM } from "./constants/upstreams";

const App: FC = () => {
  return (
    <Provider store={store}>
      <Header />
      <WorldTool upstream={MAP_UPSTREAM} />
      <Bottom />
    </Provider>
  );
};
ReactDOM.render(<App />, document.querySelector("#root"));
