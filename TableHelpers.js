import React from "react";

export function Th({ label, onClick, active, dir }) {
  return (
    <th>
      <button onClick={onClick}>
        {label} {active && (dir === "asc" ? "▲" : "▼")}
      </button>
    </th>
  );
}

export function Info({ label, value }) {
  return (
    <div>
      <div>{label}</div>
      <div>{value || "—"}</div>
    </div>
  );
}
