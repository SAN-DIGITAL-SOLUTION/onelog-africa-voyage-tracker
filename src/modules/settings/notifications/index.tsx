import { useNotificationPreferences } from '../../notificationPreferences/useNotificationPreferences';
import React from 'react';

export default function NotificationSettingsPage() {
  const {
    preferences,
    loading,
    error,
    updatePreference,
    savePreferences,
  } = useNotificationPreferences();

  if (loading) return <div>Chargement…</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="container mx-auto max-w-xl py-8">
      <h1 className="text-2xl font-bold mb-4">Paramètres de notification</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          savePreferences();
        }}
        className="space-y-4"
      >
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!preferences.email_enabled}
              onChange={e => updatePreference('email_enabled', e.target.checked)}
              className="mr-2"
            />
            Email
          </label>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!preferences.sms_enabled}
              onChange={e => updatePreference('sms_enabled', e.target.checked)}
              className="mr-2"
            />
            SMS
          </label>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!preferences.whatsapp_enabled}
              onChange={e => updatePreference('whatsapp_enabled', e.target.checked)}
              className="mr-2"
            />
            WhatsApp
          </label>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!preferences.in_app_enabled}
              onChange={e => updatePreference('in_app_enabled', e.target.checked)}
              className="mr-2"
            />
            Notifications in-app
          </label>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Sauvegarder
        </button>
      </form>
    </div>
  );
}
