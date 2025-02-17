"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@/components/icons";

interface Chore {
  id: string;
  name: string;
  points: number;
  optional: boolean;
  assignedToId?: string;
  assignedToName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Omit<Chore, 'id'>) => Promise<void>;
  onUpdate: (choreId: string, data: Partial<Chore>) => Promise<void>;
  initialValues?: Chore | null;
  kids: {
    id: string;
    name: string;
  }[];
}

export default function ChoreModal({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialValues,
  kids,
}: Props) {
  const [name, setName] = useState(initialValues?.name || "");
  const [points, setPoints] = useState(initialValues?.points?.toString() || "0");
  const [optional, setOptional] = useState(initialValues?.optional || false);
  const [assignedToId, setAssignedToId] = useState(
    initialValues?.assignedToId || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!initialValues;

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name);
      setPoints(initialValues.points.toString());
      setOptional(initialValues.optional);
      setAssignedToId(initialValues.assignedToId || "");
    } else {
      setName("");
      setPoints("0");
      setOptional(false);
      setAssignedToId("");
    }
  }, [initialValues, isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const choreData = {
        name,
        points: parseInt(points),
        optional,
        assignedToId: assignedToId || undefined,
      };

      if (isEditMode) {
        await onUpdate(initialValues!.id, choreData);
      } else {
        await onCreate(choreData);
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-lg transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-2xl font-bold text-teal-600 mb-2">
                {isEditMode ? "Edit Chore" : "Add a Chore"}
              </h3>
              <p className="text-lg text-gray-600">
                {isEditMode
                  ? "Update the chore details"
                  : "Enter the details for the new chore"}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                               focus:ring-teal-500 focus:border-transparent transition-colors"
                      placeholder="Enter chore name"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="points"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      Points
                    </label>
                    <input
                      type="number"
                      id="points"
                      value={points}
                      onChange={(e) => setPoints(e.target.value)}
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                               focus:ring-teal-500 focus:border-transparent transition-colors"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="assignedTo"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      Assign To (Optional)
                    </label>
                    <select
                      id="assignedTo"
                      value={assignedToId}
                      onChange={(e) => setAssignedToId(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 
                               focus:ring-teal-500 focus:border-transparent transition-colors"
                      disabled={isLoading}
                    >
                      <option value="">Unassigned</option>
                      {kids.map((kid) => (
                        <option key={kid.id} value={kid.id}>
                          {kid.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="optional"
                      checked={optional}
                      onChange={(e) => setOptional(e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="optional"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      This is an extra chore (optional)
                    </label>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex justify-center rounded-lg border border-gray-300
                             bg-white px-4 py-3 text-sm font-semibold text-gray-900 
                             hover:bg-gray-50 focus:outline-none focus:ring-2 
                             focus:ring-teal-500 focus:ring-offset-2 sm:mt-0"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !name.trim() || !points}
                    className="inline-flex justify-center rounded-lg bg-teal-600 px-4 py-3 
                             text-sm font-semibold text-white hover:bg-teal-700
                             focus:outline-none focus:ring-2 focus:ring-teal-500 
                             focus:ring-offset-2 disabled:opacity-50 
                             disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading
                      ? isEditMode
                        ? "Saving..."
                        : "Adding..."
                      : isEditMode
                      ? "Save Changes"
                      : "Add Chore"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 