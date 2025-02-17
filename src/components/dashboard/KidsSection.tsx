"use client";

import { useState } from "react";
import { toast } from "sonner";
import AddChildModal from "./AddChildModal";
import KidCard from "./KidCard";
import { PlusIcon } from "@/components/icons";
import { addChild, removeChild, updateChild } from "@/app/actions/family";
import ConfirmModal from "./ConfirmModal";

interface Kid {
  id: string;
  name: string;
  points: number;
  specialCode: string;
}

interface Props {
  initialKids: Kid[];
}

export default function KidsSection({ initialKids }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [kids, setKids] = useState<Kid[]>(initialKids);
  const [editingKid, setEditingKid] = useState<Kid | null>(null);

  const handleAddChild = async (name: string, code: string) => {
    const result = await addChild(name, code);

    if (result.success && result.child) {
      setKids((current) => [
        {
          id: result.child?.id || "",
          name: result.child?.name || "",
          points: 0,
          specialCode: result.child?.specialCode || "",
        },
        ...current,
      ]);
      setIsModalOpen(false);
      toast.success(
        `Added ${name} to your family! Their special code is: ${result.child.specialCode}`
      );
    } else {
      toast.error(result.error || "Failed to add child");
    }
  };

  const handleRemoveChild = async (kidId: string) => {
    setSelectedKidId(kidId);
    setIsConfirmOpen(true);
  };

  const confirmRemove = async () => {
    if (!selectedKidId) return;

    const result = await removeChild(selectedKidId);
    if (result.success) {
      setKids((current) => current.filter((kid) => kid.id !== selectedKidId));
      toast.success("Child removed from family");
    } else {
      toast.error(result.error || "Failed to remove child");
    }
    setSelectedKidId(null);
  };

  const handleEditChild = async (
    kidId: string,
    data: { name: string; points?: number }
  ) => {
    const result = await updateChild(kidId, data);

    if (result.success && result.child) {
      setKids((current) =>
        current.map((kid) =>
          kid.id === kidId
            ? {
                ...kid,
                name: result.child?.name ?? kid.name,
                points: result.child?.points ?? kid.points,
              }
            : kid
        )
      );
      setIsModalOpen(false);
      setEditingKid(null);
      toast.success("Child information updated");
    } else {
      toast.error(result.error || "Failed to update child");
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Kids</h2>
        <button
          onClick={() => {
            setEditingKid(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg 
                   hover:bg-teal-700 transition-colors font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          Add Child
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kids.map((kid) => (
          <KidCard
            key={kid.id}
            kid={kid}
            onEdit={() => {
              setEditingKid(kid);
              setIsModalOpen(true);
            }}
            onRemove={handleRemoveChild}
          />
        ))}
        {kids.length === 0 && (
          <p className="text-gray-500 col-span-2 text-center py-8">
            No children added yet. Click &quot;Add Child&quot; to get started!
          </p>
        )}
      </div>

      <AddChildModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingKid(null);
        }}
        onAdd={handleAddChild}
        onEdit={handleEditChild}
        initialValues={
          editingKid
            ? {
                id: editingKid.id,
                name: editingKid.name,
              }
            : undefined
        }
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmRemove}
        title="Remove Child"
        message="Are you sure you want to remove this child from your family? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
      />
    </section>
  );
}
