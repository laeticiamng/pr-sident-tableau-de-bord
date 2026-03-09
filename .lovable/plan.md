

# AUDIT BETA-TESTEUR NON TECHNIQUE — EMOTIONSCARE

---

## 1. RESUME EXECUTIF

### Ce qu'un novice comprend en arrivant
- EMOTIONSCARE est un editeur de logiciels francais qui fait "10 plateformes" dans la sante et l'education.
- La proposition de valeur est relativement claire : "La sante et l'education meritent de meilleurs logiciels."

### Ce qu'il ne comprend PAS
- **Ce qu'est concretement le produit** : 10 plateformes pour des publics completement differents (soignants, etudiants, expatries, artistes, chirurgiens...) = confusion. Le visiteur se dit "c'est pour qui, exactement ?"
- **La relation entre les plateformes** : ce sont des produits separes ou un ecosysteme integre ?
- **Pourquoi creer un compte ICI** : la page /auth est "login only" (pas de signup). Le "How It Works" dit "Creez votre compte" mais il n'y a aucune inscription possible. Mensonge UX.
- **Le pricing** : aucun prix cliquable, pas de bouton "Essai gratuit" sur les plateformes individuelles. Tout redirige vers "Contactez-nous."
- **Les temoignages** : anonymes ("Responsable RH", "Centre Hospitalier") avec un disclaimer qui dit "cas representatifs" = pas de vrais temoignages. Ca detruit la confiance.

### 5 PLUS GROS FREINS
1. **Pas de signup** — le parcours "How It Works" promet une inscription impossible
2. **Trop de plateformes, trop d'audiences** — le visiteur ne sait pas si c'est pour lui
3. **Temoignages fictifs avoues** — le disclaimer tue la credibilite
4. **Stats techniques exposees** (tables, branches, commits, edge functions) sur les pages publiques — jargon incomprehensible pour un novice
5. **Aucun essai gratuit direct** — malgre le "Freemium" mentionne en tarifs, rien ne permet de tester

### 5 PRIORITES ABSOLUES
1. Supprimer ou reformuler la section "How It Works" (promesse de signup inexistante)
2. Supprimer les stats techniques (tables, branches, edge functions) des pages publiques
3. Remplacer les temoignages fictifs par un bloc de reassurance plus honnete
4. Clarifier l'audience des la homepage (segmentation claire)
5. Rendre le parcours vers chaque plateforme individuelle transparent (CTA vers les sites reels, pas vers une page generique)

---

## 2. TABLEAU D'AUDIT COMPLET

