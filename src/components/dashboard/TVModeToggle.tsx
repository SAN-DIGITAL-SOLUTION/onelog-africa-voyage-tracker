import React from 'react';
import { Monitor, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TVModeToggleProps {
  className?: string;
}

export default function TVModeToggle({ className }: TVModeToggleProps) {
  const navigate = useNavigate();

  const handleTVMode = () => {
    navigate('/fullscreen-dashboard');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTVMode}
      className={`flex items-center gap-2 ${className}`}
      title="Mode Grand Écran TV"
    >
      <Monitor className="w-4 h-4" />
      <Maximize2 className="w-3 h-3" />
      Mode TV
    </Button>
  );
}
