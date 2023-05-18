import React from "react";

const WorldTool: React.FC = () => {
  return (
    <>
      <div style={{ height: "7rem", width: "7rem" }}>
        <img
          src={"http://localhost:8001"}
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
