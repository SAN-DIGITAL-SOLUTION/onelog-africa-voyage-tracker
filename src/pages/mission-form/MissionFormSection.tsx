
import React from "react";

type MissionFormSectionProps = {
  title: string;
  children: React.ReactNode;
  fontFamily?: string;
};

export default function MissionFormSection({ title, children, fontFamily }: MissionFormSectionProps) {
  return (
    <section className="mb-4">
      <h2 className="text-lg font-bold mb-2" style={fontFamily ? { fontFamily } : {}}>
        {title}
      </h2>
      <div className="space-y-2">
        {children}
      </div>
    </section>
  );
}
