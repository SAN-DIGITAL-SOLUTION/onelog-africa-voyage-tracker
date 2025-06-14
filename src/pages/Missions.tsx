
import { Routes, Route, Navigate } from "react-router-dom";
import MissionsList from "./MissionsList";
import MissionForm from "./MissionForm";
import MissionDetail from "./MissionDetail";
import RequireAuth from "@/components/RequireAuth";

export default function Missions() {
  return (
    <RequireAuth>
      <Routes>
        <Route index element={<MissionsList />} />
        <Route path="new" element={<MissionForm />} />
        <Route path=":id" element={<MissionDetail />} />
        <Route path=":id/edit" element={<MissionForm editMode />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </RequireAuth>
  );
}
