import { Text } from "@arwes/core";
import Column from "./Column";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, State, getServerName } from "../state/store";

const Header: React.FC = () => {
  const serverName = useSelector((state: State) => state.serverName);
  const dispatch = useDispatch<Dispatch>();

  useEffect(() => {
    dispatch(getServerName());
  }, []);

  return (
    <Column>
      <Text as="h1">{serverName}</Text>
      <Text as="p">TODO: Stats and general information here.</Text>
    </Column>
  );
};

export default Header;
