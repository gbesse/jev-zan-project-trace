// Objectif : effectuer un appel Jev synthétique uniquement sur demande explicite.
import { createJevClient } from "../src/jev.mjs";
import { traceLandUseProject } from "../src/index.mjs";
const client = createJevClient();
const résultat = await traceLandUseProject({
  "id": "exemple-1",
  "text": "Construction de douze logements sur une friche déjà imperméabilisée à l’intérieur de l’enveloppe urbaine.",
  "source": {
    "url": "https://example.test/source-publique",
    "date": "2026-09-25"
  },
  "details": {
    "territoire": "Commune Exemple",
    "origine": "donnée synthétique"
  }
}, client);
console.log(JSON.stringify({ décision: résultat.decision, confiance: résultat.confidence, usage: résultat.usage }, null, 2));
