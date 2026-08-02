import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const negotiationResponse = {
  round: 1,
  positions: [
    {
      participantId: 'henar',
      participantName: 'Henar',
      status: 'open',
      publicMessage: 'Me encaja un plan céntrico, tranquilo y de precio moderado.',
      priorities: [],
      concessions: ['La zona exacta'],
      ideas: [],
      compatibilityScore: 88,
    },
    {
      participantId: 'lucia',
      participantName: 'Lucía',
      status: 'cautious',
      publicMessage: 'Necesito que sea después de las 20:30.',
      priorities: [],
      concessions: ['El tipo de comida'],
      ideas: [],
      compatibilityScore: 76,
    },
    {
      participantId: 'marcos',
      participantName: 'Marcos',
      status: 'open',
      publicMessage: 'Puedo adaptarme si evitamos comida asiática.',
      priorities: [],
      concessions: ['La zona'],
      ideas: [],
      compatibilityScore: 82,
    },
    {
      participantId: 'pablo',
      participantName: 'Pablo',
      status: 'open',
      publicMessage: 'Me adapto al grupo si podemos ir en transporte público.',
      priorities: [],
      concessions: ['El horario'],
      ideas: [],
      compatibilityScore: 92,
    },
  ],
  mediation: {
    mediatorMessage: 'La propuesta prioriza el horario y el transporte compartidos.',
    consensusScore: 86,
    needsAnotherRound: false,
    proposal: {
      headline: 'Cena tranquila en el centro',
      when: 'Viernes a las 20:45',
      where: 'Zona de Atocha',
      estimatedCost: 'Entre 20 y 25 € por persona',
      description: 'Una cena informal y bien conectada para todo el grupo.',
      steps: ['Elegir un restaurante compatible', 'Confirmar la reserva'],
      whyItWorks: ['Respeta el horario más restrictivo'],
      compromises: ['La zona exacta queda por confirmar'],
      pendingQuestions: [],
    },
  },
  meta: {
    model: 'gemini-3.5-flash',
    calls: 5,
    totalTokens: 1200,
  },
};

function mockFetch() {
  global.fetch = jest.fn((url) => {
    if (url === '/api/health') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ configured: true }),
      });
    }

    if (url === '/api/negotiate') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(negotiationResponse),
      });
    }

    return Promise.reject(new Error(`Unexpected request: ${url}`));
  });
}

beforeEach(() => {
  mockFetch();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the Nexo Pact workspace', async () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: /menos mensajes/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /iniciar negociación/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /github/i })
  ).toHaveAttribute('href', 'https://github.com/henar2004/nexo-pact');

  await waitFor(() =>
    expect(screen.getByText(/gemini conectado/i)).toBeInTheDocument()
  );
});

test('loads the demo and renders a mediated proposal', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /cargar ejemplo/i }));
  expect(screen.getByLabelText(/objetivo del grupo/i)).toHaveValue(
    'Encontrar un sitio para cenar juntos este viernes'
  );

  fireEvent.click(
    screen.getByRole('button', { name: /iniciar negociación/i })
  );

  expect(
    await screen.findByRole('heading', {
      name: /cena tranquila en el centro/i,
    })
  ).toBeInTheDocument();
  expect(screen.getByText(/86% de encaje/i)).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith(
    '/api/negotiate',
    expect.objectContaining({ method: 'POST' })
  );
});
