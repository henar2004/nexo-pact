import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const AGENTS = {
  researcher: {
    name: 'Investigador',
    code: 'INV',
    description: 'Recopila hechos, contexto y evidencias.',
    icon: 'search',
  },
  analyst: {
    name: 'Analista',
    code: 'ANA',
    description: 'Compara perspectivas y contradicciones.',
    icon: 'chart',
  },
  verifier: {
    name: 'Verificador',
    code: 'VER',
    description: 'Comprueba el respaldo de las conclusiones.',
    icon: 'shield',
  },
  writer: {
    name: 'Redactor',
    code: 'RED',
    description: 'Convierte el análisis en una pieza clara.',
    icon: 'pen',
  },
  editor: {
    name: 'Editor',
    code: 'EDI',
    description: 'Revisa tono, estructura y requisitos.',
    icon: 'check',
  },
  synthesizer: {
    name: 'Sintetizador',
    code: 'SIN',
    description: 'Une resultados en la entrega final.',
    icon: 'layers',
  },
};

const GITHUB_URL = 'https://github.com/henar2004/create-react-app';

const MISSION_TYPES = [
  {
    value: 'Resumen',
    label: 'Resumir',
    description: 'Reduce uno o varios textos a sus ideas esenciales.',
    icon: 'layers',
    placeholder:
      'Ej.: Resume estas fuentes en cinco puntos y termina con una conclusión breve.',
    actionLabel: 'Crear resumen',
  },
  {
    value: 'Comparativa',
    label: 'Comparar',
    description: 'Encuentra coincidencias, diferencias y contradicciones.',
    icon: 'chart',
    placeholder:
      'Ej.: Compara cómo presenta cada fuente el tema y separa hechos de opiniones.',
    actionLabel: 'Iniciar comparativa',
  },
  {
    value: 'Verificación',
    label: 'Verificar',
    description: 'Comprueba si una afirmación está respaldada.',
    icon: 'shield',
    placeholder:
      'Ej.: Comprueba la afirmación principal y explica qué está demostrado y qué no.',
    actionLabel: 'Verificar contenido',
  },
  {
    value: 'Informe',
    label: 'Redactar',
    description: 'Convierte el material en un informe o artículo.',
    icon: 'pen',
    placeholder:
      'Ej.: Crea un informe neutral con contexto, hallazgos y una conclusión.',
    actionLabel: 'Crear informe',
  },
];

