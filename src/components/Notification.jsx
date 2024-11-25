import React from "react";

const Notification = ({ show, title, message }) => {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-sm z-50 animate-fade-in-down">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default Notification;
