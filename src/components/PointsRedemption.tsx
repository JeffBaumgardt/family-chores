"use client";

import { useTransition, useOptimistic } from "react";
import { redeemPoints } from "@/app/actions/points";
import { toast } from "sonner";

interface RedemptionOption {
  points: number;
  label: string;
}

interface PointsRedemptionProps {
  childId: string;
  currentPoints: number;
}

const REDEMPTION_OPTIONS: RedemptionOption[] = [
  { points: 50, label: "Small Reward" },
  { points: 100, label: "Medium Reward" },
  { points: 200, label: "Big Reward" },
  { points: 500, label: "Super Reward! 🌟" },
];

export default function PointsRedemption({
  childId,
  currentPoints,
}: PointsRedemptionProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticPoints, setOptimisticPoints] = useOptimistic(
    currentPoints,
    (state, points: number) => state - points
  );

  const handleRedeem = async (points: number) => {
    startTransition(async () => {
      try {
        const result = await redeemPoints(childId, points, "Custom Reward");

        if (result.success) {
          setOptimisticPoints(points);
          toast.success("Your reward request has been sent to your parents!");
        } else {
          toast.error(result.error || "Failed to redeem points");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <section className="mt-12">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Redeem Your Points! 🎉
        </h2>
        <p className="text-gray-600 mb-6">
          Click a button to ask your parents for a reward!
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {REDEMPTION_OPTIONS.map((option) => (
            <button
              key={option.points}
              onClick={() => handleRedeem(option.points)}
              disabled={optimisticPoints < option.points || isPending}
              className={`p-4 rounded-xl text-center transition-all duration-200
                ${
                  optimisticPoints >= option.points
                    ? "bg-teal-100 hover:bg-teal-200 text-teal-800"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }
                ${isPending ? "opacity-50 cursor-wait" : ""}
                flex flex-col items-center justify-center gap-2
                min-h-[120px]`}
            >
              <span className="text-2xl font-bold">{option.points}</span>
              <span className="text-sm">{option.label}</span>
              {optimisticPoints < option.points && (
                <span className="text-xs">
                  Need {option.points - optimisticPoints} more
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