const DEMO_MISSIONS = [
  {
    name: 'Dos versiones de una noticia',
    outputType: 'Comparativa',
    request:
      'Compara las dos versiones, distingue hechos de interpretaciones y redacta una conclusión neutral de un máximo de 250 palabras.',
    sources: `FUENTE A
El ayuntamiento anunció que el nuevo carril bici del centro estará terminado en septiembre. Según el comunicado, el proyecto reducirá el tráfico y ha recibido una inversión de 1,2 millones de euros.

FUENTE B
Las obras del carril bici continúan en el centro. Comerciantes de la zona afirman que los trabajos están reduciendo temporalmente el acceso a sus negocios. El ayuntamiento mantiene septiembre como fecha prevista de finalización.`,
  },
  {
    name: 'Resumen de una propuesta cultural',
    outputType: 'Resumen',
    request:
      'Resume la propuesta en cinco puntos, identifica sus objetivos principales y termina con una conclusión de dos frases.',
    sources: `PROPUESTA DEL CENTRO CULTURAL
El centro cultural del barrio propone ampliar su horario hasta las diez de la noche durante los fines de semana. La iniciativa incluye talleres gratuitos de fotografía, clubes de lectura y sesiones de cine dirigidas a jóvenes y familias.

El proyecto se probará durante tres meses. La dirección medirá la asistencia, realizará encuestas de satisfacción y revisará el coste de personal antes de decidir si mantiene el nuevo horario.`,
  },
  {
    name: 'Verificación de una afirmación',
    outputType: 'Verificación',
    request:
      'Comprueba si la afirmación “el programa duplicó la participación” está respaldada por los datos. Emite un veredicto y explica los matices.',
    sources: `AFIRMACIÓN
“El nuevo programa deportivo duplicó la participación juvenil durante su primer trimestre.”

DATOS DISPONIBLES
Antes del programa se registraron 180 participantes por trimestre. Durante el primer trimestre del nuevo programa participaron 315 jóvenes. La organización también amplió de cuatro a seis el número de actividades ofrecidas.`,
  },
  {
    name: 'Informe sobre una prueba piloto',
    outputType: 'Informe',
    request:
      'Redacta un informe breve y profesional con contexto, resultados, limitaciones y recomendaciones para la siguiente fase.',
    sources: `RESULTADOS DE LA PRUEBA PILOTO
Una biblioteca instaló durante seis semanas un sistema de préstamo automático. Participaron 420 usuarios y se realizaron 1.180 préstamos. El 82 % completó el proceso sin ayuda y el tiempo medio de espera bajó de siete a tres minutos.

Se registraron dificultades con carnés antiguos y durante dos interrupciones de conexión. El personal propone mantener asistencia presencial en horas punta y renovar los lectores de códigos.`,
  },
  {
    name: 'Comparación de opiniones',
    outputType: 'Comparativa',
    request:
      'Compara los argumentos, identifica en qué coinciden y redacta una síntesis equilibrada sin decidir quién tiene razón.',
    sources: `OPINIÓN 1
El trabajo híbrido mejora la concentración porque permite reservar las tareas individuales para casa. También reduce los desplazamientos, aunque exige reuniones bien planificadas.

OPINIÓN 2
El trabajo presencial facilita las conversaciones espontáneas y el aprendizaje entre compañeros. Sin embargo, reconoce que algunos empleados necesitan flexibilidad para organizar mejor su tiempo.`,
  },
  {
    name: 'Resumen de resultados de una encuesta',
    outputType: 'Resumen',
    request:
      'Resume los resultados para una audiencia no técnica, destaca los tres datos más importantes y evita exagerar las conclusiones.',
    sources: `ENCUESTA DE MOVILIDAD
Respondieron 600 personas. El 48 % utiliza transporte público al menos cuatro días por semana, el 27 % se desplaza principalmente a pie o en bicicleta y el 25 % usa coche.

Entre quienes usan transporte público, el 62 % considera que la frecuencia debería mejorar. La encuesta fue voluntaria y se difundió únicamente por canales digitales, por lo que no representa necesariamente a toda la población.`,
  },
];

