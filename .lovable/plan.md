

# Plan: Mise à jour des aperçus et descriptions des plateformes

## Contexte
Les 10 plateformes ont évolué depuis les dernières captures. Les screenshots actuels dans `src/assets/previews/` sont obsolètes. Les descriptions dans `constants.ts` et `i18n/platforms.ts` doivent aussi refléter les contenus réels des sites live.

## Observations des sites live (screenshots capturés)

| Plateforme | Nom affiché sur le site | Tagline réelle |
|---|---|---|
| EmotionsCare | EmotionsCare | "Gérez votre stress en 3 minutes" — Respiration guidée, coaching IA |
| NEARVITY | NEARVITY | "Find someone to do things with, right now" |
| System Compass | Compass | "Want to expatriate? Compare countries before you go" — 80+ pays |
| Growth Copilot | Growth OS | "39 agents IA pour automatiser votre croissance" |
| Med MNG | MED MNG | "Apprends la médecine en musique" — 367 cours |
| UrgenceOS | UrgenceOS | "Le logiciel des urgences que votre hôpital contrôle" |
| Track Triumph | Weekly Music Awards | "The only music contest 100% community-driven" — €200/week |
| Gouvernance IA | AAR Platform | "Prouvez que vos agents IA respectent la loi" |
| StudyBeats | StudyBeats | "Turn your notes into songs" — 1200+ songs, 500+ students |
| Vascular Atlas | Vascular Atlas | "AI-Powered Clinical Platform for Vascular Medicine" |

## Modifications prévues

### 1. Remplacer les 10 images de preview (assets)
Les screenshots capturés seront utilisés pour remplacer les fichiers existants dans `src/assets/previews/`. Chaque fichier `.jpg` sera écrasé avec le nouveau screenshot réel du site live actuel.

Fichiers concernés :
- `emotionscare-preview.jpg`
- `nearvity-preview.jpg`
- `system-compass-preview.jpg`
- `growth-copilot-preview.jpg`
- `med-mng-preview.jpg`
- `urgenceos-preview.jpg`
- `track-triumph-preview.jpg`
- `governance-ia-preview.jpg`
- `studybeats-preview.jpg`
- `vascular-atlas-preview.jpg`

### 2. Mettre à jour `src/lib/constants.ts`
Actualiser les descriptions, taglines et stats pour refléter les contenus réels des sites :
- EmotionsCare : tagline → "Gérez votre stress en 3 minutes", description mise à jour (respiration guidée, coaching IA, exercices anti-stress)
- System Compass : description → 80+ pays (au lieu de 50+)
- Growth Copilot : nom interne reste mais tagline reflète "Automatisez votre croissance"
- Med MNG : description → 367 cours du programme médical
- Track Triumph : tagline → "Le seul concours musical 100% communautaire", description → prix €200/semaine
- Gouvernance IA : tagline → "Prouvez que vos agents IA respectent la loi"
- StudyBeats : stats → 1200+ chansons, 500+ étudiants mentionnés
- UrgenceOS : tagline actualisée

### 3. Mettre à jour `src/i18n/platforms.ts` (FR/EN/DE)
Synchroniser les mêmes changements de taglines/descriptions dans les 3 langues.

### 4. Mettre à jour `src/i18n/home.ts`
Synchroniser les taglines/descriptions du PlatformShowcase homepage.

### Fichiers impactés
- `src/assets/previews/*.jpg` (10 fichiers — remplacement d'images)
- `src/lib/constants.ts`
- `src/i18n/platforms.ts`
- `src/i18n/home.ts`

Aucune modification de base de données requise.

