// Objectif : vérifier la normalisation, la règle déterministe et les décisions sémantiques.
import test from "node:test";
import assert from "node:assert/strict";
import { landUseCase, traceLandUseProject } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const casLimite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-09-27"
  },
  "landChangeM2": 0
};
const casPrincipal = {
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
};
const casÀRevoir = {
  "id": "revue-1",
  "text": "Extension d’un équipement public sur une parcelle mêlant parking existant, pelouse et ancien terrain agricole.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-09-26"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};
test("exige une source", () => assert.throws(() => landUseCase({ id: "x", text: "y" }), /source/));
test("applique le cas limite sans appel Jev", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  assert.equal((await traceLandUseProject(casLimite, provider)).decision, "no_land_change");
  assert.equal(provider.calls, 0);
});
test("classe un dossier sourcé avec une confiance suffisante", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "densification", probabilities: {
  "densification": 0.82,
  "extension": 0.045,
  "renaturation": 0.045,
  "ambiguous": 0.045,
  "no_land_change": 0.045
}, confidence: 0.82 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await traceLandUseProject(casPrincipal, provider);
  assert.equal(résultat.decision, "densification");
  assert.equal(résultat.review, false);
  assert.equal(provider.calls, 1);
});
test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "ambiguous", probabilities: {
  "densification": 0.12,
  "extension": 0.12,
  "renaturation": 0.12,
  "ambiguous": 0.52,
  "no_land_change": 0.12
}, confidence: 0.62 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await traceLandUseProject(casÀRevoir, provider);
  assert.equal(résultat.decision, "ambiguous");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
  assert.equal(provider.calls, 1);
});
