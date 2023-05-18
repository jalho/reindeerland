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
    <>
      <h1>{serverName}</h1>
      <p>TODO: Stats and general information here.</p>
    </>
  );
};

export default Header;
