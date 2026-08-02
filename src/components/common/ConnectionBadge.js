const labels = {
  checking: 'Comprobando Gemini',
  ready: 'Gemini conectado',
  missing: 'Falta configurar Gemini',
  error: 'Sin conexión',
};

export function ConnectionBadge({ connection }) {
  return (
    <span className={`connection-badge connection-${connection}`}>
      <span className="connection-dot" />
      {labels[connection]}
    </span>
  );
}
