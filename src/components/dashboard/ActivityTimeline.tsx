"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { Activity } from "@/data/parent";

interface Props {
  initialActivities: Activity[];
}

export default function ActivityTimeline({ initialActivities }: Props) {
  const [activities] = useState(initialActivities);

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Activity</h2>

      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {activities.map((activity, activityIdx) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                        activity.type === "CHORE"
                          ? "bg-blue-500"
                          : "bg-purple-500"
                      }`}
                    >
                      {activity.type === "CHORE" ? "🏆" : "🎁"}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">
                          {activity.kidName}
                        </span>{" "}
                        {activity.actionText}{" "}
                        <span className="font-medium text-gray-900">
                          {activity.itemName}
                        </span>{" "}
                        ({activity.points} points)
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={activity.timestamp.toISOString()}>
                        {formatDistanceToNow(activity.timestamp, {
                          addSuffix: true,
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {activities.length === 0 && (
        <p className="text-gray-500 text-center py-8">No activity yet.</p>
      )}
    </section>
  );
}
