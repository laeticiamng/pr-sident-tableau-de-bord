

# Upgrade Premium Apple-Like — Toutes les pages publiques

## Objectif
Passer chaque page de sa note actuelle a 9+/10 en appliquant les recommandations de l'audit : branding renforce, preuve sociale, visuels emotionnels, details de reassurance, et coherence des noms de plateformes.

---

## 1. HomePage (`/`) — De 8.5 a 9.5/10

**Section Hero** : Ajouter un sous-badge "Made in France" et un chiffre d'impact ("7 plateformes, des milliers d'utilisateurs").

**Section Stats** : Remplacer "Tests automatises" (jargon) par "Mises a jour" — plus parlant pour un visiteur non-technique.

**Section CTA finale** : Ajouter une ligne de preuve sociale sous le CTA ("Utilise par des professionnels de sante, des etudiants et des entrepreneurs").

---

## 2. AuthPage (`/auth`) — De 7 a 9/10

**Panneau droit (desktop)** : Remplacer "Editeur de logiciels" par la mention officielle "EMOTIONSCARE SASU — Siege Social Numerique" conformement aux exigences de branding. Ajouter une phrase de reassurance plus forte.

**Mobile Header** : Meme remplacement du sous-titre par "Siege Social Numerique".

**Formulaire** : Ajouter "EMOTIONSCARE" dans le titre desktop ("Connexion a EMOTIONSCARE") pour renforcer le branding.

---

## 3. VisionPage (`/vision`) — De 7.5 a 9/10

**Section Hero** : Ajouter une phrase d'accroche chiffree ("7 plateformes, 1 mission").

**Section Mission** : Enrichir la citation avec un contexte plus ambitieux et emotionnel.

**Timeline** : Corriger les anciens noms de plateformes :
- "Swift Care Hub" → "UrgenceOS"
- "Track Triumph Tavern" → "Track Triumph"

**Nouvelle section** : Ajouter un bandeau "Chiffres cles" entre les valeurs et la mission avec des compteurs animes (7 plateformes, 39 agents IA, 100% Made in France, 24/7 monitoring).

---

## 4. ContactPage (`/contact`) — De 8 a 9/10

**Info panel** : Ajouter un badge de reassurance visible "Reponse garantie sous 48h" avec icone horloge.

**Carte geographique** : Remplacer le placeholder emoji par une carte stylisee avec gradient et coordonnees plus precises.

**Nouveau** : Ajouter une mention "Nous sommes a votre ecoute" avec les horaires mis en evidence.

---

## 5. PlateformesPage (`/plateformes`) — De 8 a 9/10

**SEO meta description** : Corriger les anciens noms ("Swift Care Hub" → "UrgenceOS", "Track Triumph Tavern" → "Track Triumph").

---

## 6. Pages legales — De 7 a 8/10

Pas de modifications majeures — les pages legales sont fonctionnelles et conformes. Le style est volontairement sobre pour du contenu juridique.

---

## Resume technique

| Fichier | Modifications |
|---------|--------------|
| `src/pages/HomePage.tsx` | Stats label + preuve sociale sous CTA final |
| `src/pages/AuthPage.tsx` | Branding "EMOTIONSCARE SASU — Siege Social Numerique", titre formulaire |
| `src/pages/VisionPage.tsx` | Noms plateformes corriges, section chiffres cles, accroche hero enrichie |
| `src/pages/ContactPage.tsx` | Badge reassurance 48h, carte amelioree |
| `src/pages/PlateformesPage.tsx` | Meta description corrigee (anciens noms) |

## Risque
Faible — modifications textuelles et cosmetiques. Aucun changement de logique, de structure ou de style majeur.

