const { callGemini } = require('./_lib/gemini');
const {
  mediationSchema,
  positionSchema,
} = require('./_lib/schemas');

const MAX_PARTICIPANTS = 6;
const MAX_ROUNDS = 3;

function cleanText(value, maxLength) {
  return typeof value === 'string'
    ? value.trim().slice(0, maxLength)
    : '';
}

function normalizeParticipant(participant, index) {
  return {
    id: cleanText(participant?.id, 80) || `person_${index + 1}`,
    name: cleanText(participant?.name, 60) || `Persona ${index + 1}`,
    availability: cleanText(participant?.availability, 1200),
    budget: cleanText(participant?.budget, 500),
    preferences: cleanText(participant?.preferences, 2200),
    nonNegotiables: cleanText(participant?.nonNegotiables, 1400),
    privateNotes: cleanText(participant?.privateNotes, 1600),
    feedback: cleanText(participant?.feedback, 1400),
  };
}

function personalAgentInstruction(participant) {
  return `
Eres el agente personal y privado de ${participant.name} dentro de Nexo Pact.
Tu única responsabilidad es representar bien a esta persona durante una
negociación de grupo.

REGLAS DE PRIVACIDAD:
- El perfil privado nunca debe reproducirse literalmente en el mensaje público.
- No reveles motivos personales, límites económicos exactos ni notas privadas
  salvo que el perfil autorice expresamente compartirlos.
- Traduce la información privada a la restricción pública mínima necesaria.
  Por ejemplo: "busquemos una opción más económica", sin explicar el motivo.

REGLAS DE NEGOCIACIÓN:
- Distingue requisitos imprescindibles de preferencias.
- Busca acuerdos viables y ofrece concesiones reales.
- No inventes disponibilidad, presupuesto, permisos ni preferencias.
- Si existe una propuesta anterior, evalúala desde el interés de tu persona.
- Usa status "blocked" solo cuando una condición imprescindible no pueda
  cumplirse; "cautious" si hacen falta cambios y "open" si hay margen de acuerdo.
- participantId debe ser exactamente "${participant.id}".
- Devuelve únicamente el JSON solicitado.
`.trim();
}

const mediatorInstruction = `
Eres el mediador neutral de Nexo Pact. Recibes únicamente posiciones públicas
preparadas por agentes personales. No tienes acceso a sus perfiles privados.

Tu objetivo es crear una propuesta concreta, justa y realizable que maximice el
acuerdo sin ignorar ningún requisito marcado como imprescindible.

REGLAS:
- Trata a todos los participantes con el mismo peso.
- Explica los compromisos importantes sin atribuir información privada.
- Prioriza los requisitos sobre las preferencias.
- Aprovecha las concesiones declaradas.
- Si faltan datos verificables, escribe "Por confirmar". No inventes reservas,
  horarios comerciales, precios exactos ni disponibilidad de establecimientos.
- Si una propuesta anterior fue rechazada, cambia los elementos que causaron el
  rechazo en lugar de repetirla.
- needsAnotherRound será true si permanece un bloqueo o una pregunta esencial.
- Devuelve únicamente el JSON solicitado.
`.trim();

function formatSharedContext({ topic, targetDate, area, details, round }) {
  return `
<pacto>
Objetivo: ${topic}
Fecha o periodo: ${targetDate || 'Sin fecha indicada'}
Zona: ${area || 'Sin zona indicada'}
Detalles compartidos: ${details || 'Sin detalles adicionales'}
Ronda: ${round}
</pacto>
`.trim();
}

function formatPrivateProfile(participant) {
  return `
<perfil_privado>
Disponibilidad: ${participant.availability || 'No indicada'}
Presupuesto: ${participant.budget || 'No indicado'}
Preferencias: ${participant.preferences || 'No indicadas'}
No negociable: ${participant.nonNegotiables || 'Nada indicado'}
Notas estrictamente privadas: ${participant.privateNotes || 'Ninguna'}
Comentarios tras la ronda anterior: ${participant.feedback || 'Ninguno'}
</perfil_privado>
`.trim();
}

function totalTokens(results) {
  return results.reduce((sum, result) => {
    const usage = result?.usage || {};
    return sum + Number(usage.total_tokens || usage.totalTokens || 0);
  }, 0);
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Método no permitido.' });
  }

  const topic = cleanText(request.body?.topic, 3000);
  const targetDate = cleanText(request.body?.targetDate, 300);
  const area = cleanText(request.body?.area, 300);
  const details = cleanText(request.body?.details, 2500);
  const previousProposal = request.body?.previousProposal || null;
  const round = Math.min(
    Math.max(Number(request.body?.round) || 1, 1),
    MAX_ROUNDS
  );

  const participants = Array.isArray(request.body?.participants)
    ? request.body.participants
        .slice(0, MAX_PARTICIPANTS)
        .map(normalizeParticipant)
    : [];

  if (topic.length < 8) {
    return response.status(400).json({
      error: 'Describe el pacto con al menos 8 caracteres.',
    });
  }

  if (participants.length < 2) {
    return response.status(400).json({
      error: 'El pacto necesita al menos dos participantes.',
    });
  }

  const ids = new Set(participants.map((participant) => participant.id));
  if (ids.size !== participants.length) {
    return response.status(400).json({
      error: 'Cada participante debe tener un identificador diferente.',
    });
  }

  const sharedContext = formatSharedContext({
    topic,
    targetDate,
    area,
    details,
    round,
  });
  const previousProposalText = previousProposal
    ? JSON.stringify(previousProposal).slice(0, 7000)
    : 'No existe una propuesta anterior.';

  try {
    const positionResults = await Promise.all(
      participants.map((participant) =>
        callGemini({
          systemInstruction: personalAgentInstruction(participant),
          responseSchema: positionSchema,
          input: `
${sharedContext}

${formatPrivateProfile(participant)}

<propuesta_anterior>
${previousProposalText}
</propuesta_anterior>

Prepara la posición pública de ${participant.name} para esta ronda.
          `.trim(),
        })
      )
    );

    const positions = positionResults.map((result, index) => ({
      ...result.data,
      participantId: participants[index].id,
      participantName: participants[index].name,
    }));

    const publicPositions = positions.map((position) => ({
      participantId: position.participantId,
      participantName: position.participantName,
      status: position.status,
      publicMessage: cleanText(position.publicMessage, 1200),
      priorities: position.priorities,
      concessions: position.concessions,
      ideas: position.ideas,
      compatibilityScore: position.compatibilityScore,
    }));

    const mediationResult = await callGemini({
      systemInstruction: mediatorInstruction,
      responseSchema: mediationSchema,
      input: `
${sharedContext}

<propuesta_anterior>
${previousProposalText}
</propuesta_anterior>

<posiciones_publicas>
${JSON.stringify(publicPositions)}
</posiciones_publicas>

Crea la mejor propuesta posible para esta ronda.
      `.trim(),
    });

    return response.status(200).json({
      round,
      positions: publicPositions,
      mediation: mediationResult.data,
      meta: {
        model: mediationResult.model,
        calls: positionResults.length + 1,
        totalTokens: totalTokens([...positionResults, mediationResult]),
      },
    });
  } catch (error) {
    return response.status(500).json({
      error:
        error?.message ||
        'No se pudo completar la ronda de negociación.',
    });
  }
};
