const { agents, agentIds } = require('./agents');

const MAX_STEPS = 5;

function cleanString(value, fallback = '', maxLength = 1200) {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, maxLength) || fallback;
}

function createFallbackPlan(hasSources) {
  const firstAgent = hasSources ? 'researcher' : 'analyst';

  return {
    title: 'Análisis y redacción',
    summary:
      'El gerente ha elegido una ruta compacta: preparar el material, redactarlo y revisarlo.',
    steps: [
      {
        id: 'step_1',
        agent: firstAgent,
        title: hasSources ? 'Extraer evidencias' : 'Analizar la petición',
        purpose: 'Preparar una base fiable para la redacción.',
        task: hasSources
          ? 'Extrae los hallazgos relevantes de las fuentes proporcionadas.'
          : 'Organiza los requisitos, ideas y matices necesarios para responder.',
        dependsOn: [],
        acceptanceCriteria: ['Información organizada y sin datos inventados'],
        onRejectStep: '',
        maxAttempts: 2,
      },
      {
        id: 'step_2',
        agent: 'writer',
        title: 'Redactar la entrega',
        purpose: 'Convertir el análisis en el resultado solicitado.',
        task: 'Redacta una respuesta completa que cumpla todos los requisitos.',
        dependsOn: ['step_1'],
        acceptanceCriteria: ['Responde a la solicitud', 'Mantiene un tono claro'],
        onRejectStep: '',
        maxAttempts: 2,
      },
      {
        id: 'step_3',
        agent: 'editor',
        title: 'Revisar el resultado',
        purpose: 'Comprobar que la entrega sea clara y cumpla los requisitos.',
        task: 'Revisa la redacción final y aprueba o solicita cambios concretos.',
        dependsOn: ['step_2'],
        acceptanceCriteria: ['Sin omisiones importantes', 'Formato correcto'],
        onRejectStep: 'step_2',
        maxAttempts: 2,
      },
    ],
  };
}

function normalizePlan(rawPlan, hasSources) {
  if (!rawPlan || !Array.isArray(rawPlan.steps) || rawPlan.steps.length < 2) {
    return createFallbackPlan(hasSources);
  }

  const rawSteps = rawPlan.steps.slice(0, MAX_STEPS);
  const oldIdToNewId = new Map();

  rawSteps.forEach((step, index) => {
    const oldId = cleanString(step?.id, `step_${index + 1}`, 80);
    oldIdToNewId.set(oldId, `step_${index + 1}`);
  });

  const steps = rawSteps.map((step, index) => {
    const id = `step_${index + 1}`;
    const previousIds = new Set(
      rawSteps
        .slice(0, index)
        .map((previousStep, previousIndex) =>
          oldIdToNewId.get(
            cleanString(previousStep?.id, `step_${previousIndex + 1}`, 80)
          )
        )
    );

    const agent = agentIds.includes(step?.agent) ? step.agent : 'writer';
    const isReviewer = Boolean(agents[agent]?.review);

    let dependsOn = Array.isArray(step?.dependsOn)
      ? [...new Set(
          step.dependsOn
            .map((dependency) => oldIdToNewId.get(cleanString(dependency, '', 80)))
            .filter((dependency) => previousIds.has(dependency))
        )].slice(0, 4)
      : [];

    if (isReviewer && index > 0 && dependsOn.length === 0) {
      dependsOn = [`step_${index}`];
    }

    const requestedRejectTarget = oldIdToNewId.get(
      cleanString(step?.onRejectStep, '', 80)
    );
    const defaultRejectTarget =
      index > 0 ? `step_${index}` : '';
    const onRejectStep =
      isReviewer && previousIds.has(requestedRejectTarget)
        ? requestedRejectTarget
        : isReviewer
          ? defaultRejectTarget
          : '';

    const acceptanceCriteria = Array.isArray(step?.acceptanceCriteria)
      ? step.acceptanceCriteria
          .map((criterion) => cleanString(criterion, '', 180))
          .filter(Boolean)
          .slice(0, 4)
      : [];

    return {
      id,
      agent,
      title: cleanString(step?.title, agents[agent].name, 100),
      purpose: cleanString(
        step?.purpose,
        agents[agent].description,
        280
      ),
      task: cleanString(
        step?.task,
        `Realiza la fase ${index + 1} de la solicitud.`,
        1200
      ),
      dependsOn,
      acceptanceCriteria:
        acceptanceCriteria.length > 0
          ? acceptanceCriteria
          : ['Cumplir la tarea asignada sin inventar información'],
      onRejectStep,
      maxAttempts: Number(step?.maxAttempts) === 2 ? 2 : 1,
    };
  });

  const lastStep = steps[steps.length - 1];
  if (!['writer', 'editor', 'synthesizer'].includes(lastStep.agent)) {
    if (steps.length < MAX_STEPS) {
      steps.push({
        id: `step_${steps.length + 1}`,
        agent: 'synthesizer',
        title: 'Preparar la entrega',
        purpose: 'Transformar los resultados en una respuesta utilizable.',
        task: 'Combina los resultados anteriores y crea la entrega final.',
        dependsOn: [lastStep.id],
        acceptanceCriteria: ['Responder de forma completa a la solicitud original'],
        onRejectStep: '',
        maxAttempts: 1,
      });
    } else {
      lastStep.agent = 'synthesizer';
      lastStep.title = 'Preparar la entrega';
      lastStep.task = 'Combina los resultados anteriores y crea la entrega final.';
      lastStep.onRejectStep = '';
    }
  }

  return {
    title: cleanString(rawPlan.title, 'Nuevo proceso', 100),
    summary: cleanString(
      rawPlan.summary,
      'El gerente ha creado una ruta de trabajo adaptada a la solicitud.',
      480
    ),
    steps,
  };
}

module.exports = {
  normalizePlan,
};
