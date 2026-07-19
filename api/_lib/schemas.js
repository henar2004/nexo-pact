const { agentIds } = require('./agents');

const planSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: {
      type: 'string',
      description: 'Nombre corto del proceso, con un máximo aproximado de seis palabras.',
    },
    summary: {
      type: 'string',
      description: 'Explicación breve de la estrategia elegida por el gerente.',
    },
    steps: {
      type: 'array',
      minItems: 2,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: {
            type: 'string',
            description: 'Identificador secuencial: step_1, step_2, etc.',
          },
          agent: {
            type: 'string',
            enum: agentIds,
          },
          title: {
            type: 'string',
            description: 'Nombre corto y comprensible de la fase.',
          },
          purpose: {
            type: 'string',
            description: 'Motivo por el que esta fase es necesaria.',
          },
          task: {
            type: 'string',
            description: 'Instrucción concreta que recibirá el agente.',
          },
          dependsOn: {
            type: 'array',
            maxItems: 4,
            items: { type: 'string' },
            description: 'Identificadores de pasos anteriores necesarios.',
          },
          acceptanceCriteria: {
            type: 'array',
            minItems: 1,
            maxItems: 4,
            items: { type: 'string' },
          },
          onRejectStep: {
            type: 'string',
            description: 'Paso anterior al que volver si la revisión falla, o cadena vacía.',
          },
          maxAttempts: {
            type: 'integer',
            minimum: 1,
            maximum: 2,
          },
        },
        required: [
          'id',
          'agent',
          'title',
          'purpose',
          'task',
          'dependsOn',
          'acceptanceCriteria',
          'onRejectStep',
          'maxAttempts',
        ],
      },
    },
  },
  required: ['title', 'summary', 'steps'],
};

const reviewSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    approved: {
      type: 'boolean',
      description: 'Indica si el trabajo puede pasar a la siguiente fase.',
    },
    score: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
    },
    summary: {
      type: 'string',
      description: 'Diagnóstico breve de la revisión.',
    },
    issues: {
      type: 'array',
      maxItems: 5,
      items: { type: 'string' },
    },
    requiredChanges: {
      type: 'array',
      maxItems: 5,
      items: { type: 'string' },
    },
    finalText: {
      type: 'string',
      description: 'Versión aprobada o corregida del material. Puede quedar vacía si se rechaza.',
    },
  },
  required: [
    'approved',
    'score',
    'summary',
    'issues',
    'requiredChanges',
    'finalText',
  ],
};

module.exports = {
  planSchema,
  reviewSchema,
};
