import React from "react";

interface IProps {
  upstream: URL;
}

const WorldTool = (props: IProps): React.JSX.Element => {
  const { protocol, host, pathname } = props.upstream;

  return (
    <>
      <div style={{ height: "7rem", width: "7rem" }}>
        <img
          src={protocol + "//" + host + pathname}
          alt="Map of Reindeerland"
          style={{ objectFit: "contain", width: "100%", height: "100%" }}
        />
      </div>
      <p>TODO: Legends here.</p>
      <p>TODO: Controls here.</p>
    </>
  );
};

export default WorldTool;
