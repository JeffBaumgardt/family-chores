"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, RefreshIcon } from "@/components/icons";
import { generateCodeName } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, code: string) => Promise<void>;
  onEdit?: (
    kidId: string,
    data: { name: string; points?: number }
  ) => Promise<void>;
  initialValues?: {
    id: string;
    name: string;
    points?: number;
  };
}

export default function AddChildModal({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  initialValues,
}: Props) {
  const [name, setName] = useState(initialValues?.name || "");
  const [points, setPoints] = useState(
    initialValues?.points?.toString() || "0"
  );
  const [specialCode, setSpecialCode] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customCode, setCustomCode] = useState(false);
  const isEditMode = !!initialValues;

  useEffect(() => {
    if (isOpen && !isEditMode) {
      generateNewSuggestions();
    }
  }, [isOpen, isEditMode]);

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name);
      setPoints(initialValues.points?.toString() || "0");
    } else {
      setName("");
      setPoints("0");
      setSpecialCode("");
    }
  }, [initialValues, isOpen]);

  function generateNewSuggestions() {
    setSuggestions(generateCodeName(3));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditMode && initialValues && onEdit) {
        await onEdit(initialValues.id, {
          name,
          points: parseInt(points) || 0,
        });
      } else {
        await onAdd(name, specialCode);
      }
      setName("");
      setPoints("0");
      setSpecialCode("");
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
                {isEditMode ? "Edit Child" : "Add a Child"}
              </h3>
              <p className="text-lg text-gray-600">
                {isEditMode
                  ? "Update your child's information"
                  : "Enter your child's name and pick a special code for them to log in with"}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      Child&apos;s Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 
                               focus:border-transparent transition-colors bg-white text-gray-900 shadow-sm
                               placeholder:text-gray-400"
                      placeholder="Enter your child's name"
                      required
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  {isEditMode && (
                    <div>
                      <label
                        htmlFor="points"
                        className="block text-sm font-semibold text-gray-700 mb-1"
                      >
                        Points
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          name="points"
                          id="points"
                          value={points}
                          onChange={(e) => setPoints(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 
                                   focus:border-transparent transition-colors bg-white text-gray-900 shadow-sm
                                   placeholder:text-gray-400"
                          placeholder="Enter points"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPoints((prev) => (parseInt(prev) + 1).toString())
                          }
                          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPoints((prev) => (parseInt(prev) - 1).toString())
                          }
                          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          -1
                        </button>
                      </div>
                    </div>
                  )}

                  {!isEditMode && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Special Code
                      </label>
                      <div className="space-y-3">
                        {!customCode && (
                          <>
                            <div className="grid grid-cols-1 gap-2">
                              {suggestions.map((suggestion) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => setSpecialCode(suggestion)}
                                  className={`p-3 text-left rounded-lg border transition-colors ${
                                    specialCode === suggestion
                                      ? "border-teal-500 bg-teal-50 text-teal-700"
                                      : "border-gray-300 hover:border-teal-500 hover:bg-gray-50"
                                  }`}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={generateNewSuggestions}
                                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                              >
                                <RefreshIcon className="w-4 h-4" />
                                Generate new suggestions
                              </button>
                              <button
                                type="button"
                                onClick={() => setCustomCode(true)}
                                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                              >
                                Enter custom code
                              </button>
                            </div>
                          </>
                        )}

                        {customCode && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={specialCode}
                              onChange={(e) => setSpecialCode(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 
                                       focus:border-transparent transition-colors bg-white text-gray-900 shadow-sm
                                       placeholder:text-gray-400"
                              placeholder="Enter a memorable code"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setCustomCode(false)}
                              className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                            >
                              Use suggested codes instead
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                    disabled={
                      isLoading ||
                      !name.trim() ||
                      (!isEditMode && !specialCode.trim())
                    }
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
                      : "Add Child"}
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
