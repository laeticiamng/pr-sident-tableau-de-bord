

# AUDIT DÉFINITIF POST-CORRECTIONS — EMOTIONSCARE SASU
## Rapport d'audit v2 — 6 mars 2026

---

## 1. RÉSUMÉ EXÉCUTIF

La plateforme a significativement progressé depuis le dernier audit. Les 3 P0 identifiés ont été corrigés : `trust-seal-chain` ajouté au schema de validation, reset password implémenté, CTA "Nous contacter" ajouté sur la landing. La page Sécurité HQ utilise maintenant `null` au lieu de données hardcodées, avec des empty states corrects. Le panic switch persiste désormais via la DB.

Cependant, des problèmes structurels demeurent inchangés et de nouvelles observations émergent de l'inspection post-correction.

**Publiable aujourd'hui : OUI SOUS CONDITIONS**
- Site vitrine public : OUI
- HQ interne mono-utilisateur : OUI
- Produit SaaS pour utilisateurs payants : NON

**Note globale : 14.5/20** (progression de +1.5 depuis le dernier audit)

**Top 5 des risques restants :**
1. StatusPage `/status` — `toutOperationnel = true` toujours hardcodé (ligne 31). Page de statut entièrement fictive.
2. Landing page — la section "Features" décrit les fonctionnalités du HQ interne ("validation présidentielle", "briefings de direction"), pas un produit que le visiteur peut acheter. Confusion de positionnement.
3. Cookie banner — toujours en position `fixed bottom-0`, recouvre le hero sur mobile au premier chargement.
4. "39 Agents IA" sur la page auth — chiffre hardcodé (ligne 314) non connecté à une donnée réelle.
5. Sidebar HQ — 27 liens (7 main + 20 secondary) inchangée. Surcharge cognitive intacte.

**Top 5 des forces confirmées :**
1. Reset password fonctionnel avec validation Zod, gestion de session recovery, et redirection automatique.
2. IncidentCounter affiche correctement un empty state "Aucune donnée d'incident" quand `null`.
3. Panic switch dérive maintenant son état de `autopilotConfig` DB — persistant.
4. Validation complète avec `trust-seal-chain` dans le schema.
5. CTA "Nous contacter" / "Demander une démonstration" ajoutés en hero + CTA bottom, i18n FR/EN/DE.

---

## 2. TABLEAU SCORE GLOBAL POST-CORRECTIONS

| Dimension | Note /20 | Observation | Criticité | Décision |
|---|---|---|---|---|
| Compréhension produit | 11 | CTA contact ajouté mais positionnement vitrine vs HQ interne reste confus | Majeur | Clarifier la proposition publique |
| Landing / Accueil | 15 | CTA ajouté, mais features décrivent le HQ, pas un produit achetable | Mineur | Recentrer le copywriting |
| Reset password | 17 | Implémenté, validé, avec gestion de lien expiré et feedback | — | OK |
| Navigation publique | 16 | Inchangée, solide | Mineur | OK |
| Navigation HQ | 14 | Sidebar toujours 27 liens, section "Tous les services" aide mais insuffisant | Majeur | Réduire |
| Clarté UX | 14 | Sécurité HQ corrigée, mais StatusPage reste fictive | Majeur | Corriger StatusPage |
| Sécurité préproduction | 17 | Panic switch persisté, reset password, RLS, validation Zod | Mineur | OK |
| Conformité go-live | 16 | Inchangée, complète | Mineur | OK |

---

## 3. VÉRIFICATION DES CORRECTIONS P0/P1

### P0-1 : `trust-seal-chain` dans validation.ts — CORRIGÉ
- Ligne 91 : `"trust-seal-chain"` présent dans `platformKeySchema`. Validé.

### P0-2 : Reset password — CORRIGÉ
- `AuthPage.tsx` : lien "Mot de passe oublié ?" (ligne 159-165). Dialog modal avec envoi via `supabase.auth.resetPasswordForEmail`. Feedback "Email envoyé" avec message approprié. Validé.
- `ResetPasswordPage.tsx` : Gestion complète — détection `PASSWORD_RECOVERY` event, validation Zod du nouveau mot de passe, redirection vers `/hq` après succès, gestion du lien expiré avec retour à `/auth`. Validé.
- Route `/reset-password` enregistrée dans `App.tsx` ligne 116. Validé.

### P0-3 : CTA conversion sur landing — CORRIGÉ
- Hero : "Nous contacter" (lien vers `/contact`) ajouté comme second bouton. i18n FR/EN/DE. Validé.
- Section CTA bottom : "Demander une démonstration" (lien vers `/contact`). Validé.

### P1-1 : Données hardcodées Sécurité HQ — CORRIGÉ
- `IncidentCounter` reçoit `null` → affiche empty state "Aucune donnée d'incident". Validé.
- "Secrets Configurés" affiche `—` au lieu de `8`. Validé.
- "Alertes" affiche `—`. Validé.
- "Statut Global" affiche toujours "Sécurisé" hardcodé (ligne 170) — **NON CORRIGÉ**, mais mineur car non trompeur avec le reste en `—`.

### P1-2 : Panic switch persistance — CORRIGÉ
- `panicMode` dérivé de `autopilotConfig` (ligne 31) : `autopilotConfig.enabled === false && autopilotConfig.low_risk_auto_execute === false`. Persisté via `updateConfig.mutate`. Validé.
- Suppression du `useState` local. Validé.

