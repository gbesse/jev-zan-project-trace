// Objectif : vérifier que les types publics sont importables.
import { landUseCase, traceLandUseProject } from "../src/index.mjs";
const dossier = landUseCase({
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
});
void traceLandUseProject(dossier, { decide: async () => ({}) });
