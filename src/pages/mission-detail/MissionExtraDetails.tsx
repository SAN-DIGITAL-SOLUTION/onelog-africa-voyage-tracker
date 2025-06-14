
import React from "react";

type Mission = {
  description?: string;
};

type Props = {
  mission: Mission;
};

export default function MissionExtraDetails({ mission }: Props) {
  return (
    <section className="pt-2">
      <div className="text-sm text-gray-600">Description</div>
      <div className="font-semibold">
        {mission.description || <span className="italic text-onelog-nuit/40">Aucune</span>}
      </div>
    </section>
  );
}
