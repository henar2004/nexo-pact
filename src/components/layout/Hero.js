import { Icon } from '../common/Icon';

export function Hero() {
  return (
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
  );
}
