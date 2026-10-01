// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";
export const DECISIONS = Object.freeze({
  "densification": "densification",
  "extension": "extension",
  "renaturation": "renaturation",
  "ambiguous": "ambigu",
  "no_land_change": "sans_changement_foncier"
});
const CRITERIA = Object.freeze({
  "densification": "densification",
  "extension": "extension",
  "renaturation": "renaturation",
  "ambiguous": "ambigu",
  "no_land_change": "sans changement foncier"
});
export function landUseCase(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf())) throw new TypeError("source.date doit être une date ISO valide");
  return { ...input, id: String(input.id), text: String(input.text).trim(), source: { url: String(input.source.url), date: date.toISOString() } };
}
export async function traceLandUseProject(input, provider) {
  const record = landUseCase(input);
  if (record.landChangeM2 === 0) return { decision: "no_land_change", label: DECISIONS["no_land_change"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce projet d’aménagement à partir des seuls éléments sourcés. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni droit applicable, ni garantie.", criteria: CRITERIA } },
  });
  const answer = response.answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8, deterministic: false, usage: response.usage };
}
export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-zan-project-trace <dossier.json>");
  const dossier = landUseCase(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier, prochaineÉtape: "Transmettez ce dossier à traceLandUseProject avec un fournisseur Jev configuré." }, null, 2));
}
