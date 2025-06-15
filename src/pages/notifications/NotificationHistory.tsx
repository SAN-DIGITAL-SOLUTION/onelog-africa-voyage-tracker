
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

export default function NotificationHistory({
  notifications,
  isLoading,
}: NotificationHistoryProps) {
  // Add mission_id and trigger columns to table
  return (
    <section className="mt-10">
      <h2 className="font-bold mb-4">Historique des notifications</h2>
      <div className="bg-white rounded shadow">
        {isLoading ? (
          <div className="text-center p-6">
            <span className="animate-spin h-7 w-7 border-4 border-onelog-bleu border-t-transparent rounded-full inline-block" />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left">Type</th>
                <th className="px-2 py-2 text-left">Destinataire</th>
                <th className="px-2 py-2 text-left">Message</th>
                <th className="px-2 py-2 text-left">Mission</th>
                <th className="px-2 py-2 text-left">Évènement</th>
                <th className="px-2 py-2 text-left">Envoyé le</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notif) => (
                <tr key={notif.id} className="border-b last:border-none">
                  <td className="px-2 py-2">{notif.type?.toUpperCase?.() || ""}</td>
                  <td className="px-2 py-2">{notif.target}</td>
                  <td className="px-2 py-2">{notif.message}</td>
                  <td className="px-2 py-2">{notif.mission_id || "-"}</td>
                  <td className="px-2 py-2">{notif.trigger || "-"}</td>
                  <td className="px-2 py-2">
                    {notif.sent_at
                      ? new Date(notif.sent_at).toLocaleString("fr-FR")
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-onelog-nuit/60 p-4">
            Aucune notification envoyée.
          </div>
        )}
      </div>
    </section>
  );
}
