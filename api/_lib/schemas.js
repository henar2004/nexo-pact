const positionSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    participantId: {
      type: 'string',
      description: 'Identificador exacto del participante representado.',
    },
    status: {
      type: 'string',
      enum: ['open', 'cautious', 'blocked'],
      description: 'Grado de compatibilidad de la posición actual con el pacto.',
    },
    publicMessage: {
      type: 'string',
      description:
        'Mensaje público breve. Debe proteger las notas privadas y revelar solo lo necesario para negociar.',
    },
    priorities: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          label: { type: 'string' },
          level: {
            type: 'string',
            enum: ['required', 'preferred'],
          },
        },
        required: ['label', 'level'],
      },
    },
    concessions: {
      type: 'array',
      maxItems: 4,
      items: { type: 'string' },
      description: 'Aspectos en los que el agente puede ceder.',
    },
    ideas: {
      type: 'array',
      maxItems: 4,
      items: { type: 'string' },
      description: 'Opciones concretas que podrían acercar al grupo.',
    },
    compatibilityScore: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
    },
  },
  required: [
    'participantId',
    'status',
    'publicMessage',
    'priorities',
    'concessions',
    'ideas',
    'compatibilityScore',
  ],
};

const mediationSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    mediatorMessage: {
      type: 'string',
      description: 'Explicación breve de cómo se ha construido el acuerdo.',
    },
    consensusScore: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
    },
    needsAnotherRound: {
      type: 'boolean',
      description: 'Indica si quedan conflictos públicos importantes por resolver.',
    },
    proposal: {
      type: 'object',
      additionalProperties: false,
      properties: {
        headline: {
          type: 'string',
          description: 'Nombre breve y atractivo de la propuesta.',
        },
        when: {
          type: 'string',
          description: 'Fecha y hora propuestas, o "Por confirmar".',
        },
        where: {
          type: 'string',
          description: 'Lugar o zona propuesta, o "Por confirmar".',
        },
        estimatedCost: {
          type: 'string',
          description: 'Coste estimado por persona o total, o "Por confirmar".',
        },
        description: {
          type: 'string',
          description: 'Resumen concreto del plan propuesto.',
        },
        steps: {
          type: 'array',
          maxItems: 6,
          items: { type: 'string' },
        },
        whyItWorks: {
          type: 'array',
          maxItems: 6,
          items: { type: 'string' },
        },
        compromises: {
          type: 'array',
          maxItems: 5,
          items: { type: 'string' },
        },
        pendingQuestions: {
          type: 'array',
          maxItems: 5,
          items: { type: 'string' },
        },
      },
      required: [
        'headline',
        'when',
        'where',
        'estimatedCost',
        'description',
        'steps',
        'whyItWorks',
        'compromises',
        'pendingQuestions',
      ],
    },
  },
  required: [
    'mediatorMessage',
    'consensusScore',
    'needsAnotherRound',
    'proposal',
  ],
};

module.exports = {
  mediationSchema,
  positionSchema,
};
