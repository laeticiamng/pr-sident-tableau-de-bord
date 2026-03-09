

# Audit Complet — EMOTIONSCARE HQ : De "Prototype Avancé" à "Révolutionnaire"

## Ce qui existe et fonctionne bien

Le socle est solide : 22+ pages HQ, 12 edge functions, auth sécurisée, notifications realtime, COS (Chief Operating System), Growth OS, briefing IA, approbations présidentielles, veille stratégique, finance Stripe, diagnostics, conformité RGPD, et un design premium bilingue (FR/EN). Le concept de "Siège Social Numérique" pour un Président unique est fort et différenciant.

---

## Ce qui manque pour être UNIQUE et RÉVOLUTIONNAIRE

### 1. INTELLIGENCE PROACTIVE — Le HQ ne pense pas encore tout seul

**Problème** : Le système attend que le Président agisse. Il faut cliquer "Demander un brief IA", "Lancer l'analyse", etc. Rien ne se déclenche automatiquement.

**Ce qu'il faut** :
- **Morning Digest automatique** : chaque matin à 8h, un brief IA est généré et attend le Président sur le tableau de bord (scheduled-runs existe mais n'est pas câblé à un vrai cron)
- **Alertes prédictives** : au lieu de constater "uptime = 92%", le système devrait prédire "UrgenceOS risque de tomber sous 90% d'ici 48h" basé sur les tendances
- **Suggestions contextuelles** : "Vous n'avez pas consulté la page Finance depuis 12 jours — voici un résumé des changements"

### 2. VOIX ET CONVERSATION — L'expérience Président est encore textuelle

**Problème** : Le "Appeler le DG" simule un appel mais c'est un bouton + texte. Pas de vrai dialogue.

**Ce qu'il faut** :
- **Chat IA persistant** : un assistant conversationnel dans le HQ (sidebar ou modal) où le Président peut poser des questions en langage naturel ("Quel est le churn ce mois ?", "Compare EmotionsCare et Med MNG")
- **Historique des conversations** stocké en base pour continuité
- **Voix** (optionnel mais différenciant) : Text-to-Speech sur les briefs pour écouter au lieu de lire

### 3. DONNÉES VIVANTES — Trop de mock, pas assez de réel

**Problème** : Veille stratégique = données hardcodées. Marketing = mock. RH = mock. Seuls Finance (Stripe) et Plateformes (DB) sont réels.

**Ce qu'il faut** :
- **Veille stratégique automatisée** : les sources (Product Hunt, TechCrunch, etc.) sont listées mais jamais scrapées automatiquement. Câbler Firecrawl + IA pour un vrai scan hebdomadaire
- **Indicateur de provenance** systématique : chaque widget devrait afficher clairement "Données réelles" vs "Données simulées" (le pattern `DataSourceIndicator` existe mais n'est pas utilisé partout)
- **Pipeline de données** : un système pour que chaque plateforme remonte ses KPIs réels via webhook ou API

### 4. MOBILE-FIRST RÉEL — L'app n'est pas utilisable en déplacement

**Problème** : La sidebar HQ à 26 liens secondaires n'est pas optimisée pour le mobile. Le Président devrait pouvoir piloter depuis son téléphone en 30 secondes.

**Ce qu'il faut** :
- **Mode "Président Mobile"** : un dashboard ultra-simplifié avec 3 cartes max (Santé écosystème, Décisions en attente, Brief du jour)
- **PWA** : manifest.json, service worker, installation sur l'écran d'accueil
- **Gestes tactiles** : swipe pour approuver/rejeter, pull-to-refresh natif

### 5. TIMELINE DÉCISIONNELLE — Pas de mémoire stratégique

**Problème** : L'audit log existe mais c'est un log technique. Il n'y a pas de vue "histoire des décisions stratégiques du Président".

**Ce qu'il faut** :
- **Journal Présidentiel** : chronologie des décisions majeures avec contexte, impact mesuré a posteriori, et notes personnelles
- **Tableau de bord OKR vivant** : les objectifs trimestriels existent (EntreprisePage) mais ne sont pas connectés aux données réelles
- **Rétrospective automatique** : "Ce trimestre, vous avez approuvé 47 actions, rejeté 12, le MRR a augmenté de 23%"

### 6. SÉCURITÉ DE NIVEAU ENTREPRISE — Manques critiques

**Problème** :
- Pas de table `user_roles` séparée (AuthContext ne vérifie aucun rôle)
- La page Auth affiche "7 Plateformes" au lieu de 8
- Pas de 2FA / MFA
- Pas de session timeout configurable

**Ce qu'il faut** :
- **RBAC avec table `user_roles`** selon les standards de sécurité
- **MFA obligatoire** pour le Président (TOTP via Supabase Auth)
- **Session management** : timeout après inactivité, log des sessions actives

### 7. INTER-PLATEFORME — Les 8 plateformes sont isolées

**Problème** : Chaque plateforme est un silo. Pas de vue corrélée.

**Ce qu'il faut** :
- **Matrice de corrélation** : "Quand EmotionsCare a un pic d'utilisateurs, Med MNG en bénéficie-t-il ?"
- **Flux utilisateurs cross-plateforme** : combien d'utilisateurs utilisent 2+ plateformes ?
- **Score de synergie écosystème** : métrique unique agrégée

### 8. AUTOMATISATION AVANCÉE — L'Autopilot est limité

**Problème** : L'Autopilot existe conceptuellement mais les règles sont simples (risque bas = auto, risque élevé = validation). Pas de workflows personnalisés.

**Ce qu'il faut** :
- **Règles conditionnelles** : "Si le churn dépasse 5% ET que c'est EmotionsCare, envoyer une alerte critique ET lancer une analyse IA automatique"
- **Playbooks** : scénarios de réaction prédéfinis par type d'incident
- **Escalation chain** : notification → alerte → pause automatique → rapport d'incident

### 9. COHÉRENCE UI — Plusieurs standards coexistent

**Problème** :
- `ExecutiveHeader` + `MethodologyDisclosure` (standard HEC) utilisés sur certaines pages (Finance, Cockpit) mais pas toutes
- Le HQ n'est pas internationalisé (les pages publiques ont i18n, le HQ est 100% français)
- Certaines pages disent "7 plateformes" au lieu de 8

**Ce qu'il faut** :
- Appliquer le standard `ExecutiveHeader` + `MethodologyDisclosure` sur TOUTES les pages HQ
- Mettre à jour toutes les références "7 plateformes" → dynamique depuis `MANAGED_PLATFORMS.length`
- Uniformiser les états loading/empty/error sur chaque page

### 10. CE QUI RENDRAIT LE PRODUIT VRAIMENT RÉVOLUTIONNAIRE

| Feature | Impact | Effort |
|---------|--------|--------|
| Chat IA conversationnel persistant | Transforme l'UX de "dashboard" à "assistant" | Moyen |
| Morning Digest automatique (cron) | Le HQ pense avant le Président | Faible |
| PWA + mode mobile Président | Pilotage en 30 secondes depuis le téléphone | Moyen |
| Journal décisionnel avec impact mesuré | Mémoire stratégique unique | Moyen |
| Corrélation inter-plateformes | Vision écosystème inédite | Élevé |
| Alertes prédictives (tendances) | Anticipation vs réaction | Élevé |
| Veille automatisée (Firecrawl cron) | Intelligence concurrentielle vivante | Faible |

---

## Plan d'Implémentation Recommandé

**Sprint 1 — Quick Wins (1 semaine)** :
- Corriger toutes les références "7 plateformes" → dynamique
- Appliquer `ExecutiveHeader` sur toutes les pages HQ manquantes
- Ajouter un chat IA simple (sidebar) connecté à l'edge function `executive-run`
- Configurer le Morning Digest automatique via `scheduled-runs`

**Sprint 2 — Expérience Président (1-2 semaines)** :
- PWA (manifest + service worker)
- Mode mobile simplifié
- Journal décisionnel (nouvelle table + page)
- MFA via Supabase Auth

**Sprint 3 — Intelligence (2 semaines)** :
- Veille automatisée avec Firecrawl
- Alertes prédictives basées sur tendances
- Matrice de corrélation inter-plateformes
- Playbooks d'incident