| Priorite | Page / Zone | Probleme observe | Ce que ressent un novice | Impact UX/conversion/confiance | Recommandation concrete | Faisable maintenant ? |
|----------|-------------|-----------------|-------------------------|-------------------------------|------------------------|----------------------|
| **P0** | Homepage > How It Works | "Creez votre compte — inscription gratuite en 30 secondes" mais la page /auth n'a que le login, aucun signup | "On me ment, je ne peux pas m'inscrire" | **Bloquant** — promesse non tenue, perte de confiance immediate | Reformuler en "Contactez-nous" ou "Visitez la plateforme" au lieu de "Creez votre compte" | Oui |
| **P0** | Homepage > Social Proof | Temoignages anonymes + disclaimer "cas d'usage representatifs" | "C'est invente" | **Destructeur** pour la confiance | Remplacer par des faits verifiables ou supprimer le disclaimer et mettre "Fonctionnalites en cours de deploiement" | Oui |
| **P0** | /plateformes | Stats techniques (723 tables, 261 edge functions, 635 branches) affichees en gros | "C'est quoi des edge functions ? Des branches ?" | Jargon technique = perte de comprehension | Remplacer par des metriques utilisateur (ex: "37 fonctionnalites", "Disponible 24/7") et supprimer tables/branches/edge functions | Oui |
| **P0** | Homepage > Stats bar | "3.1K Mises a jour" = commits GitHub affiches comme metrique marketing | Incomprehensible ou trompeur pour un novice | Mauvais signal : ca ressemble a du remplissage | Remplacer par des metriques business reelles ou supprimer | Oui |
| **P1** | Header nav | 7 items de navigation (Accueil, Plateformes, Tarifs, Vision, Securite, Statut, Contact) | Surcharge — "Statut" et "Securite" ne sont pas des priorites pour un visiteur novice | Dilution de l'attention, parcours de decouverte confus | Reduire a 5 max : Accueil, Plateformes, Tarifs, Vision, Contact. Deplacer Securite et Statut dans le footer | Oui |
| **P1** | /plateformes > stats par plateforme | Grille de 6 stats par plateforme (commits, tables, tests, branches, integrations, modules) | "C'est un dashboard technique, pas une vitrine produit" | Le visiteur pense que c'est un outil pour developpeurs, pas pour des soignants | Ne garder que "fonctionnalites" et "statut". Deplacer le reste vers une sous-section "Pour les curieux" ou supprimer | Oui |
| **P1** | /tarifs | Pas de vrais prix affichables, beaucoup de "Sur devis" | "Ils cachent les prix, c'est cher ou c'est pas pret" | Forte friction de conversion — le visiteur veut savoir combien ca coute avant de contacter | Afficher clairement les prix existants (9.90, 49, 4.90, gratuit) en gros, et "Sur devis" seulement pour les cas B2B | Oui (copy) |
| **P1** | Homepage > Features | 4 features montrees, mais 10 plateformes = le lien est confus | "Ces 4 cartes representent quoi ? Des plateformes ? Des fonctionnalites ?" | Confusion entre plateforme et feature | Titrer plus clairement ou montrer les logos/noms des plateformes | Oui |
| **P1** | /auth | Login seulement, pas de lien "Creer un compte" | Le visiteur cherche comment s'inscrire et ne trouve pas | Abandon total du parcours d'inscription | Au minimum, ajouter un message expliquant que l'acces est reserve ou comment s'inscrire via les plateformes | Oui |
| **P2** | Homepage > PlatformShowcase | Le showcase principal est EmotionsCare avec ses features techniques (Scan emotionnel IA, Coach IA Nyvee, Musicotherapie Suno) | Termes internes ("Suno", "Nyvee") sans explication | Confusion — le visiteur ne sait pas ce que "Suno" veut dire | Reformuler les features en benefices : "Ecouter de la musique relaxante" au lieu de "Musicotherapie Suno" | Oui |
| **P2** | Homepage > PlatformShowcase stats | Affiche "7.7K mises a jour", "37 fonctionnalites", "294 tests qualite", "635 versions" | "Tests qualite" et "versions" = jargon technique | Le novice ne sait pas ce qu'est un "test qualite" | Ne garder que "fonctionnalites" et "Disponible" | Oui |
| **P2** | /vision | Page correct mais "39 agents IA" affiche comme stat | "C'est quoi un agent IA ?" | Terme technique non explique | Reformuler en "39 experts automatises" ou "39 automatisations" | Oui |
| **P2** | /trust > Architecture | Points techniques (OWASP, RLS, Edge Functions) dans une page publique | "Je ne comprends pas" | La page Trust est bien mais une partie est trop technique | Simplifier : "Infrastructure securisee" au lieu de details OWASP | Non (decision editoriale) |
| **P2** | Footer | "SIREN : 944 505 445 | RCS Amiens" — correct pour la confiance francaise | Bon element de reassurance | Positif | Garder | N/A |
| **P2** | /contact | Page bien faite, formulaire fonctionnel, badge "Reponse garantie sous 48h" | Bon signal de confiance | Positif | Garder | N/A |
| **P2** | Homepage > CTA final | "Voir les plateformes en detail" + "Demander une demo" | CTA correct mais repetitif (deja vu dans le hero) | Perte d'impact par repetition | Varier le CTA : "Trouvez la plateforme adaptee a votre metier" | Oui |
| **P3** | Header > "Espace client" | Le bouton login s'appelle "Espace client" mais le visiteur n'est pas encore client | Legerement confus | Mineur | Renommer en "Connexion" | Oui |
| **P3** | /status | Page technique qui montre le statut des plateformes en temps reel | Utile mais pas prioritaire pour un novice | Mineur | OK pour le footer, pas necessaire dans la nav principale | Oui (deja recommande) |
| **P3** | Multi-langue | FR/EN/DE — switcher present et fonctionnel | Bon | Positif | Garder | N/A |