const STATUS_LABELS = {
  pending: 'En espera',
  running: 'Trabajando',
  reviewing: 'Revisando de nuevo',
  correcting: 'Corrigiendo',
  completed: 'Completado',
  warning: 'Requiere atención',
  error: 'Error',
};

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19H2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 4.5 6v5.5c0 4.4 3.1 7.7 7.5 9.5 4.4-1.8 7.5-5.1 7.5-9.5V6L12 3Z" />
        <path d="m8.7 12 2.1 2.1 4.6-4.6" />
      </>
    ),
    pen: (
      <>
        <path d="m14.7 5.3 4 4" />
        <path d="M5 19l2.2-5.7L16.5 4a1.4 1.4 0 0 1 2 0L20 5.5a1.4 1.4 0 0 1 0 2l-9.3 9.3L5 19Z" />
      </>
    ),
    check: (
      <>
        <path d="M9 11.5 11 13.5 15.5 9" />
        <circle cx="12" cy="12" r="8.5" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 16 9 5 9-5" />
      </>
    ),
    manager: (
      <>
        <path d="M12 3v5" />
        <path d="M5.5 10.5 9 12" />
        <path d="m18.5 10.5-3.5 1.5" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="3" r="1.5" />
        <circle cx="4" cy="10" r="1.5" />
        <circle cx="20" cy="10" r="1.5" />
        <path d="M12 15v4" />
        <circle cx="12" cy="20.5" r="1.5" />
      </>
    ),
    arrow: <path d="m5 12 5 5L20 7" />,
    spark: (
      <>
        <path d="m12 3 1.3 4.2L17.5 8.5l-4.2 1.3L12 14l-1.3-4.2-4.2-1.3 4.2-1.3L12 3Z" />
        <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
      </>
    ),
    source: (
      <>
        <path d="M6 3h9l4 4v14H6V3Z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h7" />
        <path d="M9 17h5" />
      </>
    ),
    route: (
      <>
        <circle cx="5" cy="6" r="2" />
        <circle cx="19" cy="18" r="2" />
        <path d="M7 6h4a4 4 0 0 1 4 4v4a4 4 0 0 0 4 4" />
        <path d="m11 14-3 3 3 3" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    github: (
      <>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7.4A5.8 5.8 0 0 0 19.3 3 5.4 5.4 0 0 0 19.1 0S17.9-.4 15 1.5a13.4 13.4 0 0 0-7 0C5.1-.4 3.9 0 3.9 0a5.4 5.4 0 0 0-.2 3A5.8 5.8 0 0 0 2.2 7.1c0 5.8 3.5 7 6.8 7.4A4.8 4.8 0 0 0 8 18v4" />
        <path d="M8 19c-3 .9-3-1.5-4.2-2" />
      </>
    ),
    external: (
      <>
        <path d="M15 4h5v5" />
        <path d="m10 14 10-10" />
        <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}

function apiRequest(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'La solicitud no pudo completarse.');
    }
    return data;
  });
}

function getStepOutput(stepState) {
  if (!stepState) return '';
  if (stepState.review?.approved && stepState.review.finalText) {
    return stepState.review.finalText;
  }
  return stepState.output || stepState.review?.summary || '';
}

function StatusMark({ status = 'pending' }) {
  return (
    <span className={`status-mark status-${status}`} aria-hidden="true">
      {status === 'completed' ? (
        <Icon name="arrow" size={13} />
      ) : status === 'error' || status === 'warning' ? (
        '!'
      ) : (
        <span />
      )}
    </span>
  );
}

