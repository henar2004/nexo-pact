import { useEffect, useMemo, useState } from 'react';
import './App.css';

const GITHUB_URL = 'https://github.com/henar2004/create-react-app';
const MAX_PARTICIPANTS = 6;
const MAX_ROUNDS = 3;

const PERSON_COLORS = [
  '#ff6b4a',
  '#6f6bf4',
  '#13a984',
  '#e29a28',
  '#d65a92',
  '#3587d4',
];

const DEMO = {
  topic: 'Encontrar un sitio para cenar juntos este viernes',
  targetDate: 'Viernes, entre las 20:30 y las 23:30',
  area: 'Madrid centro',
  details:
    'Queremos poder hablar tranquilos y llegar en transporte público. La decisión debe quedar cerrada hoy.',
  participants: [
    {
      id: 'henar',
      name: 'Henar',
      availability: 'Puedo llegar a partir de las 20:30 y quiero volver antes de medianoche.',
      budget: 'Preferiblemente hasta 25 € por persona.',
      preferences: 'Me apetece cenar sentados, en un lugar tranquilo y con opciones vegetarianas.',
      nonNegotiables: 'Tiene que estar bien conectado por metro.',
      privateNotes: 'No quiero explicar al grupo por qué necesito controlar el presupuesto.',
      feedback: '',
    },
    {
      id: 'lucia',
      name: 'Lucía',
      availability: 'Salgo de trabajar a las 20:00 cerca de Atocha.',
      budget: 'Puedo gastar hasta 35 €.',
      preferences: 'Prefiero un sitio informal y no me importa caminar unos 15 minutos.',
      nonNegotiables: 'No puedo quedar antes de las 20:30.',
      privateNotes: 'Estoy cansada esta semana; prefiero evitar planes que terminen muy tarde.',
      feedback: '',
    },
    {
      id: 'marcos',
      name: 'Marcos',
      availability: 'Estoy libre desde las 19:30.',
      budget: 'Máximo 30 €.',
      preferences: 'Prefiero comida española, italiana o mexicana.',
      nonNegotiables: 'No quiero comida asiática.',
      privateNotes: 'Puedo ceder con la zona si el transporte de vuelta es sencillo.',
      feedback: '',
    },
    {
      id: 'pablo',
      name: 'Pablo',
      availability: 'Estoy disponible toda la tarde y noche.',
      budget: 'Sin límite estricto, pero no quiero encarecer el plan del grupo.',
      preferences: 'Me da igual el tipo de comida; valoro que se pueda reservar.',
      nonNegotiables: 'No quiero tener que conducir.',
      privateNotes: 'Estoy dispuesto a adaptarme si el resto llega a un acuerdo.',
      feedback: '',
    },
  ],
};

function createParticipant(index) {
  const suffix = Date.now().toString(36);
  return {
    id: `person_${index + 1}_${suffix}`,
    name: index === 0 ? 'Tú' : `Persona ${index + 1}`,
    availability: '',
    budget: '',
    preferences: '',
    nonNegotiables: '',
    privateNotes: '',
    feedback: '',
  };
}

function apiRequest(url, options) {
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  }).then(async (response) => {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || 'La solicitud no se pudo completar.');
    }
    return payload;
  });
}

