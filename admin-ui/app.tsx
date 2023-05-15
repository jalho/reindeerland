import React, { FC, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { AnimatorGeneralProvider, Animator, AnimatorGeneralProviderSettings } from "@arwes/animation";
import { ArwesThemeProvider, StylesBaseline, Text, Figure } from "@arwes/core";
import DataLoader from "./components/DataLoader";
import Column from "./components/Column";

const ROOT_FONT_FAMILY: string = '"Titillium Web", sans-serif';
const ANIMATOR_SETTINGS: AnimatorGeneralProviderSettings = { duration: { enter: 200, exit: 200 } };

const App: FC = () => {
  const [objectUrl, setObjectUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const [active, setActive] = useState(true);
  return (
    <ArwesThemeProvider>
      <StylesBaseline styles={{ body: { fontFamily: ROOT_FONT_FAMILY } }} />
      <AnimatorGeneralProvider animator={ANIMATOR_SETTINGS}>
        <Animator animator={{ activate: active, manager: "stagger" }}>
          <Column>
            <Text as="h1">Reindeerland Weekly</Text>
            <Text as="p">TODO: Stats and general information here.</Text>
          </Column>
          <DataLoader
            state={{
              data: {
                state: objectUrl,
                setState: setObjectUrl,
              },
              loading: {
                state: loading,
                setState: setLoading,
              },
              error: {
                state: error,
                setState: setError,
              },
            }}
          >
            <Figure src={objectUrl} alt="Map of Reindeerland">
              <Column>
                <Text as="p">TODO: Legends here.</Text>
                <Text as="p">TODO: Controls here.</Text>
              </Column>
            </Figure>
          </DataLoader>
          <Text as="p">TODO: Details about players here.</Text>
        </Animator>
      </AnimatorGeneralProvider>
    </ArwesThemeProvider>
  );
};
ReactDOM.render(<App />, document.querySelector("#root"));
