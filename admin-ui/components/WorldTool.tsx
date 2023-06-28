import React from "react";

interface IProps {
  upstream: URL;
}

// TODO: remove these
const banditCamp = [850, 67, -1119.4] as const;
const [x, z, y] = banditCamp;

const WorldTool = (props: IProps): React.JSX.Element => {
  const { protocol, host, pathname } = props.upstream;

  return (
    <>
      <div style={{ width: "100%", position: "relative" }}>
        <img
          src={protocol + "//" + host + pathname}
          alt="Map of Reindeerland"
          style={{ width: "100%", position: "absolute" }}
        />
        <div
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            backgroundColor: "red",
          }}
        />
      </div>
      <p>TODO: Legends here.</p>
      <p>TODO: Controls here.</p>
    </>
  );
};

export default WorldTool;
