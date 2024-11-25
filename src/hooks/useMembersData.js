import { useState, useEffect } from "react";

export const useMembersData = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const storedMembers = JSON.parse(localStorage.getItem("members")) || [];
    setMembers(storedMembers);
  }, []);

  const saveMembers = (updatedMembers) => {
    setMembers(updatedMembers);
    localStorage.setItem("members", JSON.stringify(updatedMembers));
  };

  const addMember = (newMember) => {
    const updatedMembers = [
      ...members,
      { ...newMember, id: Date.now().toString() },
    ];
    saveMembers(updatedMembers);
  };

  const updateMember = (updatedMember) => {
    const updatedMembers = members.map((member) =>
      member.id === updatedMember.id ? updatedMember : member
    );
    saveMembers(updatedMembers);
  };

  const deleteMember = (id) => {
    const updatedMembers = members.filter((member) => member.id !== id);
    saveMembers(updatedMembers);
  };

  return { members, addMember, updateMember, deleteMember };
};
