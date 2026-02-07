import React from 'react';

interface StatusPanelProps {
  status: string;
  wsEndpoint: string;
  apiEndpoint: string;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ status, wsEndpoint, apiEndpoint }) => (
  <div>
    <p className="status">{status}</p>
    <p className="status">Endpoint WS: {wsEndpoint}</p>
    <p className="status">API: {apiEndpoint}</p>
  </div>
);
