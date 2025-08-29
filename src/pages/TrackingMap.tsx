import React from 'react';
import { Navigate } from 'react-router-dom';
import ControlRoom from './ControlRoom';

// Redirection vers la nouvelle page Control Room avec Mapbox
export default function TrackingMap() {
  return <Navigate to="/control-room" replace />;
}