### P1-3 : Cookie banner position — NON CORRIGÉ
- `CookieConsentBanner.tsx` ligne 19 : toujours `fixed bottom-0 left-0 right-0`. Sur mobile, le banner occupe ~40% du viewport et masque le hero. Le problème est mitigé par le fait que le banner disparaît après interaction, mais la première impression reste dégradée.

---

## 4. PROBLÈMES RESTANTS NON CORRIGÉS

### Toujours P1 — StatusPage fictive
- `StatusPage.tsx` ligne 31 : `const toutOperationnel = true;` — hardcodé. La page entière est une décoration.
- Ligne 123 : `0 incidents` hardcodé.
- Le bouton "Rafraîchir" (ligne 125) ne rafraîchit que l'heure locale, pas les données.
- **Impact** : Un visiteur qui consulte `/status` pour évaluer la fiabilité obtient des informations fictives. Nuit à la crédibilité.
- **Criticité** : Majeur
- **Recommandation** : Soit connecter au monitoring réel via `usePlatformMonitor`, soit masquer les indicateurs de statut et n'afficher que la liste des plateformes.

### Toujours P2 — Confusion positionnement public
- La section "Features" de la HomePage décrit les fonctionnalités du HQ interne : "Rapports stratégiques générés automatiquement", "Validation présidentielle", "Briefings de direction". Un visiteur externe ne peut pas accéder à ces fonctionnalités.
- Le CTA "Découvrir les plateformes" mène à une page vitrine sans action d'achat/essai.
- **Impact** : Le visiteur comprend qu'EMOTIONSCARE fait des logiciels, mais ne comprend pas ce qu'il peut obtenir.
- **Recommandation** : Recentrer les features sur ce que les plateformes apportent aux utilisateurs finaux (soignants, étudiants, entrepreneurs), pas sur le cockpit interne.

### Toujours P2 — Sidebar HQ surchargée
- 7 liens principaux + 20 liens secondaires = 27 liens. Inchangé.
- La section "Tous les services" est repliable, ce qui aide, mais 20 liens dans un accordion reste trop.

### Toujours P2 — Autopilot double contrôle
- `SecuritePage.tsx` : Switch (ligne 140) + Bouton "Désactiver Autopilot" (ligne 147-157) font exactement la même chose. Redondance.

### Nouveau — AuthPage stats hardcodées
- Ligne 314 : `<div className="text-2xl xl:text-4xl font-bold text-accent mb-1 xl:mb-2">39</div>` — "39 Agents IA" est un chiffre marketing hardcodé sur la page de login. Si le nombre change, la donnée sera périmée.
- **Criticité** : Cosmétique (page interne)

### Nouveau — BriefingRoom métaphore "Appeler le DG"
- Ligne 9 : `Phone, PhoneCall` imports. Le brief IA utilise une métaphore téléphonique.
- **Non corrigé** depuis l'audit précédent.

---

## 5. LISTE DES PROBLÈMES PRIORISÉS (POST-CORRECTIONS)

### P0 — Tous corrigés

### P1 — Restants
1. **StatusPage `toutOperationnel` hardcodé** — Page fictive présentée comme réelle. Connecter au monitoring ou afficher un disclaimer.
2. **Cookie banner masque le hero mobile** — Positionner en mode compact ou utiliser un design moins intrusif.

### P2 — Restants
3. **Features HP décrivent le HQ interne** — Recentrer le copywriting sur les bénéfices utilisateur final.
4. **Sidebar HQ 27 liens** — Réduire à 12 max visibles.
5. **Autopilot double contrôle** — Supprimer le bouton redondant, garder uniquement le Switch.
6. **"Appeler le DG"** — Renommer en "Lancer le brief exécutif".
7. **Repos GitHub en 404** — Masquer le lien si repo privé.

### P3 — Restants
8. **NotFound non i18n** — Texte uniquement FR.
9. **"39 Agents IA" hardcodé** sur page auth.
10. **"Sécurisé" hardcodé** dans le status grid de SecuritePage (ligne 170).

---

## 6. VERDICT FINAL POST-CORRECTIONS

**Progression** : Les 3 bloquants production sont résolus. La note passe de 13/20 à 14.5/20.

**La plateforme est-elle publiable ?**
- **Site vitrine public** : OUI. Le CTA contact fonctionne, les pages légales sont complètes, le reset password est opérationnel. La seule réserve est la StatusPage fictive — à corriger ou retirer du menu.
- **HQ interne** : OUI pour un usage mono-propriétaire. Le panic switch persiste, la sécurité est solide, les données mock sont correctement remplacées par des empty states.

**3 corrections les plus rentables à faire maintenant :**
1. **StatusPage** : Remplacer `const toutOperationnel = true` par un calcul réel depuis `usePlatformMonitor` ou masquer les indicateurs (15 min).
2. **Cookie banner** : Réduire la hauteur sur mobile ou déplacer en top-bar slim (10 min).
3. **Supprimer le bouton Autopilot redondant** dans SecuritePage, garder uniquement le Switch (5 min).

**Si j'étais décideur externe** : Je publierais le site vitrine public aujourd'hui, en retirant la StatusPage du header navigation (ou en la connectant au monitoring réel). Le HQ interne est solide pour un usage propriétaire. Le produit n'est pas prêt pour des utilisateurs payants externes, mais ce n'est pas l'objectif actuel.

