import { AnimatorGeneralProvider, Animator, AnimatorGeneralProviderSettings } from "@arwes/animation";
import { ArwesThemeProvider, StylesBaseline } from "@arwes/core";
import { Provider } from "react-redux";
import Bottom from "./components/Bottom";
import Header from "./components/Header";
import React, { FC } from "react";
import ReactDOM from "react-dom";
import store from "./state/store";
import WorldTool from "./components/WorldTool";

const ROOT_FONT_FAMILY: string = '"Titillium Web", sans-serif';
const ANIMATOR_SETTINGS: AnimatorGeneralProviderSettings = { duration: { enter: 200, exit: 200 } };

const App: FC = () => {
  return (
    <Provider store={store}>
      <ArwesThemeProvider>
        <StylesBaseline styles={{ body: { fontFamily: ROOT_FONT_FAMILY } }} />
        <AnimatorGeneralProvider animator={ANIMATOR_SETTINGS}>
          <Animator animator={{ activate: true, manager: "stagger" }}>
            <Header />
            <WorldTool />
            <Bottom />
          </Animator>
        </AnimatorGeneralProvider>
      </ArwesThemeProvider>
    </Provider>
  );
};
ReactDOM.render(<App />, document.querySelector("#root"));
