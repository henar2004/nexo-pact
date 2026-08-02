export function createParticipant(index) {
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
