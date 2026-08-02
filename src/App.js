import { useMemo, useState } from 'react';
import './App.css';
import { MAX_PARTICIPANTS } from './config';
import { DEMO } from './data/demo';
import { useGeminiHealth } from './hooks/useGeminiHealth';
import { apiRequest } from './services/api';
import { createParticipant } from './utils/participants';
import { Header } from './components/layout/Header';
import { Hero } from './components/layout/Hero';
import { Footer } from './components/layout/Footer';
import { PactSetup } from './components/pact/PactSetup';
import { NegotiationPanel } from './components/negotiation/NegotiationPanel';

function App() {
  const [topic, setTopic] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [area, setArea] = useState('');
  const [details, setDetails] = useState('');
  const [participants, setParticipants] = useState(() => [
    createParticipant(0),
    createParticipant(1),
  ]);
  const [activeParticipantId, setActiveParticipantId] = useState(
    participants[0].id
  );
  const [runStatus, setRunStatus] = useState('idle');
  const [round, setRound] = useState(1);
  const [result, setResult] = useState(null);
  const [votes, setVotes] = useState({});
  const [feedback, setFeedback] = useState({});
  const [error, setError] = useState('');
  const [copyLabel, setCopyLabel] = useState('');
  const connection = useGeminiHealth();

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
      <Header connection={connection} />

      <main id="inicio">
        <Hero />

        <section className="workspace">
          <PactSetup
            activeIndex={activeIndex}
            activeParticipant={activeParticipant}
            activeParticipantId={activeParticipantId}
            area={area}
            details={details}
            error={error}
            onActiveParticipantChange={setActiveParticipantId}
            onAddParticipant={addParticipant}
            onAreaChange={setArea}
            onDetailsChange={setDetails}
            onLoadDemo={loadDemo}
            onNegotiate={() => negotiate(1)}
            onParticipantChange={updateParticipant}
            onRemoveParticipant={removeParticipant}
            onTargetDateChange={setTargetDate}
            onTopicChange={setTopic}
            participants={participants}
            runStatus={runStatus}
            targetDate={targetDate}
            topic={topic}
          />

          <NegotiationPanel
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
            round={round}
            runStatus={runStatus}
            votes={votes}
          />
        </section>
      </main>

      {copyLabel && <div className="toast">{copyLabel}</div>}
      <Footer />
    </div>
  );
}

export default App;
