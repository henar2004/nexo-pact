import { MAX_PARTICIPANTS } from '../../config';
import { Avatar } from '../common/Avatar';
import { Field } from '../common/Field';
import { Icon } from '../common/Icon';
import { ParticipantEditor } from './ParticipantEditor';

export function PactSetup({
  topic,
  targetDate,
  area,
  details,
  participants,
  activeParticipantId,
  activeParticipant,
  activeIndex,
  runStatus,
  error,
  onTopicChange,
  onTargetDateChange,
  onAreaChange,
  onDetailsChange,
  onActiveParticipantChange,
  onParticipantChange,
  onAddParticipant,
  onRemoveParticipant,
  onLoadDemo,
  onNegotiate,
}) {
  return (
    <aside className="setup-panel">
      <div className="panel-heading">
        <div>
          <span className="step-number">01</span>
          <span className="eyebrow">El pacto</span>
          <h2>¿Qué necesitáis acordar?</h2>
        </div>
        <button className="text-button" onClick={onLoadDemo} type="button">
          Cargar ejemplo
        </button>
      </div>

      <div className="setup-fields">
        <Field label="Objetivo del grupo">
          <textarea
            maxLength="3000"
            onChange={(event) => onTopicChange(event.target.value)}
            placeholder="Ej. Encontrar un sitio para cenar este viernes"
            rows="3"
            value={topic}
          />
        </Field>
        <div className="two-columns">
          <Field label="Fecha o periodo">
            <input
              maxLength="300"
              onChange={(event) => onTargetDateChange(event.target.value)}
              placeholder="Viernes por la noche"
              value={targetDate}
            />
          </Field>
          <Field label="Zona">
            <input
              maxLength="300"
              onChange={(event) => onAreaChange(event.target.value)}
              placeholder="Madrid centro"
              value={area}
            />
          </Field>
        </div>
        <Field label="Contexto compartido" hint="Visible para todos">
          <textarea
            maxLength="2500"
            onChange={(event) => onDetailsChange(event.target.value)}
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
              onClick={() => onActiveParticipantChange(participant.id)}
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
              onClick={onAddParticipant}
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
            onChange={onParticipantChange}
            onRemove={onRemoveParticipant}
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
        onClick={onNegotiate}
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
  );
}
