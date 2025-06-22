import { useRef, useState } from "react";
import { useMissionActions } from "@/hooks/useMissionActions";

export default function SignatureModal({ missionId, onClose }: { missionId: string, onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { completeMission, loading } = useMissionActions();

  const startDrawing = (e: React.MouseEvent) => {
    setDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      }
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const handleValidate = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const signature = canvas.toDataURL();
      const ok = await completeMission(missionId, signature);
      if (ok) onClose();
      else setError("Erreur lors de l'enregistrement de la signature.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md flex flex-col items-center">
        <h2 className="text-lg font-bold mb-2">Signature de livraison</h2>
        <canvas
          ref={canvasRef}
          width={300}
          height={120}
          className="border mb-3"
          style={{ touchAction: "none" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <div className="flex gap-2 mb-2">
          <button onClick={() => { const ctx = canvasRef.current?.getContext("2d"); if (ctx) { ctx.clearRect(0,0,300,120); }}} className="px-3 py-1 bg-gray-200 rounded">Effacer</button>
          <button onClick={handleValidate} className="px-3 py-1 bg-green-600 text-white rounded" disabled={loading}>Valider</button>
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">Annuler</button>
        </div>
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </div>
    </div>
  );
}
