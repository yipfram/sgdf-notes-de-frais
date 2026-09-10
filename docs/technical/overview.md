# Vue d’ensemble du projet

## Fonctionnalités principales

- Capture photo et import de justificatifs (images/PDF)
- Saisie guidée des informations de dépense
- Envoi automatique par email (trésorerie + utilisateur)
- Groupes indépendants : unités, couleurs et adresse de trésorerie propres à chaque groupe
- Validation de l’adresse de trésorerie avant le premier envoi
- Support PWA (installation écran d’accueil)
- Mode hors ligne partiel (préparation possible, envoi en ligne)

## Stack technique

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Better Auth** pour l’authentification, les organisations et les invitations
- **SMTP / Nodemailer** pour l’envoi des emails

## Architecture simplifiée

```mermaid
flowchart TD
  visiteur[Visiteur] --> session{Session valide ?}
  session -- Non --> connexion[/Connexion : e-mail ou Google/]
  connexion --> compte{Compte existant ?}
  compte -- Non --> inscription[Inscription e-mail]
  inscription --> verification[Validation de l’adresse par e-mail]
  verification --> accueil[/Accueil/]
  compte -- Oui --> accueil
  session -- Oui --> accueil

  accueil --> groupeActif{Groupe actif ?}
  groupeActif -- Non --> choix[Choisir un groupe ou en créer un]
  choix --> creation[Créer l’organisation Better Auth]
  creation --> proprietaire[Créateur : rôle owner]
  proprietaire --> groupePrincipal[Définir le groupe principal\net le rendre actif]
  choix --> groupePrincipal
  groupePrincipal --> configuration

  groupeActif -- Oui --> configuration{Groupe configuré ?}
  configuration -- Non, owner ou admin --> configurer[Configurer trésorerie et unités]
  configurer --> donnees[(PostgreSQL : scouticket_group_data)]
  configurer --> validationTresorerie[E-mail de validation de la trésorerie]
  configuration -- Oui --> depense[Créer et envoyer une note de frais]

  proprietaire --> gestion[/Gestion des membres/]
  gestion --> invitation[Better Auth : inviter avec le rôle member]
  invitation --> invitationEnAttente[(PostgreSQL : invitation pending)]
  invitation --> emailInvitation[E-mail SMTP contenant /invitation?id=...]
  emailInvitation --> lienInvitation[Le membre ouvre le lien]
  lienInvitation --> connecte{Membre connecté ?}
  connecte -- Non --> retourConnexion[/Connexion ou inscription\navec callbackURL vers l’invitation/]
  retourConnexion --> lienInvitation
  connecte -- Oui --> decision{Accepter ?}
  decision -- Non --> refuse[Invitation refusée]
  decision -- Oui --> accepter[Better Auth : acceptInvitation]
  accepter --> membre[(PostgreSQL : membre rattaché\nau groupe, rôle member)]
  membre --> groupePrincipalInvite[Activer et enregistrer\nle groupe principal]
  groupePrincipalInvite --> depense
```

## Séquence complète : compte, groupe et invitation

