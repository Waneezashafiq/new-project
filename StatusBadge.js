import React from "react";

export default function StatusBadge({ status }) {
  const styles = {
    Active: "um-badge-active",
    Inactive: "um-badge-inactive",
    Deleted: "um-badge-deleted",
  };
  return <span className={styles[status] || "um-badge"}>{status}</span>;
}