function AgentAvatar({ agent, manager = false }) {
  const meta = manager ? { icon: 'manager', code: 'GER' } : AGENTS[agent];
  return (
    <span className={`agent-avatar ${manager ? 'manager-avatar' : ''}`}>
      <Icon name={meta?.icon || 'spark'} size={19} />
      <span className="sr-only">{meta?.code}</span>
    </span>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Elige una misión',
      text: 'Decide si quieres resumir, comparar, verificar o redactar.',
    },
    {
      number: '02',
      title: 'Añade tu material',
      text: 'Pega los textos y explica cómo debe ser el resultado.',
    },
    {
      number: '03',
      title: 'Nexo crea el equipo',
      text: 'El gerente selecciona agentes, orden y revisiones.',
    },
    {
      number: '04',
      title: 'Recibe la entrega',
      text: 'Observa el proceso y copia el resultado aprobado.',
    },
  ];

  return (
    <section className="guide-section" id="como-funciona">
      <div className="guide-heading">
        <div>
          <span className="section-kicker">Cómo funciona</span>
          <h2>No necesitas saber de agentes.</h2>
        </div>
        <p>
          Tú defines el objetivo y aportas el material. Nexo se encarga de
          organizar el trabajo.
        </p>
      </div>
      <div className="guide-steps">
        {steps.map((step) => (
          <article className="guide-step" key={step.number}>
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TeamPanel({ selectedAgents }) {
  return (
    <aside className="team-panel panel">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">Catálogo cerrado</span>
          <h2>Equipo disponible</h2>
        </div>
        <span className="team-count">{selectedAgents.size || 0}/6 activos</span>
      </div>

      {selectedAgents.size === 0 && (
        <div className="manager-preview">
          <AgentAvatar manager />
          <div>
            <strong>El gerente formará el equipo</strong>
            <p>
              Cuando inicies la misión, aquí se iluminarán únicamente los
              especialistas que haya elegido.
            </p>
          </div>
        </div>
      )}

      <div className="agent-grid">
        {Object.entries(AGENTS).map(([id, agent]) => {
          const selected = selectedAgents.has(id);
          return (
            <article
              className={`agent-card ${selected ? 'is-selected' : ''}`}
              key={id}
            >
              <AgentAvatar agent={id} />
              <div>
                <div className="agent-name-row">
                  <h3>{agent.name}</h3>
                  {selected && <span className="selected-dot">En el plan</span>}
                </div>
                <p>{agent.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="team-note">
        <Icon name="spark" size={16} />
        <p>
          El gerente selecciona únicamente los roles necesarios para cada
          petición.
        </p>
      </div>
    </aside>
  );
}

function BriefForm({
  request,
  setRequest,
  sources,
  setSources,
  outputType,
  setOutputType,
  onLoadDemo,
  onSubmit,
  busy,
  apiStatus,
}) {
  const activeMission =
    MISSION_TYPES.find((mission) => mission.value === outputType) ||
    MISSION_TYPES[0];

  return (
    <form className="brief-panel panel" id="crear-mision" onSubmit={onSubmit}>
      <div className="panel-heading">
        <div>
          <span className="section-kicker">Empieza aquí</span>
          <h2>Prepara tu misión</h2>
        </div>
        <span className="step-number">01</span>
      </div>

      {apiStatus && !apiStatus.configured && (
        <div className="config-alert" role="status">
          <span className="config-alert-icon">!</span>
          <div>
            <strong>Gemini aún no está conectado</strong>
            <p>
              Añade <code>GEMINI_API_KEY</code> a <code>.env.local</code> y
              reinicia <code>vercel dev</code>.
            </p>
          </div>
        </div>
      )}

      <fieldset className="mission-fieldset">
        <legend className="guided-label">
          <span>1</span>
          Elige qué quieres hacer
        </legend>
        <div className="mission-grid">
          {MISSION_TYPES.map((mission) => {
            const selected = outputType === mission.value;
            return (
              <button
                type="button"
                className={`mission-card ${selected ? 'is-selected' : ''}`}
                aria-pressed={selected}
                key={mission.value}
                onClick={() => setOutputType(mission.value)}
                disabled={busy}
              >
                <span className="mission-icon">
                  <Icon name={mission.icon} size={18} />
                </span>
                <span>
                  <strong>{mission.label}</strong>
                  <small>{mission.description}</small>
                </span>
                <span className="mission-check">
                  {selected && <Icon name="arrow" size={12} />}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="guided-label guided-label-row">
        <label htmlFor="request">
          <span>2</span>
          Explica el resultado que esperas
        </label>
        <button
          type="button"
          className="load-demo-button"
          onClick={onLoadDemo}
          disabled={busy}
        >
          <Icon name="spark" size={14} />
          Cargar ejemplo completo
        </button>
      </div>
      <div className="textarea-wrap request-wrap">
        <textarea
          id="request"
          value={request}
          onChange={(event) => setRequest(event.target.value)}
          placeholder={activeMission.placeholder}
          maxLength={6000}
          disabled={busy}
        />
        <span className="char-count">{request.length}/6000</span>
      </div>

      <div className="field-help">
        <Icon name="manager" size={15} />
        <span>
          Describe el objetivo con tus palabras. No necesitas elegir agentes ni
          indicarles el orden.
        </span>
      </div>

      <label className="guided-label guided-label-sources" htmlFor="sources">
        <span>3</span>
        Añade los textos que debe utilizar
        <small>Recomendado</small>
      </label>
      <div className="textarea-wrap sources-wrap">
        <textarea
          id="sources"
          value={sources}
          onChange={(event) => setSources(event.target.value)}
          placeholder="Pega aquí artículos, notas o fragmentos. Puedes separar cada fuente con un título..."
          maxLength={18000}
          disabled={busy}
        />
        <Icon name="source" size={17} />
        <span className="char-count">{sources.length}/18000</span>
      </div>
      <p className="sources-note">
        Para obtener un resultado verificable, pega el contenido de las fuentes.
        Esta primera versión todavía no abre enlaces por sí sola.
      </p>

      <div className="submit-row">
        <div className="privacy-note">
          <span />
          La clave permanece en el servidor
        </div>
        <button
          className="primary-button"
          type="submit"
          disabled={busy || request.trim().length < 10}
        >
          {busy ? (
            <>
              <span className="button-spinner" />
              {busy === 'planning' ? 'Diseñando el plan' : 'Equipo trabajando'}
            </>
          ) : (
            <>
              {activeMission.actionLabel}
              <Icon name="chevron" size={17} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function WorkflowStep({
  step,
  index,
  state,
  active,
  onSelect,
  stepById,
}) {
  const meta = AGENTS[step.agent] || AGENTS.writer;
  const status = state?.status || 'pending';
  const rejectTarget = step.onRejectStep
    ? stepById.get(step.onRejectStep)
    : null;

  return (
    <div className="workflow-item">
      <button
        type="button"
        className={`workflow-card ${active ? 'is-active' : ''}`}
        onClick={onSelect}
      >
        <span className="workflow-order">
          {String(index + 1).padStart(2, '0')}
        </span>
        <AgentAvatar agent={step.agent} />
        <span className="workflow-main">
          <span className="workflow-agent">{meta.name}</span>
          <strong>{step.title}</strong>
          <span className="workflow-purpose">{step.purpose}</span>
          <span className="workflow-tags">
            {step.dependsOn.length > 0 ? (
              <span>
                Depende de {step.dependsOn.map((id) => stepById.get(id)?.title || id).join(', ')}
              </span>
            ) : (
              <span>Sin dependencias</span>
            )}
            {rejectTarget && (
              <span className="return-tag">
                <Icon name="route" size={13} />
                Si falla, vuelve a {rejectTarget.title}
              </span>
            )}
          </span>
        </span>
        <span className="workflow-status">
          <StatusMark status={status} />
          <span>{STATUS_LABELS[status]}</span>
        </span>
      </button>
      {index < stepById.size - 1 && <span className="workflow-line" />}
    </div>
  );
}

function StepInspector({ step, state, onClose }) {
  if (!step) return null;
  const meta = AGENTS[step.agent] || AGENTS.writer;
  const status = state?.status || 'pending';

  return (
    <aside className="inspector panel">
      <div className="inspector-header">
        <div className="inspector-agent">
          <AgentAvatar agent={step.agent} />
          <div>
            <span>{meta.name}</span>
            <strong>{step.title}</strong>
          </div>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Cerrar detalles"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="inspector-status">
        <StatusMark status={status} />
        <span>{STATUS_LABELS[status]}</span>
        {state?.attempts > 0 && (
          <span className="attempt-count">
            {state.attempts} {state.attempts === 1 ? 'intento' : 'intentos'}
          </span>
        )}
      </div>

      <div className="inspector-section">
        <span className="inspector-label">Tarea asignada</span>
        <p>{step.task}</p>
      </div>

      <div className="inspector-section">
        <span className="inspector-label">Criterios de aceptación</span>
        <ul>
          {step.acceptanceCriteria.map((criterion) => (
            <li key={criterion}>{criterion}</li>
          ))}
        </ul>
      </div>

      {state?.review && (
        <div className="review-box">
          <div className="review-score">
            <span>Revisión</span>
            <strong>{state.review.score}/100</strong>
          </div>
          <p>{state.review.summary}</p>
          {state.review.issues?.length > 0 && (
            <ul>
              {state.review.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {getStepOutput(state) && (
        <div className="inspector-section inspector-output">
          <span className="inspector-label">Resultado de la fase</span>
          <pre>{getStepOutput(state)}</pre>
        </div>
      )}
    </aside>
  );
}

function ProcessPanel({
  plan,
  stepStates,
  selectedStepId,
  setSelectedStepId,
  runStatus,
}) {
  const stepById = useMemo(
    () => new Map(plan.steps.map((step) => [step.id, step])),
    [plan]
  );
  const selectedStep = stepById.get(selectedStepId);
  const returnRoutes = plan.steps.filter((step) => step.onRejectStep).length;

  return (
    <section className="process-section" aria-live="polite">
      <div className="process-heading">
        <div>
          <span className="section-kicker">Plan del gerente</span>
          <h2>{plan.title}</h2>
          <p>{plan.summary}</p>
        </div>
        <div className={`run-badge run-${runStatus}`}>
          <span />
          {runStatus === 'completed'
            ? 'Proceso terminado'
            : runStatus === 'error'
              ? 'Proceso detenido'
              : 'Proceso en ejecución'}
        </div>
      </div>

      <div className="process-stats">
        <div>
          <strong>{plan.steps.length}</strong>
          <span>fases</span>
        </div>
        <div>
          <strong>{new Set(plan.steps.map((step) => step.agent)).size}</strong>
          <span>agentes elegidos</span>
        </div>
        <div>
          <strong>{returnRoutes}</strong>
          <span>rutas de corrección</span>
        </div>
      </div>

      <div className={`process-layout ${selectedStep ? 'has-inspector' : ''}`}>
        <div className="workflow panel">
          <div className="manager-card">
            <span className="workflow-order">00</span>
            <AgentAvatar manager />
            <span className="workflow-main">
              <span className="workflow-agent">Gerente</span>
              <strong>Diseñar el proceso</strong>
              <span className="workflow-purpose">
                Ha seleccionado el equipo y las rutas de revisión.
              </span>
            </span>
            <span className="workflow-status">
              <StatusMark status="completed" />
              <span>Completado</span>
            </span>
          </div>

          <div className="manager-connector">
            <span />
          </div>

          {plan.steps.map((step, index) => (
            <WorkflowStep
              key={step.id}
              step={step}
              index={index}
              state={stepStates[step.id]}
              active={selectedStepId === step.id}
              onSelect={() => setSelectedStepId(step.id)}
              stepById={stepById}
            />
          ))}
        </div>

        <StepInspector
          step={selectedStep}
          state={selectedStep ? stepStates[selectedStep.id] : null}
          onClose={() => setSelectedStepId('')}
        />
      </div>
    </section>
  );
}

function ResultPanel({ result }) {
  const [copied, setCopied] = useState(false);

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="result-panel panel">
      <div className="result-header">
        <div>
          <span className="section-kicker">Entrega aprobada</span>
          <h2>Resultado final</h2>
        </div>
        <button type="button" className="copy-button" onClick={copyResult}>
          <Icon name="copy" size={16} />
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="result-content">{result}</pre>
    </section>
  );
}

function App() {
  const [request, setRequest] = useState('');
  const [sources, setSources] = useState('');
  const [outputType, setOutputType] = useState('Resumen');
  const [apiStatus, setApiStatus] = useState(null);
  const [runStatus, setRunStatus] = useState('idle');
  const [plan, setPlan] = useState(null);
  const [stepStates, setStepStates] = useState({});
  const [selectedStepId, setSelectedStepId] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const lastDemoIndex = useRef(-1);

  useEffect(() => {
    apiRequest('/api/health')
      .then(setApiStatus)
      .catch(() =>
        setApiStatus({ configured: false, model: 'gemini-3.5-flash' })
      );
  }, []);

  const selectedAgents = useMemo(
    () => new Set(plan?.steps.map((step) => step.agent) || []),
    [plan]
  );

  function handleLoadDemo() {
    let nextIndex;

    do {
      nextIndex = Math.floor(Math.random() * DEMO_MISSIONS.length);
    } while (
      DEMO_MISSIONS.length > 1 &&
      nextIndex === lastDemoIndex.current
    );

    lastDemoIndex.current = nextIndex;
    const demo = DEMO_MISSIONS[nextIndex];

    setOutputType(demo.outputType);
    setRequest(demo.request);
    setSources(demo.sources);
    setPlan(null);
    setStepStates({});
    setSelectedStepId('');
    setResult('');
    setError('');
    setRunStatus('idle');
  }

  async function runAgent(step, context, revisionFeedback = '') {
    return apiRequest('/api/execute', {
      method: 'POST',
      body: JSON.stringify({
        agent: step.agent,
        task: step.task,
        request,
        sources,
        acceptanceCriteria: step.acceptanceCriteria,
        context,
        revisionFeedback,
      }),
    });
  }

  async function executePlan(nextPlan, initialStates) {
    const execution = { ...initialStates };
    let activeStepId = '';

    const updateStep = (stepId, patch) => {
      execution[stepId] = {
        ...execution[stepId],
        ...patch,
      };
      setStepStates({ ...execution });
    };

    const makeContext = (step) =>
      step.dependsOn
        .map((dependencyId) => {
          const dependency = nextPlan.steps.find(
            (candidate) => candidate.id === dependencyId
          );
          const dependencyState = execution[dependencyId];
          if (!dependency || !dependencyState) return null;
          return {
            title: dependency.title,
            agent: AGENTS[dependency.agent]?.name || dependency.agent,
            output: getStepOutput(dependencyState),
          };
        })
        .filter(Boolean);

    try {
      for (const step of nextPlan.steps) {
        activeStepId = step.id;
        setSelectedStepId(step.id);
        updateStep(step.id, {
          status: AGENTS[step.agent] && ['verifier', 'editor'].includes(step.agent)
            ? 'reviewing'
            : 'running',
          attempts: 1,
          error: '',
        });

        let stepResponse = await runAgent(step, makeContext(step));
        updateStep(step.id, {
          status:
            stepResponse.review && !stepResponse.review.approved
              ? 'warning'
              : 'completed',
          output: stepResponse.output || '',
          review: stepResponse.review,
          meta: stepResponse.meta,
        });

        const rejectTargetId =
          stepResponse.review &&
          !stepResponse.review.approved &&
          step.onRejectStep;
        const targetStep = rejectTargetId
          ? nextPlan.steps.find((candidate) => candidate.id === rejectTargetId)
          : null;
        const targetState = targetStep ? execution[targetStep.id] : null;

        if (
          targetStep &&
          targetState &&
          targetState.attempts < targetStep.maxAttempts
        ) {
          const feedback = [
            stepResponse.review.summary,
            ...(stepResponse.review.requiredChanges || []),
          ]
            .filter(Boolean)
            .join('\n- ');

          updateStep(targetStep.id, {
            status: 'correcting',
            attempts: targetState.attempts + 1,
          });
          setSelectedStepId(targetStep.id);

          const correctedResponse = await runAgent(
            targetStep,
            makeContext(targetStep),
            feedback
          );
          updateStep(targetStep.id, {
            status: 'completed',
            output: correctedResponse.output || '',
            review: correctedResponse.review,
            meta: correctedResponse.meta,
          });

          setSelectedStepId(step.id);
          updateStep(step.id, {
            status: 'reviewing',
            attempts: (execution[step.id].attempts || 1) + 1,
          });

          stepResponse = await runAgent(step, makeContext(step), feedback);
          updateStep(step.id, {
            status:
              stepResponse.review && !stepResponse.review.approved
                ? 'warning'
                : 'completed',
            output: stepResponse.output || '',
            review: stepResponse.review,
            meta: stepResponse.meta,
          });
        }
      }

      const finalOutput = [...nextPlan.steps]
        .reverse()
        .map((step) => getStepOutput(execution[step.id]))
        .find(Boolean);

      if (!finalOutput) {
        throw new Error('El proceso terminó sin producir una entrega final.');
      }

      setResult(finalOutput);
      setRunStatus('completed');
      setSelectedStepId(nextPlan.steps[nextPlan.steps.length - 1].id);
    } catch (runError) {
      if (activeStepId) {
        updateStep(activeStepId, {
          status: 'error',
          error: runError.message,
        });
      }
      setRunStatus('error');
      setError(runError.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (request.trim().length < 10 || runStatus === 'planning' || runStatus === 'running') {
      return;
    }

    setError('');
    setResult('');
    setPlan(null);
    setStepStates({});
    setSelectedStepId('');
    setRunStatus('planning');

    try {
      const response = await apiRequest('/api/plan', {
        method: 'POST',
        body: JSON.stringify({
          request,
          sources,
          outputType,
        }),
      });

      const nextPlan = response.plan;
      const initialStates = Object.fromEntries(
        nextPlan.steps.map((step) => [
          step.id,
          {
            status: 'pending',
            attempts: 0,
            output: '',
            review: null,
            error: '',
          },
        ])
      );

      setPlan(nextPlan);
      setStepStates(initialStates);
      setRunStatus('running');
      await executePlan(nextPlan, initialStates);
    } catch (submitError) {
      setRunStatus('error');
      setError(submitError.message);
    }
  }

  const busy =
    runStatus === 'planning'
      ? 'planning'
      : runStatus === 'running'
        ? 'running'
        : '';

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Nexo Research, inicio">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span className="brand-copy">
            <strong>Nexo</strong>
            <small>Research desk</small>
          </span>
        </a>

        <div className="topbar-actions">
          <a
            className="github-link"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="github" size={17} />
            Ver código
            <Icon name="external" size={13} />
          </a>
          <div
            className="api-state"
            aria-label={
              apiStatus?.configured
                ? `Gemini conectado: ${apiStatus.model}`
                : 'Gemini sin configurar'
            }
          >
            <span
              className={`api-dot ${apiStatus?.configured ? 'is-online' : ''}`}
            />
            <span>
              {apiStatus?.configured
                ? 'Gemini conectado'
                : 'Gemini sin configurar'}
            </span>
          </div>
        </div>
      </header>

      <main className="main" id="top">
        <section className="hero">
          <div className="hero-eyebrow">
            <span />
            Inteligencia coordinada
          </div>
          <h1>
            Una pregunta.
            <br />
            <em>El equipo adecuado.</em>
          </h1>
          <p>
            Convierte tus fuentes en resúmenes, comparativas, verificaciones e
            informes. <br/> El gerente organiza el equipo y revisa cada fase por ti.
          </p>
        </section>

        <HowItWorks />

        <section className="workspace" aria-label="Crear una nueva misión">
          <BriefForm
            request={request}
            setRequest={setRequest}
            sources={sources}
            setSources={setSources}
            outputType={outputType}
            setOutputType={setOutputType}
            onLoadDemo={handleLoadDemo}
            onSubmit={handleSubmit}
            busy={busy}
            apiStatus={apiStatus}
          />
          <TeamPanel selectedAgents={selectedAgents} />
        </section>

        {error && (
          <div className="error-banner" role="alert">
            <span>!</span>
            <div>
              <strong>El proceso se ha detenido</strong>
              <p>{error}</p>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => setError('')}
              aria-label="Cerrar error"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        )}

        {plan && (
          <ProcessPanel
            plan={plan}
            stepStates={stepStates}
            selectedStepId={selectedStepId}
            setSelectedStepId={setSelectedStepId}
            runStatus={runStatus}
          />
        )}

        {result && <ResultPanel result={result} />}
      </main>

      <footer className="footer">
        <span>Nexo Research</span>
        <p>Un solo modelo. Distintos roles. Un proceso verificable.</p>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          <Icon name="github" size={15} />
          Proyecto en GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