```mermaid
sequenceDiagram
  autonumber
  actor Responsable
  actor Membre
  participant Client as Navigateur / UI React
  participant Proxy as Proxy Next.js
  participant API as Routes API Next.js
  participant Auth as Better Auth
  participant DB as PostgreSQL
  participant SMTP as Serveur SMTP
  participant Boite as Boîte e-mail

  Note over Responsable,Boite: Création du compte et du premier groupe
  Responsable->>Client: Ouvre une route privée
  Client->>Proxy: Requête HTTP
  Proxy-->>Client: Redirection vers /sign-in si aucune session
  Responsable->>Client: Inscription par e-mail et mot de passe
  Client->>Auth: POST /api/auth/sign-up/email
  Auth->>DB: Crée user, account et demande de vérification
  Auth->>SMTP: Envoie le lien de confirmation
  SMTP->>Boite: E-mail de vérification
  Responsable->>Boite: Ouvre le lien de confirmation
  Boite->>Auth: Validation de l’adresse e-mail
  Auth->>DB: Marque l’adresse vérifiée et crée la session
  Auth-->>Client: Retour vers callbackURL, sinon /

  Responsable->>Client: Crée un groupe depuis l’accueil
  Client->>Auth: organization.create(nom, slug)
  Auth->>DB: Crée organization et member(owner)
  Auth-->>Client: Identifiant de l’organisation créée
  Client->>Auth: organization.setActive(organizationId)
  Client->>API: POST /api/user/default-group
  API->>DB: Enregistre scouticket_user_default_group

  Responsable->>Client: Renseigne trésorerie et unités
  Client->>API: POST /api/group/config
  API->>Auth: Lit session et activeOrganizationId
  API->>DB: Vérifie le rôle owner/admin
  API->>DB: Écrit scouticket_group_data
  API->>SMTP: Envoie le lien de validation trésorerie
  SMTP->>Boite: E-mail de validation

  Note over Responsable,Boite: Invitation du membre
  Responsable->>Client: Ouvre /gestion-membres
  Client->>API: GET /api/group/members
  API->>Auth: Lit session et groupe actif
  API->>DB: Vérifie rôle owner/admin et liste invitations pending
  API-->>Client: Organisation et invitations en attente
  Client-->>Responsable: Affiche la gestion des membres
  Responsable->>Client: Invite adresse@email.fr
  Client->>Auth: organization.inviteMember(email, member)
  Auth->>DB: Crée invitation(status pending)
  Auth->>SMTP: Déclenche sendInvitationEmail
  SMTP->>Boite: Lien /invitation?id=...

  Note over Membre,Boite: Connexion ou création du compte invité
  Membre->>Boite: Ouvre le lien d’invitation
  Boite->>Proxy: GET /invitation?id=...
  alt Aucune session
    Proxy-->>Client: Redirection /sign-in avec callbackURL
    Membre->>Client: Se connecte avec l’adresse invitée
    Client->>Auth: POST /api/auth/sign-in/email
    Auth->>DB: Vérifie identifiants et adresse confirmée
    Auth-->>Client: Crée la session
    Client->>Proxy: Retour vers /invitation?id=...
  else Aucun compte
    Proxy-->>Client: Redirection /sign-in avec callbackURL
    Membre->>Client: S’inscrit avec l’adresse invitée
    Client->>Auth: POST /api/auth/sign-up/email
    Auth->>SMTP: Envoie l’e-mail de vérification
    SMTP->>Boite: Lien de confirmation
    Membre->>Boite: Ouvre le lien de confirmation
    Boite->>Auth: Valide l’e-mail, crée la session
    Auth-->>Client: Retour vers /invitation?id=...
  else Session déjà active
    Proxy-->>Client: Affiche /invitation
  end

  Client->>Client: Charge l’identifiant d’invitation
  opt Nom de groupe absent de l’URL
    Client->>API: GET /api/invitation?id=...
    API->>DB: Recherche invitation pending et organisation
    DB-->>API: Nom du groupe
  end
  Membre->>Client: Accepte l’invitation
  Client->>Auth: organization.acceptInvitation(invitationId)
  Auth->>DB: Invitation acceptée et member créé (role member)
  Auth-->>Client: Succès
  Client->>Auth: organization.setActive(organizationId)
  Client->>API: POST /api/user/default-group
  API->>DB: Enregistre le groupe principal
  Client->>Client: Redirection vers /
  Client-->>Membre: Accès à l’application du groupe
```

## Informations personnelles

L'application n'a pas de base de données persistante pour les justificatifs. Les pièces jointes sont transmises par e-mail et ne sont pas stockées par l’application.

Better Auth gère les comptes, les organisations, les rôles et les invitations. L’application stocke la configuration des groupes (adresse de trésorerie, unités et état de validation) dans PostgreSQL, dans `scouticket_group_data`.

La préférence de groupe principal est stockée séparément dans `scouticket_user_default_group`. Après l’acceptation d’une invitation, le groupe rejoint devient automatiquement le groupe actif et principal du membre.
