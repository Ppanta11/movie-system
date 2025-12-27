import React from 'react'

const isoTimeFormat = (dateTime) => {
    const date = new Date(dateTime);
    const localTime = date.toLocaleTimeString('en-US',{
        hour: '2-digit',
        minutes:'2digits',
        hour12: true,
    });
  return localTime;
}

export default isoTimeFormat