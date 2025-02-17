"use client";

import { EditIcon, TrashIcon } from "@/components/icons";

interface Props {
  kid: {
    id: string;
    name: string;
    points: number;
    specialCode: string;
  };
  onEdit: () => void;
  onRemove: (id: string) => void;
}

export default function KidCard({ kid, onEdit, onRemove }: Props) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
      <div>
        <h3 className="font-medium text-gray-900">{kid.name}</h3>
        <p className="text-sm text-gray-500">Code: {kid.specialCode}</p>
        <p className="text-sm text-gray-500">{kid.points} points</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Edit child"
        >
          <EditIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onRemove(kid.id)}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Remove child"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
