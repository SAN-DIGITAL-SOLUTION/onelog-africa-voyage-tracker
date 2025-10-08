import React from 'react';

interface NotificationSummaryProps {
  total?: number;
  failed?: number;
  sent?: number;
  retrying?: number;
}

export default function NotificationSummary({ total = 0, failed = 0, sent = 0, retrying = 0 }: NotificationSummaryProps) {
  return (
    <div style={{ marginTop: 32 }}>
      <h2>Notifications</h2>
      <ul>
        <li>Total : {total}</li>
        <li>Envoyées : {sent}</li>
        <li>En échec : {failed}</li>
        <li>En cours de relance : {retrying}</li>
      </ul>
    </div>
  );
}
