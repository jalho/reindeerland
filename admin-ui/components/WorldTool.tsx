import React from "react";
import { Text, Figure } from "@arwes/core";
import Column from "./Column";

const WorldTool: React.FC = () => {
  return (
    <Figure src={"http://localhost:8001"} alt="Map of Reindeerland">
      <Column>
        <Text as="p">TODO: Legends here.</Text>
        <Text as="p">TODO: Controls here.</Text>
      </Column>
    </Figure>
  );
};

export default WorldTool;
