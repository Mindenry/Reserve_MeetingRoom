import { useState, useEffect } from "react";

export const useCancellations = () => {
  const [cancellations, setCancellations] = useState([]);

  useEffect(() => {
    const storedCancellations =
      JSON.parse(localStorage.getItem("cancellations")) || [];
    setCancellations(storedCancellations);
  }, []);

  const saveCancellations = (updatedCancellations) => {
    setCancellations(updatedCancellations);
    localStorage.setItem("cancellations", JSON.stringify(updatedCancellations));
  };

  const addCancellation = (newCancellation) => {
    const updatedCancellations = [
      ...cancellations,
      { ...newCancellation, id: Date.now().toString() },
    ];
    saveCancellations(updatedCancellations);
  };

  const updateCancellation = (updatedCancellation) => {
    const updatedList = cancellations.map((item) =>
      item.id === updatedCancellation.id ? updatedCancellation : item
    );
    saveCancellations(updatedList);
  };

  const deleteCancellation = (id) => {
    const updatedList = cancellations.filter((item) => item.id !== id);
    saveCancellations(updatedList);
  };

  return {
    cancellations,
    addCancellation,
    updateCancellation,
    deleteCancellation,
  };
};
