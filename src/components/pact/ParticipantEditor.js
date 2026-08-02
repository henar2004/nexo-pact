import { Avatar } from '../common/Avatar';
import { Field } from '../common/Field';
import { Icon } from '../common/Icon';

export function ParticipantEditor({
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
