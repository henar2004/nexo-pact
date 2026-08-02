import { useEffect, useState } from 'react';

export function useGeminiHealth() {
  const [connection, setConnection] = useState('checking');

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((payload) => setConnection(payload.configured ? 'ready' : 'missing'))
      .catch(() => setConnection('error'));
  }, []);

  return connection;
}
