import { useEffect, useRef } from "react";
import { supabase } from "@/services/supabaseClient";

export function useTracking(missionId: string, enabled: boolean) {
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !missionId) return;
    if (!navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await supabase.from("tracking").insert([
          { mission_id: missionId, lat: latitude, lng: longitude, timestamp: new Date().toISOString() },
        ]);
      },
      (err) => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [missionId, enabled]);
}
