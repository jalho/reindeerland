import React from "react";

const Column = (props: { children: any }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>{props.children}</div>
);

export default Column;
