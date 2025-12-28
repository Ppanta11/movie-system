import React from "react";

const isoTimeFormat = (time) => {
  if (!time) return "";

  // Handle "HH:mm" format
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default isoTimeFormat;
