import { EmptyNegotiation } from './EmptyNegotiation';
import { NegotiatingState } from './NegotiatingState';
import { ProposalCard } from './ProposalCard';

export function NegotiationPanel({
  runStatus,
  participants,
  round,
  result,
  votes,
  feedback,
  onVote,
  onFeedback,
  onNextRound,
  onReset,
  onCopy,
}) {
  let content;

  if (runStatus === 'negotiating') {
    content = <NegotiatingState participants={participants} round={round} />;
  } else if (result) {
    content = (
      <ProposalCard
        feedback={feedback}
        onCopy={onCopy}
        onFeedback={onFeedback}
        onNextRound={onNextRound}
        onReset={onReset}
        onVote={onVote}
        participants={participants}
        result={result}
        votes={votes}
      />
    );
  } else {
    content = <EmptyNegotiation participants={participants} />;
  }

  return (
    <section className="negotiation-panel" aria-live="polite">
      {content}
    </section>
  );
}
