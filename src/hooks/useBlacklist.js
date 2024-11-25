import { useState, useEffect } from "react";

export const useBlacklist = () => {
  const [blacklist, setBlacklist] = useState([]);

  useEffect(() => {
    const storedBlacklist = JSON.parse(localStorage.getItem("blacklist")) || [];
    setBlacklist(storedBlacklist);
  }, []);

  const saveBlacklist = (updatedBlacklist) => {
    setBlacklist(updatedBlacklist);
    localStorage.setItem("blacklist", JSON.stringify(updatedBlacklist));
  };

  const addBlacklist = (newBlacklist) => {
    const updatedBlacklist = [
      ...blacklist,
      { ...newBlacklist, id: Date.now().toString() },
    ];
    saveBlacklist(updatedBlacklist);
  };

  const updateBlacklist = (updatedBlacklist) => {
    const updatedList = blacklist.map((item) =>
      item.id === updatedBlacklist.id ? updatedBlacklist : item
    );
    saveBlacklist(updatedList);
  };

  const deleteBlacklist = (id) => {
    const updatedList = blacklist.filter((item) => item.id !== id);
    saveBlacklist(updatedList);
  };

  return { blacklist, addBlacklist, updateBlacklist, deleteBlacklist };
};
