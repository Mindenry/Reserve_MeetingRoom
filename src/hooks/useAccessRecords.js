import { useState, useEffect } from "react";

export const useAccessRecords = () => {
  const [accessRecords, setAccessRecords] = useState([]);

  useEffect(() => {
    const storedRecords =
      JSON.parse(localStorage.getItem("accessRecords")) || [];
    setAccessRecords(storedRecords);
  }, []);

  const saveAccessRecords = (updatedRecords) => {
    setAccessRecords(updatedRecords);
    localStorage.setItem("accessRecords", JSON.stringify(updatedRecords));
  };

  const addAccess = (newAccess) => {
    const updatedRecords = [
      ...accessRecords,
      { ...newAccess, id: Date.now().toString() },
    ];
    saveAccessRecords(updatedRecords);
  };

  const updateAccess = (updatedAccess) => {
    const updatedRecords = accessRecords.map((record) =>
      record.id === updatedAccess.id ? updatedAccess : record
    );
    saveAccessRecords(updatedRecords);
  };

  const deleteAccess = (id) => {
    const updatedRecords = accessRecords.filter((record) => record.id !== id);
    saveAccessRecords(updatedRecords);
  };

  return { accessRecords, addAccess, updateAccess, deleteAccess };
};
