# Backend Architecture

```txt
Pour contextualiser vos productions, voici les fonctionnalités envisagées pour le site :
• Profil étudiant : liste de compétences, niveaux déclarés, disponibilités
• Système de matching : trouver un étudiant pour apprendre ou enseigner une compétence
• Gestion des sessions : planification d'ateliers, de cours rapides, de clubs thématiques
• Gamification : badges, points, défis entre utilisateurs, niveaux de progression
• Feed social : partage de réalisations, recommandations, feedbacks entre pairs
```

## Student Profile

### Users (postgresql table) [Done]

### Friends (postgresql table) [Done]

### Campus (postgresql table) [Done]

### Academic Level (postgresql table) [Done]

### Courses (postgresql table) [Done]

### Skills (postgresql table) [Done]

## Matching System

### Matching Action (deno edge function)

### Matching History (postgresql table)

## Session Management

### Session_Types (postgresql enum)

### Sessions (postgresql table)

## Game Style Elements

### Badges (postgresql table)

What kind of badges would the client want ?

### User Challenges (postgresql table)

What type of challenges should be issued that the lient wants ?

## Social Feed

The social feed just un genre de twitter. Ou une liste d'action possible avec des contenu générer par l'utilisateur dedans.
Genre d'actionsc possibles :

- Partage de réalisation (un poste de style linked'in) tous seul ou avec d'autre utilisateurs.
- Recommendation un poste qui recommande des sessions, un ou des utilisateur avec qui faire des choses ensembles.
- Feedback entre pairs ???

### Global Social Feed (postgresql table)

### Friends Social Feed (postgresql table) (relation based)

# Frontend Web Pages

- privacy-policy
- terms-of-service
- legal-notice
- accessibility
- contact
- about
- faq

- home (/)
- login (/login)
- register (/register)
- verify email (/verify-email)
- profile (/profile/${uuid})
- campus (/campus/${uuid})
- courses (/courses/${uuid})
