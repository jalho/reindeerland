import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, State, connectUpstream } from "../state/store";
import { IConnectUpstreamCredentials } from "../state/Upstream";

const Login = (): React.JSX.Element => {
  const dispatch = useDispatch<Dispatch>();

  // TODO: get as user input
  const credentials: IConnectUpstreamCredentials = {
    password: "bar",
    username: "foo",
  };

  // TODO: dispatch when user has provided credentials
  useEffect(() => {
    dispatch(connectUpstream(credentials));
  }, []);

  return <>TODO: Login view here.</>;
};

export default Login;
