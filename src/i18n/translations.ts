import { AppLanguage, CompetitionId, DebateTopic, MatchEvent, MatchStatus } from '../types/football';

export interface Translations {
  documentTitle: string;
  langSwitcherLabel: string;
  nav: {
    news: string;
    matches: string;
    standings: string;
    mercato: string;
    debates: string;
    mainAria: string;
    mobileAria: string;
  };
  header: {
    favClub: string;
    favCount: (count: number) => string;
    profileAria: string;
    goalAlerts: string;
    alertsShort: string;
  };
  utility: {
    leaguesBanner: string;
    realtime: string;
    refresh: string;
    syncing: string;
    matchHistory: string;
    contact: string;
    lightMode: string;
    darkMode: string;
    toLightAria: string;
    toDarkAria: string;
    myFavClubs: string;
    edit: string;
    onlyMyClubs: string;
    prioritize: string;
    all: string;
  };
  cover: {
    aria: string;
    kicker: string;
    imageAlt: string;
    subtitle: string;
    ctaScores: string;
    ctaMyFav: string;
    ctaFavCount: (count: number) => string;
  };
  home: {
    spotlightLive: (count: number) => string;
    spotlightDefault: string;
    allSchedule: string;
    noFavMatchesToday: (clubs: string) => string;
    showAllMultiplex: string;
    manageFavs: string;
    liveBadge: string;
    finishedBadge: string;
    possSeeStats: (h: number, a: number) => string;
    favNewsCount: (count: number) => string;
    onlyFavNewsDisplayed: string;
    showRestEuroNews: string;
    noFavNewsToday: (clubs: string) => string;
    showAllNewsToday: string;
    top5LiveSuffix: string;
    allStandings: string;
    colClub: string;
    colPlayed: string;
    colDiff: string;
    colPts: string;
    liveMercato: string;
    seeAll: string;
    featuredDebate: string;
    participate: string;
    voteDebateCta: string;
    footerCopy: (year: number) => string;
    footerSchedule: string;
    footerHistory: string;
    footerAlerts: string;
  };
  toasts: {
    testAlert: string;
    liveGoal: string;
    closeAria: string;
    pushGoalTitle: (team: string, minute: number) => string;
  };
  matchesView: {
    aria: string;
    kicker: string;
    titleHistory: string;
    titleLive: string;
    tabLiveUpcoming: (count: number) => string;
    tabHistory: (count: number) => string;
    myClubsCount: (count: number) => string;
    prioritize: string;
    all: string;
    pickFavClub: string;
    searchPlaceholder: string;
    liveMatchesCount: (count: number) => string;
    upcomingScheduleCount: (count: number) => string;
    noUpcomingFav: string;
    noUpcomingDefault: string;
    showAllSchedule: string;
    noHistoryFav: string;
    noHistoryDefault: string;
    showAllHistory: string;
    scorersPrefix: string;
    possShort: (h: number, a: number) => string;
    commentsCount: (count: number) => string;
    statsLive: string;
    finishedLabel: string;
    liveLabel: string;
    favClubAria: string;
  };
  matchDetail: {
    closeAria: string;
    kickoff: string;
    liveScore: string;
    referee: string;
    spectators: string;
    supporterPrediction: string;
    votesCount: (count: number) => string;
    draw: string;
    tabStats: string;
    tabTimeline: (count: number) => string;
    tabComments: (count: number) => string;
    syncingStats: string;
    statsUpcomingHint: string;
    noEventsYet: string;
    assistBy: (name: string) => string;
    reactionsTitle: (h: string, a: string) => string;
    statsLabels: {
      possession: string;
      shotsTotal: string;
      shotsOnTarget: string;
      passesCompleted: string;
      corners: string;
      saves: string;
      offsides: string;
      fouls: string;
      yellowCards: string;
    };
    eventTypes: Record<MatchEvent['type'], string>;
  };
  standings: {
    aria: string;
    kicker: string;
    title: string;
    loading: string;
    colTeam: string;
    colPlayed: string;
    colWon: string;
    colDrawn: string;
    colLost: string;
    colGoals: string;
    colDiff: string;
    colPts: string;
    zoneUclNational: string;
    zoneUcl: string;
    zoneUel: string;
    zonePlayoff: string;
    zoneRelegation: string;
    legendQualTop4: string;
    legendUel: string;
    legendRelegation: string;
    leadersTitle: string;
    seasonShort: string;
    tabScorers: string;
    tabAssists: string;
    tabDecisive: string;
    leadersNote: string;
    matchesPlayed: (count: number) => string;
    goalsUnit: (count: number) => string;
    assistsUnit: (count: number) => string;
    contribUnit: (count: number) => string;
    shortGoals: string;
    shortAssists: string;
  };
  mercato: {
    aria: string;
    kicker: string;
    title: string;
    desc: string;
    searchPlaceholder: string;
    filterAll: string;
    filterOfficial: string;
    filterRumors: string;
    bannerCaption: string;
    bannerAlt: string;
    noFavTransfers: string;
    noSearchTransfers: string;
    showAllMercato: string;
    supporterViews: (count: number) => string;
    reactToStory: string;
    readFullWire: string;
    commentsTitle: string;
    selectPrompt: string;
    catOfficial: string;
    catRumors: string;
  };
  debates: {
    aria: string;
    kicker: string;
    title: string;
    desc: string;
    closeForm: string;
    startDebate: string;
    bannerCaption: string;
    bannerAlt: string;
    formTitle: string;
    qPlaceholder: string;
    authorPlaceholder: string;
    descPlaceholder: string;
    opt1Placeholder: string;
    opt2Placeholder: string;
    opt3Placeholder: string;
    formError: string;
    publishDebate: string;
    proposedBy: (author: string) => string;
    votesCount: (count: number) => string;
    hideDiscussion: string;
    seeArguments: (count: number) => string;
    supporterArgumentsTitle: string;
    predictionsTitle: string;
    liveTrends: string;
    drawShort: string;
  };
  comments: {
    defaultTitle: string;
    reactionsCount: (count: number) => string;
    authorPlaceholder: string;
    clubPlaceholder: string;
    contentPlaceholder: string;
    sending: string;
    publish: string;
    minLengthError: string;
    submitError: string;
    empty: string;
    justNow: string;
    minsAgo: (m: number) => string;
    hoursAgo: (h: number) => string;
    likeAria: (author: string) => string;
  };
  alerts: {
    aria: string;
    title: string;
    closeAria: string;
    browserPushTitle: string;
    browserPushDesc: string;
    enabled: string;
    enable: string;
    goalSound: string;
    soundOn: string;
    soundMuted: string;
    filterNotifs: string;
    filterFollowedDesc: string;
    filterAllDesc: string;
    myFollowedBtn: string;
    allMultiplexBtn: string;
    testSending: string;
    testBtn: string;
    createTitle: string;
    typeTeam: string;
    typeComp: string;
    liveGoals: string;
    lineups: string;
    mercato: string;
    saveAlert: string;
    activeAlerts: string;
    emptyAlerts: string;
    liveGoalsLabel: string;
    lineupsLabel: string;
    mercatoLabel: string;
    generalAlerts: string;
    deleteAria: (label: string) => string;
  };
  profile: {
    aria: string;
    title: string;
    closeAria: string;
    languageTitle: string;
    languageHint: string;
    identityLabel: string;
    savedLocally: string;
    identityPlaceholder: string;
    identityHelp: string;
    displayTitle: string;
    modeOnlyTitle: string;
    modeOnlyDesc: string;
    modePrioritizeTitle: string;
    modePrioritizeDesc: string;
    modeAllTitle: string;
    modeAllDesc: string;
    followedTitle: (count: number) => string;
    clearAll: string;
    emptyFollowed: string;
    removeAria: (club: string) => string;
    syncingAlerts: string;
    syncAlertsBtn: (count: number) => string;
    syncDone: string;
    addClubTitle: string;
    searchPlaceholder: string;
    addBtn: string;
  };
  article: {
    closeAria: string;
    readSource: string;
    reactionsTitle: string;
  };
  contact: {
    aria: string;
    kicker: string;
    title: string;
    desc: string;
    responseSla: string;
    sentTitle: string;
    sentSuccess: string;
    trackingRef: string;
    sendAnother: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    openMailClient: string;
    sending: string;
    sendBtn: string;
    errorFallback: string;
    serverError: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  fr: {
    documentTitle: 'THE PITCH — Football, Scores en Direct, Mercato & Débats',
    langSwitcherLabel: 'Choisir la langue',
    nav: {
      news: 'Actualités',
      matches: 'Matchs',
      standings: 'Classements',
      mercato: 'Mercato',
      debates: 'Débats',
      mainAria: 'Navigation principale',
      mobileAria: 'Navigation mobile',
    },
    header: {
      favClub: 'Club Favori',
      favCount: (count) => `Favoris (${count})`,
      profileAria: 'Ouvrir le profil supporter et gérer vos clubs favoris',
      goalAlerts: 'Alertes Buts',
      alertsShort: 'Alertes',
    },
    utility: {
      leaguesBanner: 'Ligue 1 · Premier League · La Liga · Serie A · Bundesliga · Ligue 1 DZ · Sélections',
      realtime: 'Temps réel',
      refresh: 'Actualiser',
      syncing: 'Synchronisation...',
      matchHistory: 'Historique matchs',
      contact: 'Contact',
      lightMode: 'Mode clair',
      darkMode: 'Mode sombre',
      toLightAria: 'Passer en mode clair',
      toDarkAria: 'Passer en mode sombre',
      myFavClubs: 'Mes clubs favoris :',
      edit: 'Modifier',
      onlyMyClubs: 'Mes clubs uniquement',
      prioritize: 'Prioritaires',
      all: 'Tout',
    },
    cover: {
      aria: 'Couverture THE PITCH',
      kicker: 'Média 100 % Football · Actualité & Scores en Temps Réel',
      imageAlt: 'Pelouse éclairée d’un grand stade européen de football en soirée avant le coup d’envoi',
      subtitle: 'Le football ne s’arrête jamais, notre information non plus.',
      ctaScores: 'Scores & Calendrier',
      ctaMyFav: 'Mon Club Favori',
      ctaFavCount: (count) => `Mes Favoris (${count})`,
    },
    home: {
      spotlightLive: (count) => `Matchs en direct (${count}) & Multiplex du jour`,
      spotlightDefault: 'Affiches du jour en Europe & Sélections',
      allSchedule: 'Tout le calendrier',
      noFavMatchesToday: (clubs) =>
        `Aucun match en cours ou programmé aujourd’hui pour vos clubs favoris (${clubs}).`,
      showAllMultiplex: 'Voir tout le multiplex',
      manageFavs: 'Gérer mes favoris',
      liveBadge: 'EN DIRECT',
      finishedBadge: 'Terminé',
      possSeeStats: (h, a) => `Poss. ${h}% – ${a}% · Voir stats`,
      favNewsCount: (count) =>
        `★ ${count} actualité${count > 1 ? 's' : ''} liée${count > 1 ? 's' : ''} à vos clubs favoris`,
      onlyFavNewsDisplayed:
        'Toutes les actualités correspondant à vos clubs favoris sont affichées.',
      showRestEuroNews: 'Afficher aussi le reste de l’actualité européenne',
      noFavNewsToday: (clubs) =>
        `Aucune dépêche récente ne mentionne actuellement vos clubs favoris (${clubs}).`,
      showAllNewsToday: 'Afficher toutes les actualités du jour',
      top5LiveSuffix: '— Top 5 en direct',
      allStandings: 'Tous les classements',
      colClub: 'Club',
      colPlayed: 'MJ',
      colDiff: 'Diff',
      colPts: 'Pts',
      liveMercato: 'Mercato en Direct',
      seeAll: 'Tout voir',
      featuredDebate: 'Débat à la une',
      participate: 'Participer',
      voteDebateCta: 'Voter & Débattre avec les supporters',
      footerCopy: (year) => `© ${year} THE PITCH — Média football indépendant.`,
      footerSchedule: 'Calendrier & Direct',
      footerHistory: 'Historique complet',
      footerAlerts: 'Alertes Buts',
    },
    toasts: {
      testAlert: 'TEST ALERTE',
      liveGoal: 'BUT EN DIRECT',
      closeAria: 'Fermer la notification de but',
      pushGoalTitle: (team, minute) => `BUT ! ${team} (${minute}')`,
    },
    matchesView: {
      aria: 'Scores en direct, calendrier et historique des matchs',
      kicker: 'Données en temps réel · 5 Championnats Européens, Ligue 1 Algérie & Sélections',
      titleHistory: 'Historique Complet des Matchs',
      titleLive: 'Scores en Direct & Calendrier',
      tabLiveUpcoming: (count) => `En Direct & À Venir (${count})`,
      tabHistory: (count) => `Historique Complet (${count})`,
      myClubsCount: (count) => `Mes clubs (${count})`,
      prioritize: 'Prioritaires',
      all: 'Tous',
      pickFavClub: 'Choisir un Club Favori',
      searchPlaceholder: 'Filtrer par club, nation, stade...',
      liveMatchesCount: (count) => `Matchs en direct (${count})`,
      upcomingScheduleCount: (count) => `Calendrier à venir (${count})`,
      noUpcomingFav: 'Aucun match à venir trouvé pour vos clubs favoris dans cette compétition.',
      noUpcomingDefault:
        'Aucun match à venir trouvé pour ce filtre. Consultez l’onglet Historique Complet pour les rencontres récentes.',
      showAllSchedule: 'Afficher tout le calendrier',
      noHistoryFav: 'Aucun match récent archivé pour vos clubs favoris dans cette compétition.',
      noHistoryDefault: 'Aucun match archivé ne correspond à votre recherche.',
      showAllHistory: 'Afficher tout l’historique',
      scorersPrefix: 'Buteurs :',
      possShort: (h, a) => `Poss. ${h}%–${a}%`,
      commentsCount: (count) => `${count} avis`,
      statsLive: 'Stats & Direct',
      finishedLabel: 'Terminé',
      liveLabel: 'EN DIRECT',
      favClubAria: 'Club favori',
    },
    matchDetail: {
      closeAria: 'Fermer la fiche du match',
      kickoff: 'Coup d’envoi',
      liveScore: 'Score en direct',
      referee: 'Arbitre :',
      spectators: 'spectateurs',
      supporterPrediction: 'Pronostic des supporters',
      votesCount: (count) => `${count} votes`,
      draw: 'Match nul',
      tabStats: 'Statistiques détaillées',
      tabTimeline: (count) => `Chronologie (${count})`,
      tabComments: (count) => `Commentaires (${count})`,
      syncingStats: 'Synchronisation des statistiques officielles en direct...',
      statsUpcomingHint:
        'Les statistiques en direct (possession, tirs, passes, corners) apparaîtront dès le coup d’envoi.',
      noEventsYet: 'Aucun fait de jeu enregistré pour le moment.',
      assistBy: (name) => `Passe D. ${name}`,
      reactionsTitle: (h, a) => `Réactions — ${h} vs ${a}`,
      statsLabels: {
        possession: 'Possession (%)',
        shotsTotal: 'Tirs totaux',
        shotsOnTarget: 'Tirs cadrés',
        passesCompleted: 'Passes réussies',
        corners: 'Corners',
        saves: 'Arrêts du gardien',
        offsides: 'Hors-jeu',
        fouls: 'Fautes commises',
        yellowCards: 'Cartons jaunes',
      },
      eventTypes: {
        goal: 'But',
        penalty_goal: 'But (Pénalty)',
        yellow_card: 'Carton jaune',
        red_card: 'Carton rouge',
        substitution: 'Remplacement',
      },
    },
    standings: {
      aria: 'Classements et statistiques individuelles',
      kicker: 'Saison 2026–2027 · Classements officiels en temps réel',
      title: 'Classements & Statistiques',
      loading: 'Chargement du classement en direct...',
      colTeam: 'Équipe',
      colPlayed: 'MJ',
      colWon: 'G',
      colDrawn: 'N',
      colLost: 'P',
      colGoals: 'BP:BC',
      colDiff: 'Diff',
      colPts: 'Pts',
      zoneUclNational: 'Quarts / Qualification',
      zoneUcl: 'Ligue des Champions',
      zoneUel: 'Europa League',
      zonePlayoff: 'Barrage',
      zoneRelegation: 'Relégation',
      legendQualTop4: 'Qualification / Top 4',
      legendUel: 'Europa League',
      legendRelegation: 'Zone de relégation',
      leadersTitle: 'Leaders Statistiques',
      seasonShort: 'Saison 2026–27',
      tabScorers: 'Buteurs',
      tabAssists: 'Passeurs',
      tabDecisive: 'Décisifs',
      leadersNote: 'Statistiques individuelles disponibles pour les 5 championnats européens et la Ligue 1 Algérie.',
      matchesPlayed: (count) => `${count} matchs`,
      goalsUnit: (count) => `${count} buts`,
      assistsUnit: (count) => `${count} p.d.`,
      contribUnit: (count) => `${count} B+P`,
      shortGoals: 'B',
      shortAssists: 'PD',
    },
    mercato: {
      aria: 'Mercato et transferts de joueurs',
      kicker: 'Fil Mercato en Direct · Europe & International',
      title: 'Mercato, Rumeurs & Transferts en Cours',
      desc: 'Retrouvez les dernières informations et rumeurs de transferts publiées en temps réel à travers les cinq grands championnats européens.',
      searchPlaceholder: 'Rechercher un joueur ou club (ex. Real Madrid, Milan, Man United)...',
      filterAll: 'Tous',
      filterOfficial: 'Signatures',
      filterRumors: 'Rumeurs',
      bannerCaption: 'Cellule Mercato THE PITCH · Dépêches en direct',
      bannerAlt: 'Tunnel des joueurs donnant sur la pelouse éclairée d’un stade européen',
      noFavTransfers: 'Aucun dossier mercato récent ne mentionne vos clubs favoris.',
      noSearchTransfers: 'Aucun dossier mercato ne correspond à votre recherche.',
      showAllMercato: 'Voir tout le fil mercato',
      supporterViews: (count) => `${count} avis supporters`,
      reactToStory: 'Réagir au dossier',
      readFullWire: 'Lire la dépêche complète',
      commentsTitle: 'Avis des supporters sur ce dossier',
      selectPrompt: 'Sélectionnez une rumeur ou signature pour lire la dépêche et réagir.',
      catOfficial: 'Officiel / Transfert',
      catRumors: 'Mercato & Rumeurs',
    },
    debates: {
      aria: 'Débats et pronostics entre supporters',
      kicker: 'Communauté THE PITCH · Espace Supporters',
      title: 'Débats & Pronostics',
      desc: 'La tribune des passionnés : votez sur les grands sujets du moment, partagez votre avis et pronostiquez les prochaines affiches européennes.',
      closeForm: 'Fermer le formulaire',
      startDebate: 'Lancer un débat',
      bannerCaption: 'Tribune Supporters THE PITCH · Sondages & Pronostics 1 / N / 2',
      bannerAlt: 'Supporters de football dans les tribunes d’un stade européen avant le coup d’envoi',
      formTitle: 'Ouvrir un nouveau débat de supporters',
      qPlaceholder: 'Question du débat (ex. Qui mérite le poste de n°9 en Équipe de France ?)',
      authorPlaceholder: 'Votre pseudo',
      descPlaceholder: 'Contexte ou argument de départ (optionnel)',
      opt1Placeholder: 'Choix 1 (requis)',
      opt2Placeholder: 'Choix 2 (requis)',
      opt3Placeholder: 'Choix 3 (optionnel)',
      formError: 'Indiquez une question claire et au moins 2 options de vote.',
      publishDebate: 'Publier le débat',
      proposedBy: (author) => `Proposé par ${author}`,
      votesCount: (count) => `${count} votes`,
      hideDiscussion: 'Masquer la discussion',
      seeArguments: (count) => `Voir les arguments (${count})`,
      supporterArgumentsTitle: 'Arguments des supporters',
      predictionsTitle: 'Grille Pronostics 1 · N · 2',
      liveTrends: 'Tendances en direct',
      drawShort: 'Nul',
    },
    comments: {
      defaultTitle: 'Commentaires des supporters',
      reactionsCount: (count) => `${count} réaction${count > 1 ? 's' : ''}`,
      authorPlaceholder: 'Votre pseudo (ex. Lucas_PSG)',
      clubPlaceholder: 'Club / Sélection (optionnel)',
      contentPlaceholder: 'Partagez votre analyse ou réaction avec la communauté...',
      sending: 'Envoi...',
      publish: 'Publier',
      minLengthError: 'Veuillez écrire un commentaire d’au moins 2 caractères.',
      submitError: 'Impossible de publier votre commentaire pour le moment.',
      empty: 'Aucun commentaire pour l’instant. Lancez la discussion !',
      justNow: 'À l’instant',
      minsAgo: (m) => `Il y a ${m} min`,
      hoursAgo: (h) => `Il y a ${h} h`,
      likeAria: (author) => `Soutenir le commentaire de ${author}`,
    },
    alerts: {
      aria: 'Alertes personnalisées et notifications push en temps réel',
      title: 'Alertes & Push Buts en Direct',
      closeAria: 'Fermer le panneau des alertes',
      browserPushTitle: 'Notifications Push Navigateur',
      browserPushDesc: 'Alerte instantanée sur votre écran à chaque but marqué.',
      enabled: 'Activées',
      enable: 'Activer',
      goalSound: 'Signal sonore lors d’un but',
      soundOn: 'Activé',
      soundMuted: 'Muet',
      filterNotifs: 'Filtrer les notifications',
      filterFollowedDesc: 'Uniquement vos équipes et championnats suivis',
      filterAllDesc: 'Tous les matchs en direct du multiplex',
      myFollowedBtn: 'Mes suivis',
      allMultiplexBtn: 'Tout le multiplex',
      testSending: 'Envoi en cours...',
      testBtn: 'Tester une alerte but en temps réel',
      createTitle: 'Créer une alerte personnalisée',
      typeTeam: 'Club ou Sélection',
      typeComp: 'Championnat',
      liveGoals: 'Buts live',
      lineups: 'Compos',
      mercato: 'Mercato',
      saveAlert: 'Enregistrer cette alerte',
      activeAlerts: 'Vos alertes actives',
      emptyAlerts: 'Aucune alerte configurée. Ajoutez votre club ou sélection favorite ci-dessus.',
      liveGoalsLabel: 'Buts en direct',
      lineupsLabel: 'Compositions',
      mercatoLabel: 'Mercato',
      generalAlerts: 'Alertes générales',
      deleteAria: (label) => `Supprimer l’alerte pour ${label}`,
    },
    profile: {
      aria: 'Profil supporter et clubs favoris',
      title: 'Profil Supporter & Club Favori',
      closeAria: 'Fermer le profil',
      languageTitle: 'Langue de l’interface',
      languageHint: 'Actualise aussi le fil d’actualités et le mercato.',
      identityLabel: 'Identité supporter',
      savedLocally: 'Sauvegardé localement',
      identityPlaceholder: 'Votre pseudo (ex. Karim_OM, Lucas_PSG)...',
      identityHelp: 'Utilisé automatiquement lorsque vous publiez un commentaire ou un avis.',
      displayTitle: 'Affichage des actualités et des scores',
      modeOnlyTitle: 'Uniquement mes clubs suivis',
      modeOnlyDesc:
        'Filtre les actualités, scores en direct, calendrier et mercato pour n’afficher que vos clubs favoris.',
      modePrioritizeTitle: 'Priorité aux clubs suivis',
      modePrioritizeDesc:
        'Place les matchs et articles de vos clubs favoris en tête de liste, suivis du reste du multiplex.',
      modeAllTitle: 'Tout afficher (filtre désactivé)',
      modeAllDesc: 'Affiche l’ordre chronologique standard de toutes les compétitions.',
      followedTitle: (count) => `Mes clubs & sélections suivis (${count})`,
      clearAll: 'Tout effacer',
      emptyFollowed:
        'Aucun club favori sélectionné. Choisissez un ou plusieurs clubs ci-dessous pour personnaliser vos scores et actualités.',
      removeAria: (club) => `Retirer ${club} des favoris`,
      syncingAlerts: 'Activation des alertes...',
      syncAlertsBtn: (count) =>
        `Activer aussi les alertes buts pour ${count} club${count > 1 ? 's' : ''}`,
      syncDone: 'Alertes buts en direct activées pour vos clubs favoris.',
      addClubTitle: 'Ajouter un club ou une sélection',
      searchPlaceholder: 'Rechercher un club (PSG, Arsenal, Real Madrid...)',
      addBtn: 'Ajouter',
    },
    article: {
      closeAria: 'Fermer l’article',
      readSource: 'Consulter l’article complet sur le fil source',
      reactionsTitle: 'Réactions à l’article',
    },
    contact: {
      aria: 'Contacter la rédaction THE PITCH par email',
      kicker: 'Rédaction & Support Utilisateurs',
      title: 'Contacter THE PITCH',
      desc: 'Une information mercato à signaler, une suggestion de statistique ou une question technique sur vos alertes ? Écrivez directement à notre équipe éditoriale.',
      responseSla: 'Réponse moyenne sous 24 heures ouvrées · 7j/7 les soirs de grands matchs.',
      sentTitle: 'Message envoyé',
      sentSuccess: 'Votre message a bien été transmis à la rédaction THE PITCH.',
      trackingRef: 'Référence de suivi :',
      sendAnother: 'Envoyer un autre message',
      nameLabel: 'Nom complet',
      namePlaceholder: 'Ex. Rayan Kagawa',
      emailLabel: 'Adresse email',
      emailPlaceholder: 'vous@exemple.com',
      subjectLabel: 'Sujet',
      subjectPlaceholder: 'Ex. Partenariat / Suggestion statistique / Signalement',
      messageLabel: 'Message',
      messagePlaceholder: 'Votre message à destination de la rédaction THE PITCH...',
      openMailClient: 'Ouvrir dans votre messagerie locale',
      sending: 'Envoi...',
      sendBtn: 'Envoyer par email',
      errorFallback: 'Une erreur est survenue lors de l’envoi.',
      serverError: 'Impossible de joindre le serveur de contact.',
    },
  },

  ar: {
    documentTitle: 'THE PITCH — أخبار كرة القدم، النتائج المباشرة، الميركاتو والنقاشات',
    langSwitcherLabel: 'اختر اللغة',
    nav: {
      news: 'الأخبار',
      matches: 'المباريات',
      standings: 'الترتيب',
      mercato: 'الميركاتو',
      debates: 'النقاشات',
      mainAria: 'التنقل الرئيسي',
      mobileAria: 'التنقل على الجوال',
    },
    header: {
      favClub: 'النادي المفضل',
      favCount: (count) => `المفضلة (${count})`,
      profileAria: 'فتح ملف المشجع وإدارة الأندية المفضلة',
      goalAlerts: 'تنبيهات الأهداف',
      alertsShort: 'تنبيهات',
    },
    utility: {
      leaguesBanner: 'الدوري الفرنسي · الإنجليزي · الإسباني · الإيطالي · الألماني · الدوري الجزائري · المنتخبات',
      realtime: 'بث مباشر',
      refresh: 'تحديث',
      syncing: 'جارٍ التحديث...',
      matchHistory: 'سجل المباريات',
      contact: 'اتصل بنا',
      lightMode: 'الوضع النهاري',
      darkMode: 'الوضع الليلي',
      toLightAria: 'التبديل إلى الوضع النهاري',
      toDarkAria: 'التبديل إلى الوضع الليلي',
      myFavClubs: 'أنديتي المفضلة:',
      edit: 'تعديل',
      onlyMyClubs: 'أنديتي فقط',
      prioritize: 'أولوية للمفضلة',
      all: 'الكل',
    },
    cover: {
      aria: 'غلاف THE PITCH',
      kicker: 'منصة كرة قدم 100% · الأخبار والنتائج لحظة بلحظة',
      imageAlt: 'أرضية ملعب أوروبي مضاءة ليلاً قبل انطلاق المباراة',
      subtitle: 'كرة القدم لا تتوقف أبداً، وأخبارنا كذلك.',
      ctaScores: 'النتائج والجدول',
      ctaMyFav: 'ناديي المفضل',
      ctaFavCount: (count) => `أنديتي (${count})`,
    },
    home: {
      spotlightLive: (count) => `مباريات جارية الآن (${count}) وأبرز مواجهات اليوم`,
      spotlightDefault: 'مباريات اليوم في أوروبا والمنتخبات',
      allSchedule: 'الجدول الكامل',
      noFavMatchesToday: (clubs) =>
        `لا توجد مباريات جارية أو مجدولة اليوم لأنديتك المفضلة (${clubs}).`,
      showAllMultiplex: 'عرض كل المباريات',
      manageFavs: 'إدارة المفضلة',
      liveBadge: 'مباشر',
      finishedBadge: 'انتهت',
      possSeeStats: (h, a) => `الاستحواذ ${h}% – ${a}% · الإحصائيات`,
      favNewsCount: (count) => `★ ${count} أخبار مرتبطة بأنديتك المفضلة`,
      onlyFavNewsDisplayed: 'يتم عرض جميع الأخبار الخاصة بأنديتك المفضلة.',
      showRestEuroNews: 'عرض بقية الأخبار الأوروبية أيضاً',
      noFavNewsToday: (clubs) => `لا توجد أخبار حديثة تذكر أنديتك المفضلة (${clubs}) حالياً.`,
      showAllNewsToday: 'عرض كل أخبار اليوم',
      top5LiveSuffix: '— أول 5 مراكز مباشرة',
      allStandings: 'كل الترتيب',
      colClub: 'النادي',
      colPlayed: 'لعب',
      colDiff: 'فارق',
      colPts: 'نقاط',
      liveMercato: 'أخبار الميركاتو المباشرة',
      seeAll: 'عرض الكل',
      featuredDebate: 'نقاش اليوم',
      participate: 'شارك',
      voteDebateCta: 'صوّت وناقش مع الجماهير',
      footerCopy: (year) => `© ${year} THE PITCH — منصة كرة قدم مستقلة.`,
      footerSchedule: 'الجدول والمباشر',
      footerHistory: 'السجل الكامل',
      footerAlerts: 'تنبيهات الأهداف',
    },
    toasts: {
      testAlert: 'تنبيه تجريبي',
      liveGoal: 'هدف مباشر',
      closeAria: 'إغلاق إشعار الهدف',
      pushGoalTitle: (team, minute) => `هدف! ${team} (${minute}')`,
    },
    matchesView: {
      aria: 'النتائج المباشرة، الجدول وسجل المباريات',
      kicker: 'بيانات مباشرة لحظة بلحظة · الدوريات الأوروبية الخمسة، الدوري الجزائري والمنتخبات',
      titleHistory: 'السجل الكامل للمباريات',
      titleLive: 'النتائج المباشرة والجدول',
      tabLiveUpcoming: (count) => `مباشر والقادمة (${count})`,
      tabHistory: (count) => `السجل الكامل (${count})`,
      myClubsCount: (count) => `أنديتي (${count})`,
      prioritize: 'أولوية',
      all: 'الكل',
      pickFavClub: 'اختر نادياً مفضلاً',
      searchPlaceholder: 'ابحث باسم النادي، المنتخب أو الملعب...',
      liveMatchesCount: (count) => `مباريات جارية الآن (${count})`,
      upcomingScheduleCount: (count) => `المباريات القادمة (${count})`,
      noUpcomingFav: 'لا توجد مباريات قادمة لأنديتك المفضلة في هذه البطولة.',
      noUpcomingDefault: 'لا توجد مباريات قادمة مطابقة لهذا الفلتر. راجع السجل الكامل للنتائج الأخيرة.',
      showAllSchedule: 'عرض الجدول كاملاً',
      noHistoryFav: 'لا توجد مباريات مؤرشفة حديثاً لأنديتك المفضلة في هذه البطولة.',
      noHistoryDefault: 'لا توجد مباريات مؤرشفة مطابقة لبحثك.',
      showAllHistory: 'عرض السجل كاملاً',
      scorersPrefix: 'الأهداف:',
      possShort: (h, a) => `استحواذ ${h}%–${a}%`,
      commentsCount: (count) => `${count} تعليق`,
      statsLive: 'الإحصائيات والمباشر',
      finishedLabel: 'انتهت',
      liveLabel: 'مباشر',
      favClubAria: 'نادي مفضل',
    },
    matchDetail: {
      closeAria: 'إغلاق بطاقة المباراة',
      kickoff: 'صافرة البداية',
      liveScore: 'النتيجة المباشرة',
      referee: 'الحكم:',
      spectators: 'متفرج',
      supporterPrediction: 'توقعات الجماهير',
      votesCount: (count) => `${count} صوت`,
      draw: 'تعادل',
      tabStats: 'إحصائيات تفصيلية',
      tabTimeline: (count) => `الأحداث (${count})`,
      tabComments: (count) => `التعليقات (${count})`,
      syncingStats: 'جارٍ مزامنة الإحصائيات الرسمية المباشرة...',
      statsUpcomingHint: 'ستظهر الإحصائيات المباشرة (الاستحواذ، التسديدات، التمريرات، الركنيات) فور انطلاق المباراة.',
      noEventsYet: 'لم تُسجّل أي أحداث في المباراة حتى الآن.',
      assistBy: (name) => `تمريرة حاسمة: ${name}`,
      reactionsTitle: (h, a) => `آراء الجماهير — ${h} ضد ${a}`,
      statsLabels: {
        possession: 'الاستحواذ (%)',
        shotsTotal: 'إجمالي التسديدات',
        shotsOnTarget: 'التسديدات على المرمى',
        passesCompleted: 'التمريرات الصحيحة',
        corners: 'الركنيات',
        saves: 'تصديات الحارس',
        offsides: 'التسلل',
        fouls: 'الأخطاء المرتكبة',
        yellowCards: 'البطاقات الصفراء',
      },
      eventTypes: {
        goal: 'هدف',
        penalty_goal: 'هدف (ركلة جزاء)',
        yellow_card: 'بطاقة صفراء',
        red_card: 'بطاقة حمراء',
        substitution: 'تبديل',
      },
    },
    standings: {
      aria: 'جداول الترتيب وإحصائيات اللاعبين',
      kicker: 'موسم 2026–2027 · الترتيب الرسمي المباشر',
      title: 'الترتيب والإحصائيات',
      loading: 'جارٍ تحميل الترتيب المباشر...',
      colTeam: 'الفريق',
      colPlayed: 'لعب',
      colWon: 'ف',
      colDrawn: 'ت',
      colLost: 'خ',
      colGoals: 'له:عليه',
      colDiff: 'فارق',
      colPts: 'نقاط',
      zoneUclNational: 'ربع النهائي / تأهل',
      zoneUcl: 'دوري أبطال أوروبا',
      zoneUel: 'الدوري الأوروبي',
      zonePlayoff: 'ملحق',
      zoneRelegation: 'الهبوط',
      legendQualTop4: 'تأهل / المربع الذهبي',
      legendUel: 'الدوري الأوروبي',
      legendRelegation: 'منطقة الهبوط',
      leadersTitle: 'قادة الإحصائيات',
      seasonShort: 'موسم 2026–27',
      tabScorers: 'الهدافون',
      tabAssists: 'الصانعون',
      tabDecisive: 'المساهمات',
      leadersNote: 'الإحصائيات الفردية متاحة للدوريات الأوروبية الخمسة الكبرى والدوري الجزائري.',
      matchesPlayed: (count) => `${count} مباراة`,
      goalsUnit: (count) => `${count} هدف`,
      assistsUnit: (count) => `${count} تمريرة`,
      contribUnit: (count) => `${count} مساهمة`,
      shortGoals: 'أهداف',
      shortAssists: 'صناعة',
    },
    mercato: {
      aria: 'سوق الانتقالات والميركاتو',
      kicker: 'بث الميركاتو المباشر · أوروبا والعالم',
      title: 'الميركاتو، الشائعات والانتقالات الجارية',
      desc: 'تابع أحدث أخبار الصفقات الرسمية وشائعات الانتقالات لحظة بلحظة عبر الدوريات الأوروبية الخمسة الكبرى.',
      searchPlaceholder: 'ابحث عن لاعب أو نادٍ (مثل: ريال مدريد، ميلان، أرسنال)...',
      filterAll: 'الكل',
      filterOfficial: 'صفقات رسمية',
      filterRumors: 'شائعات',
      bannerCaption: 'خلية الميركاتو THE PITCH · أخبار مباشرة',
      bannerAlt: 'نفق اللاعبين المؤدي إلى أرضية ملعب أوروبي مضاء',
      noFavTransfers: 'لا توجد أخبار ميركاتو حديثة تذكر أنديتك المفضلة.',
      noSearchTransfers: 'لا توجد أخبار ميركاتو مطابقة لبحثك.',
      showAllMercato: 'عرض كل أخبار الميركاتو',
      supporterViews: (count) => `${count} آراء جماهير`,
      reactToStory: 'تفاعل مع الخبر',
      readFullWire: 'قراءة الخبر من المصدر',
      commentsTitle: 'آراء الجماهير حول هذه الصفقة',
      selectPrompt: 'اختر خبراً أو شائعة لقراءة التفاصيل والتفاعل.',
      catOfficial: 'رسمي / انتقال',
      catRumors: 'ميركاتو وشائعات',
    },
    debates: {
      aria: 'نقاشات وتوقعات الجماهير',
      kicker: 'مجتمع THE PITCH · مساحة الجماهير',
      title: 'النقاشات والتوقعات',
      desc: 'منبر عشاق كرة القدم: صوّت على أبرز القضايا الساخنة، شارك برأيك وتوقع نتائج المباريات الأوروبية القادمة.',
      closeForm: 'إغلاق النموذج',
      startDebate: 'اطرح نقاشاً',
      bannerCaption: 'مدرج جماهير THE PITCH · استطلاعات وتوقعات 1 / X / 2',
      bannerAlt: 'جماهير كرة القدم في مدرجات ملعب أوروبي قبل صافرة البداية',
      formTitle: 'فتح نقاش جماهيري جديد',
      qPlaceholder: 'سؤال النقاش (مثال: من يستحق قيادة هجوم المنتخب؟)',
      authorPlaceholder: 'اسمك المستعار',
      descPlaceholder: 'سياق أو حجة البداية (اختياري)',
      opt1Placeholder: 'الخيار 1 (مطلوب)',
      opt2Placeholder: 'الخيار 2 (مطلوب)',
      opt3Placeholder: 'الخيار 3 (اختياري)',
      formError: 'أدخل سؤالاً واضحاً وخيارين للتصويت على الأقل.',
      publishDebate: 'نشر النقاش',
      proposedBy: (author) => `طرحه ${author}`,
      votesCount: (count) => `${count} صوت`,
      hideDiscussion: 'إخفاء النقاش',
      seeArguments: (count) => `عرض الآراء (${count})`,
      supporterArgumentsTitle: 'آراء وحجج الجماهير',
      predictionsTitle: 'جدول التوقعات 1 · X · 2',
      liveTrends: 'الاتجاهات المباشرة',
      drawShort: 'تعادل',
    },
    comments: {
      defaultTitle: 'تعليقات الجماهير',
      reactionsCount: (count) => `${count} تعليق`,
      authorPlaceholder: 'اسمك المستعار (مثال: Rayan_PSG)',
      clubPlaceholder: 'النادي / المنتخب (اختياري)',
      contentPlaceholder: 'شارك تحليلك أو رأيك مع المجتمع...',
      sending: 'جارٍ النشر...',
      publish: 'نشر',
      minLengthError: 'يرجى كتابة تعليق لا يقل عن حرفين.',
      submitError: 'تعذر نشر تعليقك في الوقت الحالي.',
      empty: 'لا توجد تعليقات بعد. كن أول من يبدأ النقاش!',
      justNow: 'الآن',
      minsAgo: (m) => `منذ ${m} د`,
      hoursAgo: (h) => `منذ ${h} س`,
      likeAria: (author) => `إعجاب بتعليق ${author}`,
    },
    alerts: {
      aria: 'التنبيهات المخصصة وإشعارات البث المباشر',
      title: 'التنبيهات وإشعارات الأهداف المباشرة',
      closeAria: 'إغلاق لوحة التنبيهات',
      browserPushTitle: 'إشعارات المتصفح الفورية',
      browserPushDesc: 'تنبيه فوري على شاشتك عند تسجيل أي هدف.',
      enabled: 'مفعّلة',
      enable: 'تفعيل',
      goalSound: 'صوت تنبيه عند تسجيل هدف',
      soundOn: 'مفعّل',
      soundMuted: 'صامت',
      filterNotifs: 'تصفية الإشعارات',
      filterFollowedDesc: 'فقط الأندية والبطولات التي تتابعها',
      filterAllDesc: 'جميع المباريات الجارية في البث المباشر',
      myFollowedBtn: 'متابعاتي فقط',
      allMultiplexBtn: 'جميع المباريات',
      testSending: 'جارٍ الإرسال...',
      testBtn: 'اختبار إشعار هدف مباشر الآن',
      createTitle: 'إنشاء تنبيه مخصص',
      typeTeam: 'نادٍ أو منتخب',
      typeComp: 'بطولة',
      liveGoals: 'أهداف مباشرة',
      lineups: 'التشكيلات',
      mercato: 'ميركاتو',
      saveAlert: 'حفظ التنبيه',
      activeAlerts: 'تنبيهاتك النشطة',
      emptyAlerts: 'لا توجد تنبيهات محفوظة. أضف ناديك أو منتخبك المفضل أعلاه.',
      liveGoalsLabel: 'أهداف مباشرة',
      lineupsLabel: 'التشكيلات',
      mercatoLabel: 'ميركاتو',
      generalAlerts: 'تنبيهات عامة',
      deleteAria: (label) => `حذف تنبيه ${label}`,
    },
    profile: {
      aria: 'ملف المشجع والأندية المفضلة',
      title: 'ملف المشجع والنادي المفضل',
      closeAria: 'إغلاق الملف الشخصي',
      languageTitle: 'لغة الواجهة',
      languageHint: 'يحدّث أيضاً لغة الأخبار وسوق الانتقالات.',
      identityLabel: 'اسم المشجع',
      savedLocally: 'محفوظ محلياً',
      identityPlaceholder: 'اسمك المستعار (مثال: Karim_OM)...',
      identityHelp: 'يُستخدم تلقائياً عند نشر التعليقات والآراء.',
      displayTitle: 'عرض الأخبار والنتائج',
      modeOnlyTitle: 'أنديتي المفضلة فقط',
      modeOnlyDesc: 'يصفّي الأخبار، النتائج المباشرة، الجدول والميركاتو لعرض أنديتك المفضلة فقط.',
      modePrioritizeTitle: 'أولوية لأنديتي المفضلة',
      modePrioritizeDesc: 'يضع مباريات وأخبار أنديتك في المقدمة متبوعة ببقية البطولات.',
      modeAllTitle: 'عرض الكل (بدون تصفية)',
      modeAllDesc: 'يعرض الترتيب الزمني العادي لجميع البطولات.',
      followedTitle: (count) => `أنديتي ومنتخباتي المتابعة (${count})`,
      clearAll: 'مسح الكل',
      emptyFollowed: 'لم تختر أي نادٍ مفضل بعد. اختر نادياً أو أكثر أدناه لتخصيص تجربتك.',
      removeAria: (club) => `إزالة ${club} من المفضلة`,
      syncingAlerts: 'جارٍ تفعيل التنبيهات...',
      syncAlertsBtn: (count) => `تفعيل تنبيهات الأهداف لـ ${count} نادٍ أيضاً`,
      syncDone: 'تم تفعيل تنبيهات الأهداف المباشرة لأنديتك المفضلة.',
      addClubTitle: 'إضافة نادٍ أو منتخب',
      searchPlaceholder: 'ابحث عن نادٍ (PSG, Arsenal, Real Madrid...)',
      addBtn: 'إضافة',
    },
    article: {
      closeAria: 'إغلاق المقال',
      readSource: 'قراءة المقال كاملاً من المصدر',
      reactionsTitle: 'تعليقات القراء على الخبر',
    },
    contact: {
      aria: 'تواصل مع هيئة تحرير THE PITCH عبر البريد الإلكتروني',
      kicker: 'التحرير ودعم المستخدمين',
      title: 'تواصل مع THE PITCH',
      desc: 'لديك معلومة ميركاتو، اقتراح لإحصائية جديدة، أو استفسار تقني حول التنبيهات؟ راسل فريقنا التحريري مباشرة.',
      responseSla: 'متوسط الرد خلال 24 ساعة في أيام العمل · طوال الأسبوع في ليالي المباريات الكبرى.',
      sentTitle: 'تم إرسال الرسالة',
      sentSuccess: 'تم إرسال رسالتك إلى فريق تحرير THE PITCH بنجاح.',
      trackingRef: 'رقم المتابعة:',
      sendAnother: 'إرسال رسالة أخرى',
      nameLabel: 'الاسم الكامل',
      namePlaceholder: 'مثال: ريان كاغاوا',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'you@example.com',
      subjectLabel: 'الموضوع',
      subjectPlaceholder: 'مثال: شراكة / اقتراح إحصائيات / بلاغ تقني',
      messageLabel: 'الرسالة',
      messagePlaceholder: 'اكتب رسالتك إلى فريق تحرير THE PITCH...',
      openMailClient: 'فتح في تطبيق البريد لديك',
      sending: 'جارٍ الإرسال...',
      sendBtn: 'إرسال عبر البريد',
      errorFallback: 'حدث خطأ أثناء إرسال الرسالة.',
      serverError: 'تعذر الاتصال بخادم البريد.',
    },
  },

  en: {
    documentTitle: 'THE PITCH — Football News, Live Scores, Mercato & Debates',
    langSwitcherLabel: 'Choose language',
    nav: {
      news: 'News',
      matches: 'Matches',
      standings: 'Standings',
      mercato: 'Mercato',
      debates: 'Debates',
      mainAria: 'Primary navigation',
      mobileAria: 'Mobile navigation',
    },
    header: {
      favClub: 'Favorite Club',
      favCount: (count) => `Favorites (${count})`,
      profileAria: 'Open supporter profile and manage favorite clubs',
      goalAlerts: 'Goal Alerts',
      alertsShort: 'Alerts',
    },
    utility: {
      leaguesBanner: 'Ligue 1 · Premier League · La Liga · Serie A · Bundesliga · Algeria L1 · National Teams',
      realtime: 'Live',
      refresh: 'Refresh',
      syncing: 'Syncing...',
      matchHistory: 'Match History',
      contact: 'Contact',
      lightMode: 'Light mode',
      darkMode: 'Dark mode',
      toLightAria: 'Switch to light mode',
      toDarkAria: 'Switch to dark mode',
      myFavClubs: 'Favorite clubs:',
      edit: 'Edit',
      onlyMyClubs: 'My clubs only',
      prioritize: 'Prioritize',
      all: 'All',
    },
    cover: {
      aria: 'THE PITCH Cover',
      kicker: '100% Football Media · Real-Time News & Live Scores',
      imageAlt: 'Floodlit pitch of a major European football stadium at night before kickoff',
      subtitle: 'Football never stops, and neither does our coverage.',
      ctaScores: 'Scores & Fixtures',
      ctaMyFav: 'My Favorite Club',
      ctaFavCount: (count) => `My Favorites (${count})`,
    },
    home: {
      spotlightLive: (count) => `Live Matches (${count}) & Today’s Multiplex`,
      spotlightDefault: 'Today’s Fixtures in Europe & Internationals',
      allSchedule: 'Full schedule',
      noFavMatchesToday: (clubs) =>
        `No live or scheduled matches today for your favorite clubs (${clubs}).`,
      showAllMultiplex: 'Show full multiplex',
      manageFavs: 'Manage favorites',
      liveBadge: 'LIVE',
      finishedBadge: 'FT',
      possSeeStats: (h, a) => `Poss. ${h}% – ${a}% · Match stats`,
      favNewsCount: (count) =>
        `★ ${count} stor${count > 1 ? 'ies' : 'y'} related to your favorite clubs`,
      onlyFavNewsDisplayed: 'All news matching your favorite clubs is shown.',
      showRestEuroNews: 'Also show the rest of European football news',
      noFavNewsToday: (clubs) =>
        `No recent stories mention your favorite clubs (${clubs}) right now.`,
      showAllNewsToday: 'Show all today’s news',
      top5LiveSuffix: '— Live Top 5',
      allStandings: 'All standings',
      colClub: 'Club',
      colPlayed: 'P',
      colDiff: 'GD',
      colPts: 'Pts',
      liveMercato: 'Live Mercato Wire',
      seeAll: 'View all',
      featuredDebate: 'Featured Debate',
      participate: 'Join in',
      voteDebateCta: 'Vote & Debate with Supporters',
      footerCopy: (year) => `© ${year} THE PITCH — Independent football media.`,
      footerSchedule: 'Fixtures & Live',
      footerHistory: 'Full History',
      footerAlerts: 'Goal Alerts',
    },
    toasts: {
      testAlert: 'TEST ALERT',
      liveGoal: 'LIVE GOAL',
      closeAria: 'Dismiss goal notification',
      pushGoalTitle: (team, minute) => `GOAL! ${team} (${minute}')`,
    },
    matchesView: {
      aria: 'Live scores, fixtures and full match history',
      kicker: 'Real-Time Data · Top 5 European Leagues, Algerian Ligue 1 & National Teams',
      titleHistory: 'Complete Match History',
      titleLive: 'Live Scores & Fixtures',
      tabLiveUpcoming: (count) => `Live & Upcoming (${count})`,
      tabHistory: (count) => `Full History (${count})`,
      myClubsCount: (count) => `My clubs (${count})`,
      prioritize: 'Prioritize',
      all: 'All',
      pickFavClub: 'Pick Favorite Club',
      searchPlaceholder: 'Filter by club, nation, stadium...',
      liveMatchesCount: (count) => `Live matches (${count})`,
      upcomingScheduleCount: (count) => `Upcoming fixtures (${count})`,
      noUpcomingFav: 'No upcoming matches found for your favorite clubs in this competition.',
      noUpcomingDefault:
        'No upcoming matches match this filter. Check the Full History tab for recent results.',
      showAllSchedule: 'Show full schedule',
      noHistoryFav: 'No recent archived matches for your favorite clubs in this competition.',
      noHistoryDefault: 'No archived matches match your search.',
      showAllHistory: 'Show full history',
      scorersPrefix: 'Scorers:',
      possShort: (h, a) => `Poss. ${h}%–${a}%`,
      commentsCount: (count) => `${count} comments`,
      statsLive: 'Stats & Live',
      finishedLabel: 'FT',
      liveLabel: 'LIVE',
      favClubAria: 'Favorite club',
    },
    matchDetail: {
      closeAria: 'Close match details',
      kickoff: 'Kickoff',
      liveScore: 'Live score',
      referee: 'Referee:',
      spectators: 'attendance',
      supporterPrediction: 'Supporter Prediction',
      votesCount: (count) => `${count} votes`,
      draw: 'Draw',
      tabStats: 'Detailed Stats',
      tabTimeline: (count) => `Timeline (${count})`,
      tabComments: (count) => `Comments (${count})`,
      syncingStats: 'Syncing official live match statistics...',
      statsUpcomingHint:
        'Live stats (possession, shots, passes, corners) will appear once kickoff begins.',
      noEventsYet: 'No key match events recorded yet.',
      assistBy: (name) => `Assist: ${name}`,
      reactionsTitle: (h, a) => `Reactions — ${h} vs ${a}`,
      statsLabels: {
        possession: 'Possession (%)',
        shotsTotal: 'Total Shots',
        shotsOnTarget: 'Shots on Target',
        passesCompleted: 'Completed Passes',
        corners: 'Corners',
        saves: 'Goalkeeper Saves',
        offsides: 'Offsides',
        fouls: 'Fouls Committed',
        yellowCards: 'Yellow Cards',
      },
      eventTypes: {
        goal: 'Goal',
        penalty_goal: 'Goal (Penalty)',
        yellow_card: 'Yellow Card',
        red_card: 'Red Card',
        substitution: 'Substitution',
      },
    },
    standings: {
      aria: 'Standings and individual player statistics',
      kicker: '2026–2027 Season · Official Real-Time Standings',
      title: 'Standings & Statistics',
      loading: 'Loading live standings...',
      colTeam: 'Team',
      colPlayed: 'P',
      colWon: 'W',
      colDrawn: 'D',
      colLost: 'L',
      colGoals: 'GF:GA',
      colDiff: 'GD',
      colPts: 'Pts',
      zoneUclNational: 'Quarter-finals / Qual.',
      zoneUcl: 'Champions League',
      zoneUel: 'Europa League',
      zonePlayoff: 'Playoff',
      zoneRelegation: 'Relegation',
      legendQualTop4: 'Qualification / Top 4',
      legendUel: 'Europa League',
      legendRelegation: 'Relegation Zone',
      leadersTitle: 'Stat Leaders',
      seasonShort: '2026–27 Season',
      tabScorers: 'Scorers',
      tabAssists: 'Assists',
      tabDecisive: 'G+A',
      leadersNote: 'Individual statistics are available for the top 5 European leagues and Algerian Ligue 1.',
      matchesPlayed: (count) => `${count} apps`,
      goalsUnit: (count) => `${count} goals`,
      assistsUnit: (count) => `${count} ast`,
      contribUnit: (count) => `${count} G+A`,
      shortGoals: 'G',
      shortAssists: 'A',
    },
    mercato: {
      aria: 'Transfer market and player rumors',
      kicker: 'Live Transfer Wire · Europe & International',
      title: 'Mercato, Rumors & Live Transfers',
      desc: 'Follow the latest confirmed deals and transfer rumors published in real time across Europe’s top five leagues.',
      searchPlaceholder: 'Search a player or club (e.g. Real Madrid, Milan, Man United)...',
      filterAll: 'All',
      filterOfficial: 'Confirmed',
      filterRumors: 'Rumors',
      bannerCaption: 'THE PITCH Transfer Desk · Live Updates',
      bannerAlt: 'Player tunnel opening onto a floodlit European stadium pitch',
      noFavTransfers: 'No recent transfer stories mention your favorite clubs.',
      noSearchTransfers: 'No transfer stories match your search.',
      showAllMercato: 'Show all mercato stories',
      supporterViews: (count) => `${count} supporter comments`,
      reactToStory: 'Discuss story',
      readFullWire: 'Read full source report',
      commentsTitle: 'Supporter views on this transfer',
      selectPrompt: 'Select a transfer rumor or signing to read details and comment.',
      catOfficial: 'Official / Transfer',
      catRumors: 'Mercato & Rumors',
    },
    debates: {
      aria: 'Supporter debates and match predictions',
      kicker: 'THE PITCH Community · Fan Tribune',
      title: 'Debates & Predictions',
      desc: 'The fans’ voice: vote on the hottest topics, share your take, and predict upcoming European fixtures.',
      closeForm: 'Close form',
      startDebate: 'Start a debate',
      bannerCaption: 'THE PITCH Fan Tribune · Polls & 1 / X / 2 Predictions',
      bannerAlt: 'Football supporters in the stands of a European stadium before kickoff',
      formTitle: 'Launch a new supporter debate',
      qPlaceholder: 'Debate question (e.g. Who deserves the #9 spot for France?)',
      authorPlaceholder: 'Your handle',
      descPlaceholder: 'Context or opening argument (optional)',
      opt1Placeholder: 'Option 1 (required)',
      opt2Placeholder: 'Option 2 (required)',
      opt3Placeholder: 'Option 3 (optional)',
      formError: 'Please provide a clear question and at least 2 voting options.',
      publishDebate: 'Publish debate',
      proposedBy: (author) => `Started by ${author}`,
      votesCount: (count) => `${count} votes`,
      hideDiscussion: 'Hide discussion',
      seeArguments: (count) => `View arguments (${count})`,
      supporterArgumentsTitle: 'Supporter arguments',
      predictionsTitle: 'Predictions Grid 1 · X · 2',
      liveTrends: 'Live odds',
      drawShort: 'Draw',
    },
    comments: {
      defaultTitle: 'Supporter Comments',
      reactionsCount: (count) => `${count} comment${count > 1 ? 's' : ''}`,
      authorPlaceholder: 'Your handle (e.g. Alex_Arsenal)',
      clubPlaceholder: 'Club / National Team (optional)',
      contentPlaceholder: 'Share your analysis or reaction with the community...',
      sending: 'Posting...',
      publish: 'Post',
      minLengthError: 'Please write a comment of at least 2 characters.',
      submitError: 'Unable to publish your comment right now.',
      empty: 'No comments yet. Start the conversation!',
      justNow: 'Just now',
      minsAgo: (m) => `${m}m ago`,
      hoursAgo: (h) => `${h}h ago`,
      likeAria: (author) => `Upvote comment by ${author}`,
    },
    alerts: {
      aria: 'Custom alerts and real-time goal push notifications',
      title: 'Alerts & Live Goal Push',
      closeAria: 'Close alerts panel',
      browserPushTitle: 'Browser Push Notifications',
      browserPushDesc: 'Instant on-screen alert every time a goal is scored.',
      enabled: 'Enabled',
      enable: 'Enable',
      goalSound: 'Audio chime on every goal',
      soundOn: 'On',
      soundMuted: 'Muted',
      filterNotifs: 'Filter notifications',
      filterFollowedDesc: 'Only your followed clubs & leagues',
      filterAllDesc: 'All live matches across the multiplex',
      myFollowedBtn: 'Followed only',
      allMultiplexBtn: 'All live matches',
      testSending: 'Sending...',
      testBtn: 'Trigger live goal test alert',
      createTitle: 'Create a custom alert',
      typeTeam: 'Club or Nation',
      typeComp: 'Competition',
      liveGoals: 'Live goals',
      lineups: 'Lineups',
      mercato: 'Mercato',
      saveAlert: 'Save alert',
      activeAlerts: 'Your active alerts',
      emptyAlerts: 'No alerts configured. Add your favorite club or national team above.',
      liveGoalsLabel: 'Live goals',
      lineupsLabel: 'Lineups',
      mercatoLabel: 'Mercato',
      generalAlerts: 'General alerts',
      deleteAria: (label) => `Delete alert for ${label}`,
    },
    profile: {
      aria: 'Supporter profile and favorite clubs',
      title: 'Supporter Profile & Favorite Club',
      closeAria: 'Close profile drawer',
      languageTitle: 'Interface Language',
      languageHint: 'Also updates news headlines and mercato feed.',
      identityLabel: 'Supporter Handle',
      savedLocally: 'Saved locally',
      identityPlaceholder: 'Your handle (e.g. Karim_OM, Alex_AFC)...',
      identityHelp: 'Automatically filled in when you post comments or reactions.',
      displayTitle: 'News & Scores Display',
      modeOnlyTitle: 'My followed clubs only',
      modeOnlyDesc:
        'Filters news, live scores, schedule and mercato to display only your favorite clubs.',
      modePrioritizeTitle: 'Prioritize followed clubs',
      modePrioritizeDesc:
        'Pins matches and stories about your favorite clubs at the top, followed by the rest.',
      modeAllTitle: 'Show everything (filter off)',
      modeAllDesc: 'Shows standard chronological order across all competitions.',
      followedTitle: (count) => `Followed Clubs & Nations (${count})`,
      clearAll: 'Clear all',
      emptyFollowed:
        'No favorite club selected yet. Pick one or more clubs below to personalize scores & news.',
      removeAria: (club) => `Remove ${club} from favorites`,
      syncingAlerts: 'Enabling alerts...',
      syncAlertsBtn: (count) =>
        `Also enable goal alerts for ${count} club${count > 1 ? 's' : ''}`,
      syncDone: 'Live goal alerts enabled for your favorite clubs.',
      addClubTitle: 'Add a club or national team',
      searchPlaceholder: 'Search a club (PSG, Arsenal, Real Madrid...)',
      addBtn: 'Add',
    },
    article: {
      closeAria: 'Close article',
      readSource: 'Read full story on source wire',
      reactionsTitle: 'Article Reactions',
    },
    contact: {
      aria: 'Contact THE PITCH editorial desk by email',
      kicker: 'Editorial & User Support',
      title: 'Contact THE PITCH',
      desc: 'Have a transfer tip, a stat suggestion, or a technical question about your alerts? Write directly to our editorial team.',
      responseSla: 'Average reply within 24 business hours · 7/7 on major matchdays.',
      sentTitle: 'Message sent',
      sentSuccess: 'Your message has been delivered to the THE PITCH editorial desk.',
      trackingRef: 'Tracking reference:',
      sendAnother: 'Send another message',
      nameLabel: 'Full Name',
      namePlaceholder: 'e.g. Rayan Kagawa',
      emailLabel: 'Email Address',
      emailPlaceholder: 'you@example.com',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'e.g. Partnership / Stat request / Feedback',
      messageLabel: 'Message',
      messagePlaceholder: 'Write your message to the THE PITCH editorial desk...',
      openMailClient: 'Open in your local mail app',
      sending: 'Sending...',
      sendBtn: 'Send via Email',
      errorFallback: 'An error occurred while sending your message.',
      serverError: 'Unable to reach the contact server.',
    },
  },
};

export function getLocaleCode(lang: AppLanguage): string {
  if (lang === 'ar') return 'ar-EG-u-nu-latn';
  if (lang === 'en') return 'en-GB';
  return 'fr-FR';
}

const COMP_META_I18N: Record<
  CompetitionId,
  Record<AppLanguage, { name: string; shortName: string; region: string }>
> = {
  all: {
    fr: { name: 'Toutes les compétitions', shortName: 'Toutes', region: 'Europe & Monde' },
    ar: { name: 'جميع البطولات', shortName: 'الكل', region: 'أوروبا والعالم' },
    en: { name: 'All competitions', shortName: 'All', region: 'Europe & World' },
  },
  'ligue-1': {
    fr: { name: 'Ligue 1 McDonald’s', shortName: 'Ligue 1', region: 'France' },
    ar: { name: 'الدوري الفرنسي', shortName: 'الدوري الفرنسي', region: 'فرنسا' },
    en: { name: 'Ligue 1 McDonald’s', shortName: 'Ligue 1', region: 'France' },
  },
  'premier-league': {
    fr: { name: 'Premier League', shortName: 'Premier League', region: 'Angleterre' },
    ar: { name: 'الدوري الإنجليزي الممتاز', shortName: 'البريميرليغ', region: 'إنجلترا' },
    en: { name: 'Premier League', shortName: 'Premier League', region: 'England' },
  },
  'la-liga': {
    fr: { name: 'La Liga EA Sports', shortName: 'La Liga', region: 'Espagne' },
    ar: { name: 'الدوري الإسباني', shortName: 'الليغا', region: 'إسبانيا' },
    en: { name: 'La Liga EA Sports', shortName: 'La Liga', region: 'Spain' },
  },
  'serie-a': {
    fr: { name: 'Serie A Enilive', shortName: 'Serie A', region: 'Italie' },
    ar: { name: 'الدوري الإيطالي', shortName: 'الكالتشيو', region: 'إيطاليا' },
    en: { name: 'Serie A Enilive', shortName: 'Serie A', region: 'Italy' },
  },
  bundesliga: {
    fr: { name: 'Bundesliga', shortName: 'Bundesliga', region: 'Allemagne' },
    ar: { name: 'الدوري الألماني', shortName: 'البوندسليغا', region: 'ألمانيا' },
    en: { name: 'Bundesliga', shortName: 'Bundesliga', region: 'Germany' },
  },
  'algerian-ligue-1': {
    fr: { name: 'Ligue 1 Mobilis (Algérie)', shortName: 'Ligue 1 DZ', region: 'Algérie' },
    ar: { name: 'الرابطة المحترفة الأولى (الجزائر)', shortName: 'الدوري الجزائري', region: 'الجزائر' },
    en: { name: 'Algerian Ligue 1', shortName: 'Algeria L1', region: 'Algeria' },
  },
  'national-teams': {
    fr: { name: 'Sélections Nationales', shortName: 'Sélections', region: 'International' },
    ar: { name: 'المنتخبات الوطنية', shortName: 'المنتخبات', region: 'دولي' },
    en: { name: 'National Teams', shortName: 'Internationals', region: 'International' },
  },
};

export function getLocalizedCompetitionMeta(id: CompetitionId, lang: AppLanguage) {
  return COMP_META_I18N[id]?.[lang] ?? COMP_META_I18N.all[lang];
}

export function getLocalizedStatusDetail(
  detail: string | undefined,
  status: MatchStatus,
  lang: AppLanguage,
): string | undefined {
  if (!detail) {
    if (status === 'finished') {
      return lang === 'ar' ? 'انتهت' : lang === 'en' ? 'FT' : 'Terminé';
    }
    return undefined;
  }
  const d = detail.trim();
  const lower = d.toLowerCase();

  if (lower === 'terminé' || lower === 'ft' || lower === 'full time') {
    return lang === 'ar' ? 'انتهت' : lang === 'en' ? 'FT' : 'Terminé';
  }
  if (lower.includes('prol') || lower === 'ft-pens' || lower === 'aet') {
    return lang === 'ar' ? 'انتهت (إضافي/ترجيح)' : lang === 'en' ? 'AET / Pens' : 'Terminé (Prol./T.A.B.)';
  }
  if (lower === 'mi-temps' || lower === 'ht' || lower === 'halftime') {
    return lang === 'ar' ? 'استراحة' : lang === 'en' ? 'HT' : 'Mi-temps';
  }
  if (lower === 'programmé' || lower === 'scheduled') {
    return lang === 'ar' ? 'مجدولة' : lang === 'en' ? 'Scheduled' : 'Programmé';
  }
  if (lower === 'reporté' || lower === 'postponed') {
    return lang === 'ar' ? 'مؤجلة' : lang === 'en' ? 'Postponed' : 'Reporté';
  }
  if (lower === 'annulé' || lower === 'canceled' || lower === 'cancelled') {
    return lang === 'ar' ? 'ملغاة' : lang === 'en' ? 'Cancelled' : 'Annulé';
  }
  return detail;
}

export function getLocalizedMatchday(matchday: string, lang: AppLanguage): string {
  if (lang === 'fr') return matchday;
  const lower = matchday.toLowerCase();
  if (lower === 'saison régulière') {
    return lang === 'ar' ? 'الموسم العادي' : 'Regular Season';
  }
  if (lower === 'journée en cours') {
    return lang === 'ar' ? 'الجولة الحالية' : 'Current Matchday';
  }
  return matchday;
}

export function getLocalizedCompetitionLabel(
  compId: CompetitionId,
  fallbackName: string,
  lang: AppLanguage,
): string {
  if (lang === 'fr') return fallbackName;
  if (compId !== 'all') {
    return getLocalizedCompetitionMeta(compId, lang).name;
  }
  return fallbackName;
}

export function getLocalizedTransferCategory(
  category: 'Mercato & Rumeurs' | 'Officiel / Transfert',
  lang: AppLanguage,
): string {
  if (category === 'Officiel / Transfert') return TRANSLATIONS[lang].mercato.catOfficial;
  return TRANSLATIONS[lang].mercato.catRumors;
}

const SEEDED_DEBATES_I18N: Record<
  string,
  Partial<Record<AppLanguage, { title: string; description: string; options: Record<string, string> }>>
> = {
  'deb-live-1': {
    ar: {
      title: 'صراع لقب الدوري الإنجليزي: هل يستطيع أرسنال الصمود حتى النهاية؟',
      description:
        'مع تصدر أرسنال لجدول الترتيب أمام برايتون ومانشستر سيتي، يبدو الصراع على اللقب هذا الموسم متقارباً للغاية.',
      options: {
        'opt-1': 'نعم، أرسنال يملك التشكيلة الأكثر اكتمالاً',
        'opt-2': 'لا، مانشستر سيتي أو ليفربول سينهيان الموسم بقوة أكبر',
        'opt-3': 'مفاجأة في المربع الذهبي لا تزال واردة',
      },
    },
    en: {
      title: 'Premier League Title Race: Can Arsenal hold their nerve until May?',
      description:
        'With Arsenal leading the table ahead of Brighton and Manchester City, this season’s title race promises to go down to the wire.',
      options: {
        'opt-1': 'Yes, Arsenal have the most complete squad',
        'opt-2': 'No, Man City or Liverpool will finish stronger',
        'opt-3': 'A Top-4 surprise contender could still emerge',
      },
    },
  },
  'deb-live-2': {
    ar: {
      title: 'الدوري الفرنسي: هل يبقى باريس سان جيرمان بلا منافس رغم مطاردة ليل ومارسيليا؟',
      description:
        'بعد الفوز المثير على نيس (3-2)، يواصل باريس الصدارة لكن المنافسين لا يزالون على مقربة.',
      options: {
        'opt-l1': 'نعم، الفارق الفني لباريس كبير جداً',
        'opt-l2': 'لا، المنافسة ستبقى مشتعلة حتى الربيع',
      },
    },
    en: {
      title: 'Ligue 1: Is PSG untouchable despite pressure from Lille and Marseille?',
      description:
        'Following their thrilling win in Nice (3-2), Paris stay top of the table while the chasing pack remain within striking distance.',
      options: {
        'opt-l1': 'Yes, PSG’s technical gap is too wide',
        'opt-l2': 'No, the title race will stay open until spring',
      },
    },
  },
};

export function getLocalizedDebateContent(debate: DebateTopic, lang: AppLanguage): DebateTopic {
  const entry = SEEDED_DEBATES_I18N[debate.id]?.[lang];
  if (!entry) return debate;
  return {
    ...debate,
    title: entry.title,
    description: entry.description,
    options: debate.options.map((opt) => ({
      ...opt,
      label: entry.options[opt.id] ?? opt.label,
    })),
  };
}
