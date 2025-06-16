
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

type RealtimeNotification = {
  id: string;
  type: string;
  target: string;
  message: string;
  mission_id?: string;
  trigger?: string;
  sent_at: string;
};

export default function NotificationToast() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  useEffect(() => {
    if (!user) return;

    // Écouter les nouvelles notifications en temps réel
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Nouvelle notification reçue:', payload);
          const newNotification = payload.new as RealtimeNotification;
          
          // Afficher le toast
          toast({
            title: "Nouvelle notification",
            description: newNotification.message,
            duration: 5000,
          });

          // Ajouter à la liste locale
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg border p-4 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={16} className="text-onelog-bleu" />
            <span className="font-medium text-sm">Notifications récentes</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.slice(0, 3).map((notif) => (
              <div key={notif.id} className="text-xs p-2 bg-gray-50 rounded">
                <p className="text-gray-700">{notif.message}</p>
                <p className="text-gray-500 mt-1">
                  {new Date(notif.sent_at).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
          {notifications.length > 3 && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs mt-2"
              onClick={() => setNotifications([])}
            >
              Effacer ({notifications.length})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
