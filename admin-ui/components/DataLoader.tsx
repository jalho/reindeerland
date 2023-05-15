import { LoadingBars } from "@arwes/core";
import React from "react";
import { useEffect, useState } from "react";

export type TState = Record<
  "data" | "loading" | "error",
  {
    state: any;
    setState: any;
  }
>;

async function fetchBlob(url: URL, state: TState): Promise<void> {
  const res = await fetch(url);
  state.loading.setState(false);
  if (res.status !== 200) state.error.setState(new Error(res.statusText));
  const blob = await res.blob();
  state.data.setState(URL.createObjectURL(blob));
}

function useData(url: URL, state: TState): TState {
  useEffect(() => {
    fetchBlob(url, state);
  }, []);

  return state;
}

interface IDataLoader {
  children: JSX.Element;
  state: TState;
}

const DataLoader = (props: IDataLoader): JSX.Element | null => {
  const state = useData(new URL("http://localhost:8001/map"), props.state);
  const { state: data } = state.data;
  const { state: loading } = state.loading;
  const { state: error } = state.error;

  if (loading) return <LoadingBars animator={{ activate: true }} />;
  if (error) return <p>{error.message}</p>;
  if (data) return props.children;

  return null;
};

export default DataLoader;
