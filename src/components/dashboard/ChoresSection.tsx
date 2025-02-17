"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon, EditIcon, TrashIcon } from "@/components/icons";
import ChoreModal from "./ChoreModal";
import { deleteChore, updateChore, createChore } from "@/app/actions/family";

interface Chore {
  id: string;
  name: string;
  points: number;
  optional: boolean;
  assignedToId?: string;
  assignedToName?: string;
}

interface Props {
  initialChores: Chore[];
  kids: {
    id: string;
    name: string;
  }[];
}

export default function ChoresSection({ initialChores, kids }: Props) {
  const [chores, setChores] = useState(initialChores);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);

  const handleDelete = async (choreId: string) => {
    if (!confirm("Are you sure you want to delete this chore?")) {
      return;
    }

    const result = await deleteChore(choreId);
    if (result.success) {
      setChores((current) => current.filter((chore) => chore.id !== choreId));
      toast.success("Chore deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete chore");
    }
  };

  const handleEdit = async (choreId: string, data: Partial<Chore>) => {
    const result = await updateChore(choreId, data);
    if (result.success && result.chore) {
      setChores((current) =>
        current.map((chore) =>
          chore.id === choreId ? { ...chore, ...result.chore } : chore
        )
      );
      setIsModalOpen(false);
      setEditingChore(null);
      toast.success("Chore updated successfully");
    } else {
      toast.error(result.error || "Failed to update chore");
    }
  };

  const handleCreate = async (data: Omit<Chore, "id">) => {
    const result = await createChore(data);
    if (result.success && result.chore) {
      setChores((current) => [...current, result.chore!]);
      setIsModalOpen(false);
      toast.success("Chore created successfully");
    } else {
      toast.error(result.error || "Failed to create chore");
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Chores</h2>
        <button
          onClick={() => {
            setEditingChore(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg 
                   hover:bg-teal-700 transition-colors font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          Add Chore
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Points
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {chores.map((chore) => (
              <tr key={chore.id}>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {chore.name}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {chore.points} points
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {chore.assignedToName || "Unassigned"}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {chore.optional ? "Extra" : "Regular"}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingChore(chore);
                        setIsModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                      aria-label="Edit chore"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(chore.id)}
                      className="text-gray-400 hover:text-gray-500"
                      aria-label="Delete chore"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {chores.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No chores added yet. Click &quot;Add Chore&quot; to get started!
        </p>
      )}

      <ChoreModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingChore(null);
        }}
        onCreate={handleCreate}
        onUpdate={handleEdit}
        initialValues={editingChore}
        kids={kids}
      />
    </section>
  );
}
