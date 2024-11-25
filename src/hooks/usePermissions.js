import { useState, useEffect } from "react";

export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const storedPermissions =
      JSON.parse(localStorage.getItem("permissions")) || [];
    setPermissions(storedPermissions);
  }, []);

  const savePermissions = (updatedPermissions) => {
    setPermissions(updatedPermissions);
    localStorage.setItem("permissions", JSON.stringify(updatedPermissions));
  };

  const addPermission = (newPermission) => {
    const updatedPermissions = [...permissions, newPermission];
    savePermissions(updatedPermissions);
  };

  const updatePermission = (updatedPermission) => {
    const updatedList = permissions.map((item) =>
      item.role === updatedPermission.role ? updatedPermission : item
    );
    savePermissions(updatedList);
  };

  const deletePermission = (role) => {
    const updatedList = permissions.filter((item) => item.role !== role);
    savePermissions(updatedList);
  };

  return { permissions, addPermission, updatePermission, deletePermission };
};
