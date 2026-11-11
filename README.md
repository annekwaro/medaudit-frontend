# MedAudit

**English** · [Français](#français)

**Live demo:** [medaudit-frontend-one.vercel.app](https://medaudit-frontend-one.vercel.app)

A prototype dashboard for eCOA (electronic Clinical Outcome Assessment) in clinical trials,
built with Angular 19 and Material 3.

## What it demonstrates

- An audit trail viewer for clinical trial compliance (aware of ICH-GCP): who changed what, when, and the old and new values, grouped by day
- Patient compliance tracking with status badges and an explanation of each score
- A patient detail page with a record header, a study journey and an "Up next" visit
- A global audit log search
- Stats cards with small charts, a next-visit card, and a timeline of diaries and visit windows
- Offline-first design with self-hosted fonts (no external CDNs)
- A role-based view (the Clinician portal)

## Pages

| Route | Page |
| --- | --- |
| `/clinician/dashboard` | Overview: stats, next visit, diaries and visit-window timeline |
| `/clinician/patients` | Patient list |
| `/clinician/patient/:id` | Audit trail for one patient |
| `/clinician/audit-log` | Global audit search |
| `/clinician/settings` | Settings |

## Tech stack

- Angular 19 with standalone components and signals
- Angular Material 3 with a custom theme
- Self-hosted DM Sans, General Sans and Material icons
- Inline SVG charts (no chart library)

## Run locally

Requires Node 22.

```bash
npm install
npm start
```

Then open `http://localhost:4200/`.

```bash
npm run build   # production build to dist/
npm test        # unit tests (Karma + Jasmine)
```

---

## Français

[English](#medaudit) · **Français**

**Démo en ligne :** [medaudit-frontend-one.vercel.app](https://medaudit-frontend-one.vercel.app)

Un prototype de tableau de bord eCOA (évaluation électronique des résultats cliniques) pour les
essais cliniques, développé avec Angular 19 et Material 3.

## Fonctionnalités présentées

- Un visualiseur de piste d'audit pour la conformité des essais cliniques (tenant compte des exigences ICH-GCP) : qui a modifié quoi, quand, avec l'ancienne et la nouvelle valeur, regroupées par jour
- Un suivi de l'observance des patients avec des badges de statut et une explication de chaque score
- Une fiche patient avec un en-tête de dossier, le parcours dans l'étude et la prochaine visite (« Up next »)
- Une recherche globale dans le journal d'audit
- Des cartes de statistiques avec de petits graphiques, une carte de prochaine visite et une chronologie des journaux et des fenêtres de visite
- Une conception « offline-first » avec des polices auto-hébergées (aucun CDN externe)
- Une vue selon le rôle (portail Clinicien)

## Pages

| Route | Page |
| --- | --- |
| `/clinician/dashboard` | Vue d'ensemble : statistiques, prochaine visite, chronologie des journaux et des fenêtres de visite |
| `/clinician/patients` | Liste des patients |
| `/clinician/patient/:id` | Piste d'audit d'un patient |
| `/clinician/audit-log` | Recherche globale dans l'audit |
| `/clinician/settings` | Paramètres |

## Technologies

- Angular 19 avec composants autonomes (standalone) et signals
- Angular Material 3 avec un thème personnalisé
- Polices DM Sans, General Sans et icônes Material auto-hébergées
- Graphiques en SVG intégré (sans bibliothèque de graphiques)

## Lancer en local

Nécessite Node 22.

```bash
npm install
npm start
```

Puis ouvrez `http://localhost:4200/`.

```bash
npm run build   # build de production dans dist/
npm test        # tests unitaires (Karma + Jasmine)
```