function Icon({ name, size = 18 }) {
  const paths = {
    arrow: 'M5 12h14M13 6l6 6-6 6',
    check: 'm5 12 4 4L19 6',
    copy: 'M8 8h11v11H8zM5 16H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1',
    github:
      'M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.8a9.6 9.6 0 0 1 2.5.34c1.92-1.3 2.76-1.02 2.76-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.79c0 .27.18.58.69.48A10 10 0 0 0 12 2Z',
    lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z',
    plus: 'M12 5v14M5 12h14',
    refresh: 'M20 7v5h-5M4 17v-5h5M6.1 9a7 7 0 0 1 11.5-2L20 12M4 12l2.4 5a7 7 0 0 0 11.5-2',
    spark: 'm12 3 1.4 4.1L17.5 9l-4.1 1.4L12 15l-1.4-4.6L6.5 9l4.1-1.9L12 3Zm6 11 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z',
    trash: 'M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    x: 'M18 6 6 18M6 6l12 12',
  };

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d={paths[name]}
        fill={name === 'github' ? 'currentColor' : 'none'}
        stroke={name === 'github' ? 'none' : 'currentColor'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function Avatar({ name, index, small = false }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <span
      className={`avatar ${small ? 'avatar-small' : ''}`}
      style={{ '--avatar-color': PERSON_COLORS[index % PERSON_COLORS.length] }}
    >
      {initials}
    </span>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {hint && <span>{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function ConnectionBadge({ connection }) {
  const labels = {
    checking: 'Comprobando Gemini',
    ready: 'Gemini conectado',
    missing: 'Falta configurar Gemini',
    error: 'Sin conexión',
  };

  return (
    <span className={`connection-badge connection-${connection}`}>
      <span className="connection-dot" />
      {labels[connection]}
    </span>
  );
}

function ParticipantEditor({
  participant,
  index,
  canRemove,
  onChange,
  onRemove,
}) {
  const update = (field, value) => onChange(participant.id, field, value);

  return (
    <div className="participant-editor">
      <div className="participant-editor-head">
        <Avatar name={participant.name} index={index} />
        <div>
          <span className="eyebrow">Agente personal</span>
          <h3>Perfil privado</h3>
        </div>
        {canRemove && (
          <button
            aria-label={`Eliminar a ${participant.name}`}
            className="icon-button danger-button"
            onClick={() => onRemove(participant.id)}
            type="button"
          >
            <Icon name="trash" />
          </button>
        )}
      </div>

      <div className="privacy-note">
        <Icon name="lock" size={16} />
        El mediador solo recibirá la posición pública preparada por este agente.
      </div>

      <div className="form-grid">
        <Field label="Nombre">
          <input
            maxLength="60"
            onChange={(event) => update('name', event.target.value)}
            placeholder="Nombre"
            value={participant.name}
          />
        </Field>
        <Field label="Disponibilidad">
          <input
            maxLength="1200"
            onChange={(event) => update('availability', event.target.value)}
            placeholder="Ej. El viernes a partir de las 20:30"
            value={participant.availability}
          />
        </Field>
        <Field label="Presupuesto">
          <input
            maxLength="500"
            onChange={(event) => update('budget', event.target.value)}
            placeholder="Ej. Preferiblemente menos de 25 €"
            value={participant.budget}
          />
        </Field>
        <Field label="Preferencias">
          <textarea
            maxLength="2200"
            onChange={(event) => update('preferences', event.target.value)}
            placeholder="Qué le apetece, qué valora y en qué puede adaptarse"
            rows="3"
            value={participant.preferences}
          />
        </Field>
        <Field label="No negociable">
          <textarea
            maxLength="1400"
            onChange={(event) => update('nonNegotiables', event.target.value)}
            placeholder="Condiciones que el acuerdo debe respetar"
            rows="2"
            value={participant.nonNegotiables}
          />
        </Field>
        <Field label="Solo para su agente" hint="No se comparte literalmente">
          <textarea
            className="private-input"
            maxLength="1600"
            onChange={(event) => update('privateNotes', event.target.value)}
            placeholder="Motivos o contexto que esta persona prefiere mantener privado"
            rows="3"
            value={participant.privateNotes}
          />
        </Field>
      </div>
    </div>
  );
}

function EmptyNegotiation({ participants }) {
  return (
    <div className="empty-negotiation">
      <div className="network-visual" aria-hidden="true">
        <div className="network-ring" />
        {participants.slice(0, 5).map((participant, index) => (
          <div
            className={`network-person network-person-${index + 1}`}
            key={participant.id}
          >
            <Avatar name={participant.name} index={index} small />
          </div>
        ))}
        <div className="mediator-node">
          <Icon name="spark" size={24} />
        </div>
      </div>
      <span className="eyebrow">Sala de negociación</span>
      <h2>Los agentes aún no han hablado</h2>
      <p>
        Completa el pacto y los perfiles. Cada Gemini defenderá a una persona y
        el mediador buscará un punto de encuentro.
      </p>
      <div className="empty-steps">
        <span><b>1</b> Posiciones privadas</span>
        <span><b>2</b> Mediación neutral</span>
        <span><b>3</b> Aprobación humana</span>
      </div>
    </div>
  );
}

function NegotiatingState({ participants, round }) {
  return (
    <div className="negotiating-state">
      <div className="negotiating-orbit">
        <span className="orbit-center"><Icon name="spark" size={24} /></span>
        <span className="orbit-dot orbit-dot-one" />
        <span className="orbit-dot orbit-dot-two" />
        <span className="orbit-dot orbit-dot-three" />
      </div>
      <span className="eyebrow">Ronda {round}</span>
      <h2>Los agentes están negociando</h2>
      <p>Preparan posiciones públicas sin revelar las notas privadas.</p>
      <div className="agent-progress-list">
        {participants.map((participant, index) => (
          <div className="agent-progress" key={participant.id}>
            <Avatar name={participant.name} index={index} small />
            <span>Agente de {participant.name}</span>
            <i />
          </div>
        ))}
        <div className="agent-progress mediator-progress">
          <span className="mini-mediator"><Icon name="spark" size={14} /></span>
          <span>Mediador</span>
          <i />
        </div>
      </div>
    </div>
  );
}

function PositionCard({ position, participant, index }) {
  const statusLabels = {
    open: 'Abierto',
    cautious: 'Con reservas',
    blocked: 'Bloqueado',
  };

  return (
    <article className={`position-card position-${position.status}`}>
      <div className="position-head">
        <Avatar name={participant.name} index={index} small />
        <div>
          <h4>Agente de {participant.name}</h4>
          <span>{statusLabels[position.status]}</span>
        </div>
        <strong>{position.compatibilityScore}%</strong>
      </div>
      <p>“{position.publicMessage}”</p>
      {position.concessions?.length > 0 && (
        <div className="position-foot">
          Puede ceder: {position.concessions.slice(0, 2).join(' · ')}
        </div>
      )}
    </article>
  );
}

function ProposalCard({
  result,
  participants,
  votes,
  feedback,
  onVote,
  onFeedback,
  onNextRound,
  onReset,
  onCopy,
}) {
  const { mediation, positions, round, meta } = result;
  const proposal = mediation.proposal;
  const allVoted = participants.every((participant) => votes[participant.id]);
  const allAccepted =
    allVoted &&
    participants.every((participant) => votes[participant.id] === 'accept');
  const hasRejection = Object.values(votes).some((vote) => vote === 'reject');

  return (
    <div className="result-stack">
      <div className="round-summary">
        <div>
          <span className="eyebrow">Conversación pública</span>
          <h2>Ronda {round} de {MAX_ROUNDS}</h2>
        </div>
        <span className="round-meta">
          {meta?.calls || positions.length + 1} llamadas · {meta?.model || 'Gemini'}
        </span>
      </div>

      <div className="positions-grid">
        {positions.map((position) => {
          const index = participants.findIndex(
            (participant) => participant.id === position.participantId
          );
          const participant = participants[index] || {
            name: position.participantName,
          };
          return (
            <PositionCard
              index={Math.max(index, 0)}
              key={position.participantId}
              participant={participant}
              position={position}
            />
          );
        })}
      </div>

      <article className="proposal-card">
        <div className="proposal-topline">
          <span className="mediator-mark"><Icon name="spark" size={18} /></span>
          <span>Mediador neutral</span>
          <span className="consensus-pill">
            {mediation.consensusScore}% de encaje
          </span>
        </div>
        <h2>{proposal.headline}</h2>
        <p className="proposal-description">{proposal.description}</p>

        <div className="proposal-facts">
          <div>
            <span>Cuándo</span>
            <strong>{proposal.when}</strong>
          </div>
          <div>
            <span>Dónde</span>
            <strong>{proposal.where}</strong>
          </div>
          <div>
            <span>Coste</span>
            <strong>{proposal.estimatedCost}</strong>
          </div>
        </div>

        {proposal.steps?.length > 0 && (
          <div className="proposal-section">
            <h3>El plan</h3>
            <ol>
              {proposal.steps.map((step, index) => (
                <li key={`${step}-${index}`}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="proposal-columns">
          <div>
            <h3>Por qué puede funcionar</h3>
            <ul className="check-list">
              {proposal.whyItWorks?.map((item, index) => (
                <li key={`${item}-${index}`}><Icon name="check" size={15} />{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Compromisos</h3>
            <ul>
              {proposal.compromises?.length ? (
                proposal.compromises.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))
              ) : (
                <li>No se han detectado compromisos importantes.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mediator-message">
          <Icon name="spark" size={16} />
          {mediation.mediatorMessage}
        </div>
      </article>

      <section className={`vote-panel ${allAccepted ? 'vote-panel-success' : ''}`}>
        <div className="vote-heading">
          <div>
            <span className="eyebrow">
              {allAccepted ? 'Pacto cerrado' : 'Decisión humana'}
            </span>
            <h2>
              {allAccepted
                ? 'Todos han aceptado'
                : '¿Acepta cada persona esta propuesta?'}
            </h2>
          </div>
          {allAccepted && <span className="success-seal"><Icon name="check" size={22} /></span>}
        </div>

        <div className="vote-list">
          {participants.map((participant, index) => (
            <div className="vote-row" key={participant.id}>
              <div className="vote-person">
                <Avatar name={participant.name} index={index} small />
                <strong>{participant.name}</strong>
              </div>
              {!allAccepted && (
                <div className="vote-actions">
                  <button
                    className={votes[participant.id] === 'accept' ? 'selected accept' : ''}
                    onClick={() => onVote(participant.id, 'accept')}
                    type="button"
                  >
                    Acepta
                  </button>
                  <button
                    className={votes[participant.id] === 'reject' ? 'selected reject' : ''}
                    onClick={() => onVote(participant.id, 'reject')}
                    type="button"
                  >
                    Quiere cambios
                  </button>
                </div>
              )}
              {allAccepted && <span className="accepted-label"><Icon name="check" size={14} /> Aceptado</span>}
              {votes[participant.id] === 'reject' && !allAccepted && (
                <input
                  aria-label={`Cambios solicitados por ${participant.name}`}
                  onChange={(event) => onFeedback(participant.id, event.target.value)}
                  placeholder="¿Qué debería cambiar su agente?"
                  value={feedback[participant.id] || ''}
                />
              )}
            </div>
          ))}
        </div>

        <div className="vote-footer">
          {allAccepted ? (
            <>
              <button className="secondary-button" onClick={onCopy} type="button">
                <Icon name="copy" size={16} /> Copiar acuerdo
              </button>
              <button className="primary-button" onClick={onReset} type="button">
                Crear otro pacto <Icon name="arrow" size={17} />
              </button>
            </>
          ) : (
            <>
              <span>
                {allVoted
                  ? hasRejection
                    ? 'Los agentes pueden intentar una nueva propuesta.'
                    : 'La propuesta está lista para cerrarse.'
                  : 'Faltan decisiones por registrar.'}
              </span>
              {allVoted && hasRejection && round < MAX_ROUNDS && (
                <button className="primary-button" onClick={onNextRound} type="button">
                  Negociar otra ronda <Icon name="refresh" size={17} />
                </button>
              )}
              {allVoted && hasRejection && round >= MAX_ROUNDS && (
                <button className="secondary-button" onClick={onReset} type="button">
                  Replantear el pacto
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function App() {
  const [topic, setTopic] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [area, setArea] = useState('');
  const [details, setDetails] = useState('');
  const [participants, setParticipants] = useState([
    createParticipant(0),
    createParticipant(1),
  ]);
  const [activeParticipantId, setActiveParticipantId] = useState(
    participants[0].id
  );
  const [connection, setConnection] = useState('checking');
  const [runStatus, setRunStatus] = useState('idle');
  const [round, setRound] = useState(1);
  const [result, setResult] = useState(null);
  const [votes, setVotes] = useState({});
  const [feedback, setFeedback] = useState({});
  const [error, setError] = useState('');
  const [copyLabel, setCopyLabel] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((payload) => setConnection(payload.configured ? 'ready' : 'missing'))
      .catch(() => setConnection('error'));
  }, []);

  const activeIndex = Math.max(
    participants.findIndex(
      (participant) => participant.id === activeParticipantId
    ),
    0
  );
  const activeParticipant = participants[activeIndex];

  const completedProfileCount = useMemo(
    () =>
      participants.filter(
        (participant) =>
          participant.name.trim() &&
          (participant.availability.trim() ||
            participant.preferences.trim() ||
            participant.nonNegotiables.trim())
      ).length,
    [participants]
  );

  function updateParticipant(id, field, value) {
    setParticipants((current) =>
      current.map((participant) =>
        participant.id === id ? { ...participant, [field]: value } : participant
      )
    );
  }

  function addParticipant() {
    if (participants.length >= MAX_PARTICIPANTS) return;
    const participant = createParticipant(participants.length);
    setParticipants((current) => [...current, participant]);
    setActiveParticipantId(participant.id);
  }

  function removeParticipant(id) {
    if (participants.length <= 2) return;
    const nextParticipants = participants.filter(
      (participant) => participant.id !== id
    );
    setParticipants(nextParticipants);
    if (activeParticipantId === id) {
      setActiveParticipantId(nextParticipants[0].id);
    }
  }

  function loadDemo() {
    const demoParticipants = DEMO.participants.map((participant) => ({
      ...participant,
    }));
    setTopic(DEMO.topic);
    setTargetDate(DEMO.targetDate);
    setArea(DEMO.area);
    setDetails(DEMO.details);
    setParticipants(demoParticipants);
    setActiveParticipantId(demoParticipants[0].id);
    setResult(null);
    setVotes({});
    setFeedback({});
    setRound(1);
    setRunStatus('idle');
    setError('');
  }

  async function negotiate(nextRound = 1) {
    if (topic.trim().length < 8) {
      setError('Describe primero qué necesita acordar el grupo.');
      return;
    }
    if (completedProfileCount < 2) {
      setError('Completa las preferencias de al menos dos participantes.');
      return;
    }

    setError('');
    setRunStatus('negotiating');
    setRound(nextRound);

    const participantsWithFeedback = participants.map((participant) => ({
      ...participant,
      feedback:
        votes[participant.id] === 'reject'
          ? feedback[participant.id] || 'La propuesta anterior necesita cambios.'
          : votes[participant.id] === 'accept'
            ? 'La propuesta anterior era aceptable.'
            : '',
    }));

    try {
      const payload = await apiRequest('/api/negotiate', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          targetDate,
          area,
          details,
          participants: participantsWithFeedback,
          round: nextRound,
          previousProposal: result?.mediation?.proposal || null,
        }),
      });
      setResult(payload);
      setVotes({});
      setFeedback({});
      setRunStatus('completed');
    } catch (requestError) {
      setRunStatus('error');
      setError(requestError.message);
    }
  }

  function resetPact() {
    const initialParticipants = [createParticipant(0), createParticipant(1)];
    setTopic('');
    setTargetDate('');
    setArea('');
    setDetails('');
    setParticipants(initialParticipants);
    setActiveParticipantId(initialParticipants[0].id);
    setResult(null);
    setVotes({});
    setFeedback({});
    setRound(1);
    setRunStatus('idle');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function copyAgreement() {
    const proposal = result?.mediation?.proposal;
    if (!proposal) return;
    const text = [
      proposal.headline,
      `Cuándo: ${proposal.when}`,
      `Dónde: ${proposal.where}`,
      `Coste: ${proposal.estimatedCost}`,
      '',
      proposal.description,
      '',
      ...(proposal.steps || []).map((step, index) => `${index + 1}. ${step}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel('Acuerdo copiado');
      window.setTimeout(() => setCopyLabel(''), 2200);
    } catch {
      setCopyLabel('No se pudo copiar');
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Nexo Pact, inicio">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span>
            <strong>Nexo</strong>
            <small>Pact</small>
          </span>
        </a>
        <div className="topbar-actions">
          <ConnectionBadge connection={connection} />
          <a
            className="github-link"
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
          >
            <Icon name="github" size={18} />
            <span>GitHub</span>
          </a>
        </div>
      </header>

      <main id="inicio">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">
              <Icon name="spark" size={15} />
              Acuerdos mediados por agentes
            </span>
            <h1>
              Menos mensajes.
              <br />
              <em>Un plan que encaje.</em>
            </h1>
            <p>
              Cada persona tiene un Gemini que protege sus preferencias. Los
              agentes negocian y un mediador propone el punto de encuentro.
            </p>
          </div>
          <div className="hero-aside">
            <div className="hero-quote">
              <span>El problema</span>
              <p>“¿Entonces cuándo, dónde y cuánto queremos gastar?”</p>
            </div>
            <div className="hero-arrow"><Icon name="arrow" size={20} /></div>
            <div className="hero-quote hero-quote-accent">
              <span>El pacto</span>
              <p>Una propuesta clara que todos pueden aceptar.</p>
            </div>
          </div>
        </section>

        <section className="workspace">
          <aside className="setup-panel">
            <div className="panel-heading">
              <div>
                <span className="step-number">01</span>
                <span className="eyebrow">El pacto</span>
                <h2>¿Qué necesitáis acordar?</h2>
              </div>
              <button className="text-button" onClick={loadDemo} type="button">
                Cargar ejemplo
              </button>
            </div>

            <div className="setup-fields">
              <Field label="Objetivo del grupo">
                <textarea
                  maxLength="3000"
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Ej. Encontrar un sitio para cenar este viernes"
                  rows="3"
                  value={topic}
                />
              </Field>
              <div className="two-columns">
                <Field label="Fecha o periodo">
                  <input
                    maxLength="300"
                    onChange={(event) => setTargetDate(event.target.value)}
                    placeholder="Viernes por la noche"
                    value={targetDate}
                  />
                </Field>
                <Field label="Zona">
                  <input
                    maxLength="300"
                    onChange={(event) => setArea(event.target.value)}
                    placeholder="Madrid centro"
                    value={area}
                  />
                </Field>
              </div>
              <Field label="Contexto compartido" hint="Visible para todos">
                <textarea
                  maxLength="2500"
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Qué tipo de acuerdo buscáis y cualquier dato que el grupo ya conozca"
                  rows="3"
                  value={details}
                />
              </Field>
            </div>

            <div className="participant-section">
              <div className="participant-title">
                <div>
                  <span className="step-number">02</span>
                  <span className="eyebrow">Participantes</span>
                  <h2>Un agente por persona</h2>
                </div>
                <span>{participants.length}/{MAX_PARTICIPANTS}</span>
              </div>

              <div className="participant-tabs" role="tablist" aria-label="Participantes">
                {participants.map((participant, index) => (
                  <button
                    aria-selected={participant.id === activeParticipantId}
                    className={
                      participant.id === activeParticipantId
                        ? 'participant-tab active'
                        : 'participant-tab'
                    }
                    key={participant.id}
                    onClick={() => setActiveParticipantId(participant.id)}
                    role="tab"
                    type="button"
                  >
                    <Avatar name={participant.name} index={index} small />
                    <span>{participant.name}</span>
                  </button>
                ))}
                {participants.length < MAX_PARTICIPANTS && (
                  <button
                    aria-label="Añadir participante"
                    className="add-participant"
                    onClick={addParticipant}
                    type="button"
                  >
                    <Icon name="plus" />
                  </button>
                )}
              </div>

              {activeParticipant && (
                <ParticipantEditor
                  canRemove={participants.length > 2}
                  index={activeIndex}
                  onChange={updateParticipant}
                  onRemove={removeParticipant}
                  participant={activeParticipant}
                />
              )}
            </div>

            {error && (
              <div className="error-banner" role="alert">
                <Icon name="x" size={16} />
                {error}
              </div>
            )}

            <button
              className="negotiate-button"
              disabled={runStatus === 'negotiating'}
              onClick={() => negotiate(1)}
              type="button"
            >
              <span>
                <Icon name="users" size={19} />
                Iniciar negociación
              </span>
              <Icon name="arrow" size={20} />
            </button>
            <p className="mvp-note">
              MVP privado: configura aquí los perfiles. La versión con enlaces
              personales permitirá que cada participante complete el suyo.
            </p>
          </aside>

          <section className="negotiation-panel" aria-live="polite">
            {runStatus === 'negotiating' ? (
              <NegotiatingState participants={participants} round={round} />
            ) : result ? (
              <ProposalCard
                feedback={feedback}
                onCopy={copyAgreement}
                onFeedback={(id, value) =>
                  setFeedback((current) => ({ ...current, [id]: value }))
                }
                onNextRound={() => negotiate(round + 1)}
                onReset={resetPact}
                onVote={(id, vote) =>
                  setVotes((current) => ({ ...current, [id]: vote }))
                }
                participants={participants}
                result={result}
                votes={votes}
              />
            ) : (
              <EmptyNegotiation participants={participants} />
            )}
          </section>
        </section>
      </main>

      {copyLabel && <div className="toast">{copyLabel}</div>}

      <footer>
        <div>
          <span className="brand-footer">Nexo Pact</span>
          <p>Agentes personales. Preferencias protegidas. Acuerdos humanos.</p>
        </div>
        <span>Gemini coordina; las personas deciden.</span>
      </footer>
    </div>
  );
}

export default App;