---

## 3. AMELIORATIONS PRIORITAIRES A IMPLEMENTER IMMEDIATEMENT

### A. "How It Works" — Réécrire les étapes
- **Etape 2 actuelle** : "Creez votre compte — Inscription gratuite en 30 secondes. Aucune carte bancaire requise."
- **Probleme** : Aucun signup n'existe.
- **Correction** : Reformuler en "Contactez-nous — Echangez avec notre equipe pour trouver la solution adaptee. Reponse garantie sous 48h."

### B. Social Proof — Supprimer le disclaimer ou reformuler
- Remplacer "*Cas d'usage representatifs*" par une formulation moins autodestructrice ou supprimer la section temoignages fictifs au profit de stats reelles.

### C. Stats techniques — Nettoyer les pages publiques
- Sur la homepage stats bar : remplacer "3.1K Mises a jour" par une metrique comprehensible.
- Sur /plateformes : masquer tables, branches, edge functions. Garder seulement fonctionnalites et statut.
- Sur PlatformShowcase : supprimer "tests qualite" et "versions" des stats visibles.

### D. Navigation — Simplifier le header
- Retirer "Statut" et "Securite" de la nav principale. Les garder dans le footer.

### E. Auth — Clarifier l'absence de signup
- Ajouter un texte sous le formulaire de login : "Vous n'avez pas encore de compte ? Contactez-nous pour decouvrir nos solutions."

### F. CTA final homepage — Varier le texte
- Changer "Voir les plateformes en detail" en "Trouvez la solution pour votre metier"

---

## 4. DETAILS TECHNIQUES D'IMPLEMENTATION

Les modifications portent sur :

1. **`src/i18n/home.ts`** (FR/EN/DE) — réécrire `stats.evolutions` label, `socialProof.disclaimer`, `cta.button`
2. **`src/components/home/HowItWorks.tsx`** (translations inline FR/EN/DE) — réécrire l'étape 2 (supprimer promesse de signup)
3. **`src/pages/HomePage.tsx`** — modifier la stats bar pour ne plus afficher les commits comme métrique marketing, remplacer "tests qualité" et "versions" dans PlatformShowcase
4. **`src/components/layout/PublicHeader.tsx`** — retirer `status` et `security` du tableau `navLinks`
5. **`src/i18n/common.ts`** — renommer "Espace client" en "Connexion"
6. **`src/pages/AuthPage.tsx`** — ajouter un lien "Pas encore de compte ? Contactez-nous" sous le formulaire
7. **`src/i18n/auth.ts`** — ajouter les clés de traduction pour le lien "pas de compte"
8. **`src/components/home/PlatformShowcase.tsx`** — dans les stats du hero card, remplacer "tests" et "versions" par des métriques orientées bénéfice
9. **`src/pages/PlateformesPage.tsx`** — réduire la grille de stats par plateforme (retirer tables, branches, edge functions)
10. **`src/i18n/platforms.ts`** — mettre à jour les labels correspondants

Fichiers impactés : ~10 fichiers, essentiellement du copy i18n et des ajustements de composants. Aucune modification de base de données requise.

---

## 5. CE QUI NE PEUT PAS ETRE MODIFIE AUTOMATIQUEMENT

- **Vrais temoignages clients** : necessite des temoignages reels avec noms et entreprises. Decision editoriale.
- **Signup fonctionnel** : necessite une decision produit (ouvrir l'inscription publique ou garder l'acces sur invitation).
- **Prix reels** : les montants affiches (9.90€, 49€, etc.) doivent etre valides par le business avant d'etre mis en avant.
- **Images/screenshots des plateformes** : les previews existent mais leur qualite n'a pas pu etre evaluee sans browser.
- **Page Trust simplifiee** : necessite une decision sur ce qu'on garde/supprime en termes techniques.

