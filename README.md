# Dots and Boxes (by K.R) 🎲👑

**Dots and Boxes (by K.R)** est une application mobile-first de haute volée inspirée du jeu traditionnel de la **Pipopipette**.

Conçue avec une approche esthétique haut de gamme et un gameplay au tour par tour tactique, l'application marie le raffinement des matériaux nobles (noyer ciré, marbre de Carrare veiné, obsidienne et or) à une ergonomie tactile réactive.

---

## ✨ Caractéristiques Principales

### 🪵 Esthétique & Textures de Prestige
- **Bois Noble (Noyer ciré & Laiton)** : Grain de bois chaleureux, incrustations métalliques dorées et ombres portées réalistes.
- **Marbre Impérial (Carrare & Platine)** : Veines délicates, reflets satinés et rivets en platine poli.
- **Obsidienne Royale (Onyx & Or pur)** : Minimalisme sombre grand luxe rehaussé de liserés dorés.

### 📐 Grille Évolutive & Vectorielle SVG
- **Tailles configurables** :
  - **3×3** (Rapide - 9 cases)
  - **4×4** (Classique - 16 cases)
  - **5×5** (Stratège - 25 cases)
  - **6×6** (Grand Maître - 36 cases)
- Rendu vectoriel SVG net à 100% sur tous les écrans (smartphones, tablettes, desktop).
- Zones de contact élargies (36px) pour un ciblage au doigt sans aucune frustration.

### 🏆 Système de Points & Récompenses Visuelles
- **Comptage dynamique** avec jauges de dominance en temps réel.
- **Animation de tamponnage 3D (`stamp-in`)** pour chaque carré capturé avec le sceau impérial du joueur (`👑` ou `⚔️`).
- **Compteur de combos** pour les captures en chaîne consécutives ("Combo x2 !", "Combo x3 !").
- **Feu d'artifice de confettis dorés** et fanfare lors de la victoire.

### 🎵 Audio Procédural Tactile (Web Audio API)
- Aucun téléchargement de fichier MP3 externe lourd.
- Bruitages physiques synthétisés en direct :
  - Claquement sec du bois ou tintement cristallin du marbre lors du tracé d'un segment.
  - Carillons harmoniques étagés lors des captures et combos.
  - Fanfare de victoire majeure.

### 🤖 Modes de Jeu
- **Passe & Joue (2 Joueurs Local)** : Parfait pour jouer à deux sur le même smartphone.
- **Contre l'IA** avec 3 niveaux tactiques :
  - *Novice* : Décontracté, idéal pour s'initier.
  - *Tacticien* : Opportuniste, évite de céder des cases gratuites.
  - *Maître* : Analyse des chaînes et jeu sacrificiel avancé.
- **Annulation (Undo)** : Possibilité de revenir sur un coup.

---

## 🚀 Démarrage & Commandes

### 1. Lancer le serveur de développement :
```bash
npm run dev
```

### 2. Compiler pour la production :
```bash
npm run build
```

### 3. Exécuter la suite de tests unitaires :
```bash
npx vitest run
```

---

## 🛠️ Stack Technique
- **Framework** : React 19 + TypeScript + Vite
- **Styles & UI** : Tailwind CSS v4 + Lucide Icons
- **Effets & Célébration** : Canvas Confetti
- **Audio & Haptique** : Web Audio API + Vibration API
- **Auteur** : K.R
