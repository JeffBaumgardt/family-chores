"use client";

interface ChildHeaderProps {
  name: string;
  points: number;
}

export default function ChildHeader({ name, points }: ChildHeaderProps) {
  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-teal-600">
          Hi {name}! 👋
        </h1>
        <p className="text-xl text-gray-600">
          You have {points} points
        </p>
      </div>
      <div className="bg-teal-100 px-6 py-3 rounded-xl">
        <span className="text-2xl font-bold text-teal-600">
          {points} ⭐
        </span>
      </div>
    </header>
  );
} 