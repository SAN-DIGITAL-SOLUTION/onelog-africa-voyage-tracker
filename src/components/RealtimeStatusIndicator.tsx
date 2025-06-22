
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";
import { useRealtimeMissions } from "@/hooks/useRealtimeMissions";
import { useAuth } from "@/hooks/useAuth";

export default function RealtimeStatusIndicator() {
  const { user } = useAuth();
  const { realtimeUpdates } = useRealtimeMissions(user);
  const [isConnected, setIsConnected] = React.useState(true);

  React.useEffect(() => {
    // Simpler connectivity check
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <AnimatePresence>
        {realtimeUpdates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-onelog-bleu text-white rounded-full px-3 py-2 mb-2 shadow-lg"
          >
            <span className="text-xs font-medium">
              {realtimeUpdates.length} mise(s) à jour
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        isConnected 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {isConnected ? (
          <>
            <Wifi size={12} />
            <span>Temps réel</span>
          </>
        ) : (
          <>
            <WifiOff size={12} />
            <span>Hors ligne</span>
          </>
        )}
      </div>
    </div>
  );
}
