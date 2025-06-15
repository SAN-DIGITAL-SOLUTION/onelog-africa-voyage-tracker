
import { useState, useMemo } from "react";
import NotificationFilters from "./NotificationFilters";

type Notification = {
  id: string;
  type: string;
  target: string;
  message: string;
  sent_at?: string;
  mission_id?: string | null;
  trigger?: string | null;
};

type NotificationHistoryProps = {
  notifications: Notification[];
  isLoading: boolean;
};

const triggerLabels: Record<string, string> = {
  created: "Mission créée",
  modified: "Mission modifiée",
  delivered: "Mission livrée",
  cancelled: "Mission annulée",
  in_progress: "Mission en cours",
  custom: "Personnalisé",
};

export default function NotificationHistory({
  notifications,
  isLoading,
}: NotificationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [triggerFilter, setTriggerFilter] = useState("");

  // Filtrer les notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      const matchesSearch = 
        searchTerm === "" ||
        notif.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = 
        typeFilter === "" || notif.type === typeFilter;

      const matchesTrigger = 
        triggerFilter === "" || notif.trigger === triggerFilter;

      return matchesSearch && matchesType && matchesTrigger;
    });
  }, [notifications, searchTerm, typeFilter, triggerFilter]);

  const hasActiveFilters = searchTerm !== "" || typeFilter !== "" || triggerFilter !== "";

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setTriggerFilter("");
  };

  return (
    <section className="mt-10">
      <h2 className="font-bold mb-4">Historique des notifications</h2>
      
      <NotificationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        triggerFilter={triggerFilter}
        onTriggerFilterChange={setTriggerFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="bg-white rounded shadow">
        {isLoading ? (
          <div className="text-center p-6">
            <span className="animate-spin h-7 w-7 border-4 border-onelog-bleu border-t-transparent rounded-full inline-block" />
          </div>
        ) : filteredNotifications && filteredNotifications.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-3 py-3 text-left font-medium">Type</th>
                    <th className="px-3 py-3 text-left font-medium">Destinataire</th>
                    <th className="px-3 py-3 text-left font-medium">Message</th>
                    <th className="px-3 py-3 text-left font-medium">Mission</th>
                    <th className="px-3 py-3 text-left font-medium">Évènement</th>
                    <th className="px-3 py-3 text-left font-medium">Envoyé le</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notif) => (
                    <tr key={notif.id} className="border-b last:border-none hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notif.type === 'email' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {notif.type?.toUpperCase?.() || ""}
                        </span>
                      </td>
                      <td className="px-3 py-3 max-w-48 truncate">{notif.target}</td>
                      <td className="px-3 py-3 max-w-64 truncate" title={notif.message}>
                        {notif.message}
                      </td>
                      <td className="px-3 py-3">
                        {notif.mission_id ? (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {notif.mission_id.slice(-8)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {notif.trigger ? (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {triggerLabels[notif.trigger] || notif.trigger}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">
                        {notif.sent_at
                          ? new Date(notif.sent_at).toLocaleString("fr-FR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasActiveFilters && (
              <div className="px-4 py-3 border-t bg-gray-50 text-sm text-gray-600">
                {filteredNotifications.length} notification(s) trouvée(s) sur {notifications.length} au total
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-onelog-nuit/60 p-6">
            {hasActiveFilters 
              ? "Aucune notification ne correspond aux filtres."
              : "Aucune notification envoyée."
            }
          </div>
        )}
      </div>
    </section>
  );
}
