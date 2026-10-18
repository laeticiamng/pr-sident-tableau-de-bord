/**
 * Classification des clients Stripe : réels, comptes de test ou internes, indéterminés.
 *
 * Règle (demande du 18.10.2026) : aucun client n'est classé « test » sur une supposition. Chaque classement
 * repose sur une preuve lisible dans Stripe ou dans une configuration explicite, et la preuve est renvoyée.
 * Un client sans preuve de test ni preuve d'achat réel reste « indéterminé ».
 *
 * Fonctions pures (aucun appel réseau) : testées par Vitest (src/test/stripe-kpis-clients.test.ts).
 */

export interface ClientStripe {
  id: string;
  email?: string | null;
  name?: string | null;
  created?: number;
  livemode?: boolean;
  metadata?: Record<string, string> | null;
}

export interface PaiementStripe {
  id?: string;
  customer?: string | null;
  status?: string;
  paid?: boolean;
  amount?: number;
  /** Montant réellement capturé (capture manuelle ou partielle : peut être inférieur à `amount`). */
  amount_captured?: number;
  /** false = autorisation sans capture : aucun fonds encaissé. */
  captured?: boolean;
  amount_refunded?: number;
  livemode?: boolean;
}

export interface AbonnementClient {
  customer?: string | null;
  status?: string;
}

export type CategorieClient = "reel" | "test" | "indetermine";

export interface ClassementClient {
  id: string;
  categorie: CategorieClient;
  /** Preuve du classement (jamais l'adresse e-mail elle-même). */
  preuve: string;
}

export interface RepartitionClients {
  total: number;
  reels: number;
  test: number;
  indetermines: number;
  /** Clients réels créés depuis le 1er du mois (UTC). */
  nouveauxReelsCeMois: number;
}

/** Domaines réservés aux exemples et aux tests (RFC 2606 et RFC 6761) : ils ne reçoivent aucun courrier réel. */
const DOMAINES_RESERVES = ["example.com", "example.net", "example.org"];
const SUFFIXES_RESERVES = [".test", ".example", ".invalid", ".localhost"];

/** Métadonnées posées par nos propres scripts de QA et de tests de bout en bout. */
const CLES_METADONNEES_TEST = ["qa", "test", "e2e"];

const vrai = (v: unknown) => typeof v === "string" && ["true", "1", "oui", "yes"].includes(v.trim().toLowerCase());

function domaineReserve(email: string): boolean {
  const domaine = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domaine) return false;
  return DOMAINES_RESERVES.some((d) => domaine === d || domaine.endsWith(`.${d}`)) ||
    SUFFIXES_RESERVES.some((s) => domaine === s.slice(1) || domaine.endsWith(s)); // revue Codex : « user@localhost » compris
}

/**
 * Identifiants internes connus, fournis par configuration privée (jamais dans ce dépôt public) :
 * identifiants Stripe (`cus_…`), adresses complètes ou préfixes d'adresse terminés par « * ».
 * Exemple de valeur : « cus_ABC, interne@exemple.ch, audit.prefixe.* ».
 */
export function lireIdentifiantsInternes(brut: string | undefined | null): string[] {
  return (brut ?? "")
    .split(/[,;\n]/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

function correspondIdentifiantInterne(client: ClientStripe, identifiants: string[]): boolean {
  const email = client.email?.trim().toLowerCase() ?? "";
  const id = client.id.toLowerCase();
  return identifiants.some((motif) => {
    if (motif.startsWith("cus_")) return motif === id;
    if (!email) return false;
    if (motif.endsWith("*")) return email.startsWith(motif.slice(0, -1));
    return email === motif;
  });
}

/** Preuve explicite qu'un client est un compte de test ou interne, ou null s'il n'y en a aucune. */
export function preuveCompteTest(
  client: ClientStripe,
  contexte: { emailCompteStripe?: string | null; identifiantsInternes?: string[] } = {},
): string | null {
  if (client.livemode === false) return "objet Stripe du mode test";
  const meta = client.metadata ?? {};
  const cle = CLES_METADONNEES_TEST.find((k) => vrai(meta[k]));
  if (cle) return `métadonnée Stripe « ${cle}: true »`;
  if (client.name && /^\s*test\b/i.test(client.name)) return "nom Stripe commençant par « TEST »";
  const email = client.email?.trim().toLowerCase() ?? "";
  if (email && domaineReserve(email)) return "adresse sur un domaine réservé aux tests (RFC 2606 / 6761)";
  const emailCompte = contexte.emailCompteStripe?.trim().toLowerCase();
  if (email && emailCompte && email === emailCompte) return "adresse du titulaire du compte Stripe (compte interne)";
  if (contexte.identifiantsInternes?.length && correspondIdentifiantInterne(client, contexte.identifiantsInternes)) {
    return "identifiant interne déclaré dans la configuration du Cockpit";
  }
  return null;
}

/**
 * Montant réellement conservé d'un paiement : réussi, payé, CAPTURÉ, net des remboursements. Revue Codex : une
 * autorisation non capturée (capture manuelle) ou la part non capturée d'une capture partielle n'est pas encaissée.
 */
const montantConserve = (p: PaiementStripe) => {
  if (p.status !== "succeeded" || p.paid === false || p.captured === false) return 0;
  const capture = typeof p.amount_captured === "number" ? p.amount_captured : typeof p.amount === "number" ? p.amount : 0;
  return capture - (typeof p.amount_refunded === "number" ? p.amount_refunded : 0);
};

/**
 * Classe chaque client. Réel = aucune preuve de test ET au moins un paiement réussi non intégralement remboursé,
 * ou un abonnement actif. Sans l'un ni l'autre : indéterminé (inscription sans achat, essai, achat remboursé).
 */
export function classerClients(
  clients: ClientStripe[],
  paiements: PaiementStripe[],
  abonnements: AbonnementClient[],
  contexte: { emailCompteStripe?: string | null; identifiantsInternes?: string[] } = {},
): ClassementClient[] {
  const conserveParClient = new Map<string, number>();
  for (const p of paiements) {
    if (!p.customer || p.livemode === false) continue;
    conserveParClient.set(p.customer, (conserveParClient.get(p.customer) ?? 0) + montantConserve(p));
  }
  const abonnesActifs = new Set(
    abonnements.filter((a) => a.customer && (a.status === "active" || a.status === "past_due")).map((a) => a.customer as string),
  );
  return clients.map((client) => {
    const preuveTest = preuveCompteTest(client, contexte);
    if (preuveTest) return { id: client.id, categorie: "test", preuve: preuveTest };
    if ((conserveParClient.get(client.id) ?? 0) > 0) {
      return { id: client.id, categorie: "reel", preuve: "paiement réussi non intégralement remboursé" };
    }
    if (abonnesActifs.has(client.id)) return { id: client.id, categorie: "reel", preuve: "abonnement actif" };
    return { id: client.id, categorie: "indetermine", preuve: "aucune preuve de test ni d'achat conservé" };
  });
}

export function repartirClients(
  clients: ClientStripe[],
  classement: ClassementClient[],
  debutMois: number,
): RepartitionClients {
  const parId = new Map(classement.map((c) => [c.id, c.categorie]));
  const compter = (cat: CategorieClient) => classement.filter((c) => c.categorie === cat).length;
  return {
    total: clients.length,
    reels: compter("reel"),
    test: compter("test"),
    indetermines: compter("indetermine"),
    nouveauxReelsCeMois: clients.filter((c) => parId.get(c.id) === "reel" && typeof c.created === "number" && c.created >= debutMois).length,
  };
}
