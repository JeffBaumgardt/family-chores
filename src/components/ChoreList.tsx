"use client";

import { useTransition, useOptimistic } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { completeChore } from "@/app/actions/chores";
import { motion, AnimatePresence } from "framer-motion";

interface Chore {
  id: string;
  name: string;
  points: number;
  completed: boolean;
}

interface ChoreListProps {
  childId: string;
  title: string;
  chores: Chore[];
  buttonText: string;
  emoji: string;
}

export default function ChoreList({
  childId,
  title,
  chores: initialChores,
  buttonText,
  emoji,
}: ChoreListProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticChores, setOptimisticChores] = useOptimistic<
    Chore[],
    string
  >(initialChores, (state, choreId) =>
    state.map((chore) =>
      chore.id === choreId ? { ...chore, completed: true } : chore
    )
  );

  function triggerConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  async function handleChoreComplete(chore: Chore) {
    startTransition(async () => {
      // Optimistically update the UI
      setOptimisticChores(chore.id);

      const result = await completeChore(chore.id, childId);

      if (result.success) {
        triggerConfetti();
        toast.success(`Great job! You earned ${chore.points} points! 🌟`);
      } else {
        toast.error(result.error || "Oops! Something went wrong. Try again!");
        // Pass chore.id instead of array
        setOptimisticChores(chore.id);
      }
    });
  }

  const activeChores = optimisticChores.filter((chore) => !chore.completed);
  const completedChores = optimisticChores.filter((chore) => chore.completed);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <div className="space-y-4">
        <AnimatePresence>
          {activeChores.map((chore) => (
            <motion.div
              key={chore.id}
              layout
              initial={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: 20,
                transition: { duration: 0.5 },
              }}
              className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-medium">{chore.name}</h3>
                <p className="text-teal-600">{chore.points} points</p>
              </div>
              <button
                className="kid-button"
                onClick={() => handleChoreComplete(chore)}
                disabled={isPending}
              >
                {buttonText} {emoji}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {completedChores.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-600 mb-4">
              Completed Chores
            </h3>
            <div className="space-y-4">
              {completedChores.map((chore) => (
                <div
                  key={chore.id}
                  className="bg-gray-50 p-4 rounded-xl flex justify-between items-center opacity-50"
                >
                  <div>
                    <h3 className="text-xl font-medium line-through">
                      {chore.name}
                    </h3>
                    <p className="text-teal-600">
                      {chore.points} points earned!
                    </p>
                  </div>
                  <span className="text-2xl">✨</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
