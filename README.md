# SkyRolePlay – Discord Bot GTA V RP Console

![Javascript](https://img.shields.io/badge/Javascript-yellow.svg?style=for-the-badge&logo=javascript&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)

## 📖 Description

**SkyRolePlay** est un bot Discord conçu pour les joueurs de **GTA 5 RP sur console** sans accès au modding (FiveM). Il permet de recréer l’expérience RP (RolePlay) en remplaçant la plupart des mods par des commandes directement depuis Discord.  
Avec SkyRolePlay, vous pouvez gérer votre entreprise, investir en bourse, organiser des braquages, suivre l’économie générale du serveur RP, consulter vos informations de personnage et effectuer de nombreuses actions roleplay : tout cela sans quitter votre manette.

**⚠️ NOTE IMPORTANTE**: SkyRolePlay n’est plus maintenu, vous pouvez néanmoins l’héberger vous-même, mais la structure **NiDev** n’en assure plus l’exploitation ni ne garantit qu’il soit à jour avec les API et Discord.

---

## 🛠️ Fonctionnalités

- **Gestion d’entreprise**  
  - Création, achat et gestion d’entreprises (restaurants, garages, boîtes de nuit, etc.)  
  - Recrutement de membres du personnel et gestion des salaires  
  - Rapport de revenus avec un compte bancaire dédié  

- **Bourse et finance**  
  - Consultation en temps réel des cours d’actions basé sur la réalité (Gecko API)  
  - Achat et vente d’actions sur le marché RP  
  - Portefeuille personnel avec historique des transactions   

- **Braquages et activités criminelles**  
  - Planification et lancement de braquages de banques, cambriolages, etc.  
  - Guerre entre groupes illégaux  

- **Économie générale du serveur**  
  - Immobilier et biens de consommation (items, voitures, nourriture) évoluant selon l’offre et la demande  
  - Système de prêts avec la banque centrale

- **Informations du joueur**  
  - Fiche de personnage détaillée :  
  - Nom, métier,, argent en poche et en banque  
  - Inventaire (véhicules, armes, biens, stocks d’entreprise)  
  - Historique des actions (transactions boursières, salaires perçus)  
  - Notifications de salaire, d’amendes ou de pénalités  

- **Actions RolePlay complémentaires**  
  - **Emploi & Carrière** : postuler à des jobs (policier, ambulancier, chauffeur de bus, etc.), travailler pour gagner un salaire variable  
  - **Système de permis & amendes** :  
    - Passer son permis (voiture, moto, avion)  
    - Recevoir des amendes selon le comportement et/ou retrait de point (excès de vitesse, conduite dangereuse)  

Et bien d'autres choses encore !

---

## 🎯 Prérequis

Avant d’héberger SkyRolePlay :

1. **Un serveur Discord** où vous disposez des droits d’administration (pour inviter et configurer le bot).  
2. **Un compte Discord Developer** avec un BotToken valide (voir [Discord Developer Portal](https://discord.com/developers/applications)).  
3. **Node.js (>= 16.x)** et **npm** (ou **Yarn**) installés si vous souhaitez héberger votre propre instance du bot.  
4. **Base de données MySQL** accessible (voir [Xampp](https://www.apachefriends.org/fr/index.html) si vous voulez host en local).

---

## 🚀 Installation & Configuration

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-orga/skyroleplay.git
cd skyroleplay
npm i
node shard.js
