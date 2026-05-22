const STORE_KEY = "gts-stable-v1";
const SESSION_KEY = "gts-session";
const VIEW_STATE_KEY = "gts-view-state";
const THEME_KEY = "gts-theme";
const NOTIFICATION_SEEN_KEY = "gts-notifications-seen";
const OFFLINE_QUEUE_KEY = "gts-offline-queue";
const OFFLINE_DB_NAME = "gts-offline-db";
const OFFLINE_QUEUE_STORE = "offlineQueue";
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const SUPPORT_TEMP_ACCESS_DURATION_MS = 30 * 60 * 1000;
const LOGO = "/assets/gsm-logo.png";
const COMPANY_LOGO = "/assets/company-logo.png";
const SPW_LOGO = "/assets/spw-logo.png";
let sessionExpiredMessage = "";
let lastNotificationSignature = "";
let offlineQueueMemory = [];
let offlineSyncTimer = null;
let offlineSyncNotice = "";
const addressAutocompleteTimers = new WeakMap();
const addressAutocompleteCache = new Map();
const postalCodeAutocompleteCache = new Map();
let tecStopsDatasetPromise = null;
let walloniaAddressesDatasetPromise = null;

function shouldResetUiFromQuery() {
  const query = new URLSearchParams(window.location.search);
  return query.get("restore") === "y" || query.get("resetUi") === "1";
}

function resetUiStatePreserveData(store) {
  if (!store || typeof store !== "object") return;
  store.interfaceConfig = defaultInterfaceConfig();
  store.themePreference = "auto";
  localStorage.removeItem(VIEW_STATE_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(NOTIFICATION_SEEN_KEY);
  localStorage.setItem(THEME_KEY, "auto");
}

const parentTranslations = {
  fr: {
    "login.personalCode": "Connexion par code personnel",
    "login.accessCode": "Code d’accès",
    "login.open": "Ouvrir",
    "login.requestAccess": "Demander un accès",
    "login.closeRequest": "Fermer la demande",
    "login.unknownCode": "Code inconnu",
    "login.disabled": "Accès désactivé",
    "access.title": "Demande d’accès",
    "access.lastName": "Nom",
    "access.firstName": "Prénom",
    "access.phone": "Téléphone",
    "access.email": "Adresse e-mail",
    "access.type": "Type d’accès demandé",
    "access.driver": "Chauffeur",
    "access.assistant": "Convoyeuse",
    "access.parent": "Parent",
    "access.childLastName": "Nom de l’enfant",
    "access.childFirstName": "Prénom de l’enfant",
    "access.school": "École",
    "access.circuitKnown": "Numéro de circuit si connu",
    "access.circuitConcerned": "Circuit concerné si connu",
    "access.schoolConcerned": "École concernée si connue",
    "access.message": "Message / précision",
    "access.send": "Envoyer la demande",
    "nav.dashboard": "Tableau parent",
    "nav.children": "Mes enfants",
    "nav.messages": "Messages",
    "nav.preferences": "Préférences",
    "nav.contact": "Contact",
    "parent.noChildren": "Aucun enfant lié à ce code parent.",
    "parent.noAccess": "Aucun enfant accessible.",
    "parent.space": "Espace parent",
    "parent.file": "Fiche parent",
    "parent.propose": "Proposer une modification",
    "dashboard.school": "École",
    "dashboard.circuit": "Circuit",
    "dashboard.bus": "Numéro bus",
    "dashboard.driver": "Chauffeur",
    "dashboard.assistant": "Convoyeuse",
    "dashboard.stop": "Arrêt",
    "dashboard.important": "Infos importantes",
    "dashboard.noAlert": "Aucune alerte",
    "child.info": "Informations",
    "child.lastName": "Nom",
    "child.firstName": "Prénom",
    "child.school": "École",
    "child.circuitNumber": "Numéro circuit",
    "child.pickupCircuit": "Circuit de prise en charge",
    "child.schoolCircuit": "Circuit vers l’école",
    "child.bus": "Numéro bus",
    "child.assistantPhone": "Téléphone convoyeuse",
    "child.stop": "Arrêt",
    "child.address": "Adresse",
    "child.health": "Santé et sécurité",
    "child.medicalInfo": "Informations médicales",
    "child.allergies": "Allergies",
    "child.conditions": "Affections médicales",
    "child.instructions": "Consignes importantes",
    "child.parentNotes": "Notes parents",
    "vehicle.title": "Véhicule",
    "vehicle.bus": "Numéro du bus",
    "vehicle.driver": "Chauffeur associé",
    "vehicle.assistant": "Convoyeuse associée",
    "vehicle.circuit": "Circuit",
    "vehicle.school": "École",
    "transfer.title": "Transfert",
    "transfer.changeBus": "Changement de car",
    "transfer.sameBus": "Reste dans le même car",
    "transfer.newBus": "Nouveau bus",
    "transfer.afterCircuit": "Circuit après transfert",
    "transfer.newDriver": "Chauffeur nouveau car",
    "transfer.newAssistant": "Convoyeuse nouveau car",
    "people.guardians": "Personnes responsables",
    "people.authorized": "Personnes autorisées",
    "people.reserved": "Gestion réservée au transport scolaire",
    "people.none": "Aucune personne renseignée.",
    "people.relationUnknown": "Lien non renseigné",
    "people.addressUnknown": "Adresse non renseignée",
    "request.title": "Proposer une modification",
    "request.edit": "Modification parent",
    "request.parentPhone": "Téléphone parent",
    "request.send": "Envoyer la demande",
    "request.cancel": "Annuler",
    "common.unknown": "Non renseigné",
    "common.yes": "oui",
    "common.no": "non",
    "common.back": "Retour",
    "badge.ok": "aucune info médicale",
    "badge.warning": "attention médicale",
    "badge.danger": "urgence importante",
    "messages.communication": "Communication",
    "messages.title": "Messages",
    "messages.private": "Messagerie privée",
    "messages.privateConversation": "Conversation privée",
    "messages.recent": "Conversations récentes",
    "messages.none": "Aucune conversation visible.",
    "messages.select": "Sélectionnez une conversation.",
    "messages.noChildMessage": "Aucun message pour cet enfant.",
    "messages.new": "Nouveau message",
    "messages.write": "Écrire un message...",
    "messages.send": "Envoyer",
    "messages.unread": "non lu",
    "messages.read": "lu",
    "messages.open": "Ouvrir la conversation",
    "messages.last": "Dernier message",
    "settings.preferences": "Préférences",
    "settings.display": "Préférences d’affichage",
    "theme.title": "Préférence thème",
    "theme.light": "Clair",
    "theme.dark": "Sombre",
    "theme.auto": "Automatique"
  }
};

Object.assign(parentTranslations.fr, {
  "action.edit": "Modifier",
  "action.save": "Enregistrer",
  "action.cancel": "Annuler",
  "action.delete": "Supprimer",
  "action.deleteForever": "Supprimer définitivement",
  "child.deleteConfirm": "Voulez-vous vraiment supprimer cette fiche élève ?",
  "child.fileTitle": "Fiche élève",
  "child.general": "Informations générales",
  "child.transport": "Transport",
  "child.autonomy": "Autonomie",
  "child.birthDate": "Date de naissance",
  "child.age": "Âge",
  "child.transferLocation": "Lieu de transfert",
  "child.pickupStop": "Arrêt bus",
  "child.driverLinked": "Chauffeur associé",
  "child.assistantLinked": "Convoyeuse associée",
  "child.sameBus": "Reste dans le même car",
  "child.status": "Statut",
  "child.disability": "Handicap",
  "child.symptoms": "Symptômes particuliers",
  "child.importantInfo": "Informations importantes",
  "child.communicationHelp": "Aide communication",
  "child.mobilityHelp": "Aide déplacement",
  "child.transportSickness": "Mal transports",
  "child.schoolSection": "École",
  "child.schoolName": "Nom de l’école",
  "child.email": "Adresse e-mail",
  "child.phone": "Téléphone",
  "child.autonomyStatus": "Statut autonomie",
  "child.autonomous": "Autonome",
  "child.accompanied": "Accompagné",
  "child.transferNeeded": "Transfert nécessaire",
  "transportStatus.title": "Statut transport",
  "transportStatus.exclusion": "Exclusion",
  "transportStatus.exclusionReason": "Raison exclusion",
  "transportStatus.exclusionStart": "Début exclusion",
  "transportStatus.exclusionEnd": "Fin exclusion",
  "transportStatus.exclusionType": "Type exclusion",
  "transportStatus.planned": "Trajet prévu",
  "transportStatus.temporary": "Exclusion temporaire",
  "transportStatus.final": "Exclusion définitive",
  "transportStatus.suspended": "Suspendu",
  "transportStatus.none": "Aucune exclusion",
  "people.call": "Appeler",
  "people.sms": "SMS",
  "people.relation": "Lien parenté",
  "transfer.driverAfter": "Chauffeur après transfert",
  "transfer.assistantAfter": "Convoyeuse après transfert"
});

function defaultInterfaceConfig() {
  return {
    dashboardCards: {
      admin: [
        { id: "drivers", label: "Chauffeurs", visible: true, order: 10 },
        { id: "bus", label: "Numéro identification bus KEOLIS", visible: true, order: 20 },
        { id: "outOfServiceVehicles", label: "Véhicules hors service", visible: true, order: 30 },
        { id: "circuits", label: "Circuit effectué", visible: true, order: 40 },
        { id: "schools", label: "École desservie", visible: true, order: 50 },
        { id: "assistant", label: "Convoyeuse associée", visible: true, order: 60 },
        { id: "children", label: "Nombre d'élèves", visible: true, order: 70 },
        { id: "messages", label: "Messages récents", visible: true, order: 80 }
      ],
      driver: [
        { id: "driver", label: "Chauffeur sélectionné", visible: true, order: 10 },
        { id: "phone", label: "Téléphone chauffeur", visible: true, order: 20 },
        { id: "bus", label: "Numéro identification bus KEOLIS", visible: true, order: 30 },
        { id: "outOfServiceVehicles", label: "Véhicules hors service", visible: true, order: 40 },
        { id: "circuits", label: "Circuit effectué", visible: true, order: 50 },
        { id: "schools", label: "École desservie", visible: true, order: 60 },
        { id: "assistant", label: "Convoyeuse associée", visible: true, order: 70 },
        { id: "children", label: "Nombre d'élèves", visible: true, order: 80 },
        { id: "messages", label: "Messages récents", visible: true, order: 90 }
      ],
      assistant: [
        { id: "assistants", label: "Convoyeuse(s)", visible: true, order: 10 },
        { id: "driver", label: "Chauffeur associé", visible: true, order: 20 },
        { id: "vehicle", label: "Numéro véhicule", visible: true, order: 30 },
        { id: "circuit", label: "Numéro de circuit", visible: true, order: 40 },
        { id: "outOfServiceVehicles", label: "Véhicules hors service", visible: true, order: 50 },
        { id: "children", label: "Nombre d'élèves", visible: true, order: 60 },
        { id: "school", label: "École desservie", visible: true, order: 70 },
        { id: "messages", label: "Messages récents", visible: true, order: 80 }
      ],
      parent: [
        { id: "school", label: "École", visible: true, order: 10 },
        { id: "circuit", label: "Circuit", visible: true, order: 20 },
        { id: "bus", label: "Numéro bus", visible: true, order: 30 },
        { id: "outOfServiceVehicles", label: "Véhicules hors service", visible: true, order: 40 },
        { id: "driver", label: "Chauffeur", visible: true, order: 50 },
        { id: "assistant", label: "Convoyeuse", visible: true, order: 60 },
        { id: "stop", label: "Arrêt", visible: true, order: 70 },
        { id: "important", label: "Infos importantes", visible: true, order: 80 },
        { id: "messages", label: "Messages récents", visible: true, order: 90 }
      ],
      support: [
        { id: "requests", label: "Demandes", visible: true, order: 10 },
        { id: "pending", label: "En attente", visible: true, order: 20 },
        { id: "unread", label: "Non lues", visible: true, order: 30 },
        { id: "messages", label: "Messages récents", visible: true, order: 40 }
      ]
    },
    menuLayout: {},
    menuLabels: {},
    roleVisibility: {},
    updatedBy: "",
    updatedAt: ""
  };
}

const seed = {
  users: [
    { id: "admin", identifierNumber: "6183", firstName: "Administrateur", lastName: "Système", role: "admin", accessCode: "1901", assignedCircuits: ["C-12", "C-18"], isActive: true, createdBy: "system", createdAt: "2026-05-18T09:00:00.000Z", updatedAt: "2026-05-18T09:00:00.000Z" },
    { id: "admin-spw", identifierNumber: "2001", firstName: "SPW", lastName: "Transport", role: "admin", accessCode: "2001", assignedCircuits: [], visualTheme: "spw", isActive: true, createdBy: "system", createdAt: "2026-05-18T09:00:00.000Z", updatedAt: "2026-05-18T09:00:00.000Z" },
    { id: "driver", identifierNumber: "1234", firstName: "Marc", lastName: "Lefèvre", role: "driver", accessCode: "1234", assignedCircuits: ["C-12"], assignedVehicleId: "vehicle-1", hasSncbReplacementAccess: false, isActive: true },
    { id: "assistant", identifierNumber: "5678", firstName: "Nadia", lastName: "Lambert", role: "assistant", accessCode: "5678", assignedCircuits: ["C-12", "C-18"], isActive: true },
    { id: "support", identifierNumber: "1990", firstName: "Centre", lastName: "Support", role: "support", accessCode: "1990", assignedCircuits: [], isActive: true }
  ],
  parents: [
    { id: "parent-1", firstName: "Claire", lastName: "Moreau", role: "parent", accessCode: "2468", linkedChildrenIds: ["child-1", "child-2"], phone: "+32476123456", email: "claire.moreau@example.com", isActive: true, createdAt: "2026-05-18T09:00:00.000Z", updatedAt: "2026-05-18T09:00:00.000Z" },
    { id: "parent-2", firstName: "Sophie", lastName: "Bernard", role: "parent", accessCode: "1357", linkedChildrenIds: ["child-3"], phone: "+32476111222", email: "sophie.bernard@example.com", isActive: true, createdAt: "2026-05-18T09:00:00.000Z", updatedAt: "2026-05-18T09:00:00.000Z" }
  ],
  drivers: [
    { id: "driver", firstName: "Marc", lastName: "Lefèvre", phone: "+32470123456", busNumber: "BUS 14", licensePlate: "1-ABC-234", schoolCircuit: "C-12", schoolName: "Institut Sainte-Marie", replacementDriverName: "", hasSncbReplacementAccess: false }
  ],
  assistants: [
    { id: "assistant", firstName: "Nadia", lastName: "Lambert", phone: "+32475111222", schoolCircuit: "C-12" }
  ],
  vehicles: [
    { id: "vehicle-1", busNumber: "BUS 14", licensePlate: "1-ABC-234", driverId: "driver", assistantId: "assistant", circuitId: "C-12", schoolName: "Institut Sainte-Marie", isOutOfService: false, outOfServiceReason: "", outOfServiceMessage: "", outOfServiceStartDate: "", outOfServiceEndDate: "", outOfServiceUpdatedBy: "", outOfServiceUpdatedAt: "", outOfServiceReadBy: [] }
  ],
  schools: [
    { id: "school-1", name: "Institut Sainte-Marie", address: "Rue de l'École 12, 5000 Namur", phone: "+3281223344", email: "secretariat@sainte-marie.example", notes: "Accueil côté cour." }
  ],
  circuits: [
    { id: "circuit-12", name: "C-12", type: "matin-retour", schoolName: "Institut Sainte-Marie", driverId: "driver", assistantId: "assistant", vehicleId: "vehicle-1", notes: "Circuit principal." },
    { id: "circuit-18", name: "C-18", type: "transfert", schoolName: "Institut Sainte-Marie", driverId: "driver", assistantId: "assistant", vehicleId: "vehicle-1", notes: "Transfert depot central." }
  ],
  tecStops: [
    { id: "tec-demo-eglise-namur", stop_id: "TEC-DEMO-001", name: "Arrêt Église", stop_name: "Arrêt Église", city: "Namur", lat: 50.4674, lon: 4.8719 },
    { id: "tec-demo-place-communale", stop_id: "TEC-DEMO-002", name: "Place Communale", stop_name: "Place Communale", city: "Namur", lat: 50.4651, lon: 4.8647 },
    { id: "tec-demo-rue-moulin", stop_id: "TEC-DEMO-003", name: "Rue du Moulin", stop_name: "Rue du Moulin", city: "Jambes", lat: 50.4583, lon: 4.8758 },
    { id: "tec-demo-gare-namur", stop_id: "TEC-DEMO-004", name: "Gare de Namur", stop_name: "Gare de Namur", city: "Namur", lat: 50.4689, lon: 4.8621 },
    { id: "tec-demo-hopital", stop_id: "TEC-DEMO-005", name: "Hôpital", stop_name: "Hôpital", city: "Namur", lat: 50.4698, lon: 4.8862 }
  ],
  belgianAddresses: [
    { id: "addr-rue-acacias-namur", street: "Rue des Acacias", postalCode: "5000", city: "Namur", country: "Belgique" },
    { id: "addr-rue-ecole-namur", street: "Rue de l'École", postalCode: "5000", city: "Namur", country: "Belgique" },
    { id: "addr-rue-moulin-jambes", street: "Rue du Moulin", postalCode: "5100", city: "Jambes", country: "Belgique" },
    { id: "addr-rue-haute-namur", street: "Rue Haute", postalCode: "5000", city: "Namur", country: "Belgique" },
    { id: "addr-rue-station-grace-hollogne", street: "Rue de la Station", postalCode: "4460", city: "Grâce-Hollogne", country: "Belgique" },
    { id: "addr-avenue-reine-astrid-namur", street: "Avenue Reine Astrid", postalCode: "5000", city: "Namur", country: "Belgique" },
    { id: "addr-chaussée-louvain-namur", street: "Chaussée de Louvain", postalCode: "5004", city: "Bouge", country: "Belgique" },
    { id: "addr-place-communale-jambes", street: "Place Communale", postalCode: "5100", city: "Jambes", country: "Belgique" }
  ],
  children: [
    makeChild("child-1", "Lucas", "Moreau", "2015-04-22", "C-12", "Arrêt Église", "Trouble moteur", "Arachides", false),
    makeChild("child-2", "Emma", "Dubois", "2013-11-08", "C-18", "Place Communale", "", "", true),
    makeChild("child-3", "Noah", "Bernard", "2016-02-17", "C-12", "Rue du Moulin", "Trouble auditif", "", false)
  ],
  parentChangeRequests: [
    { id: "request-demo-1", childId: "child-1", childName: "Lucas Moreau", parentId: "parent-1", parentName: "Claire Moreau", driverId: "driver", assistantId: "assistant", fieldChanged: "allergies", oldValue: "Arachides", newValue: "Arachides et noix", status: "pending", driverApproval: "pending", assistantApproval: "pending", reviewedAt: "", reviewedBy: "", rejectionReason: "", createdAt: "2026-05-18T09:30:00.000Z" }
  ],
  messages: {
    "child-1": [
      { id: "msg-1", text: "Bonjour, Lucas aura son sac médical ce matin.", authorId: "parent-1", authorName: "Claire Moreau", authorRole: "parent", recipientType: "role_group", recipientIds: ["driver", "assistant", "parent-1"], createdAt: "2026-05-18T07:30:00.000Z", readBy: ["parent-1"] }
    ],
    "child-2": [],
    "child-3": []
  },
  supportRequests: [
    { id: "support-demo-1", userId: "parent-1", userName: "Claire Moreau", userRole: "parent", subject: "Question trajet matin", message: "Bonjour, pouvez-vous confirmer l’heure de passage demain matin ?", status: "pending", createdAt: "2026-05-18T10:00:00.000Z", updatedAt: "2026-05-18T10:00:00.000Z", assignedSupport: "", lastReplyAt: "", context: { childId: "child-1", childName: "Lucas Moreau", schoolName: "Institut Sainte-Marie", circuitNumber: "C-12", busNumber: "BUS 14", driverId: "driver", driverName: "Marc Lefèvre", assistantId: "assistant", assistantName: "Nadia Lambert", userPhone: "+32476123456" }, readBy: ["parent-1"] }
  ],
  supportMessages: {
    "support-demo-1": [
      { id: "support-msg-1", text: "Bonjour, pouvez-vous confirmer l’heure de passage demain matin ?", authorId: "parent-1", authorName: "Claire Moreau", authorRole: "parent", createdAt: "2026-05-18T10:00:00.000Z", readBy: ["parent-1"] }
    ]
  },
  roleAnnouncements: [
    { id: "announcement-driver-1", title: "Contrôle des ceintures", content: "Merci de vérifier les ceintures avant chaque départ.", targetRole: "driver", recipientType: "role_group", recipientIds: ["driver"], important: true, createdBy: "admin", createdByName: "Gestionnaire GTS", createdAt: "2026-05-18T08:00:00.000Z", updatedAt: "2026-05-18T08:00:00.000Z", readBy: [] },
    { id: "announcement-assistant-1", title: "Point de vigilance", content: "Vérifier les objets de transition avant la montée.", targetRole: "assistant", recipientType: "role_group", recipientIds: ["assistant"], important: false, createdBy: "admin", createdByName: "Gestionnaire GTS", createdAt: "2026-05-18T08:10:00.000Z", updatedAt: "2026-05-18T08:10:00.000Z", readBy: [] }
  ],
  directMessages: [],
  directMessageItems: {},
  teamMessages: [],
  teamMessageItems: {},
  accessRequests: [],
  notifications: [],
  studentAbsences: [],
  transportTransfers: [],
  transferDelays: [],
  smsAlerts: [],
  studentMedical: [],
  studentSensitive: [],
  temporarySupportAccess: [],
  temporarySupportAccessLogs: [],
  replacementRules: [],
  leaveRequests: [],
  poolTransport: [],
  extraSchoolTransport: [],
  vehicleRepairs: [],
  anomalies: [],
  loginLogs: [],
  students: [],
  incidents: [],
  connectionLogs: [],
  extraTransports: [],
  vehicleReports: [],
  belgianAddresses: [],
  walloniaAddresses: [],
  pdfExports: [],
  settings: {},
  securityLogs: [],
  historyLogs: [],
  parentContact: {
    title: "Contact transport scolaire",
    phone: "",
    email: "",
    address: "",
    openingHours: "",
    message: "Les informations de contact seront complétées par le gestionnaire de transport."
  },
  serviceStatus: {
    id: "current",
    status: "operational",
    message: "Tous les services fonctionnent normalement",
    autoMode: true,
    lastCheckedAt: "2026-05-18T09:00:00.000Z",
    updatedAt: "2026-05-18T09:00:00.000Z",
    updatedBy: "system"
  },
  interfaceConfig: defaultInterfaceConfig()
};

const collectionAliasMap = {
  studentIssues: ["incidents"],
  loginLogs: ["connectionLogs"],
  extraSchoolTransport: ["extraTransports"],
  vehicleRepairs: ["vehicleReports"]
};

const firestoreBootstrapCollections = [
  "users",
  "students",
  "circuits",
  "schools",
  "vehicles",
  "incidents",
  "messages",
  "accessRequests",
  "studentAbsences",
  "transportTransfers",
  "transferDelays",
  "smsAlerts",
  "studentMedical",
  "studentSensitive",
  "historyLogs",
  "temporarySupportAccess",
  "temporarySupportAccessLogs",
  "connectionLogs",
  "leaveRequests",
  "extraTransports",
  "vehicleReports",
  "pdfExports",
  "settings"
];

function firestoreCanonicalCollection(type) {
  if (type === "students") return "children";
  if (type === "children") return "children";
  if (type === "incidents") return "studentIssues";
  if (type === "connectionLogs") return "loginLogs";
  if (type === "extraTransports") return "extraSchoolTransport";
  if (type === "vehicleReports") return "vehicleRepairs";
  return type;
}

function firestoreWriteCollections(type) {
  const canonical = firestoreCanonicalCollection(type);
  if (canonical === "children") return ["students"];
  const aliases = collectionAliasMap[canonical] || [];
  return Array.from(new Set([canonical, ...aliases]));
}

function normalizeTextSearch(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function syncCollectionAliases(target = data) {
  if (!target) return target;
  if (Array.isArray(target.children)) target.students = [...target.children];
  if (Array.isArray(target.students)) target.children = mergeRemoteCollection("children", target.children || [], target.students || [], target);
  if (Array.isArray(target.studentIssues)) target.incidents = [...target.studentIssues];
  if (Array.isArray(target.loginLogs)) target.connectionLogs = [...target.loginLogs];
  if (Array.isArray(target.extraSchoolTransport) || Array.isArray(target.poolTransport)) target.extraTransports = [...(target.extraSchoolTransport || target.poolTransport || [])];
  if (Array.isArray(target.vehicleRepairs)) target.vehicleReports = [...target.vehicleRepairs];
  if (Array.isArray(target.incidents) && !Array.isArray(target.studentIssues)) target.studentIssues = [...target.incidents];
  if (Array.isArray(target.connectionLogs) && !Array.isArray(target.loginLogs)) target.loginLogs = [...target.connectionLogs];
  if (Array.isArray(target.extraTransports) && !Array.isArray(target.extraSchoolTransport) && !Array.isArray(target.poolTransport)) target.extraSchoolTransport = [...target.extraTransports];
  if (Array.isArray(target.vehicleReports) && !Array.isArray(target.vehicleRepairs)) target.vehicleRepairs = [...target.vehicleReports];
  if (Array.isArray(target.children)) {
    (target.studentMedical || []).forEach((medical) => {
      const child = target.children.find((item) => item.id === medical.childId || item.id === medical.id);
      if (child) Object.assign(child, studentMedicalFieldsFromDoc(medical));
    });
    (target.studentSensitive || []).forEach((sensitive) => {
      const child = target.children.find((item) => item.id === sensitive.childId || item.id === sensitive.id);
      if (child) Object.assign(child, studentSensitiveFieldsFromDoc(sensitive));
    });
  }
  target.settings = target.settings && typeof target.settings === "object" ? target.settings : {};
  if (!target.settings.parentContact) target.settings.parentContact = target.parentContact;
}

let data = loadData();
let serviceHealth = {
  status: "degraded",
  message: "Vérification des services en cours...",
  updatedAt: new Date().toISOString(),
  checks: {}
};
let firestoreHealth = {
  available: false,
  lastSyncAt: "",
  errors: 0
};
let state = {
  user: getSessionUser(),
  screen: "dashboard",
  selectedChildId: "",
  editingChildId: "",
  selectedType: "",
  selectedId: "",
  editingType: "",
  editingId: "",
  activeFilter: null,
  pendingDeleteChildId: "",
  driverPickerSearch: "",
  search: "",
  parentChildId: "",
  parentRequestChildId: "",
  supportFilter: "all",
  selectedSupportRequestId: "",
  messageChildId: "",
  messagesTab: "children",
  selectedTeamConversationId: "",
  selectedDirectConversationId: "",
  editingAnnouncementId: "",
  editingAccessType: "",
  editingAccessId: "",
  accessCodesTab: "users",
  settingsTab: "admin",
  transportGroupTab: "children",
  securityGroupTab: "users",
  mobileMoreOpen: false,
  loginAccessRequestOpen: false,
  loginForgotPasswordOpen: false,
  loginForgotPasswordRole: "driver",
  passwordResetVerifiedType: "",
  passwordResetVerifiedId: "",
  firstLoginType: "",
  firstLoginId: "",
  loginAccessRequestRole: "driver",
  loginMode: "",
  loginSupportUnlocked: false,
  loginSupportTemporaryOpen: false,
  generatedSupportAccessCode: "",
  generatedSupportAccessExpiresAt: "",
  loginShowPassword: false,
  activeApp: getSessionApp(),
  outOfServiceVehicleId: "",
  editingReplacementRuleId: "",
  requestsTab: "leave",
  requestsFilter: "all",
  historyFilterText: "",
  historyFilterEntityType: "all",
  historyFilterDate: "",
  loginNotice: "",
  connectionState: navigator.onLine === false ? "offline" : "online",
  offlineQueueCount: 0
};

restoreViewState();
applyThemePreference();
applyParentLanguageDirection();

function makeChild(id, firstName, lastName, birthDate, circuitNumber, pickupStop, handicap, allergies, staysInSameBus) {
  return {
    id,
    firstName,
    lastName,
    birthDate,
    schoolName: "Institut Sainte-Marie",
    schoolPhone: "+3281223344",
    schoolEmail: "secretariat@sainte-marie.example",
    circuitNumber,
    morningCircuit: `${circuitNumber} matin`,
    transferCircuit: "Dépôt central",
    returnCircuit: `${circuitNumber} retour`,
    pickupStop,
    driverId: "driver",
    assistantId: "assistant",
    vehicleId: "vehicle-1",
    transferVehicleId: "BUS 14",
    transferLocation: "Dépôt central",
    transferDriverId: staysInSameBus ? "" : "driver",
    transferAssistantId: staysInSameBus ? "" : "assistant",
    transferCircuitId: circuitNumber,
    changesBusAtTransfer: !staysInSameBus,
    parentIds: id === "child-3" ? ["parent-2"] : ["parent-1"],
    parentAccessCode: id === "child-3" ? "1357" : "2468",
    parentNotes: "",
    transportStatus: "Trajet prévu",
    exclusionType: "",
    exclusionReason: "",
    exclusionStartDate: "",
    exclusionEndDate: "",
    staysInSameBus,
    autonomyStatus: staysInSameBus ? "accompagne" : "transfert necessaire",
    homeAddress: "Rue des Acacias 8",
    streetName: "Rue des Acacias",
    street: "Rue des Acacias",
    streetNumber: "8",
    houseNumber: "8",
    postalCode: "5000",
    city: "Namur",
    phone: "",
    pickupCircuitId: circuitNumber,
    schoolCircuitId: circuitNumber,
    hasTransfer: !staysInSameBus,
    transferSchoolCircuitId: "",
    alternatingResidence: {
      enabled: false,
      currentWeek: "maman",
      motherAddress: "Rue des Acacias 8",
      motherPostalCode: "5000",
      motherCity: "Namur",
      motherPickupStop: pickupStop,
      fatherAddress: "",
      fatherPostalCode: "",
      fatherCity: "",
      fatherPickupStop: "",
      notes: ""
    },
    alternatingCustody: {
      enabled: false,
      evenWeekAddress: "",
      oddWeekAddress: "",
      evenWeekParent: "",
      oddWeekParent: "",
      notes: ""
    },
    autonomy: {
      autonomous: staysInSameBus,
      accompanimentRequired: !staysInSameBus,
      boardingHelp: handicap ? "Aide à la montée" : "",
      exitHelp: "",
      enhancedSupervision: false,
      notes: ""
    },
    transportExclusion: {
      status: "actif",
      startDate: "",
      endDate: "",
      reason: "",
      notes: ""
    },
    medicalDisabilityType: handicap,
    allergies,
    medicalConditions: handicap ? "Fatigabilite" : "",
    medicalSymptoms: allergies ? "Surveillance allergie" : "",
    medicalNotes: allergies ? "Prevenir responsable en cas de symptome." : "",
    communicationHelp: handicap ? "Parler calmement" : "",
    mobilityHelp: handicap ? "Aide à la montée" : "",
    transportSickness: "Non",
    importantInstructions: handicap ? "Vérifier installation avant départ." : "",
    medicalHelpSheet: {
      disabilityType: handicap,
      disabilityForm: handicap ? "À préciser" : "",
      hasAllergies: allergies ? "oui" : "non",
      allergiesDetails: allergies,
      hasMedicalConditions: handicap ? "oui" : "non",
      medicalConditionsDetails: handicap ? "Fatigabilite" : "",
      medicalSymptoms: allergies ? "Surveillance allergie" : "",
      symptomInstructions: allergies ? "Prévenir le responsable en cas de symptôme." : "",
      transitionObject: "",
      mobilityHelp: handicap ? "Aide à la montée" : "",
      tripOccupation: "",
      transportSickness: "Non",
      communicationHelp: handicap ? "Parler calmement" : "",
      nonVerbalCommunication: "",
      pictograms: "",
      signs: "",
      careAdviceNotes: handicap ? "Vérifier installation avant départ." : ""
    },
    guardians: [{ firstName: "Claire", lastName, phone: "+32476123456", relation: "Parent", address: "Rue des Acacias 8" }],
    responsiblePersons: [{ firstName: "Claire", lastName, phone: "+32476123456", relation: "Parent", address: "Rue des Acacias 8" }],
    authorizedPickupPersons: [{ firstName: "Jean", lastName, phone: "+32477123456", relation: "Grand-parent", address: "Rue Haute 4" }],
    authorizedPersons: [{ firstName: "Jean", lastName, phone: "+32477123456", relation: "Grand-parent", address: "Rue Haute 4" }],
    sensitiveStudent: {
      enabled: false,
      attentionLevel: "information",
      instructions: "",
      internalNotes: ""
    }
  };
}

function loadData() {
  try {
    const resetUi = shouldResetUiFromQuery();
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved && typeof saved === "object") {
      if (resetUi) {
        resetUiStatePreserveData(saved);
      }
      const merged = { ...seed, ...saved };
      ["drivers", "assistants", "vehicles", "schools", "circuits", "parents", "parentChangeRequests", "supportRequests", "replacementRules", "leaveRequests", "poolTransport", "extraSchoolTransport", "vehicleRepairs", "anomalies"].forEach((key) => {
        if (!Array.isArray(merged[key]) || merged[key].length === 0) merged[key] = filterDeletedRecords(key, seed[key] || [], merged);
      });
      if (!merged.messages || typeof merged.messages !== "object") merged.messages = seed.messages;
      if (!merged.supportMessages || typeof merged.supportMessages !== "object") merged.supportMessages = seed.supportMessages;
      if (!merged.parentContact || typeof merged.parentContact !== "object") merged.parentContact = { ...seed.parentContact };
      if (!merged.serviceStatus || typeof merged.serviceStatus !== "object") merged.serviceStatus = { ...seed.serviceStatus };
      if (!merged.interfaceConfig || typeof merged.interfaceConfig !== "object") merged.interfaceConfig = defaultInterfaceConfig();
      migrateLocalData(merged);
      syncCollectionAliases(merged);
      syncLinkedData(merged);
      localStorage.setItem(STORE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch {}
  migrateLocalData(seed);
  syncCollectionAliases(seed);
  syncLinkedData(seed);
  localStorage.setItem(STORE_KEY, JSON.stringify(seed));
  return JSON.parse(JSON.stringify(seed));
}

function migrateLocalData(localData) {
  localData.deletedRecords = localData.deletedRecords || {};
  localData.users = localData.users || [];
  seed.users.forEach((seedUser) => {
    if (isDeletedRecord("users", seedUser.id, localData)) return;
    if (!localData.users.some((user) => user.id === seedUser.id || user.accessCode === seedUser.accessCode)) {
      localData.users.push({ ...seedUser });
    }
  });
  const spwAdmin = localData.users.find((user) => user.id === "admin-spw" || user.accessCode === "2001");
  if (spwAdmin) {
    spwAdmin.id = spwAdmin.id || "admin-spw";
    spwAdmin.role = "admin";
    spwAdmin.accessCode = "2001";
    spwAdmin.visualTheme = "spw";
    spwAdmin.isActive = true;
  } else {
    localData.users.push({ ...seed.users.find((user) => user.id === "admin-spw") });
  }
  const mainAdmin = localData.users.find((user) => user.id === "admin") || localData.users.find((user) => user.accessCode === "1901");
  if (mainAdmin) {
    mainAdmin.id = "admin";
    mainAdmin.role = "admin";
    mainAdmin.identifierNumber = "6183";
    mainAdmin.accessCode = mainAdmin.accessCode || "1901";
    mainAdmin.isActive = true;
    mainAdmin.createdBy = mainAdmin.createdBy || "system";
  } else {
    localData.users.push({ ...seed.users.find((user) => user.id === "admin") });
  }
  localData.users = localData.users.map((user) => ({
    ...user,
    identifier: user.identifier || user.identifierNumber || defaultIdentifierForUser(user),
    identifierNumber: user.identifierNumber || defaultIdentifierForUser(user),
    username: user.username || user.identifierNumber || defaultIdentifierForUser(user),
    firstLoginCompleted: user.firstLoginCompleted !== false,
    resetRequired: user.resetRequired === true,
    hasSncbReplacementAccess: user.role === "driver" ? user.hasSncbReplacementAccess === true : user.hasSncbReplacementAccess,
    isActive: user.isActive !== false,
    createdBy: user.createdBy || "system",
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || ""
  }));
  localData.drivers = (localData.drivers || []).map((driver) => ({
    ...driver,
    replacementDriverName: driver.replacementDriverName || "",
    hasSncbReplacementAccess: driver.hasSncbReplacementAccess === true
  }));
  localData.tecStops = (localData.tecStops || []).map((stop) => normalizeTecStop(stop)).filter((stop) => stop.id && stop.name);
  localData.belgianAddresses = (localData.belgianAddresses || []).map((address) => normalizeBelgianAddress(address)).filter((address) => address.id && address.street);
  localData.walloniaAddresses = (localData.walloniaAddresses || []).map((address) => normalizeBelgianAddress(address)).filter((address) => address.id && address.street);
  localData.vehicles = (localData.vehicles || []).map((vehicle) => normalizeVehicleOutOfService(vehicle));
  const parents = localData.parents || [];
  localData.parents = parents.map((parent) => ({
    ...parent,
    username: parent.username || parent.studentLastNameIdentifier || parent.lastName || "",
    loginChildName: parent.loginChildName || parent.studentLastNameIdentifier || parent.username || "",
    firstLoginCompleted: parent.firstLoginCompleted !== false,
    resetRequired: parent.resetRequired === true,
    isActive: parent.isActive !== false
  }));
  localData.children = (localData.children || []).map((child) => {
    const linkedParents = parents.filter((parent) => (parent.linkedChildrenIds || []).includes(child.id));
    const circuit = (localData.circuits || []).find((item) => item.name === child.circuitNumber) || {};
    const vehicle = (localData.vehicles || []).find((item) => item.id === child.vehicleId || item.circuitId === child.circuitNumber) || {};
    const migratedChild = {
      ...child,
      driverId: child.driverId || circuit.driverId || "driver",
      assistantId: child.assistantId || circuit.assistantId || "assistant",
      vehicleId: child.vehicleId || vehicle.id || "vehicle-1",
      pickupCircuitId: circuitRef(child, "pickupCircuitId", child.morningCircuit || child.circuitNumber, localData),
      schoolCircuitId: circuitRef(child, "schoolCircuitId", child.returnCircuit || child.circuitNumber, localData),
      parentIds: linkedParents.map((parent) => parent.id),
      parentAccessCode: "",
      parentNotes: child.parentNotes || "",
      transportStatus: child.transportStatus || "Trajet prévu",
      exclusionType: child.exclusionType || "",
      exclusionReason: child.exclusionReason || "",
      exclusionStartDate: child.exclusionStartDate || "",
      exclusionEndDate: child.exclusionEndDate || "",
      changesBusAtTransfer: child.changesBusAtTransfer ?? !child.staysInSameBus,
      transferLocation: child.transferLocation || child.transferCircuit || "",
      transferVehicleId: child.transferVehicleId || vehicle.busNumber || "",
      transferDriverId: child.transferDriverId || (!child.staysInSameBus ? circuit.driverId || "" : ""),
      transferAssistantId: child.transferAssistantId || (!child.staysInSameBus ? circuit.assistantId || "" : ""),
      transferCircuitId: child.transferCircuitId || child.circuitNumber || "",
      transferSchoolCircuitId: child.transferSchoolCircuitId || child.transferCircuitId || "",
      hasTransfer: typeof child.hasTransfer === "boolean" ? child.hasTransfer : child.changesBusAtTransfer === true || child.staysInSameBus === false,
      phone: child.phone || child.childPhone || "",
      attentionSpeciale: child.attentionSpeciale === true,
      typeAttention: child.typeAttention || "",
      noteAttention: child.noteAttention || "",
      niveauAttention: child.niveauAttention || "information",
      autonomy: {
        autonomous: child.autonomy?.autonomous === true || child.autonomyStatus === "autonome",
        accompanimentRequired: child.autonomy?.accompanimentRequired === true || child.autonomyStatus === "accompagne",
        boardingHelp: child.autonomy?.boardingHelp || child.mobilityHelp || "",
        exitHelp: child.autonomy?.exitHelp || "",
        enhancedSupervision: child.autonomy?.enhancedSupervision === true,
        notes: child.autonomy?.notes || ""
      },
      transportExclusion: {
        status: child.transportExclusion?.status || (child.exclusionType ? child.exclusionType : "actif"),
        startDate: child.transportExclusion?.startDate || child.exclusionStartDate || "",
        endDate: child.transportExclusion?.endDate || child.exclusionEndDate || "",
        reason: child.transportExclusion?.reason || child.exclusionReason || "",
        notes: child.transportExclusion?.notes || ""
      },
      responsiblePersons: Array.isArray(child.responsiblePersons) ? child.responsiblePersons : child.guardians || [],
      authorizedPersons: Array.isArray(child.authorizedPersons) ? child.authorizedPersons : child.authorizedPickupPersons || [],
      sensitiveStudent: {
        enabled: child.sensitiveStudent?.enabled === true || child.attentionSpeciale === true,
        attentionLevel: child.sensitiveStudent?.attentionLevel || child.niveauAttention || "information",
        instructions: child.sensitiveStudent?.instructions || child.noteAttention || "",
        internalNotes: child.sensitiveStudent?.internalNotes || ""
      },
      createdBy: child.createdBy || "system",
      createdByRole: child.createdByRole || "system",
      createdAt: child.createdAt || new Date().toISOString(),
      updatedBy: child.updatedBy || "system",
      updatedByRole: child.updatedByRole || "system",
      updatedAt: child.updatedAt || "",
      alternatingResidence: normalizeAlternatingResidence(child)
    };
    delete migratedChild.schoolLocation;
    syncStructuredChildAddress(migratedChild);
    syncMedicalHelpSheet(migratedChild);
    return migratedChild;
  });
  localData.parents = parents.map((parent) => ({ ...parent, role: "parent", isActive: parent.isActive !== false }));
  localData.parentChangeRequests = localData.parentChangeRequests || [];
  localData.parentChangeRequests = localData.parentChangeRequests.map((request) => {
    const child = localData.children.find((item) => item.id === request.childId) || {};
    return {
      ...request,
      driverId: request.driverId || child.driverId || "",
      assistantId: request.assistantId || child.assistantId || ""
    };
  });
  localData.supportRequests = localData.supportRequests || [];
  localData.messages = localData.messages || {};
  localData.supportMessages = localData.supportMessages || {};
  localData.studentIssues = Array.isArray(localData.studentIssues) ? localData.studentIssues : [];
  localData.studentIssueMessages = localData.studentIssueMessages || {};
  localData.parentContact = { ...seed.parentContact, ...(localData.parentContact || {}) };
  localData.serviceStatus = { ...seed.serviceStatus, ...(localData.serviceStatus || {}), id: "current" };
  localData.interfaceConfig = mergeInterfaceConfig(localData.interfaceConfig);
  localData.roleAnnouncements = localData.roleAnnouncements || [];
  Object.entries(localData.messages).forEach(([childId, messages]) => {
    const child = localData.children.find((item) => item.id === childId) || {};
    localData.messages[childId] = (messages || []).map((message) => ({
      ...message,
      recipientType: message.recipientType || "role_group",
      recipientIds: message.recipientIds?.length ? message.recipientIds : privateRecipientIdsForChild(child)
    }));
  });
  localData.studentIssues = localData.studentIssues.map((issue) => ({
    readBy: [],
    parentIds: [],
    spwIds: [],
    ...issue,
    status: issue.status || "open",
    createdAt: issue.createdAt || new Date().toISOString(),
    updatedAt: issue.updatedAt || issue.createdAt || new Date().toISOString()
  }));
  Object.entries(localData.studentIssueMessages).forEach(([issueId, messages]) => {
    localData.studentIssueMessages[issueId] = (messages || []).map((message) => ({
      readBy: [],
      ...message
    }));
  });
  localData.roleAnnouncements = localData.roleAnnouncements.map((announcement) => ({
    ...announcement,
    recipientType: announcement.recipientType || "role_group",
    recipientIds: announcement.recipientIds?.length ? announcement.recipientIds : [announcement.targetRole].filter(Boolean)
  }));
  localData.teamMessages = localData.teamMessages || [];
  localData.teamMessageItems = localData.teamMessageItems || {};
  localData.directMessages = localData.directMessages || [];
  localData.directMessageItems = localData.directMessageItems || {};
  localData.accessRequests = localData.accessRequests || [];
  localData.notifications = localData.notifications || [];
  localData.replacementRules = localData.replacementRules || [];
  localData.loginLogs = localData.loginLogs || [];
  localData.securityLogs = localData.securityLogs || [];
  localData.historyLogs = Array.isArray(localData.historyLogs) ? localData.historyLogs : [];
  localData.temporarySupportAccess = Array.isArray(localData.temporarySupportAccess) ? localData.temporarySupportAccess : [];
  localData.temporarySupportAccessLogs = Array.isArray(localData.temporarySupportAccessLogs) ? localData.temporarySupportAccessLogs : [];
  expireTemporarySupportAccesses(localData);
  localData.studentMedical = Array.isArray(localData.studentMedical) ? localData.studentMedical : [];
  localData.studentSensitive = Array.isArray(localData.studentSensitive) ? localData.studentSensitive : [];
  ["leaveRequests", "poolTransport", "extraSchoolTransport", "vehicleRepairs", "anomalies"].forEach((key) => {
    localData[key] = Array.isArray(localData[key]) ? localData[key] : [];
  });
  localData.children.forEach((child) => {
    if (!Array.isArray(localData.messages[child.id])) localData.messages[child.id] = [];
  });
  localData.supportRequests.forEach((request) => {
    if (!request.context) request.context = supportContextForRequest(localData, request);
    if (!Array.isArray(localData.supportMessages[request.id])) {
      localData.supportMessages[request.id] = [{
        id: `support-msg-${request.id}`,
        text: request.message || "",
        authorId: request.userId,
        authorName: request.userName,
        authorRole: request.userRole,
        createdAt: request.createdAt || new Date().toISOString(),
        readBy: [request.userId].filter(Boolean)
      }];
    }
  });
}

function syncLinkedData(target = data) {
  if (!target) return target;
  const source = target;
  const circuits = target.circuits || [];
  target.vehicles = (target.vehicles || []).map((vehicle) => normalizeVehicleOutOfService(vehicle));
  const vehicles = target.vehicles || [];
  const children = target.children || [];
  circuits.forEach((circuit) => {
    const vehicle = vehicles.find((item) => item.id === circuit.vehicleId || item.circuitId === circuit.name);
    if (vehicle) {
      circuit.vehicleId = vehicle.id;
      circuit.driverId = circuit.driverId || vehicle.driverId || "";
      circuit.assistantId = circuit.assistantId || vehicle.assistantId || "";
      if (!circuit.schoolName && vehicle.schoolName) circuit.schoolName = vehicle.schoolName;
    }
  });
  vehicles.forEach((vehicle) => {
    const circuit = circuits.find((item) => item.name === vehicle.circuitId || item.id === vehicle.circuitId || item.vehicleId === vehicle.id);
    if (circuit) {
      vehicle.circuitId = circuit.name || vehicle.circuitId;
      vehicle.driverId = vehicle.driverId || circuit.driverId || "";
      vehicle.assistantId = vehicle.assistantId || circuit.assistantId || "";
      vehicle.schoolName = vehicle.schoolName || circuit.schoolName || "";
      circuit.vehicleId = circuit.vehicleId || vehicle.id;
    }
  });
  children.forEach((child) => {
    const circuit = circuits.find((item) => item.name === child.circuitNumber || item.id === child.circuitNumber);
    const vehicle = vehicles.find((item) => item.id === child.vehicleId || item.circuitId === child.circuitNumber || item.id === circuit?.vehicleId);
    if (circuit) {
      child.circuitNumber = circuit.name || child.circuitNumber;
      child.pickupCircuitId = child.pickupCircuitId || circuit.id || circuit.name || "";
      child.schoolCircuitId = child.schoolCircuitId || child.pickupCircuitId || circuit.id || circuit.name || "";
      child.morningCircuit = circuitLabelByRef(child.pickupCircuitId, source) || child.morningCircuit || `${child.circuitNumber} prise en charge`;
      child.returnCircuit = circuitLabelByRef(child.schoolCircuitId, source) || child.returnCircuit || `${child.circuitNumber} vers école`;
      child.driverId = circuit.driverId || child.driverId || "";
      child.assistantId = circuit.assistantId || child.assistantId || "";
      child.vehicleId = circuit.vehicleId || vehicle?.id || child.vehicleId || "";
      child.schoolName = circuit.schoolName || child.schoolName || "";
    }
    if (vehicle) {
      child.vehicleId = vehicle.id;
      child.driverId = child.driverId || vehicle.driverId || "";
      child.assistantId = child.assistantId || vehicle.assistantId || "";
      child.transferVehicleId = vehicle.busNumber || child.transferVehicleId || "";
    }
  });
  (target.parentChangeRequests || []).forEach((request) => {
    const child = children.find((item) => item.id === request.childId);
    if (child) {
      request.driverId = child.driverId || request.driverId || "";
      request.assistantId = child.assistantId || request.assistantId || "";
    }
  });
  (target.studentIssues || []).forEach((issue) => {
    const child = children.find((item) => item.id === issue.childId);
    if (child) {
      issue.childName = fullName(child) || issue.childName || "";
      issue.driverId = child.driverId || issue.driverId || "";
      issue.assistantId = child.assistantId || issue.assistantId || "";
      issue.parentIds = child.parentIds || issue.parentIds || [];
    }
    issue.spwIds = issue.spwIds?.length ? issue.spwIds : (target.users || []).filter((user) => user.role === "admin" && user.visualTheme === "spw").map((user) => user.id);
  });
  return target;
}

function saveData() {
  syncLinkedData(data);
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function offlineQueueTypeForCollection(type) {
  if (type === "children" || type === "students") return "update_child";
  if (type === "studentIssues") return "issue_report";
  if (type === "supportRequests") return "support_request";
  if (type === "parentChangeRequests" || type === "accessRequests") return "parent_request";
  if (["privateMessages", "teamMessages", "directMessages", "messages"].includes(type)) return "message";
  return "update_data";
}

function loadOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveOfflineQueue(queue = offlineQueueMemory) {
  offlineQueueMemory = queue;
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  state.offlineQueueCount = queue.filter((item) => item.status !== "synced").length;
  writeOfflineQueueIndexedDb(queue);
}

function openOfflineDb() {
  if (!("indexedDB" in window)) return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OFFLINE_QUEUE_STORE)) db.createObjectStore(OFFLINE_QUEUE_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function writeOfflineQueueIndexedDb(queue) {
  const db = await openOfflineDb();
  if (!db) return;
  const tx = db.transaction(OFFLINE_QUEUE_STORE, "readwrite");
  const store = tx.objectStore(OFFLINE_QUEUE_STORE);
  queue.forEach((item) => store.put(item));
}

function enqueueOfflineOperation(type, payload = {}) {
  const queue = loadOfflineQueue();
  const item = {
    id: payload.id ? `offline-${type}-${payload.id}-${Date.now()}` : `offline-${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    status: "pending",
    retryCount: 0
  };
  queue.push(item);
  saveOfflineQueue(queue);
  if (state.user) render();
  return item;
}

function offlineQueueSummary() {
  const pending = state.offlineQueueCount || 0;
  const hasConflict = loadOfflineQueue().some((item) => item.status === "conflict");
  if (hasConflict) return ["conflict", "Conflit à vérifier"];
  if (state.connectionState === "syncing") return ["syncing", "Synchronisation en cours"];
  if (navigator.onLine === false) return ["offline", pending ? `Hors ligne · ${pending} en attente` : "Hors ligne"];
  if (pending) return ["pending", `${pending} donnée${pending > 1 ? "s" : ""} en attente`];
  return ["online", offlineSyncNotice || "En ligne"];
}

function offlineStatusBadge() {
  const [tone, label] = offlineQueueSummary();
  return `<button class="offline-status ${esc(tone)}" type="button" title="État de synchronisation">${esc(label)}</button>`;
}

function offlineStatusCard() {
  const [tone, label] = offlineQueueSummary();
  if (tone === "online" && !offlineSyncNotice) return "";
  const conflictCount = loadOfflineQueue().filter((item) => item.status === "conflict").length;
  const pendingCount = loadOfflineQueue().filter((item) => item.status === "pending").length;
  return `<article class="offline-card ${esc(tone)}">
    <strong>${esc(label)}</strong>
    <span>${tone === "conflict" ? "Une donnée n’a pas pu être synchronisée automatiquement. Vérifiez avant d’écraser une information sensible." : tone === "offline" ? "Les données déjà chargées restent accessibles. Les modifications seront synchronisées au retour du réseau." : tone === "pending" ? "Les modifications locales seront envoyées automatiquement." : "Les données locales sont en cours d’envoi vers Firestore."}</span>
    ${tone === "conflict" ? `<div class="offline-actions">
      <button class="secondary-button compact-button" type="button" data-offline-retry="1">Réessayer la synchronisation</button>
      <button class="link-button" type="button" data-offline-details="1">${esc(conflictCount)} donnée${conflictCount > 1 ? "s" : ""} à vérifier</button>
    </div>` : ""}
    ${tone === "pending" ? `<div class="offline-actions">
      <button class="secondary-button compact-button" type="button" data-offline-sync-now="1">Envoyer maintenant à Firebase</button>
      <button class="link-button" type="button" data-offline-details="1">${esc(pendingCount)} donnée${pendingCount > 1 ? "s" : ""} en attente</button>
    </div>` : ""}
  </article>`;
}

function offlinePendingBadge(id = "") {
  if (!id) return "";
  const pending = loadOfflineQueue().some((item) =>
    item.status !== "synced" &&
    JSON.stringify(item.payload || {}).includes(id)
  );
  return pending ? ` <b class="badge warning">En attente d’envoi</b>` : "";
}

function firestoreSyncErrorMessage(error) {
  const code = error?.code ? `${error.code} ` : "";
  return `${code}${error?.message || "Erreur inconnue"}`.trim();
}

function shouldKeepOfflineConflict(error, retryCount) {
  const code = String(error?.code || "");
  return retryCount >= 5 || ["permission-denied", "unauthenticated", "invalid-argument", "failed-precondition"].includes(code);
}

const studentMedicalKeys = [
  "medicalHelpSheet",
  "medicalDisabilityType",
  "medicalDisabilityForm",
  "allergies",
  "medicalConditions",
  "medicalSymptoms",
  "medicalNotes",
  "transitionObject",
  "mobilityHelp",
  "tripOccupation",
  "transportSickness",
  "communicationHelp",
  "nonVerbalCommunication",
  "pictograms",
  "signs",
  "importantInstructions",
  "parentMedicalHelpCompletedAt",
  "parentMedicalHelpCompletedBy"
];

const studentSensitiveKeys = [
  "alternatingCustody",
  "alternatingResidence",
  "autonomy",
  "transportExclusion",
  "exclusionType",
  "exclusionReason",
  "exclusionStartDate",
  "exclusionEndDate",
  "responsiblePersons",
  "guardians",
  "authorizedPersons",
  "authorizedPickupPersons",
  "sensitiveStudent",
  "attentionSpeciale",
  "typeAttention",
  "noteAttention",
  "niveauAttention"
];

function pickStudentFields(child = {}, keys = []) {
  return keys.reduce((picked, key) => {
    if (child[key] !== undefined) picked[key] = child[key];
    return picked;
  }, {});
}

function publicStudentForFirestore(child = {}) {
  const publicChild = cloneHistorySnapshot(child) || {};
  [...studentMedicalKeys, ...studentSensitiveKeys].forEach((key) => delete publicChild[key]);
  return publicChild;
}

function studentMedicalDocForFirestore(child = {}) {
  return {
    id: child.id,
    childId: child.id,
    childName: fullName(child),
    driverId: child.driverId || "",
    assistantId: child.assistantId || "",
    parentIds: child.parentIds || [],
    ...pickStudentFields(child, studentMedicalKeys),
    updatedAt: child.updatedAt || new Date().toISOString(),
    updatedBy: child.updatedBy || state.user?.id || "system"
  };
}

function studentSensitiveDocForFirestore(child = {}) {
  return {
    id: child.id,
    childId: child.id,
    childName: fullName(child),
    driverId: child.driverId || "",
    assistantId: child.assistantId || "",
    parentIds: child.parentIds || [],
    ...pickStudentFields(child, studentSensitiveKeys),
    updatedAt: child.updatedAt || new Date().toISOString(),
    updatedBy: child.updatedBy || state.user?.id || "system"
  };
}

function studentMedicalFieldsFromDoc(doc = {}) {
  return pickStudentFields(doc, studentMedicalKeys);
}

function studentSensitiveFieldsFromDoc(doc = {}) {
  return pickStudentFields(doc, studentSensitiveKeys);
}

function publicStudentHasSensitiveLeak(child = {}) {
  const publicChild = publicStudentForFirestore(child);
  return [...studentMedicalKeys, ...studentSensitiveKeys].some((key) => publicChild[key] !== undefined);
}

function studentFirestoreWriteOperations(child = {}) {
  const publicChild = publicStudentForFirestore(child);
  const medicalDoc = studentMedicalDocForFirestore(child);
  const sensitiveDoc = studentSensitiveDocForFirestore(child);
  if (isSpwAccount()) {
    return [
      { queueType: "update_child", path: ["students", child.id], payload: publicChild, merge: false },
      { queueType: "update_medical", path: ["studentMedical", child.id], payload: medicalDoc, merge: true },
      { queueType: "update_child", path: ["studentSensitive", child.id], payload: sensitiveDoc, merge: true }
    ];
  }
  if (isTransportManagerUser()) {
    return [
      { queueType: "update_child", path: ["students", child.id], payload: publicChild, merge: false }
    ];
  }
  if (isParent()) {
    return [
      {
        queueType: "update_child",
        path: ["students", child.id],
        payload: {
          id: child.id,
          parentMedicalHelpCompletedAt: child.parentMedicalHelpCompletedAt || "",
          parentMedicalHelpCompletedBy: child.parentMedicalHelpCompletedBy || state.user?.id || "",
          updatedAt: child.updatedAt || new Date().toISOString(),
          updatedBy: child.updatedBy || state.user?.id || "",
          updatedByRole: child.updatedByRole || state.user?.role || ""
        },
        merge: true
      },
      { queueType: "update_medical", path: ["studentMedical", child.id], payload: medicalDoc, merge: true }
    ];
  }
  return [
    { queueType: "update_child", path: ["students", child.id], payload: publicChild, merge: false }
  ];
}

async function writeQueuedFirestoreOperation(item) {
  const { operation, collectionName, id, data: payloadData, collections, pathSegments } = item.payload || {};
  const { db } = await import("./src/firebaseConfig.js");
  if (!db) throw new Error("Firestore indisponible");
  const { doc, setDoc, deleteDoc } = await import("firebase/firestore");
  if (pathSegments?.length) {
    if (operation === "set") {
      const ref = doc(db, ...pathSegments);
      if (item.payload?.merge === false) await setDoc(ref, payloadData);
      else await setDoc(ref, payloadData, { merge: true });
    }
    if (operation === "delete") await deleteDoc(doc(db, ...pathSegments));
    return;
  }
  if (operation === "set") {
    const names = collections?.length ? collections : [collectionName];
    await Promise.all(names.map((name) => setDoc(doc(db, name, id), payloadData, { merge: true })));
  }
  if (operation === "delete") {
    const names = collections?.length ? collections : [collectionName];
    await Promise.all(names.map((name) => deleteDoc(doc(db, name, id))));
  }
}

function queueFirestorePathSet(queueType, pathSegments, payloadData, options = {}) {
  enqueueOfflineOperation(queueType, {
    operation: "set",
    pathSegments,
    id: pathSegments.join("/"),
    data: payloadData,
    merge: options.merge
  });
}

function queueFirestorePathDelete(queueType, pathSegments) {
  enqueueOfflineOperation(queueType, {
    operation: "delete",
    pathSegments,
    id: pathSegments.join("/")
  });
}

async function syncOfflineQueue() {
  if (navigator.onLine === false || offlineSyncTimer) return;
  const queue = loadOfflineQueue().filter((item) => item.status !== "synced");
  if (!queue.length) {
    saveOfflineQueue([]);
    return;
  }
  state.connectionState = "syncing";
  render();
  offlineSyncTimer = true;
  const nextQueue = [];
  for (const item of queue) {
    try {
      await writeQueuedFirestoreOperation(item);
      item.status = "synced";
      item.lastError = "";
    } catch (error) {
      item.retryCount = Number(item.retryCount || 0) + 1;
      item.lastError = firestoreSyncErrorMessage(error);
      item.status = shouldKeepOfflineConflict(error, item.retryCount) ? "conflict" : "pending";
      nextQueue.push(item);
      console.warn("Synchronisation différée impossible.", error);
    }
  }
  offlineSyncTimer = null;
  saveOfflineQueue(nextQueue);
  state.connectionState = navigator.onLine === false ? "offline" : nextQueue.length ? "pending" : "online";
  offlineSyncNotice = nextQueue.some((item) => item.status === "conflict")
    ? "Conflit à vérifier"
    : nextQueue.length
      ? `${nextQueue.length} donnée${nextQueue.length > 1 ? "s" : ""} en attente`
      : "Synchronisation terminée";
  render();
  window.setTimeout(() => {
    offlineSyncNotice = "";
    if (state.user) render();
  }, 4000);
}

function retryOfflineConflicts() {
  const queue = loadOfflineQueue().map((item) => item.status === "conflict"
    ? { ...item, status: "pending", retryCount: 0 }
    : item);
  saveOfflineQueue(queue);
  offlineSyncNotice = "Nouvelle tentative de synchronisation";
  syncOfflineQueue();
  if (state.user) render();
}

function offlineConflictDetails() {
  const waitingItems = loadOfflineQueue().filter((item) => item.status !== "synced");
  if (!waitingItems.length) return "Aucune donnée en attente.";
  return waitingItems.map((item, index) => {
    const path = item.payload?.pathSegments?.join("/") || item.payload?.collectionName || item.payload?.id || "donnée locale";
    return `${index + 1}. ${item.type || "modification"}\nStatut : ${item.status || "pending"}\nCible : ${path}\nTentatives : ${item.retryCount || 0}${item.lastError ? `\nErreur Firebase : ${item.lastError}` : ""}`;
  }).join("\n\n");
}

function initOfflineMode() {
  offlineQueueMemory = loadOfflineQueue();
  saveOfflineQueue(offlineQueueMemory);
  window.addEventListener("online", () => {
    state.connectionState = "syncing";
    syncOfflineQueue();
  });
  window.addEventListener("offline", () => {
    state.connectionState = "offline";
    if (state.user) render();
  });
  if (navigator.onLine !== false) syncOfflineQueue();
}

async function saveChildToFirestore(child) {
  const operations = studentFirestoreWriteOperations(child);
  if (navigator.onLine === false) {
    operations.forEach((operation) => queueFirestorePathSet(operation.queueType, operation.path, operation.payload, { merge: operation.merge }));
    return;
  }
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await Promise.all(operations.map((operation) => {
      const ref = doc(db, ...operation.path);
      return operation.merge === false ? setDoc(ref, operation.payload) : setDoc(ref, operation.payload, { merge: true });
    }));
  } catch (error) {
    operations.forEach((operation) => queueFirestorePathSet(operation.queueType, operation.path, operation.payload, { merge: operation.merge }));
    console.warn("Firestore indisponible, localStorage conserve la fiche élève.", error);
  }
}

async function deleteChildFromFirestore(childId) {
  rememberDeletedRecord("children", childId);
  rememberDeletedRecord("students", childId);
  saveData();
  try {
    if (navigator.onLine === false) {
      enqueueOfflineOperation("update_child", { operation: "delete", id: childId, collections: ["students", "children", "studentMedical", "studentSensitive"] });
      return;
    }
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, deleteDoc } = await import("firebase/firestore");
    await Promise.all([
      deleteDoc(doc(db, "students", childId)),
      deleteDoc(doc(db, "children", childId)),
      deleteDoc(doc(db, "studentMedical", childId)),
      deleteDoc(doc(db, "studentSensitive", childId))
    ]);
  } catch (error) {
    enqueueOfflineOperation("update_child", { operation: "delete", id: childId, collections: ["students", "children", "studentMedical", "studentSensitive"] });
    console.warn("Firestore indisponible, suppression locale conservée.", error);
  }
}

async function saveParentRequestToFirestore(request) {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "parentChangeRequests", request.id), request, { merge: true });
  } catch (error) {
    console.warn("Firestore indisponible, demande parent conservée en localStorage.", error);
  }
}

async function saveChildMessageToFirestore(childId, message) {
  const conversation = privateConversationForChild(childId);
  if (navigator.onLine === false) {
    queueFirestorePathSet("message", ["privateMessages", conversation.conversationId], conversation);
    queueFirestorePathSet("message", ["privateMessages", conversation.conversationId, "messages", message.id], { ...message, offlineStatus: "pending" });
    return;
  }
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "privateMessages", conversation.conversationId), conversation, { merge: true });
    await setDoc(doc(db, "privateMessages", conversation.conversationId, "messages", message.id), message, { merge: true });
  } catch (error) {
    queueFirestorePathSet("message", ["privateMessages", conversation.conversationId], conversation);
    queueFirestorePathSet("message", ["privateMessages", conversation.conversationId, "messages", message.id], { ...message, offlineStatus: "pending" });
    console.warn("Firestore indisponible, message privé conservé en localStorage.", error);
  }
}

async function saveStudentIssueMessageToFirestore(issueId, message) {
  if (navigator.onLine === false) {
    queueFirestorePathSet("message", ["studentIssues", issueId, "messages", message.id], { ...message, offlineStatus: "pending" });
    return;
  }
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "studentIssues", issueId, "messages", message.id), message, { merge: true });
  } catch (error) {
    queueFirestorePathSet("message", ["studentIssues", issueId, "messages", message.id], { ...message, offlineStatus: "pending" });
    console.warn("Firestore indisponible, réponse au signalement conservée en localStorage.", error);
  }
}

async function deleteChildMessageFromFirestore(childId, messageId) {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, deleteDoc, setDoc } = await import("firebase/firestore");
    const conversation = privateConversationForChild(childId);
    await deleteDoc(doc(db, "privateMessages", conversation.conversationId, "messages", messageId));
    await setDoc(doc(db, "privateMessages", conversation.conversationId), conversation, { merge: true });
  } catch (error) {
    console.warn("Firestore indisponible, suppression message privé conservée en localStorage.", error);
  }
}

async function saveSupportRequestToFirestore(request) {
  if (navigator.onLine === false) {
    queueFirestorePathSet("support_request", ["supportRequests", request.id], request);
    return;
  }
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "supportRequests", request.id), request, { merge: true });
  } catch (error) {
    queueFirestorePathSet("support_request", ["supportRequests", request.id], request);
    console.warn("Firestore indisponible, demande support conservée en localStorage.", error);
  }
}

async function deleteSupportRequestFromFirestore(requestId) {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "supportRequests", requestId));
  } catch (error) {
    console.warn("Firestore indisponible, suppression support locale conservée.", error);
  }
}

async function saveSupportMessageToFirestore(requestId, message) {
  if (navigator.onLine === false) {
    queueFirestorePathSet("message", ["supportRequests", requestId, "messages", message.id], { ...message, offlineStatus: "pending" });
    return;
  }
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "supportRequests", requestId, "messages", message.id), message, { merge: true });
  } catch (error) {
    queueFirestorePathSet("message", ["supportRequests", requestId, "messages", message.id], { ...message, offlineStatus: "pending" });
    console.warn("Firestore indisponible, message support conservé en localStorage.", error);
  }
}

async function deleteSupportMessageFromFirestore(requestId, messageId) {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "supportRequests", requestId, "messages", messageId));
  } catch (error) {
    console.warn("Firestore indisponible, suppression message support conservée en localStorage.", error);
  }
}

async function saveRoleAnnouncementToFirestore(announcement) {
  return saveCollectionItemToFirestore("roleAnnouncements", announcement);
}

async function deleteRoleAnnouncementFromFirestore(id) {
  return deleteCollectionItemFromFirestore("roleAnnouncements", id);
}

async function saveTeamMessageToFirestore(conversation, message) {
  if (navigator.onLine === false) {
    queueFirestorePathSet("message", ["teamMessages", conversation.conversationId], conversation);
    queueFirestorePathSet("message", ["teamMessages", conversation.conversationId, "messages", message.id], { ...message, offlineStatus: "pending" });
    return;
  }
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "teamMessages", conversation.conversationId), conversation, { merge: true });
    await setDoc(doc(db, "teamMessages", conversation.conversationId, "messages", message.id), message, { merge: true });
  } catch (error) {
    queueFirestorePathSet("message", ["teamMessages", conversation.conversationId], conversation);
    queueFirestorePathSet("message", ["teamMessages", conversation.conversationId, "messages", message.id], { ...message, offlineStatus: "pending" });
    console.warn("Firestore indisponible, message équipe conservé en localStorage.", error);
  }
}

async function deleteTeamMessageFromFirestore(conversationId, messageId, conversation) {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, deleteDoc, setDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "teamMessages", conversationId, "messages", messageId));
    if (conversation) await setDoc(doc(db, "teamMessages", conversationId), conversation, { merge: true });
  } catch (error) {
    console.warn("Firestore indisponible, suppression message équipe conservée en localStorage.", error);
  }
}

async function saveDirectMessageToFirestore(conversation, message) {
  if (navigator.onLine === false) {
    queueFirestorePathSet("message", ["directMessages", conversation.conversationId], conversation);
    queueFirestorePathSet("message", ["directMessages", conversation.conversationId, "messages", message.id], { ...message, offlineStatus: "pending" });
    return;
  }
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "directMessages", conversation.conversationId), conversation, { merge: true });
    await setDoc(doc(db, "directMessages", conversation.conversationId, "messages", message.id), message, { merge: true });
  } catch (error) {
    queueFirestorePathSet("message", ["directMessages", conversation.conversationId], conversation);
    queueFirestorePathSet("message", ["directMessages", conversation.conversationId, "messages", message.id], { ...message, offlineStatus: "pending" });
    console.warn("Firestore indisponible, message direct conservé en localStorage.", error);
  }
}

async function deleteDirectMessageFromFirestore(conversationId, messageId, conversation) {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, deleteDoc, setDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "directMessages", conversationId, "messages", messageId));
    if (conversation) await setDoc(doc(db, "directMessages", conversationId), conversation, { merge: true });
  } catch (error) {
    console.warn("Firestore indisponible, suppression message direct conservée en localStorage.", error);
  }
}

async function saveLoginLogToFirestore(log) {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "loginLogs", log.id), log, { merge: true });
  } catch (error) {
    console.warn("Firestore indisponible, journal connexion conservé en localStorage.", error);
  }
}

async function saveSecurityLogToFirestore(log) {
  return saveCollectionItemToFirestore("securityLogs", log);
}

async function saveTemporarySupportAccessToFirestore(access) {
  return saveCollectionItemToFirestore("temporarySupportAccess", access);
}

async function saveTemporarySupportAccessLogToFirestore(log) {
  return saveCollectionItemToFirestore("temporarySupportAccessLogs", log);
}

async function saveAccessRequestToFirestore(request) {
  return saveCollectionItemToFirestore("accessRequests", request);
}

async function saveParentContactToFirestore(contact) {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "settings", "parentContact"), contact, { merge: true });
  } catch (error) {
    console.warn("Firestore indisponible, contact parent conservé en localStorage.", error);
  }
}

async function saveInterfaceConfigToFirestore(config) {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "appSettings", "interfaceConfig"), config, { merge: true });
  } catch (error) {
    console.warn("Firestore indisponible, personnalisation interface conservée en localStorage.", error);
  }
}

async function saveServiceStatusToFirestore(status) {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "serviceStatus", "current"), status, { merge: true });
  } catch (error) {
    console.warn("Firestore indisponible, état des services conservé en localStorage.", error);
  }
}

async function saveNotificationToFirestore(notification) {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "notifications", notification.id), notification, { merge: true });
  } catch (error) {
    console.warn("Firestore indisponible, notification conservée en localStorage.", error);
  }
}

async function saveCollectionItemToFirestore(type, item) {
  const collections = firestoreWriteCollections(type);
  const queueType = offlineQueueTypeForCollection(type);
  if (navigator.onLine === false) {
    enqueueOfflineOperation(queueType, { operation: "set", collectionName: collections[0], collections, id: item.id, data: item });
    return;
  }
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, setDoc } = await import("firebase/firestore");
    await Promise.all(
      collections.map((collectionName) => setDoc(doc(db, collectionName, item.id), item, { merge: true }))
    );
  } catch (error) {
    enqueueOfflineOperation(queueType, { operation: "set", collectionName: collections[0], collections, id: item.id, data: item });
    console.warn("Firestore indisponible, modification conservée en localStorage.", error);
  }
}

function firestoreBootstrapItems(collectionName) {
  const now = new Date().toISOString();
  if (collectionName === "students") return (data.children || []).map(publicStudentForFirestore);
  if (collectionName === "studentMedical") return (data.children || []).map(studentMedicalDocForFirestore);
  if (collectionName === "studentSensitive") return (data.children || []).map(studentSensitiveDocForFirestore);
  if (collectionName === "incidents") return data.studentIssues || [];
  if (collectionName === "connectionLogs") return data.loginLogs || [];
  if (collectionName === "extraTransports") return data.extraSchoolTransport || data.poolTransport || [];
  if (collectionName === "vehicleReports") return data.vehicleRepairs || [];
  if (collectionName === "temporarySupportAccess") return data.temporarySupportAccess || [];
  if (collectionName === "temporarySupportAccessLogs") return data.temporarySupportAccessLogs || [];
  if (collectionName === "messages") {
    return Object.entries(data.messages || {}).flatMap(([childId, messages]) =>
      (messages || []).map((message, index) => ({
        id: message.id || `${childId}-${index}`,
        childId,
        ...message
      }))
    );
  }
  if (collectionName === "settings") {
    return [{
      id: "current",
      parentContact: data.parentContact || {},
      serviceStatus: data.serviceStatus || {},
      interfaceConfig: data.interfaceConfig || {},
      updatedAt: now,
      updatedBy: "system"
    }];
  }
  const items = data[collectionName];
  return Array.isArray(items) ? items : [];
}

async function bootstrapFirestoreCollections() {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { collection, doc, getDocs, setDoc } = await import("firebase/firestore");
    const now = new Date().toISOString();
    await Promise.all(firestoreBootstrapCollections.map(async (collectionName) => {
      const snapshot = await getDocs(collection(db, collectionName));
      const hasRealDocument = snapshot.docs.some((docSnap) => docSnap.id !== "__meta__");
      if (hasRealDocument) return;
      const items = firestoreBootstrapItems(collectionName).filter((item) => item?.id);
      if (items.length) {
        await Promise.all(items.map((item) => setDoc(doc(db, collectionName, item.id), item, { merge: true })));
        return;
      }
      await setDoc(doc(db, collectionName, "__meta__"), {
        id: "__meta__",
        collectionName,
        system: true,
        createdAt: now,
        note: "Collection initialisée automatiquement par GTS."
      }, { merge: true });
    }));
  } catch (error) {
    console.warn("Initialisation Firestore indisponible, localStorage reste actif.", error);
  }
}

async function deleteCollectionItemFromFirestore(type, id) {
  rememberDeletedRecord(type, id);
  saveData();
  const collections = firestoreWriteCollections(type);
  if (navigator.onLine === false) {
    enqueueOfflineOperation(offlineQueueTypeForCollection(type), { operation: "delete", collectionName: collections[0], collections, id });
    return;
  }
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    const { doc, deleteDoc } = await import("firebase/firestore");
    await Promise.all(collections.map((collectionName) => deleteDoc(doc(db, collectionName, id))));
  } catch (error) {
    enqueueOfflineOperation(offlineQueueTypeForCollection(type), { operation: "delete", collectionName: collections[0], collections, id });
    console.warn("Firestore indisponible, suppression locale conservée.", error);
  }
}

async function startFirestoreRealtimeSync() {
  try {
    const { db } = await import("./src/firebaseConfig.js");
    if (!db) return;
    firestoreHealth.available = true;
    const { collection, doc, onSnapshot } = await import("firebase/firestore");
    await bootstrapFirestoreCollections();
    const firestoreCollections = [
      "users",
      "parents",
      "drivers",
      "assistants",
      "vehicles",
      "schools",
      "circuits",
      "children",
      "studentIssues",
      "roleAnnouncements",
      "teamMessages",
      "directMessages",
      "accessRequests",
      "studentAbsences",
      "transportTransfers",
      "transferDelays",
      "studentMedical",
      "studentSensitive",
      "smsAlerts",
      "notifications",
      "temporarySupportAccess",
      "temporarySupportAccessLogs",
      "replacementRules",
      "leaveRequests",
      "poolTransport",
      "extraSchoolTransport",
      "vehicleRepairs",
      "anomalies",
      "loginLogs",
      "securityLogs",
      "historyLogs"
    ];
    const seenCollections = new Set();
    firestoreCollections.forEach((type) => {
      const canonical = firestoreCanonicalCollection(type);
      seenCollections.add(canonical);
      firestoreWriteCollections(canonical).forEach((collectionName) => seenCollections.add(collectionName));
    });
    [...seenCollections].forEach((type) => {
      onSnapshot(collection(db, type), (snapshot) => {
        firestoreHealth.lastSyncAt = new Date().toISOString();
        const remoteItems = snapshot.docs
          .filter((docSnap) => docSnap.id !== "__meta__")
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        if (!remoteItems.length && Array.isArray(data[type]) && data[type].length > 0) {
          return;
        }
        const canonicalType = firestoreCanonicalCollection(type);
        const targetType = canonicalType || type;
        if (!remoteItems.length) {
          data[targetType] = [];
        } else {
          data[targetType] = mergeRemoteCollection(targetType, data[targetType], remoteItems, data);
        }
        syncCollectionAliases(data);
        syncLinkedData(data);
        saveData();
        if (state.user) render();
      }, (error) => {
        firestoreHealth.errors += 1;
        console.warn(`Synchronisation ${type} indisponible.`, error);
      });
    });
    onSnapshot(doc(db, "settings", "parentContact"), (snapshot) => {
      firestoreHealth.lastSyncAt = new Date().toISOString();
      if (!snapshot.exists()) return;
      data.parentContact = { ...seed.parentContact, ...snapshot.data() };
      saveData();
      if (state.user) render();
    }, (error) => {
      firestoreHealth.errors += 1;
      console.warn("Synchronisation contact parent indisponible.", error);
    });
    onSnapshot(doc(db, "appSettings", "interfaceConfig"), (snapshot) => {
      firestoreHealth.lastSyncAt = new Date().toISOString();
      if (!snapshot.exists()) return;
      data.interfaceConfig = mergeInterfaceConfig(snapshot.data());
      saveData();
      if (state.user) render();
    }, (error) => {
      firestoreHealth.errors += 1;
      console.warn("Synchronisation personnalisation interface indisponible.", error);
    });
    onSnapshot(doc(db, "serviceStatus", "current"), (snapshot) => {
      firestoreHealth.lastSyncAt = new Date().toISOString();
      if (!snapshot.exists()) return;
      data.serviceStatus = { ...seed.serviceStatus, ...snapshot.data(), id: "current" };
      saveData();
      if (state.user) render();
    }, (error) => {
      firestoreHealth.errors += 1;
      console.warn("Synchronisation état des services indisponible.", error);
    });
  } catch (error) {
    firestoreHealth.available = false;
    firestoreHealth.errors += 1;
    console.warn("Firestore temps réel indisponible, localStorage reste actif.", error);
  }
}

function mergeRemoteCollection(type, localItems = [], remoteItems = [], source = null) {
  const merged = new Map();
  (localItems || []).forEach((item) => {
    if (item?.id) merged.set(item.id, item);
  });
  (remoteItems || []).forEach((item) => {
    if (isDeletedRecord(type, item?.id, source)) return;
    if (item?.id) merged.set(item.id, { ...(merged.get(item.id) || {}), ...item });
  });
  return Array.from(merged.values());
}

function deletedRecordSet(type, source = null) {
  return new Set(source?.deletedRecords?.[type] || []);
}

function isDeletedRecord(type, id, source = null) {
  if (!id) return false;
  if (type) return deletedRecordSet(type, source).has(id);
  return Object.values(source?.deletedRecords || {}).some((ids) => Array.isArray(ids) && ids.includes(id));
}

function filterDeletedRecords(type, items = [], source = null) {
  const deleted = deletedRecordSet(type, source);
  return (items || []).filter((item) => !deleted.has(item?.id));
}

function rememberDeletedRecord(type, id) {
  if (!type || !id) return;
  data.deletedRecords = data.deletedRecords || {};
  data.deletedRecords[type] = Array.from(new Set([...(data.deletedRecords[type] || []), id]));
}

function currentSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

function getSessionUser() {
  try {
    const session = currentSession();
    if (!session?.id) return null;
    if (session.supportAssistance === true && Number(session.assistanceExpiresAt || 0) <= Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      sessionExpiredMessage = "Accès support temporaire expiré";
      return null;
    }
    if (!session.lastActivityAt) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, lastActivityAt: Date.now() }));
    } else if (Date.now() - session.lastActivityAt > SESSION_TIMEOUT_MS) {
      localStorage.removeItem(SESSION_KEY);
      sessionExpiredMessage = "Session expirée après 2 heures d’inactivité";
      return null;
    }
    const localData = loadData();
    if (session.supportAssistance === true && session.assistanceAccessId) {
      const access = (localData.temporarySupportAccess || []).find((item) => item.id === session.assistanceAccessId);
      if (!access || ["revoked", "expired"].includes(access.status)) {
        localStorage.removeItem(SESSION_KEY);
        sessionExpiredMessage = access?.status === "revoked" ? "Accès support temporaire révoqué" : "Accès support temporaire expiré";
        return null;
      }
    }
    const user = localData.users.find((item) => item.id === session.id) || localData.parents.find((parent) => parent.id === session.id && parent.isActive !== false) || null;
    if (!user || user.isActive === false || (user.role === "admin" && user.isActive !== true)) return null;
    return user;
  } catch {
    return null;
  }
}

function saveSession(user) {
  const previous = currentSession();
  const assistance = previous?.supportAssistance === true && previous?.id === user.id ? {
    supportAssistance: true,
    assistanceAccessId: previous.assistanceAccessId || "",
    assistanceOwnerId: previous.assistanceOwnerId || user.id,
    assistanceOwnerName: previous.assistanceOwnerName || fullName(user),
    assistanceOwnerRole: previous.assistanceOwnerRole || user.role,
    assistanceSupportId: previous.assistanceSupportId || "",
    assistanceSupportName: previous.assistanceSupportName || "",
    assistanceExpiresAt: previous.assistanceExpiresAt || 0,
    sensitiveDataMasked: true
  } : {};
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: user.id,
    role: user.role,
    activeApp: state.activeApp || "",
    lastActivityAt: Date.now(),
    ...assistance
  }));
}

function saveSupportAssistanceSession(owner, supportUser, access) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: owner.id,
    role: owner.role,
    activeApp: "gts",
    lastActivityAt: Date.now(),
    supportAssistance: true,
    assistanceAccessId: access.id,
    assistanceOwnerId: owner.id,
    assistanceOwnerName: fullName(owner),
    assistanceOwnerRole: owner.role,
    assistanceSupportId: supportUser.id,
    assistanceSupportName: fullName(supportUser),
    assistanceExpiresAt: new Date(access.expiresAt).getTime(),
    sensitiveDataMasked: true
  }));
}

function isSupportAssistanceSession() {
  const session = currentSession();
  return session?.supportAssistance === true && Number(session.assistanceExpiresAt || 0) > Date.now();
}

function supportAssistanceInfo() {
  return isSupportAssistanceSession() ? currentSession() : null;
}

function supportAssistanceMutationBlocked() {
  if (!isSupportAssistanceSession()) return false;
  alert("Mode assistance support : accès en lecture seule. Aucune modification n’est autorisée.");
  return true;
}

function getSessionApp() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return ["gts", "sncb"].includes(session?.activeApp) ? session.activeApp : "";
  } catch {
    return "";
  }
}

function viewStatePayload() {
  return {
    userId: state.user?.id || "",
    role: state.user?.role || "",
    activeApp: state.activeApp || "",
    screen: state.screen || "dashboard",
    selectedChildId: state.selectedChildId || "",
    selectedType: state.selectedType || "",
    selectedId: state.selectedId || "",
    parentChildId: state.parentChildId || "",
    messagesTab: state.messagesTab || "children",
    transportGroupTab: state.transportGroupTab || "children",
    securityGroupTab: state.securityGroupTab || "users",
    settingsTab: state.settingsTab || "admin",
    accessCodesTab: state.accessCodesTab || "users",
    requestsTab: state.requestsTab || "leave",
    requestsFilter: state.requestsFilter || "all",
    savedAt: Date.now()
  };
}

function saveViewState() {
  if (!state.user) return;
  if (isSupportAssistanceSession()) return;
  localStorage.setItem(VIEW_STATE_KEY, JSON.stringify(viewStatePayload()));
}

function restoreViewState() {
  if (!state.user) return;
  try {
    const saved = JSON.parse(localStorage.getItem(VIEW_STATE_KEY));
    if (!saved || saved.userId !== state.user.id) return;
    state.activeApp = isSupportAssistanceSession() ? "gts" : ["gts", "sncb"].includes(saved.activeApp) ? saved.activeApp : state.activeApp;
    state.screen = saved.screen || state.screen;
    state.selectedChildId = saved.selectedChildId || "";
    state.selectedType = saved.selectedType || "";
    state.selectedId = saved.selectedId || "";
    state.parentChildId = saved.parentChildId || "";
    state.messagesTab = saved.messagesTab || state.messagesTab;
    state.transportGroupTab = saved.transportGroupTab || state.transportGroupTab;
    state.securityGroupTab = saved.securityGroupTab || state.securityGroupTab;
    state.settingsTab = saved.settingsTab || state.settingsTab;
    state.accessCodesTab = saved.accessCodesTab || state.accessCodesTab;
    state.requestsTab = saved.requestsTab || state.requestsTab;
    state.requestsFilter = saved.requestsFilter || state.requestsFilter;
  } catch {
    localStorage.removeItem(VIEW_STATE_KEY);
  }
}

function canChooseApplication(user = state.user) {
  return !!user && canAccessSncbApp(user);
}

function isPrimaryAdminUser(user) {
  return user?.role === "admin" && (user?.id === "admin" || user?.identifierNumber === "6183");
}

function isSpwAccount(user = state.user) {
  return user?.role === "admin" && user?.visualTheme === "spw";
}

function isTransportManagerUser(user = state.user) {
  return user?.role === "admin" && !isPrimaryAdminUser(user) && !isSpwAccount(user);
}

function canManageAssistantAccounts(user = state.user) {
  return isSpwAccount(user);
}

function canAccessSncbApp(user = state.user) {
  if (!user) return false;
  if (isTransportManagerUser(user)) return true;
  if (user.role !== "driver") return false;
  const driver = data.drivers.find((item) => item.id === user.id) || {};
  return user.hasSncbReplacementAccess === true || driver.hasSncbReplacementAccess === true;
}

function canAccessRequestsModule() {
  if (isPrimaryAdmin()) return false;
  if (usesSpwIdentity() || state.user?.role === "assistant" || state.user?.role === "parent") return false;
  return state.user?.role === "driver" || isTransportManagerUser() || isSupport();
}

function chooseApplication(app) {
  if (app === "sncb" && !canAccessSncbApp()) return;
  state.activeApp = app === "sncb" ? "sncb" : "gts";
  saveSession(state.user);
  resetViewState();
  render();
}

function notificationPreferences() {
  return {
    enabled: state.user?.notificationsEnabled !== false,
    sound: state.user?.notificationSoundEnabled !== false
  };
}

function seenNotificationKeys() {
  try {
    const all = JSON.parse(localStorage.getItem(NOTIFICATION_SEEN_KEY)) || {};
    return new Set(all[state.user?.id] || []);
  } catch {
    return new Set();
  }
}

function saveSeenNotificationKeys(keys) {
  try {
    const all = JSON.parse(localStorage.getItem(NOTIFICATION_SEEN_KEY)) || {};
    all[state.user.id] = [...keys].slice(-300);
    localStorage.setItem(NOTIFICATION_SEEN_KEY, JSON.stringify(all));
  } catch {}
}

function derivedNotifications() {
  if (!state.user || !notificationPreferences().enabled) return [];
  const notifications = [];
  const add = (item) => notifications.push({
    id: `${state.user.id}-${item.type}-${item.key}`,
    userId: state.user.id,
    role: state.user.role,
    read: false,
    createdAt: item.createdAt || new Date().toISOString(),
    link: item.link || "dashboard",
    ...item
  });

  dashboardRecentMessages().filter((message) => message.unread).slice(0, 6).forEach((message) => {
    add({
      type: message.authorRole === "support" ? "support_message" : message.circuitName ? "team_or_private_message" : "message",
      key: `${message.authorName}-${message.createdAt}-${message.preview || message.subject}`,
      title: message.subject || "Nouveau message",
      message: message.preview || "Message reçu",
      icon: "✉",
      createdAt: message.createdAt,
      link: "messages"
    });
  });

  visibleParentRequests("pending").forEach((request) => {
    add({
      type: "parent_request",
      key: request.id,
      title: "Demande parent en attente",
      message: `${request.childName || "Élève"} - ${request.fieldChanged || "modification"}`,
      icon: "!",
      createdAt: request.createdAt,
      link: "dashboard"
    });
  });

  outOfServiceVehiclesForCurrentUser().filter((vehicle) => !vehicleOutOfServiceReadEntry(vehicle)).forEach((vehicle) => {
    add({
      type: "vehicle_out_of_service",
      key: `${vehicle.id}-${vehicle.outOfServiceUpdatedAt || vehicle.outOfServiceStartDate}`,
      title: "Véhicule hors service",
      message: `Bus ${vehicle.busNumber || "non renseigné"} - circuit ${vehicleCircuitLabel(vehicle)}`,
      icon: "▰",
      createdAt: vehicle.outOfServiceUpdatedAt || vehicle.outOfServiceStartDate,
      link: "vehicles"
    });
  });

  resolvedOutOfServiceVehiclesForCurrentUser().forEach((vehicle) => {
    add({
      type: "vehicle_service_resumed",
      key: `${vehicle.id}-${vehicle.outOfServiceResolvedAt}`,
      title: "Reprise de service",
      message: `Bus ${vehicle.busNumber || "non renseigné"} à nouveau en service - circuit ${vehicleCircuitLabel(vehicle)}`,
      icon: "✓",
      createdAt: vehicle.outOfServiceResolvedAt,
      link: state.user.role === "parent" ? "dashboard" : "vehicles"
    });
  });

  visibleChildren().filter((child) => child.exclusionType).forEach((child) => {
    add({
      type: "student_exclusion",
      key: `${child.id}-${child.exclusionType}-${child.exclusionStartDate}-${child.exclusionEndDate}`,
      title: "Exclusion élève",
      message: `${fullName(child)} - ${child.exclusionType}`,
      icon: "!",
      createdAt: child.updatedAt || new Date().toISOString(),
      link: "children"
    });
  });

  visibleStudentIssuesForCurrentUser().filter((issue) => issue.status !== "resolved" && !issue.readBy?.includes(state.user.id)).forEach((issue) => {
    add({
      type: "student_issue",
      key: `${issue.id}-${issue.updatedAt || issue.createdAt}`,
      entityId: issue.childId,
      title: issue.importance === "urgent" ? "Problème élève urgent" : "Problème élève signalé",
      message: `${issue.childName || "Élève"} - ${studentIssueTypeLabel(issue.type)}`,
      icon: issue.importance === "urgent" ? "!" : "•",
      createdAt: issue.updatedAt || issue.createdAt,
      link: "children"
    });
  });

  if (!isSupport()) {
    replacementRulesForCurrentUser().filter((rule) => !replacementRuleReadEntry(rule)).forEach((rule) => {
      add({
        type: "replacement_rule",
        key: `${rule.id}-${rule.updatedAt || rule.createdAt}`,
        entityId: rule.id,
        title: "Circuit remplacé",
        message: `${rule.inactiveCircuitId || "Circuit"} remplacé par ${rule.primaryReplacementCircuitId || "circuit non renseigné"}`,
        icon: "⇄",
        createdAt: rule.updatedAt || rule.createdAt,
        link: "replacementRules"
      });
    });
  }

  const service = currentServiceStatus();
  if (service.status !== "operational") {
    add({
      type: "service_status",
      key: `${service.status}-${service.updatedAt}`,
      title: service.status === "incident" ? "Incident service" : "Perturbation service",
      message: service.message,
      icon: service.status === "incident" ? "!" : "•",
      createdAt: service.updatedAt,
      link: "dashboard"
    });
  }

  if (state.user?.role === "driver") {
    (data.leaveRequests || [])
      .filter((request) => request.createdBy === state.user.id && ["accepted", "rejected"].includes(request.status) && !request.readBy?.includes(state.user.id))
      .forEach((request) => add({
        type: "leave_status",
        key: `${request.id}-${request.status}`,
        title: request.status === "accepted" ? "Congé accepté" : "Congé refusé",
        message: `${formatDateOnly(request.startDate) || ""} - ${formatDateOnly(request.endDate) || ""}`,
        icon: request.status === "accepted" ? "✓" : "!",
        createdAt: request.updatedAt || request.createdAt,
        link: "requests"
      }));
  }

  if ((isAdmin() && !isPrimaryAdmin()) || isSupport()) {
    (data.accessRequests || []).filter((request) => request.status === "pending").forEach((request) => {
      add({
        type: "access_request",
        key: request.id,
        title: "Nouvelle demande d’accès",
        message: `${fullName(request)} - ${roleLabel(request.requestedRole)}`,
        icon: "+",
        createdAt: request.createdAt,
        link: isSupport() ? "dashboard" : "settings"
      });
    });
  }

  return notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function currentUnreadNotifications() {
  const seen = seenNotificationKeys();
  return derivedNotifications().filter((notification) => !seen.has(notification.id));
}

function notificationToast() {
  const items = currentUnreadNotifications();
  if (!items.length) return "";
  const notification = items[0];
  return `<aside class="notification-toast" data-notification-link="${esc(notification.link || "dashboard")}">
    <div class="notification-icon">${esc(notification.icon || "•")}</div>
    <div>
      <strong>${esc(notification.title)}</strong>
      <p>${esc(notification.message)}</p>
      <small>${esc(formatDateTime(notification.createdAt))}</small>
    </div>
    <b>${esc(items.length)}</b>
    <button class="icon-button" type="button" data-dismiss-notifications aria-label="Fermer notification">×</button>
  </aside>`;
}

function sessionLooksValidForHealth() {
  if (!state.user) return true;
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return !!session?.user && Date.now() - Number(session.lastActivityAt || 0) <= SESSION_TIMEOUT_MS;
  } catch {
    return false;
  }
}

async function runServiceHealthCheck(options = {}) {
  const startedAt = performance.now();
  const now = new Date().toISOString();
  const checks = {
    internet: navigator.onLine !== false,
    firebase: false,
    firestore: false,
    sync: false,
    data: Array.isArray(data.children) && Array.isArray(data.users),
    messaging: typeof data.messages === "object" && typeof data.supportMessages === "object",
    session: sessionLooksValidForHealth()
  };
  try {
    const { db } = await import("./src/firebaseConfig.js");
    checks.firebase = !!db;
    checks.firestore = !!db;
  } catch {
    checks.firebase = false;
    checks.firestore = false;
  }
  const lastSyncMs = firestoreHealth.lastSyncAt ? Date.now() - new Date(firestoreHealth.lastSyncAt).getTime() : Infinity;
  checks.sync = checks.firestore && firestoreHealth.available && lastSyncMs < 90 * 1000 && firestoreHealth.errors < 8;
  const elapsed = performance.now() - startedAt;
  let status = "operational";
  let message = "Tous les services fonctionnent normalement";
  if (!checks.internet) {
    status = "incident";
    message = "Connexion internet indisponible.";
  } else if (!checks.firebase || !checks.firestore) {
    status = "incident";
    message = "Firebase ou Firestore est inaccessible.";
  } else if (!checks.data || !checks.messaging || !checks.session) {
    status = "incident";
    message = "Un service essentiel de l’application est indisponible.";
  } else if (!checks.sync || elapsed > 2500 || firestoreHealth.errors > 0) {
    status = "degraded";
    message = !checks.sync ? "Synchronisation Firestore partielle ou en attente." : "Certaines fonctions peuvent être ralenties.";
  }
  serviceHealth = { status, message, updatedAt: now, checks };
  data.serviceStatus = { ...seed.serviceStatus, ...(data.serviceStatus || {}), id: "current", lastCheckedAt: now };
  saveData();
  if (!options.silent && state.user) render();
  return serviceHealth;
}

function startServiceHealthMonitoring() {
  return;
}

function currentServiceStatus() {
  const saved = { ...seed.serviceStatus, ...(data.serviceStatus || {}) };
  const status = { ...saved, autoMode: false };
  if (!["operational", "degraded", "incident"].includes(status.status)) status.status = "operational";
  status.message = status.message || serviceStatusMeta(status.status).message;
  status.updatedAt = status.updatedAt || new Date().toISOString();
  return status;
}

function serviceStatusMeta(status) {
  return {
    operational: { label: "Tout fonctionne", short: "Tous les services fonctionnent normalement", message: "Application opérationnelle, synchronisation active, messagerie active.", icon: "●", className: "ok" },
    degraded: { label: "Perturbation", short: "Certaines fonctions peuvent être ralenties", message: "Synchronisation partielle ou problème mineur en cours.", icon: "●", className: "warning" },
    incident: { label: "Incident", short: "Un service est actuellement indisponible", message: "Problème important ou maintenance en cours.", icon: "●", className: "danger" }
  }[status] || { label: "Tout fonctionne", short: "Tous les services fonctionnent normalement", message: "", icon: "●", className: "ok" };
}

function serviceStatusHeaderBadge() {
  const status = currentServiceStatus();
  const meta = serviceStatusMeta(status.status);
  return `<span class="service-status-badge ${esc(meta.className)}" title="${esc(status.message)}"><b>${esc(meta.icon)}</b>${esc(meta.label)}</span>`;
}

function serviceStatusDashboardCard() {
  const status = currentServiceStatus();
  const meta = serviceStatusMeta(status.status);
  return `<article class="service-status-card ${esc(meta.className)}">
    <div>
      <p class="eyebrow">État des services</p>
      <h3><span>${esc(meta.icon)}</span> ${esc(status.message || meta.short)}</h3>
      <p>${esc(meta.message)}</p>
      <small>${status.autoMode === false ? "Dernière mise à jour" : "Dernière vérification"} : ${esc(formatDateTime(status.lastCheckedAt || status.updatedAt))}</small>
    </div>
    <b class="badge ${esc(meta.className)}">${esc(meta.label)}</b>
  </article>`;
}

function technicalErrorCount() {
  const failedLogins = (data.loginLogs || []).filter((log) => log.loginStatus && !["réussie", "reussie"].includes(log.loginStatus)).length;
  const failedSecurity = (data.securityLogs || []).filter((log) => ["failed", "blocked", "error"].includes(log.status)).length;
  return failedLogins + failedSecurity + Number(firestoreHealth.errors || 0);
}

function firestoreStatusLabel() {
  if (firestoreHealth.available) return `Synchronisation active${firestoreHealth.lastSyncAt ? ` - ${formatDateTime(firestoreHealth.lastSyncAt)}` : ""}`;
  return firestoreHealth.errors ? "Synchronisation dégradée" : "Statut en attente";
}

function primaryAdminDashboard() {
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Supervision</p><h2>Supervision technique</h2></div>
    ${serviceStatusDashboardCard()}
    <div class="metric-grid">
      ${metric("Total élèves", (data.children || []).length)}
      ${metric("Total chauffeurs", (data.drivers || []).length)}
      ${metric("Total convoyeuses", (data.assistants || []).length)}
      ${metric("Total parents", (data.parents || []).length)}
      ${metric("Total circuits", (data.circuits || []).length)}
      ${metric("Erreurs techniques", technicalErrorCount())}
    </div>
    <article class="info-card">
      <h3>Statut technique</h3>
      ${sectionRows([
        ["Firebase / Firestore", firestoreStatusLabel()],
        ["Messagerie locale", typeof data.messages === "object" && typeof data.supportMessages === "object" ? "active" : "dégradée"],
        ["Version application", "gts-mobile"],
        ["Stockage fichiers", "désactivé"],
        ["Données affichées", "statistiques anonymisées uniquement"]
      ])}
    </article>
  </section>`;
}

function processNotifications() {
  if (!state.user || !notificationPreferences().enabled) return;
  const notifications = currentUnreadNotifications();
  const signature = notifications.map((notification) => notification.id).join("|");
  if (!notifications.length || signature === lastNotificationSignature) return;
  lastNotificationSignature = signature;
  const notification = notifications[0];
  data.notifications = data.notifications || [];
  if (!data.notifications.some((item) => item.id === notification.id)) {
    data.notifications.unshift(notification);
    data.notifications = data.notifications.slice(0, 300);
    saveData();
    saveNotificationToFirestore(notification);
  }
  if (notificationPreferences().sound) playNotificationSound();
}

function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);
    gain.connect(context.destination);
    [660, 880].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, context.currentTime + index * 0.075);
      oscillator.connect(gain);
      oscillator.start(context.currentTime + index * 0.075);
      oscillator.stop(context.currentTime + 0.18 + index * 0.075);
    });
    setTimeout(() => context.close?.(), 450);
  } catch {}
}

function saveNotificationPreference(key, value) {
  if (!state.user) return;
  const collection = state.user.role === "parent" ? "parents" : "users";
  const record = data[collection].find((item) => item.id === state.user.id);
  if (!record) return;
  record[key] = value;
  record.updatedAt = new Date().toISOString();
  state.user = record;
  saveSession(record);
  saveData();
  saveCollectionItemToFirestore(collection, record);
  render();
}

function markCurrentNotificationsSeen() {
  if (!state.user) return;
  const seen = seenNotificationKeys();
  currentUnreadNotifications().forEach((notification) => {
    seen.add(notification.id);
    if (notification.type === "replacement_rule" && notification.entityId) {
      acknowledgeReplacementRule(notification.entityId, { silent: true });
    }
  });
  saveSeenNotificationKeys(seen);
  lastNotificationSignature = "";
}

function updateSessionActivity() {
  if (!state.user) return;
  try {
    const session = currentSession();
    if (!session?.id) return;
    if (session.supportAssistance === true && Number(session.assistanceExpiresAt || 0) <= Date.now()) {
      expireSession("Accès support temporaire expiré");
      return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, role: state.user.role, activeApp: state.activeApp || session.activeApp || "", lastActivityAt: Date.now() }));
  } catch {}
}

function checkSessionInactivity() {
  if (!state.user) return false;
  try {
    const session = currentSession();
    if (!session?.id) return false;
    if (session.supportAssistance === true && Number(session.assistanceExpiresAt || 0) <= Date.now()) {
      expireSession("Accès support temporaire expiré");
      return true;
    }
    if (Date.now() - (session.lastActivityAt || 0) <= SESSION_TIMEOUT_MS) return false;
    expireSession();
    return true;
  } catch {
    return false;
  }
}

function expireSession(message = "Session expirée après 2 heures d’inactivité") {
  localStorage.removeItem(SESSION_KEY);
  resetViewState();
  state.user = null;
  renderLogin(message);
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function fullName(item) {
  return [item?.firstName, item?.lastName].filter(Boolean).join(" ") || "Non renseigné";
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function roleLabel(role) {
  return { admin: "Gestionnaire de transport", driver: "Chauffeur", assistant: "Convoyeuse", parent: "Parent", support: "Support" }[role] || "Utilisateur";
}

function accountRoleLabel(user = {}) {
  if (isPrimaryAdminUser(user)) return "Administrateur système";
  if (isSpwAccount(user)) return "SPW";
  if (isTransportManagerUser(user)) return "Gestionnaire de transport";
  return roleLabel(user.role);
}

const translateLanguageMap = {
  fr: "fr",
  "fr-fr": "fr",
  "fr-be": "fr",
  nl: "nl",
  "nl-nl": "nl",
  "nl-be": "nl",
  en: "en",
  "en-gb": "en",
  "en-us": "en",
  ar: "ar",
  it: "it",
  es: "es",
  pt: "pt",
  tr: "tr",
  ro: "ro",
  pl: "pl"
};

function currentTranslateLanguage() {
  const raw = String(
    state.user?.languagePreference ||
    state.user?.preferredLanguage ||
    state.user?.parentLanguage ||
    state.user?.locale ||
    navigator.language ||
    "fr"
  ).toLowerCase();
  return translateLanguageMap[raw] || translateLanguageMap[raw.split("-")[0]] || "fr";
}

function googleTranslateUrl(text = "") {
  const value = String(text || "").trim();
  const params = new URLSearchParams({
    sl: "auto",
    tl: currentTranslateLanguage(),
    op: "translate",
    text: value
  });
  return `https://translate.google.com/?${params.toString()}`;
}

function translateMessageButton(text = "") {
  const value = String(text || "").trim();
  if (!value) return "";
  return `<a class="translate-message-button" href="${esc(googleTranslateUrl(value))}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" title="Ouvrir dans Google Traduction">⇄ Traduire</a>`;
}

function currentParentLanguage() {
  return "fr";
}

function parentT(key) {
  const language = currentParentLanguage();
  return parentTranslations[language]?.[key] || parentTranslations.fr[key] || key;
}

function applyParentLanguageDirection() {
  document.documentElement.lang = "fr";
  document.documentElement.dir = "ltr";
}

function visibleChildren() {
  if (!state.user) return [];
  if (isPrimaryAdmin()) return [];
  if (state.user.role === "parent") {
    const linked = new Set(state.user.linkedChildrenIds || []);
    return data.children.filter((child) => linked.has(child.id) || (child.parentIds || []).includes(state.user.id));
  }
  if (state.user.role === "admin") {
    if (!state.activeFilter) return data.children;
    return relatedSetForFilter().children;
  }
  return data.children.filter((child) => userCanAccessChildByTransport(state.user, child));
}

function userCanAccessChildByTransport(user, child) {
  if (!user || !child) return false;
  const allowed = new Set(user.assignedCircuits || []);
  const childCircuitRefs = [
    child.circuitNumber,
    child.pickupCircuitId,
    child.schoolCircuitId,
    child.morningCircuit,
    child.returnCircuit,
    childPickupCircuitLabel(child),
    childSchoolCircuitLabel(child)
  ].filter(Boolean);
  const matchesCircuit = childCircuitRefs.some((ref) => allowed.has(ref));
  const matchesDirectRole = (user.role === "driver" && child.driverId === user.id)
    || (user.role === "assistant" && child.assistantId === user.id);
  return matchesCircuit || matchesDirectRole;
}

function visibleCollection(type) {
  if (type === "children") return visibleChildren();
  if (!state.user) return [];
  if (isPrimaryAdmin()) return [];
  if (state.user.role === "parent") return [];
  if (state.user.role === "admin") {
    if (!state.activeFilter) return data[type] || [];
    return relatedSetForFilter()[type] || [];
  }
  const allowed = userCircuitNames();
  const circuits = scopedCircuits();
  const circuitDrivers = circuits.map((circuit) => driverByRef(circuit.driverId)).filter(Boolean);
  const circuitDriverIds = new Set(circuitDrivers.map((driver) => driver.id).filter(Boolean));
  const circuitAssistantIds = new Set(circuits.map((circuit) => circuit.assistantId).filter(Boolean));
  const circuitVehicleIds = new Set(circuits.map((circuit) => circuit.vehicleId).filter(Boolean));
  const circuitSchools = new Set(circuits.map((circuit) => circuit.schoolName).filter(Boolean));
  const childSchools = new Set(visibleChildren().map((child) => child.schoolName));
  const linkedVehicles = (data.vehicles || []).filter((item) =>
    circuitVehicleIds.has(item.id) ||
    allowed.has(item.circuitId) ||
    item.driverId === state.user.id ||
    item.assistantId === state.user.id
  );
  linkedVehicles.forEach((vehicle) => {
    const vehicleDriver = driverByRef(vehicle.driverId);
    if (vehicleDriver) circuitDriverIds.add(vehicleDriver.id);
    if (vehicle.assistantId) circuitAssistantIds.add(vehicle.assistantId);
  });
  if (type === "drivers") return (data.drivers || []).filter((item) => item.id === state.user.id || circuitDriverIds.has(item.id) || allowed.has(item.schoolCircuit));
  if (type === "assistants") return (data.assistants || []).filter((item) =>
    item.id === state.user.id ||
    circuitAssistantIds.has(item.id) ||
    allowed.has(item.schoolCircuit) ||
    (item.assignedCircuits || []).some((name) => allowed.has(name))
  );
  if (type === "circuits") return circuits;
  if (type === "vehicles") return linkedVehicles;
  if (type === "schools") return (data.schools || []).filter((item) => childSchools.has(item.name) || circuitSchools.has(item.name));
  return [];
}

function childVisibleFromCurrentContext(childId) {
  const visible = visibleChildren().find((item) => item.id === childId);
  if (visible) return visible;
  if (["driver", "assistant"].includes(state.user?.role)) {
    return (data.children || []).find((child) => child.id === childId) || null;
  }
  return null;
}

function userCircuitNames() {
  return new Set(state.user?.assignedCircuits || []);
}

function scopedCircuits() {
  const allowed = userCircuitNames();
  return (data.circuits || []).filter((circuit) => allowed.has(circuit.name));
}

function relatedSetForFilter() {
  if (!state.activeFilter) return data;
  const filter = state.activeFilter;
  const selected = (data[filter.type] || []).find((item) => item.id === filter.id);
  if (!selected) return data;

  let children = [];
  if (filter.type === "children") {
    children = [selected];
  } else if (filter.type === "drivers") {
    const driverCircuits = data.circuits.filter((circuit) => circuit.driverId === selected.id || circuit.name === selected.schoolCircuit);
    const driverCircuitNames = new Set(driverCircuits.map((circuit) => circuit.name));
    children = data.children.filter((child) => driverCircuitNames.has(child.circuitNumber));
  } else if (filter.type === "assistants") {
    const assistantCircuits = data.circuits.filter((circuit) => circuit.assistantId === selected.id || circuit.name === selected.schoolCircuit);
    const assistantCircuitNames = new Set(assistantCircuits.map((circuit) => circuit.name));
    children = data.children.filter((child) => assistantCircuitNames.has(child.circuitNumber));
  } else if (filter.type === "vehicles") {
    const vehicleCircuits = data.circuits.filter((circuit) => circuit.vehicleId === selected.id || circuit.name === selected.circuitId || circuit.id === selected.circuitId);
    const vehicleCircuitNames = new Set(vehicleCircuits.map((circuit) => circuit.name));
    children = data.children.filter((child) => child.transferVehicleId === selected.busNumber || vehicleCircuitNames.has(child.circuitNumber));
  } else if (filter.type === "circuits") {
    children = data.children.filter((child) => child.circuitNumber === selected.name || childPickupCircuitLabel(child) === selected.name || childSchoolCircuitLabel(child) === selected.name || child.morningCircuit?.includes(selected.name) || child.returnCircuit?.includes(selected.name));
  } else if (filter.type === "schools") {
    children = data.children.filter((child) => child.schoolName === selected.name);
  }

  const circuitNames = new Set(children.map((child) => child.circuitNumber).filter(Boolean));
  if (filter.type === "circuits") circuitNames.add(selected.name);
  if (filter.type === "vehicles" && selected.circuitId) circuitNames.add(selected.circuitId);
  const schoolNames = new Set(children.map((child) => child.schoolName).filter(Boolean));
  if (filter.type === "schools") schoolNames.add(selected.name);

  const circuits = data.circuits.filter((circuit) => circuitNames.has(circuit.name) || schoolNames.has(circuit.schoolName) || circuit.id === selected.circuitId);
  circuits.forEach((circuit) => {
    circuitNames.add(circuit.name);
    if (circuit.schoolName) schoolNames.add(circuit.schoolName);
  });

  const driverIds = new Set(circuits.map((circuit) => circuit.driverId).filter(Boolean));
  const assistantIds = new Set(circuits.map((circuit) => circuit.assistantId).filter(Boolean));
  const vehicleIds = new Set(circuits.map((circuit) => circuit.vehicleId).filter(Boolean));
  if (filter.type === "drivers") driverIds.add(selected.id);
  if (filter.type === "assistants") assistantIds.add(selected.id);
  if (filter.type === "vehicles") vehicleIds.add(selected.id);

  return {
    ...data,
    children,
    circuits,
    drivers: data.drivers.filter((driver) => driverIds.has(driver.id) || circuitNames.has(driver.schoolCircuit) || schoolNames.has(driver.schoolName)),
    assistants: data.assistants.filter((assistant) => assistantIds.has(assistant.id) || circuitNames.has(assistant.schoolCircuit)),
    vehicles: data.vehicles.filter((vehicle) => vehicleIds.has(vehicle.id) || circuitNames.has(vehicle.circuitId) || schoolNames.has(vehicle.schoolName)),
    schools: data.schools.filter((school) => schoolNames.has(school.name))
  };
}

function isAdmin() {
  return state.user?.role === "admin";
}

function isPrimaryAdmin() {
  return isPrimaryAdminUser(state.user);
}

function canManageVehicleOutOfService() {
  return isTransportManagerUser();
}

function isParent() {
  return state.user?.role === "parent";
}

function isSupport() {
  return state.user?.role === "support";
}

function canAccessSupportCenter() {
  return !!state.user && ["admin", "driver", "assistant", "support"].includes(state.user.role);
}

function canPrintAccessCard() {
  if (isSupportAssistanceSession()) return false;
  return (isAdmin() && !isPrimaryAdmin()) || isSupport();
}

function parseDateOnly(value) {
  const raw = String(value || "").trim();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const [, year, month, day] = iso;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const local = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (local) {
    const [, day, month, year] = local;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return null;
}

function formatDateOnly(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const date = parseDateOnly(raw);
  if (!date || Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isDateOnlyValue(value) {
  return /^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/.test(String(value || "").trim());
}

function displayValue(value) {
  if (isDateOnlyValue(value)) return formatDateOnly(value);
  return value;
}

function formatDateRange(start, end) {
  return [formatDateOnly(start), end ? `fin ${formatDateOnly(end)}` : ""].filter(Boolean).join(" - ");
}

function age(birthDate) {
  const date = parseDateOnly(birthDate) || new Date(birthDate);
  if (!birthDate || Number.isNaN(date.getTime())) return "Non renseigné";
  const today = new Date();
  let years = today.getFullYear() - date.getFullYear();
  if (today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())) years -= 1;
  return `${years} ans`;
}

function updateComputedAgeField() {
  const birthDate = document.querySelector("#child-form [name='birthDate']");
  const computedAge = document.querySelector("#child-form [name='computedAge']");
  if (birthDate && computedAge) computedAge.value = age(birthDate.value);
}

async function updateTecStopAutocomplete(input) {
  const query = normalizeTextSearch(input.value);
  const suggestions = input.parentElement?.querySelector("[data-tec-stop-suggestions]");
  input.removeAttribute("list");
  if (!suggestions) return;
  if (query.length < 3) {
    suggestions.innerHTML = "";
    suggestions.hidden = true;
    return;
  }
  const matches = await tecStopSuggestions(input.value);
  if (!document.body.contains(input) || normalizeTextSearch(input.value) !== query) return;
  suggestions.innerHTML = matches.length
    ? matches.map(({ label, stop }) => `<button type="button" data-tec-stop-value="${esc(label)}"><strong>${esc(stop.name)}</strong><span>${esc([stop.city, stop.stop_id].filter(Boolean).join(" - "))}</span></button>`).join("")
    : `<p class="muted">Aucun arrêt trouvé.</p>`;
  suggestions.hidden = false;
  suggestions.querySelectorAll("[data-tec-stop-value]").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.tecStopValue || "";
      suggestions.innerHTML = "";
      suggestions.hidden = true;
      input.focus();
    });
  });
}

async function loadLocalTecStopsDataset() {
  if (!tecStopsDatasetPromise) {
    tecStopsDatasetPromise = fetch("/data/tec-stops.json")
      .then((response) => response.ok ? response.json() : [])
      .catch((error) => {
        console.warn("Base locale TEC indisponible, saisie manuelle conservée.", error);
        return [];
      });
  }
  return tecStopsDatasetPromise;
}

function filterTecStops(stops = [], value = "") {
  const query = normalizeTextSearch(value);
  if (query.length < 3) return [];
  return (stops || [])
    .map((stop) => ({ stop: normalizeTecStop(stop), label: tecStopDisplay(stop) }))
    .filter(({ stop, label }) => normalizeTextSearch([stop.name, stop.stop_name, stop.city, stop.stop_id, stop.code, label].join(" ")).includes(query))
    .slice(0, 80);
}

async function tecStopSuggestions(value = "") {
  const seedMatches = filterTecStops(data.tecStops || [], value);
  const localDataset = await loadLocalTecStopsDataset();
  const localMatches = filterTecStops(localDataset, value);
  const merged = new Map([...localMatches, ...seedMatches].map((entry) => [entry.stop.id || entry.label, entry]));
  return Array.from(merged.values()).slice(0, 80);
}

function bindTecStopAutocomplete() {
  document.querySelectorAll("[data-tec-stop-input]").forEach((input) => {
    input.addEventListener("input", () => updateTecStopAutocomplete(input));
    input.addEventListener("blur", () => {
      const suggestions = input.parentElement?.querySelector("[data-tec-stop-suggestions]");
      if (suggestions) setTimeout(() => { suggestions.hidden = true; }, 160);
    });
    input.addEventListener("focus", () => updateTecStopAutocomplete(input));
  });
}

function formatNominatimAddress(result = {}) {
  const address = result.address || {};
  const road = address.road || address.pedestrian || address.footway || address.cycleway || address.path || address.neighbourhood || "";
  const city = address.city || address.town || address.village || address.municipality || address.county || "";
  const postalCode = address.postcode || "";
  const country = address.country || "Belgique";
  const label = [road, [postalCode, city].filter(Boolean).join(" "), country].filter(Boolean).join(", ");
  return label || result.display_name || "";
}

function normalizeBelgianAddress(address = {}) {
  const street = address.street || address.road || address.name || "";
  const city = address.city || address.commune || address.town || address.village || "";
  const postalCode = address.postalCode || address.postcode || address.zip || "";
  const country = address.country || "Belgique";
  const id = address.id || [street, postalCode, city]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return {
    id,
    street,
    postalCode,
    city,
    country,
    searchName: address.searchName || normalizeTextSearch([street, postalCode, city, country].filter(Boolean).join(" "))
  };
}

function splitStreetAndNumber(address = "") {
  const value = String(address || "").trim();
  const match = value.match(/^(.+?)\s+(\d+[A-Za-z]?(?:\/\d+)?)$/);
  return match ? { street: match[1].trim(), number: match[2].trim() } : { street: value, number: "" };
}

function syncStructuredChildAddress(child = {}) {
  const fallback = splitStreetAndNumber(child.homeAddress || "");
  child.streetName = child.streetName || child.street || fallback.street || "";
  child.streetNumber = child.streetNumber || child.houseNumber || fallback.number || "";
  child.street = child.street || child.streetName || "";
  child.houseNumber = child.houseNumber || child.streetNumber || "";
  child.postalCode = child.postalCode || "";
  child.city = child.city || "";
  child.homeAddress = [child.streetName, child.streetNumber].filter(Boolean).join(" ") || child.homeAddress || "";
  return child;
}

function belgianAddressDisplay(address = {}) {
  const normalized = normalizeBelgianAddress(address);
  return [
    normalized.street,
    [normalized.postalCode, normalized.city].filter(Boolean).join(" "),
    normalized.country
  ].filter(Boolean).join(", ");
}

function localBelgianAddressSuggestions(query) {
  const normalizedQuery = normalizeTextSearch(query);
  if (normalizedQuery.length < 3) return [];
  return uniqueText([...(data.walloniaAddresses || []), ...(data.belgianAddresses || [])]
    .map((address) => ({ normalized: normalizeBelgianAddress(address), label: belgianAddressDisplay(address) }))
    .filter(({ normalized, label }) => normalizeTextSearch([
      normalized.street,
      normalized.postalCode,
      normalized.city,
      normalized.country,
      label
    ].join(" ")).includes(normalizedQuery))
    .map(({ label }) => label)
    .filter(Boolean))
    .slice(0, 80);
}

async function loadWalloniaAddressesDataset() {
  if (!walloniaAddressesDatasetPromise) {
    walloniaAddressesDatasetPromise = fetch("/data/wallonia-addresses.json")
      .then((response) => response.ok ? response.json() : [])
      .catch(() => []);
  }
  return walloniaAddressesDatasetPromise;
}

async function localWalloniaAddressSuggestions(query) {
  const normalizedQuery = normalizeTextSearch(query);
  if (normalizedQuery.length < 3) return [];
  const addresses = await loadWalloniaAddressesDataset();
  return uniqueText((addresses || [])
    .map((address) => ({ normalized: normalizeBelgianAddress(address), label: belgianAddressDisplay(address) }))
    .filter(({ normalized, label }) => normalizeTextSearch([
      normalized.street,
      normalized.postalCode,
      normalized.city,
      normalized.country,
      label
    ].join(" ")).includes(normalizedQuery))
    .map(({ label }) => label)
    .filter(Boolean))
    .slice(0, 80);
}

function postalCodeDisplay(address = {}) {
  const normalized = normalizeBelgianAddress(address);
  return [normalized.postalCode, normalized.city].filter(Boolean).join(" ");
}

function postalCodeSuggestionsFromAddresses(addresses = [], query = "") {
  const digits = String(query || "").replace(/\D/g, "");
  if (digits.length < 2) return [];
  const suggestions = new Map();
  (addresses || []).forEach((address) => {
    const normalized = normalizeBelgianAddress(address);
    if (!normalized.postalCode || !normalized.city) return;
    if (!String(normalized.postalCode).startsWith(digits)) return;
    const label = postalCodeDisplay(normalized);
    if (label) suggestions.set(`${normalized.postalCode}-${normalizeTextSearch(normalized.city)}`, label);
  });
  return Array.from(suggestions.values())
    .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }))
    .slice(0, 80);
}

function citySuggestionsFromAddresses(addresses = [], query = "") {
  const normalizedQuery = normalizeTextSearch(query);
  if (normalizedQuery.length < 2) return [];
  const suggestions = new Map();
  (addresses || []).forEach((address) => {
    const normalized = normalizeBelgianAddress(address);
    if (!normalized.postalCode || !normalized.city) return;
    if (!normalizeTextSearch(normalized.city).includes(normalizedQuery)) return;
    const label = [normalized.city, normalized.postalCode].filter(Boolean).join(" ");
    suggestions.set(`${normalizeTextSearch(normalized.city)}-${normalized.postalCode}`, label);
  });
  return Array.from(suggestions.values())
    .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }))
    .slice(0, 80);
}

async function fetchPostalCodeSuggestions(query) {
  const digits = String(query || "").replace(/\D/g, "");
  if (digits.length < 2) return [];
  if (postalCodeAutocompleteCache.has(digits)) return postalCodeAutocompleteCache.get(digits);
  const walloniaAddresses = await loadWalloniaAddressesDataset();
  const suggestions = uniqueText([
    ...postalCodeSuggestionsFromAddresses(walloniaAddresses, digits),
    ...postalCodeSuggestionsFromAddresses(data.walloniaAddresses || [], digits),
    ...postalCodeSuggestionsFromAddresses(data.belgianAddresses || [], digits)
  ]).slice(0, 80);
  postalCodeAutocompleteCache.set(digits, suggestions);
  return suggestions;
}

async function fetchCitySuggestions(query) {
  const normalizedQuery = normalizeTextSearch(query);
  if (normalizedQuery.length < 2) return [];
  const cacheKey = `city:${normalizedQuery}`;
  if (postalCodeAutocompleteCache.has(cacheKey)) return postalCodeAutocompleteCache.get(cacheKey);
  const walloniaAddresses = await loadWalloniaAddressesDataset();
  const suggestions = uniqueText([
    ...citySuggestionsFromAddresses(walloniaAddresses, query),
    ...citySuggestionsFromAddresses(data.walloniaAddresses || [], query),
    ...citySuggestionsFromAddresses(data.belgianAddresses || [], query)
  ]).slice(0, 80);
  postalCodeAutocompleteCache.set(cacheKey, suggestions);
  return suggestions;
}

async function fetchBelgianAddressSuggestions(query) {
  const normalizedQuery = normalizeTextSearch(query);
  if (normalizedQuery.length < 3) return [];
  if (addressAutocompleteCache.has(normalizedQuery)) return addressAutocompleteCache.get(normalizedQuery);
  const walloniaSuggestions = await localWalloniaAddressSuggestions(query);
  const localSuggestions = uniqueText([...walloniaSuggestions, ...localBelgianAddressSuggestions(query)]).slice(0, 80);
  if (localSuggestions.length) {
    addressAutocompleteCache.set(normalizedQuery, localSuggestions);
    return localSuggestions;
  }
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "be");
  url.searchParams.set("limit", "6");
  url.searchParams.set("dedupe", "1");
  url.searchParams.set("q", query);
  try {
    const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Nominatim ${response.status}`);
    const results = await response.json();
    const suggestions = uniqueText((results || []).map(formatNominatimAddress).filter(Boolean)).slice(0, 80);
    addressAutocompleteCache.set(normalizedQuery, suggestions);
    return suggestions;
  } catch (error) {
    console.warn("Autocomplétion adresse indisponible, saisie manuelle conservée.", error);
    addressAutocompleteCache.set(normalizedQuery, []);
    return [];
  }
}

function hideAutocompletePanel(input, selector) {
  const panel = input.parentElement?.querySelector(selector);
  if (!panel) return;
  panel.innerHTML = "";
  panel.hidden = true;
}

function updateAddressSuggestions(input, suggestions = []) {
  const panel = input.parentElement?.querySelector("[data-address-suggestions]");
  if (!panel) return;
  panel.innerHTML = suggestions.length
    ? suggestions.map((suggestion) => {
      const [street = suggestion, location = ""] = String(suggestion).split(",").map((part) => part.trim());
      return `<button type="button" data-address-value="${esc(suggestion)}"><strong>${esc(street)}</strong>${location ? `<span>${esc(location)}</span>` : ""}</button>`;
    }).join("")
    : `<p class="muted">Aucune rue trouvée.</p>`;
  panel.hidden = false;
  panel.querySelectorAll("[data-address-value]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      input.value = button.dataset.addressValue || "";
      applySelectedAddressToForm(input);
      hideAutocompletePanel(input, "[data-address-suggestions]");
      input.focus();
    });
  });
}

function updatePostalCodeSuggestions(input, suggestions = []) {
  const panel = input.parentElement?.querySelector("[data-postal-code-suggestions]");
  if (!panel) return;
  panel.innerHTML = suggestions.length
    ? suggestions.map((suggestion) => {
      const [postalCode = suggestion, ...cityParts] = String(suggestion).split(" ");
      return `<button type="button" data-postal-code-value="${esc(suggestion)}"><strong>${esc(postalCode)}</strong><span>${esc(cityParts.join(" "))}</span></button>`;
    }).join("")
    : `<p class="muted">Aucun code postal trouvé.</p>`;
  panel.hidden = false;
  panel.querySelectorAll("[data-postal-code-value]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      input.value = button.dataset.postalCodeValue || "";
      applySelectedPostalCodeToForm(input);
      hideAutocompletePanel(input, "[data-postal-code-suggestions]");
      input.focus();
    });
  });
}

function updateCitySuggestions(input, suggestions = []) {
  const panel = input.parentElement?.querySelector("[data-city-suggestions]");
  if (!panel) return;
  panel.innerHTML = suggestions.length
    ? suggestions.map((suggestion) => {
      const parts = String(suggestion).split(" ");
      const postalCode = parts.pop() || "";
      const city = parts.join(" ");
      return `<button type="button" data-city-value="${esc(suggestion)}"><strong>${esc(city || suggestion)}</strong><span>${esc(postalCode)}</span></button>`;
    }).join("")
    : `<p class="muted">Aucune commune trouvée.</p>`;
  panel.hidden = false;
  panel.querySelectorAll("[data-city-value]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      input.value = button.dataset.cityValue || "";
      applySelectedCityToForm(input);
      hideAutocompletePanel(input, "[data-city-suggestions]");
      input.focus();
    });
  });
}

function applySelectedAddressToForm(input) {
  const value = input.value;
  const normalizedValue = normalizeTextSearch(value);
  const source = [
    ...(data.walloniaAddresses || []),
    ...(data.belgianAddresses || [])
  ].map(normalizeBelgianAddress);
  loadWalloniaAddressesDataset().then((dataset) => {
    const match = [...source, ...(dataset || []).map(normalizeBelgianAddress)].find((address) =>
      normalizeTextSearch(belgianAddressDisplay(address)) === normalizedValue
      || normalizeTextSearch(address.street) === normalizedValue
    );
    if (!match) return;
    const form = input.closest("form");
    if (!form) return;
    if (input.name === "streetName" || input.name.includes("alternatingResidence.")) input.value = match.street;
    if (input.name.includes("father")) {
      if (form.elements["alternatingResidence.fatherPostalCode"]) form.elements["alternatingResidence.fatherPostalCode"].value = match.postalCode || "";
      if (form.elements["alternatingResidence.fatherCity"]) form.elements["alternatingResidence.fatherCity"].value = match.city || "";
    } else if (input.name.includes("mother")) {
      if (form.elements["alternatingResidence.motherPostalCode"]) form.elements["alternatingResidence.motherPostalCode"].value = match.postalCode || "";
      if (form.elements["alternatingResidence.motherCity"]) form.elements["alternatingResidence.motherCity"].value = match.city || "";
    } else {
      const postal = form.elements.postalCode;
      const city = form.elements.city;
      if (postal && !postal.value) postal.value = match.postalCode || "";
      if (city && !city.value) city.value = match.city || "";
    }
  });
}

function cityFieldNameForPostalInput(input) {
  const name = input.name || "";
  if (name.includes("father")) return "alternatingResidence.fatherCity";
  if (name.includes("mother")) return "alternatingResidence.motherCity";
  return "city";
}

function postalFieldNameForCityInput(input) {
  const name = input.name || "";
  if (name.includes("father")) return "alternatingResidence.fatherPostalCode";
  if (name.includes("mother")) return "alternatingResidence.motherPostalCode";
  return "postalCode";
}

function applySelectedPostalCodeToForm(input) {
  const form = input.closest("form");
  if (!form) return;
  const match = String(input.value || "").trim().match(/^(\d{4})\s+(.+)$/);
  if (!match) return;
  input.value = match[1];
  const city = form.elements[cityFieldNameForPostalInput(input)];
  if (city) city.value = match[2].trim();
}

function applySelectedCityToForm(input) {
  const form = input.closest("form");
  if (!form) return;
  const match = String(input.value || "").trim().match(/^(.+)\s+(\d{4})$/);
  if (!match) return;
  input.value = match[1].trim();
  const postal = form.elements[postalFieldNameForCityInput(input)];
  if (postal) postal.value = match[2];
}

function scheduleAddressAutocomplete(input) {
  const query = input.value.trim();
  if (query.length < 3) {
    hideAutocompletePanel(input, "[data-address-suggestions]");
    return;
  }
  clearTimeout(addressAutocompleteTimers.get(input));
  addressAutocompleteTimers.set(input, setTimeout(async () => {
    if (!document.body.contains(input)) return;
    const currentQuery = input.value.trim();
    const suggestions = await fetchBelgianAddressSuggestions(currentQuery);
    if (input.value.trim() === currentQuery) updateAddressSuggestions(input, suggestions);
  }, 400));
}

function schedulePostalCodeAutocomplete(input) {
  const digits = input.value.replace(/\D/g, "");
  if (digits.length < 2) {
    hideAutocompletePanel(input, "[data-postal-code-suggestions]");
    return;
  }
  clearTimeout(addressAutocompleteTimers.get(input));
  addressAutocompleteTimers.set(input, setTimeout(async () => {
    if (!document.body.contains(input)) return;
    const currentDigits = input.value.replace(/\D/g, "");
    const suggestions = await fetchPostalCodeSuggestions(currentDigits);
    if (input.value.replace(/\D/g, "") === currentDigits) updatePostalCodeSuggestions(input, suggestions);
  }, 250));
}

function scheduleCityAutocomplete(input) {
  const query = input.value.trim();
  if (normalizeTextSearch(query).length < 2) {
    hideAutocompletePanel(input, "[data-city-suggestions]");
    return;
  }
  clearTimeout(addressAutocompleteTimers.get(input));
  addressAutocompleteTimers.set(input, setTimeout(async () => {
    if (!document.body.contains(input)) return;
    const currentQuery = input.value.trim();
    const suggestions = await fetchCitySuggestions(currentQuery);
    if (input.value.trim() === currentQuery) updateCitySuggestions(input, suggestions);
  }, 250));
}

function bindAddressAutocomplete() {
  document.querySelectorAll("[data-address-autocomplete]").forEach((input) => {
    input.addEventListener("input", () => scheduleAddressAutocomplete(input));
    input.addEventListener("change", () => applySelectedAddressToForm(input));
    input.addEventListener("blur", () => setTimeout(() => hideAutocompletePanel(input, "[data-address-suggestions]"), 180));
  });
  document.querySelectorAll("[data-postal-code-autocomplete]").forEach((input) => {
    input.addEventListener("input", () => schedulePostalCodeAutocomplete(input));
    input.addEventListener("change", () => applySelectedPostalCodeToForm(input));
    input.addEventListener("blur", () => setTimeout(() => hideAutocompletePanel(input, "[data-postal-code-suggestions]"), 180));
  });
  document.querySelectorAll("[data-city-autocomplete]").forEach((input) => {
    input.addEventListener("input", () => scheduleCityAutocomplete(input));
    input.addEventListener("change", () => applySelectedCityToForm(input));
    input.addEventListener("blur", () => setTimeout(() => hideAutocompletePanel(input, "[data-city-suggestions]"), 180));
  });
}

function normalizeMedicalHelpSheet(child = {}) {
  const sheet = child.medicalHelpSheet || {};
  return {
    disabilityType: sheet.disabilityType ?? child.medicalDisabilityType ?? "",
    disabilityForm: sheet.disabilityForm ?? child.medicalDisabilityForm ?? "",
    hasAllergies: sheet.hasAllergies ?? (child.allergies ? "oui" : "non"),
    allergiesDetails: sheet.allergiesDetails ?? child.allergies ?? "",
    hasMedicalConditions: sheet.hasMedicalConditions ?? (child.medicalConditions ? "oui" : "non"),
    medicalConditionsDetails: sheet.medicalConditionsDetails ?? child.medicalConditions ?? "",
    medicalSymptoms: sheet.medicalSymptoms ?? child.medicalSymptoms ?? "",
    symptomInstructions: sheet.symptomInstructions ?? child.medicalNotes ?? "",
    transitionObject: sheet.transitionObject ?? child.transitionObject ?? "",
    mobilityHelp: sheet.mobilityHelp ?? child.mobilityHelp ?? "",
    tripOccupation: sheet.tripOccupation ?? child.tripOccupation ?? "",
    transportSickness: sheet.transportSickness ?? child.transportSickness ?? "",
    communicationHelp: sheet.communicationHelp ?? child.communicationHelp ?? "",
    nonVerbalCommunication: sheet.nonVerbalCommunication ?? child.nonVerbalCommunication ?? "",
    pictograms: sheet.pictograms ?? child.pictograms ?? "",
    signs: sheet.signs ?? child.signs ?? "",
    careAdviceNotes: sheet.careAdviceNotes ?? child.importantInstructions ?? ""
  };
}

function syncMedicalHelpSheet(child) {
  const sheet = normalizeMedicalHelpSheet(child);
  child.medicalHelpSheet = sheet;
  child.medicalDisabilityType = sheet.disabilityType;
  child.medicalDisabilityForm = sheet.disabilityForm;
  child.allergies = sheet.allergiesDetails;
  child.medicalConditions = sheet.medicalConditionsDetails;
  child.medicalSymptoms = sheet.medicalSymptoms;
  child.medicalNotes = sheet.symptomInstructions;
  child.transitionObject = sheet.transitionObject;
  child.mobilityHelp = sheet.mobilityHelp;
  child.tripOccupation = sheet.tripOccupation;
  child.transportSickness = sheet.transportSickness;
  child.communicationHelp = sheet.communicationHelp;
  child.nonVerbalCommunication = sheet.nonVerbalCommunication;
  child.pictograms = sheet.pictograms;
  child.signs = sheet.signs;
  child.importantInstructions = sheet.careAdviceNotes;
  return sheet;
}

function medicalHelpRows(child) {
  const sheet = normalizeMedicalHelpSheet(child);
  return [
    ["Âge", age(child.birthDate)],
    ["Date de naissance", child.birthDate],
    ["Type de handicap", sheet.disabilityType],
    ["Forme du handicap", sheet.disabilityForm],
    ["Allergies", sheet.hasAllergies],
    ["Précisions allergies", sheet.allergiesDetails],
    ["Affections médicales", sheet.hasMedicalConditions],
    ["Précisions affections médicales", sheet.medicalConditionsDetails],
    ["Symptômes médicaux particuliers", sheet.medicalSymptoms],
    ["Consignes en cas de symptôme", sheet.symptomInstructions],
    ["Objet de transition / doudou", sheet.transitionObject],
    ["Aides aux déplacements", sheet.mobilityHelp],
    ["Occupation pendant le trajet", sheet.tripOccupation],
    ["Mal des transports", sheet.transportSickness],
    ["Aide à la communication", sheet.communicationHelp],
    ["Communication non verbale", sheet.nonVerbalCommunication],
    ["Pictogrammes", sheet.pictograms],
    ["Signes", sheet.signs],
    ["Remarques complémentaires", sheet.careAdviceNotes]
  ];
}

function medicalHelpSection(child) {
  if (!canSeeMedicalHelpSheet(child)) return "";
  return section("Fiche médicale / aide à la prise en charge", medicalHelpRows(child));
}

function parentMedicalHelpNeedsCompletion(child = {}) {
  return isParent() && !child.parentMedicalHelpCompletedAt;
}

function parentMedicalHelpPrompt(child) {
  if (!parentMedicalHelpNeedsCompletion(child)) return "";
  return `<article class="pending-card">
    <div class="pending-head">
      <div>
        <p class="eyebrow">Première connexion</p>
        <h3>Compléter la fiche médicale</h3>
      </div>
      <b class="badge warning">À compléter</b>
    </div>
    <p class="muted">Merci de vérifier les informations médicales et d’aide à la prise en charge de ${esc(child.firstName || fullName(child))}.</p>
    <div class="form-actions"><button class="primary-button compact-action" type="button" data-parent-request="${esc(child.id)}">Compléter maintenant</button></div>
  </article>`;
}

function normalizeAlternatingResidence(child = {}) {
  const residence = child.alternatingResidence || {};
  return {
    enabled: residence.enabled === true,
    currentWeek: residence.currentWeek || "maman",
    motherAddress: residence.motherAddress ?? child.homeAddress ?? "",
    motherPostalCode: residence.motherPostalCode ?? child.postalCode ?? "",
    motherCity: residence.motherCity ?? child.city ?? "",
    motherPickupStop: residence.motherPickupStop ?? child.pickupStop ?? "",
    fatherAddress: residence.fatherAddress ?? "",
    fatherPostalCode: residence.fatherPostalCode ?? "",
    fatherCity: residence.fatherCity ?? "",
    fatherPickupStop: residence.fatherPickupStop ?? "",
    notes: residence.notes ?? ""
  };
}

function normalizeTecStop(stop = {}) {
  const stopId = stop.stop_id || stop.stopId || stop.code || stop.id || "";
  const code = stop.code || stop.stop_code || "";
  const name = stop.name || stop.stop_name || stop.stopName || "";
  const city = stop.city || stop.commune || "";
  const id = stop.id || stopId || `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return {
    id,
    stop_id: stopId,
    code,
    name,
    stop_name: stop.stop_name || stop.stopName || name,
    city,
    lat: stop.lat ?? stop.stop_lat ?? "",
    lon: stop.lon ?? stop.stop_lon ?? "",
    searchName: stop.searchName || normalizeTextSearch([name, stop.stop_name, city, stopId, code].filter(Boolean).join(" "))
  };
}

function tecStopDisplay(stop = {}) {
  const normalized = normalizeTecStop(stop);
  return [
    normalized.name,
    normalized.city,
    normalized.code || normalized.stop_id ? `(${normalized.code || normalized.stop_id})` : ""
  ].filter(Boolean).join(" - ").replace(" - (", " (");
}

function tecStopOptions() {
  return uniqueText((data.tecStops || [])
    .map((stop) => tecStopDisplay(stop))
    .filter(Boolean))
    .sort((a, b) => a.localeCompare(b, "fr"));
}

function alternatingResidenceRows(child) {
  const residence = normalizeAlternatingResidence(child);
  if (!residence.enabled) {
    return [["Garde alternée", "Non"], ["Adresse principale", [child.homeAddress, child.postalCode, child.city].filter(Boolean).join(" ")], ["Arrêt principal", child.pickupStop]];
  }
  return [
    ["Garde alternée", "Oui"],
    ["Semaine paire", residence.currentWeek === "papa" ? "Parent référent impair" : "Parent référent pair"],
    ["Adresse semaine paire", [residence.motherAddress, residence.motherPostalCode, residence.motherCity].filter(Boolean).join(" ")],
    ["Arrêt semaine paire", residence.motherPickupStop],
    ["Adresse semaine impaire", [residence.fatherAddress, residence.fatherPostalCode, residence.fatherCity].filter(Boolean).join(" ")],
    ["Arrêt semaine impaire", residence.fatherPickupStop],
    ["Remarques", residence.notes]
  ];
}

function alternatingResidenceSection(child) {
  if (!canSeeAlternatingCustody(child)) return "";
  return section("Garde alternée", alternatingResidenceRows(child));
}

function alternatingResidenceEditFields(child) {
  const residence = normalizeAlternatingResidence(child);
  return `
    <label class="check-field"><input name="alternatingResidence.enabled" type="checkbox" ${residence.enabled ? "checked" : ""}>Enfant une semaine sur deux chez maman / papa</label>
    <label><span>Semaine actuelle</span><select name="alternatingResidence.currentWeek"><option value="maman" ${residence.currentWeek === "maman" ? "selected" : ""}>Semaine paire</option><option value="papa" ${residence.currentWeek === "papa" ? "selected" : ""}>Semaine impaire</option></select></label>
    ${addressInput("alternatingResidence.motherAddress", "Adresse semaine paire", residence.motherAddress)}
    ${postalCodeInput("alternatingResidence.motherPostalCode", "Code postal semaine paire", residence.motherPostalCode)}
    ${cityInput("alternatingResidence.motherCity", "Localité semaine paire", residence.motherCity)}
    ${tecStopInput("alternatingResidence.motherPickupStop", "Arrêt semaine paire", residence.motherPickupStop)}
    ${addressInput("alternatingResidence.fatherAddress", "Adresse semaine impaire", residence.fatherAddress)}
    ${postalCodeInput("alternatingResidence.fatherPostalCode", "Code postal semaine impaire", residence.fatherPostalCode)}
    ${cityInput("alternatingResidence.fatherCity", "Localité semaine impaire", residence.fatherCity)}
    ${tecStopInput("alternatingResidence.fatherPickupStop", "Arrêt semaine impaire", residence.fatherPickupStop)}
    ${textArea("alternatingResidence.notes", "Remarques garde alternée", residence.notes)}
  `;
}

function medicalHelpEditFields(child, prefix = "medicalHelpSheet.") {
  const sheet = normalizeMedicalHelpSheet(child);
  const yesNo = (name, label, value) => `<label><span>${esc(label)}</span><select name="${esc(prefix + name)}"><option value="non" ${value === "non" ? "selected" : ""}>Non</option><option value="oui" ${value === "oui" ? "selected" : ""}>Oui</option></select></label>`;
  return `
    ${textArea(`${prefix}disabilityType`, "Type de handicap", sheet.disabilityType)}
    ${textArea(`${prefix}disabilityForm`, "Forme du handicap", sheet.disabilityForm)}
    ${yesNo("hasAllergies", "Allergies", sheet.hasAllergies)}
    ${textArea(`${prefix}allergiesDetails`, "Précisions allergies", sheet.allergiesDetails)}
    ${yesNo("hasMedicalConditions", "Affections médicales", sheet.hasMedicalConditions)}
    ${textArea(`${prefix}medicalConditionsDetails`, "Précisions affections médicales", sheet.medicalConditionsDetails)}
    ${textArea(`${prefix}medicalSymptoms`, "Symptômes médicaux particuliers", sheet.medicalSymptoms)}
    ${textArea(`${prefix}symptomInstructions`, "Consignes en cas de symptôme", sheet.symptomInstructions)}
    ${textArea(`${prefix}transitionObject`, "Objet de transition / doudou", sheet.transitionObject)}
    ${textArea(`${prefix}mobilityHelp`, "Aides aux déplacements", sheet.mobilityHelp)}
    ${textArea(`${prefix}tripOccupation`, "Occupation pendant le trajet", sheet.tripOccupation)}
    ${textArea(`${prefix}transportSickness`, "Mal des transports", sheet.transportSickness)}
    ${textArea(`${prefix}communicationHelp`, "Aide à la communication", sheet.communicationHelp)}
    ${textArea(`${prefix}nonVerbalCommunication`, "Communication non verbale", sheet.nonVerbalCommunication)}
    ${textArea(`${prefix}pictograms`, "Pictogrammes", sheet.pictograms)}
    ${textArea(`${prefix}signs`, "Signes", sheet.signs)}
    ${textArea(`${prefix}careAdviceNotes`, "Remarques complémentaires", sheet.careAdviceNotes)}
  `;
}

function parentMedicalHelpEditFields(child) {
  const sheet = normalizeMedicalHelpSheet(child);
  const prefix = "medicalHelpSheet.";
  const yesNo = (name, label, value) => `<label><span>${esc(label)}</span><select name="${esc(prefix + name)}"><option value="non" ${value === "non" ? "selected" : ""}>Non</option><option value="oui" ${value === "oui" ? "selected" : ""}>Oui</option></select></label>`;
  return `
    ${yesNo("hasAllergies", "Allergies", sheet.hasAllergies)}
    ${textArea(`${prefix}allergiesDetails`, "Précisions allergies", sheet.allergiesDetails)}
    ${yesNo("hasMedicalConditions", "Affections médicales", sheet.hasMedicalConditions)}
    ${textArea(`${prefix}medicalConditionsDetails`, "Précisions affections médicales", sheet.medicalConditionsDetails)}
    ${textArea(`${prefix}medicalSymptoms`, "Symptômes médicaux particuliers", sheet.medicalSymptoms)}
    ${textArea(`${prefix}symptomInstructions`, "Consignes en cas de symptôme", sheet.symptomInstructions)}
    ${textArea(`${prefix}transitionObject`, "Objet de transition / doudou", sheet.transitionObject)}
    ${textArea(`${prefix}mobilityHelp`, "Aides aux déplacements", sheet.mobilityHelp)}
    ${textArea(`${prefix}tripOccupation`, "Occupation pendant le trajet", sheet.tripOccupation)}
    ${textArea(`${prefix}transportSickness`, "Mal des transports", sheet.transportSickness)}
    ${textArea(`${prefix}communicationHelp`, "Aide à la communication", sheet.communicationHelp)}
    ${textArea(`${prefix}nonVerbalCommunication`, "Communication non verbale", sheet.nonVerbalCommunication)}
    ${textArea(`${prefix}pictograms`, "Pictogrammes", sheet.pictograms)}
    ${textArea(`${prefix}signs`, "Signes", sheet.signs)}
    ${textArea(`${prefix}careAdviceNotes`, "Remarques complémentaires", sheet.careAdviceNotes)}
  `;
}

function logo(compact = false) {
  return `<div class="${compact ? "logo logo-compact" : "logo"}"><img src="${LOGO}" alt="Gestion Transport Scolaire" onerror="this.remove()"></div>`;
}

function companyLogo() {
  return `<div class="company-logo"><img src="${COMPANY_LOGO}" alt="KEOLIS" onerror="this.remove()"><span>KEOLIS</span></div>`;
}

function assistantLogo() {
  return `<div class="assistant-logo"><img src="${SPW_LOGO}" alt="Wallonie service public SPW" onerror="this.remove()"><span>SPW</span></div>`;
}

function roleBrandLogo() {
  return usesSpwIdentity() ? assistantLogo() : companyLogo();
}

function sidebarUserName() {
  if (state.user?.role !== "assistant") return fullName(state.user);
  const assistant = data.assistants.find((item) => item.id === state.user.id) || state.user;
  const circuits = assistant.assignedCircuits?.length
    ? assistant.assignedCircuits.join(", ")
    : assistant.schoolCircuit || state.user.assignedCircuits?.join(", ") || "";
  return `${fullName(state.user)}${circuits ? ` - ${circuits}` : ""}`;
}

function usesSpwIdentity() {
  return state.user?.role === "assistant" || state.user?.visualTheme === "spw";
}

function appShellClass() {
  return `app-shell ${usesSpwIdentity() ? "assistant-spw-theme" : ""} ${state.mobileMoreOpen ? "mobile-more-is-open" : ""}`;
}

function render() {
  try {
    applyParentLanguageDirection();
    if (!state.user) {
      return renderLogin();
    }
    if (!isSupportAssistanceSession() && canChooseApplication() && !state.activeApp) {
      return renderApplicationSelector();
    }
    if (state.activeApp === "sncb") {
      if (!canAccessSncbApp()) {
        state.activeApp = "gts";
        saveSession(state.user);
        return renderApp();
      }
      renderSncbApp();
      saveViewState();
      return;
    }
    renderApp();
    saveViewState();
    processNotifications();
  } catch (error) {
    console.error(error);
    document.getElementById("root").innerHTML = `
      <main class="login-screen">
        <section class="login-panel">
          ${logo()}
          ${companyLogo()}
          <div class="login-copy">
            <p class="eyebrow">Erreur</p>
            <h1>Gestion Transport Scolaire</h1>
            <p>Une erreur a été évitée. Rechargez la page ou reconnectez-vous.</p>
          </div>
          <button class="primary-button" id="recover-button">Revenir à la connexion</button>
        </section>
      </main>`;
    document.getElementById("recover-button").addEventListener("click", logout);
  }
}

function isAppRoute() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return path === "/app" || path === "/dashboard" || window.location.hash === "#app";
}

function goToAppRoute() {
  if (window.location.pathname !== "/app") {
    window.history.pushState({}, "", "/app");
  }
  renderLogin();
}

window.addEventListener("popstate", () => {
  if (!state.user) render();
});

function renderLanding() {
  document.getElementById("root").innerHTML = `
    <main class="landing-page">
      <nav class="landing-nav" aria-label="Navigation principale">
        <a class="landing-brand" href="/" aria-label="Gestion Transport Scolaire">
          <span class="landing-brand-mark"><img src="${LOGO}" alt="" onerror="this.remove()"></span>
          <span>Gestion Transport Scolaire</span>
        </a>
        <button class="landing-nav-link" type="button" data-open-app>Accéder à l’application</button>
      </nav>

      <section class="landing-hero">
        <div class="landing-hero-copy">
          <p class="landing-kicker">Transport scolaire spécialisé</p>
          <h1>Gestion Transport Scolaire</h1>
          <p>Une application web moderne pour organiser les élèves, les circuits, les véhicules, les chauffeurs, les convoyeuses, les parents et le support, avec une interface pensée pour le terrain et le mobile.</p>
          <div class="landing-actions">
            <a class="landing-button primary" href="#features">Découvrir l’application</a>
            <button class="landing-button secondary" type="button" data-open-app>Accéder à l’espace sécurisé</button>
          </div>
        </div>
        <div class="landing-dashboard" aria-label="Aperçu du tableau de bord">
          <div class="landing-dashboard-head">
            <div>
              <span>Tableau de bord</span>
              <strong>Vue opérationnelle</strong>
            </div>
            <span class="landing-status">Mobile</span>
          </div>
          <div class="landing-stats">
            ${landingStat("Accès", "5", "Gestionnaire de transport, chauffeur, convoyeuse, parent, support")}
            ${landingStat("Données", "100%", "Texte uniquement, sans upload")}
            ${landingStat("Fiches", "1", "Une fiche complète par élève")}
            ${landingStat("Alertes", "Live", "Messages et demandes visibles", true)}
          </div>
          <div class="landing-route-card">
            <div>
              <span>Fiche élève</span>
              <strong>Transport, santé, école, responsables</strong>
            </div>
            <div class="landing-route-line"><span></span><span></span><span></span></div>
          </div>
        </div>
      </section>

      <section class="landing-section" id="features">
        <div class="landing-section-head">
          <p class="landing-kicker">Fonctionnalités</p>
          <h2>Tout le suivi transport au même endroit</h2>
        </div>
        <div class="landing-feature-grid">
          ${landingFeature("EL", "Fiches élèves complètes", "Identité, école, transport, responsables, personnes autorisées, santé, consignes et transfert.")}
          ${landingFeature("TR", "Circuits et transferts", "Circuit de prise en charge, lieu de transfert, circuit vers l’école et changement de car clairement affichés.")}
          ${landingFeature("VE", "Véhicules et écoles", "Numéro d’identification bus, école desservie, chauffeur et convoyeuse associés.")}
          ${landingFeature("ME", "Messages sécurisés", "Conversations privées, messages récents, annonces par rôle et centre support séparé.")}
          ${landingFeature("PA", "Espace parent", "Accès limité aux enfants liés, page contact SPW et informations transport utiles sans données internes.")}
          ${landingFeature("SPW", "Interface convoyeuse SPW", "Identité visuelle dédiée, dashboard simplifié et données liées au circuit.")}
          ${landingFeature("PDF", "PDF fiche élève", "Génération locale d’une fiche élève complète, sans stockage en ligne.")}
          ${landingFeature("SU", "Centre support", "Demandes support suivies, contexte prérempli et journal des connexions pour gestionnaire/support.")}
        </div>
      </section>

      <section class="landing-section">
        <div class="landing-section-head">
          <p class="landing-kicker">Espaces sécurisés</p>
          <h2>Chaque rôle voit uniquement ce dont il a besoin</h2>
        </div>
        <div class="landing-role-grid">
          ${landingRole("Gestionnaire de transport", "Vue globale, codes d’accès, réglages, contact SPW, gestion des utilisateurs, circuits, écoles, véhicules et fiches élèves.")}
          ${landingRole("Chauffeur", "Accès aux élèves et données de ses circuits, messages, demandes parent et informations transport liées.")}
          ${landingRole("Convoyeuse", "Interface SPW, élèves liés, chauffeur associé, école desservie, messages et gestion limitée à son périmètre.")}
          ${landingRole("Parent", "Accès privé aux enfants associés, informations utiles, messages, propositions de modification et contact SPW.")}
          ${landingRole("Support", "Centre support isolé, demandes, réponses et suivi sans accès aux conversations privées.")}
        </div>
      </section>

      <section class="landing-section landing-benefits">
        <div class="landing-section-head">
          <p class="landing-kicker">Terrain</p>
          <h2>Une application pensée pour téléphone et usage rapide</h2>
        </div>
        <div class="landing-benefit-grid">
          ${["Connexion par code personnel", "Dashboard clair par rôle", "Recherche globale pour les équipes", "Menu mobile adapté", "Mode clair, sombre ou automatique", "Sauvegarde locale avec fallback localStorage", "Firestore prévu sans Firebase Storage", "Aucun upload PDF, photo ou document", "Données texte uniquement"].map((item) => `<div class="landing-benefit"><span>✓</span>${esc(item)}</div>`).join("")}
        </div>
      </section>

      <section class="landing-security">
        <div>
          <p class="landing-kicker">Confidentialité</p>
          <h2>Séparer les données sensibles sans compliquer le travail</h2>
        </div>
        <p>Les parents ne voient jamais les plaques ni les données internes. Les messages privés restent séparés du gestionnaire de transport et du support. Les demandes parent sont visibles uniquement par le chauffeur et la convoyeuse concernés.</p>
      </section>

      <section class="landing-section">
        <div class="landing-section-head">
          <p class="landing-kicker">Flux de travail</p>
          <h2>De la fiche élève au suivi quotidien</h2>
        </div>
        <div class="landing-process">
          ${landingStep("1", "Créer les données", "Élèves, chauffeurs, convoyeuses, véhicules, écoles, circuits et codes d’accès.")}
          ${landingStep("2", "Lier automatiquement", "Les informations liées se synchronisent via les identifiants : circuit, véhicule, chauffeur, convoyeuse, école.")}
          ${landingStep("3", "Suivre le terrain", "Dashboard, messages récents, demandes parent, transferts et fiches complètes disponibles sur mobile.")}
          ${landingStep("4", "Partager localement", "Génération PDF locale de la fiche élève, sans upload et sans stockage en ligne.")}
        </div>
      </section>

      <section class="landing-final-cta">
        <h2>Centraliser le transport scolaire sans alourdir le terrain</h2>
        <p>Une application claire, rapide et organisée autour des élèves, des équipes et des circuits.</p>
        <button class="landing-button primary" type="button" data-open-app>Commencer maintenant</button>
      </section>
    </main>`;

  document.querySelectorAll("[data-open-app]").forEach((button) => {
    button.addEventListener("click", goToAppRoute);
  });
}

function renderApplicationSelector() {
  const sncbAllowed = canAccessSncbApp();
  document.getElementById("root").innerHTML = `<main class="app-selector-screen">
    <section class="app-selector-panel">
      ${logo(true)}
      <div class="section-title"><p class="eyebrow">Session ouverte</p><h1>Choisir une application</h1><p class="muted">${esc(fullName(state.user))} - ${esc(accountRoleLabel(state.user))}</p></div>
      <div class="app-choice-grid">
        <article class="app-choice-card">
          <span class="app-choice-icon">🚌</span>
          <h2>Gestion Transport Scolaire</h2>
          <p>Gestion des élèves, circuits, écoles, messages et véhicules.</p>
          <button class="primary-button" type="button" data-choose-app="gts">Ouvrir</button>
        </article>
        <article class="app-choice-card ${sncbAllowed ? "" : "is-disabled"}">
          <span class="app-choice-icon">🚍</span>
          <div class="app-choice-title"><h2>Bus de remplacement SNCB</h2>${sncbAllowed ? "" : `<b class="badge danger">Accès non autorisé</b>`}</div>
          <p>Gestion des services de remplacement SNCB.</p>
          <button class="${sncbAllowed ? "primary-button" : "secondary-button"}" type="button" data-choose-app="sncb" ${sncbAllowed ? "" : "disabled"}>Ouvrir</button>
        </article>
      </div>
      <button class="secondary-button" id="logout-button" type="button">Se déconnecter</button>
    </section>
  </main>`;
  bindEvents();
}

function renderSncbApp() {
  document.getElementById("root").innerHTML = `<div class="app-shell sncb-shell">
    <aside class="sidebar">
      <div class="sidebar-head">${companyLogo()}</div>
      <div class="user-pill"><span>●</span><span>${esc(fullName(state.user))}</span></div>
      <nav>
        <button class="nav-item active" type="button">Tableau de bord</button>
        <button class="nav-item" type="button" data-open-gts-app>GTS</button>
        ${["Services", "Véhicules", "Chauffeurs", "Messages", "Réglages"].map((label) => `<button class="nav-item" type="button">${esc(label)}</button>`).join("")}
      </nav>
    </aside>
    <div class="main-area">
      <header class="topbar">
          <div class="topbar-title"><div><strong>Bus de remplacement SNCB</strong></div></div>
        <div class="topbar-actions">
          ${offlineStatusBadge()}
          ${serviceStatusHeaderBadge()}
          <button class="secondary-button compact-action" type="button" data-change-app>Changer d’application</button>
          <button class="icon-button topbar-icon-button" id="logout-button" title="Se déconnecter" aria-label="Se déconnecter">⏻</button>
        </div>
      </header>
      <main class="content">
        <section class="view-stack">
          <div class="section-title"><p class="eyebrow">SNCB</p><h2>Dashboard Bus de remplacement SNCB</h2></div>
          <article class="info-card sncb-prep-card">
            <h3>Module en préparation</h3>
            <p class="muted">Cet espace sera dédié aux services de remplacement SNCB. Les données restent séparées de Gestion Transport Scolaire.</p>
          </article>
          <div class="metric-grid">
            ${metric("Services", "À venir")}
            ${metric("Véhicules", "À venir")}
            ${metric("Chauffeurs", "À venir")}
            ${metric("Messages", "À venir")}
          </div>
        </section>
      </main>
    </div>
  </div>`;
  bindEvents();
}

function landingStat(label, value, detail, important = false) {
  return `<article class="landing-stat ${important ? "is-alert" : ""}">
    <span>${esc(label)}</span>
    <strong>${esc(value)}</strong>
    <small>${esc(detail)}</small>
  </article>`;
}

function landingFeature(icon, title, detail = "") {
  return `<article class="landing-feature-card">
    <span aria-hidden="true">${icon}</span>
    <h3>${esc(title)}</h3>
    ${detail ? `<p>${esc(detail)}</p>` : ""}
  </article>`;
}

function landingRole(title, detail) {
  return `<article class="landing-role-card">
    <h3>${esc(title)}</h3>
    <p>${esc(detail)}</p>
  </article>`;
}

function landingStep(number, title, detail) {
  return `<article class="landing-step">
    <span>${esc(number)}</span>
    <div><h3>${esc(title)}</h3><p>${esc(detail)}</p></div>
  </article>`;
}

function normalizeLoginValue(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "").replace(/[-_]/g, "");
}

function defaultIdentifierForUser(user) {
  if (!user) return "";
  if (user.id === "admin" || user.accessCode === "1901") return "6183";
  if (user.id === "support" || user.role === "support") return "1990";
  return user.accessCode || "";
}

function identifierMatches(user, identifier) {
  const entered = normalizeLoginValue(identifier);
  return [
    user?.identifier,
    user?.identifierNumber || defaultIdentifierForUser(user),
    user?.username
  ].some((value) => normalizeLoginValue(value) === entered);
}

function driverLoginVehicle(user, source) {
  const store = source || data;
  const driver = (store.drivers || []).find((item) => item.id === user?.id) || {};
  return (store.vehicles || []).find((vehicle) => vehicle.id === user?.assignedVehicleId)
    || (store.vehicles || []).find((vehicle) => vehicle.driverId === user?.id)
    || (store.vehicles || []).find((vehicle) => vehicle.busNumber === driver.busNumber)
    || null;
}

function driverBusMatches(user, busNumber, source) {
  const store = source || data;
  const expectedVehicle = driverLoginVehicle(user, store);
  const driver = (store.drivers || []).find((item) => item.id === user?.id) || {};
  const entered = normalizeLoginValue(busNumber);
  return !!entered && [expectedVehicle?.busNumber, driver.busNumber].some((value) => normalizeLoginValue(value) === entered);
}

function parentChildNameMatches(child, studentLastName) {
  return normalizeLoginValue(child?.lastName) === normalizeLoginValue(studentLastName);
}

function parentLinkedToChild(parent, child) {
  return (parent.linkedChildrenIds || []).includes(child.id)
    || (child.parentIds || []).includes(parent.id)
    || (!!parent.accessCode && child.parentAccessCode === parent.accessCode);
}

function childLastNameOptions() {
  return [...new Set((data.children || []).map((child) => child.lastName).filter(Boolean))];
}

function circuitRef(child, key, fallback = "", source) {
  const store = source || data;
  const direct = circuitByRef(child?.[key], store);
  const fallbackCircuit = circuitByRef(fallback, store);
  return direct?.id || child?.[key] || fallbackCircuit?.id || fallback || "";
}

function circuitLabelByRef(ref, source) {
  const store = source || data;
  const circuit = circuitByRef(ref, store);
  return circuit?.name || ref || "";
}

function childPickupCircuitLabel(child) {
  return circuitLabelByRef(child?.pickupCircuitId) || child?.morningCircuit || child?.circuitNumber || "";
}

function childSchoolCircuitLabel(child) {
  return circuitLabelByRef(child?.schoolCircuitId) || child?.returnCircuit || child?.circuitNumber || "";
}

function parentStudentIdentifier(parent) {
  if (parent?.studentLastNameIdentifier) return parent.studentLastNameIdentifier;
  const children = (parent?.linkedChildrenIds || []).map((id) => data.children.find((child) => child.id === id)).filter(Boolean);
  return [...new Set(children.map((child) => child.lastName).filter(Boolean))].join(", ");
}

function normalizePhoneValue(value) {
  return String(value || "").replace(/\D/g, "");
}

function guardianMatchesParent(guardian = {}, parent = {}) {
  const sameLastName = normalizeLoginValue(guardian.lastName) && normalizeLoginValue(guardian.lastName) === normalizeLoginValue(parent.lastName);
  const sameFirstName = normalizeLoginValue(guardian.firstName) && normalizeLoginValue(guardian.firstName) === normalizeLoginValue(parent.firstName);
  const samePhone = normalizePhoneValue(guardian.phone) && normalizePhoneValue(guardian.phone) === normalizePhoneValue(parent.phone);
  return sameLastName && (sameFirstName || samePhone);
}

function childMatchesParentRecord(child = {}, parent = {}) {
  return (child.guardians || []).some((guardian) => guardianMatchesParent(guardian, parent));
}

function parentGuardianForChild(child = {}, parent = state.user || {}) {
  return (child.guardians || []).find((guardian) => guardianMatchesParent(guardian, parent))
    || (child.guardians || [])[0]
    || {};
}

function resolveParentLinkedChildren(studentLastName, linkedChildrenIds = [], parentRecord = {}) {
  const name = String(studentLastName || "").trim();
  if (!name) return { error: "Le nom de l’élève est obligatoire pour créer l’identifiant parent." };
  const matchingChildren = data.children.filter((child) => normalizeLoginValue(child.lastName) === normalizeLoginValue(name));
  if (!matchingChildren.length) return { error: "Aucun élève ne correspond à ce nom." };

  const manualIds = linkedChildrenIds.map((value) => value.trim()).filter(Boolean);
  const parentMatchedChildren = matchingChildren.filter((child) => childMatchesParentRecord(child, parentRecord));
  if (!manualIds.length && matchingChildren.length > 1) {
    if (parentMatchedChildren.length === 1) {
      return {
        studentLastNameIdentifier: parentMatchedChildren[0].lastName,
        linkedChildrenIds: [parentMatchedChildren[0].id]
      };
    }
    if (parentMatchedChildren.length > 1) {
      return {
        studentLastNameIdentifier: parentMatchedChildren[0].lastName,
        linkedChildrenIds: parentMatchedChildren.map((child) => child.id)
      };
    }
    return { error: "Plusieurs élèves portent ce nom. Aucun responsable ne correspond au parent saisi. Renseignez l’ID de l’enfant associé pour éviter une erreur d’accès." };
  }

  const ids = manualIds.length ? manualIds : [matchingChildren[0].id];
  const linkedChildren = ids.map((id) => data.children.find((child) => child.id === id)).filter(Boolean);
  if (!linkedChildren.length) return { error: "Aucun enfant lié valide." };
  if (!linkedChildren.some((child) => normalizeLoginValue(child.lastName) === normalizeLoginValue(name))) {
    return { error: "Le nom de l’élève ne correspond pas aux enfants associés." };
  }

  return {
    studentLastNameIdentifier: linkedChildren.find((child) => normalizeLoginValue(child.lastName) === normalizeLoginValue(name))?.lastName || matchingChildren[0].lastName,
    linkedChildrenIds: ids
  };
}

function parentIdentityFromForm(form) {
  return {
    firstName: form.elements.firstName?.value.trim() || "",
    lastName: form.elements.lastName?.value.trim() || "",
    phone: form.elements.phone?.value.trim() || "",
    email: form.elements.email?.value.trim() || ""
  };
}

function autoFillParentStudentFromChildFile(form) {
  if (!form?.elements?.studentLastName) return;
  const studentField = form.elements.studentLastName;
  const linkedField = form.elements.linkedChildrenIds;
  const parentIdentity = parentIdentityFromForm(form);
  const manualIds = selectedChildIdsFromField(linkedField);
  const selectedManually = linkedField?.dataset.autofilled === "false" && manualIds.length > 0;
  if (selectedManually) return;

  const studentName = studentField.value.trim();
  const childrenByParent = data.children.filter((child) => childMatchesParentRecord(child, parentIdentity));
  const childrenByName = studentName
    ? data.children.filter((child) => normalizeLoginValue(child.lastName) === normalizeLoginValue(studentName))
    : [];
  const matchedChildren = childrenByName.length
    ? childrenByName.filter((child) => childMatchesParentRecord(child, parentIdentity))
    : childrenByParent;
  const children = matchedChildren.length
    ? matchedChildren
    : childrenByName.length === 1
      ? childrenByName
      : childrenByParent;
  if (!children.length) return;

  const lastNames = uniqueText(children.map((child) => child.lastName).filter(Boolean));
  if (lastNames.length === 1 && (!studentField.value.trim() || studentField.dataset.autofilled === "true")) {
    studentField.value = lastNames[0];
    studentField.dataset.autofilled = "true";
  }
  if (linkedField && (!manualIds.length || linkedField.dataset.autofilled === "true")) {
    setSelectedChildIds(linkedField, children.map((child) => child.id));
    linkedField.dataset.autofilled = "true";
  }
}

async function findLoginAccount(role, identifier, code, studentLastName = "") {
  if (role === "parent") {
    for (const parent of data.parents.filter((item) => item.isActive !== false)) {
      const childMatch = data.children.some((child) => parentChildNameMatches(child, studentLastName) && parentLinkedToChild(parent, child));
      if (childMatch && await credentialMatches(parent, code, "personal")) return { user: parent, usedTemporary: false };
      if (childMatch && await credentialMatches(parent, code, "temporary")) return { user: parent, usedTemporary: true };
    }
    return null;
  }
  for (const candidate of data.users) {
    if (candidate.role !== role || !identifierMatches(candidate, identifier)) continue;
    if (await credentialMatches(candidate, code, "personal")) return { user: candidate, usedTemporary: false };
    if (await credentialMatches(candidate, code, "temporary")) return { user: candidate, usedTemporary: true };
  }
  return null;
}

async function findLoginUser(role, identifier, code, studentLastName = "") {
  return (await findLoginAccount(role, identifier, code, studentLastName))?.user || null;
}

function loginProfileMatchesAccount(loginMode, user) {
  if (!user) return false;
  if (loginMode === "system_admin") return isPrimaryAdminUser(user);
  if (loginMode === "transport_manager") return isTransportManagerUser(user);
  if (loginMode === "spw") return isSpwAccount(user);
  return user.role === loginMode;
}

function findLoginCandidate(role, identifier, studentLastName = "") {
  if (role === "parent") {
    return data.parents.find((parent) =>
      parent.isActive !== false &&
      data.children.some((child) => parentChildNameMatches(child, studentLastName) && parentLinkedToChild(parent, child))
    ) || null;
  }
  return data.users.find((candidate) =>
    candidate.role === role &&
    candidate.isActive !== false &&
    identifierMatches(candidate, identifier)
  ) || null;
}

function loginBlocked(account) {
  const until = account?.loginBlockedUntil ? new Date(account.loginBlockedUntil) : null;
  return !!until && until.getTime() > Date.now();
}

function registerLoginFailure(account) {
  if (!account) return;
  account.failedLoginAttempts = Number(account.failedLoginAttempts || 0) + 1;
  if (account.failedLoginAttempts >= 5) {
    account.loginBlockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    recordSecurityLog(account, "login_blocked", "blocked");
  } else {
    recordSecurityLog(account, "login_failed", "failed");
  }
  account.updatedAt = new Date().toISOString();
  const collection = account.role === "parent" ? "parents" : "users";
  saveCollectionItemToFirestore(collection, account);
  saveData();
}

function clearLoginFailures(account) {
  if (!account) return;
  account.failedLoginAttempts = 0;
  account.loginBlockedUntil = "";
  account.lastLoginAt = new Date().toISOString();
  const collection = account.role === "parent" ? "parents" : "users";
  saveCollectionItemToFirestore(collection, account);
  saveData();
}

async function credentialMatches(user, secret, mode = "any") {
  if (!user || !secret) return false;
  const hashed = await hashSecret(secret);
  const legacyPersonalMatch = user.isTemporaryCode !== true && user.firstLoginCompleted !== false && !!user.accessCode && user.accessCode === secret;
  const temporaryPlainMatch = (user.isTemporaryCode === true || user.firstLoginCompleted === false) && !!user.accessCode && user.accessCode === secret;
  const personalMatch = user.accessCodeHash === hashed || user.passwordHash === hashed || legacyPersonalMatch;
  const temporaryMatch = user.temporaryAccessHash === hashed || temporaryPlainMatch;
  if (mode === "personal") return personalMatch;
  if (mode === "temporary") return temporaryMatch;
  return personalMatch || temporaryMatch;
}

async function hashSecret(secret) {
  const text = String(secret || "");
  if (window.crypto?.subtle) {
    const bytes = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return `plain-fallback:${btoa(unescape(encodeURIComponent(text)))}`;
}

function expireTemporarySupportAccesses(store = data) {
  const now = Date.now();
  (store.temporarySupportAccess || []).forEach((access) => {
    if (access.status === "active" && new Date(access.expiresAt || 0).getTime() <= now) {
      access.status = "expired";
      access.updatedAt = new Date().toISOString();
    }
  });
}

function canGenerateTemporarySupportAccess() {
  if (isSupportAssistanceSession()) return false;
  return isTransportManagerUser() || isSpwAccount();
}

async function createTemporarySupportAccess() {
  if (!canGenerateTemporarySupportAccess()) return alert("Action réservée au gestionnaire de transport ou au SPW.");
  let code = "";
  let codeHash = "";
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
    codeHash = await hashSecret(code);
  } while ((data.temporarySupportAccess || []).some((access) => access.status === "active" && access.codeHash === codeHash));
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SUPPORT_TEMP_ACCESS_DURATION_MS);
  const access = {
    id: `support-access-${Date.now()}`,
    code: "******",
    codeHash,
    ownerUserId: state.user.id,
    ownerUserName: fullName(state.user),
    ownerRole: isSpwAccount() ? "spw" : "transport_manager",
    supportUserId: "",
    status: "active",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    usedAt: "",
    revokedAt: "",
    oneTimeUse: true,
    sensitiveDataMasked: true
  };
  data.temporarySupportAccess = data.temporarySupportAccess || [];
  data.temporarySupportAccess.unshift(access);
  state.generatedSupportAccessCode = code;
  state.generatedSupportAccessExpiresAt = access.expiresAt;
  logTemporarySupportAccess(access.id, "created", { ownerUserId: state.user.id });
  saveData();
  saveTemporarySupportAccessToFirestore(access);
  render();
}

function revokeTemporarySupportAccess(accessId) {
  if (!canGenerateTemporarySupportAccess()) return;
  const access = (data.temporarySupportAccess || []).find((item) => item.id === accessId && item.ownerUserId === state.user.id);
  if (!access || !["active", "used"].includes(access.status)) return;
  access.status = "revoked";
  access.revokedAt = new Date().toISOString();
  access.updatedAt = access.revokedAt;
  logTemporarySupportAccess(access.id, "revoked", { ownerUserId: state.user.id });
  saveData();
  saveTemporarySupportAccessToFirestore(access);
  render();
}

function logTemporarySupportAccess(accessId, action, extra = {}) {
  const log = {
    id: `support-access-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    accessId,
    ownerUserId: extra.ownerUserId || "",
    supportUserId: extra.supportUserId || "",
    action,
    createdAt: new Date().toISOString()
  };
  data.temporarySupportAccessLogs = data.temporarySupportAccessLogs || [];
  data.temporarySupportAccessLogs.unshift(log);
  saveTemporarySupportAccessLogToFirestore(log);
  return log;
}

async function validateTemporarySupportAccess(code, supportUser) {
  expireTemporarySupportAccesses(data);
  const hashed = await hashSecret(code);
  const access = (data.temporarySupportAccess || []).find((item) =>
    item.status === "active" &&
    item.oneTimeUse !== false &&
    item.codeHash === hashed &&
    new Date(item.expiresAt || 0).getTime() > Date.now()
  );
  if (!access) return { ok: false, message: "Code support temporaire invalide ou expiré." };
  const owner = (data.users || []).find((user) => user.id === access.ownerUserId && user.isActive !== false);
  if (!owner || (!isTransportManagerUser(owner) && !isSpwAccount(owner))) {
    return { ok: false, message: "Session utilisateur introuvable ou non autorisée." };
  }
  access.status = "used";
  access.supportUserId = supportUser.id;
  access.usedAt = new Date().toISOString();
  access.updatedAt = access.usedAt;
  logTemporarySupportAccess(access.id, "used", { ownerUserId: owner.id, supportUserId: supportUser.id });
  saveData();
  saveTemporarySupportAccessToFirestore(access);
  return { ok: true, access, owner };
}

function renderLogin(error = "") {
  const message = error || sessionExpiredMessage;
  sessionExpiredMessage = "";
  const notice = state.loginNotice;
  state.loginNotice = "";
  const allowedLoginModes = ["system_admin", "transport_manager", "spw", "driver", "assistant", "parent", ...(state.loginSupportUnlocked ? ["support"] : [])];
  const loginMode = allowedLoginModes.includes(state.loginMode) ? state.loginMode : "";
  const hasSelectedProfile = !!loginMode;
  const effectiveLoginMode = loginMode || "parent";
  const loginRole = ["system_admin", "transport_manager", "spw"].includes(effectiveLoginMode) ? "admin" : effectiveLoginMode;
  const needsIdentifier = hasSelectedProfile && loginRole !== "parent";
  const needsBus = false;
  const parentMode = hasSelectedProfile && loginRole === "parent";
  const supportTemporaryMode = hasSelectedProfile && loginRole === "support" && state.loginSupportTemporaryOpen;
  const loginActionLabel = supportTemporaryMode ? "Ouvrir assistance" : parentMode ? "Connexion parent" : "Se connecter";
  const profiles = [
    ["system_admin", "Administrateur système", "Configuration et sécurité globales", "🛡", "blue"],
    ["transport_manager", "Gestionnaire de transport", "Gestion opérationnelle terrain", "▦", "blue"],
    ["spw", "SPW", "Supervision et suivi global", "🏛", "green"],
    ["driver", "Chauffeur", "Gestion des trajets et transport", "☸", "orange"],
    ["assistant", "Convoyeuse", "Suivi et accompagnement", "●", "violet"],
    ["parent", "Parents", "Suivi des enfants et notifications", "👥", "turquoise"],
    ...(state.loginSupportUnlocked ? [["support", "Support", "Maintenance et assistance technique", "🎧", "blue"]] : [])
  ];
  document.getElementById("root").innerHTML = `
    <main class="premium-login-screen">
      <section class="premium-login-panel">
        <button class="premium-lock-icon" type="button" id="login-secret-trigger" aria-label="Connexion sécurisée">▣</button>
        <div class="login-copy">
          <h1>Connexion</h1>
          <p>Accédez à votre espace en sélectionnant votre profil</p>
        </div>
        <form class="login-form" id="login-form">
          <p class="premium-profile-title">Sélectionnez votre profil</p>
          <div class="premium-profile-grid">
            ${profiles.map(([value, title, description, icon, tone]) => `<button class="premium-profile-card ${loginMode === value ? "is-selected" : ""} tone-${tone}" type="button" data-login-profile="${esc(value)}">
              <span class="premium-profile-icon" aria-hidden="true">${esc(icon)}</span>
              <strong>${esc(title)}</strong>
              <small>${esc(description)}</small>
              <b>✓</b>
            </button>`).join("")}
          </div>
          <input id="login-mode" type="hidden" value="${esc(effectiveLoginMode)}">
          ${hasSelectedProfile ? `
            <div class="premium-form-divider"><span>Connectez-vous à votre compte</span></div>
            ${parentMode ? `<label class="screen-reader-label" for="student-last-name">Nom de l’élève</label><div class="login-input-shell"><span aria-hidden="true">♙</span><input id="student-last-name" type="text" autocomplete="off" placeholder="Nom de l’élève" value=""></div>` : ""}
            ${needsIdentifier ? `<label class="screen-reader-label" for="identifier-number">Identifiant</label><div class="login-input-shell"><span aria-hidden="true">♙</span><input id="identifier-number" type="text" autocomplete="off" placeholder="Identifiant" value=""></div>` : ""}
            ${needsBus ? `<label class="screen-reader-label" for="bus-number">Numéro de bus</label><div class="login-input-shell"><span aria-hidden="true">▤</span><input id="bus-number" type="text" autocomplete="off" placeholder="Numéro de bus" value=""></div>` : ""}
            <label class="screen-reader-label" for="access-code">${parentMode ? "Code parent" : "Code d’accès"}</label>
            <div class="password-field">
              <span class="login-input-icon" aria-hidden="true">▣</span>
              <input id="access-code" type="password" inputmode="numeric" autocomplete="off" placeholder="${parentMode ? "Code parent" : "Code d’accès"}" value="" autofocus>
            </div>
            ${supportTemporaryMode ? `<label class="screen-reader-label" for="support-temporary-code">Code support temporaire</label><div class="login-input-shell"><span aria-hidden="true">⌁</span><input id="support-temporary-code" type="password" inputmode="numeric" autocomplete="off" placeholder="Code temporaire transmis" value=""></div>` : ""}
            <div class="premium-login-options">
              <label class="check-field"><input id="remember-login" type="checkbox">Se souvenir de moi</label>
              <button class="link-button" id="forgot-password-toggle" type="button">Code oublié ?</button>
            </div>
            ${loginRole === "support" ? `<button class="link-button support-temp-login-toggle" id="support-temporary-login-toggle" type="button">${supportTemporaryMode ? "Connexion support classique" : "Connexion avec code support temporaire"}</button>` : ""}
          ` : `
            <div class="premium-form-divider"><span>Choisissez un profil</span></div>
            <p class="premium-help-text">Sélectionnez une carte pour afficher les champs de connexion adaptés.</p>
          `}
          ${message ? `<p class="form-error">${esc(message)}</p>` : ""}
          ${notice ? `<p class="form-success">${esc(notice)}</p>` : ""}
          ${hasSelectedProfile ? `<button class="primary-button premium-login-submit" type="submit"><span aria-hidden="true">↪</span>${loginActionLabel}</button>` : ""}
          <div class="premium-form-divider premium-help-divider"><span>Besoin d’aide ?</span></div>
          <p class="premium-help-text"><button class="link-button" id="access-request-toggle" type="button">Contactez le support</button></p>
        </form>
        ${state.loginAccessRequestOpen ? supportRequestLoginForm() : ""}
        ${state.loginForgotPasswordOpen ? forgotPasswordLoginForm() : ""}
        ${state.firstLoginId ? firstLoginCodeForm() : ""}
        <div class="premium-login-benefits">
          <span><b>♢</b><strong>Données sécurisées</strong><small>Vos données sont protégées</small></span>
          <span><b>▯</b><strong>Accessible partout</strong><small>Accédez depuis tous vos appareils</small></span>
          <span><b>♧</b><strong>Notifications en temps réel</strong><small>Restez informé à tout moment</small></span>
          <span><b>◎</b><strong>Support disponible</strong><small>Notre équipe est là pour vous aider</small></span>
        </div>
      </section>
    </main>`;

  document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!loginMode) {
      return renderLogin("Veuillez sélectionner votre profil avant de vous connecter.");
    }
    const code = document.getElementById("access-code").value.trim();
    const studentLastName = document.getElementById("student-last-name")?.value.trim() || "";
    const identifier = document.getElementById("identifier-number")?.value.trim() || "";
    const busNumber = document.getElementById("bus-number")?.value.trim() || "";
    if (loginRole === "support" && state.loginSupportTemporaryOpen) {
      const supportTempCode = document.getElementById("support-temporary-code")?.value.trim() || "";
      const supportAccount = await findLoginAccount("support", identifier, code, "");
      const supportUser = supportAccount?.user || null;
      if (!supportUser || supportUser.isActive === false) {
        recordLoginAttempt(null, code, "refusée");
        return renderLogin("Identifiant support ou code incorrect");
      }
      if (!supportTempCode) return renderLogin("Code support temporaire obligatoire");
      const validation = await validateTemporarySupportAccess(supportTempCode, supportUser);
      if (!validation.ok) return renderLogin(validation.message);
      clearLoginFailures(supportUser);
      recordLoginAttempt(supportUser, code, "assistance temporaire");
      state.user = validation.owner;
      state.activeApp = "gts";
      state.screen = "dashboard";
      resetViewState();
      saveSupportAssistanceSession(validation.owner, supportUser, validation.access);
      render();
      return;
    }
    const loginCandidate = findLoginCandidate(loginRole, identifier, studentLastName);
    if (loginCandidate && loginBlocked(loginCandidate)) {
      recordLoginAttempt(loginCandidate, code, "refusée");
      recordSecurityLog(loginCandidate, "login_blocked", "blocked");
      return renderLogin("Trop de tentatives. Veuillez réessayer dans 15 minutes.");
    }
    const loginAccount = await findLoginAccount(loginRole, identifier, code, studentLastName);
    const user = loginAccount?.user || null;
    if (!user || !loginProfileMatchesAccount(loginMode, user)) {
      if (loginCandidate) registerLoginFailure(loginCandidate);
      recordLoginAttempt(null, code, "refusée");
      return renderLogin(loginRole === "parent" ? "Nom de l’élève ou code d’accès incorrect" : "Numéro identifiant ou code incorrect");
    }
    if (user.isActive === false || (user.role === "admin" && user.isActive !== true)) {
      recordLoginAttempt(user, code, "refusée");
      return renderLogin(parentT("login.disabled"));
    }
    if (loginAccount.usedTemporary || user.firstLoginCompleted === false || user.resetRequired === true) {
      state.firstLoginType = user.role === "parent" ? "parents" : "users";
      state.firstLoginId = user.id;
      clearLoginFailures(user);
      recordLoginAttempt(user, code, "réussie");
      return renderLogin();
    }
    clearLoginFailures(user);
    recordLoginAttempt(user, code, "réussie");
    state.user = user;
    state.activeApp = canChooseApplication(user) ? "" : "gts";
    if (user.themePreference) localStorage.setItem(THEME_KEY, user.themePreference);
    applyThemePreference();
    resetViewState();
    saveSession(user);
    render();
  });
  document.querySelectorAll("#access-request-toggle").forEach((button) => button.addEventListener("click", () => {
    state.loginAccessRequestOpen = true;
    renderLogin();
  }));
  document.querySelectorAll("[data-close-login-support]").forEach((element) => element.addEventListener("click", () => {
    state.loginAccessRequestOpen = false;
    renderLogin();
  }));
  document.getElementById("forgot-password-toggle")?.addEventListener("click", () => {
    state.loginForgotPasswordOpen = true;
    renderLogin();
  });
  document.getElementById("support-temporary-login-toggle")?.addEventListener("click", () => {
    state.loginSupportTemporaryOpen = !state.loginSupportTemporaryOpen;
    renderLogin();
  });
  document.querySelectorAll("[data-close-forgot-password]").forEach((element) => element.addEventListener("click", () => {
    state.loginForgotPasswordOpen = false;
    state.passwordResetVerifiedType = "";
    state.passwordResetVerifiedId = "";
    renderLogin();
  }));
  document.getElementById("forgot-password-role")?.addEventListener("change", (event) => {
    state.loginForgotPasswordRole = event.currentTarget.value;
    state.passwordResetVerifiedType = "";
    state.passwordResetVerifiedId = "";
    renderLogin();
  });
  document.querySelectorAll("[data-login-profile]").forEach((button) => button.addEventListener("click", () => {
    state.loginMode = button.dataset.loginProfile;
    state.loginShowPassword = false;
    state.loginSupportTemporaryOpen = false;
    renderLogin();
  }));
  document.getElementById("login-password-toggle")?.addEventListener("click", () => {
    state.loginShowPassword = !state.loginShowPassword;
    const field = document.getElementById("access-code");
    if (field) field.type = state.loginShowPassword ? "text" : "password";
    const label = state.loginShowPassword ? "Masquer le code" : "Afficher le code";
    const toggle = document.getElementById("login-password-toggle");
    if (toggle) {
      toggle.setAttribute("aria-label", label);
      toggle.textContent = state.loginShowPassword ? "🔒" : "👁";
    }
  });
  let secretClicks = 0;
  let secretTimer = null;
  document.getElementById("login-secret-trigger")?.addEventListener("click", () => {
    secretClicks += 1;
    clearTimeout(secretTimer);
    secretTimer = setTimeout(() => { secretClicks = 0; }, 1200);
    if (secretClicks >= 5) {
      state.loginSupportUnlocked = true;
      state.loginMode = "support";
      renderLogin();
    }
  });
  document.getElementById("login-support-request-form")?.addEventListener("submit", createSupportRequestFromLogin);
  document.getElementById("login-forgot-password-form")?.addEventListener("submit", handlePasswordResetFromLogin);
  document.getElementById("first-login-code-form")?.addEventListener("submit", completeFirstLoginCode);
}

function firstLoginCodeForm() {
  const account = firstLoginAccount();
  if (!account) return "";
  return `<div class="modal-backdrop">
    <form class="login-form access-request-form info-card login-support-dialog" id="first-login-code-form">
      <div class="modal-head">
        <div>
          <h3>Créer mon code personnel</h3>
          <p class="muted">Le code temporaire ne fonctionnera plus après cette étape.</p>
        </div>
      </div>
      <p class="form-success">Compte vérifié : ${esc(fullName(account))}</p>
      ${input("newCode", "Nouveau code personnel", "", "password")}
      ${input("confirmCode", "Confirmer nouveau code personnel", "", "password")}
      <p class="muted">Un code de récupération unique sera généré et affiché une seule fois après validation.</p>
      <button class="primary-button" type="submit">Créer mon code personnel</button>
    </form>
  </div>`;
}

function firstLoginAccount() {
  if (!state.firstLoginType || !state.firstLoginId) return null;
  const collection = state.firstLoginType === "parents" ? data.parents : data.users;
  return collection.find((item) => item.id === state.firstLoginId) || null;
}

function supportRequestLoginForm() {
  return `<div class="modal-backdrop" data-close-login-support>
    <form class="login-form access-request-form info-card login-support-dialog" id="login-support-request-form" onclick="event.stopPropagation()">
      <div class="modal-head">
        <div>
          <h3>Demande support</h3>
          <p class="muted">Expliquez votre problème, le support vous répondra.</p>
        </div>
        <button class="ghost-button icon-only" type="button" data-close-login-support aria-label="Fermer">×</button>
      </div>
      ${input("lastName", "Nom", "")}
      ${input("firstName", "Prénom", "")}
      ${input("phone", "Téléphone", "", "tel")}
      ${input("email", "Adresse e-mail", "", "email")}
      <label><span>Profil concerné</span><select name="requesterRole">
        <option value="driver">Chauffeurs</option>
        <option value="admin">Gestionnaires de transport</option>
        <option value="parent">Parents</option>
        <option value="assistant">Convoyeuses</option>
        <option value="spw">SPW</option>
      </select></label>
      ${input("subject", "Sujet", "")}
      ${textArea("message", "Message", "")}
      <button class="primary-button" type="submit">Envoyer demande support</button>
    </form>
  </div>`;
}

function forgotPasswordLoginForm() {
  const role = state.loginForgotPasswordRole || "driver";
  const candidate = resetVerifiedAccount();
  const verified = !!candidate;
  const identifierLabel = role === "parent" ? "Nom de l’élève" : "Identifiant utilisateur";
  return `<div class="modal-backdrop" data-close-forgot-password>
    <form class="login-form access-request-form info-card login-support-dialog" id="login-forgot-password-form" onclick="event.stopPropagation()">
      <div class="modal-head">
        <div>
          <h3>Réinitialiser mon code personnel</h3>
          <p class="muted">${verified ? "Créez un nouveau code personnel pour votre compte." : "Vérifiez votre identité et votre code de récupération."}</p>
        </div>
        <button class="ghost-button icon-only" type="button" data-close-forgot-password aria-label="Fermer">×</button>
      </div>
      ${verified ? `
        <p class="form-success">Identité vérifiée pour ${esc(fullName(candidate))}.</p>
      ${input("newPassword", "Nouveau code personnel", "", "password")}
      ${input("confirmPassword", "Confirmer nouveau code personnel", "", "password")}
      <button class="primary-button" type="submit">Réinitialiser le code personnel</button>
      ` : `
        ${input("identifier", identifierLabel, "")}
        ${input("lastName", "Nom", "")}
        ${input("firstName", "Prénom", "")}
        <label><span>Rôle</span><select name="requesterRole" id="forgot-password-role">
          <option value="driver" ${role === "driver" ? "selected" : ""}>Chauffeurs</option>
          <option value="admin" ${role === "admin" ? "selected" : ""}>Gestionnaires de transport</option>
          <option value="parent" ${role === "parent" ? "selected" : ""}>Parents</option>
          <option value="assistant" ${role === "assistant" ? "selected" : ""}>Convoyeuses</option>
          <option value="spw" ${role === "spw" ? "selected" : ""}>SPW</option>
        </select></label>
        ${input("contact", "Téléphone enregistré", "")}
        ${input("recoveryCode", "Code de récupération personnel", "", "password")}
        <button class="primary-button" type="submit">Vérifier mon identité</button>
      `}
    </form>
  </div>`;
}

function currentThemePreference() {
  const value = state.user?.themePreference || localStorage.getItem(THEME_KEY) || "auto";
  return ["auto", "light", "dark"].includes(value) ? value : "auto";
}

function applyThemePreference() {
  document.documentElement.dataset.theme = currentThemePreference();
}

function resetViewState() {
  state.screen = "dashboard";
  resetDashboardContext();
}

function resetDashboardContext() {
  state.selectedChildId = "";
  state.editingChildId = "";
  state.selectedType = "";
  state.selectedId = "";
  state.editingType = "";
  state.editingId = "";
  state.activeFilter = null;
  state.pendingDeleteChildId = "";
  state.driverPickerSearch = "";
  state.search = "";
  state.parentChildId = "";
  state.parentRequestChildId = "";
  state.supportFilter = "all";
  state.selectedSupportRequestId = "";
  state.messageChildId = "";
  state.messagesTab = "children";
  state.selectedTeamConversationId = "";
  state.editingAnnouncementId = "";
  state.editingAccessType = "";
  state.editingAccessId = "";
  state.accessCodesTab = "users";
  state.settingsTab = "admin";
  state.editingReplacementRuleId = "";
}

function recordLoginAttempt(user, code, status) {
  const log = {
    id: `login-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user?.id || "",
    userName: user ? fullName(user) : "Code inconnu",
    userRole: user?.role || "inconnu",
    userRoleLabel: user ? accountRoleLabel(user) : "Inconnu",
    accessCodeMasked: maskAccessCode(code),
    loginStatus: status,
    createdAt: new Date().toISOString(),
    deviceInfo: navigator.platform || "Appareil non renseigné",
    browserInfo: navigator.userAgent || "Navigateur non renseigné"
  };
  data.loginLogs = data.loginLogs || [];
  data.loginLogs.unshift(log);
  data.loginLogs = data.loginLogs.slice(0, 200);
  saveData();
  saveLoginLogToFirestore(log);
}

function maskAccessCode(code) {
  const value = String(code || "");
  if (!value) return "";
  return `${value.slice(0, 2)}${"•".repeat(Math.max(2, value.length - 2))}`;
}

function resetVerifiedAccount() {
  if (!state.passwordResetVerifiedType || !state.passwordResetVerifiedId) return null;
  const collection = state.passwordResetVerifiedType === "parents" ? data.parents : data.users;
  return collection.find((item) => item.id === state.passwordResetVerifiedId) || null;
}

function resetRoleMatches(account, role) {
  if (role === "parent") return account.role === "parent";
  if (role === "spw") return account.role === "admin" && account.visualTheme === "spw";
  return account.role === role;
}

function resetIdentifierMatches(account, role, identifier) {
  if (role === "parent") {
    return (account.linkedChildrenIds || [])
      .map((id) => data.children.find((child) => child.id === id))
      .filter(Boolean)
      .some((child) => parentChildNameMatches(child, identifier));
  }
  return identifierMatches(account, identifier);
}

function resetContactMatches(account, contact) {
  const phone = normalizePhoneValue(contact);
  return !!phone && normalizePhoneValue(account.phone) === phone;
}

async function recoverySecretMatches(account, recoveryCode) {
  if (!account?.recoveryCodeHash || !recoveryCode) return false;
  return account.recoveryCodeHash === await hashSecret(recoveryCode);
}

async function findPasswordResetAccount({ role, identifier, firstName, lastName, contact, recoveryCode }) {
  const collection = role === "parent" ? data.parents : data.users;
  for (const account of collection) {
    const matchesIdentity =
    account.isActive !== false &&
    resetRoleMatches(account, role) &&
    resetIdentifierMatches(account, role, identifier) &&
    normalizeLoginValue(account.firstName) === normalizeLoginValue(firstName) &&
    normalizeLoginValue(account.lastName) === normalizeLoginValue(lastName) &&
    resetContactMatches(account, contact);
    if (matchesIdentity && await recoverySecretMatches(account, recoveryCode)) return account;
  }
  return null;
}

function findPasswordResetAccountByIdentifier({ role, identifier }) {
  const collection = role === "parent" ? data.parents : data.users;
  return collection.find((account) =>
    account.isActive !== false &&
    resetRoleMatches(account, role) &&
    resetIdentifierMatches(account, role, identifier)
  ) || null;
}

function resetBlocked(account) {
  const until = account?.resetBlockedUntil ? new Date(account.resetBlockedUntil) : null;
  return !!until && until.getTime() > Date.now();
}

function recordSecurityLog(account, action, status = "success") {
  const now = new Date().toISOString();
  const log = {
    id: `security-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: account?.id || "",
    userName: account ? fullName(account) : "Compte non identifié",
    userRole: account?.role || "inconnu",
    action,
    status,
    createdAt: now,
    deviceInfo: navigator.platform || "Appareil non renseigné",
    browserInfo: navigator.userAgent || "Navigateur non renseigné"
  };
  data.securityLogs = data.securityLogs || [];
  data.securityLogs.unshift(log);
  const loginLog = {
    id: `login-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: log.userId,
    userName: log.userName,
    userRole: log.userRole,
    accessCodeMasked: "••••",
    loginStatus: action === "password_reset_success" ? "réinitialisation" : "réinitialisation refusée",
    createdAt: now,
    deviceInfo: log.deviceInfo,
    browserInfo: log.browserInfo
  };
  data.loginLogs = data.loginLogs || [];
  data.loginLogs.unshift(loginLog);
  data.loginLogs = data.loginLogs.slice(0, 200);
  saveSecurityLogToFirestore(log);
  saveLoginLogToFirestore(loginLog);
}

function generateRecoveryCode() {
  return generateUniqueAccessCode();
}

async function completeFirstLoginCode(event) {
  event.preventDefault();
  const account = firstLoginAccount();
  if (!account) return alert("Compte introuvable.");
  const newCode = event.currentTarget.elements.newCode.value.trim();
  const confirmCode = event.currentTarget.elements.confirmCode.value.trim();
  const error = validateCode(newCode, confirmCode);
  if (error) return alert(error);
  const recoveryCode = generateRecoveryCode();
  account.accessCodeHash = await hashSecret(newCode);
  account.passwordHash = account.accessCodeHash;
  account.recoveryCodeHash = await hashSecret(recoveryCode);
  account.recoveryAnswerHash = "";
  account.accessCode = "";
  account.temporaryAccessHash = "";
  account.temporaryAccessCode = "";
  account.isTemporaryCode = false;
  account.firstLoginCompleted = true;
  account.failedLoginAttempts = 0;
  account.loginBlockedUntil = "";
  account.resetRequired = false;
  account.passwordUpdatedAt = new Date().toISOString();
  account.accessCodeUpdatedAt = account.passwordUpdatedAt;
  account.updatedAt = account.passwordUpdatedAt;
  recordSecurityLog(account, "first_login_completed");
  saveData();
  saveCollectionItemToFirestore(state.firstLoginType, account);
  alert(`Code de récupération unique à conserver : ${recoveryCode}\n\nIl ne sera plus affiché ensuite.`);
  state.firstLoginType = "";
  state.firstLoginId = "";
  state.user = account;
  state.activeApp = canChooseApplication(account) ? "" : "gts";
  saveSession(account);
  render();
}

function mergeInterfaceConfig(config = {}) {
  const defaults = defaultInterfaceConfig();
  const merged = {
    ...defaults,
    ...config,
    dashboardCards: {
      ...defaults.dashboardCards,
      ...(config.dashboardCards || {})
    },
    menuLayout: {
      ...defaults.menuLayout,
      ...(config.menuLayout || {})
    },
    menuLabels: {
      ...defaults.menuLabels,
      ...(config.menuLabels || {})
    },
    roleVisibility: {
      ...defaults.roleVisibility,
      ...(config.roleVisibility || {})
    }
  };
  ["admin", "driver"].forEach((role) => {
    merged.dashboardCards[role] = (merged.dashboardCards[role] || []).map((card) => {
      if (card.id === "plate") return { ...card, id: "outOfServiceVehicles", label: "Véhicules hors service" };
      if (card.id === "outOfServiceVehicles" && card.label === "Plaque") return { ...card, label: "Véhicules hors service" };
      return card;
    });
  });
  return merged;
}

function interfaceConfig() {
  data.interfaceConfig = mergeInterfaceConfig(data.interfaceConfig);
  return data.interfaceConfig;
}

function roleKey() {
  return state.user?.role || "admin";
}

function dashboardConfigFor(role = roleKey()) {
  return [...(interfaceConfig().dashboardCards?.[role] || [])].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

function dashboardCardSetting(role, id, fallbackLabel) {
  return dashboardConfigFor(role).find((card) => card.id === id) || { id, label: fallbackLabel, visible: true, order: 999 };
}

function dashboardCardLabel(id, fallbackLabel, role = roleKey()) {
  return dashboardCardSetting(role, id, fallbackLabel).label || fallbackLabel;
}

function dashboardCardVisible(id, role = roleKey()) {
  return dashboardCardSetting(role, id, "").visible !== false;
}

function orderedDashboardCards(role, cards) {
  return cards
    .map((card, index) => {
      const setting = dashboardCardSetting(role, card.id, card.label);
      return { ...card, label: setting.label || card.label, visible: setting.visible !== false, order: Number(setting.order || index + 1) };
    })
    .filter((card) => card.visible)
    .sort((a, b) => a.order - b.order)
    .map((card) => card.render(card.label))
    .join("");
}

function dashboardOutOfServiceMetric(label, child = null) {
  return metricButton(label, outOfServiceVehiclesForCurrentUser(child).length, "out-of-service-vehicles");
}

function baseNavigationItems(role = roleKey()) {
  if (role === "support") return [
    { screen: "dashboard", label: "Centre Support" },
    ...(canAccessRequestsModule() ? [{ screen: "requests", label: "Demandes", badge: requestsMenuBadge() }] : []),
    { screen: "loginLogs", label: "Connexions" },
    { screen: "settings", label: "Réglages" }
  ];
  if (role === "admin" && isPrimaryAdmin()) return [
    { screen: "dashboard", label: "Supervision technique" },
    { screen: "loginLogs", label: "Journal connexions" },
    { screen: "permissionTests", label: "Tests permissions" },
    { screen: "settings", label: "Configuration technique" },
    { screen: "support", label: "Support technique" }
  ];
  if (role === "parent") return [
    { screen: "dashboard", label: parentT("nav.dashboard") },
    { screen: "children", label: parentT("nav.children") },
    { screen: "messages", label: messagesNavLabel() },
    { screen: "settings", label: parentT("nav.preferences") },
    { screen: "contact", label: parentT("nav.contact") }
  ];
  if (role === "driver") return [
    { screen: "dashboard", label: "Tableau de bord" },
    { screen: "vehicles", label: "Véhicules" },
    { screen: "drivers", label: "Chauffeurs" },
    { screen: "assistants", label: "Convoyeuse" },
    { screen: "children", label: "Élèves" },
    { screen: "circuits", label: "Circuits" },
    { screen: "transfers", label: "Mes transferts" },
    { screen: "replacementRules", label: "Organisation transferts" },
    { screen: "schools", label: "Écoles" },
    { screen: "messages", label: messagesNavLabel() },
    ...(canAccessRequestsModule() ? [{ screen: "requests", label: "Demandes", badge: requestsMenuBadge() }] : []),
    { screen: "settings", label: "Réglages" },
    ...(canAccessSncbApp() ? [{ screen: "sncbApp", label: "SNCB" }] : []),
    { screen: "support", label: supportNavLabel() }
  ];
  if (role === "assistant") return [
    { screen: "dashboard", label: "Tableau de bord" },
    { screen: "children", label: "Élèves" },
    { screen: "schools", label: "Écoles" },
    { screen: "transfers", label: "Mes transferts" },
    { screen: "replacementRules", label: "Organisation transferts" },
    { screen: "messages", label: messagesNavLabel() },
    { screen: "drivers", label: "Chauffeur" },
    { screen: "settings", label: "Réglages" },
    { screen: "support", label: supportNavLabel() }
  ];
  if (role === "admin") return [
    { screen: "dashboard", label: "Tableau de bord" },
    { screen: "transportGroup", label: "Gestion transport" },
    { screen: "replacementRules", label: "Organisation transferts" },
    { screen: "messages", label: messagesNavLabel() },
    { screen: "history", label: "Historique" },
    { screen: "securityGroup", label: "Accès & sécurité" },
    { screen: "settings", label: "Réglages" },
    { screen: "support", label: supportNavLabel() }
  ];
  return [
    { screen: "dashboard", label: "Tableau de bord" },
    { screen: "children", label: "Élèves" },
    { screen: "drivers", label: "Chauffeurs" },
    { screen: "assistants", label: "Convoyeuses" },
    { screen: "vehicles", label: "Véhicules" },
    { screen: "schools", label: "Écoles" },
    { screen: "circuits", label: "Circuits" },
    { screen: "replacementRules", label: "Organisation transferts" },
    { screen: "messages", label: messagesNavLabel() },
    { screen: "users", label: "Codes d’accès" },
    { screen: "loginLogs", label: "Connexions" },
    ...(canAccessRequestsModule() ? [{ screen: "requests", label: "Demandes", badge: requestsMenuBadge() }] : []),
    { screen: "settings", label: "Réglages" },
    { screen: "support", label: supportNavLabel() }
  ];
}

function configuredNavigationItems(role = roleKey()) {
  const config = interfaceConfig();
  const base = baseNavigationItems(role);
  const byScreen = new Map(base.map((item, index) => [item.screen, { ...item, order: index + 1 }]));
  (config.menuLayout?.[role] || []).forEach((screen, index) => {
    if (byScreen.has(screen)) byScreen.get(screen).order = index + 1;
  });
  return [...byScreen.values()]
    .map((item) => ({
      ...item,
      label: config.menuLabels?.[role]?.[item.screen] || config.menuLabels?.[item.screen] || item.label,
      visible: config.roleVisibility?.[role]?.[item.screen] !== false
    }))
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);
}

function renderNavigationItems(items) {
  return items.map((item) => `<button class="nav-item ${state.screen === item.screen ? "active" : ""}" data-screen="${esc(item.screen)}">${esc(item.label)}${item.badge ? ` <b class="nav-badge">${esc(item.badge)}</b>` : ""}</button>`).join("");
}

function renderApp() {
  document.getElementById("root").innerHTML = `
    <div class="${appShellClass()}">
      <aside class="sidebar">
        <div class="sidebar-head">${roleBrandLogo()}</div>
        <div class="user-pill"><span>●</span><span>${esc(sidebarUserName())}</span></div>
        <nav>
          ${navigationItems()}
          <button class="nav-item mobile-more-toggle ${state.mobileMoreOpen ? "active" : ""}" type="button" data-mobile-more-toggle>Plus</button>
        </nav>
      </aside>
      ${mobileMorePanel()}
      <div class="main-area">
        <header class="topbar">
          <div class="topbar-title"><div><strong>${usesSpwIdentity() ? "Gestion Transport Scolaire SPW" : "Gestion Transport Scolaire"}</strong></div></div>
          <div class="topbar-actions">
            ${offlineStatusBadge()}
            ${serviceStatusHeaderBadge()}
            ${!isSupportAssistanceSession() && canAccessSncbApp() ? `<button class="secondary-button compact-action" type="button" data-change-app>Changer d’application</button>` : ""}
            <button class="icon-button topbar-icon-button" type="button" data-screen="settings" title="Réglages" aria-label="Réglages">⚙</button>
            <button class="icon-button topbar-icon-button" id="logout-button" title="Se déconnecter" aria-label="Se déconnecter">⏻</button>
          </div>
        </header>
        <main class="content">
          ${adminInfoBar()}
          ${supportAssistanceBanner()}
          ${isParent() ? (!["contact", "settings"].includes(state.screen) ? parentChildTabs() : "") : isSupport() || isPrimaryAdmin() || state.screen === "support" ? "" : searchBox()}
          ${filterBanner()}
          ${offlineStatusCard()}
          ${content()}
          ${deleteChildDialog()}
          ${notificationToast()}
        </main>
      </div>
    </div>`;
  bindEvents();
}

function navigationItems() {
  return renderNavigationItems(configuredNavigationItems());
}

function mobileMorePanel() {
  if (!state.mobileMoreOpen) return "";
  const items = mobileMoreItems();
  return `<div class="mobile-more-backdrop" data-mobile-more-close></div>
    <section class="mobile-more-panel">
      <div class="mobile-more-head"><strong>Plus</strong><button class="icon-button" type="button" data-mobile-more-close>×</button></div>
      <div class="mobile-more-grid">
        ${items.map((item) => `<button class="nav-item ${state.screen === item.screen ? "active" : ""}" data-screen="${esc(item.screen)}">${esc(item.label)}${item.badge ? ` <b class="nav-badge">${esc(item.badge)}</b>` : ""}</button>`).join("") || `<p class="muted">Aucune autre section.</p>`}
      </div>
    </section>`;
}

function mobileMoreItems() {
  if (isSupport()) return configuredNavigationItems("support").filter((item) => item.screen !== "dashboard" && item.screen !== "settings");
  if (isPrimaryAdmin()) return configuredNavigationItems("admin").filter((item) => !["dashboard", "settings"].includes(item.screen));
  if (isParent()) return [];
  if (state.user?.role === "driver") return configuredNavigationItems("driver").filter((item) => !["dashboard", "children", "messages", "settings", "support"].includes(item.screen));
  if (state.user?.role === "assistant") return configuredNavigationItems("assistant").filter((item) => !["dashboard", "children", "messages", "settings", "support"].includes(item.screen));
  if (isAdmin()) return configuredNavigationItems("admin").filter((item) => !["dashboard", "children", "messages", "settings", "support"].includes(item.screen));
  return [];
}

function messagesNavLabel() {
  const unread = privateUnreadCount() + roleAnnouncementUnreadCount() + teamUnreadCount("team") + directUnreadCount();
  const label = isParent() ? parentT("nav.messages") : "Messages";
  return `${label}${unread ? ` (${unread})` : ""}`;
}

function supportNavLabel() {
  const unread = supportUnreadCount();
  return `Centre Support${unread ? ` (${unread})` : ""}`;
}

function adminInfoBar() {
  if (!isAdmin()) return "";
  if (isPrimaryAdmin()) return "";
  const driver = selectedDashboardDriver();
  if (!driver) {
    return "";
  }
  const scoped = relatedSetForFilter();
  const vehicle = scoped.vehicles[0];
  const assistant = scoped.assistants[0];
  const circuits = scoped.circuits.map((circuit) => circuit.name).join(", ") || driver.schoolCircuit || "Non renseigné";
  const schools = scoped.schools.map((school) => school.name).join(", ") || driver.schoolName || "Non renseigné";
  const vehicleSummary = usesSpwIdentity()
    ? `${vehicle?.busNumber || driver.busNumber || "Bus non renseigné"}`
    : `${vehicle?.busNumber || driver.busNumber || "Bus non renseigné"} · ${vehicle?.licensePlate || driver.licensePlate || "Plaque non renseignée"}`;
  return `<section class="admin-info-bar is-filtered"><div class="admin-info-brand">${logo(true)}${companyLogo()}</div><div><span class="admin-info-kicker">Chauffeur sélectionné</span><h2>${esc(fullName(driver))}</h2><p>${esc(driver.phone || "Téléphone non renseigné")} · ${esc(vehicleSummary)}</p></div><div class="admin-info-grid"><span><b>Véhicule</b>${esc(vehicle?.busNumber || driver.busNumber || "Non renseigné")}</span><span><b>Circuit</b>${esc(circuits)}</span><span><b>École</b>${esc(schools)}</span><span><b>Convoyeuse</b>${esc(assistant ? fullName(assistant) : "Non renseigné")}</span><span><b>Élèves</b>${esc(scoped.children.length)}</span></div><div class="admin-info-badges"><span>Gestionnaire de transport</span><span>Circuit ${esc(circuits)}</span><span>${esc(schools)}</span></div></section>`;
}

function supportAssistanceBanner() {
  const session = supportAssistanceInfo();
  if (!session) return "";
  return `<section class="notice-card support-assistance-banner">
    <div>
      <strong>Mode assistance support</strong>
      <p>Le support consulte la session de ${esc(session.assistanceOwnerName || fullName(state.user))} en lecture seule. Les données sensibles sont masquées.</p>
      <small>Expire le ${esc(formatDateTime(new Date(Number(session.assistanceExpiresAt || 0)).toISOString()))}</small>
    </div>
  </section>`;
}

function deleteChildDialog() {
  if (isPrimaryAdmin()) return "";
  if (!state.pendingDeleteChildId) return "";
  const child = data.children.find((item) => item.id === state.pendingDeleteChildId);
  return `<div class="modal-backdrop"><article class="info-card confirm-dialog"><h3>${esc(parentT("action.delete"))} ${esc(parentT("child.fileTitle"))}</h3><p>${esc(parentT("child.deleteConfirm"))}</p><p class="muted">${esc(child ? fullName(child) : parentT("child.fileTitle"))}</p><div class="form-actions"><button class="secondary-button" id="cancel-child-delete" type="button">${esc(parentT("action.cancel"))}</button><button class="danger-button" id="confirm-child-delete" type="button">${esc(parentT("action.deleteForever"))}</button></div></article></div>`;
}

function filterBanner() {
  if (!isAdmin() || !state.activeFilter) return "";
  if (isPrimaryAdmin()) return "";
  return `<div class="notice-card filter-banner"><p><strong>Filtre actif</strong><br>${esc(activeFilterLabel())}</p><button class="secondary-button" id="reset-filter-button" type="button">Afficher toutes les données</button></div>`;
}

function activeFilterLabel() {
  if (!state.activeFilter) return "";
  const item = (data[state.activeFilter.type] || []).find((entry) => entry.id === state.activeFilter.id);
  return item ? `${titleFor(state.activeFilter.type)} : ${itemTitle(state.activeFilter.type, item)}` : "Element introuvable";
}

function selectedDashboardDriver() {
  if (isAdmin() && state.activeFilter?.type === "drivers") {
    return data.drivers.find((driver) => driver.id === state.activeFilter.id) || null;
  }
  if (isAdmin() && state.activeFilter?.type === "assistants") {
    const scoped = relatedSetForFilter();
    return scoped.drivers[0] || null;
  }
  if (state.user?.role === "driver") return data.drivers.find((driver) => driver.id === state.user.id) || null;
  return null;
}

function content() {
  if (isSupport() && state.screen === "loginLogs") return loginLogsView();
  if (isSupport() && state.screen === "replacementRules") return replacementRulesView();
  if (isSupport()) return supportDashboard();
  if (isParent()) return parentContent();
  if (isPrimaryAdmin()) return primaryAdminContent();
  if (state.screen === "support") return canAccessSupportCenter() ? supportCenterView() : dashboard();
  if (state.screen === "requests") return canAccessRequestsModule() ? requestsView() : dashboard();
  if (state.editingType) return genericEditView(state.editingType, state.editingId);
  if (state.editingChildId) return editChildView(state.editingChildId);
  if (state.selectedType) return genericDetailView(state.selectedType, state.selectedId);
  if (state.selectedChildId) {
    const child = childVisibleFromCurrentContext(state.selectedChildId);
    return child ? childDetail(child) : `<article class="info-card"><p>Élève introuvable.</p></article>`;
  }
  if (state.screen === "search") return searchView();
  if (state.screen === "transportGroup") return isAdmin() ? transportGroupView() : dashboard();
  if (state.screen === "securityGroup") return isAdmin() ? securityGroupView() : dashboard();
  if (state.screen === "history") return canViewHistoryLogs() ? historyView() : dashboard();
  if (state.screen === "replacementRules") return replacementRulesView();
  if (state.screen === "transfers") return ["driver", "assistant"].includes(state.user?.role) ? transfersView() : dashboard();
  if (state.screen === "children") return childrenList();
  if (isSupportAssistanceSession() && state.screen === "messages") return `<article class="info-card privacy-masked-card"><h3>Messages</h3><p>Information masquée pour confidentialité</p></article>`;
  if (state.screen === "messages" && ["admin", "parent", "driver", "assistant"].includes(state.user?.role)) return messagesView();
  if (["drivers", "assistants", "vehicles", "schools", "circuits"].includes(state.screen)) return genericListView(state.screen);
  if (state.screen === "users") return isAdmin() ? adminUsersView() : dashboard();
  if (state.screen === "admins") {
    state.screen = "settings";
    state.settingsTab = "admin";
    return isAdmin() ? settingsView() : dashboard();
  }
  if (state.screen === "loginLogs") return (isAdmin() || isSupport()) ? loginLogsView() : dashboard();
  if (state.screen === "parentCodes") {
    state.screen = "users";
    state.accessCodesTab = "parents";
    return isAdmin() ? adminUsersView() : dashboard();
  }
  if (state.screen === "settings") return (isAdmin() || isSupport() || isParent() || ["driver", "assistant"].includes(state.user?.role)) ? settingsView() : dashboard();
  return dashboard();
}

function searchBox() {
  const results = state.search.trim().length >= 2 ? searchAll(state.search).slice(0, 8) : [];
  return `
    <div class="search-box">
      <span>⌕</span>
      <input id="global-search" value="${esc(state.search)}" placeholder="Rechercher élève, téléphone, arrêt, circuit, école...">
      ${results.length ? `<div class="search-results">${results.map((result) => `
        <button data-open-type="${esc(result.type)}" data-open-id="${esc(result.id)}" data-filter-result="1">
          <b>${esc(result.title)}</b>
          <span>${esc(result.label)}</span>
        </button>`).join("")}</div>` : ""}
    </div>`;
}

function primaryAdminContent() {
  if (state.screen === "loginLogs") return loginLogsView();
  if (state.screen === "permissionTests") return permissionTestsView();
  if (state.screen === "settings") return primaryAdminSettingsView();
  if (state.screen === "support") return primaryAdminSupportView();
  return primaryAdminDashboard();
}

function parentChildTabs() {
  if (!isParent()) return "";
  const children = visibleChildren();
  if (!children.length) return `<article class="notice-card"><p>${esc(parentT("parent.noChildren"))}</p></article>`;
  const selected = selectedParentChild();
  return `<div class="parent-controls">
    <div class="parent-tabs">${children.map((child) => `<button class="${selected?.id === child.id ? "active" : ""}" data-parent-child="${esc(child.id)}">${esc(child.firstName || fullName(child))}</button>`).join("")}</div>
  </div>`;
}

function selectedParentChild() {
  const children = visibleChildren();
  if (!children.length) return null;
  return children.find((child) => child.id === state.parentChildId) || children[0];
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function tomorrowDateString() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return localDateString(date);
}

function absenceCircuitIdForChild(child = {}) {
  return child.pickupCircuitId || circuitRef(child, "pickupCircuitId", child.circuitNumber) || child.circuitNumber || "";
}

function activeAbsenceForChild(child, date = localDateString()) {
  if (!child?.id) return null;
  return visibleStudentAbsences().find((absence) =>
    absence.studentId === child.id &&
    absence.dateAbsence === date &&
    absence.status === "absence_parent_declared"
  ) || null;
}

function visibleStudentAbsences() {
  if (!state.user) return [];
  const absences = data.studentAbsences || [];
  if (isParent()) {
    const linked = new Set(state.user.linkedChildrenIds || []);
    return absences.filter((absence) => absence.parentId === state.user.id || linked.has(absence.studentId));
  }
  if (["driver", "assistant"].includes(state.user.role)) {
    const visibleIds = new Set(visibleChildren().map((child) => child.id));
    const circuitRefs = new Set(visibleChildren().flatMap((child) => [
      child.circuitNumber,
      child.pickupCircuitId,
      child.schoolCircuitId,
      childPickupCircuitLabel(child),
      childSchoolCircuitLabel(child)
    ].filter(Boolean)));
    return absences.filter((absence) => visibleIds.has(absence.studentId) || circuitRefs.has(absence.circuitId));
  }
  return [];
}

function absenceBadge(child) {
  return activeAbsenceForChild(child) ? `<b class="badge danger">Absent</b>` : "";
}

function transferCircuitIdForChild(child = {}) {
  return child.pickupCircuitId || circuitRef(child, "pickupCircuitId", child.circuitNumber) || child.circuitNumber || "";
}

function transferNameForChild(child = {}) {
  return child.transferLocation || child.transferCircuit || (child.circuitNumber ? `Circuit ${child.circuitNumber}` : "Transfert non renseigné");
}

function transferKeyFor(child = {}) {
  const circuitId = transferCircuitIdForChild(child);
  const name = transferNameForChild(child);
  return `transfer-${slugify(circuitId || "sans-circuit")}-${slugify(name || child.id || "sans-nom")}`;
}

function buildDerivedTransportTransfers() {
  const transfers = new Map();
  (data.children || []).forEach((child) => {
    const circuitId = transferCircuitIdForChild(child);
    const circuit = circuitByRef(circuitId);
    const transferId = child.transferId || transferKeyFor(child);
    const existing = transfers.get(transferId) || {
      transferId,
      id: transferId,
      transferName: transferNameForChild(child),
      circuitId,
      driverId: child.driverId || circuit?.driverId || childDriver(child)?.id || "",
      convoyeurId: child.assistantId || circuit?.assistantId || childAssistant(child)?.id || "",
      studentsIds: [],
      parentIds: []
    };
    if (!existing.circuitId && circuitId) existing.circuitId = circuitId;
    if (!existing.driverId) existing.driverId = child.driverId || circuit?.driverId || "";
    if (!existing.convoyeurId) existing.convoyeurId = child.assistantId || circuit?.assistantId || "";
    existing.studentsIds = Array.from(new Set([...(existing.studentsIds || []), child.id].filter(Boolean)));
    existing.parentIds = Array.from(new Set([...(existing.parentIds || []), ...(child.parentIds || [])].filter(Boolean)));
    transfers.set(transferId, existing);
  });
  return [...transfers.values()];
}

function allTransportTransfers() {
  const byId = new Map();
  [...(data.transportTransfers || []), ...buildDerivedTransportTransfers()].forEach((transfer) => {
    const id = transfer.transferId || transfer.id;
    if (!id) return;
    const existing = byId.get(id) || {};
    byId.set(id, {
      ...existing,
      ...transfer,
      id,
      transferId: id,
      studentsIds: Array.from(new Set([...(existing.studentsIds || []), ...(transfer.studentsIds || [])].filter(Boolean))),
      parentIds: Array.from(new Set([...(existing.parentIds || []), ...(transfer.parentIds || [])].filter(Boolean)))
    });
  });
  return [...byId.values()];
}

function canSeeTransfer(transfer = {}) {
  if (!state.user || isSupport() || usesSpwIdentity()) return false;
  if (isPrimaryAdmin()) return false;
  if (isAdmin()) return true;
  if (isParent()) {
    const linked = new Set(state.user.linkedChildrenIds || []);
    return (transfer.parentIds || []).includes(state.user.id) || (transfer.studentsIds || []).some((id) => linked.has(id));
  }
  if (state.user.role === "driver") {
    return transfer.driverId === state.user.id || userCircuitNames().has(transfer.circuitId) || transferHasVisibleStudent(transfer);
  }
  if (state.user.role === "assistant") {
    return transfer.convoyeurId === state.user.id || transfer.assistantId === state.user.id || userCircuitNames().has(transfer.circuitId) || transferHasVisibleStudent(transfer);
  }
  return false;
}

function transferHasVisibleStudent(transfer = {}) {
  const visibleIds = new Set(visibleChildren().map((child) => child.id));
  return (transfer.studentsIds || []).some((id) => visibleIds.has(id));
}

function visibleTransportTransfers() {
  return allTransportTransfers()
    .filter(canSeeTransfer)
    .sort((a, b) => String(a.transferName || "").localeCompare(String(b.transferName || ""), "fr"));
}

function canManageTransferDelay(transfer = {}) {
  if (!["driver", "assistant"].includes(state.user?.role)) return false;
  if (!canSeeTransfer(transfer)) return false;
  if (state.user.role === "driver") return transfer.driverId === state.user.id || userCircuitNames().has(transfer.circuitId);
  return transfer.convoyeurId === state.user.id || transfer.assistantId === state.user.id || userCircuitNames().has(transfer.circuitId);
}

function transferById(transferId) {
  return allTransportTransfers().find((transfer) => transfer.transferId === transferId || transfer.id === transferId) || null;
}

function canSeeTransferDelay(delay = {}) {
  if (!state.user || isSupport() || usesSpwIdentity()) return false;
  if (isPrimaryAdmin()) return false;
  if (isAdmin()) return true;
  const transfer = transferById(delay.transferId);
  if (transfer && canSeeTransfer(transfer)) return true;
  if (isParent()) {
    const linked = new Set(state.user.linkedChildrenIds || []);
    return (delay.parentIds || []).includes(state.user.id) || (delay.studentsIds || []).some((id) => linked.has(id));
  }
  if (state.user.role === "driver") return delay.driverId === state.user.id || userCircuitNames().has(delay.circuitId);
  if (state.user.role === "assistant") return delay.convoyeurId === state.user.id || delay.assistantId === state.user.id || userCircuitNames().has(delay.circuitId);
  return false;
}

function activeTransferDelays() {
  return (data.transferDelays || [])
    .filter((delay) => delay.status === "active" && canSeeTransferDelay(delay))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function activeDelayForTransfer(transfer = {}) {
  return activeTransferDelays().find((delay) =>
    delay.transferId === transfer.transferId ||
    (delay.circuitId && delay.circuitId === transfer.circuitId)
  ) || null;
}

function activeDelayForChild(child = {}) {
  return activeTransferDelays().find((delay) =>
    (delay.studentsIds || []).includes(child.id) ||
    delay.transferId === child.transferId ||
    delay.transferId === transferKeyFor(child) ||
    (delay.circuitId && [child.circuitNumber, child.pickupCircuitId, child.schoolCircuitId, childPickupCircuitLabel(child), childSchoolCircuitLabel(child)].includes(delay.circuitId))
  ) || null;
}

function delayBadge(child) {
  return activeDelayForChild(child) ? `<b class="badge warning">Retard en cours</b>` : "";
}

function transferDelayAlerts(child = null) {
  const delays = child ? [activeDelayForChild(child)].filter(Boolean) : activeTransferDelays();
  if (!delays.length) return "";
  if (isParent()) {
    const delay = delays[0];
    return `<article class="notice-card transfer-delay-alert"><p><strong>Retard en cours</strong><br>Le circuit a actuellement environ ${esc(delay.delayMinutes)} minutes de retard.</p></article>`;
  }
  return `<article class="pending-card transfer-delay-alert">
    <div class="pending-head"><div><p class="eyebrow">Retards</p><h3>Retard en cours</h3><span>${esc(delays.length)} transfert${delays.length > 1 ? "s" : ""} concerné${delays.length > 1 ? "s" : ""}</span></div><b class="badge warning">${esc(delays.length)}</b></div>
    <div class="quick-list-inner">${delays.map((delay) => `<div class="child-row as-static"><span>${esc(delay.transferName || "Transfert")}</span><small>${esc([delay.circuitId, `${delay.delayMinutes} min`, delay.reason].filter(Boolean).join(" - "))}</small><b class="badge warning">Retard en cours</b></div>`).join("")}</div>
  </article>`;
}

function parentContent() {
  if (state.screen === "settings") return parentSettingsView();
  if (state.screen === "contact") return parentContactView();
  const child = selectedParentChild();
  if (!child) return `<section class="view-stack"><article class="info-card"><p>${esc(parentT("parent.noAccess"))}</p></article></section>`;
  if (state.parentRequestChildId) return parentChangeForm(child);
  if (parentMedicalHelpNeedsCompletion(child)) return parentChangeForm(child, true);
  if (state.screen === "messages") return messagesView();
  if (state.screen === "children") return parentChildFile(child);
  return parentDashboard(child);
}

function parentContactView() {
  const contact = data.parentContact || {};
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Contact</p><h2>${esc(contact.title || "Contact transport scolaire")}</h2></div>
    <article class="info-card">
      ${sectionRows([
        ["Téléphone", contact.phone],
        ["Adresse e-mail", contact.email],
        ["Adresse", contact.address],
        ["Horaires", contact.openingHours],
        ["Message", contact.message]
      ])}
    </article>
  </section>`;
}

function parentDashboard(child) {
  const vehicle = childVehicle(child);
  const driver = childDriver(child);
  const assistant = childAssistant(child);
  const medicalSheet = normalizeMedicalHelpSheet(child);
  const cards = [
    { id: "school", label: parentT("dashboard.school"), render: (label) => metric(label, child.schoolName || parentT("common.unknown")) },
    { id: "circuit", label: parentT("dashboard.circuit"), render: (label) => metric(label, child.circuitNumber || parentT("common.unknown")) },
    { id: "bus", label: parentT("dashboard.bus"), render: (label) => metric(label, vehicle?.busNumber || child.transferVehicleId || parentT("common.unknown")) },
    { id: "outOfServiceVehicles", label: "Véhicules hors service", render: (label) => dashboardOutOfServiceMetric(label, child) },
    { id: "driver", label: parentT("dashboard.driver"), render: (label) => metric(label, driver ? fullName(driver) : parentT("common.unknown")) },
    { id: "assistant", label: parentT("dashboard.assistant"), render: (label) => metric(label, assistant ? fullName(assistant) : parentT("common.unknown")) },
    { id: "stop", label: parentT("dashboard.stop"), render: (label) => metric(label, child.pickupStop || parentT("common.unknown")) },
    { id: "important", label: parentT("dashboard.important"), render: (label) => metric(label, medicalSheet.careAdviceNotes || medicalSheet.allergiesDetails || parentT("dashboard.noAlert")) }
  ];
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">${esc(parentT("parent.space"))}</p><h2>${esc(fullName(child))}</h2></div>
    ${vehicleOutOfServiceAlerts(child)}
    ${circuitReplacementAlerts(child)}
    ${transferDelayAlerts(child)}
    ${studentIssuesDashboardCard()}
    <div class="metric-grid parent-metrics">
      ${orderedDashboardCards("parent", cards)}
    </div>
    ${privateMessageNotification()}
    ${dashboardMessagesCard()}
    ${parentAbsenceCard(child)}
    ${parentTransferCard(child)}
  </section>`;
}

function parentAbsenceCard(child) {
  if (!isParent() || !child?.id) return "";
  const todayAbsence = activeAbsenceForChild(child, localDateString());
  return `<article class="info-card">
    <h3>Absence</h3>
    ${todayAbsence ? `<p><strong>Absence déclarée pour aujourd’hui.</strong></p>${todayAbsence.motif ? `<p class="muted">${esc(todayAbsence.motif)}</p>` : ""}` : ""}
    <form class="edit-form compact-form" id="parent-absence-form" data-child-id="${esc(child.id)}">
      <label><span>Date</span><select name="absenceMode">
        <option value="today">Aujourd’hui</option>
        <option value="tomorrow">Demain</option>
        <option value="custom">Date personnalisée</option>
      </select></label>
      ${input("dateAbsence", "Date personnalisée", localDateString(), "date")}
      ${textArea("motif", "Motif optionnel", "")}
      <div class="form-actions"><button class="primary-button compact-action" type="submit">Signaler l’absence</button></div>
    </form>
  </article>`;
}

function studentAbsencesDashboardCard() {
  if (!["driver", "assistant"].includes(state.user?.role)) return "";
  const today = localDateString();
  const absences = visibleStudentAbsences()
    .filter((absence) => absence.dateAbsence === today && absence.status === "absence_parent_declared")
    .sort((a, b) => (a.studentName || "").localeCompare(b.studentName || "", "fr"));
  if (!absences.length) return "";
  return `<article class="pending-card">
    <div class="pending-head"><div><p class="eyebrow">Absences</p><h3>Élève absent aujourd’hui</h3><span>${esc(absences.length)} absence${absences.length > 1 ? "s" : ""} déclarée${absences.length > 1 ? "s" : ""}</span></div><b class="badge danger">${esc(absences.length)}</b></div>
    <div class="quick-list-inner">${absences.map((absence) => `<button class="child-row" type="button" data-open-child="${esc(absence.studentId)}"><span>${esc(absence.studentName || "Élève")}</span><small>${esc([absence.circuitId, absence.motif].filter(Boolean).join(" - "))}</small><b class="badge danger">Absent</b></button>`).join("")}</div>
  </article>`;
}

function parentChildFile(child) {
  return `<section class="view-stack child-detail">
    <div class="detail-head">
      <div><p class="eyebrow">${esc(parentT("parent.file"))}</p><h2>${esc(fullName(child))}</h2></div>
      ${badge(child)}${alternatingCustodyBadge(child)}${specialAttentionBadge(child)}
      <button class="primary-button compact-action" data-parent-request="${esc(child.id)}">${esc(parentT("parent.propose"))}</button>
    </div>
    ${vehicleOutOfServiceAlerts(child)}
    ${circuitReplacementAlerts(child)}
    ${transferDelayAlerts(child)}
    ${studentIssueUrgentAlert(child)}
    ${isParent() ? parentAbsenceCard(child) : ""}
    <div class="detail-grid">
      ${section(parentT("child.info"), [[parentT("child.firstName"), child.firstName], [parentT("child.lastName"), child.lastName], [parentT("child.school"), child.schoolName], [parentT("child.circuitNumber"), child.circuitNumber], [parentT("child.pickupCircuit"), childPickupCircuitLabel(child)], [parentT("child.schoolCircuit"), childSchoolCircuitLabel(child)], [parentT("child.bus"), childVehicle(child)?.busNumber || parentT("common.unknown")], [parentT("dashboard.driver"), childDriver(child) ? fullName(childDriver(child)) : parentT("common.unknown")], [parentT("dashboard.assistant"), childAssistant(child) ? fullName(childAssistant(child)) : parentT("common.unknown")], [parentT("child.assistantPhone"), childAssistant(child)?.phone || parentT("common.unknown")], [parentT("child.stop"), child.pickupStop], [parentT("child.address"), child.homeAddress]])}
      ${parentVehicleSection(child)}
      ${parentTransferCard(child)}
      ${alternatingResidenceSection(child)}
      ${specialAttentionBox(child)}
      ${peopleSection(parentT("people.guardians"), child.responsiblePersons || child.guardians)}
      ${readonlyAuthorizedPeople(child.authorizedPersons || child.authorizedPickupPersons)}
      ${medicalHelpSection(child)}
      ${section(parentT("child.health"), [[parentT("child.parentNotes"), child.parentNotes]])}
      ${studentIssuesSection(child)}
    </div>
  </section>`;
}

function parentVehicleSection(child) {
  return section(parentT("vehicle.title"), [
    [parentT("vehicle.bus"), childVehicle(child)?.busNumber || child.transferVehicleId],
    [parentT("vehicle.driver"), childDriver(child) ? fullName(childDriver(child)) : ""],
    [parentT("vehicle.assistant"), childAssistant(child) ? fullName(childAssistant(child)) : ""],
    [parentT("vehicle.circuit"), child.circuitNumber],
    [parentT("vehicle.school"), child.schoolName]
  ]);
}

function readonlyAuthorizedPeople(people = []) {
  return `<article class="info-card"><h3>${esc(parentT("people.authorized"))}</h3><b class="badge warning">${esc(parentT("people.reserved"))}</b>${people.map((person) => `
    <div class="person-card">
      <strong>${esc(fullName(person))}</strong>
      <span>${esc(person.relation || parentT("people.relationUnknown"))}</span>
      <small>${esc(person.address || parentT("people.addressUnknown"))}</small>
      ${person.phone ? `<small>${esc(person.phone)}</small>` : ""}
      ${person.note ? `<small>${esc(person.note)}</small>` : ""}
    </div>`).join("") || `<p class="muted">${esc(parentT("people.none"))}</p>`}</article>`;
}

function parentTransferCard(child) {
  const changes = child.changesBusAtTransfer || !child.staysInSameBus;
  const vehicle = transferVehicle(child);
  const driver = transferDriver(child);
  const assistant = transferAssistant(child);
  return `<article class="info-card transfer-card ${changes ? "changes" : "same"}">
    <h3>${esc(parentT("transfer.title"))}</h3>
    <b class="badge ${changes ? "warning" : "ok"}">${esc(changes ? parentT("transfer.changeBus") : parentT("transfer.sameBus"))}</b>
    ${sectionRows(isParent() ? [[parentT("transfer.changeBus"), changes ? parentT("common.yes") : parentT("common.no")]] : [[parentT("transfer.changeBus"), changes ? parentT("common.yes") : parentT("common.no")], [parentT("child.transferLocation"), child.transferLocation || parentT("common.unknown")]])}
    ${changes ? sectionRows([[parentT("transfer.newBus"), vehicle?.busNumber || child.transferVehicleId || parentT("common.unknown")], [parentT("transfer.afterCircuit"), child.transferCircuitId || parentT("common.unknown")], [parentT("transfer.newDriver"), driver ? fullName(driver) : parentT("common.unknown")], [parentT("transfer.newAssistant"), assistant ? fullName(assistant) : parentT("common.unknown")], [parentT("child.assistantPhone"), assistant?.phone || parentT("common.unknown")]]) : ""}
  </article>`;
}

function parentChangeForm(child, requiredMedicalCompletion = false) {
  const guardian = parentGuardianForChild(child);
  const syncedAddress = child.homeAddress || guardian.address || "";
  return `<section class="view-stack">
    <div class="detail-head">${requiredMedicalCompletion ? "" : `<button class="icon-button" data-cancel-parent-request title="${esc(parentT("common.back"))}">‹</button>`}<div><p class="eyebrow">${esc(requiredMedicalCompletion ? "Première connexion obligatoire" : parentT("request.edit"))}</p><h2>${esc(fullName(child))}</h2></div></div>
    ${requiredMedicalCompletion ? `<article class="pending-card"><p><strong>Avant d’accéder à la fiche, merci de vérifier et compléter les informations médicales de l’enfant.</strong></p></article>` : ""}
    <form class="edit-form" id="parent-change-form" data-child-id="${esc(child.id)}" data-medical-completion-required="${requiredMedicalCompletion ? "1" : "0"}">
      <article class="info-card form-grid">
        <h3>${esc(requiredMedicalCompletion ? "Fiche médicale / aide à la prise en charge" : parentT("request.title"))}</h3>
        ${addressInput("homeAddress", parentT("child.address"), syncedAddress)}
        ${input("guardianPhone", parentT("request.parentPhone"), guardian.phone || state.user?.phone || "", "tel")}
        ${parentMedicalHelpEditFields(child)}
        ${textArea("parentNotes", parentT("child.parentNotes"), child.parentNotes)}
      </article>
      <div class="form-actions"><button class="primary-button compact-action" type="submit">${esc(requiredMedicalCompletion ? "Valider et accéder à la fiche" : parentT("request.send"))}</button>${requiredMedicalCompletion ? "" : `<button class="secondary-button" type="button" data-cancel-parent-request>${esc(parentT("request.cancel"))}</button>`}</div>
    </form>
  </section>`;
}

function childCircuit(child) {
  return data.circuits.find((circuit) => circuit.name === child.circuitNumber || circuit.id === child.circuitNumber) || null;
}

function childVehicle(child) {
  const circuit = childCircuit(child);
  return data.vehicles.find((vehicle) => vehicle.id === child.vehicleId || vehicle.id === circuit?.vehicleId || vehicle.circuitId === child.circuitNumber || vehicle.busNumber === child.transferVehicleId) || null;
}

function childDriver(child) {
  const circuit = childCircuit(child);
  return data.drivers.find((driver) => driver.id === child.driverId || driver.id === circuit?.driverId || driver.schoolCircuit === child.circuitNumber) || null;
}

function childAssistant(child) {
  const circuit = childCircuit(child);
  return data.assistants.find((assistant) => assistant.id === child.assistantId || assistant.id === circuit?.assistantId || assistant.schoolCircuit === child.circuitNumber) || null;
}

function transferVehicle(child) {
  return data.vehicles.find((vehicle) => vehicle.id === child.transferVehicleId || vehicle.busNumber === child.transferVehicleId || vehicle.id === child.vehicleId) || childVehicle(child);
}

function transferDriver(child) {
  return data.drivers.find((driver) => driver.id === child.transferDriverId) || childDriver(child);
}

function transferAssistant(child) {
  return data.assistants.find((assistant) => assistant.id === child.transferAssistantId) || childAssistant(child);
}

function openChildPdfPreview(child) {
  const pdfWindow = window.open("", "_blank");
  if (!pdfWindow) return alert("Autorisez les fenêtres pop-up pour générer le PDF.");
  const vehicle = childVehicle(child);
  const driver = childDriver(child);
  const assistant = childAssistant(child);
  const transferChanges = child.changesBusAtTransfer || !child.staysInSameBus;
  const transferVehicleData = transferVehicle(child);
  const transferDriverData = transferDriver(child);
  const transferAssistantData = transferAssistant(child);
  const generatedAt = formatDateTime(new Date().toISOString());
  const title = `Fiche élève - ${fullName(child)}`;
  const sections = [
    ["Informations générales", [
      ["Prénom", child.firstName],
      ["Nom", child.lastName],
      ["Date de naissance", child.birthDate],
      ["Âge", age(child.birthDate)],
      ["École", child.schoolName],
      ["Numéro du circuit", child.circuitNumber]
    ]],
    ["Transport", [
      ["Circuit de prise en charge", childPickupCircuitLabel(child)],
      ["Lieu de transfert", child.transferLocation],
      ["Circuit vers l’école", childSchoolCircuitLabel(child)],
      ["Numéro du bus", vehicle?.busNumber || child.transferVehicleId],
      ["Chauffeur associé", driver ? fullName(driver) : ""],
      ["Convoyeuse associée", assistant ? fullName(assistant) : ""],
      ["Téléphone convoyeuse", assistant?.phone],
      ["Arrêt de prise en charge", child.pickupStop],
      ["Adresse", [child.homeAddress, child.postalCode, child.city].filter(Boolean).join(" ")]
    ]],
    ["Transfert entre cars", [
      ["Changement de car", transferChanges ? "oui" : "non"],
      ["Statut", transferChanges ? "Changement de car" : "Reste dans le même car"],
      ...(transferChanges ? [
        ["Nouveau bus", transferVehicleData?.busNumber || child.transferVehicleId],
        ["Circuit après transfert", child.transferCircuitId],
        ["Chauffeur du nouveau car", transferDriverData ? fullName(transferDriverData) : ""],
        ["Convoyeuse du nouveau car", transferAssistantData ? fullName(transferAssistantData) : ""],
        ["Téléphone convoyeuse nouveau car", transferAssistantData?.phone]
      ] : [])
    ]],
    ["Garde alternée", alternatingResidenceRows(child)],
    ["Statut transport", [
      ["Statut transport", child.transportStatus],
      ["Exclusion", child.exclusionType],
      ["Raison exclusion", child.exclusionReason],
      ["Début exclusion", child.exclusionStartDate],
      ["Fin exclusion", child.exclusionEndDate]
    ]],
    ["Responsables", peoplePdfRows(child.guardians)],
    ["Personnes autorisées", peoplePdfRows(child.authorizedPickupPersons)],
    ["Fiche médicale / aide à la prise en charge", medicalHelpRows(child)],
    ["Remarques utiles", [
      ["Notes parents", child.parentNotes],
      ["Notes / informations importantes", child.importantInstructions || child.medicalNotes]
    ]]
  ];
  const pdfPayload = {
    fileName: `fiche-eleve-${slugify(fullName(child)) || child.id || "eleve"}.pdf`,
    title,
    generatedAt,
    childName: fullName(child),
    status: child.transportStatus || "Trajet prévu",
    sections: sections.map(([sectionTitle, rows]) => ({
      title: sectionTitle,
      rows: rows.filter(([label, value]) => value !== undefined && value !== null && String(value).trim() !== "").map(([label, value]) => ({ label, value: String(displayValue(value)) }))
    }))
  };
  const pdfPayloadScript = JSON.stringify(pdfPayload).replace(/</g, "\\u003c");

  pdfWindow.document.open();
  pdfWindow.document.write(`<!doctype html>
    <html lang="fr-BE">
      <head>
        <meta charset="UTF-8">
        <title>${esc(title)}</title>
        <style>
          :root { color: #102033; font-family: Arial, Helvetica, sans-serif; }
          body { margin: 0; background: #eef5fb; }
          .page { max-width: 920px; margin: 0 auto; padding: 28px; }
          .toolbar { display: flex; gap: 10px; justify-content: flex-end; margin-bottom: 16px; }
          button { border: 0; border-radius: 10px; padding: 11px 14px; font-weight: 800; cursor: pointer; }
          .primary { background: #075b8f; color: white; }
          .secondary { background: #f4c542; color: #102033; }
          header { background: #075b8f; color: white; border-radius: 18px; padding: 24px; margin-bottom: 18px; }
          .eyebrow { color: #f4c542; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; font-size: 12px; margin: 0 0 8px; }
          h1 { margin: 0; font-size: 34px; }
          header p { margin: 8px 0 0; color: #dbeaf4; }
          .badge { display: inline-block; margin-top: 14px; border-radius: 999px; padding: 8px 12px; font-weight: 900; background: #f4c542; color: #102033; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
          section { background: white; border: 1px solid #d6e4ef; border-radius: 16px; padding: 18px; break-inside: avoid; }
          h2 { margin: 0 0 12px; color: #075b8f; font-size: 19px; }
          .row { display: grid; grid-template-columns: minmax(145px, .85fr) 1.15fr; gap: 12px; padding: 8px 0; border-top: 1px solid #edf3f7; }
          .row:first-of-type { border-top: 0; }
          .label { color: #587082; font-size: 12px; font-weight: 800; text-transform: uppercase; }
          .value { font-weight: 800; white-space: pre-wrap; }
          @media (max-width: 720px) { .page { padding: 14px; } .grid { grid-template-columns: 1fr; } .row { grid-template-columns: 1fr; gap: 3px; } h1 { font-size: 26px; } }
          @media print { body { background: white; } .page { max-width: none; padding: 0; } .toolbar { display: none; } section, header { box-shadow: none; } }
        </style>
      </head>
      <body>
        <main class="page">
          <div class="toolbar">
            <button class="primary" onclick="downloadPdf()">Télécharger le PDF</button>
            <button class="secondary" onclick="sharePdf()">Exporter / partager le PDF</button>
            <button onclick="window.print()">Imprimer</button>
          </div>
          <header>
            <p class="eyebrow">Gestion Transport Scolaire</p>
            <h1>Fiche élève</h1>
            <p>${esc(fullName(child))} · Généré le ${esc(generatedAt)}</p>
            <span class="badge">${esc(child.transportStatus || "Trajet prévu")}</span>
          </header>
          <div class="grid">
            ${sections.map(([sectionTitle, rows]) => `<section><h2>${esc(sectionTitle)}</h2>${pdfRows(rows)}</section>`).join("")}
          </div>
        </main>
        <script>
          const pdfPayload = ${pdfPayloadScript};

          function pdfHex(text) {
            const source = String(text || "");
            let hex = "FEFF";
            for (let index = 0; index < source.length; index += 1) {
              const code = source.charCodeAt(index).toString(16).toUpperCase().padStart(4, "0");
              hex += code;
            }
            return "<" + hex + ">";
          }

          function wrapPdfText(text, maxLength) {
            const words = String(text || "").replace(/\\s+/g, " ").trim().split(" ");
            const lines = [];
            let line = "";
            words.forEach((word) => {
              const next = line ? line + " " + word : word;
              if (next.length > maxLength && line) {
                lines.push(line);
                line = word;
              } else {
                line = next;
              }
            });
            if (line) lines.push(line);
            return lines.length ? lines : [""];
          }

          function pdfLines(payload) {
            const lines = [
              { text: "Gestion Transport Scolaire", size: 16 },
              { text: "Fiche élève", size: 20 },
              { text: payload.childName + " · Généré le " + payload.generatedAt, size: 11 },
              { text: "Statut : " + payload.status, size: 11 },
              { text: "", size: 8 }
            ];
            payload.sections.forEach((section) => {
              lines.push({ text: section.title, size: 14 });
              if (!section.rows.length) lines.push({ text: "Non renseigné", size: 10 });
              section.rows.forEach((row) => {
                wrapPdfText(row.label + " : " + row.value, 88).forEach((line) => lines.push({ text: line, size: 10 }));
              });
              lines.push({ text: "", size: 7 });
            });
            return lines;
          }

          function createPdfBlob(payload) {
            const allLines = pdfLines(payload);
            const pages = [];
            let current = [];
            allLines.forEach((line) => {
              const lineHeight = line.size >= 14 ? 20 : 15;
              if (current.reduce((total, item) => total + (item.size >= 14 ? 20 : 15), 0) + lineHeight > 740) {
                pages.push(current);
                current = [];
              }
              current.push(line);
            });
            if (current.length) pages.push(current);

            const objects = [null, "", "", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
            const pageIds = [];
            pages.forEach((pageLines) => {
              let y = 800;
              const stream = pageLines.map((line) => {
                const size = line.size || 10;
                const command = "BT /F1 " + size + " Tf 42 " + y + " Td " + pdfHex(line.text) + " Tj ET";
                y -= size >= 14 ? 20 : 15;
                return command;
              }).join("\\n");
              const contentId = objects.length;
              objects.push("<< /Length " + stream.length + " >>\\nstream\\n" + stream + "\\nendstream");
              const pageId = objects.length;
              objects.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents " + contentId + " 0 R >>");
              pageIds.push(pageId);
            });
            objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
            objects[2] = "<< /Type /Pages /Kids [" + pageIds.map((id) => id + " 0 R").join(" ") + "] /Count " + pageIds.length + " >>";

            let output = "%PDF-1.4\\n%\\xE2\\xE3\\xCF\\xD3\\n";
            const offsets = [0];
            for (let index = 1; index < objects.length; index += 1) {
              offsets[index] = output.length;
              output += index + " 0 obj\\n" + objects[index] + "\\nendobj\\n";
            }
            const xrefOffset = output.length;
            output += "xref\\n0 " + objects.length + "\\n0000000000 65535 f \\n";
            for (let index = 1; index < objects.length; index += 1) {
              output += String(offsets[index]).padStart(10, "0") + " 00000 n \\n";
            }
            output += "trailer\\n<< /Size " + objects.length + " /Root 1 0 R >>\\nstartxref\\n" + xrefOffset + "\\n%%EOF";
            return new Blob([new TextEncoder().encode(output)], { type: "application/pdf" });
          }

          function downloadPdf() {
            const blob = createPdfBlob(pdfPayload);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = pdfPayload.fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }

          async function sharePdf() {
            const blob = createPdfBlob(pdfPayload);
            const file = new File([blob], pdfPayload.fileName, { type: "application/pdf" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({ title: document.title, files: [file] });
                return;
              } catch (error) {}
            }
            downloadPdf();
          }
        </script>
      </body>
    </html>`);
  pdfWindow.document.close();
  pdfWindow.focus();
}

function pdfRows(rows) {
  const cleanRows = rows.filter(([label, value]) => value !== undefined && value !== null && String(value).trim() !== "");
  if (!cleanRows.length) return `<p class="value">Non renseigné</p>`;
  return cleanRows.map(([label, value]) => `<div class="row"><span class="label">${esc(label)}</span><span class="value">${esc(displayValue(value) || "Non renseigné")}</span></div>`).join("");
}

function peoplePdfRows(people = []) {
  if (!people.length) return [];
  return people.flatMap((person, index) => [
    [`Personne ${index + 1}`, fullName(person)],
    ["Téléphone", person.phone],
    ["Lien", person.relation],
    ["Adresse", person.address]
  ]);
}

function messagePanel(child) {
  if (!canReadPrivateConversation(child)) return privateConversationMeta(child);
  const messages = childMessages(child.id);
  const linkedParents = parentListForChild(child);
  const transportUserLabel = state.user?.role === "assistant" ? "Message au parent de l’élève" : state.user?.role === "driver" ? "Message au parent de l’élève" : "Nouveau message";
  return `<article class="info-card message-panel">
    <h3>${esc(isParent() ? parentT("messages.privateConversation") : "Conversation privée")}</h3>
    ${!isParent() ? `<p class="muted">Parent(s) lié(s) : ${esc(linkedParents.map(fullName).join(", ") || "aucun parent lié")}</p>` : ""}
    <div class="message-list">${messages.map((message) => `
      <div class="message-item">
        <strong>${esc(message.authorName || "Utilisateur")} <span>${esc(roleLabel(message.authorRole))}</span></strong>
        <p>${esc(message.text)}</p>
        <small>${esc(formatDateTime(message.createdAt))} - ${message.readBy?.includes(state.user.id) ? esc(isParent() ? parentT("messages.read") : "lu") : esc(isParent() ? parentT("messages.unread") : "non lu")}${offlinePendingBadge(message.id)}</small>
        <div class="message-tools">${translateMessageButton(message.text)}${messageDeleteButton("private", message.id, child.id, message)}</div>
      </div>`).join("") || `<p class="muted">${esc(isParent() ? parentT("messages.noChildMessage") : "Aucun message pour cet enfant.")}</p>`}</div>
    <form class="mini-form" data-message-form="${esc(child.id)}">
      <label><span>${esc(isParent() ? parentT("messages.new") : transportUserLabel)}</span><textarea name="messageText" rows="3" placeholder="${esc(isParent() ? parentT("messages.write") : "Écrire un message au parent...")}"></textarea></label>
      <button class="primary-button compact-action" type="submit">${esc(isParent() ? parentT("messages.send") : "Envoyer")}</button>
    </form>
  </article>`;
}

function canDeleteMessage(message, context = "private") {
  if (!message || !state.user) return false;
  if (context === "support") return isSupport() || message.authorId === state.user.id;
  return message.authorId === state.user.id;
}

function messageDeleteButton(type, messageId, ownerId, message) {
  if (!canDeleteMessage(message, type)) return "";
  return `<button class="message-delete-button" type="button" data-delete-message-type="${esc(type)}" data-delete-message-owner="${esc(ownerId)}" data-delete-message-id="${esc(messageId)}">Supprimer</button>`;
}

function privateMessagesView() {
  const conversations = privateConversationsForUser();
  const selected = conversations.find((conversation) => conversation.child.id === state.messageChildId) || conversations[0] || null;
  if (selected && state.messageChildId !== selected.child.id) state.messageChildId = selected.child.id;
  if (selected && privateUnreadForChild(selected.child.id)) markPrivateConversationRead(selected.child.id);
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">${esc(isParent() ? parentT("messages.private") : "Messagerie privée")}</p><h2>${esc(isParent() ? parentT("messages.title") : "Messages")}</h2></div>
    ${privateMessageNotification()}
    <div class="support-layout">
      <article class="info-card">
        <h3>${esc(isParent() ? parentT("messages.recent") : "Conversations récentes")}</h3>
        ${conversations.map((conversation) => privateConversationRow(conversation)).join("") || `<p class="muted">${esc(isParent() ? parentT("messages.none") : "Aucune conversation visible.")}</p>`}
      </article>
      ${selected ? messagePanel(selected.child) : `<article class="info-card"><p class="muted">${esc(isParent() ? parentT("messages.select") : "Sélectionnez une conversation.")}</p></article>`}
    </div>
  </section>`;
}

function messagesView() {
  const tabs = messageTabsForUser();
  if (!tabs.some((tab) => tab.key === state.messagesTab)) state.messagesTab = tabs[0]?.key || "children";
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">${esc(isParent() ? parentT("messages.communication") : "Communication")}</p><h2>${esc(isParent() ? parentT("messages.title") : "Messages")}</h2></div>
    <div class="support-filters">${tabs.map((tab) => `<button class="${state.messagesTab === tab.key ? "active" : ""}" data-message-tab="${esc(tab.key)}">${esc(tab.label)}${tab.badge ? ` <b class="badge danger">${esc(tab.badge)}</b>` : ""}</button>`).join("")}</div>
    ${messageTabContent()}
  </section>`;
}

function messageTabsForUser() {
  const tabs = [{ key: "children", label: isParent() ? parentT("nav.children") : "Élèves", badge: privateUnreadCount() }];
  if (isAdmin() || ["driver", "assistant"].includes(state.user?.role)) tabs.push({ key: "drivers", label: "Chauffeurs", badge: (state.user?.role === "driver" ? roleAnnouncementUnreadCount("driver") : 0) + directUnreadCount("driver") });
  if (isAdmin() || ["driver", "assistant"].includes(state.user?.role)) tabs.push({ key: "assistants", label: "Convoyeuses", badge: (state.user?.role === "assistant" ? roleAnnouncementUnreadCount("assistant") : 0) + directUnreadCount("assistant") });
  if (["driver", "assistant"].includes(state.user?.role)) tabs.push({ key: "team", label: "Équipe transport", badge: teamUnreadCount("team") });
  return tabs;
}

function messageTabContent() {
  if (state.messagesTab === "drivers") return directMessagesView("driver");
  if (state.messagesTab === "assistants") return directMessagesView("assistant");
  if (state.messagesTab === "team") return teamMessagesView("team");
  return privateMessagesPanel();
}

function privateMessagesPanel() {
  if (isAdmin()) {
    return adminDirectMessagesPanel();
  }
  return privateMessagesView();
}

function adminDirectMessagesPanel() {
  const directMessages = Object.entries(data.messages || [])
    .flatMap(([childId, messages]) => {
      const child = data.children.find((item) => item.id === childId) || {};
      return (messages || []).filter((message) => canReadMessage(message, child)).map((message) => ({ child, message }));
    })
    .sort((a, b) => new Date(b.message.createdAt || 0) - new Date(a.message.createdAt || 0));
  return `<article class="info-card"><h3>Messages destinés au gestionnaire de transport</h3>${directMessages.map(({ child, message }) => `
    <div class="message-item">
      <strong>${esc(message.authorName || "Utilisateur")} <span>${esc(roleLabel(message.authorRole))}</span></strong>
      <p>${esc(message.text)}</p>
      <small>${esc(fullName(child))} - ${esc(formatDateTime(message.createdAt))}</small>
      <div class="message-tools">${translateMessageButton(message.text)}${messageDeleteButton("private", message.id, child.id, message)}</div>
    </div>`).join("") || `<p class="muted">Aucun message directement destiné au gestionnaire de transport.</p>`}</article>`;
}

function privateConversationsForUser() {
  if (!["parent", "driver", "assistant"].includes(state.user?.role)) return [];
  return visibleChildren().map((child) => ({ child, messages: childMessages(child.id) }))
    .filter((conversation) => conversation.messages.length || ["parent", "driver", "assistant"].includes(state.user.role))
    .sort((a, b) => new Date(lastPrivateMessage(b)?.createdAt || 0) - new Date(lastPrivateMessage(a)?.createdAt || 0));
}

function privateConversationRow(conversation) {
  const last = lastPrivateMessage(conversation);
  const unread = privateUnreadForChild(conversation.child.id);
  return `<button class="child-row support-row ${state.messageChildId === conversation.child.id ? "active" : ""}" data-open-message-child="${esc(conversation.child.id)}">
    <span>${unread ? `<b class="badge danger">${esc(isParent() ? parentT("messages.new") : "Nouveau message")}</b>` : ""} ${esc(conversation.child.firstName || fullName(conversation.child))}</span>
    <small>${last ? `${esc(last.authorName)} - ${esc(formatDateTime(last.createdAt))}` : esc(isParent() ? parentT("messages.noChildMessage") : "Aucun message")}</small>
    <small>${esc(last?.text || (isParent() ? parentT("messages.open") : "Ouvrir la conversation"))}</small>
  </button>`;
}

function lastPrivateMessage(conversation) {
  return conversation.messages[conversation.messages.length - 1] || null;
}

function privateMessageNotification() {
  const count = privateUnreadCount();
  if (!count || !["parent", "driver", "assistant"].includes(state.user?.role)) return "";
  const isParentUser = isParent();
  return `<article class="pending-card message-alert" data-screen="messages">
    <div class="pending-head"><div><p class="eyebrow">${esc(isParentUser ? parentT("messages.private") : "Messagerie")}</p><h3>${esc(isParentUser ? parentT("messages.new") : "Nouveau message")}</h3><span>${esc(count)} message${count > 1 ? "s" : ""} ${esc(isParentUser ? parentT("messages.unread") : "non lu")}${count > 1 && !isParentUser ? "s" : ""}</span></div><b>${esc(count)}</b></div>
  </article>`;
}

function privateConversationMeta(child) {
  if (isAdmin() || isSupport()) return "";
  const conversation = privateConversationForChild(child.id);
  return `<article class="info-card"><h3>${esc(isParent() ? parentT("messages.privateConversation") : "Conversation privée")}</h3>${sectionRows([[isParent() ? parentT("messages.last") : "Dernier message", conversation.lastMessageAt ? formatDateTime(conversation.lastMessageAt) : (isParent() ? parentT("messages.noChildMessage") : "Aucun message")]])}</article>`;
}

function canReadPrivateConversation(child) {
  if (!child || !state.user) return false;
  if (["admin", "support"].includes(state.user.role)) return false;
  if (state.user.role === "parent") return visibleChildren().some((item) => item.id === child.id);
  return userCircuitNames().has(child.circuitNumber);
}

function childMessages(childId) {
  const child = data.children.find((item) => item.id === childId) || {};
  return [...(data.messages?.[childId] || [])]
    .filter((message) => canReadMessage(message, child))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function canReadMessage(message, child = {}) {
  if (!message || !state.user) return false;
  if (state.user.role === "admin") return message.recipientType === "admin" || (message.recipientIds || []).includes(state.user.id);
  if (state.user.role === "support") return message.recipientType === "support" || (message.recipientIds || []).includes(state.user.id);
  if (state.user.role === "parent") return canReadPrivateConversation(child) && (message.recipientIds || []).includes(state.user.id);
  if (["driver", "assistant"].includes(state.user.role)) return canReadPrivateConversation(child) && (message.recipientIds || []).includes(state.user.id);
  return false;
}

function privateConversationForChild(childId) {
  const child = data.children.find((item) => item.id === childId) || {};
  const messages = childMessages(childId);
  const last = messages[messages.length - 1] || null;
  const parentIds = child.parentIds || [];
  const participantIds = [...new Set([child.driverId, child.assistantId, ...parentIds].filter(Boolean))];
  return {
    conversationId: `child-${childId}`,
    childId,
    participants: participantIds,
    lastMessage: last?.text || "",
    lastMessageAt: last?.createdAt || "",
    createdAt: messages[0]?.createdAt || new Date().toISOString()
  };
}

function privateRecipientIdsForChild(child = {}) {
  return [...new Set([child.driverId, child.assistantId, ...(child.parentIds || [])].filter(Boolean))];
}

function privateParticipantNames(participantIds = []) {
  return participantIds.map((id) => {
    const user = data.users.find((item) => item.id === id) || data.parents.find((item) => item.id === id);
    return user ? `${fullName(user)} (${accountRoleLabel(user)})` : id;
  }).join(", ") || "Non renseigné";
}

function privateUnreadForChild(childId) {
  return childMessages(childId).filter((message) => message.authorId !== state.user?.id && !message.readBy?.includes(state.user?.id)).length;
}

function privateUnreadCount() {
  if (!["parent", "driver", "assistant"].includes(state.user?.role)) return 0;
  return visibleChildren().reduce((total, child) => total + privateUnreadForChild(child.id), 0);
}

function roleAnnouncementsView(targetRole) {
  if (!canSeeRoleAnnouncements(targetRole)) return `<article class="info-card"><p>Accès non autorisé.</p></article>`;
  if (!isAdmin()) markRoleAnnouncementsRead(targetRole);
  const announcements = roleAnnouncementsFor(targetRole);
  const editing = announcements.find((item) => item.id === state.editingAnnouncementId) || null;
  return `<section class="view-stack">
    ${isAdmin() ? announcementForm(targetRole, editing) : ""}
    <div class="card-grid">${announcements.map(announcementCard).join("") || `<article class="info-card"><p class="muted">Aucun message général.</p></article>`}</div>
  </section>`;
}

function directMessagesView(targetRole) {
  if (!isAdmin() && !["driver", "assistant"].includes(state.user?.role)) return `<article class="info-card"><p>Accès non autorisé.</p></article>`;
  const conversations = directConversationsForUser(targetRole);
  const selected = conversations.find((conversation) => conversation.conversationId === state.selectedDirectConversationId) || conversations[0] || null;
  if (selected && selected.conversationId !== state.selectedDirectConversationId) state.selectedDirectConversationId = selected.conversationId;
  if (selected) markDirectConversationRead(selected.conversationId);
  const announcements = targetRole === state.user?.role ? roleAnnouncementsView(targetRole) : "";
  return `<section class="view-stack">
    ${directMessageForm(targetRole)}
    <div class="support-layout">
      <article class="info-card">
        <h3>Conversations ${targetRole === "driver" ? "chauffeurs" : "convoyeuses"}</h3>
        ${conversations.map(directConversationRow).join("") || `<p class="muted">Aucune conversation privée.</p>`}
      </article>
      ${selected ? directConversationPanel(selected) : `<article class="info-card"><p class="muted">Sélectionnez une conversation.</p></article>`}
    </div>
    ${announcements}
  </section>`;
}

function directMessageForm(targetRole) {
  const recipients = directRecipientOptions(targetRole);
  const title = targetRole === "driver" ? "Envoyer un message à un chauffeur" : "Envoyer un message à une convoyeuse";
  const button = targetRole === "driver" ? "Envoyer au chauffeur" : "Envoyer à la convoyeuse";
  return `<form class="edit-form" data-direct-message-form="${esc(targetRole)}">
    <article class="info-card form-grid">
      <h3>${esc(title)}</h3>
      <label><span>${targetRole === "driver" ? "Sélectionner un chauffeur" : "Sélectionner une convoyeuse"}</span><select name="recipientId">${recipients.map((recipient) => `<option value="${esc(recipient.id)}">${esc(directRecipientLabel(targetRole, recipient))}</option>`).join("")}</select></label>
      ${input("subject", "Sujet", "")}
      ${textArea("messageText", "Message", "")}
    </article>
    <div class="form-actions"><button class="primary-button compact-action" type="submit" ${recipients.length ? "" : "disabled"}>${esc(button)}</button></div>
  </form>`;
}

function directRecipientOptions(targetRole) {
  if (targetRole === "driver") return data.drivers || [];
  if (targetRole === "assistant") return data.assistants || [];
  return [];
}

function directRecipientLabel(targetRole, person) {
  const circuit = person.schoolCircuit || (targetRole === "driver" ? data.circuits.find((item) => item.driverId === person.id)?.name : data.circuits.find((item) => item.assistantId === person.id)?.name) || "circuit ?";
  const vehicle = data.vehicles.find((item) => targetRole === "driver" ? item.driverId === person.id : item.assistantId === person.id);
  return `${fullName(person)} - ${circuit} - ${vehicle?.busNumber || person.busNumber || "bus ?"}`;
}

function directConversationsForUser(targetRole = "") {
  return [...(data.directMessages || [])]
    .filter(canReadDirectConversation)
    .filter((conversation) => !targetRole || directCounterpartRole(conversation) === targetRole)
    .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
}

function canReadDirectConversation(conversation) {
  if (!conversation || !state.user) return false;
  if (isSupport() || isParent()) return false;
  if (isAdmin()) return conversation.recipientId === state.user.id || (conversation.recipientIds || []).includes(state.user.id);
  return (conversation.participants || []).includes(state.user.id);
}

function directCounterpartRole(conversation) {
  if (conversation.senderId === state.user?.id) return conversation.recipientRole;
  if (conversation.recipientId === state.user?.id) return conversation.senderRole;
  if (isAdmin()) return conversation.recipientRole || conversation.senderRole;
  return "";
}

function directConversationRow(conversation) {
  const unread = directUnreadForConversation(conversation.conversationId);
  return `<button class="child-row support-row ${state.selectedDirectConversationId === conversation.conversationId ? "active" : ""}" data-open-direct-conversation="${esc(conversation.conversationId)}">
    <span>${unread ? `<b class="badge danger">Nouveau message</b>` : ""} ${esc(conversation.subject || "Conversation privée")}</span>
    <small>${esc(conversation.senderName)} -> ${esc(conversation.recipientName)}</small>
    <small>${esc(conversation.lastMessage || "Ouvrir la conversation")}</small>
  </button>`;
}

function directConversationPanel(conversation) {
  const messages = directMessagesForConversation(conversation.conversationId);
  return `<article class="info-card message-panel">
    <h3>${esc(conversation.subject || "Conversation privée")}</h3>
    <p class="muted">${esc(conversation.senderName)} -> ${esc(conversation.recipientName)}</p>
    <div class="message-list">${messages.map((message) => `
      <div class="message-item">
        <strong>${esc(message.authorName)} <span>${esc(roleLabel(message.authorRole))}</span></strong>
        <p>${esc(message.text)}</p>
        <small>${esc(formatDateTime(message.createdAt))} - ${message.readBy?.includes(state.user.id) ? "lu" : "non lu"}${offlinePendingBadge(message.id)}</small>
        <div class="message-tools">${translateMessageButton(message.text)}${messageDeleteButton("direct", message.id, conversation.conversationId, message)}</div>
      </div>`).join("") || `<p class="muted">Aucun message.</p>`}</div>
    <form class="mini-form" data-direct-reply-form="${esc(conversation.conversationId)}">
      <label><span>Réponse</span><textarea name="directMessageText" rows="3" placeholder="Écrire une réponse..."></textarea></label>
      <button class="primary-button compact-action" type="submit">Envoyer</button>
    </form>
  </article>`;
}

function directMessagesForConversation(conversationId) {
  const conversation = data.directMessages.find((item) => item.conversationId === conversationId);
  if (!conversation || !canReadDirectConversation(conversation)) return [];
  return [...(data.directMessageItems?.[conversationId] || [])]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function directUnreadForConversation(conversationId) {
  return directMessagesForConversation(conversationId).filter((message) => message.authorId !== state.user?.id && !message.readBy?.includes(state.user?.id)).length;
}

function directUnreadCount(targetRole = "") {
  if (!isAdmin() && !["driver", "assistant"].includes(state.user?.role)) return 0;
  return directConversationsForUser(targetRole).reduce((total, conversation) => total + directUnreadForConversation(conversation.conversationId), 0);
}

function markDirectConversationRead(conversationId) {
  let changed = false;
  (data.directMessageItems?.[conversationId] || []).forEach((message) => {
    if (message.authorId !== state.user.id && !message.readBy?.includes(state.user.id)) {
      message.readBy = [...new Set([...(message.readBy || []), state.user.id])];
      changed = true;
    }
  });
  if (changed) saveData();
}

function teamMessagesView(mode) {
  if (!["driver", "assistant"].includes(state.user?.role)) return `<article class="info-card"><p>Accès non autorisé.</p></article>`;
  const conversations = teamConversationsForUser(mode);
  const selected = conversations.find((conversation) => conversation.conversationId === state.selectedTeamConversationId) || conversations[0] || null;
  if (selected && selected.conversationId !== state.selectedTeamConversationId) state.selectedTeamConversationId = selected.conversationId;
  if (selected) markTeamConversationRead(selected.conversationId);
  return `<div class="support-layout">
    <article class="info-card">
      <h3>${mode === "drivers" ? "Chauffeurs" : mode === "assistants" ? "Convoyeuses" : "Équipes transport"}</h3>
      ${conversations.map(teamConversationRow).join("") || `<p class="muted">Aucune équipe liée à vos circuits.</p>`}
    </article>
    ${selected ? teamConversationPanel(selected) : `<article class="info-card"><p class="muted">Sélectionnez une conversation.</p></article>`}
  </div>`;
}

function teamConversationsForUser(mode) {
  return scopedCircuits()
    .filter((circuit) => circuit.driverId && circuit.assistantId)
    .map(teamConversationForCircuit)
    .filter((conversation) => conversation.participants.includes(state.user.id))
    .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
}

function teamConversationForCircuit(circuit) {
  const conversationId = `team-${circuit.id || circuit.name}-${circuit.driverId}-${circuit.assistantId}`;
  const messages = teamMessagesForConversation(conversationId);
  const last = messages[messages.length - 1] || null;
  const conversation = data.teamMessages.find((item) => item.conversationId === conversationId) || {};
  return {
    ...conversation,
    conversationId,
    circuitId: circuit.id || circuit.name,
    circuitName: circuit.name,
    driverId: circuit.driverId,
    assistantId: circuit.assistantId,
    participants: [circuit.driverId, circuit.assistantId].filter(Boolean),
    participantRoles: ["driver", "assistant"],
    lastMessage: last?.text || conversation.lastMessage || "",
    lastMessageAt: last?.createdAt || conversation.lastMessageAt || "",
    createdAt: conversation.createdAt || new Date().toISOString()
  };
}

function teamConversationRow(conversation) {
  const unread = teamUnreadForConversation(conversation.conversationId);
  const driver = data.drivers.find((item) => item.id === conversation.driverId);
  const assistant = data.assistants.find((item) => item.id === conversation.assistantId);
  return `<button class="child-row support-row ${state.selectedTeamConversationId === conversation.conversationId ? "active" : ""}" data-open-team-conversation="${esc(conversation.conversationId)}">
    <span>${unread ? `<b class="badge danger">Nouveau message</b>` : ""} ${esc(conversation.circuitName || conversation.circuitId)}</span>
    <small>${esc(driver ? fullName(driver) : "Chauffeur")} - ${esc(assistant ? fullName(assistant) : "Convoyeuse")}</small>
    <small>${esc(conversation.lastMessage || "Ouvrir la conversation")}</small>
  </button>`;
}

function teamConversationPanel(conversation) {
  const messages = teamMessagesForConversation(conversation.conversationId);
  return `<article class="info-card message-panel">
    <h3>Équipe transport - ${esc(conversation.circuitName || conversation.circuitId)}</h3>
    <div class="message-list">${messages.map((message) => `
      <div class="message-item">
        <strong>${esc(message.authorName)} <span>${esc(roleLabel(message.authorRole))}</span></strong>
        <p>${esc(message.text)}</p>
        <small>${esc(formatDateTime(message.createdAt))} - ${message.readBy?.includes(state.user.id) ? "lu" : "non lu"}${offlinePendingBadge(message.id)}</small>
        <div class="message-tools">${translateMessageButton(message.text)}${messageDeleteButton("team", message.id, conversation.conversationId, message)}</div>
      </div>`).join("") || `<p class="muted">Aucun message.</p>`}</div>
    <form class="mini-form" data-team-message-form="${esc(conversation.conversationId)}">
      <label><span>Nouveau message</span><textarea name="teamMessageText" rows="3" placeholder="Écrire un message..."></textarea></label>
      <button class="primary-button compact-action" type="submit">Envoyer</button>
    </form>
  </article>`;
}

function teamMessagesForConversation(conversationId) {
  return [...(data.teamMessageItems?.[conversationId] || [])]
    .filter(canReadTeamMessage)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function canReadTeamMessage(message) {
  if (!message || !state.user) return false;
  if (state.user.role === "admin") return (message.recipientIds || []).includes(state.user.id);
  if (["support", "parent"].includes(state.user.role)) return false;
  return (message.recipientIds || []).includes(state.user.id);
}

function teamUnreadForConversation(conversationId) {
  return teamMessagesForConversation(conversationId).filter((message) => message.authorId !== state.user.id && !message.readBy?.includes(state.user.id)).length;
}

function teamUnreadCount(mode = "team") {
  if (!["driver", "assistant"].includes(state.user?.role)) return 0;
  return teamConversationsForUser(mode).reduce((total, conversation) => total + teamUnreadForConversation(conversation.conversationId), 0);
}

function markTeamConversationRead(conversationId) {
  let changed = false;
  (data.teamMessageItems?.[conversationId] || []).forEach((message) => {
    if ((message.recipientIds || []).includes(state.user.id) && !message.readBy?.includes(state.user.id)) {
      message.readBy = [...new Set([...(message.readBy || []), state.user.id])];
      changed = true;
    }
  });
  if (changed) saveData();
}

function canSeeRoleAnnouncements(targetRole) {
  if (isPrimaryAdmin()) return false;
  if (isAdmin()) return true;
  return state.user?.role === targetRole;
}

function roleAnnouncementsFor(targetRole) {
  return [...(data.roleAnnouncements || [])]
    .filter((item) => item.targetRole === targetRole)
    .filter((item) => !isAdmin() || (item.recipientIds || []).includes(state.user.id) || item.recipientType === "admin")
    .sort((a, b) => Number(!!b.important) - Number(!!a.important) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function announcementForm(targetRole, announcement) {
  return `<form class="edit-form" id="announcement-form" data-target-role="${esc(targetRole)}" data-announcement-id="${esc(announcement?.id || "new")}">
    <article class="info-card form-grid">
      <h3>${announcement ? "Modifier le message" : `Nouveau message ${targetRole === "driver" ? "chauffeurs" : "convoyeuses"}`}</h3>
      ${input("title", "Titre", announcement?.title || "")}
      ${textArea("content", "Contenu", announcement?.content || "")}
      <label class="check-field"><input name="important" type="checkbox" ${announcement?.important ? "checked" : ""}>Important</label>
    </article>
    <div class="form-actions"><button class="primary-button compact-action" type="submit">Enregistrer</button>${announcement ? `<button class="secondary-button" type="button" data-cancel-announcement>Annuler</button>` : ""}</div>
  </form>`;
}

function announcementCard(announcement) {
  const unread = state.user?.role === announcement.targetRole && !announcement.readBy?.includes(state.user.id);
  return `<article class="info-card ${announcement.important ? "announcement-important" : ""}">
    <h3>${announcement.important ? `<b class="badge danger">Important</b> ` : ""}${unread ? `<b class="badge danger">Nouveau</b> ` : ""}${esc(announcement.title)}</h3>
    <p>${esc(announcement.content)}</p>
    ${sectionRows([["Auteur", announcement.createdByName], ["Date", formatDateTime(announcement.createdAt)], ["Important", announcement.important ? "oui" : "non"]])}
    <div class="message-tools">${translateMessageButton(announcement.content)}${isAdmin() && !isPrimaryAdmin() ? `<button class="secondary-button" data-edit-announcement="${esc(announcement.id)}">Modifier</button><button class="danger-button" data-delete-announcement="${esc(announcement.id)}">Supprimer</button>` : ""}</div>
  </article>`;
}

function roleAnnouncementUnreadCount(targetRole = state.user?.role) {
  if (!["driver", "assistant"].includes(targetRole) || state.user?.role !== targetRole) return 0;
  return roleAnnouncementsFor(targetRole).filter((item) => !item.readBy?.includes(state.user.id)).length;
}

function markRoleAnnouncementsRead(targetRole) {
  let changed = false;
  roleAnnouncementsFor(targetRole).forEach((announcement) => {
    if (!announcement.readBy?.includes(state.user.id)) {
      announcement.readBy = [...new Set([...(announcement.readBy || []), state.user.id])];
      saveRoleAnnouncementToFirestore(announcement);
      changed = true;
    }
  });
  if (changed) saveData();
}

function markPrivateConversationRead(childId) {
  (data.messages[childId] || []).forEach((message) => {
    message.readBy = [...new Set([...(message.readBy || []), state.user.id])];
  });
  saveData();
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return date.toLocaleString("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function supportCenterView() {
  if (!canAccessSupportCenter() || isParent()) return dashboard();
  const requests = supportRequestsForUser();
  const selected = requests.find((request) => request.id === state.selectedSupportRequestId) || null;
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Aide</p><h2>Centre Support</h2></div>
    ${supportRequestForm()}
    <article class="info-card">
      <h3>Mes demandes support</h3>
      <div class="quick-list-inner">${requests.map((request) => supportRequestSummary(request, false)).join("") || `<p class="muted">Aucune demande support.</p>`}</div>
    </article>
    ${selected ? supportRequestDetail(selected) : ""}
  </section>`;
}

function supportRequestForm() {
  if (!canAccessSupportCenter() || isParent()) return "";
  const context = supportContextForUser();
  return `<form class="edit-form" id="support-request-form">
    <article class="info-card form-grid">
      <h3>Envoyer une demande support</h3>
      ${input("userName", "Nom", fullName(state.user))}
      ${input("userRole", "Rôle", accountRoleLabel(state.user), "text", true)}
      ${input("subject", "Sujet", "")}
      ${textArea("message", "Message", "")}
    </article>
    <article class="info-card">
      <h3>Contexte transmis au support</h3>
      ${supportContextRows(context, state.user.role)}
    </article>
    <div class="form-actions"><button class="primary-button compact-action" type="submit">Envoyer demande support</button></div>
  </form>`;
}

function primaryAdminSupportView() {
  const requests = [...(data.supportRequests || [])]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 30);
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Support technique</p><h2>Demandes techniques générales</h2></div>
    ${serviceStatusDashboardCard()}
    <article class="info-card">
      <h3>Demandes support anonymisées</h3>
      <div class="quick-list-inner">
        ${requests.map((request, index) => `<div class="message-item">
          <strong>Demande support technique ${esc(index + 1)}</strong>
          ${sectionRows([
            ["Rôle demandeur", roleLabel(request.userRole)],
            ["Statut", supportStatusLabel(request.status)],
            ["Créée le", formatDateTime(request.createdAt)],
            ["Dernière mise à jour", formatDateTime(request.updatedAt || request.createdAt)]
          ])}
        </div>`).join("") || `<p class="muted">Aucune demande support technique.</p>`}
      </div>
    </article>
  </section>`;
}

function canAccessPermissionTests() {
  return isPrimaryAdmin() || isSupport();
}

function permissionTestUsers() {
  const systemAdmin = (data.users || []).find(isPrimaryAdminUser) || { id: "admin", role: "admin", identifierNumber: "6183", firstName: "Administrateur", lastName: "Système", assignedCircuits: [] };
  const manager = (data.users || []).find((user) => isTransportManagerUser(user)) || { id: "test-manager", role: "admin", firstName: "Gestionnaire", lastName: "Test", assignedCircuits: [] };
  const spw = (data.users || []).find((user) => isSpwAccount(user)) || { id: "test-spw", role: "admin", visualTheme: "spw", firstName: "SPW", lastName: "Test", assignedCircuits: [] };
  const driver = (data.users || []).find((user) => user.role === "driver")
    || { ...(data.drivers || [])[0], role: "driver", assignedCircuits: [(data.drivers || [])[0]?.schoolCircuit].filter(Boolean) };
  const assistant = (data.users || []).find((user) => user.role === "assistant")
    || { ...(data.assistants || [])[0], role: "assistant", assignedCircuits: [(data.assistants || [])[0]?.schoolCircuit].filter(Boolean) };
  const parent = (data.parents || [])[0] || { id: "test-parent", role: "parent", firstName: "Parent", lastName: "Test", linkedChildrenIds: [] };
  const support = (data.users || []).find((user) => user.role === "support") || { id: "support", role: "support", firstName: "Support", lastName: "Technique", assignedCircuits: [] };
  return [
    { key: "system", label: "Administrateur système", user: systemAdmin },
    { key: "manager", label: "Gestionnaire de transport", user: manager },
    { key: "spw", label: "SPW", user: spw },
    { key: "driver", label: "Chauffeur", user: driver },
    { key: "assistant", label: "Convoyeuse", user: assistant },
    { key: "parent", label: "Parent", user: parent },
    { key: "support", label: "Support", user: support }
  ];
}

function withSimulatedUser(user, callback) {
  const previous = {
    user: state.user,
    activeFilter: state.activeFilter,
    selectedChildId: state.selectedChildId,
    selectedType: state.selectedType,
    selectedId: state.selectedId,
    search: state.search
  };
  state.user = user;
  state.activeFilter = null;
  state.selectedChildId = "";
  state.selectedType = "";
  state.selectedId = "";
  state.search = "";
  try {
    return callback();
  } finally {
    state.user = previous.user;
    state.activeFilter = previous.activeFilter;
    state.selectedChildId = previous.selectedChildId;
    state.selectedType = previous.selectedType;
    state.selectedId = previous.selectedId;
    state.search = previous.search;
  }
}

function visibleMessagesForPermissionTest(user) {
  return withSimulatedUser(user, () => {
    const privateCount = (data.children || []).reduce((count, child) => count + childMessages(child.id).length, 0);
    const directCount = Object.entries(data.directMessageItems || {}).reduce((count, [conversationId, messages]) => {
      const conversation = (data.directMessages || []).find((item) => item.conversationId === conversationId) || {};
      return (conversation.participants || []).includes(user.id) ? count + (messages || []).length : count;
    }, 0);
    const teamCount = Object.entries(data.teamMessageItems || {}).reduce((count, [conversationId, messages]) => {
      const conversation = (data.teamMessages || []).find((item) => item.conversationId === conversationId) || {};
      return (conversation.participants || []).includes(user.id) ? count + (messages || []).length : count;
    }, 0);
    const supportCount = user.role === "support"
      ? Object.values(data.supportMessages || {}).reduce((count, messages) => count + (messages || []).length, 0)
      : (data.supportRequests || []).filter((request) => request.userId === user.id).reduce((count, request) => count + supportMessages(request.id).length, 0);
    return { privateCount, directCount, teamCount, supportCount, total: privateCount + directCount + teamCount + supportCount };
  });
}

function expectedChildrenForPermissionTest(key, user) {
  if (["system", "support"].includes(key)) return [];
  if (["manager", "spw"].includes(key)) return data.children || [];
  if (key === "parent") {
    const linked = new Set(user.linkedChildrenIds || []);
    return (data.children || []).filter((child) => linked.has(child.id) || (child.parentIds || []).includes(user.id));
  }
  return (data.children || []).filter((child) => userCanAccessChildByTransport(user, child));
}

function hiddenSectionsForPermissionTest(key) {
  return {
    system: ["Fiches élèves", "médical", "messages privés", "adresses", "parents"],
    manager: ["Fiche médicale", "élève sensible interne", "messages privés non destinés", "support technique interne"],
    spw: ["Messages privés non destinés", "journaux techniques système"],
    driver: ["Autres circuits", "administration", "support technique", "messages privés non destinés"],
    assistant: ["Autres circuits", "administration", "support technique", "messages privés non destinés"],
    parent: ["Autres élèves", "plaque", "lieu transfert interne", "messages internes", "support technique"],
    support: ["Fiches élèves", "messages privés", "médical", "circuits non techniques"]
  }[key] || [];
}

function visibleSectionsForPermissionTest(key) {
  return {
    system: ["État des services", "logs techniques", "configuration technique", "tests permissions"],
    manager: ["Transport", "élèves", "chauffeurs", "véhicules", "écoles", "circuits", "historique"],
    spw: ["Prise en charge", "convoyeuses", "élèves", "médical autorisé", "élèves sensibles", "historique"],
    driver: ["Ses élèves", "ses circuits", "ses véhicules", "messages autorisés"],
    assistant: ["Ses élèves", "ses circuits", "chauffeur lié", "messages autorisés"],
    parent: ["Ses enfants", "messages enfant", "fiche médicale parent"],
    support: ["Demandes support", "journaux techniques autorisés", "état des services"]
  }[key] || [];
}

function permissionTestResult(item) {
  const user = item.user || {};
  const actualChildren = withSimulatedUser(user, () => visibleChildren());
  const expectedChildren = expectedChildrenForPermissionTest(item.key, user);
  const actualIds = new Set(actualChildren.map((child) => child.id));
  const expectedIds = new Set(expectedChildren.map((child) => child.id));
  const extraChildren = actualChildren.filter((child) => !expectedIds.has(child.id));
  const missingChildren = expectedChildren.filter((child) => !actualIds.has(child.id));
  const totalPrivateMessages = Object.values(data.messages || {}).reduce((count, messages) => count + (messages || []).length, 0);
  const totalDirectMessages = Object.values(data.directMessageItems || {}).reduce((count, messages) => count + (messages || []).length, 0);
  const totalTeamMessages = Object.values(data.teamMessageItems || {}).reduce((count, messages) => count + (messages || []).length, 0);
  const totalSupportMessages = Object.values(data.supportMessages || {}).reduce((count, messages) => count + (messages || []).length, 0);
  const visibleMessages = visibleMessagesForPermissionTest(user);
  const blockedMessages = Math.max(0, totalPrivateMessages + totalDirectMessages + totalTeamMessages + totalSupportMessages - visibleMessages.total);
  const notes = [];
  let status = "OK";
  if (!user.id) {
    status = "Attention";
    notes.push("Aucun profil exemple trouvé pour ce rôle.");
  }
  if (extraChildren.length) {
    status = "Erreur critique";
    notes.push(`${extraChildren.length} fiche(s) élève visibles en trop.`);
  }
  if (["system", "support"].includes(item.key) && visibleMessages.privateCount + visibleMessages.directCount + visibleMessages.teamCount > 0) {
    status = "Erreur critique";
    notes.push("Messages privés visibles pour un rôle technique.");
  }
  if (item.key === "manager" && actualChildren.some(publicStudentHasSensitiveLeak)) {
    status = status === "Erreur critique" ? status : "Attention";
    notes.push("Des champs médicaux/sensibles existent encore dans la fiche élève principale Firestore.");
  }
  if (missingChildren.length && !["system", "support"].includes(item.key)) {
    status = status === "Erreur critique" ? status : "Attention";
    notes.push(`${missingChildren.length} fiche(s) attendue(s) non visibles.`);
  }
  return {
    ...item,
    status,
    notes,
    actualChildren,
    blockedChildren: Math.max(0, (data.children || []).length - actualChildren.length),
    visibleMessages,
    blockedMessages,
    visibleSections: visibleSectionsForPermissionTest(item.key),
    hiddenSections: hiddenSectionsForPermissionTest(item.key)
  };
}

function permissionStatusBadge(status, explanation = "") {
  const className = status === "OK" ? "ok" : status === "Erreur critique" ? "danger" : "warning";
  if (status !== "OK" && explanation) {
    return `<button class="badge ${className} permission-status-button" type="button" data-permission-explain="${esc(explanation)}">${esc(status)}</button>`;
  }
  return `<b class="badge ${className}">${esc(status)}</b>`;
}

function permissionExplanationText(result) {
  if (!result) return "";
  const notes = result.notes?.length ? result.notes : ["Aucune raison détaillée disponible."];
  return [
    `${result.label} - ${fullName(result.user)}`,
    "",
    ...notes.map((note) => `- ${note}`),
    "",
    `Fiches élèves accessibles : ${result.actualChildren.length}`,
    `Fiches élèves bloquées : ${result.blockedChildren}`,
    `Messages visibles : ${result.visibleMessages.total}`,
    `Messages bloqués : ${result.blockedMessages}`
  ].join("\n");
}

function permissionTestsView() {
  if (!canAccessPermissionTests()) return dashboard();
  const results = permissionTestUsers().map(permissionTestResult);
  const criticalCount = results.filter((item) => item.status === "Erreur critique").length;
  const warningCount = results.filter((item) => item.status === "Attention").length;
  const globalStatus = criticalCount ? "Erreur critique" : warningCount ? "Attention" : "OK";
  const globalExplanation = results
    .filter((item) => item.status !== "OK")
    .map((item) => permissionExplanationText(item))
    .join("\n\n---\n\n");
  return `<section class="view-stack">
    <div class="section-title action-title">
      <div><p class="eyebrow">Contrôle sécurité</p><h2>Tests permissions</h2></div>
      ${permissionStatusBadge(globalStatus, globalExplanation)}
    </div>
    <article class="notice-card">
      <p><strong>Mode test permissions</strong><br>Simulation locale basée sur les données chargées et les règles d’affichage de l’application. Pour la production, les règles Firestore doivent aussi être déployées avec les claims de rôle corrects.</p>
    </article>
    <div class="permission-test-grid">
      ${results.map(permissionTestCard).join("")}
    </div>
  </section>`;
}

function permissionTestCard(result) {
  return `<article class="info-card permission-test-card">
    <div class="pending-head">
      <div><p class="eyebrow">${esc(result.label)}</p><h3>${esc(fullName(result.user))}</h3></div>
      ${permissionStatusBadge(result.status, permissionExplanationText(result))}
    </div>
    ${sectionRows([
      ["Fiches élèves accessibles", result.actualChildren.length],
      ["Fiches élèves bloquées", result.blockedChildren],
      ["Messages visibles", result.visibleMessages.total],
      ["Messages bloqués", result.blockedMessages],
      ["Messages privés visibles", result.visibleMessages.privateCount + result.visibleMessages.directCount + result.visibleMessages.teamCount],
      ["Messages support visibles", result.visibleMessages.supportCount]
    ])}
    <div class="permission-pill-list">
      <strong>Données visibles</strong>
      ${result.visibleSections.map((section) => `<span>${esc(section)}</span>`).join("")}
    </div>
    <div class="permission-pill-list blocked">
      <strong>Données bloquées / sections masquées</strong>
      ${result.hiddenSections.map((section) => `<span>${esc(section)}</span>`).join("")}
    </div>
    ${result.notes.length ? `<div class="permission-notes">${result.notes.map((note) => `<p>${esc(note)}</p>`).join("")}</div>` : ""}
  </article>`;
}

function supportDashboard() {
  const requests = filteredSupportRequests();
  const selected = data.supportRequests.find((request) => request.id === state.selectedSupportRequestId) || requests[0] || null;
  if (selected && state.selectedSupportRequestId !== selected.id) state.selectedSupportRequestId = selected.id;
  if (selected && (!selected.readBy?.includes(state.user.id) || supportMessages(selected.id).some((message) => !message.readBy?.includes(state.user.id)))) markSupportRequestRead(selected.id);
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Support</p><h2>Centre Support</h2></div>
    ${serviceStatusDashboardCard()}
    ${supportStats()}
    ${circuitReplacementAlerts()}
    ${dashboardMessagesCard()}
    ${accessRequestsPanel()}
    ${supportFilters()}
    <div class="support-layout">
      <article class="info-card">
        <h3>Demandes</h3>
        ${requests.map((request) => supportRequestSummary(request, true)).join("") || `<p class="muted">Aucune demande pour ce filtre.</p>`}
      </article>
      ${selected ? supportRequestDetail(selected) : `<article class="info-card"><p class="muted">Sélectionnez une demande.</p></article>`}
    </div>
  </section>`;
}

function accessRequestsPanel() {
  if (isPrimaryAdmin()) return "";
  if (!isAdmin() && !isSupport()) return "";
  const requests = [...(data.accessRequests || [])].sort((a, b) => {
    const priority = { pending: 0, in_progress: 1, approved: 2, rejected: 3 };
    return (priority[a.status] ?? 9) - (priority[b.status] ?? 9) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
  return `<article class="info-card">
    <h3>Demandes d’accès</h3>
    <div class="quick-list-inner">${requests.map(accessRequestCard).join("") || `<p class="muted">Aucune demande d’accès.</p>`}</div>
  </article>`;
}

function accessRequestCard(request) {
  const rows = [
    ["Téléphone", request.phone],
    ["Adresse e-mail", request.email],
    ["Type d’accès demandé", roleLabel(request.requestedRole)],
    ["Message", request.message],
    ["Enfant concerne", [request.childFirstName, request.childLastName].filter(Boolean).join(" ")],
    ["École", request.schoolName],
    ["Circuit", request.circuitNumber],
    ["Date", formatDateTime(request.createdAt)],
    ["Statut", accessRequestStatusLabel(request.status)]
  ];
  return `<article class="message-item access-request-card">
    <strong>${esc(fullName(request))} <span>${esc(roleLabel(request.requestedRole))}</span></strong>
    ${sectionRows(rows)}
    ${request.supportResponse ? `<p><strong>Réponse support :</strong> ${esc(request.supportResponse)}</p>` : ""}
    <div class="form-actions">
      ${isAdmin() && !isPrimaryAdmin() ? `<button class="primary-button compact-action" data-access-request-action="approve" data-access-request-id="${esc(request.id)}">Approuver</button><button class="secondary-button" data-access-request-action="create-code" data-access-request-id="${esc(request.id)}">Créer le code</button><button class="danger-button" data-access-request-action="reject" data-access-request-id="${esc(request.id)}">Refuser</button>` : ""}
      ${isSupport() ? `<button class="secondary-button" data-access-request-action="in_progress" data-access-request-id="${esc(request.id)}">Marquer en cours</button><button class="secondary-button" data-access-request-action="forward" data-access-request-id="${esc(request.id)}">Transmettre au gestionnaire de transport</button>` : ""}
    </div>
    ${isSupport() ? `<form class="mini-form" data-access-request-reply="${esc(request.id)}">${textArea("supportResponse", "Réponse / note support", request.supportResponse || "")}<button class="primary-button compact-action" type="submit">Enregistrer la réponse</button></form>` : ""}
  </article>`;
}

function accessRequestStatusLabel(status) {
  return { pending: "en attente", in_progress: "en cours", approved: "approuvée", rejected: "refusée" }[status] || "en attente";
}

function supportStats() {
  const requests = data.supportRequests || [];
  const pending = requests.filter((request) => request.status === "pending").length;
  const unread = supportUnreadCount();
  const cards = [
    { id: "requests", label: "Demandes", render: (label) => metric(label, requests.length) },
    { id: "pending", label: "En attente", render: (label) => metric(label, pending) },
    { id: "unread", label: "Non lues", render: (label) => metric(label, unread) }
  ];
  return `<div class="metric-grid">${orderedDashboardCards("support", cards)}</div>`;
}

function pendingLeaveRequests() {
  return (data.leaveRequests || []).filter((request) => request.status === "pending");
}

function urgentVehicleRepairs() {
  return (data.vehicleRepairs || []).filter((repair) => repair.urgency === "urgent" && repair.status !== "repaired");
}

function importantAnomalies() {
  return (data.anomalies || []).filter((anomaly) => anomaly.important === true && anomaly.status !== "archived");
}

function requestsMenuBadge() {
  if (isTransportManagerUser()) return pendingLeaveRequests().length + urgentVehicleRepairs().length + importantAnomalies().length;
  if (state.user?.role === "driver") {
    return (data.leaveRequests || []).filter((request) => request.createdBy === state.user.id && ["accepted", "rejected"].includes(request.status) && !request.readBy?.includes(state.user.id)).length;
  }
  return 0;
}

function requestsDashboardAlerts() {
  if (!isTransportManagerUser()) return "";
  const urgent = urgentVehicleRepairs();
  const pending = pendingLeaveRequests();
  const anomalies = importantAnomalies();
  if (!urgent.length && !pending.length && !anomalies.length) return "";
  return `<article class="${urgent.length ? "pending-card" : "info-card"} requests-dashboard-alert">
    <div class="pending-head">
      <div><p class="eyebrow">Demandes</p><h3>${urgent.length ? "Réparations urgentes" : "Demandes en attente"}</h3><span>${esc(pending.length)} congé(s), ${esc(urgent.length)} urgence(s), ${esc(anomalies.length)} anomalie(s)</span></div>
      <b class="badge danger">${esc(pending.length + urgent.length + anomalies.length)}</b>
    </div>
    <div class="form-actions"><button class="primary-button compact-action" type="button" data-screen="requests">Ouvrir demandes</button></div>
  </article>`;
}

function circuitReplacementAlerts(child = null) {
  if (!child && isPrimaryAdmin()) return "";
  const rules = replacementRulesForCurrentUser(child).filter((rule) => !replacementRuleReadEntry(rule));
  if (!rules.length) return "";
  const parentView = state.user?.role === "parent";
  return `<div class="out-service-alerts replacement-alerts">
    ${rules.map((rule) => {
      const school = schoolLabelForReplacementRule(rule);
      return `<article class="pending-card replacement-rule-alert">
        <div class="pending-head">
          <div><p class="eyebrow">${parentView ? "Information transport" : "Organisation transferts"}</p><h3>${parentView ? "Le circuit de votre enfant est remplacé" : `Circuit ${esc(rule.inactiveCircuitId || "non renseigné")} ne roule pas`}</h3></div>
          <b class="badge warning">Remplacement</b>
        </div>
        ${sectionRows(parentView ? [
          ["Nouveau circuit", rule.primaryReplacementCircuitId],
          ["Message", rule.message],
          ["Date", formatDateTime(rule.updatedAt || rule.createdAt)]
        ] : [
          ["Zone", rule.zone],
          ["Circuit absent", rule.inactiveCircuitId],
          ["Remplacement principal", rule.primaryReplacementCircuitId],
          ["Remplacement secondaire", rule.secondaryReplacementCircuitId],
          ["École concernée", school],
          ["Message transport", rule.message],
          ["Actif", rule.isActive === false ? "non" : "oui"]
        ])}
        <div class="form-actions"><button class="primary-button compact-action" type="button" data-ack-replacement-rule="${esc(rule.id)}">J’ai compris</button></div>
      </article>`;
    }).join("")}
  </div>`;
}

function replacementRulesDashboardShortcut() {
  if (!canManageReplacementRules()) return "";
  const rules = replacementRulesForCurrentUser();
  const active = rules.filter((rule) => rule.isActive !== false).length;
  const latest = [...rules].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))[0];
  return `<button class="info-card replacement-dashboard-shortcut" type="button" data-open-replacement-rules-dashboard>
    <div>
      <p class="eyebrow">Organisation transferts</p>
      <h3>${esc(active)} organisation${active > 1 ? "s" : ""} active${active > 1 ? "s" : ""}</h3>
      <p class="muted">${latest ? `Dernière mise à jour : ${formatDateTime(latest.updatedAt || latest.createdAt)}` : "Créer ou consulter les règles de remplacement"}</p>
    </div>
    <b class="badge warning">Voir</b>
  </button>`;
}

function replacementRulesForCurrentUser(child = null) {
  const activeRules = (data.replacementRules || []).filter((rule) => rule.isActive !== false);
  if (!state.user) return [];
  if (isPrimaryAdmin()) return [];
  if (state.user.role === "parent") {
    const children = child ? [child] : visibleChildren();
    return activeRules.filter((rule) => children.some((item) => replacementRuleMatchesChild(rule, item)));
  }
  if (["admin", "driver", "assistant"].includes(state.user.role)) return activeRules;
  return [];
}

function replacementRuleMatchesChild(rule, child) {
  if (!rule || !child) return false;
  const inactive = normalizeSearch(rule.inactiveCircuitId);
  const school = normalizeSearch(rule.schoolId);
  return (!!inactive && normalizeSearch(child.circuitNumber) === inactive)
    || (!!school && [child.schoolName, child.schoolId].some((value) => normalizeSearch(value) === school));
}

function schoolLabelForReplacementRule(rule) {
  const school = (data.schools || []).find((item) => item.id === rule.schoolId || item.name === rule.schoolId);
  return school?.name || rule.schoolId || "Non renseigné";
}

function replacementRuleReadEntry(rule) {
  if (!rule || !state.user) return null;
  return (rule.readBy || []).find((entry) => entry.userId === state.user.id || entry === state.user.id) || null;
}

function supportFilters() {
  const filters = [
    ["all", "Tous"],
    ["admin", "Gestionnaire de transport"],
    ["driver", "Chauffeur"],
    ["assistant", "Convoyeuse"],
    ["parent", "Parent"],
    ["pending", "En attente"],
    ["in_progress", "En cours"],
    ["resolved", "Résolue"]
  ];
  return `<div class="support-filters">${filters.map(([value, label]) => `<button class="${state.supportFilter === value ? "active" : ""}" data-support-filter="${esc(value)}">${esc(label)}</button>`).join("")}</div>`;
}

function filteredSupportRequests() {
  const filter = state.supportFilter || "all";
  return [...(data.supportRequests || [])].filter((request) => {
    if (filter === "all") return true;
    if (["pending", "in_progress", "resolved"].includes(filter)) return request.status === filter;
    return request.userRole === filter;
  }).sort((a, b) => {
    const priority = { pending: 0, in_progress: 1, resolved: 2 };
    return (priority[a.status] ?? 9) - (priority[b.status] ?? 9) || new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });
}

function supportRequestsForUser() {
  if (isSupport()) return data.supportRequests || [];
  if (isParent()) return [];
  return (data.supportRequests || []).filter((request) => request.userId === state.user.id);
}

function supportRequestSummary(request, selectable) {
  const unread = !request.readBy?.includes(state.user.id);
  return `<button class="child-row support-row ${state.selectedSupportRequestId === request.id ? "active" : ""}" ${selectable ? `data-open-support-request="${esc(request.id)}"` : `data-user-support-request="${esc(request.id)}"`}>
    <span>${unread ? `<b class="badge danger">non lu</b>` : ""} ${esc(request.subject)}</span>
    <small>${esc(request.userName)} - ${esc(roleLabel(request.userRole))} - ${esc(formatDateTime(request.createdAt))}</small>
    ${supportStatusBadge(request.status)}
  </button>`;
}

function supportRequestDetail(request) {
  const messages = supportMessages(request.id);
  return `<article class="info-card message-panel">
    <div class="detail-head">
      <div><p class="eyebrow">${esc(roleLabel(request.userRole))}</p><h2>${esc(request.subject)}</h2></div>
      ${supportStatusBadge(request.status)}
    </div>
    ${sectionRows([["Utilisateur", request.userName], ["Rôle", roleLabel(request.userRole)], ["Date", formatDateTime(request.createdAt)], ["Message initial", request.message]])}
    <article class="notice-card support-context"><div><h3>Contexte de la demande</h3>${supportContextRows(request.context || {}, request.userRole)}</div></article>
    ${isSupport() ? `<div class="form-actions">
      <button class="secondary-button" data-support-status="${esc(request.id)}" data-status-value="pending">En attente</button>
      <button class="secondary-button" data-support-status="${esc(request.id)}" data-status-value="in_progress">En cours</button>
      <button class="primary-button compact-action" data-support-status="${esc(request.id)}" data-status-value="resolved">Marquer résolue</button>
      <button class="danger-button" data-delete-support-request="${esc(request.id)}">Supprimer</button>
    </div>` : ""}
    <h3>Conversation support</h3>
    <div class="message-list">${messages.map((message) => supportMessageItem(message, request.id)).join("")}</div>
    <form class="mini-form" data-support-message-form="${esc(request.id)}">
      <label><span>Réponse</span><textarea name="supportMessageText" rows="3" placeholder="Écrire une réponse..."></textarea></label>
      <button class="primary-button compact-action" type="submit">Envoyer</button>
    </form>
  </article>`;
}

function supportContextRows(context, role = state.user?.role) {
  const rows = [
    ["Enfant concerne", context.childName],
    ["École", context.schoolName],
    ["Circuit", context.circuitNumber],
    ["Numéro bus", context.busNumber],
    ["Chauffeur", context.driverName],
    ["Convoyeuse", context.assistantName],
    ["Nombre d'élèves liés", context.childrenCount],
    ["Téléphone utilisateur", context.userPhone]
  ].filter(([label, value]) => {
    if (role === "assistant" && ["Numéro bus", "Chauffeur", "Nombre d'élèves liés"].includes(label)) return false;
    return value !== undefined && value !== null && value !== "";
  });
  return rows.length ? sectionRows(rows) : `<p class="muted">Aucun contexte specifique.</p>`;
}

function supportMessageItem(message, requestId) {
  const unread = !message.readBy?.includes(state.user.id);
  return `<div class="message-item">
    <strong>${esc(message.authorName)} <span>${esc(roleLabel(message.authorRole))}</span></strong>
    <p>${esc(message.text)}</p>
    <small>${esc(formatDateTime(message.createdAt))} - ${unread ? "non lu" : "lu"}${offlinePendingBadge(message.id)}</small>
    <div class="message-tools">${translateMessageButton(message.text)}${messageDeleteButton("support", message.id, requestId || "", message)}</div>
  </div>`;
}

function supportMessages(requestId) {
  return [...(data.supportMessages?.[requestId] || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function supportStatusBadge(status) {
  const label = supportStatusLabel(status);
  const tone = status === "resolved" ? "ok" : "warning";
  return `<b class="badge ${tone}">${esc(label)}</b>`;
}

function supportStatusLabel(status) {
  return { pending: "en attente", in_progress: "en cours", resolved: "résolu" }[status] || status || "en attente";
}

function supportUnreadCount() {
  const requests = isSupport() ? data.supportRequests || [] : supportRequestsForUser();
  return requests.filter((request) => !request.readBy?.includes(state.user?.id) || supportMessages(request.id).some((message) => !message.readBy?.includes(state.user?.id))).length;
}

function dashboardMessagesCard() {
  if (!dashboardCardVisible("messages")) return "";
  if (isSupportAssistanceSession()) {
    return `<article class="info-card dashboard-messages-card privacy-masked-card">
      <div class="pending-head"><div><p class="eyebrow">Communication</p><h3>Messages récents</h3><span>Information masquée pour confidentialité</span></div></div>
    </article>`;
  }
  const messages = dashboardRecentMessages();
  const unread = messages.filter((message) => message.unread).length;
  const destination = isSupport() ? "dashboard" : "messages";
  const parentLabels = isParent();
  const title = dashboardCardLabel("messages", parentLabels ? parentT("messages.recent") : "Messages récents");
  return `<article class="${unread ? "pending-card" : "info-card"} dashboard-messages-card">
    <div class="pending-head">
      <div><p class="eyebrow">${esc(parentLabels ? parentT("messages.communication") : "Communication")}</p><h3>${esc(title)}</h3><span>${esc(unread)} ${esc(parentLabels ? parentT("messages.unread") : "non lu")}${unread > 1 && !parentLabels ? "s" : ""}</span></div>
      ${unread ? `<b>${esc(unread)}</b>` : ""}
    </div>
    <div class="message-list">
      ${messages.slice(0, 5).map(dashboardMessageItem).join("") || `<p class="muted">${esc(parentLabels ? parentT("messages.none") : "Aucun message récent visible.")}</p>`}
    </div>
    <div class="form-actions"><button class="secondary-button" data-screen="${esc(destination)}" type="button">${esc(parentLabels ? parentT("nav.messages") : "Voir tous les messages")}</button></div>
  </article>`;
}

function studentIssuesDashboardCard() {
  const issues = visibleStudentIssuesForCurrentUser()
    .filter((issue) => issue.status !== "resolved")
    .sort((a, b) => Number(b.importance === "urgent") - Number(a.importance === "urgent") || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (!issues.length) return "";
  return `<article class="${issues.some((issue) => issue.importance === "urgent") ? "pending-card" : "info-card"} student-issues-dashboard">
    <div class="pending-head"><div><p class="eyebrow">Problèmes élèves</p><h3>Signalements ouverts</h3><span>${esc(issues.length)} problème${issues.length > 1 ? "s" : ""} à suivre</span></div><b class="badge danger">${esc(issues.length)}</b></div>
    <div class="quick-list-inner">${issues.slice(0, 4).map((issue) => `<button class="child-row" type="button" data-open-child="${esc(issue.childId)}"><span>${esc(issue.childName || "Élève")}</span><small>${esc(studentIssueTypeLabel(issue.type))} - ${esc(studentIssueImportanceLabel(issue.importance))}</small><b class="badge ${esc(studentIssueTone(issue))}">${esc(studentIssueStatusLabel(issue.status))}</b></button>`).join("")}</div>
  </article>`;
}

function dashboardMessageItem(item) {
  const details = [item.childName, item.circuitName].filter(Boolean).join(" - ");
  return `<div class="message-item">
    <strong>${esc(item.authorName || "Utilisateur")} <span>${esc(roleLabel(item.authorRole))}</span></strong>
    <p>${esc(item.subject || item.preview || "Message")}</p>
    ${details ? `<small>${esc(details)}</small>` : ""}
    <small>${esc(formatDateTime(item.createdAt))} ${item.unread ? "- non lu" : ""}</small>
    <div class="action-row">
      ${item.unread ? `<b class="badge danger">Nouveau message</b>` : ""}
      ${item.important ? `<b class="badge warning">Important</b>` : ""}
    </div>
  </div>`;
}

function dashboardRecentMessages() {
  if (!state.user) return [];
  if (isPrimaryAdmin()) return [];
  if (isSupport()) return supportDashboardMessages();
  if (isAdmin()) return adminDashboardMessages();
  if (isParent()) return parentDashboardMessages();
  if (["driver", "assistant"].includes(state.user.role)) return transportDashboardMessages();
  return [];
}

function parentDashboardMessages() {
  return visibleChildren()
    .flatMap((child) => childMessages(child.id).map((message) => dashboardMessageFromPrivate(child, message)))
    .sort(recentMessageSort);
}

function transportDashboardMessages() {
  const privateItems = visibleChildren()
    .flatMap((child) => childMessages(child.id).map((message) => dashboardMessageFromPrivate(child, message)));
  const teamItems = teamConversationsForUser("team").flatMap((conversation) =>
    teamMessagesForConversation(conversation.conversationId).map((message) => ({
      authorName: message.authorName,
      authorRole: message.authorRole,
      preview: message.text,
      circuitName: conversation.circuitName || conversation.circuitId,
      createdAt: message.createdAt,
      unread: message.authorId !== state.user.id && !message.readBy?.includes(state.user.id),
      important: false
    }))
  );
  const announcementItems = roleAnnouncementsFor(state.user.role).map((announcement) => ({
    authorName: announcement.createdByName || "Gestionnaire de transport",
    authorRole: "admin",
    subject: announcement.title,
    preview: announcement.content,
    createdAt: announcement.createdAt,
    unread: !announcement.readBy?.includes(state.user.id),
    important: !!announcement.important
  }));
  return [...privateItems, ...teamItems, ...directDashboardMessages(), ...announcementItems].sort(recentMessageSort);
}

function adminDashboardMessages() {
  const announcements = ["driver", "assistant"].flatMap((role) =>
    roleAnnouncementsFor(role).map((announcement) => ({
      authorName: announcement.createdByName || fullName(state.user),
      authorRole: "admin",
      subject: announcement.title,
      preview: announcement.content,
      createdAt: announcement.createdAt,
      unread: false,
      important: !!announcement.important
    }))
  );
  const directMessages = Object.entries(data.messages || []).flatMap(([childId, messages]) => {
    const child = data.children.find((item) => item.id === childId) || {};
    return (messages || [])
      .filter((message) => canReadMessage(message, child))
      .map((message) => dashboardMessageFromPrivate(child, message));
  });
  const supportItems = (data.supportRequests || [])
    .filter((request) => request.userId === state.user.id || request.assignedSupport === state.user.id || (request.recipientIds || []).includes(state.user.id))
    .map((request) => dashboardMessageFromSupportRequest(request));
  return [...announcements, ...directMessages, ...directDashboardMessages(), ...supportItems].sort(recentMessageSort);
}

function directDashboardMessages() {
  if (!isAdmin() && !["driver", "assistant"].includes(state.user?.role)) return [];
  return directConversationsForUser().flatMap((conversation) =>
    directMessagesForConversation(conversation.conversationId).map((message) => ({
      authorName: message.authorName,
      authorRole: message.authorRole,
      subject: conversation.subject,
      preview: message.text,
      circuitName: `${conversation.senderName} -> ${conversation.recipientName}`,
      createdAt: message.createdAt,
      unread: message.authorId !== state.user.id && !message.readBy?.includes(state.user.id),
      important: false
    }))
  );
}

function supportDashboardMessages() {
  return (data.supportRequests || [])
    .flatMap((request) => [
      dashboardMessageFromSupportRequest(request),
      ...supportMessages(request.id).map((message) => ({
        authorName: message.authorName,
        authorRole: message.authorRole,
        subject: request.subject,
        preview: message.text,
        childName: request.context?.childName || "",
        circuitName: request.context?.circuitNumber || "",
        createdAt: message.createdAt,
        unread: message.authorId !== state.user.id && !message.readBy?.includes(state.user.id),
        important: request.status === "pending"
      }))
    ])
    .sort(recentMessageSort);
}

function dashboardMessageFromPrivate(child, message) {
  return {
    authorName: message.authorName,
    authorRole: message.authorRole,
    preview: message.text,
    childName: fullName(child),
    circuitName: child.circuitNumber,
    createdAt: message.createdAt,
    unread: message.authorId !== state.user.id && !message.readBy?.includes(state.user.id),
    important: false
  };
}

function dashboardMessageFromSupportRequest(request) {
  return {
    authorName: request.userName,
    authorRole: request.userRole,
    subject: request.subject,
    preview: request.message,
    childName: request.context?.childName || "",
    circuitName: request.context?.circuitNumber || "",
    createdAt: request.lastReplyAt || request.updatedAt || request.createdAt,
    unread: !request.readBy?.includes(state.user.id) || supportMessages(request.id).some((message) => message.authorId !== state.user.id && !message.readBy?.includes(state.user.id)),
    important: request.status === "pending"
  };
}

function recentMessageSort(a, b) {
  return Number(!!b.unread) - Number(!!a.unread)
    || Number(!!b.important) - Number(!!a.important)
    || new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
}

function supportContextForUser() {
  if (isParent()) {
    const child = selectedParentChild() || visibleChildren()[0];
    return child ? supportContextFromChild(child, state.user.phone) : { userPhone: state.user.phone || "" };
  }
  if (state.user?.role === "driver") {
    const driver = data.drivers.find((item) => item.id === state.user.id) || {};
    const children = visibleChildren();
    const vehicle = visibleCollection("vehicles")[0] || {};
    const assistant = visibleCollection("assistants")[0] || {};
    const school = visibleCollection("schools")[0] || {};
    const circuit = visibleCollection("circuits")[0] || {};
    return {
      circuitNumber: circuit.name || driver.schoolCircuit || "",
      schoolName: school.name || driver.schoolName || "",
      busNumber: vehicle.busNumber || driver.busNumber || "",
      driverId: driver.id || state.user.id,
      driverName: fullName(driver),
      assistantId: assistant.id || "",
      assistantName: assistant.id ? fullName(assistant) : "",
      userPhone: driver.phone || "",
      childrenCount: children.length
    };
  }
  if (state.user?.role === "assistant") {
    const assistant = data.assistants.find((item) => item.id === state.user.id) || {};
    const school = visibleCollection("schools")[0] || {};
    const circuit = visibleCollection("circuits")[0] || {};
    return {
      circuitNumber: circuit.name || assistant.schoolCircuit || "",
      schoolName: school.name || "",
      assistantId: assistant.id || state.user.id,
      assistantName: fullName(assistant),
      userPhone: assistant.phone || ""
    };
  }
  return { userPhone: state.user?.phone || "" };
}

function supportContextFromChild(child, userPhone = "") {
  const vehicle = childVehicle(child);
  const driver = childDriver(child);
  const assistant = childAssistant(child);
  return {
    childId: child.id,
    childName: fullName(child),
    schoolName: child.schoolName || "",
    circuitNumber: child.circuitNumber || "",
    busNumber: vehicle?.busNumber || child.transferVehicleId || "",
    driverId: driver?.id || child.driverId || "",
    driverName: driver ? fullName(driver) : "",
    assistantId: assistant?.id || child.assistantId || "",
    assistantName: assistant ? fullName(assistant) : "",
    userPhone: userPhone || ""
  };
}

function supportContextForRequest(localData, request) {
  const child = (localData.children || []).find((item) => item.id === request.childId);
  if (child) {
    const vehicle = (localData.vehicles || []).find((item) => item.id === child.vehicleId || item.circuitId === child.circuitNumber);
    const driver = (localData.drivers || []).find((item) => item.id === child.driverId);
    const assistant = (localData.assistants || []).find((item) => item.id === child.assistantId);
    return {
      childId: child.id,
      childName: fullName(child),
      schoolName: child.schoolName || "",
      circuitNumber: child.circuitNumber || "",
      busNumber: vehicle?.busNumber || "",
      driverId: driver?.id || child.driverId || "",
      driverName: driver ? fullName(driver) : "",
      assistantId: assistant?.id || child.assistantId || "",
      assistantName: assistant ? fullName(assistant) : "",
      userPhone: request.userPhone || ""
    };
  }
  return {};
}

function searchAll(term) {
  const needle = normalizeSearch(term);
  const results = [];
  const allChildSearch = ["driver", "assistant"].includes(state.user?.role);
  const source = isAdmin() ? data : {
    children: allChildSearch ? data.children : visibleCollection("children"),
    drivers: allChildSearch ? data.drivers : visibleCollection("drivers"),
    assistants: visibleCollection("assistants"),
    vehicles: visibleCollection("vehicles"),
    schools: visibleCollection("schools"),
    circuits: visibleCollection("circuits")
  };
  const types = isAdmin()
    ? ["children", "drivers", "assistants", "vehicles", "schools", "circuits", "users", "parents"]
    : ["children", "drivers", "assistants", "vehicles", "schools", "circuits"];
  types.forEach((type) => {
    (source[type] || []).forEach((item) => {
      const baseText = type === "children" ? childSearchText(item) : collectSearchText(item);
      const text = normalizeSearch(`${baseText} ${relatedSearchText(type, item)} ${titleFor(type)} ${itemTitle(type, item)} ${itemDetail(type, item)}`);
      if (text.includes(needle)) results.push({ type, id: item.id, title: itemTitle(type, item), label: `${titleFor(type)} - ${itemDetail(type, item)}` });
    });
  });
  return results;
}

function searchChildren(term) {
  const needle = normalizeSearch(term);
  return visibleChildren().filter((child) => {
    const baseText = childSearchText(child);
    const text = normalizeSearch(`${baseText} ${relatedSearchText("children", child)}`);
    return text.includes(needle);
  });
}

function parentSafeChildSearchText(child) {
  const people = [...(child.guardians || []), ...(child.authorizedPickupPersons || [])]
    .map((person) => [person.firstName, person.lastName, person.phone, person.relation, person.address].filter(Boolean).join(" "))
    .join(" ");
  return [
    child.firstName,
    child.lastName,
    child.schoolName,
    child.circuitNumber,
    childPickupCircuitLabel(child),
    childSchoolCircuitLabel(child),
    child.pickupStop,
    child.homeAddress,
    child.postalCode,
    child.city,
    collectSearchText(normalizeAlternatingResidence(child)),
    child.medicalDisabilityType,
    child.allergies,
    child.medicalConditions,
    child.medicalSymptoms,
    child.medicalNotes,
    collectSearchText(normalizeMedicalHelpSheet(child)),
    child.communicationHelp,
    child.mobilityHelp,
    child.transportSickness,
    child.importantInstructions,
    child.parentNotes,
    childVehicle(child)?.busNumber,
    childDriver(child) ? fullName(childDriver(child)) : "",
    childAssistant(child) ? fullName(childAssistant(child)) : "",
    people
  ].filter(Boolean).join(" ");
}

function childSearchText(child) {
  if (isParent()) return parentSafeChildSearchText(child);
  return collectSearchText({ ...child, transferCircuit: "" });
}

function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function collectSearchText(value) {
  if (value == null) return "";
  if (["string", "number", "boolean"].includes(typeof value)) return String(value);
  if (Array.isArray(value)) return value.map(collectSearchText).join(" ");
  if (typeof value === "object") return Object.values(value).map(collectSearchText).join(" ");
  return "";
}

function relatedSearchText(type, item) {
  const parts = [];
  const add = (value) => {
    if (value) parts.push(collectSearchText(value));
  };
  const circuitsByName = (name) => data.circuits.filter((circuit) => circuit.name === name || circuit.id === name);
  const schoolByName = (name) => data.schools.find((school) => school.name === name);
  if (type === "children") {
    add(data.drivers.find((driver) => driver.id === item.driverId));
    add(data.assistants.find((assistant) => assistant.id === item.assistantId));
    const vehicle = data.vehicles.find((entry) => entry.id === item.vehicleId || entry.busNumber === item.transferVehicleId);
    add(isParent() ? parentSafeVehicleText(vehicle) : vehicle);
    circuitsByName(item.circuitNumber).forEach(add);
    add(schoolByName(item.schoolName));
  }
  if (type === "drivers") {
    add(data.vehicles.find((vehicle) => vehicle.driverId === item.id || vehicle.busNumber === item.busNumber || vehicle.licensePlate === item.licensePlate));
    data.circuits.filter((circuit) => circuit.driverId === item.id || circuit.name === item.schoolCircuit).forEach(add);
    add(schoolByName(item.schoolName));
  }
  if (type === "assistants") {
    data.circuits.filter((circuit) => circuit.assistantId === item.id || circuit.name === item.schoolCircuit).forEach(add);
    data.vehicles.filter((vehicle) => vehicle.assistantId === item.id).forEach(add);
  }
  if (type === "vehicles") {
    add(data.drivers.find((driver) => driver.id === item.driverId));
    add(data.assistants.find((assistant) => assistant.id === item.assistantId));
    circuitsByName(item.circuitId).forEach(add);
    add(schoolByName(item.schoolName));
  }
  if (type === "circuits") {
    add(data.drivers.find((driver) => driver.id === item.driverId));
    add(data.assistants.find((assistant) => assistant.id === item.assistantId));
    add(data.vehicles.find((vehicle) => vehicle.id === item.vehicleId));
    add(schoolByName(item.schoolName));
  }
  if (type === "schools") {
    data.circuits.filter((circuit) => circuit.schoolName === item.name).forEach(add);
    data.children.filter((child) => child.schoolName === item.name).forEach(add);
  }
  if (type === "users") {
    add(data.drivers.find((driver) => driver.id === item.id));
    add(data.assistants.find((assistant) => assistant.id === item.id));
    (item.assignedCircuits || []).flatMap(circuitsByName).forEach(add);
    add(data.vehicles.find((vehicle) => vehicle.id === item.assignedVehicleId));
    add(schoolByName(item.assignedSchool));
  }
  if (type === "parents") {
    (item.linkedChildrenIds || []).map((id) => data.children.find((child) => child.id === id)).forEach(add);
  }
  return parts.join(" ");
}

function parentSafeVehicleText(vehicle) {
  if (!vehicle) return "";
  return [vehicle.busNumber, vehicle.circuitId, vehicle.schoolName].filter(Boolean).join(" ");
}

function normalizeVehicleOutOfService(vehicle = {}) {
  return {
    ...vehicle,
    isOutOfService: vehicle.isOutOfService === true,
    outOfServiceReason: vehicle.outOfServiceReason || "",
    outOfServiceMessage: vehicle.outOfServiceMessage || "",
    outOfServiceStartDate: vehicle.outOfServiceStartDate || "",
    outOfServiceEndDate: vehicle.outOfServiceEndDate || "",
    outOfServiceUpdatedBy: vehicle.outOfServiceUpdatedBy || "",
    outOfServiceUpdatedAt: vehicle.outOfServiceUpdatedAt || "",
    outOfServiceReadBy: Array.isArray(vehicle.outOfServiceReadBy) ? vehicle.outOfServiceReadBy : [],
    outOfServiceResolvedAt: vehicle.outOfServiceResolvedAt || "",
    outOfServiceResolvedBy: vehicle.outOfServiceResolvedBy || ""
  };
}

function activeOutOfServiceVehicles() {
  return (data.vehicles || []).map(normalizeVehicleOutOfService).filter((vehicle) => vehicle.isOutOfService);
}

function vehicleImpactedCircuits(vehicle) {
  if (!vehicle) return [];
  return (data.circuits || []).filter((circuit) =>
    circuit.vehicleId === vehicle.id ||
    circuit.name === vehicle.circuitId ||
    circuit.id === vehicle.circuitId
  );
}

function vehicleImpactedChildren(vehicle) {
  if (!vehicle) return [];
  const circuitNames = new Set(vehicleImpactedCircuits(vehicle).map((circuit) => circuit.name).filter(Boolean));
  if (vehicle.circuitId) circuitNames.add(vehicle.circuitId);
  return (data.children || []).filter((child) =>
    child.vehicleId === vehicle.id ||
    child.transferVehicleId === vehicle.id ||
    child.transferVehicleId === vehicle.busNumber ||
    circuitNames.has(child.circuitNumber)
  );
}

function vehicleImpactsChild(vehicle, child) {
  return !!vehicle && !!child && vehicleImpactedChildren(vehicle).some((item) => item.id === child.id);
}

function outOfServiceVehiclesForCurrentUser(child = null) {
  const active = activeOutOfServiceVehicles();
  if (!state.user) return [];
  if (isPrimaryAdmin()) return [];
  if (state.user.role === "parent") {
    const parentChildren = child ? [child] : visibleChildren();
    return active.filter((vehicle) => parentChildren.some((item) => vehicleImpactsChild(vehicle, item)));
  }
  if (["admin", "driver", "assistant", "support"].includes(state.user.role)) return active;
  return [];
}

function resolvedOutOfServiceVehiclesForCurrentUser() {
  if (!state.user || ["admin", "support"].includes(state.user.role)) return [];
  const resolved = (data.vehicles || []).map(normalizeVehicleOutOfService).filter((vehicle) => !vehicle.isOutOfService && vehicle.outOfServiceResolvedAt);
  if (state.user.role === "parent") {
    const children = visibleChildren();
    return resolved.filter((vehicle) => children.some((child) => vehicleImpactsChild(vehicle, child)));
  }
  if (["driver", "assistant"].includes(state.user.role)) return resolved;
  return [];
}

function vehicleOutOfServiceReadEntry(vehicle) {
  return (vehicle.outOfServiceReadBy || []).find((entry) => entry.userId === state.user?.id && entry.role === state.user?.role);
}

function outOfServiceDateRange(vehicle) {
  return formatDateRange(vehicle.outOfServiceStartDate, vehicle.outOfServiceEndDate) || "Dates non renseignées";
}

function outOfServiceImpactedLabels(vehicle) {
  const circuits = uniqueText(vehicleImpactedCircuits(vehicle).map((circuit) => circuit.name));
  const schools = uniqueText([vehicle.schoolName, ...vehicleImpactedCircuits(vehicle).map((circuit) => circuit.schoolName), ...vehicleImpactedChildren(vehicle).map((child) => child.schoolName)]);
  return { circuits: circuits.join(", ") || vehicle.circuitId || "Non renseigné", schools: schools.join(", ") || "Non renseigné" };
}

function vehicleCircuitLabel(vehicle) {
  if (!vehicle) return "Non renseigné";
  const circuit = (data.circuits || []).find((item) => item.id === vehicle.circuitId || item.name === vehicle.circuitId || item.vehicleId === vehicle.id);
  return circuit?.name || vehicle.circuitId || "Non renseigné";
}

function vehicleOutOfServiceAlerts(child = null) {
  const vehicles = outOfServiceVehiclesForCurrentUser(child).filter((vehicle) => !vehicleOutOfServiceReadEntry(vehicle));
  if (!vehicles.length) return "";
  const parentView = state.user?.role === "parent";
  return `<div class="out-service-alerts compact-out-service-alerts">
    ${vehicles.map((vehicle) => {
      const labels = outOfServiceImpactedLabels(vehicle);
      return `<article class="pending-card vehicle-out-service-card compact-alert-card">
        <div class="pending-head">
          <div><p class="eyebrow">${parentView ? "Information transport" : "Véhicule hors service"}</p><h3>${parentView ? "Le véhicule assurant le transport de votre enfant est actuellement hors service" : `Bus ${esc(vehicle.busNumber || "Non renseigné")} hors service`}</h3></div>
          <b class="badge danger">Alerte</b>
        </div>
        ${sectionRows(parentView ? [
          ["Numéro du bus", vehicle.busNumber],
          ["Date début", vehicle.outOfServiceStartDate],
          ["Date fin", vehicle.outOfServiceEndDate]
        ] : [
          ["Numéro du bus", vehicle.busNumber],
          ["Circuit concerné", labels.circuits],
          ["Message", vehicle.outOfServiceMessage],
          ["Date début", vehicle.outOfServiceStartDate],
          ["Date fin", vehicle.outOfServiceEndDate]
        ])}
        <div class="form-actions"><button class="primary-button compact-action" data-ack-vehicle-oos="${esc(vehicle.id)}">J’ai compris</button></div>
      </article>`;
    }).join("")}
  </div>`;
}

function dashboard() {
  const children = visibleChildren();
  const driver = selectedDashboardDriver();
  const circuitsList = visibleCollection("circuits");
  const vehicles = visibleCollection("vehicles");
  const assistants = visibleCollection("assistants");
  const schoolsList = visibleCollection("schools");
  const vehicle = vehicles[0];
  const assistant = assistants[0];
  const circuits = circuitsList.map((circuit) => circuit.name).join(", ") || [...new Set(children.map((child) => child.circuitNumber))].join(", ") || "Non renseigné";
  const schools = schoolsList.map((school) => school.name).join(", ") || [...new Set(children.map((child) => child.schoolName))].join(", ") || "Non renseigné";
  if (state.user?.role === "assistant") {
    const summary = assistantDashboardSummary();
    const cards = [
      { id: "driver", label: "Chauffeur associé", render: (label) => metric(label, summary.driverNames) },
      { id: "vehicle", label: "Numéro véhicule", render: (label) => metric(label, summary.vehicleNumbers) },
      { id: "circuit", label: "Numéro de circuit", render: (label) => metric(label, summary.circuitNumbers) },
      { id: "outOfServiceVehicles", label: "Véhicules hors service", render: (label) => dashboardOutOfServiceMetric(label) },
      { id: "children", label: "Nombre d'élèves", render: (label) => metricButton(label, summary.childrenCount, "associated-children") },
      { id: "school", label: "École desservie", render: (label) => metricButton(label, summary.schoolNames, "associated-schools") }
    ];
    return `
      <section class="view-stack">
      <div class="section-title"><p class="eyebrow">Aujourd’hui</p><h2>Tableau de bord convoyeuse</h2></div>
        ${vehicleOutOfServiceAlerts()}
        ${circuitReplacementAlerts()}
        ${transferDelayAlerts()}
        ${pendingRequestsPanel()}
        ${studentAbsencesDashboardCard()}
        ${studentIssuesDashboardCard()}
        ${privateMessageNotification()}
        <div class="metric-grid assistant-dashboard-grid">
          ${orderedDashboardCards("assistant", cards)}
        </div>
      </section>`;
  }
  const dashboardRole = state.user?.role === "driver" ? "driver" : "admin";
  const cards = [
    { id: driver ? "driver" : "drivers", label: driver ? "Chauffeur sélectionné" : "Chauffeurs", render: (label) => driver ? metric(label, fullName(driver)) : usesSpwIdentity() ? "" : metric(label, visibleCollection("drivers").length) },
    { id: "phone", label: "Téléphone chauffeur", render: (label) => driver ? metric(label, driver.phone || "Non renseigné") : "" },
    { id: "bus", label: "Numéro identification bus KEOLIS", render: (label) => metric(label, vehicle ? vehicle.busNumber : "Non renseigné") },
    { id: "outOfServiceVehicles", label: "Véhicules hors service", render: (label) => dashboardOutOfServiceMetric(label) },
    { id: "circuits", label: "Circuit effectué", render: (label) => metric(label, circuits) },
    { id: "schools", label: "École desservie", render: (label) => usesSpwIdentity() ? metricButton(label, schools, "associated-schools") : metric(label, schools) },
    { id: "assistant", label: "Convoyeuse associée", render: (label) => usesSpwIdentity() ? metricButton(label, assistant ? fullName(assistant) : "Non renseigné", "associated-assistants") : metric(label, assistant ? fullName(assistant) : "Non renseigné") },
    { id: "children", label: "Nombre d'élèves", render: (label) => usesSpwIdentity() ? metricButton(label, children.length, "associated-children") : metric(label, children.length) }
  ];
  return `
    <section class="view-stack">
      <div class="section-title"><p class="eyebrow">Aujourd’hui</p><h2>${driver ? "Tableau de bord chauffeur" : "Tableau de bord"}</h2></div>
      ${isPrimaryAdmin() ? "" : vehicleOutOfServiceAlerts()}
      ${isPrimaryAdmin() ? replacementRulesDashboardShortcut() : circuitReplacementAlerts()}
      ${transferDelayAlerts()}
      ${requestsDashboardAlerts()}
      ${pendingRequestsPanel()}
      ${studentAbsencesDashboardCard()}
      ${studentIssuesDashboardCard()}
      ${privateMessageNotification()}
      ${dashboardMessagesCard()}
      <div class="metric-grid">
        ${orderedDashboardCards(dashboardRole, cards)}
      </div>
    </section>`;
}

function transfersView() {
  const transfers = visibleTransportTransfers();
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Organisation transport</p><h2>Mes transferts</h2></div>
    ${transfers.length ? `<div class="card-grid transfer-grid">${transfers.map(transferCard).join("")}</div>` : `<article class="info-card"><p>Aucun transfert lié à vos circuits pour le moment.</p></article>`}
  </section>`;
}

function transferCard(transfer) {
  const delay = activeDelayForTransfer(transfer);
  const students = (data.children || []).filter((child) => (transfer.studentsIds || []).includes(child.id));
  const circuit = circuitByRef(transfer.circuitId);
  const canManage = canManageTransferDelay(transfer);
  return `<article class="record-card transfer-card">
    <div>
      <strong>${esc(transfer.transferName || "Transfert")}</strong>
      <span>${esc(transfer.circuitId || circuit?.name || "Circuit non renseigné")}</span>
    </div>
    ${delay ? `<b class="badge warning">Retard en cours</b>` : `<b class="badge ok">À l’heure</b>`}
    ${sectionRows([
      ["Élèves liés", students.length],
      ["Chauffeur", driverByRef(transfer.driverId) ? fullName(driverByRef(transfer.driverId)) : ""],
      ["Convoyeuse", assistantByRef(transfer.convoyeurId || transfer.assistantId) ? fullName(assistantByRef(transfer.convoyeurId || transfer.assistantId)) : ""]
    ])}
    ${students.length ? `<div class="quick-list-inner compact-list">${students.slice(0, 6).map((child) => `<button class="child-row" type="button" data-open-child="${esc(child.id)}"><span>${esc(fullName(child))}</span><small>${esc(child.pickupStop || "")}</small>${delayBadge(child)}</button>`).join("")}${students.length > 6 ? `<p class="muted">+ ${esc(students.length - 6)} autre${students.length - 6 > 1 ? "s" : ""} élève${students.length - 6 > 1 ? "s" : ""}</p>` : ""}</div>` : ""}
    ${delay ? activeDelayPanel(delay, canManage) : canManage ? transferDelayForm(transfer) : ""}
  </article>`;
}

function transferDelayForm(transfer) {
  return `<form class="mini-form transfer-delay-form" data-transfer-delay-form="${esc(transfer.transferId)}">
    <label><span>Durée du retard</span><select name="delayMinutes">
      <option value="5">5 min</option>
      <option value="10">10 min</option>
      <option value="15">15 min</option>
      <option value="20">20 min</option>
      <option value="custom">Autre durée</option>
    </select></label>
    <label><span>Durée personnalisée</span><input name="customDelayMinutes" type="number" min="1" step="1" placeholder="Minutes"></label>
    <label><span>Motif optionnel</span><select name="reason">
      <option value="">Non renseigné</option>
      <option value="circulation">Circulation</option>
      <option value="déviation">Déviation</option>
      <option value="panne">Panne</option>
      <option value="météo">Météo</option>
      <option value="autre">Autre</option>
    </select></label>
    ${canTriggerSmsTransportAlert() ? `<label class="check-field"><input name="notifyParentsSms" type="checkbox" checked>Prévenir les parents par SMS</label>` : ""}
    <button class="primary-button compact-action" type="submit">Signaler un retard</button>
  </form>`;
}

function activeDelayPanel(delay, canManage) {
  return `<div class="notice-card transfer-delay-panel">
    <p><strong>Retard en cours</strong><br>${esc(delay.delayMinutes)} minutes${delay.reason ? ` - ${esc(delay.reason)}` : ""}<br><small>${esc(formatDateTime(delay.createdAt))}</small></p>
    ${canManage ? `<button class="secondary-button compact-action" type="button" data-resolve-transfer-delay="${esc(delay.id)}">Retard terminé</button>` : ""}
  </div>`;
}

function assistantDashboardSummary() {
  const currentAssistant = data.assistants.find((item) => item.id === state.user?.id) || state.user || {};
  const circuitNames = new Set([
    ...(state.user?.assignedCircuits || []),
    ...(currentAssistant.assignedCircuits || []),
    currentAssistant.schoolCircuit
  ].filter(Boolean));

  (data.circuits || [])
    .filter((circuit) => circuit.assistantId === state.user?.id || circuitNames.has(circuit.name))
    .forEach((circuit) => circuit.name && circuitNames.add(circuit.name));

  let circuits = (data.circuits || []).filter((circuit) => circuitNames.has(circuit.name) || circuit.assistantId === state.user?.id);
  circuits.forEach((circuit) => circuit.name && circuitNames.add(circuit.name));

  const vehicles = (data.vehicles || []).filter((vehicle) =>
    circuitNames.has(vehicle.circuitId) ||
    circuits.some((circuit) => circuit.vehicleId === vehicle.id) ||
    vehicle.assistantId === state.user?.id
  );
  vehicles.forEach((vehicle) => vehicle.circuitId && circuitNames.add(vehicle.circuitId));

  circuits = (data.circuits || []).filter((circuit) => circuitNames.has(circuit.name) || circuits.some((item) => item.id === circuit.id));
  const circuitDriverIds = new Set(circuits.map((circuit) => circuit.driverId).filter(Boolean));
  const circuitAssistantIds = new Set(circuits.map((circuit) => circuit.assistantId).filter(Boolean));
  vehicles.forEach((vehicle) => {
    if (vehicle.driverId) circuitDriverIds.add(vehicle.driverId);
    if (vehicle.assistantId) circuitAssistantIds.add(vehicle.assistantId);
  });

  const assistants = (data.assistants || []).filter((assistant) =>
    assistant.id === state.user?.id ||
    circuitAssistantIds.has(assistant.id) ||
    circuitNames.has(assistant.schoolCircuit) ||
    (assistant.assignedCircuits || []).some((name) => circuitNames.has(name))
  );
  const children = (data.children || []).filter((child) => circuitNames.has(child.circuitNumber));
  const childDriverIds = new Set(children.map((child) => child.driverId).filter(Boolean));
  const driversFromChildren = (data.drivers || []).filter((driver) => childDriverIds.has(driver.id));
  const drivers = driversFromChildren.length
    ? driversFromChildren
    : (data.drivers || []).filter((driver) => circuitDriverIds.has(driver.id) || circuitNames.has(driver.schoolCircuit));
  const childSchoolNames = uniqueText(children.map((child) => child.schoolName));
  const schoolNames = childSchoolNames.length ? childSchoolNames : uniqueText([
    ...circuits.map((circuit) => circuit.schoolName),
    ...vehicles.map((vehicle) => vehicle.schoolName)
  ]);

  return {
    assistantNames: uniqueText(assistants.map(fullName)).join(", ") || fullName(currentAssistant) || "Non renseigné",
    driverNames: uniqueText(drivers.map(fullName)).join(", ") || "Non renseigné",
    vehicleNumbers: uniqueText(vehicles.map((vehicle) => vehicle.busNumber)).join(", ") || "Non renseigné",
    circuitNumbers: uniqueText([...circuitNames]).join(", ") || "Non renseigné",
    schoolNames: schoolNames.join(", ") || "Non renseigné",
    childrenCount: children.length
  };
}

function driverByRef(ref) {
  const value = String(ref || "").trim().toLowerCase();
  if (!value) return null;
  return (data.drivers || []).find((driver) =>
    String(driver.id || "").toLowerCase() === value ||
    fullName(driver).toLowerCase() === value ||
    `${driver.lastName || ""} ${driver.firstName || ""}`.trim().toLowerCase() === value ||
    driverOptionLabel(driver).toLowerCase() === value
  ) || null;
}

function circuitOptionLabel(circuit = {}) {
  return [circuit.name, circuit.schoolName].filter(Boolean).join(" - ");
}

function circuitByRef(ref, source) {
  const store = source || data;
  const value = String(ref || "").trim().toLowerCase();
  if (!value) return null;
  return (store.circuits || []).find((circuit) =>
    String(circuit.id || "").toLowerCase() === value ||
    String(circuit.name || "").toLowerCase() === value ||
    circuitOptionLabel(circuit).toLowerCase() === value
  ) || null;
}

function assistantByRef(ref) {
  const value = String(ref || "").trim().toLowerCase();
  if (!value) return null;
  return (data.assistants || []).find((assistant) =>
    String(assistant.id || "").toLowerCase() === value ||
    fullName(assistant).toLowerCase() === value ||
    `${assistant.lastName || ""} ${assistant.firstName || ""}`.trim().toLowerCase() === value ||
    assistantOptionLabel(assistant).toLowerCase() === value
  ) || null;
}

function uniqueText(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

function visibleParentRequests(status = "") {
  if (!state.user) return [];
  if (!["driver", "assistant"].includes(state.user.role)) return [];
  let requests = data.parentChangeRequests || [];
  requests = requests.filter((request) => request.driverId === state.user.id || request.assistantId === state.user.id);
  if (status) requests = requests.filter((request) => request.status === status);
  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function pendingRequestsPanel() {
  if (!["driver", "assistant"].includes(state.user?.role)) return "";
  const requests = visibleParentRequests("pending");
  if (!requests.length) return "";
  return `<article class="pending-card">
    <div class="pending-head"><div><p class="eyebrow">Demandes parent</p><h3>Demandes parent en attente</h3></div><b>${esc(requests.length)}</b></div>
    <div class="pending-list">${requests.map((request) => `
      <div class="pending-item">
        <strong>${esc(request.childName)}</strong>
        <span>${esc(request.fieldChanged)} : ${esc(request.oldValue || "vide")} -> ${esc(request.newValue || "vide")}</span>
        <small>${esc(formatDateTime(request.createdAt))} - ${esc(request.parentName || "Parent")}</small>
        <div class="form-actions">
          <button class="primary-button compact-action" data-review-request="${esc(request.id)}" data-review-action="approve">Approuver</button>
          <button class="danger-button" data-review-request="${esc(request.id)}" data-review-action="reject">Refuser</button>
          <button class="secondary-button" data-review-request="${esc(request.id)}" data-review-action="confirm">Demander confirmation</button>
        </div>
      </div>`).join("")}</div>
  </article>`;
}

function driverSelector() {
  const selectedId = state.activeFilter?.type === "drivers" ? state.activeFilter.id : "";
  const query = state.driverPickerSearch.trim().toLowerCase();
  const drivers = matchingDrivers(query);
  const resultList = query
    ? `<div class="driver-results">${drivers.length ? drivers.map((driver) => {
        const vehicle = data.vehicles.find((item) => item.driverId === driver.id || item.busNumber === driver.busNumber || item.licensePlate === driver.licensePlate);
        return `<button class="child-row" data-pick-driver="${esc(driver.id)}"><span>${esc(fullName(driver))}</span><small>${esc(driver.phone || "Téléphone ?")} - ${esc(vehicle?.busNumber || driver.busNumber || "Bus ?")} - ${esc(vehicle?.licensePlate || driver.licensePlate || "Plaque ?")}</small></button>`;
      }).join("") : `<p class="muted">Aucun chauffeur trouvé.</p>`}</div>`
    : "";
  return `<article class="info-card form-grid"><label><span>Rechercher un chauffeur</span><input id="driver-picker-search" value="${esc(state.driverPickerSearch)}" placeholder="Nom, circuit..."></label>${resultList}</article>`;
}

function dashboardPersonSelector() {
  return usesSpwIdentity() ? assistantSelector() : driverSelector();
}

function assistantSelector() {
  const selectedId = state.activeFilter?.type === "assistants" ? state.activeFilter.id : "";
  const query = state.driverPickerSearch.trim().toLowerCase();
  const assistants = matchingAssistants(query);
  const circuits = matchingAssistantCircuits(query);
  const resultList = query
    ? `<div class="driver-results">${assistants.length || circuits.length ? `${assistants.map((assistant) => {
        return `<button class="child-row" data-pick-assistant="${esc(assistant.id)}"><span>${esc(fullName(assistant))}</span><small>${esc(assistant.schoolCircuit || "Circuit non renseigné")}</small></button>`;
      }).join("")}${circuits.map((circuit) => {
        const assistant = data.assistants.find((item) => item.id === circuit.assistantId || item.schoolCircuit === circuit.name);
        return `<button class="child-row" data-pick-circuit="${esc(circuit.id)}"><span>Circuit ${esc(circuit.name || circuit.id)}</span><small>${esc(assistant ? fullName(assistant) : "Convoyeuse non renseignée")}</small></button>`;
      }).join("")}` : `<p class="muted">Aucune convoyeuse ou circuit trouvé.</p>`}</div>`
    : "";
  const selected = data.assistants.find((assistant) => assistant.id === selectedId);
  const selectedCircuit = state.activeFilter?.type === "circuits" ? data.circuits.find((circuit) => circuit.id === state.activeFilter.id) : null;
  const activeLabel = selected ? fullName(selected) : selectedCircuit ? `Circuit ${selectedCircuit.name || selectedCircuit.id}` : "";
  return `<article class="info-card form-grid assistant-search-card"><h3>Recherche convoyeuse</h3><label class="visually-compact"><input id="driver-picker-search" value="${esc(state.driverPickerSearch)}" placeholder="Convoyeuse ou circuit..."></label><div class="form-actions centered-actions"><button class="secondary-button compact-action" id="clear-driver-search-button" type="button">Effacer la recherche</button><button class="secondary-button compact-action" id="show-all-data-button" type="button">Afficher toutes les données</button></div>${activeLabel ? `<p class="muted">Filtre actif : ${esc(activeLabel)}</p>` : ""}${resultList}</article>`;
}

function matchingAssistants(query) {
  return data.assistants.filter((assistant) => {
    if (!query) return true;
    const circuits = data.circuits.filter((circuit) => circuit.assistantId === assistant.id || circuit.name === assistant.schoolCircuit);
    const text = [
      assistant.firstName,
      assistant.lastName,
      fullName(assistant),
      assistant.schoolCircuit,
      ...circuits.flatMap((circuit) => [circuit.name, circuit.type, circuit.schoolName])
    ].filter(Boolean).join(" ").toLowerCase();
    return text.includes(query);
  });
}

function matchingAssistantCircuits(query) {
  if (!query) return [];
  return data.circuits.filter((circuit) => {
    const assistant = data.assistants.find((item) => item.id === circuit.assistantId || item.schoolCircuit === circuit.name);
    const text = [
      circuit.name,
      circuit.type,
      circuit.schoolName,
      assistant ? fullName(assistant) : ""
    ].filter(Boolean).join(" ").toLowerCase();
    return text.includes(query);
  });
}

function matchingDrivers(query) {
  return data.drivers.filter((driver) => {
    if (!query) return true;
    const vehicles = data.vehicles.filter((vehicle) => vehicle.driverId === driver.id || vehicle.licensePlate === driver.licensePlate || vehicle.busNumber === driver.busNumber);
    const circuits = data.circuits.filter((circuit) => circuit.driverId === driver.id || circuit.name === driver.schoolCircuit);
    const text = [
      driver.firstName,
      driver.lastName,
      fullName(driver),
      driver.phone,
      driver.schoolCircuit,
      driver.busNumber,
      driver.licensePlate,
      ...vehicles.flatMap((vehicle) => [vehicle.busNumber, vehicle.licensePlate, vehicle.circuitId, vehicle.schoolName]),
      ...circuits.flatMap((circuit) => [circuit.name, circuit.schoolName, circuit.type])
    ].filter(Boolean).join(" ").toLowerCase();
    return text.includes(query);
  });
}

function metric(label, value) {
  return `<article class="metric-card"><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`;
}

function metricButton(label, value, action) {
  return `<button class="metric-card metric-button" type="button" data-dashboard-action="${esc(action)}"><span>${esc(label)}</span><strong>${esc(value)}</strong></button>`;
}

function childrenList() {
  const children = visibleChildren();
  return `
    <section class="view-stack">
      <div class="section-title action-title"><div><p class="eyebrow">Fiches</p><h2>Élèves</h2></div>${canCreateChild() ? `<button class="primary-button compact-action" data-new-child>Ajouter</button>` : ""}</div>
      <div class="card-grid">${children.map((child) => `
        <button class="record-card" data-open-child="${esc(child.id)}">
          <div><strong>${esc(fullName(child))}</strong><span>${esc(child.schoolName)} - ${esc(child.circuitNumber)}</span></div>
          ${badge(child)}${alternatingCustodyBadge(child)}${absenceBadge(child)}${delayBadge(child)}${specialAttentionBadge(child)}
          <small>${esc(child.pickupStop)}</small>
        </button>`).join("")}</div>
    </section>`;
}

function childRow(child) {
  return `<button class="child-row" data-open-child="${esc(child.id)}"><span>${esc(fullName(child))}</span><small>${esc(child.pickupStop)} - ${esc(child.circuitNumber)}</small>${badge(child)}${alternatingCustodyBadge(child)}${absenceBadge(child)}${delayBadge(child)}${specialAttentionBadge(child)}</button>`;
}

function childGeneralRows(child) {
  return [
    [parentT("child.firstName"), child.firstName],
    [parentT("child.lastName"), child.lastName],
    [parentT("child.birthDate"), child.birthDate],
    [parentT("child.age"), age(child.birthDate)],
    [parentT("child.school"), child.schoolName],
    [parentT("child.circuitNumber"), child.circuitNumber],
    ["Rue", child.streetName || child.street || splitStreetAndNumber(child.homeAddress).street],
    ["Numéro", child.streetNumber || child.houseNumber || splitStreetAndNumber(child.homeAddress).number],
    ["Code postal", child.postalCode],
    ["Commune", child.city],
    ["Téléphone", child.phone || child.childPhone || ""]
  ];
}

function childTransportRows(child) {
  const hasTransfer = childHasTransfer(child);
  const rows = [
    ["Circuit de prise en charge", childPickupCircuitLabel(child)],
    [parentT("child.driverLinked"), childDriver(child) ? fullName(childDriver(child)) : ""],
    [parentT("child.assistantLinked"), childAssistant(child) ? fullName(childAssistant(child)) : ""],
    [parentT("child.pickupStop"), child.pickupStop],
    ["Transfert", hasTransfer ? "oui" : "non"]
  ];
  if (!isParent()) rows.splice(1, 0, [parentT("child.transferLocation"), child.transferLocation]);
  if (hasTransfer) {
    rows.push(
      ["Circuit vers l’école après transfert", circuitLabelByRef(child.transferSchoolCircuitId || child.transferCircuitId || child.schoolCircuitId) || childSchoolCircuitLabel(child)],
      ["Chauffeur après transfert", driverDisplayName(child.transferDriverId)],
      ["Convoyeuse après transfert", assistantByRef(child.transferAssistantId) ? fullName(assistantByRef(child.transferAssistantId)) : child.transferAssistantId || ""]
    );
  }
  return rows;
}

function childHasTransfer(child = {}) {
  if (typeof child.hasTransfer === "boolean") return child.hasTransfer;
  return child.changesBusAtTransfer === true || child.staysInSameBus === false;
}

function autonomyRows(child = {}) {
  const autonomy = child.autonomy || {};
  return [
    ["Autonome", autonomy.autonomous === true || child.autonomyStatus === "autonome" ? "oui" : "non"],
    ["Accompagné obligatoire", autonomy.accompanimentRequired === true || child.autonomyStatus === "accompagne" ? "oui" : "non"],
    ["Aide à la montée", autonomy.boardingHelp || child.mobilityHelp],
    ["Aide à la descente", autonomy.exitHelp],
    ["Surveillance renforcée", autonomy.enhancedSupervision === true ? "oui" : "non"],
    ["Remarques autonomie", autonomy.notes]
  ];
}

function autonomySection(child) {
  if (!canSeeAutonomy(child)) return "";
  return section("Autonomie", autonomyRows(child));
}

function badge(child) {
  if (!canSeeMedicalHelpBadge(child)) return "";
  const completed = !!child.parentMedicalHelpCompletedAt;
  return `<b class="badge ${completed ? "ok" : "warning"}">${completed ? "Fiche médicale complétée" : "Fiche médicale non complétée"}</b>`;
}

function alternatingCustodyBadge(child) {
  if (!canSeeAlternatingCustody(child) || !normalizeAlternatingResidence(child).enabled) return "";
  return `<b class="badge warning">Garde alternée</b>`;
}

function childDetail(child) {
  const canManage = canManageChild(child);
  const canDelete = canDeleteChild(child);
  const canPdf = canGenerateChildPdf(child);
  return `
    <section class="view-stack child-detail">
      <div class="detail-head">
        <button class="icon-button" data-back title="${esc(parentT("common.back"))}">‹</button>
        <div><p class="eyebrow">${esc(parentT("child.fileTitle"))}</p><h2>${esc(fullName(child))}</h2></div>
        ${badge(child)}${alternatingCustodyBadge(child)}${specialAttentionBadge(child)}
      </div>
      <div class="action-row child-detail-actions">${canPdf ? `<button class="secondary-button" data-generate-child-pdf="${esc(child.id)}">Générer PDF</button>` : ""}${canManage ? `<button class="action-button as-button" data-edit-child="${esc(child.id)}">${esc(parentT("action.edit"))}</button>${canDelete ? `<button class="danger-button" data-delete-child="${esc(child.id)}">${esc(parentT("action.delete"))}</button>` : ""}` : ""}</div>
      ${studentIssueUrgentAlert(child)}
      ${specialAttentionBox(child)}
      ${vehicleOutOfServiceAlerts(child)}
      ${circuitReplacementAlerts(child)}
      ${transferDelayAlerts(child)}
      <div class="detail-grid">
        ${section(parentT("child.general"), childGeneralRows(child))}
        ${section(parentT("child.transport"), childTransportRows(child))}
        ${alternatingResidenceSection(child)}
        ${transportStatusSection(child)}
        ${parentTransferCard(child)}
        ${autonomySection(child)}
        ${canSeeChildPeople(child) ? peopleSection("Personnes responsables", child.responsiblePersons || child.guardians) : ""}
        ${canSeeChildPeople(child) ? peopleSection(parentT("people.authorized"), child.authorizedPersons || child.authorizedPickupPersons) : ""}
        ${medicalHelpSection(child)}
        ${canSeeChildSchoolSection(child) ? section(parentT("child.schoolSection"), [[parentT("child.schoolName"), child.schoolName], [parentT("child.phone"), child.schoolPhone], [parentT("child.email"), child.schoolEmail], ["Adresse école", child.schoolAddress], ["Remarques école", child.schoolNotes]]) : ""}
        ${studentIssuesSection(child)}
        ${privateConversationBlock(child)}
      </div>
    </section>`;
}

function studentIssuesForChild(childId) {
  return [...(data.studentIssues || [])]
    .filter((issue) => issue.childId === childId && canSeeStudentIssue(issue))
    .sort((a, b) => Number(b.importance === "urgent") - Number(a.importance === "urgent") || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function visibleStudentIssuesForCurrentUser() {
  return [...(data.studentIssues || [])].filter(canSeeStudentIssue);
}

function canSeeStudentIssue(issue = {}) {
  if (!state.user || isSupport()) return false;
  if (isPrimaryAdmin()) return false;
  if (isAdmin()) return true;
  const child = data.children.find((item) => item.id === issue.childId);
  if (!child) return false;
  if (isParent()) return parentLinkedToChild(state.user, child);
  if (state.user.role === "driver") return issue.driverId === state.user.id || userCircuitNames().has(child.circuitNumber);
  if (state.user.role === "assistant") return issue.assistantId === state.user.id || userCircuitNames().has(child.circuitNumber);
  return false;
}

function canSignalStudentIssue(child) {
  if (isSupportAssistanceSession()) return false;
  return !!child && !isPrimaryAdmin() && ["admin", "driver", "assistant", "parent"].includes(state.user?.role) && childVisibleFromCurrentContext(child.id);
}

function canManageStudentIssue(issue) {
  if (isSupportAssistanceSession()) return false;
  return !!issue && !isPrimaryAdmin() && ["admin", "driver", "assistant"].includes(state.user?.role) && canSeeStudentIssue(issue);
}

function canSeeSpecialAttention(child) {
  return canSeeSensitiveStudent(child);
}

function canEditSpecialAttention() {
  return canEditSensitiveStudent();
}

function specialAttentionLevelTone(level = "") {
  if (level === "urgent") return "danger";
  if (level === "important") return "warning";
  return "ok";
}

function specialAttentionBadge(child) {
  if (!canSeeSpecialAttention(child) || !child.attentionSpeciale) return "";
  if (isParent()) return `<b class="badge warning">Élève nécessitant une attention particulière</b>`;
  return `<button class="badge warning attention-badge" type="button" data-special-attention="${esc(child.id)}">⚠️ Attention</button>`;
}

function specialAttentionBox(child) {
  if (!canSeeSpecialAttention(child) || !child.attentionSpeciale) return "";
  if (isSupportAssistanceSession()) return `<article class="info-card privacy-masked-card"><h3>Élève sensible</h3><p>${esc(supportAssistanceMaskedValue())}</p></article>`;
  if (isParent()) return `<article class="info-card special-attention-card"><h3>Élève sensible</h3><b class="badge warning">Élève nécessitant une attention particulière</b></article>`;
  return `<article class="info-card special-attention-card">
    <div class="pending-head"><div><p class="eyebrow">Élève sensible</p><h3>${esc(child.typeAttention || "Information")}</h3><span>${esc(child.noteAttention || child.sensitiveStudent?.instructions || "Information importante à connaître.")}</span>${child.sensitiveStudent?.internalNotes ? `<small>${esc(child.sensitiveStudent.internalNotes)}</small>` : ""}</div><b class="badge ${esc(specialAttentionLevelTone(child.niveauAttention))}">${esc(child.niveauAttention || "information")}</b></div>
  </article>`;
}

function specialAttentionEditSection(child) {
  if (!canEditSpecialAttention()) return "";
  return `<article class="info-card form-grid">
    <h3>Élève sensible</h3>
    <label class="check-field"><input name="attentionSpeciale" type="checkbox" ${child.attentionSpeciale ? "checked" : ""}>Élève sensible</label>
    <label><span>Type d’attention</span><select name="typeAttention">
      ${["médical", "comportement", "allergie", "TSA/TDAH", "mobilité", "autre"].map((value) => `<option value="${esc(value)}" ${child.typeAttention === value ? "selected" : ""}>${esc(value)}</option>`).join("")}
    </select></label>
    <label><span>Niveau</span><select name="niveauAttention">
      ${["information", "important", "urgent"].map((value) => `<option value="${esc(value)}" ${child.niveauAttention === value ? "selected" : ""}>${esc(value)}</option>`).join("")}
    </select></label>
    ${textArea("noteAttention", "Consignes spécifiques", child.noteAttention || child.sensitiveStudent?.instructions || "")}
    ${textArea("sensitiveStudent.internalNotes", "Remarques internes", child.sensitiveStudent?.internalNotes || "")}
  </article>`;
}

function studentIssueTypeLabel(value) {
  return {
    behavior: "comportement",
    health: "santé",
    absence: "absence",
    delay: "retard",
    safety: "sécurité",
    information_change: "changement d’information",
    other: "autre"
  }[value] || value || "autre";
}

function studentIssueImportanceLabel(value) {
  return { info: "information", important: "important", urgent: "urgent" }[value] || "information";
}

function studentIssueStatusLabel(value) {
  return { open: "ouvert", in_progress: "en cours", resolved: "résolu" }[value] || "ouvert";
}

function studentIssueTone(issue = {}) {
  if (issue.importance === "urgent") return "danger";
  if (issue.importance === "important") return "warning";
  return "ok";
}

function studentIssueUrgentAlert(child) {
  const urgent = studentIssuesForChild(child.id).filter((issue) => issue.status !== "resolved" && issue.importance === "urgent");
  if (!urgent.length) return "";
  return `<article class="pending-card issue-urgent-alert"><div class="pending-head"><div><p class="eyebrow">Alerte fiche élève</p><h3>Problème urgent signalé</h3><span>${esc(urgent[0].description || studentIssueTypeLabel(urgent[0].type))}</span></div><b class="badge danger">${esc(urgent.length)}</b></div></article>`;
}

function studentIssuesSection(child) {
  const issues = studentIssuesForChild(child.id);
  const openCount = issues.filter((issue) => issue.status !== "resolved").length;
  return `<article class="info-card student-issues-card">
    <div class="action-title"><div><h3>Problèmes signalés</h3><p class="muted">${esc(openCount)} problème${openCount > 1 ? "s" : ""} ouvert${openCount > 1 ? "s" : ""}</p></div>${openCount ? `<b class="badge danger">${esc(openCount)}</b>` : ""}</div>
    ${canSignalStudentIssue(child) ? studentIssueForm(child) : ""}
    <div class="quick-list-inner">${issues.map(studentIssueCard).join("") || `<p class="muted">Aucun problème signalé.</p>`}</div>
  </article>`;
}

function studentIssueForm(child) {
  return `<form class="mini-form student-issue-form" data-student-issue-form="${esc(child.id)}">
    <label><span>Type de problème</span><select name="type">
      <option value="behavior">Comportement</option>
      <option value="health">Santé</option>
      <option value="absence">Absence</option>
      <option value="delay">Retard</option>
      <option value="safety">Sécurité</option>
      <option value="information_change">Changement d’information</option>
      <option value="other">Autre</option>
    </select></label>
    <label><span>Niveau d’importance</span><select name="importance"><option value="info">Information</option><option value="important">Important</option><option value="urgent">Urgent</option></select></label>
    ${textArea("description", "Description", "")}
    <button class="primary-button compact-action" type="submit">Signaler un problème</button>
  </form>`;
}

function studentIssueCard(issue) {
  const messages = studentIssueMessages(issue.id);
  return `<article class="message-item student-issue-item ${esc(studentIssueTone(issue))}">
    <strong>${esc(studentIssueTypeLabel(issue.type))} <b class="badge ${esc(studentIssueTone(issue))}">${esc(studentIssueImportanceLabel(issue.importance))}</b></strong>
    ${sectionRows([
      ["Statut", studentIssueStatusLabel(issue.status)],
      ["Description", issue.description],
      ["Auteur", issue.createdByName],
      ["Rôle auteur", roleLabel(issue.createdByRole)],
      ["Date", formatDateTime(issue.createdAt)]
    ])}
    ${messages.length ? `<div class="message-list compact">${messages.map((message) => `<div class="message-bubble ${message.authorId === state.user.id ? "mine" : ""}"><strong>${esc(message.authorName)} · ${esc(roleLabel(message.authorRole))}</strong><p>${esc(message.text)}</p><small>${esc(formatDateTime(message.createdAt))}</small></div>`).join("")}</div>` : ""}
    ${canSeeStudentIssue(issue) ? `<form class="mini-form" data-student-issue-reply="${esc(issue.id)}">${textArea("messageText", "Répondre", "")}<button class="secondary-button compact-action" type="submit">Ajouter une réponse</button></form>` : ""}
    ${canManageStudentIssue(issue) ? `<div class="form-actions"><button class="secondary-button compact-action" data-student-issue-status="${esc(issue.id)}" data-issue-status="in_progress" type="button">En cours</button><button class="primary-button compact-action" data-student-issue-status="${esc(issue.id)}" data-issue-status="resolved" type="button">Marquer résolu</button></div>` : ""}
  </article>`;
}

function studentIssueMessages(issueId) {
  return [...(data.studentIssueMessages?.[issueId] || [])].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
}

function markStudentIssuesRead(childId) {
  if (!state.user) return;
  let changed = false;
  (data.studentIssues || []).filter((issue) => issue.childId === childId && canSeeStudentIssue(issue)).forEach((issue) => {
    if (!issue.readBy?.includes(state.user.id)) {
      issue.readBy = [...new Set([...(issue.readBy || []), state.user.id])];
      changed = true;
      saveCollectionItemToFirestore("studentIssues", issue);
    }
  });
  if (changed) saveData();
}

function canGenerateChildPdf(child) {
  if (isSupportAssistanceSession()) return false;
  return !!child && !isPrimaryAdmin() && ["admin", "driver", "assistant"].includes(state.user?.role) && childVisibleFromCurrentContext(child.id);
}

function isChildParent(child = {}) {
  return isParent() && parentLinkedToChild(state.user, child);
}

function isTransportOperationalRole() {
  return ["driver", "assistant"].includes(state.user?.role);
}

function childLinkedToCurrentTransport(child = {}) {
  if (!state.user || !child) return false;
  const circuitNames = userCircuitNames();
  const childCircuits = [
    child.circuitNumber,
    childPickupCircuitLabel(child),
    childSchoolCircuitLabel(child),
    child.morningCircuit,
    child.returnCircuit
  ].filter(Boolean);
  if (state.user.role === "driver") {
    return child.driverId === state.user.id ||
      childDriver(child)?.id === state.user.id ||
      childCircuits.some((name) => circuitNames.has(name));
  }
  if (state.user.role === "assistant") {
    return child.assistantId === state.user.id ||
      childAssistant(child)?.id === state.user.id ||
      childCircuits.some((name) => circuitNames.has(name));
  }
  return false;
}

function canSeeSpwChildSection(child = {}) {
  if (!child || isSupport()) return false;
  if (isSpwAccount()) return true;
  if (isTransportOperationalRole()) return childLinkedToCurrentTransport(child);
  if (isChildParent(child)) return true;
  return false;
}

function canEditSpwChildSection() {
  if (isSupportAssistanceSession()) return false;
  return isSpwAccount();
}

function canSeeAlternatingCustody(child = {}) {
  return canSeeSpwChildSection(child);
}

function canSeeAutonomy(child = {}) {
  return canSeeSpwChildSection(child);
}

function canSeeMedicalHelpSheet(child = {}) {
  if (!child?.parentMedicalHelpCompletedAt) return false;
  return canSeeSpwChildSection(child);
}

function canSeeMedicalHelpBadge(child = {}) {
  return canSeeSpwChildSection(child);
}

function canSeeSensitiveStudent(child = {}) {
  return canSeeSpwChildSection(child);
}

function canEditSensitiveStudent() {
  if (isSupportAssistanceSession()) return false;
  return isSpwAccount();
}

function privateConversationBlock(child) {
  if (isSupportAssistanceSession()) return `<article class="info-card privacy-masked-card"><h3>Messages privés</h3><p>Information masquée pour confidentialité</p></article>`;
  if (isPrimaryAdmin()) return "";
  if (isAdmin()) return privateConversationMeta(child);
  if (["driver", "assistant"].includes(state.user?.role) && !canReadPrivateConversation(child)) return "";
  return messagePanel(child);
}

function canSeeTransportStatus(child = {}) {
  if (isSupport()) return false;
  if (isPrimaryAdmin()) return false;
  if (isAdmin()) return true;
  if (isTransportOperationalRole()) return childLinkedToCurrentTransport(child);
  return isChildParent(child);
}

function transportStatusSection(child) {
  if (!canSeeTransportStatus(child)) return "";
  return section("Exclusion transport", [
    [parentT("child.status"), child.transportStatus],
    [parentT("transportStatus.exclusion"), child.exclusionType],
    [parentT("transportStatus.exclusionReason"), child.exclusionReason],
    [parentT("transportStatus.exclusionStart"), child.exclusionStartDate],
    [parentT("transportStatus.exclusionEnd"), child.exclusionEndDate]
  ]);
}

function canSeeChildPeople(child = {}) {
  if (!child || isSupport()) return false;
  if (isPrimaryAdmin()) return false;
  if (isAdmin()) return true;
  if (isTransportOperationalRole()) return childLinkedToCurrentTransport(child);
  return isChildParent(child);
}

function canSeeChildSchoolSection(child = {}) {
  return canSeeChildPeople(child);
}

function canManageChild(child) {
  if (isSupportAssistanceSession()) return false;
  if (!child || !state.user) return false;
  return isTransportManagerUser() || isSpwAccount();
}

function canDeleteChild(child) {
  if (isSupportAssistanceSession()) return false;
  return !!child && (isTransportManagerUser() || isSpwAccount());
}

function canCreateChild() {
  if (isSupportAssistanceSession()) return false;
  return isTransportManagerUser() || isSpwAccount();
}

function canEditChildTransportAssociations() {
  if (isSupportAssistanceSession()) return false;
  return isTransportManagerUser() || isSpwAccount();
}

function supportAssistanceMaskedValue() {
  return "Information masquée pour confidentialité";
}

function isSupportAssistanceSensitiveLabel(label = "") {
  const text = normalizeTextSearch(label);
  return [
    "medical",
    "sante",
    "adresse",
    "rue",
    "numero",
    "code postal",
    "commune",
    "telephone",
    "tel",
    "responsable",
    "autorise",
    "exclusion",
    "raison",
    "garde",
    "sensible",
    "attention",
    "remarque interne",
    "allergie",
    "handicap",
    "symptome"
  ].some((keyword) => text.includes(keyword));
}

function supportAssistanceRows(title, rows = []) {
  if (!isSupportAssistanceSession()) return rows;
  const titleSensitive = isSupportAssistanceSensitiveLabel(title);
  return rows.map(([label, value]) => [
    label,
    titleSensitive || isSupportAssistanceSensitiveLabel(label) ? supportAssistanceMaskedValue() : value
  ]);
}

function section(title, rows) {
  const safeRows = supportAssistanceRows(title, rows);
  return `<article class="info-card"><h3>${esc(title)}</h3>${safeRows.map(([label, value]) => `<div class="field-row"><span>${esc(label)}</span><strong>${esc(value || parentT("common.unknown"))}</strong></div>`).join("")}</article>`;
}

function peopleSection(title, people = []) {
  if (isSupportAssistanceSession()) {
    return `<article class="info-card privacy-masked-card"><h3>${esc(title)}</h3><p>${esc(supportAssistanceMaskedValue())}</p></article>`;
  }
  return `<article class="info-card"><h3>${esc(title)}</h3>${people.map((person) => `
    <div class="person-card">
      <strong>${esc(fullName(person))}</strong>
      <span>${esc(person.relation || parentT("people.relationUnknown"))}</span>
      <small>${esc(person.address || parentT("people.addressUnknown"))}</small>
      ${person.email ? `<small>${esc(person.email)}</small>` : ""}
      ${person.note ? `<small>${esc(person.note)}</small>` : ""}
      ${person.phone ? `<div class="action-row"><a class="action-button" href="tel:${esc(person.phone)}">${esc(parentT("people.call"))}</a><a class="action-button" href="sms:${esc(person.phone)}">${esc(parentT("people.sms"))}</a></div>` : ""}
    </div>`).join("") || `<p class="muted">${esc(parentT("people.none"))}</p>`}</article>`;
}

function editChildView(id) {
  const child = id === "new" ? blankChild() : data.children.find((item) => item.id === id);
  if (!child) return `<article class="info-card"><p>Élève introuvable.</p></article>`;
  return `
    <section class="view-stack">
      <div class="detail-head">
        <button class="icon-button" data-cancel-edit title="${esc(parentT("action.cancel"))}">‹</button>
        <div><p class="eyebrow">${esc(parentT("action.edit"))}</p><h2>${esc(fullName(child))}</h2></div>
      </div>
      <form class="edit-form" id="child-form">
        <article class="info-card form-grid">
          <h3>${esc(parentT("child.general"))}</h3>
          ${input("firstName", parentT("child.firstName"), child.firstName, "text", false, true)}
          ${input("lastName", parentT("child.lastName"), child.lastName, "text", false, true)}
          ${input("birthDate", parentT("child.birthDate"), child.birthDate, "date", false, true)}
          ${input("computedAge", parentT("child.age"), age(child.birthDate), "text", true)}
          ${dataListInput("schoolName", parentT("child.school"), child.schoolName, schoolNameOptions())}
          ${input("circuitNumber", parentT("child.circuitNumber"), child.circuitNumber)}
          ${addressInput("streetName", "Rue", child.streetName || splitStreetAndNumber(child.homeAddress).street)}
          ${input("streetNumber", "Numéro", child.streetNumber || splitStreetAndNumber(child.homeAddress).number)}
          ${postalCodeInput("postalCode", "Code postal", child.postalCode)}
          ${cityInput("city", "Commune", child.city)}
          ${input("phone", "Numéro de téléphone", child.phone || child.childPhone || "", "tel")}
        </article>
        <article class="info-card form-grid">
          <h3>${esc(parentT("child.transport"))}</h3>
          ${childTransportAssociationFields(child)}
          ${tecStopInput("pickupStop", parentT("child.pickupStop"), child.pickupStop)}
          ${input("transferLocation", parentT("child.transferLocation"), child.transferLocation)}
          <label><span>Transfert</span><select name="hasTransfer"><option value="false" ${!childHasTransfer(child) ? "selected" : ""}>Non</option><option value="true" ${childHasTransfer(child) ? "selected" : ""}>Oui</option></select></label>
          <div class="transfer-extra-fields" data-transfer-extra ${!childHasTransfer(child) ? "hidden" : ""}>
            ${input("transferDriverId", parentT("transfer.driverAfter"), child.transferDriverId)}
            ${input("transferAssistantId", parentT("transfer.assistantAfter"), child.transferAssistantId)}
            ${circuitSearchInput("transferSchoolCircuitId", "Circuit vers l’école après transfert", child.transferSchoolCircuitId || child.transferCircuitId)}
            <label class="check-field"><input name="changesBusAtTransfer" type="checkbox" ${child.changesBusAtTransfer ? "checked" : ""}>${esc(parentT("transfer.changeBus"))}</label>
          </div>
        </article>
        ${canEditSpwChildSection() ? `<article class="info-card form-grid">
          <h3>Garde alternée</h3>
          ${alternatingResidenceEditFields(child)}
        </article>` : ""}
        ${canEditSpwChildSection() ? `<article class="info-card form-grid">
          <h3>${esc(parentT("child.autonomy"))}</h3>
          <label><span>${esc(parentT("child.autonomyStatus"))}</span><select name="autonomyStatus"><option value="autonome" ${child.autonomyStatus === "autonome" ? "selected" : ""}>${esc(parentT("child.autonomous"))}</option><option value="accompagne" ${child.autonomyStatus === "accompagne" ? "selected" : ""}>${esc(parentT("child.accompanied"))}</option><option value="transfert necessaire" ${child.autonomyStatus === "transfert necessaire" ? "selected" : ""}>${esc(parentT("child.transferNeeded"))}</option></select></label>
          <label class="check-field"><input name="autonomy.autonomous" type="checkbox" ${child.autonomy?.autonomous === true || child.autonomyStatus === "autonome" ? "checked" : ""}>Autonome</label>
          <label class="check-field"><input name="autonomy.accompanimentRequired" type="checkbox" ${child.autonomy?.accompanimentRequired === true || child.autonomyStatus === "accompagne" ? "checked" : ""}>Accompagné obligatoire</label>
          ${textArea("autonomy.boardingHelp", "Aide à la montée", child.autonomy?.boardingHelp || child.mobilityHelp || "")}
          ${textArea("autonomy.exitHelp", "Aide à la descente", child.autonomy?.exitHelp || "")}
          <label class="check-field"><input name="autonomy.enhancedSupervision" type="checkbox" ${child.autonomy?.enhancedSupervision === true ? "checked" : ""}>Surveillance renforcée</label>
          ${textArea("autonomy.notes", "Remarques autonomie", child.autonomy?.notes || "")}
        </article>` : ""}
        ${transportStatusEditSection(child)}
        ${canEditSpwChildSection() ? peopleEditSection("Personnes responsables", "guardians", child.responsiblePersons || child.guardians || []) : ""}
        ${canEditSpwChildSection() ? peopleEditSection(parentT("people.authorized"), "authorizedPickupPersons", child.authorizedPersons || child.authorizedPickupPersons || []) : ""}
        ${specialAttentionEditSection(child)}
        <article class="info-card form-grid">
          <h3>${esc(parentT("child.schoolSection"))}</h3>
          ${input("schoolName", parentT("child.schoolName"), child.schoolName)}
          ${input("schoolPhone", parentT("child.phone"), child.schoolPhone)}
          ${input("schoolEmail", parentT("child.email"), child.schoolEmail, "email")}
          ${addressInput("schoolAddress", "Adresse école", child.schoolAddress || "")}
          ${textArea("schoolNotes", "Remarques école", child.schoolNotes || "")}
        </article>
        <div class="form-actions">
          <button class="primary-button compact-action" type="submit">${esc(parentT("action.save"))}</button>
          <button class="secondary-button" type="button" data-cancel-edit>${esc(parentT("action.cancel"))}</button>
        </div>
      </form>
    </section>`;
}

function blankChild() {
  const circuitNumber = state.user?.role === "assistant"
    ? [...userCircuitNames()][0] || "C-12"
    : "C-12";
  const child = makeChild(`child-${Date.now()}`, "", "", "", circuitNumber, "", "", "", true);
  return applyLinkedChildData(child);
}

function applyLinkedChildData(child) {
  const circuit = data.circuits.find((item) => item.name === child.circuitNumber || item.id === child.circuitNumber);
  const vehicle = data.vehicles.find((item) => item.id === circuit?.vehicleId || item.circuitId === child.circuitNumber || item.id === child.vehicleId);
  const school = data.schools.find((item) => item.name === circuit?.schoolName || item.name === child.schoolName);
  if (circuit) {
    child.circuitNumber = circuit.name || child.circuitNumber;
    child.pickupCircuitId = child.pickupCircuitId || circuit.id || circuit.name || "";
    child.schoolCircuitId = child.schoolCircuitId || child.pickupCircuitId || circuit.id || circuit.name || "";
    child.morningCircuit = circuitLabelByRef(child.pickupCircuitId) || child.morningCircuit || `${child.circuitNumber} prise en charge`;
    child.returnCircuit = circuitLabelByRef(child.schoolCircuitId) || child.returnCircuit || `${child.circuitNumber} vers école`;
    child.driverId = circuit.driverId || child.driverId || "";
    child.assistantId = circuit.assistantId || child.assistantId || "";
    child.vehicleId = circuit.vehicleId || vehicle?.id || child.vehicleId || "";
    child.schoolName = circuit.schoolName || child.schoolName || "";
  }
  if (vehicle) {
    child.vehicleId = vehicle.id;
    child.driverId = child.driverId || vehicle.driverId || "";
    child.assistantId = child.assistantId || vehicle.assistantId || "";
    child.transferVehicleId = vehicle.busNumber || child.transferVehicleId || "";
  }
  if (state.user?.role === "assistant") {
    child.assistantId = state.user.id;
  }
  if (school) {
    child.schoolName = school.name || child.schoolName || "";
    child.schoolPhone = school.phone || child.schoolPhone || "";
    child.schoolEmail = school.email || child.schoolEmail || "";
  }
  return child;
}

function input(name, label, value, type = "text", disabled = false, required = false) {
  const dateAttrs = type === "date" ? ` lang="fr-BE" placeholder="JJ/MM/AAAA"` : "";
  return `<label><span>${esc(label)}${required ? " *" : ""}</span><input name="${esc(name)}" type="${esc(type)}" value="${esc(value)}"${dateAttrs} ${disabled ? "disabled" : ""} ${required ? "required" : ""}></label>`;
}

function dataListInput(name, label, value, options = []) {
  const listId = `${name}-options`;
  const uniqueOptions = uniqueText(options.filter(Boolean)).slice(0, 80);
  return `<label><span>${esc(label)}</span><input name="${esc(name)}" type="text" value="${esc(value || "")}" list="${esc(listId)}"><datalist id="${esc(listId)}">${uniqueOptions.map((option) => `<option value="${esc(option)}"></option>`).join("")}</datalist></label>`;
}

function tecStopInput(name, label, value) {
  return `<label class="autocomplete-field"><span>${esc(label)}</span><input name="${esc(name)}" type="text" value="${esc(value || "")}" data-tec-stop-input autocomplete="off"><div class="autocomplete-suggestions" data-tec-stop-suggestions hidden></div></label>`;
}

function addressInput(name, label, value, disabled = false) {
  return `<label class="autocomplete-field"><span>${esc(label)}</span><input name="${esc(name)}" type="text" value="${esc(value || "")}" data-address-autocomplete autocomplete="street-address" ${disabled ? "disabled" : ""}><div class="autocomplete-suggestions" data-address-suggestions hidden></div></label>`;
}

function postalCodeInput(name, label, value, disabled = false) {
  return `<label class="autocomplete-field"><span>${esc(label)}</span><input name="${esc(name)}" type="text" inputmode="numeric" value="${esc(value || "")}" data-postal-code-autocomplete autocomplete="postal-code" ${disabled ? "disabled" : ""}><div class="autocomplete-suggestions" data-postal-code-suggestions hidden></div></label>`;
}

function cityInput(name, label, value, disabled = false) {
  return `<label class="autocomplete-field"><span>${esc(label)}</span><input name="${esc(name)}" type="text" value="${esc(value || "")}" data-city-autocomplete autocomplete="address-level2" ${disabled ? "disabled" : ""}><div class="autocomplete-suggestions" data-city-suggestions hidden></div></label>`;
}

function fieldInputFor(type, key, label, value, disabled = false) {
  if (key === "address") return addressInput(key, label, value, disabled);
  return input(key, label, value, "text", disabled);
}

function readonlyAssociationInput(name, label, ref) {
  return `<label><span>${esc(label)}</span><input type="text" value="${esc(circuitLabelByRef(ref) || "Non renseigné")}" disabled><input name="${esc(name)}" type="hidden" value="${esc(ref || "")}"></label>`;
}

function circuitSearchInput(name, label, value) {
  const circuit = circuitByRef(value);
  return dataListInput(name, label, circuitOptionLabel(circuit || {}) || value || "", (data.circuits || []).map(circuitOptionLabel));
}

function driverOptionLabel(driver) {
  const vehicle = data.vehicles.find((item) => item.driverId === driver.id || item.busNumber === driver.busNumber);
  const circuit = data.circuits.find((item) => item.driverId === driver.id || item.name === driver.schoolCircuit);
  return [fullName(driver), vehicle?.busNumber || driver.busNumber, circuit?.name || driver.schoolCircuit].filter(Boolean).join(" - ");
}

function assistantOptionLabel(assistant) {
  const circuit = data.circuits.find((item) => item.assistantId === assistant.id || item.name === assistant.schoolCircuit);
  return [fullName(assistant), circuit?.name || assistant.schoolCircuit].filter(Boolean).join(" - ");
}

function childTransportAssociationFields(child) {
  const pickupCircuitId = circuitRef(child, "pickupCircuitId", child.morningCircuit || child.circuitNumber);
  const schoolCircuitId = circuitRef(child, "schoolCircuitId", child.returnCircuit || child.circuitNumber);
  if (!canEditChildTransportAssociations()) {
    return `
      ${readonlyAssociationInput("pickupCircuitId", parentT("child.pickupCircuit"), pickupCircuitId)}
      ${readonlyAssociationInput("schoolCircuitId", parentT("child.schoolCircuit"), schoolCircuitId)}`;
  }
  return `
    ${circuitSearchInput("pickupCircuitId", parentT("child.pickupCircuit"), pickupCircuitId)}
    ${circuitSearchInput("schoolCircuitId", parentT("child.schoolCircuit"), schoolCircuitId)}
    ${dataListInput("driverId", "Chauffeur associé", driverOptionLabel(childDriver(child) || data.drivers.find((driver) => driver.id === child.driverId) || {}), (data.drivers || []).map(driverOptionLabel))}
    
    ${dataListInput("assistantId", "Convoyeuse associée", assistantOptionLabel(childAssistant(child) || data.assistants.find((assistant) => assistant.id === child.assistantId) || {}), (data.assistants || []).map(assistantOptionLabel))}
    `;
}

function childOptionLabel(child) {
  return `${fullName(child)} - ${child.schoolName || "École non renseignée"} - ${child.circuitNumber || "Circuit non renseigné"}`;
}

function childMultiSelect(name, label, selectedIds = []) {
  const selected = new Set(selectedIds || []);
  const size = Math.min(Math.max((data.children || []).length, 3), 6);
  return `<label><span>${esc(label)}</span><select name="${esc(name)}" multiple size="${size}">
    ${(data.children || []).map((child) => `<option value="${esc(child.id)}" ${selected.has(child.id) ? "selected" : ""}>${esc(childOptionLabel(child))}</option>`).join("")}
  </select><small class="muted">Maintenez Cmd/Ctrl pour sélectionner plusieurs enfants.</small></label>`;
}

function childAssociationAutoField(name, label, selectedIds = []) {
  const selected = new Set(selectedIds || []);
  return `<label><span>${esc(label)}</span>
    <input name="${esc(name)}Display" type="text" value="${esc(childAssociationLabel(selectedIds))}" readonly placeholder="Reconnaissance automatique depuis la fiche élève">
    <select name="${esc(name)}" multiple hidden aria-hidden="true">
      ${(data.children || []).map((child) => `<option value="${esc(child.id)}" ${selected.has(child.id) ? "selected" : ""}>${esc(childOptionLabel(child))}</option>`).join("")}
    </select>
  </label>`;
}

function childAssociationLabel(ids = []) {
  return (ids || [])
    .map((id) => data.children.find((child) => child.id === id))
    .filter(Boolean)
    .map(fullName)
    .join(", ");
}

function selectedChildIdsFromField(field) {
  if (!field) return [];
  if (field.selectedOptions) return Array.from(field.selectedOptions).map((option) => option.value).filter(Boolean);
  return String(field.value || "").split(",").map((value) => value.trim()).filter(Boolean);
}

function setSelectedChildIds(field, ids = []) {
  if (!field?.options) return;
  const selected = new Set(ids);
  Array.from(field.options).forEach((option) => {
    option.selected = selected.has(option.value);
  });
  const display = field.form?.elements?.[`${field.name}Display`];
  if (display) display.value = childAssociationLabel(ids);
}

function schoolNameOptions() {
  return uniqueText([...(data.schools || []).map((school) => school.name), ...(data.circuits || []).map((circuit) => circuit.schoolName), ...(data.children || []).map((child) => child.schoolName)]);
}

function driverNameOptions() {
  return (data.drivers || []).map((driver) => fullName(driver));
}

function driverDisplayName(ref) {
  const driver = driverByRef(ref);
  return driver ? fullName(driver) : ref || "";
}

function textArea(name, label, value) {
  return `<label><span>${esc(label)}</span><textarea name="${esc(name)}" rows="3">${esc(value || "")}</textarea></label>`;
}

function transportStatusEditSection(child) {
  if (!isSpwAccount()) return "";
  return `<article class="info-card form-grid">
    <h3>${esc(parentT("transportStatus.title"))}</h3>
    <label><span>${esc(parentT("child.status"))}</span><select name="transportStatus">
      <option value="Trajet prévu" ${child.transportStatus === "Trajet prévu" ? "selected" : ""}>${esc(parentT("transportStatus.planned"))}</option>
      <option value="Exclusion temporaire" ${child.transportStatus === "Exclusion temporaire" ? "selected" : ""}>${esc(parentT("transportStatus.temporary"))}</option>
      <option value="Exclusion définitive" ${child.transportStatus === "Exclusion définitive" ? "selected" : ""}>${esc(parentT("transportStatus.final"))}</option>
      <option value="Suspendu" ${child.transportStatus === "Suspendu" ? "selected" : ""}>${esc(parentT("transportStatus.suspended"))}</option>
    </select></label>
    <label><span>${esc(parentT("transportStatus.exclusionType"))}</span><select name="exclusionType">
      <option value="" ${!child.exclusionType ? "selected" : ""}>${esc(parentT("transportStatus.none"))}</option>
      <option value="temporaire" ${child.exclusionType === "temporaire" ? "selected" : ""}>${esc(parentT("transportStatus.temporary"))}</option>
      <option value="définitive" ${child.exclusionType === "définitive" ? "selected" : ""}>${esc(parentT("transportStatus.final"))}</option>
    </select></label>
    ${textArea("exclusionReason", parentT("transportStatus.exclusionReason"), child.exclusionReason)}
    ${input("exclusionStartDate", parentT("transportStatus.exclusionStart"), child.exclusionStartDate, "date")}
    ${input("exclusionEndDate", parentT("transportStatus.exclusionEnd"), child.exclusionEndDate, "date")}
  </article>`;
}

function peopleEditSection(title, key, people = []) {
  const entries = [...people, { lastName: "", firstName: "", phone: "", email: "", address: "", relation: "", note: "" }];
  return `<article class="info-card people-edit-card"><h3>${esc(title)}</h3>
    <p class="muted">Ajoutez plusieurs personnes si nécessaire. Les lignes vides ne seront pas enregistrées.</p>
    <div class="people-edit-list">
      ${entries.map((person, index) => `<div class="person-edit-row">
        <strong>${index < people.length ? `Personne ${index + 1}` : "Ajouter une personne"}</strong>
        <div class="form-grid">
          ${input(`${key}.${index}.lastName`, parentT("child.lastName"), person.lastName)}
          ${input(`${key}.${index}.firstName`, parentT("child.firstName"), person.firstName)}
          ${input(`${key}.${index}.phone`, parentT("child.phone"), person.phone, "tel")}
          ${key === "guardians" ? input(`${key}.${index}.email`, parentT("child.email"), person.email || "", "email") : ""}
          ${addressInput(`${key}.${index}.address`, parentT("child.address"), person.address)}
          ${input(`${key}.${index}.relation`, parentT("people.relation"), person.relation)}
          ${textArea(`${key}.${index}.note`, "Remarque", person.note || "")}
        </div>
      </div>`).join("")}
    </div>
  </article>`;
}

function searchView() {
  const results = state.search.trim().length >= 2 ? searchAll(state.search) : [];
  return `<section class="view-stack"><div class="section-title"><p class="eyebrow">Recherche</p><h2>Recherche globale</h2></div><div class="quick-list">${results.length ? results.map((result) => rowOpen(result.type, result.id, result.title, result.label)).join("") : `<p class="muted">Aucun résultat.</p>`}</div></section>`;
}

function requestsView() {
  const tabs = requestsTabsForUser();
  if (!tabs.some((tab) => tab.key === state.requestsTab)) state.requestsTab = tabs[0]?.key || "leave";
  return `<section class="view-stack requests-view">
    <div class="section-title"><p class="eyebrow">Demandes</p><h2>Demandes</h2></div>
    <div class="support-filters requests-tabs">${tabs.map((tab) => `<button class="${state.requestsTab === tab.key ? "active" : ""}" data-requests-tab="${esc(tab.key)}">${esc(tab.label)}${tab.badge ? ` <b class="badge danger">${esc(tab.badge)}</b>` : ""}</button>`).join("")}</div>
    ${requestsTabContent()}
  </section>`;
}

function requestsTabsForUser() {
  const tabs = [];
  if (state.user?.role === "driver" || isTransportManagerUser() || isSupport()) tabs.push({ key: "leave", label: "Congés", badge: isTransportManagerUser() ? pendingLeaveRequests().length : 0 });
  if (isTransportManagerUser() || isSupport()) {
    tabs.push({ key: "pool", label: "Transport piscine" });
    tabs.push({ key: "extra", label: "Transport extra-scolaire" });
  }
  if (state.user?.role === "driver" || isTransportManagerUser() || isSupport()) tabs.push({ key: "repairs", label: "Réparations véhicule", badge: isTransportManagerUser() ? urgentVehicleRepairs().length : 0 });
  if (state.user?.role === "driver" || isTransportManagerUser() || isSupport()) tabs.push({ key: "anomalies", label: "Anomalies", badge: isTransportManagerUser() ? importantAnomalies().length : 0 });
  return tabs;
}

function requestsTabContent() {
  if (state.requestsTab === "pool") return poolTransportPanel();
  if (state.requestsTab === "extra") return extraTransportPanel();
  if (state.requestsTab === "repairs") return vehicleRepairsPanel();
  if (state.requestsTab === "anomalies") return anomaliesPanel();
  return leaveRequestsPanel();
}

function requestStatusBadge(status) {
  const map = {
    pending: ["warning", "En attente"],
    accepted: ["ok", "Accepté"],
    rejected: ["danger", "Refusé"],
    scheduled: ["warning", "programmé"],
    in_progress: ["warning", "en cours"],
    done: ["ok", "terminé"],
    reported: ["warning", "signalé"],
    repaired: ["ok", "réparé"],
    archived: ["ok", "archivé"]
  };
  const [tone, label] = map[status] || ["warning", status || "En attente"];
  return `<b class="badge ${tone}">${esc(label)}</b>`;
}

function requestFilters() {
  return `<div class="support-filters compact-filters">
    ${["all", "pending", "accepted", "rejected", "urgent", "archived"].map((value) => `<button class="${state.requestsFilter === value ? "active" : ""}" data-requests-filter="${esc(value)}">${esc({ all: "Tous", pending: "En attente", accepted: "Acceptés", rejected: "Refusés", urgent: "Urgents", archived: "Archivés" }[value])}</button>`).join("")}
  </div>`;
}

function requestVisibleItems(collection) {
  let items = [...(data[collection] || [])];
  if (state.user?.role === "driver") items = items.filter((item) => item.createdBy === state.user.id);
  const filter = state.requestsFilter || "all";
  if (filter !== "all") {
    if (filter === "urgent") items = items.filter((item) => item.urgency === "urgent" || item.important === true);
    else items = items.filter((item) => item.status === filter);
  }
  return items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function currentUserDriverProfile() {
  return data.drivers.find((driver) => driver.id === state.user?.id) || {};
}

function leaveRequestsPanel() {
  const canCreate = state.user?.role === "driver";
  const items = requestVisibleItems("leaveRequests");
  return `<div class="view-stack">
    ${canCreate ? `<form class="edit-form" id="leave-request-form">
      <article class="info-card form-grid"><h3>Demande de congés</h3>${input("startDate", "Date début", "", "date")}${input("endDate", "Date fin", "", "date")}${textArea("reason", "Motif facultatif", "")}</article>
      <div class="form-actions"><button class="primary-button compact-action" type="submit">Envoyer demande</button></div>
    </form>` : ""}
    ${requestFilters()}
    <div class="card-grid">${items.map(leaveRequestCard).join("") || `<article class="info-card"><p class="muted">Aucune demande de congé.</p></article>`}</div>
  </div>`;
}

function leaveRequestCard(request) {
  return `<article class="info-card request-card">
    <div class="pending-head"><div><p class="eyebrow">Congés</p><h3>${esc(request.createdByName || "Chauffeur")}</h3></div>${requestStatusBadge(request.status)}</div>
    ${sectionRows([["Début", request.startDate], ["Fin", request.endDate], ["Motif", request.reason], ["Date demande", formatDateTime(request.createdAt)]])}
    ${isTransportManagerUser() && request.status === "pending" ? `<div class="form-actions"><button class="primary-button compact-action" data-leave-action="accepted" data-leave-id="${esc(request.id)}">Accepter</button><button class="danger-button" data-leave-action="rejected" data-leave-id="${esc(request.id)}">Refuser</button></div>` : ""}
  </article>`;
}

function poolTransportPanel() {
  const items = requestVisibleItems("poolTransport");
  return `<div class="view-stack">
    ${isTransportManagerUser() ? transportRequestForm("pool") : ""}
    <div class="card-grid">${items.map((item) => transportRequestCard(item, "poolTransport")).join("") || `<article class="info-card"><p class="muted">Aucun transport piscine.</p></article>`}</div>
  </div>`;
}

function extraTransportPanel() {
  const items = requestVisibleItems("extraSchoolTransport");
  return `<div class="view-stack">
    ${isTransportManagerUser() ? transportRequestForm("extra") : ""}
    <article class="info-card"><h3>Calendrier</h3><div class="request-calendar">${items.map((item) => `<span>${esc(formatDateOnly(item.date) || "Date ?")} · ${esc(item.destination || item.school || "Sortie")}</span>`).join("") || `<p class="muted">Aucun événement planifié.</p>`}</div></article>
    <div class="card-grid">${items.map((item) => transportRequestCard(item, "extraSchoolTransport")).join("") || `<article class="info-card"><p class="muted">Aucun transport extra-scolaire.</p></article>`}</div>
  </div>`;
}

function transportRequestForm(kind) {
  const pool = kind === "pool";
  const drivers = data.drivers || [];
  const vehicles = data.vehicles || [];
  return `<form class="edit-form" data-transport-request-form="${pool ? "poolTransport" : "extraSchoolTransport"}">
    <article class="info-card form-grid">
      <h3>${pool ? "Transport piscine" : "Transport extra-scolaire"}</h3>
      ${input("school", "École", "")}
      ${input("date", "Date", "", "date")}
      ${input("departureTime", "Heure départ", "", "time")}
      ${input("returnTime", "Heure retour", "", "time")}
      ${pool ? input("studentCount", "Nombre élèves", "", "number") : textArea("studentList", "Liste élèves concernés", "")}
      ${input("companions", "Accompagnants", "")}
      ${pool ? input("poolLocation", "Lieu piscine", "") : input("destination", "Destination", "")}
      ${pool ? "" : input("tripType", "Type sortie", "")}
      ${pool ? "" : input("responsibleContact", "Contact responsable", "")}
      <label><span>Chauffeur assigné</span><select name="driverId"><option value="">Non assigné</option>${drivers.map((driver) => `<option value="${esc(driver.id)}">${esc(fullName(driver))}</option>`).join("")}</select></label>
      <label><span>Véhicule assigné</span><select name="vehicleId"><option value="">Non assigné</option>${vehicles.map((vehicle) => `<option value="${esc(vehicle.id)}">${esc(vehicle.busNumber || vehicle.id)}</option>`).join("")}</select></label>
      <label><span>Statut</span><select name="status"><option value="scheduled">programmé</option><option value="in_progress">en cours</option><option value="done">terminé</option></select></label>
      ${textArea("notes", "Remarques", "")}
    </article>
    <div class="form-actions"><button class="primary-button compact-action" type="submit">Enregistrer</button></div>
  </form>`;
}

function transportRequestCard(item, collection) {
  const driver = data.drivers.find((entry) => entry.id === item.driverId);
  const vehicle = data.vehicles.find((entry) => entry.id === item.vehicleId);
  return `<article class="info-card request-card">
    <div class="pending-head"><div><p class="eyebrow">${collection === "poolTransport" ? "Piscine" : "Extra-scolaire"}</p><h3>${esc(item.destination || item.poolLocation || item.school || "Transport")}</h3></div>${requestStatusBadge(item.status)}</div>
    ${sectionRows([["École", item.school], ["Date", item.date], ["Départ", item.departureTime], ["Retour", item.returnTime], ["Élèves", item.studentCount || item.studentList], ["Chauffeur", driver ? fullName(driver) : ""], ["Véhicule", vehicle?.busNumber], ["Contact", item.responsibleContact], ["Remarques", item.notes]])}
    <div class="form-actions"><button class="secondary-button compact-action" data-print-request="${esc(collection)}" data-print-id="${esc(item.id)}">Générer PDF / imprimer</button></div>
  </article>`;
}

function vehicleRepairsPanel() {
  const items = requestVisibleItems("vehicleRepairs");
  return `<div class="view-stack">
    ${state.user?.role === "driver" ? vehicleRepairForm() : ""}
    ${requestFilters()}
    <div class="card-grid">${items.map(vehicleRepairCard).join("") || `<article class="info-card"><p class="muted">Aucune réparation signalée.</p></article>`}</div>
  </div>`;
}

function vehicleRepairForm() {
  const vehicles = visibleCollection("vehicles");
  return `<form class="edit-form" id="vehicle-repair-form">
    <article class="info-card form-grid"><h3>Réparation véhicule</h3>
      <label><span>Véhicule</span><select name="vehicleId">${vehicles.map((vehicle) => `<option value="${esc(vehicle.id)}">${esc(vehicle.busNumber || vehicle.id)}</option>`).join("")}</select></label>
      <label><span>Catégorie problème</span><select name="category">${["mécanique", "pneus", "éclairage", "sécurité", "carrosserie", "autre"].map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join("")}</select></label>
      <label><span>Niveau urgence</span><select name="urgency"><option value="low">faible</option><option value="medium">moyenne</option><option value="urgent">urgente</option></select></label>
      ${textArea("description", "Description détaillée", "")}
      ${textArea("photoNotes", "Notes photos (texte uniquement)", "")}
    </article><div class="form-actions"><button class="primary-button compact-action" type="submit">Signaler</button></div>
  </form>`;
}

function vehicleRepairCard(repair) {
  return `<article class="${repair.urgency === "urgent" ? "pending-card" : "info-card"} request-card">
    <div class="pending-head"><div><p class="eyebrow">Réparation</p><h3>${esc(repair.vehicleLabel || "Véhicule")}</h3></div>${requestStatusBadge(repair.status)}</div>
    ${sectionRows([["Catégorie", repair.category], ["Urgence", repair.urgency], ["Description", repair.description], ["Suivi", repair.followUp], ["Signalé le", formatDateTime(repair.createdAt)]])}
    ${isTransportManagerUser() ? `<div class="form-actions"><button class="secondary-button" data-request-status="vehicleRepairs" data-request-id="${esc(repair.id)}" data-status-value="in_progress">En cours</button><button class="primary-button compact-action" data-request-status="vehicleRepairs" data-request-id="${esc(repair.id)}" data-status-value="repaired">Réparé</button></div>` : ""}
  </article>`;
}

function anomaliesPanel() {
  const items = requestVisibleItems("anomalies");
  return `<div class="view-stack">
    ${state.user?.role === "driver" ? anomalyForm() : ""}
    ${requestFilters()}
    <div class="card-grid">${items.map(anomalyCard).join("") || `<article class="info-card"><p class="muted">Aucune anomalie.</p></article>`}</div>
  </div>`;
}

function anomalyForm() {
  return `<form class="edit-form" id="anomaly-form">
    <article class="info-card form-grid"><h3>Déclaration d’anomalie</h3>
      <label><span>Type</span><select name="category">${["problème élève", "comportement", "sécurité", "arrêt dangereux", "problème parent", "incident trajet", "autre"].map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join("")}</select></label>
      ${textArea("description", "Description", "")}
      ${input("eventDate", "Date", new Date().toISOString().slice(0, 10), "date")}
      ${input("eventTime", "Heure", "", "time")}
      ${input("location", "Localisation facultative", "")}
      ${input("childName", "Élève concerné facultatif", "")}
      ${input("circuitNumber", "Circuit concerné facultatif", currentUserDriverProfile().schoolCircuit || "")}
      <label class="check-field"><input name="important" type="checkbox">Anomalie importante</label>
      ${textArea("photoNotes", "Notes photos (texte uniquement)", "")}
    </article><div class="form-actions"><button class="primary-button compact-action" type="submit">Déclarer</button></div>
  </form>`;
}

function anomalyCard(anomaly) {
  return `<article class="${anomaly.important ? "pending-card" : "info-card"} request-card">
    <div class="pending-head"><div><p class="eyebrow">Anomalie</p><h3>${esc(anomaly.category || "Anomalie")}</h3></div>${requestStatusBadge(anomaly.status || "reported")}</div>
    ${sectionRows([["Chauffeur", anomaly.createdByName], ["Date", `${formatDateOnly(anomaly.eventDate) || ""} ${anomaly.eventTime || ""}`], ["Localisation", anomaly.location], ["Élève", anomaly.childName], ["Circuit", anomaly.circuitNumber], ["Description", anomaly.description]])}
    ${isTransportManagerUser() ? `<div class="form-actions"><button class="secondary-button" data-request-status="anomalies" data-request-id="${esc(anomaly.id)}" data-status-value="archived">Archiver</button></div>` : ""}
  </article>`;
}

function replacementRulesView() {
  const canManage = canManageReplacementRules();
  const rules = replacementRulesForCurrentUser();
  const editingRule = canManage ? (data.replacementRules || []).find((rule) => rule.id === state.editingReplacementRuleId) || null : null;
  return `<section class="view-stack">
    <div class="section-title action-title">
      <div><p class="eyebrow">Organisation transport</p><h2>Organisation transferts</h2></div>
    </div>
    ${canManage ? replacementRuleForm(editingRule) : ""}
    <article class="info-card replacement-table-card">
      <h3>Règles de remplacement circuits</h3>
      <div class="replacement-rule-list">
        ${rules.map((rule) => replacementRuleCard(rule, canManage)).join("") || `<p class="muted">Aucune règle active visible.</p>`}
      </div>
    </article>
  </section>`;
}

function canManageReplacementRules() {
  return isTransportManagerUser() || isSpwAccount();
}

function replacementRuleForm(rule = null) {
  return `<form class="edit-form" id="replacement-rule-form" data-rule-id="${esc(rule?.id || "new")}">
    <article class="info-card form-grid">
      <h3>${rule ? "Modifier une règle" : "Ajouter une règle"}</h3>
      ${input("zone", "Zone", rule?.zone || "")}
      ${input("inactiveCircuitId", "Circuit absent", rule?.inactiveCircuitId || "")}
      ${input("primaryReplacementCircuitId", "Circuit remplacement principal", rule?.primaryReplacementCircuitId || "")}
      ${input("secondaryReplacementCircuitId", "Circuit remplacement secondaire", rule?.secondaryReplacementCircuitId || "")}
      ${input("schoolId", "École concernée", rule?.schoolId || "")}
      ${textArea("message", "Message affiché", rule?.message || "")}
      <label class="check-field"><input name="isActive" type="checkbox" ${rule?.isActive === false ? "" : "checked"}>Actif</label>
    </article>
    <div class="form-actions"><button class="primary-button compact-action" type="submit">${rule ? "Enregistrer" : "Ajouter la règle"}</button></div>
  </form>`;
}

function replacementRuleCard(rule, canManage = false) {
  const rows = [
    ["Zone", rule.zone],
    ["Circuit absent", rule.inactiveCircuitId],
    ["Remplacement principal", rule.primaryReplacementCircuitId],
    ["Remplacement secondaire", rule.secondaryReplacementCircuitId],
    ["École concernée", schoolLabelForReplacementRule(rule)],
    ["Message transport", rule.message],
    ["Statut", rule.isActive === false ? "inactif" : "actif"]
  ];
  return `<article class="replacement-rule-card">
    <div class="replacement-rule-head">
      <div><strong>${esc(rule.inactiveCircuitId || "Circuit non renseigné")}</strong><span>remplacé par ${esc(rule.primaryReplacementCircuitId || "non renseigné")}</span></div>
      <b class="badge ${rule.isActive === false ? "ok" : "warning"}">${rule.isActive === false ? "Inactif" : "Actif"}</b>
    </div>
    ${sectionRows(rows)}
    ${canManage ? `<div class="form-actions">
      <button class="secondary-button" type="button" data-edit-replacement-rule="${esc(rule.id)}">Modifier</button>
      <button class="danger-button" type="button" data-delete-replacement-rule="${esc(rule.id)}">Supprimer</button>
    </div>` : ""}
  </article>`;
}

function transportGroupView() {
  const tabs = [
    ["children", "Élèves"],
    ["drivers", "Chauffeurs"],
    ["assistants", "Convoyeuses"],
    ["vehicles", "Véhicules"],
    ["schools", "Écoles"],
    ["circuits", "Circuits"]
  ];
  const tab = tabs.some(([value]) => value === state.transportGroupTab) ? state.transportGroupTab : "children";
  const body = tab === "children" ? childrenList() : tab === "replacementRules" ? replacementRulesView() : genericListView(tab);
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Gestionnaire de transport</p><h2>Gestion transport</h2></div>
    <div class="support-filters grouped-admin-tabs">
      ${tabs.map(([value, label]) => `<button class="${tab === value ? "active" : ""}" type="button" data-transport-group-tab="${esc(value)}">${esc(label)}</button>`).join("")}
    </div>
    ${body}
  </section>`;
}

function securityGroupView() {
  const tabs = [
    ["users", "Codes d’accès"],
    ["loginLogs", "Connexions"],
    ["admins", "Gestionnaires de transport"]
  ];
  const tab = tabs.some(([value]) => value === state.securityGroupTab) ? state.securityGroupTab : "users";
  const body = tab === "loginLogs" ? loginLogsView() : tab === "admins" ? adminManagementPanel() : adminUsersView();
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Gestionnaire de transport</p><h2>Accès & sécurité</h2></div>
    <div class="support-filters grouped-admin-tabs">
      ${tabs.map(([value, label]) => `<button class="${tab === value ? "active" : ""}" type="button" data-security-group-tab="${esc(value)}">${esc(label)}</button>`).join("")}
    </div>
    ${body}
  </section>`;
}

function historyView() {
  if (!canViewHistoryLogs()) return dashboard();
  const text = normalizeTextSearch(state.historyFilterText || "");
  const type = state.historyFilterEntityType || "all";
  const date = state.historyFilterDate || "";
  const logs = [...(data.historyLogs || [])]
    .filter((log) => {
      if (type !== "all" && log.entityType !== type) return false;
      if (date && !String(log.createdAt || "").startsWith(date)) return false;
      if (!text) return true;
      return [
        historyEntityTypeLabel(log.entityType),
        log.entityName,
        log.fieldChanged,
        log.oldValue,
        log.newValue,
        log.modifiedByName,
        historyModifierRoleLabel(log)
      ].some((value) => normalizeTextSearch(value).includes(text));
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const types = ["children", "drivers", "assistants", "vehicles", "schools", "circuits", "replacementRules", "roleAnnouncements", "studentIssues", "transferDelays"];
  return `<section class="view-stack">
    <div class="section-title action-title">
      <div><p class="eyebrow">Suivi des changements</p><h2>Historique</h2></div>
    </div>
    <form class="info-card history-filter-card" id="history-filter-form">
      <div class="form-grid">
        <label><span>Recherche</span><input name="historyFilterText" value="${esc(state.historyFilterText)}" placeholder="Élève, chauffeur, champ modifié..."></label>
        <label><span>Type modification</span><select name="historyFilterEntityType">
          <option value="all">Tous les types</option>
          ${types.map((item) => `<option value="${esc(item)}" ${type === item ? "selected" : ""}>${esc(historyEntityTypeLabel(item))}</option>`).join("")}
        </select></label>
        <label><span>Date</span><input name="historyFilterDate" type="date" value="${esc(date)}"></label>
      </div>
      <div class="form-actions">
        <button class="primary-button compact-action" type="submit">Filtrer</button>
        <button class="secondary-button" type="button" id="clear-history-filters">Réinitialiser</button>
      </div>
    </form>
    <article class="info-card">
      <h3>${esc(logs.length)} modification${logs.length > 1 ? "s" : ""}</h3>
      <div class="history-log-list">
        ${logs.map(historyLogCard).join("") || `<p class="muted">Aucun historique pour ces filtres.</p>`}
      </div>
    </article>
  </section>`;
}

function historyLogCard(log) {
  return `<article class="history-log-card">
    <div class="pending-head">
      <div>
        <p class="eyebrow">${esc(historyEntityTypeLabel(log.entityType))}</p>
        <h3>${esc(log.entityName || "Élément")}</h3>
      </div>
      <span class="badge">${esc(formatDateTime(log.createdAt))}</span>
    </div>
    ${sectionRows([
      ["Utilisateur", log.modifiedByName],
      ["Rôle", historyModifierRoleLabel(log)],
      ["Champ modifié", log.fieldChanged],
      ["Ancienne valeur", log.oldValue],
      ["Nouvelle valeur", log.newValue]
    ])}
  </article>`;
}

function settingsView() {
  if (isParent()) return parentSettingsView();
  if (isSupport()) return supportSettingsView();
  if (["driver", "assistant"].includes(state.user?.role)) return operationalSettingsView();
  if (isPrimaryAdmin()) return primaryAdminSettingsView();
  const tab = ["admin", "config", "contact", "interface", "services"].includes(state.settingsTab) ? state.settingsTab : "admin";
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Réglages</p><h2>Réglages</h2></div>
    <div class="support-filters">
      <button class="${tab === "admin" ? "active" : ""}" data-settings-tab="admin">Gestionnaires de transport</button>
      <button class="${tab === "config" ? "active" : ""}" data-settings-tab="config">Paramètres de configuration</button>
      <button class="${tab === "interface" ? "active" : ""}" data-settings-tab="interface">Personnalisation interface</button>
      <button class="${tab === "services" ? "active" : ""}" data-settings-tab="services">État des services</button>
      <button class="${tab === "contact" ? "active" : ""}" data-settings-tab="contact">Contact SPW</button>
    </div>
    ${temporarySupportAccessPanel()}
    ${tab === "admin" ? adminManagementPanel() : tab === "contact" ? contactSpwSettingsPanel() : tab === "interface" ? interfaceCustomizationPanel() : tab === "services" ? serviceStatusSettingsPanel() : configurationSettingsPanel()}
  </section>`;
}

function primaryAdminSettingsView() {
  const tab = ["config", "services", "info"].includes(state.settingsTab) ? state.settingsTab : "services";
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Technique</p><h2>Configuration technique</h2></div>
    <div class="support-filters">
      <button class="${tab === "config" ? "active" : ""}" data-settings-tab="config">Paramètres de configuration</button>
      <button class="${tab === "services" ? "active" : ""}" data-settings-tab="services">État des services</button>
      <button class="${tab === "info" ? "active" : ""}" data-settings-tab="info">Informations application</button>
    </div>
    ${tab === "services" ? serviceStatusSettingsPanel() : tab === "info" ? applicationInfoPanel() : configurationSettingsPanel()}
  </section>`;
}

function applicationInfoPanel() {
  return `<article class="info-card">
    <h3>Informations application</h3>
    ${sectionRows([
      ["Application", "Gestion Transport Scolaire"],
      ["Projet interne", "gts-mobile"],
      ["Stockage fichiers", "Aucun upload PDF, photo ou document"],
      ["Données", "Texte uniquement avec Firestore et fallback localStorage"],
      ["Session", "Expiration après 2 heures d’inactivité"]
    ])}
  </article>`;
}

function supportSettingsView() {
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Réglages</p><h2>Réglages support</h2></div>
    ${ownCodeFormView()}
    ${themePreferenceView()}
    ${notificationPreferenceView()}
  </section>`;
}

function temporarySupportAccessPanel() {
  if (!canGenerateTemporarySupportAccess()) return "";
  expireTemporarySupportAccesses(data);
  const visibleAccess = (data.temporarySupportAccess || [])
    .filter((access) => access.ownerUserId === state.user.id && ["active", "used"].includes(access.status) && new Date(access.expiresAt || 0).getTime() > Date.now())
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const generated = state.generatedSupportAccessCode ? `
    <article class="notice-card support-temp-code-card">
      <div>
        <p class="eyebrow">Code à transmettre au support</p>
        <h3>${esc(state.generatedSupportAccessCode)}</h3>
        <p>Valable jusqu’à ${esc(formatDateTime(state.generatedSupportAccessExpiresAt))}. Il fonctionne une seule fois.</p>
      </div>
    </article>` : "";
  return `<article class="info-card support-temp-access-panel">
    <div class="action-title">
      <div>
        <h3>Accès support temporaire</h3>
        <p class="muted">Génère un code de 30 minutes pour que le support voie votre interface en lecture seule, avec les données sensibles masquées.</p>
      </div>
      <button class="primary-button compact-action" type="button" id="generate-support-temp-access">Générer un accès support temporaire</button>
    </div>
    ${generated}
    <div class="quick-list-inner">
      ${visibleAccess.map((access) => `<div class="child-row support-row">
        <span>${access.status === "used" ? "Assistance en cours" : "Code actif"} généré le ${esc(formatDateTime(access.createdAt))}</span>
        <small>${access.status === "used" ? `Utilisé par ${esc(access.supportUserId || "support")} · ` : ""}Expire le ${esc(formatDateTime(access.expiresAt))}</small>
        <button class="danger-button compact-action" type="button" data-revoke-support-access="${esc(access.id)}">Révoquer</button>
      </div>`).join("") || `<p class="muted">Aucun accès temporaire actif.</p>`}
    </div>
  </article>`;
}

function parentSettingsView() {
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">${esc(parentT("settings.preferences"))}</p><h2>${esc(parentT("settings.display"))}</h2></div>
    ${themePreferenceView()}
    ${notificationPreferenceView()}
  </section>`;
}

function operationalSettingsView() {
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Réglages</p><h2>Réglages</h2></div>
    ${state.user?.role === "assistant" ? assistantCircuitSettingsView() : ""}
    ${ownCodeFormView()}
    ${themePreferenceView()}
    ${notificationPreferenceView()}
  </section>`;
}

function assistantCircuitSettingsView() {
  const assistant = data.assistants.find((item) => item.id === state.user.id) || {};
  const circuits = state.user.assignedCircuits?.length ? state.user.assignedCircuits.join(", ") : assistant.schoolCircuit || "";
  return `<form class="edit-form" id="assistant-circuit-form">
    <article class="info-card form-grid">
      <h3>Mon circuit scolaire</h3>
      ${input("assignedCircuits", "Circuit scolaire", circuits)}
      <p class="muted">Indiquez un ou plusieurs circuits séparés par une virgule.</p>
    </article>
    <div class="form-actions"><button class="primary-button compact-action" type="submit">Enregistrer le circuit</button></div>
  </form>`;
}

function ownCodeFormView() {
  return `<form class="edit-form" id="own-code-form">
    <article class="info-card form-grid">
      <h3>Modifier mon code d’accès</h3>
      ${input("oldCode", "Ancien code", "", "password")}
      ${input("newCode", "Nouveau code", "", "password")}
      ${input("confirmCode", "Confirmer nouveau code", "", "password")}
    </article>
    <div class="form-actions"><button class="primary-button compact-action" type="submit">Enregistrer le nouveau code</button></div>
  </form>`;
}

function themePreferenceView() {
  const theme = currentThemePreference();
  const title = isParent() ? parentT("theme.title") : "Préférence thème";
  return `<article class="info-card form-grid">
    <h3>${esc(title)}</h3>
    <div class="support-filters">
      <button class="${theme === "light" ? "active" : ""}" data-theme-choice="light">${esc(isParent() ? parentT("theme.light") : "Clair")}</button>
      <button class="${theme === "dark" ? "active" : ""}" data-theme-choice="dark">${esc(isParent() ? parentT("theme.dark") : "Sombre")}</button>
      <button class="${theme === "auto" ? "active" : ""}" data-theme-choice="auto">${esc(isParent() ? parentT("theme.auto") : "Automatique")}</button>
    </div>
  </article>`;
}

function configurationSettingsPanel() {
  return `${themePreferenceView()}${notificationPreferenceView()}`;
}

function serviceStatusSettingsPanel() {
  if (!isAdmin()) return "";
  const saved = { ...seed.serviceStatus, ...(data.serviceStatus || {}) };
  const status = currentServiceStatus();
  return `<form class="edit-form" id="service-status-form">
    <article class="info-card form-grid">
      <h3>Gestion état des services</h3>
      <p class="muted">La vérification automatique est désactivée. L’état affiché est modifié manuellement.</p>
      <label><span>État actuel</span><select name="status">
        <option value="operational" ${saved.status === "operational" ? "selected" : ""}>Tout fonctionne</option>
        <option value="degraded" ${saved.status === "degraded" ? "selected" : ""}>Perturbation</option>
        <option value="incident" ${saved.status === "incident" ? "selected" : ""}>Incident</option>
      </select></label>
      ${textArea("message", "Message affiché", saved.message || "")}
      ${sectionRows([
        ["État affiché", serviceStatusMeta(status.status).label],
        ["Dernière mise à jour", formatDateTime(status.updatedAt || status.lastCheckedAt)],
        ["Mode", "manuel"],
        ["Modifié par", saved.updatedBy]
      ])}
    </article>
    <div class="form-actions"><button class="primary-button compact-action" type="submit">Enregistrer l’état</button></div>
  </form>`;
}

function notificationPreferenceView() {
  const prefs = notificationPreferences();
  return `<article class="info-card form-grid">
    <h3>Notifications</h3>
    <div class="support-filters">
      <button class="${prefs.enabled ? "active" : ""}" data-notification-choice="enabled" type="button">Activer notifications</button>
      <button class="${!prefs.enabled ? "active" : ""}" data-notification-choice="disabled" type="button">Désactiver notifications</button>
      <button class="${prefs.sound ? "active" : ""}" data-notification-sound="enabled" type="button">Activer son notifications</button>
      <button class="${!prefs.sound ? "active" : ""}" data-notification-sound="disabled" type="button">Désactiver son notifications</button>
    </div>
    <p class="muted">Les notifications respectent les permissions existantes et ne dévoilent pas les conversations privées interdites.</p>
  </article>`;
}

function contactSpwSettingsPanel() {
  if (isPrimaryAdmin()) return "";
  const contact = data.parentContact || {};
  return `<form class="edit-form" id="parent-contact-form">
    <article class="info-card form-grid">
      <h3>Contact SPW</h3>
      ${input("title", "Titre", contact.title || "Contact transport scolaire")}
      ${input("phone", "Téléphone", contact.phone || "", "tel")}
      ${input("email", "Adresse e-mail", contact.email || "", "email")}
      ${addressInput("address", "Adresse", contact.address || "")}
      ${input("openingHours", "Horaires", contact.openingHours || "")}
      ${textArea("message", "Message affiché aux parents", contact.message || "")}
      <p class="muted">Ces informations sont visibles uniquement sur la page Contact du compte parent.</p>
    </article>
    <div class="form-actions"><button class="primary-button compact-action" type="submit">Enregistrer le contact</button></div>
  </form>`;
}

function interfaceCustomizationPanel() {
  if (!isAdmin() || isPrimaryAdmin()) return "";
  const roles = ["admin", "driver", "assistant", "parent", "support"];
  return `<form class="edit-form" id="interface-config-form">
    <article class="notice-card">
      <p><strong>Personnalisation visuelle uniquement.</strong><br>Ces réglages changent les noms, l’ordre et la visibilité dans l’interface. Ils ne modifient jamais les permissions, les accès aux données, les messages privés ou les informations sensibles.</p>
    </article>
    ${roles.map(interfaceRolePanel).join("")}
    <div class="form-actions">
      <button class="primary-button compact-action" type="submit">Enregistrer la personnalisation</button>
      <button class="secondary-button" type="button" id="reset-interface-config">Réinitialiser l’interface par défaut</button>
    </div>
  </form>`;
}

function interfaceRolePanel(role) {
  const menuItems = baseNavigationItems(role);
  const configuredMenu = configuredNavigationItemsForRoleEdit(role);
  const dashboardCards = dashboardConfigFor(role);
  return `<article class="info-card interface-config-card">
    <h3>${esc(roleLabel(role))}</h3>
    <h4>Menu</h4>
    <div class="interface-config-list">
      ${configuredMenu.map((item, index) => interfaceMenuRow(role, item, index + 1)).join("")}
    </div>
    <h4>Dashboard</h4>
    <div class="interface-config-list">
      ${dashboardCards.map((card, index) => interfaceDashboardRow(role, card, index + 1)).join("") || `<p class="muted">Aucune carte configurable.</p>`}
    </div>
    <input type="hidden" name="menuKnown.${esc(role)}" value="${esc(menuItems.map((item) => item.screen).join(","))}">
  </article>`;
}

function configuredNavigationItemsForRoleEdit(role) {
  const config = interfaceConfig();
  const base = baseNavigationItems(role);
  const byScreen = new Map(base.map((item, index) => [item.screen, { ...item, order: index + 1 }]));
  (config.menuLayout?.[role] || []).forEach((screen, index) => {
    if (byScreen.has(screen)) byScreen.get(screen).order = index + 1;
  });
  return [...byScreen.values()]
    .map((item) => ({
      ...item,
      label: config.menuLabels?.[role]?.[item.screen] || config.menuLabels?.[item.screen] || item.label,
      visible: config.roleVisibility?.[role]?.[item.screen] !== false
    }))
    .sort((a, b) => a.order - b.order);
}

function interfaceMenuRow(role, item, order) {
  return `<div class="interface-config-row">
    ${input(`menuOrder.${role}.${item.screen}`, "Ordre", order, "number")}
    ${input(`menuLabel.${role}.${item.screen}`, "Nom affiché", item.label)}
    <label class="check-field"><input type="checkbox" name="menuVisible.${role}.${item.screen}" ${item.visible ? "checked" : ""}>Visible</label>
  </div>`;
}

function interfaceDashboardRow(role, card, order) {
  return `<div class="interface-config-row">
    ${input(`cardOrder.${role}.${card.id}`, "Ordre", card.order || order, "number")}
    ${input(`cardLabel.${role}.${card.id}`, "Nom carte", card.label)}
    <label class="check-field"><input type="checkbox" name="cardVisible.${role}.${card.id}" ${card.visible !== false ? "checked" : ""}>Visible</label>
  </div>`;
}

function saveInterfaceConfig(event) {
  event.preventDefault();
  if (!isAdmin() || isPrimaryAdmin()) return;
  const form = event.currentTarget;
  const formData = new FormData(form);
  const roles = ["admin", "driver", "assistant", "parent", "support"];
  const next = defaultInterfaceConfig();
  next.menuLabels = {};
  next.menuLayout = {};
  next.roleVisibility = {};
  next.dashboardCards = {};

  roles.forEach((role) => {
    const menuRows = baseNavigationItems(role).map((item, index) => ({
      screen: item.screen,
      label: String(formData.get(`menuLabel.${role}.${item.screen}`) || item.label).trim() || item.label,
      order: Number(formData.get(`menuOrder.${role}.${item.screen}`) || index + 1),
      visible: formData.has(`menuVisible.${role}.${item.screen}`)
    })).sort((a, b) => a.order - b.order);
    next.menuLabels[role] = {};
    next.roleVisibility[role] = {};
    next.menuLayout[role] = menuRows.map((item) => item.screen);
    menuRows.forEach((item) => {
      next.menuLabels[role][item.screen] = item.label;
      next.roleVisibility[role][item.screen] = item.visible;
    });

    next.dashboardCards[role] = dashboardConfigFor(role).map((card, index) => ({
      id: card.id,
      label: String(formData.get(`cardLabel.${role}.${card.id}`) || card.label).trim() || card.label,
      order: Number(formData.get(`cardOrder.${role}.${card.id}`) || index + 1),
      visible: formData.has(`cardVisible.${role}.${card.id}`)
    })).sort((a, b) => a.order - b.order);
  });

  next.updatedBy = state.user.id;
  next.updatedAt = new Date().toISOString();
  data.interfaceConfig = mergeInterfaceConfig(next);
  saveData();
  saveInterfaceConfigToFirestore(data.interfaceConfig);
  render();
}

function resetInterfaceConfig() {
  if (!isAdmin() || isPrimaryAdmin() || !confirm("Réinitialiser l’interface par défaut ?")) return;
  data.interfaceConfig = {
    ...defaultInterfaceConfig(),
    updatedBy: state.user.id,
    updatedAt: new Date().toISOString()
  };
  saveData();
  saveInterfaceConfigToFirestore(data.interfaceConfig);
  render();
}

function adminUsersView() {
  const tab = state.accessCodesTab === "parents" ? "parents" : "users";
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Gestionnaire de transport</p><h2>Codes d’accès</h2></div>
    <div class="support-filters">
      <button class="${tab === "users" ? "active" : ""}" data-access-tab="users">Utilisateurs</button>
      <button class="${tab === "parents" ? "active" : ""}" data-access-tab="parents">Parents / élèves</button>
    </div>
    ${tab === "parents" ? parentCodesPanel() : usersAccessPanel()}
  </section>`;
}

function usersAccessPanel() {
  const driverOption = isTransportManagerUser() ? `<option value="driver">Chauffeur</option>` : "";
  const assistantOption = canManageAssistantAccounts() ? `<option value="assistant">Convoyeuse</option>` : "";
  const managerOption = isSpwAccount() ? "" : `<option value="admin">Gestionnaire de transport</option>`;
  const supportOption = isSpwAccount() ? "" : `<option value="support">Support</option>`;
  return `${accessPersonEditView()}
    <form class="edit-form" id="create-user-form">
      <article class="info-card form-grid">
        <h3>Créer un utilisateur</h3>
        ${input("lastName", "Nom", "")}
        ${input("firstName", "Prénom", "")}
        <label><span>Rôle</span><select name="role" id="create-user-role">${driverOption}${assistantOption}${managerOption}${supportOption}</select></label>
        <p class="muted full-span">L’identifiant utilisateur et le code temporaire de première connexion sont générés automatiquement.</p>
        <div class="admin-hidden-fields">
          ${input("assignedCircuits", "Circuits associés (séparés par virgule)", "C-12")}
          ${input("assignedVehicleId", "Véhicule associé", "vehicle-1")}
          ${dataListInput("assignedSchool", "École associée", "", schoolNameOptions())}
          <div class="driver-association-field">${dataListInput("driverId", "Chauffeur associé", "", driverNameOptions())}</div>
          <label class="check-field driver-sncb-access-field"><input name="hasSncbReplacementAccess" type="checkbox">Accès Bus de remplacement SNCB</label>
        </div>
      </article>
      <div class="form-actions"><button class="primary-button compact-action" type="submit">Créer l’utilisateur</button></div>
    </form>
    <div class="card-grid">${data.users.map(userCard).join("")}</div>`;
}

function supportAccessCodesView() {
  const users = (data.users || []).filter((user) => user.id !== "admin" && user.identifierNumber !== "6183");
  const parents = data.parents || [];
  return `<section class="view-stack">
    <div class="section-title action-title">
      <div>
        <p class="eyebrow">Support</p>
        <h2>Identifiants & accès</h2>
        <p class="muted">Consultation sécurisée. Seuls les codes temporaires actifs sont imprimables.</p>
      </div>
      <button class="primary-button compact-action" type="button" id="print-support-access-codes">Imprimer PDF</button>
    </div>
    <article class="info-card">
      <h3>Utilisateurs</h3>
      <div class="quick-list-inner">${users.map(supportAccessUserRow).join("") || `<p class="muted">Aucun utilisateur visible.</p>`}</div>
    </article>
    <article class="info-card">
      <h3>Parents</h3>
      <div class="quick-list-inner">${parents.map(supportAccessParentRow).join("") || `<p class="muted">Aucun parent visible.</p>`}</div>
    </article>
  </section>`;
}

function supportAccessUserRow(user) {
  return `<article class="message-item">
    <strong>${esc(fullName(user))}</strong>
    ${sectionRows([
      ["Rôle", accountRoleLabel(user)],
      ["Numéro identifiant", user.identifier || user.identifierNumber],
      ["Accès", accessSecurityStatus(user)],
      ["Code temporaire", temporaryAccessDisplay(user)],
      ["Statut", user.isActive === false ? "désactivé" : "actif"]
    ])}
    <div class="form-actions"><button class="secondary-button compact-action" type="button" data-print-support-access-type="users" data-print-support-access-id="${esc(user.id)}">Imprimer cette fiche</button></div>
  </article>`;
}

function supportAccessParentRow(parent) {
  const children = (parent.linkedChildrenIds || []).map((id) => data.children.find((child) => child.id === id)).filter(Boolean);
  return `<article class="message-item">
    <strong>${esc(fullName(parent))}</strong>
    ${sectionRows([
      ["Rôle", "Parent"],
      ["Identifiant", parentStudentIdentifier(parent) || parent.username || "Non renseigné"],
      ["Accès", accessSecurityStatus(parent)],
      ["Code temporaire", temporaryAccessDisplay(parent)],
      ["Enfants liés", children.map(fullName).join(", ")],
      ["Statut", parent.isActive === false ? "désactivé" : "actif"]
    ])}
    <div class="form-actions"><button class="secondary-button compact-action" type="button" data-print-support-access-type="parents" data-print-support-access-id="${esc(parent.id)}">Imprimer cette fiche</button></div>
  </article>`;
}

function supportAccessPrintableRows() {
  const users = (data.users || []).filter((user) => user.id !== "admin" && user.identifierNumber !== "6183");
  const parents = data.parents || [];
  return [
    ...users.map((user) => ({
      name: fullName(user),
      role: accountRoleLabel(user),
      identifier: user.identifier || user.identifierNumber || "Non renseigné",
      code: temporaryAccessDisplay(user),
      linked: (user.assignedCircuits || []).join(", ") || user.assignedSchool || "",
      status: user.isActive === false ? "Désactivé" : "Actif"
    })),
    ...parents.map((parent) => {
      const children = (parent.linkedChildrenIds || []).map((id) => data.children.find((child) => child.id === id)).filter(Boolean);
      return {
        name: fullName(parent),
        role: "Parent",
        identifier: parentStudentIdentifier(parent) || parent.username || "Non renseigné",
        code: temporaryAccessDisplay(parent),
        linked: children.map(fullName).join(", "),
        status: parent.isActive === false ? "Désactivé" : "Actif"
      };
    })
  ];
}

function printSupportAccessCodesPdf() {
  if (!isSupport()) return alert("Action réservée au support.");
  openSupportAccessPrintWindow("Identifiants et accès", supportAccessPrintableRows(), "Seul le code temporaire actif est imprimé. Le code personnel définitif reste toujours masqué. Le gestionnaire de transport principal est volontairement exclu de ce document.");
}

function printSingleSupportAccessPdf(type, id) {
  if (!isSupport()) return alert("Action réservée au support.");
  openAccessCardPrintPreview(type, id);
}

function openSupportAccessPrintWindow(title, rows, note) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return alert("Autorisez les fenêtres pop-up pour générer le PDF.");
  const generatedAt = formatDateTime(new Date().toISOString());
  const url = loginPageUrl();
  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html lang="fr-BE"><head><meta charset="UTF-8"><title>Identifiants et accès</title><style>
    body{font-family:Arial,sans-serif;background:#eef5fb;margin:0;color:#102033}
    .page{max-width:1100px;margin:auto;padding:24px}
    .toolbar{display:flex;gap:8px;justify-content:flex-end;margin-bottom:14px}
    button{border:0;border-radius:10px;padding:10px 12px;font-weight:800}
    .primary{background:#075b8f;color:white}
    header{background:#075b8f;color:white;border-radius:16px;padding:18px;margin-bottom:12px}
    section{background:white;border-radius:16px;padding:18px;border:1px solid #d6e4ef}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{border-bottom:1px solid #edf3f7;padding:10px;text-align:left;vertical-align:top}
    th{color:#587082;text-transform:uppercase;font-size:11px;letter-spacing:.04em}
    .qr-cell{text-align:center;width:118px}
    .qr-cell img{width:92px;height:92px;border:1px solid #d6e4ef;border-radius:10px;background:white}
    .note{color:#587082;margin-top:10px;font-size:12px}
    @media print{.toolbar{display:none}body{background:white}.page{padding:0}header,section{border-radius:0}table{font-size:11px}.qr-cell img{width:82px;height:82px}}
  </style></head><body><main class="page">
    <div class="toolbar"><button class="primary" onclick="window.print()">Télécharger / imprimer PDF</button><button onclick="window.close()">Fermer</button></div>
    <header><p>Gestion Services Mobilité</p><h1>${esc(title)}</h1><p>Généré le ${esc(generatedAt)}</p></header>
    <section>
      <table>
        <thead><tr><th>Nom</th><th>Rôle</th><th>Identifiant</th><th>Code temporaire</th><th>Lié à</th><th>Statut</th><th>QR code</th></tr></thead>
        <tbody>${rows.map((row) => `<tr><td>${esc(row.name)}</td><td>${esc(row.role)}</td><td>${esc(row.identifier)}</td><td>${esc(row.code)}</td><td>${esc(row.linked || "-")}</td><td>${esc(row.status)}</td><td class="qr-cell"><img src="${esc(qrImageUrl(url))}" alt="QR code connexion" onerror="this.onerror=null;this.src='${esc(qrImageFallbackUrl(url))}'"></td></tr>`).join("")}</tbody>
      </table>
      <p class="note">Scannez le QR code pour ouvrir la page de connexion : ${esc(url)}</p>
      ${note ? `<p class="note">${esc(note)}</p>` : ""}
    </section>
  </main></body></html>`);
  printWindow.document.close();
}

function loginPageUrl() {
  const origin = window.location.origin && window.location.origin !== "null" ? window.location.origin : "https://gestion-transport-scolaire.web.app";
  const path = window.location.pathname && !window.location.pathname.endsWith("/") ? window.location.pathname : "/";
  return `${origin}${path}`;
}

function qrImageUrl(value) {
  return `https://quickchart.io/qr?size=220&margin=2&text=${encodeURIComponent(value)}`;
}

function qrImageFallbackUrl(value) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(value)}`;
}

function accessCardPayload(type, id) {
  if (type === "parents") {
    const parent = (data.parents || []).find((item) => item.id === id);
    if (!parent) return null;
    return {
      type,
      id: parent.id,
      firstName: parent.firstName || "",
      lastName: parent.lastName || "",
      role: "Parent",
      identifier: parentStudentIdentifier(parent) || parent.username || parent.lastName || "Non renseigné",
      code: temporaryAccessDisplay(parent),
      linked: (parent.linkedChildrenIds || []).map((childId) => data.children.find((child) => child.id === childId)).filter(Boolean).map(fullName).join(", ")
    };
  }
  const user = (data.users || []).find((item) => item.id === id);
  if (!user) return null;
  if (isSupport() && (user.id === "admin" || user.identifierNumber === "6183")) return null;
  return {
    type: "users",
    id: user.id,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    role: accountRoleLabel(user),
    identifier: user.identifier || user.identifierNumber || defaultIdentifierForUser(user) || "",
    code: temporaryAccessDisplay(user),
    linked: (user.assignedCircuits || []).join(", ") || user.assignedSchool || user.assignedVehicleId || ""
  };
}

function openAccessCardPrintPreview(type, id) {
  if (!canPrintAccessCard()) return alert("Impression accès non autorisée.");
  const payload = accessCardPayload(type, id);
  if (!payload) return alert("Fiche non disponible.");
  const printWindow = window.open("", "_blank");
  if (!printWindow) return alert("Autorisez les fenêtres pop-up pour imprimer la fiche d’accès.");
  const url = loginPageUrl();
  const generatedAt = formatDateTime(new Date().toISOString());
  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html lang="fr-BE"><head><meta charset="UTF-8"><title>Accès Gestion Transport Scolaire</title><style>
    :root{--blue:#075b8f;--dark:#102033;--muted:#587082;--line:#d6e4ef}
    body{font-family:Arial,sans-serif;background:#eef5fb;margin:0;color:var(--dark)}
    .page{max-width:760px;margin:auto;padding:24px}
    .toolbar{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin-bottom:14px}
    button{border:0;border-radius:10px;padding:10px 12px;font-weight:800;cursor:pointer}
    .primary{background:var(--blue);color:white}
    .secondary{background:white;color:var(--dark);border:1px solid var(--line)}
    .card{background:white;border:1px solid var(--line);border-radius:22px;overflow:hidden;box-shadow:0 18px 45px rgba(11,45,77,.12)}
    header{background:linear-gradient(135deg,#075b8f,#0b2d4d);color:white;padding:24px}
    header p{margin:0 0 6px;font-weight:800;opacity:.86}
    header h1{margin:0;font-size:28px}
    .body{display:grid;grid-template-columns:minmax(0,1fr) 240px;gap:22px;padding:24px;align-items:start}
    .rows{display:grid;gap:10px}
    .row{display:grid;grid-template-columns:150px minmax(0,1fr);gap:12px;padding:10px 0;border-bottom:1px solid #edf3f7}
    .label{font-weight:900;color:var(--muted);text-transform:uppercase;font-size:11px;letter-spacing:.04em}
    .value{font-weight:800;overflow-wrap:anywhere}
    .qr{display:grid;gap:10px;justify-items:center;text-align:center}
    .qr img{width:220px;height:220px;border:1px solid var(--line);border-radius:16px;background:white}
    .qr small,.note{color:var(--muted);font-weight:700;line-height:1.45}
    .note{padding:0 24px 24px;margin:0}
    @media(max-width:680px){.page{padding:12px}.body{grid-template-columns:1fr}.row{grid-template-columns:1fr;gap:4px}.toolbar{justify-content:stretch}.toolbar button{flex:1 1 180px}}
    @media print{body{background:white}.page{padding:0}.toolbar{display:none}.card{box-shadow:none;border-radius:0}}
  </style></head><body><main class="page">
    <div class="toolbar">
      <button class="primary" onclick="window.print()">Imprimer</button>
      <button class="secondary" onclick="window.print()">Télécharger PDF</button>
      <button class="secondary" onclick="window.close()">Fermer</button>
    </div>
    <article class="card">
      <header><p>Gestion Transport Scolaire</p><h1>Accès Gestion Transport Scolaire</h1><p>Fiche générée le ${esc(generatedAt)}</p></header>
      <section class="body">
        <div class="rows">
          <div class="row"><span class="label">Nom</span><span class="value">${esc(payload.lastName || "Non renseigné")}</span></div>
          <div class="row"><span class="label">Prénom</span><span class="value">${esc(payload.firstName || "Non renseigné")}</span></div>
          <div class="row"><span class="label">Rôle</span><span class="value">${esc(payload.role)}</span></div>
          <div class="row"><span class="label">Identifiant</span><span class="value">${esc(payload.identifier || "Non utilisé")}</span></div>
          <div class="row"><span class="label">Code temporaire</span><span class="value">${esc(payload.code || "À régénérer")}</span></div>
          ${payload.linked ? `<div class="row"><span class="label">Lié à</span><span class="value">${esc(payload.linked)}</span></div>` : ""}
          <div class="row"><span class="label">Lien</span><span class="value">${esc(url)}</span></div>
        </div>
        <div class="qr">
          <img src="${esc(qrImageUrl(url))}" alt="QR code accès application" onerror="this.onerror=null;this.src='${esc(qrImageFallbackUrl(url))}'">
          <small>Scannez ce QR code pour ouvrir la page de connexion.</small>
        </div>
      </section>
      <p class="note">Scannez le QR code pour accéder à la page de connexion, puis entrez votre identifiant et ce code temporaire. L’utilisateur devra ensuite créer son code personnel, qui ne sera jamais imprimé.</p>
    </article>
  </main></body></html>`);
  printWindow.document.close();
}

function adminManagementView() {
  return `<section class="view-stack">${adminManagementPanel()}</section>`;
}

function adminManagementPanel() {
  const admins = data.users.filter((user) => user.role === "admin");
  return `
    <div class="section-title"><p class="eyebrow">Gestionnaire de transport</p><h2>Gestion des gestionnaires de transport</h2></div>
    ${accessPersonEditView()}
    <form class="edit-form" id="create-admin-form">
      <article class="info-card form-grid">
        <h3>Ajouter un gestionnaire de transport</h3>
        ${input("companyName", "Nom société", "")}
        ${input("lastName", "Nom", "")}
        ${input("firstName", "Prénom", "")}
        ${input("phone", "Téléphone", "", "tel")}
        ${input("email", "Adresse e-mail", "", "email")}
        <p class="muted full-span">Le numéro identifiant et le code temporaire sont générés automatiquement.</p>
        <label class="check-field"><input name="isActive" type="checkbox" checked>Actif</label>
        <label class="check-field"><input name="visualThemeSpw" type="checkbox">Identité visuelle SPW</label>
      </article>
      <div class="form-actions"><button class="primary-button compact-action" type="submit">Créer gestionnaire de transport</button></div>
    </form>
    <div class="card-grid">${admins.map(adminCard).join("")}</div>
    ${accessRequestsPanel()}
  `;
}

function adminCard(admin) {
  const canRemove = canRemoveAdmin(admin);
  const rows = [
    ["Nom société", admin.companyName],
    ["Téléphone", admin.phone],
    ["Adresse e-mail", admin.email],
    ["Numéro identifiant", admin.identifier || admin.identifierNumber],
    ["Accès", accessSecurityStatus(admin)],
    ["Identité visuelle", admin.visualTheme === "spw" ? "SPW" : "Standard"],
    ["Actif", admin.isActive === false ? "non" : "oui"],
    ["Cree par", admin.createdBy],
    ["Date creation", formatDateTime(admin.createdAt)]
  ];
  return `<article class="info-card"><h3>${esc(fullName(admin))}</h3>${sectionRows(rows)}<div class="form-actions"><button class="secondary-button" type="button" data-edit-access-type="users" data-edit-access-id="${esc(admin.id)}">Modifier la personne</button><button class="secondary-button" type="button" data-toggle-admin="${esc(admin.id)}">${admin.isActive === false ? "Activer" : "Désactiver"}</button>${canRemove ? `<button class="danger-button" type="button" data-delete-admin="${esc(admin.id)}">Supprimer</button>` : ""}</div></article>`;
}

function canRemoveAdmin(admin) {
  if (!admin || admin.id === state.user.id || admin.id === "admin") return false;
  const activeAdmins = data.users.filter((user) => user.role === "admin" && user.isActive !== false);
  return admin.isActive === false || activeAdmins.length > 1;
}

function loginLogsView() {
  const logs = [...(data.loginLogs || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 100);
  return `<section class="view-stack">
    <div class="section-title"><p class="eyebrow">Sécurité</p><h2>Connexions</h2></div>
    <div class="quick-list">${logs.map(loginLogRow).join("") || `<article class="info-card"><p class="muted">Aucune connexion enregistrée.</p></article>`}</div>
  </section>`;
}

function loginLogRow(log) {
  const date = new Date(log.createdAt);
  const day = Number.isNaN(date.getTime()) ? "Date inconnue" : date.toLocaleDateString("fr-BE");
  const time = Number.isNaN(date.getTime()) ? "Heure inconnue" : date.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
  const status = log.loginStatus === "réussie" || log.loginStatus === "reussie"
    ? "réussie"
    : log.loginStatus === "réinitialisation"
      ? "réinitialisation mot de passe"
      : log.loginStatus === "réinitialisation refusée"
        ? "réinitialisation refusée"
        : "refusée";
  return `<article class="info-card">
    <h3>${esc(isPrimaryAdmin() ? "Connexion utilisateur" : log.userName || "Utilisateur inconnu")}</h3>
    ${sectionRows(isPrimaryAdmin()
      ? [["Rôle", log.userRoleLabel || roleLabel(log.userRole)], ["Date de connexion", day], ["Heure de connexion", time], ["Appareil", log.deviceInfo], ["Navigateur", browserLabel(log.browserInfo)], ["Statut", status]]
      : [["Rôle", log.userRoleLabel || roleLabel(log.userRole)], ["Code utilisé", log.accessCodeMasked], ["Date de connexion", day], ["Heure de connexion", time], ["Appareil", log.deviceInfo], ["Navigateur", browserLabel(log.browserInfo)], ["Statut", status]])}
  </article>`;
}

function browserLabel(userAgent = "") {
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Chrome")) return "Chrome";
  return userAgent || "Navigateur non renseigné";
}

function parentCodesView() {
  return `<section class="view-stack"><div class="section-title"><p class="eyebrow">Gestionnaire de transport</p><h2>Codes d’accès</h2></div>${parentCodesPanel()}</section>`;
}

function parentCodesPanel() {
  return `
    ${accessPersonEditView()}
    <form class="edit-form" id="create-parent-form">
      <article class="info-card form-grid">
        <h3>Créer un accès parent</h3>
        ${input("lastName", "Nom parent", "")}
        ${input("firstName", "Prénom parent", "")}
        ${input("phone", "Téléphone parent", "", "tel")}
        ${input("email", "E-mail parent", "", "email")}
        ${dataListInput("studentLastName", "Nom de l’élève (identifiant obligatoire)", "", childLastNameOptions())}
        <p class="muted full-span">Le code temporaire de première connexion est généré automatiquement.</p>
        ${childAssociationAutoField("linkedChildrenIds", "Élève associé", [])}
        <p class="muted full-span">Le nom de l’élève sert d’identifiant parent. Le code temporaire sert uniquement à la première connexion.</p>
      </article>
      <div class="form-actions"><button class="primary-button compact-action" type="submit">Créer le code parent</button></div>
    </form>
    <div class="card-grid">${data.parents.map(parentCodeCard).join("")}</div>
    <article class="info-card"><h3>Élèves et parents liés</h3>${data.children.map((child) => {
      const parents = parentListForChild(child);
      return `<div class="field-row"><span>${esc(fullName(child))}<br><small>${esc(child.schoolName)} - ${esc(child.circuitNumber)}</small></span><strong>${parents.map((parent) => `${fullName(parent)} (${parent.phone || "tel ?"}) - ${accessSecurityStatus(parent)}`).join(" / ") || "Aucun parent lié"}</strong></div>`;
    }).join("")}</article>`;
}

function parentCodeCard(parent) {
  const linkedChildren = (parent.linkedChildrenIds || []).map((id) => data.children.find((child) => child.id === id)).filter(Boolean);
  return `<article class="info-card">
    <h3>${esc(fullName(parent))}</h3>
    ${sectionRows([["Identifiant parent", parentStudentIdentifier(parent) || parent.username], ["Téléphone", parent.phone], ["Adresse e-mail", parent.email], ["Accès", accessSecurityStatus(parent)], ["Première connexion", parent.firstLoginCompleted === false ? "à faire" : "effectuée"], ["Statut", parent.isActive === false ? "désactivé" : "actif"], ["Enfants liés", linkedChildren.map(fullName).join(", ")]])}
    <div class="form-actions">
      <button class="secondary-button" type="button" data-edit-access-type="parents" data-edit-access-id="${esc(parent.id)}">Modifier la personne</button>
      ${accessPrintButton("parents", parent.id)}
      <button class="secondary-button" type="button" data-reset-parent-code="${esc(parent.id)}">Réinitialiser accès</button>
      <button class="danger-button" type="button" data-disable-parent="${esc(parent.id)}">${parent.isActive === false ? "Réactiver" : "Désactiver accès"}</button>
      <button class="danger-button" type="button" data-delete-parent="${esc(parent.id)}">Supprimer</button>
    </div>
  </article>`;
}

function parentListForChild(child) {
  return (data.parents || []).filter((parent) => (parent.linkedChildrenIds || []).includes(child.id));
}

function normalizePhoneNumber(value = "") {
  return String(value || "").replace(/[^\d+]/g, "").trim();
}

function canTriggerSmsTransportAlert() {
  if (!state.user || isSupport() || isPrimaryAdmin()) return false;
  return isTransportManagerUser() || isSpwAccount() || ["driver", "assistant"].includes(state.user.role);
}

function childrenForTransfer(transfer = {}) {
  const ids = new Set(transfer.studentsIds || []);
  return (data.children || []).filter((child) =>
    ids.has(child.id) ||
    child.transferId === transfer.transferId ||
    transferCircuitIdForChild(child) === transfer.circuitId
  );
}

function childrenForVehicleService(vehicle = {}) {
  const circuit = vehicleCircuitLabel(vehicle);
  return (data.children || []).filter((child) =>
    child.vehicleId === vehicle.id ||
    child.driverId === vehicle.driverId ||
    child.assistantId === vehicle.assistantId ||
    [child.circuitNumber, childPickupCircuitLabel(child), childSchoolCircuitLabel(child)].filter(Boolean).includes(circuit)
  );
}

function smsRecipientsForChild(child = {}) {
  const recipients = [];
  parentListForChild(child).forEach((parent) => {
    recipients.push({
      parentId: parent.id,
      firstName: parent.firstName || "",
      lastName: parent.lastName || "",
      phone: normalizePhoneNumber(parent.phone)
    });
  });
  [...(child.responsiblePersons || []), ...(child.guardians || [])].forEach((person, index) => {
    recipients.push({
      parentId: person.id || `responsible-${child.id}-${index}`,
      firstName: person.firstName || "",
      lastName: person.lastName || "",
      phone: normalizePhoneNumber(person.phone)
    });
  });
  const byPhone = new Map();
  recipients.filter((recipient) => recipient.phone).forEach((recipient) => {
    if (!byPhone.has(recipient.phone)) byPhone.set(recipient.phone, recipient);
  });
  return [...byPhone.values()];
}

function smsGreeting(recipient = {}) {
  const name = [recipient.firstName, recipient.lastName].filter(Boolean).join(" ").trim();
  return name ? `Bonjour Madame/Monsieur ${name}` : "Bonjour";
}

function smsContentForAlert(type, child, recipient, details = {}) {
  const childName = fullName(child);
  const circuit = details.circuitId || child.circuitNumber || childPickupCircuitLabel(child) || "non renseigné";
  if (type === "delay") {
    return `${smsGreeting(recipient)}, retard transport scolaire pour ${childName} : le circuit ${circuit} a environ ${details.delayMinutes || ""} minutes de retard.`;
  }
  return `${smsGreeting(recipient)}, annulation transport scolaire pour ${childName} : le trajet du circuit ${circuit} est annulé aujourd’hui.${details.message ? ` ${details.message}` : ""}`;
}

function queueSmsAlerts(type, children = [], details = {}) {
  if (!canTriggerSmsTransportAlert() || !["delay", "cancellation"].includes(type)) return [];
  const now = new Date().toISOString();
  const alerts = [];
  children.forEach((child) => {
    smsRecipientsForChild(child).forEach((recipient) => {
      const content = smsContentForAlert(type, child, recipient, details);
      const alert = {
        id: `sms-${type}-${child.id}-${recipient.phone}-${Date.now()}-${alerts.length}`,
        childIds: [child.id],
        parentIds: recipient.parentId ? [recipient.parentId] : [],
        phoneNumbers: [recipient.phone],
        type,
        content,
        status: "pending",
        createdBy: state.user.id,
        createdByRole: state.user.role,
        createdAt: now,
        sentAt: "",
        providerMessageId: ""
      };
      data.smsAlerts = data.smsAlerts || [];
      data.smsAlerts.push(alert);
      saveCollectionItemToFirestore("smsAlerts", alert);
      alerts.push(alert);
    });
  });
  return alerts;
}

function accessPrintButton(type, id) {
  if (!canPrintAccessCard()) return "";
  return `<button class="secondary-button" type="button" data-print-access-card-type="${esc(type)}" data-print-access-card-id="${esc(id)}">Imprimer accès</button>`;
}

function userCard(user) {
  const canRemove = user.id !== state.user.id;
  const canManageAccess = canManageUserAccess(user);
  const rows = ["admin", "support"].includes(user.role)
    ? [["Rôle", accountRoleLabel(user)], ["Téléphone", user.phone], ["Adresse e-mail", user.email], ["Numéro identifiant", user.identifier || user.identifierNumber], ["Identité visuelle", user.visualTheme === "spw" ? "SPW" : "Standard"], ["Accès", accessSecurityStatus(user)], ["Première connexion", user.firstLoginCompleted === false ? "à faire" : "effectuée"], ["Date création", user.createdAt ? formatDateTime(user.createdAt) : "Non renseignée"]]
    : [["Rôle", accountRoleLabel(user)], ["Numéro identifiant", user.identifier || user.identifierNumber], ["Circuit associé", (user.assignedCircuits || []).join(", ")], ["Véhicule associé", user.assignedVehicleId], ["Accès", accessSecurityStatus(user)], ["Première connexion", user.firstLoginCompleted === false ? "à faire" : "effectuée"], ["Date création", user.createdAt ? formatDateTime(user.createdAt) : "Non renseignée"], ["École associée", user.assignedSchool]];
  if (user.role === "driver") rows.push(["Accès Bus SNCB", user.hasSncbReplacementAccess === true ? "activé" : "désactivé"]);
  return `<article class="info-card"><h3>${esc(fullName(user))}</h3>${sectionRows(rows)}<div class="form-actions">${canManageAccess ? `<button class="secondary-button" type="button" data-edit-access-type="users" data-edit-access-id="${esc(user.id)}">Modifier la personne</button>${accessPrintButton("users", user.id)}<button class="secondary-button" type="button" data-reset-code="${esc(user.id)}">Réinitialiser accès</button>${canRemove ? `<button class="danger-button" type="button" data-delete-user="${esc(user.id)}">Supprimer</button>` : ""}` : `<span class="muted">Consultation uniquement</span>`}</div></article>`;
}

function canManageUserAccess(user = {}) {
  if (!isAdmin() || !user) return false;
  if (isPrimaryAdmin()) return false;
  if (user.role === "assistant") return canManageAssistantAccounts();
  if (isSpwAccount() && user.role !== "assistant") return false;
  return true;
}

function accessSecurityStatus(person = {}) {
  if (person.resetRequired === true || person.firstLoginCompleted === false) return "code temporaire actif";
  if (person.accessCodeHash || person.passwordHash || person.accessCode) return "code personnel configuré";
  return "à réinitialiser";
}

function temporaryAccessDisplay(person = {}) {
  if (person.resetRequired !== true && person.firstLoginCompleted !== false) return "Non applicable";
  if (person.temporaryAccessCode) return person.temporaryAccessCode;
  if (person.isTemporaryCode === true && person.accessCode) return person.accessCode;
  if (person.accessCode && !person.accessCodeHash && !person.passwordHash) return person.accessCode;
  return "À régénérer";
}

function generatedTemporaryAccessData(code, now = new Date().toISOString()) {
  return {
    accessCode: code,
    temporaryAccessCode: code,
    isTemporaryCode: true,
    temporaryCodeCreatedAt: now,
    accessCodeUpdatedAt: now
  };
}

function identifierPrefixForRole(role, options = {}) {
  if (role === "admin" && options.visualTheme === "spw") return "SPW";
  if (role === "admin") return "ADM";
  if (role === "driver") return "CHF";
  if (role === "assistant") return "CNV";
  if (role === "support") return "SUP";
  return "USR";
}

function generateUniqueIdentifier(role, options = {}) {
  const prefix = identifierPrefixForRole(role, options);
  const used = new Set((data.users || []).flatMap((user) => [
    user.identifier,
    user.identifierNumber,
    user.username
  ]).filter(Boolean).map(normalizeLoginValue));
  for (let index = 1; index <= 9999; index += 1) {
    const identifier = `${prefix}${String(index).padStart(4, "0")}`;
    if (!used.has(normalizeLoginValue(identifier))) return identifier;
  }
  return `${prefix}${Date.now()}`;
}

function accessPersonEditView() {
  if (!isAdmin() || !state.editingAccessType || !state.editingAccessId) return "";
  const isParentAccess = state.editingAccessType === "parents";
  const person = isParentAccess
    ? data.parents.find((parent) => parent.id === state.editingAccessId)
    : data.users.find((user) => user.id === state.editingAccessId);
  if (!person) return "";
  if (!isParentAccess && !canManageUserAccess(person)) return "";
  const role = isParentAccess ? "parent" : person.role;
  const linked = linkedAccessRecord(person);
  const fields = [
    input("lastName", "Nom", person.lastName),
    input("firstName", "Prénom", person.firstName),
    input("phone", "Téléphone", person.phone || linked?.phone || "", "tel"),
    input("email", "Adresse e-mail", person.email || linked?.email || "", "email"),
    ...(role !== "parent" ? [input("identifierNumber", "Numéro identifiant", person.identifierNumber || defaultIdentifierForUser(person), "text", person.id === "admin" && !isAdmin())] : []),
    `<p class="muted full-span">Le code personnel n’est jamais affiché. Utilisez “Réinitialiser accès” pour créer un nouveau code temporaire.</p>`
  ];
  if (role === "driver") {
    fields.push(input("assignedVehicleId", "Véhicule associé", person.assignedVehicleId || linkedVehicleIdForDriver(person.id)));
    fields.push(input("assignedCircuits", "Circuits associés", (person.assignedCircuits || [linked?.schoolCircuit]).filter(Boolean).join(", ")));
    fields.push(dataListInput("assignedSchool", "Écoles associées", person.assignedSchool || linked?.schoolName || "", schoolNameOptions()));
    fields.push(`<label class="check-field"><input name="hasSncbReplacementAccess" type="checkbox" ${person.hasSncbReplacementAccess === true || linked?.hasSncbReplacementAccess === true ? "checked" : ""}>Accès Bus de remplacement SNCB</label>`);
  }
  if (role === "assistant") {
    fields.push(input("assignedCircuits", "Circuits associés", (person.assignedCircuits || [linked?.schoolCircuit]).filter(Boolean).join(", ")));
    fields.push(dataListInput("assignedSchool", "Écoles associées", person.assignedSchool || linked?.schoolName || "", schoolNameOptions()));
    fields.push(dataListInput("driverId", "Chauffeur associé", driverDisplayName(linked?.driverId || driverIdForAssistant(person.id)), driverNameOptions()));
  }
  if (role === "parent") {
    fields.push(childMultiSelect("linkedChildrenIds", "Élèves associés", person.linkedChildrenIds || []));
  }
  if (role === "admin") {
    fields.splice(0, 0, input("companyName", "Nom société", person.companyName || ""));
    fields.push(`<label class="check-field"><input name="isActive" type="checkbox" ${person.isActive !== false ? "checked" : ""}>Actif</label>`);
    fields.push(`<label class="check-field"><input name="visualThemeSpw" type="checkbox" ${person.visualTheme === "spw" ? "checked" : ""}>Identité visuelle SPW</label>`);
    fields.push(input("createdBy", "Créé par", person.createdBy || ""));
    fields.push(input("createdAt", "Date création", person.createdAt || "", "datetime-local"));
  }
  return `<div class="modal-backdrop" data-cancel-access-edit>
    <form class="edit-form info-card access-edit-dialog" id="access-person-form" data-access-type="${esc(state.editingAccessType)}" data-access-id="${esc(state.editingAccessId)}" onclick="event.stopPropagation()">
      <div class="modal-head">
        <div>
          <h3>Modifier la personne</h3>
          <p class="muted">${esc(isParentAccess ? roleLabel(role) : accountRoleLabel(person))} - ${esc(fullName(person))}</p>
        </div>
        <button class="icon-button" type="button" data-cancel-access-edit title="Fermer">×</button>
      </div>
      <div class="form-grid">${fields.join("")}</div>
      <div class="form-actions"><button class="primary-button compact-action" type="submit">Enregistrer</button><button class="secondary-button" type="button" data-cancel-access-edit>Annuler</button></div>
    </form>
  </div>`;
}

function linkedAccessRecord(person) {
  if (!person) return null;
  if (person.role === "driver") return data.drivers.find((driver) => driver.id === person.id) || null;
  if (person.role === "assistant") return data.assistants.find((assistant) => assistant.id === person.id) || null;
  return null;
}

function linkedVehicleIdForDriver(driverId) {
  return data.vehicles.find((vehicle) => vehicle.driverId === driverId)?.id || "";
}

function driverIdForAssistant(assistantId) {
  return data.vehicles.find((vehicle) => vehicle.assistantId === assistantId)?.driverId
    || data.circuits.find((circuit) => circuit.assistantId === assistantId)?.driverId
    || "";
}

function sectionRows(rows) {
  return rows.map(([label, value]) => `<div class="field-row"><span>${esc(label)}</span><strong>${esc(displayValue(value) || "Non renseigné")}</strong></div>`).join("");
}

function canViewHistoryLogs() {
  return isTransportManagerUser() || isSpwAccount();
}

function canRecordHistoryLog() {
  return !!state.user && !isSupport() && !isPrimaryAdmin();
}

const historyTrackedFields = {
  children: [
    "firstName", "lastName", "birthDate", "age", "schoolName", "circuitNumber",
    "streetName", "streetNumber", "street", "houseNumber", "postalCode", "city", "phone",
    "pickupCircuitId", "schoolCircuitId", "morningCircuit", "returnCircuit",
    "driverId", "assistantId", "vehicleId", "pickupStop", "transferLocation", "hasTransfer",
    "transferSchoolCircuitId", "transferDriverId", "transferAssistantId",
    "transportStatus", "exclusionType", "exclusionReason", "exclusionStartDate", "exclusionEndDate", "transportExclusion",
    "alternatingCustody", "alternatingResidence", "autonomy",
    "responsiblePersons", "guardians", "authorizedPersons", "authorizedPickupPersons",
    "medicalHelpSheet", "sensitiveStudent", "attentionSpeciale", "typeAttention", "noteAttention", "niveauAttention",
    "parentNotes", "importantInstructions"
  ],
  drivers: ["firstName", "lastName", "phone", "busNumber", "licensePlate", "schoolCircuit", "schoolName", "replacementDriverName", "hasSncbReplacementAccess"],
  assistants: ["firstName", "lastName", "phone", "schoolCircuit", "schoolName", "driverId"],
  vehicles: ["busNumber", "licensePlate", "driverId", "assistantId", "circuitId", "schoolName", "isOutOfService", "outOfServiceReason", "outOfServiceMessage", "outOfServiceStartDate", "outOfServiceEndDate"],
  schools: ["name", "managerName", "address", "phone", "email", "notes"],
  circuits: ["name", "schoolName", "driverId", "assistantId", "vehicleId", "notes"],
  replacementRules: ["zone", "inactiveCircuitId", "primaryReplacementCircuitId", "secondaryReplacementCircuitId", "schoolId", "message", "isActive"],
  roleAnnouncements: ["title", "content", "targetRole", "important"],
  studentIssues: ["type", "description", "importance", "status"],
  transferDelays: ["transferName", "circuitId", "delayMinutes", "reason", "status"]
};

const historyFieldLabels = {
  firstName: "Prénom",
  lastName: "Nom",
  birthDate: "Date de naissance",
  age: "Âge",
  schoolName: "École",
  circuitNumber: "Numéro de circuit",
  streetName: "Rue",
  streetNumber: "Numéro",
  street: "Rue",
  houseNumber: "Numéro",
  postalCode: "Code postal",
  city: "Commune",
  phone: "Téléphone",
  pickupCircuitId: "Circuit de prise en charge",
  schoolCircuitId: "Circuit vers l’école",
  morningCircuit: "Circuit de prise en charge",
  returnCircuit: "Circuit vers l’école",
  driverId: "Chauffeur associé",
  assistantId: "Convoyeuse associée",
  vehicleId: "Véhicule associé",
  pickupStop: "Arrêt de bus",
  transferLocation: "Lieu de transfert",
  hasTransfer: "Transfert",
  transferSchoolCircuitId: "Circuit après transfert",
  transferDriverId: "Chauffeur après transfert",
  transferAssistantId: "Convoyeuse après transfert",
  transportStatus: "Statut transport",
  exclusionType: "Type d’exclusion",
  exclusionReason: "Raison exclusion",
  exclusionStartDate: "Début exclusion",
  exclusionEndDate: "Fin exclusion",
  transportExclusion: "Exclusion transport",
  alternatingCustody: "Garde alternée",
  alternatingResidence: "Garde alternée",
  autonomy: "Autonomie",
  responsiblePersons: "Personnes responsables",
  guardians: "Personnes responsables",
  authorizedPersons: "Personnes autorisées",
  authorizedPickupPersons: "Personnes autorisées",
  medicalHelpSheet: "Fiche médicale",
  sensitiveStudent: "Élève sensible",
  attentionSpeciale: "Attention spéciale",
  typeAttention: "Type attention",
  noteAttention: "Note attention",
  niveauAttention: "Niveau attention",
  parentNotes: "Notes parents",
  importantInstructions: "Consignes importantes",
  busNumber: "Numéro bus",
  licensePlate: "Plaque",
  schoolCircuit: "Circuit",
  replacementDriverName: "Chauffeur de remplacement",
  hasSncbReplacementAccess: "Accès Bus de remplacement",
  outOfServiceReason: "Raison hors service",
  outOfServiceMessage: "Message hors service",
  outOfServiceStartDate: "Début hors service",
  outOfServiceEndDate: "Fin hors service",
  isOutOfService: "Véhicule hors service",
  managerName: "Responsable école",
  address: "Adresse",
  email: "Adresse e-mail",
  notes: "Notes",
  name: "Nom",
  zone: "Zone",
  inactiveCircuitId: "Circuit absent",
  primaryReplacementCircuitId: "Circuit remplacement principal",
  secondaryReplacementCircuitId: "Circuit remplacement secondaire",
  schoolId: "École concernée",
  message: "Message",
  isActive: "Actif",
  title: "Sujet",
  content: "Message",
  targetRole: "Destinataires",
  important: "Important",
  type: "Type",
  description: "Description",
  importance: "Importance",
  status: "Statut",
  transferName: "Transfert",
  delayMinutes: "Retard",
  reason: "Motif"
};

function cloneHistorySnapshot(item) {
  if (!item) return null;
  try {
    return JSON.parse(JSON.stringify(item));
  } catch {
    return { ...item };
  }
}

function normalizeHistoryValue(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "boolean") return value ? "oui" : "non";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(displayValue(value)).trim();
}

function historyValuesEqual(before, after) {
  return normalizeHistoryValue(before) === normalizeHistoryValue(after);
}

function historyEntityTypeLabel(type) {
  return {
    children: "Élève",
    drivers: "Chauffeur",
    assistants: "Convoyeuse",
    vehicles: "Véhicule",
    schools: "École",
    circuits: "Circuit",
    replacementRules: "Organisation transfert",
    roleAnnouncements: "Message important",
    studentIssues: "Problème élève",
    transferDelays: "Retard transport"
  }[type] || titleFor(type);
}

function historyEntityName(type, item = {}) {
  if (!item) return "Élément supprimé";
  if (type === "children" || type === "drivers" || type === "assistants") return fullName(item);
  if (type === "vehicles") return item.busNumber || item.licensePlate || item.id || "Véhicule";
  if (type === "schools" || type === "circuits") return item.name || item.id || historyEntityTypeLabel(type);
  if (type === "replacementRules") return item.inactiveCircuitId || item.zone || item.id || "Organisation transfert";
  if (type === "roleAnnouncements") return item.title || item.id || "Message important";
  if (type === "studentIssues") return item.childName || item.description || item.id || "Problème élève";
  if (type === "transferDelays") return item.transferName || item.circuitId || item.id || "Retard transport";
  return item.name || fullName(item);
}

function historyModifierRoleLabel(log = {}) {
  const user = (data.users || []).find((item) => item.id === log.modifiedBy);
  if (user) return accountRoleLabel(user);
  if (log.modifiedByRole === "admin" && log.modifiedByName?.toLowerCase().includes("spw")) return "SPW";
  return roleLabel(log.modifiedByRole);
}

function recordHistoryChanges(entityType, before, after, fields = historyTrackedFields[entityType] || []) {
  if (!canRecordHistoryLog() || !after || !fields.length) return;
  data.historyLogs = Array.isArray(data.historyLogs) ? data.historyLogs : [];
  const now = new Date().toISOString();
  const entityId = after.id || before?.id || "";
  const entityName = historyEntityName(entityType, after || before || {});
  fields.forEach((field) => {
    const oldValue = normalizeHistoryValue(before?.[field]);
    const newValue = normalizeHistoryValue(after?.[field]);
    if (historyValuesEqual(oldValue, newValue)) return;
    const log = {
      id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      entityType,
      entityId,
      entityName,
      fieldChanged: historyFieldLabels[field] || field,
      oldValue,
      newValue,
      modifiedBy: state.user?.id || "system",
      modifiedByName: state.user ? fullName(state.user) : "Système",
      modifiedByRole: state.user?.role || "system",
      createdAt: now
    };
    data.historyLogs.unshift(log);
    saveCollectionItemToFirestore("historyLogs", log);
  });
}

function recordHistoryDeletion(entityType, item) {
  if (!canRecordHistoryLog() || !item) return;
  data.historyLogs = Array.isArray(data.historyLogs) ? data.historyLogs : [];
  const log = {
    id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    entityType,
    entityId: item.id || "",
    entityName: historyEntityName(entityType, item),
    fieldChanged: "Suppression",
    oldValue: historyEntityName(entityType, item),
    newValue: "Supprimé",
    modifiedBy: state.user?.id || "system",
    modifiedByName: state.user ? fullName(state.user) : "Système",
    modifiedByRole: state.user?.role || "system",
    createdAt: new Date().toISOString()
  };
  data.historyLogs.unshift(log);
  saveCollectionItemToFirestore("historyLogs", log);
}

function selectedOutOfServiceVehicle() {
  const vehicles = data.vehicles || [];
  return vehicles.find((vehicle) => vehicle.id === state.outOfServiceVehicleId) || vehicles[0] || null;
}

function vehicleOutOfServiceSection() {
  const selected = selectedOutOfServiceVehicle();
  const active = activeOutOfServiceVehicles();
  if (!selected) return "";
  if (!canManageVehicleOutOfService()) {
    return `<article class="info-card">
      <h3>Véhicule hors service</h3>
      ${active.map((vehicle) => sectionRows([
        ["Numéro du bus", vehicle.busNumber],
        ["Numéro de circuit", vehicleCircuitLabel(vehicle)],
        ["Statut", "Hors service"],
        ["Date début", vehicle.outOfServiceStartDate],
        ["Date fin", vehicle.outOfServiceEndDate]
      ])).join("") || `<p class="muted">Aucun véhicule hors service.</p>`}
    </article>`;
  }
  return `<form class="edit-form" id="vehicle-out-service-form">
    <article class="info-card form-grid">
      <h3>Véhicule hors service</h3>
      <label>Sélectionner un véhicule
        <select id="out-of-service-vehicle-select" name="vehicleId">
          ${(data.vehicles || []).map((vehicle) => `<option value="${esc(vehicle.id)}" ${vehicle.id === selected.id ? "selected" : ""}>${esc(vehicle.busNumber || vehicle.id)} - ${esc(vehicle.schoolName || vehicle.circuitId || "Non renseigné")}</option>`).join("")}
        </select>
      </label>
      ${input("busNumber", "Numéro du bus", selected.busNumber || "", "text", true)}
      ${input("circuitNumber", "Numéro de circuit", vehicleCircuitLabel(selected), "text", true)}
      <label>Statut
        <select name="status">
          <option value="service" ${selected.isOutOfService ? "" : "selected"}>En service</option>
          <option value="out" ${selected.isOutOfService ? "selected" : ""}>Hors service</option>
        </select>
      </label>
      ${textArea("outOfServiceReason", "Raison du hors service", selected.outOfServiceReason || "")}
      ${input("outOfServiceStartDate", "Date début", selected.outOfServiceStartDate || "", "date")}
      ${input("outOfServiceEndDate", "Date fin si connue", selected.outOfServiceEndDate || "", "date")}
      ${textArea("outOfServiceMessage", "Message affiché aux utilisateurs", selected.outOfServiceMessage || "")}
      ${canTriggerSmsTransportAlert() ? `<label class="check-field"><input name="notifyParentsSms" type="checkbox" checked>Prévenir les parents par SMS si le trajet est annulé</label>` : ""}
    </article>
    <div class="form-actions"><button class="primary-button compact-action" type="submit">Enregistrer le statut</button></div>
  </form>
  <article class="info-card">
    <h3>Véhicules actuellement hors service</h3>
    <div class="quick-list-inner">
      ${active.map(vehicleOutOfServiceManageCard).join("") || `<p class="muted">Aucun véhicule hors service.</p>`}
    </div>
  </article>`;
}

function vehicleOutOfServiceManageCard(vehicle) {
  return `<article class="message-item">
    <strong>${esc(vehicle.busNumber || "Bus non renseigné")}</strong>
    ${sectionRows([
      ["Numéro de circuit", vehicleCircuitLabel(vehicle)],
      ["École", outOfServiceImpactedLabels(vehicle).schools],
      ["Raison", vehicle.outOfServiceReason],
      ["Date début", vehicle.outOfServiceStartDate],
      ["Date fin", vehicle.outOfServiceEndDate]
    ])}
    <div class="form-actions">
      <button class="secondary-button" type="button" data-select-out-service="${esc(vehicle.id)}">Modifier ce statut</button>
      <button class="primary-button compact-action" type="button" data-resolve-out-service="${esc(vehicle.id)}">Marquer comme résolu</button>
    </div>
  </article>`;
}

function vehicleOutOfServiceInfoSection(type, item) {
  if (type === "vehicles") {
    const vehicle = normalizeVehicleOutOfService(item);
    return section("Véhicule hors service", [
      ["Statut", vehicle.isOutOfService ? "Hors service" : "En service"],
      ["Numéro de circuit", vehicleCircuitLabel(vehicle)],
      ["Raison", vehicle.outOfServiceReason],
      ["Date début", vehicle.outOfServiceStartDate],
      ["Date fin", vehicle.outOfServiceEndDate],
      ["Message", vehicle.outOfServiceMessage]
    ]);
  }
  if (type === "circuits") {
    const vehicle = activeOutOfServiceVehicles().find((entry) => entry.id === item.vehicleId || entry.circuitId === item.name || entry.circuitId === item.id);
    if (!vehicle) return "";
    return vehicleOutOfServiceAlertsForRecord(vehicle);
  }
  return "";
}

function vehicleOutOfServiceAlertsForRecord(vehicle) {
  const labels = outOfServiceImpactedLabels(vehicle);
  return `<article class="pending-card vehicle-out-service-card">
    <div class="pending-head"><div><p class="eyebrow">Véhicule hors service</p><h3>Bus ${esc(vehicle.busNumber || "Non renseigné")} hors service</h3></div><b class="badge danger">Impacté</b></div>
    ${sectionRows([
      ["Circuit concerné", labels.circuits],
      ["École concernée", labels.schools],
      ["Raison", vehicle.outOfServiceReason],
      ["Date début", vehicle.outOfServiceStartDate],
      ["Date fin", vehicle.outOfServiceEndDate]
    ])}
  </article>`;
}

function genericListView(type) {
  const items = visibleCollection(type);
  const addLabel = type === "schools" ? "Ajouter une école" : "Ajouter";
  return `<section class="view-stack"><div class="section-title action-title"><div><p class="eyebrow">Gestion</p><h2>${esc(titleFor(type))}</h2></div>${canCreateGeneric(type) ? `<button class="primary-button compact-action" data-new-type="${esc(type)}">${esc(addLabel)}</button>` : ""}</div>${type === "vehicles" ? vehicleOutOfServiceSection() : ""}<div class="card-grid">${items.map((item) => `<button class="record-card" data-open-type="${esc(type)}" data-open-id="${esc(item.id)}"><div><strong>${esc(itemTitle(type, item))}</strong><span>${esc(itemDetail(type, item))}</span></div><small>${canEditGeneric(type, item) ? "Consulter / modifier" : "Consulter"}</small></button>`).join("") || `<article class="info-card"><p class="muted">Aucune donnée visible.</p></article>`}</div></section>`;
}

function genericDetailView(type, id) {
  const item = visibleCollection(type).find((entry) => entry.id === id);
  if (!item) return `<article class="info-card"><p>Fiche introuvable.</p></article>`;
  const rows = fieldsFor(type)
    .filter(([key]) => !(usesSpwIdentity() && type === "vehicles" && key === "licensePlate"))
    .filter(([key]) => !(usesSpwIdentity() && type === "drivers" && key === "licensePlate"))
    .map(([key, label]) => [label, Array.isArray(item[key]) ? item[key].join(", ") : item[key]]);
  return `<section class="view-stack"><div class="detail-head"><button class="icon-button" data-back title="Retour">‹</button><div><p class="eyebrow">${esc(titleFor(type))}</p><h2>${esc(itemTitle(type, item))}</h2></div>${canEditGeneric(type, item) ? `<div class="action-row"><button class="action-button as-button" data-edit-type="${esc(type)}" data-edit-id="${esc(id)}">Modifier</button>${canDeleteGeneric(type, item) ? `<button class="danger-button" data-delete-type="${esc(type)}" data-delete-id="${esc(id)}">Supprimer</button>` : ""}</div>` : ""}</div><div class="detail-grid">${section("Informations", rows)}${vehicleOutOfServiceInfoSection(type, item)}</div></section>`;
}

function genericEditView(type, id) {
  const item = id === "new" ? blankFor(type) : visibleCollection(type).find((entry) => entry.id === id);
  if (!item) return `<article class="info-card"><p>Fiche introuvable.</p></article>`;
  if (id !== "new" && !canEditGeneric(type, item)) return `<article class="info-card"><p>Modification non autorisée.</p></article>`;
  return `<section class="view-stack"><div class="detail-head"><button class="icon-button" data-cancel-generic title="Annuler">‹</button><div><p class="eyebrow">Edition</p><h2>${esc(titleFor(type))}</h2></div></div><form class="edit-form" id="generic-form" data-type="${esc(type)}" data-id="${esc(id)}"><article class="info-card form-grid"><h3>Informations</h3>${fieldsFor(type).filter(([key]) => !isGenericFieldHidden(type, key)).map(([key, label]) => fieldInputFor(type, key, label, Array.isArray(item[key]) ? item[key].join(", ") : item[key], isGenericFieldReadonly(type, key))).join("")}</article><div class="form-actions"><button class="primary-button compact-action" type="submit">Enregistrer</button><button class="secondary-button" type="button" data-cancel-generic>Annuler</button></div></form></section>`;
}

function isGenericFieldHidden(type, key) {
  return usesSpwIdentity() && type === "drivers" && key === "licensePlate";
}

function isGenericFieldReadonly(type, key) {
  if (type === "drivers" && key === "replacementDriverName" && !isAdmin()) return true;
  if (usesSpwIdentity() && type === "drivers" && !isPrimaryAdmin()) {
    return !["schoolCircuit", "schoolName"].includes(key);
  }
  return false;
}

function rowOpen(type, id, title, detail) {
  return `<button class="child-row" data-open-type="${esc(type)}" data-open-id="${esc(id)}" data-filter-result="1"><span>${esc(title)}</span><small>${esc(detail)}</small></button>`;
}

function titleFor(type) {
  if (type === "drivers" && state.user?.role === "assistant") return "Chauffeur";
  return { children: "Élèves", drivers: "Chauffeurs", assistants: "Convoyeuses", vehicles: "Véhicules", schools: "Écoles", circuits: "Circuits", users: "Utilisateurs", parents: "Parents" }[type] || type;
}

function itemTitle(type, item) {
  if (type === "vehicles") return item.busNumber || item.licensePlate || "Véhicule";
  if (type === "schools" || type === "circuits") return item.name || "Sans nom";
  return fullName(item);
}

function itemDetail(type, item) {
  if (type === "children") return `${item.pickupStop || ""} ${item.circuitNumber || ""}`.trim();
  if (type === "vehicles") return usesSpwIdentity() ? (item.schoolName || item.circuitId || "") : (item.licensePlate || item.schoolName || "");
  if (type === "schools") return item.phone || item.email || "";
  if (type === "circuits") return `${item.type || ""} ${item.schoolName || ""}`.trim();
  if (type === "users") return `${item.role || ""} ${(item.assignedCircuits || []).join(", ")}`.trim();
  if (type === "parents") return `${item.phone || ""} ${(item.linkedChildrenIds || []).join(", ")}`.trim();
  return item.phone || item.schoolCircuit || "";
}

function fieldsFor(type) {
  return {
    drivers: [["lastName", "Nom"], ["firstName", "Prénom"], ["phone", "Téléphone"], ["busNumber", "Numéro bus"], ["licensePlate", "Plaque"], ["schoolCircuit", "Circuit"], ["schoolName", "École"], ["replacementDriverName", "Chauffeur de remplacement"]],
    assistants: [["lastName", "Nom"], ["firstName", "Prénom"], ["phone", "Téléphone"], ["schoolCircuit", "Circuit"]],
    vehicles: [["busNumber", "Numéro bus"], ["licensePlate", "Plaque"], ["driverId", "Chauffeur"], ["assistantId", "Convoyeuse"], ["circuitId", "Circuit"], ["schoolName", "École"]],
    schools: [["name", "Nom"], ["managerName", "Nom du responsable"], ["address", "Adresse"], ["phone", "Téléphone"], ["email", "Adresse e-mail"], ["notes", "Notes"]],
    circuits: [["name", "Numéro de circuit"], ["schoolName", "École"], ["driverId", "Chauffeur"], ["assistantId", "Convoyeuse"], ["vehicleId", "Véhicule"], ["notes", "Notes"]]
  }[type] || [];
}

function canEditGeneric(type, item) {
  if (isSupportAssistanceSession()) return false;
  if (!item || !state.user) return false;
  if (isPrimaryAdmin()) return false;
  if (type === "assistants") return canManageAssistantAccounts();
  if (type === "schools" && isAdmin()) return true;
  if (isAdmin()) return true;
  const visible = visibleCollection(type).some((entry) => entry.id === item.id);
  if (!visible) return false;
  if (state.user.role === "driver") return ["drivers", "vehicles", "schools", "circuits"].includes(type);
  if (state.user.role === "assistant") return ["assistants", "circuits"].includes(type);
  return false;
}

function canCreateGeneric(type) {
  if (isSupportAssistanceSession()) return false;
  if (isPrimaryAdmin()) return false;
  if (type === "assistants") return canManageAssistantAccounts();
  if (type === "schools") return isAdmin();
  if (type === "drivers") return isTransportManagerUser();
  if (isAdmin()) return true;
  return state.user?.role === "assistant" && type === "circuits";
}

function canDeleteGeneric(type, item) {
  if (isSupportAssistanceSession()) return false;
  if (isPrimaryAdmin()) return false;
  if (type === "assistants") return canManageAssistantAccounts() && !!item;
  if (isAdmin() && !!item) return true;
  return false;
}

function blankFor(type) {
  const id = `${type}-${Date.now()}`;
  return {
    drivers: { id, firstName: "", lastName: "", phone: "", busNumber: "", licensePlate: "", schoolCircuit: "", schoolName: "", replacementDriverName: "" },
    assistants: { id, firstName: "", lastName: "", phone: "", schoolCircuit: "" },
    vehicles: { id, busNumber: "", licensePlate: "", driverId: "", assistantId: "", circuitId: "", schoolName: "", isOutOfService: false, outOfServiceReason: "", outOfServiceMessage: "", outOfServiceStartDate: "", outOfServiceEndDate: "", outOfServiceUpdatedBy: "", outOfServiceUpdatedAt: "", outOfServiceReadBy: [] },
    schools: { id, name: "", managerName: "", address: "", phone: "", email: "", notes: "" },
    circuits: { id, name: "", type: "", schoolName: "", driverId: "", assistantId: "", vehicleId: "", notes: "" }
  }[type];
}

function saveVehicleOutOfService(event) {
  event.preventDefault();
  if (!canManageVehicleOutOfService()) return alert("Action réservée au gestionnaire de transport principal.");
  const formData = new FormData(event.currentTarget);
  const vehicleId = formData.get("vehicleId");
  const vehicle = (data.vehicles || []).find((item) => item.id === vehicleId);
  if (!vehicle) return alert("Véhicule introuvable.");
  const before = cloneHistorySnapshot(vehicle);
  const nextStatus = formData.get("status") === "out";
  const statusChanged = vehicle.isOutOfService !== nextStatus;
  Object.assign(vehicle, {
    isOutOfService: nextStatus,
    outOfServiceReason: String(formData.get("outOfServiceReason") || "").trim(),
    outOfServiceMessage: String(formData.get("outOfServiceMessage") || "").trim(),
    outOfServiceStartDate: String(formData.get("outOfServiceStartDate") || "").trim(),
    outOfServiceEndDate: String(formData.get("outOfServiceEndDate") || "").trim(),
    outOfServiceUpdatedBy: state.user?.id || "",
    outOfServiceUpdatedAt: new Date().toISOString(),
    outOfServiceReadBy: statusChanged ? [] : (vehicle.outOfServiceReadBy || [])
  });
  if (nextStatus && statusChanged && event.currentTarget.elements.notifyParentsSms?.checked === true) {
    queueSmsAlerts("cancellation", childrenForVehicleService(vehicle), {
      circuitId: vehicleCircuitLabel(vehicle),
      message: vehicle.outOfServiceMessage || ""
    });
  }
  recordHistoryChanges("vehicles", before, vehicle);
  saveData();
  saveCollectionItemToFirestore("vehicles", vehicle);
  state.outOfServiceVehicleId = vehicle.id;
  render();
}

function resolveVehicleOutOfService(vehicleId) {
  if (!canManageVehicleOutOfService()) return alert("Action réservée au gestionnaire de transport principal.");
  const vehicle = (data.vehicles || []).find((item) => item.id === vehicleId);
  if (!vehicle) return alert("Véhicule introuvable.");
  if (!confirm("Confirmer le retour à la normale de ce véhicule ?")) return;
  const before = cloneHistorySnapshot(vehicle);
  Object.assign(vehicle, {
    isOutOfService: false,
    outOfServiceReason: "",
    outOfServiceMessage: "",
    outOfServiceEndDate: new Date().toISOString().slice(0, 10),
    outOfServiceUpdatedBy: state.user?.id || "",
    outOfServiceUpdatedAt: new Date().toISOString(),
    outOfServiceReadBy: [],
    outOfServiceResolvedAt: new Date().toISOString(),
    outOfServiceResolvedBy: state.user?.id || ""
  });
  recordHistoryChanges("vehicles", before, vehicle);
  saveData();
  saveCollectionItemToFirestore("vehicles", vehicle);
  state.outOfServiceVehicleId = vehicle.id;
  render();
}

function saveReplacementRule(event) {
  event.preventDefault();
  if (!canManageReplacementRules()) return alert("Action non autorisée.");
  const form = event.currentTarget;
  const formData = new FormData(form);
  const id = form.dataset.ruleId && form.dataset.ruleId !== "new" ? form.dataset.ruleId : `replacement-${Date.now()}`;
  const existing = (data.replacementRules || []).find((rule) => rule.id === id);
  const before = cloneHistorySnapshot(existing);
  const now = new Date().toISOString();
  const nextSignature = [
    String(formData.get("zone") || "").trim(),
    String(formData.get("inactiveCircuitId") || "").trim(),
    String(formData.get("primaryReplacementCircuitId") || "").trim(),
    String(formData.get("secondaryReplacementCircuitId") || "").trim(),
    String(formData.get("schoolId") || "").trim(),
    String(formData.get("message") || "").trim(),
    formData.has("isActive") ? "1" : "0"
  ].join("|");
  const previousSignature = existing ? [
    existing.zone || "",
    existing.inactiveCircuitId || "",
    existing.primaryReplacementCircuitId || "",
    existing.secondaryReplacementCircuitId || "",
    existing.schoolId || "",
    existing.message || "",
    existing.isActive === false ? "0" : "1"
  ].join("|") : "";
  const rule = {
    id,
    zone: String(formData.get("zone") || "").trim(),
    inactiveCircuitId: String(formData.get("inactiveCircuitId") || "").trim(),
    primaryReplacementCircuitId: String(formData.get("primaryReplacementCircuitId") || "").trim(),
    secondaryReplacementCircuitId: String(formData.get("secondaryReplacementCircuitId") || "").trim(),
    schoolId: String(formData.get("schoolId") || "").trim(),
    message: String(formData.get("message") || "").trim(),
    isActive: formData.has("isActive"),
    createdBy: existing?.createdBy || state.user.id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    readBy: existing && previousSignature === nextSignature ? (existing.readBy || []) : []
  };
  if (!rule.inactiveCircuitId || !rule.primaryReplacementCircuitId) return alert("Circuit absent et remplacement principal sont obligatoires.");
  data.replacementRules = data.replacementRules || [];
  const index = data.replacementRules.findIndex((item) => item.id === id);
  if (index >= 0) data.replacementRules[index] = rule;
  else data.replacementRules.unshift(rule);
  recordHistoryChanges("replacementRules", before, rule);
  state.editingReplacementRuleId = "";
  saveData();
  saveCollectionItemToFirestore("replacementRules", rule);
  render();
}

function deleteReplacementRule(id) {
  if (!canManageReplacementRules() || !confirm("Supprimer cette règle de remplacement ?")) return;
  const deleted = (data.replacementRules || []).find((rule) => rule.id === id);
  data.replacementRules = (data.replacementRules || []).filter((rule) => rule.id !== id);
  recordHistoryDeletion("replacementRules", deleted);
  if (state.editingReplacementRuleId === id) state.editingReplacementRuleId = "";
  saveData();
  deleteCollectionItemFromFirestore("replacementRules", id);
  render();
}

function acknowledgeReplacementRule(ruleId, options = {}) {
  const rule = (data.replacementRules || []).find((item) => item.id === ruleId);
  if (!rule || !state.user) return;
  rule.readBy = Array.isArray(rule.readBy) ? rule.readBy : [];
  if (!replacementRuleReadEntry(rule)) {
    rule.readBy.push({
      userId: state.user.id,
      role: state.user.role,
      readAt: new Date().toISOString()
    });
    saveData();
    saveCollectionItemToFirestore("replacementRules", rule);
  }
  if (!options.silent) render();
}

function acknowledgeVehicleOutOfService(vehicleId) {
  const vehicle = (data.vehicles || []).find((item) => item.id === vehicleId);
  if (!vehicle || !state.user) return;
  vehicle.outOfServiceReadBy = Array.isArray(vehicle.outOfServiceReadBy) ? vehicle.outOfServiceReadBy : [];
  if (!vehicleOutOfServiceReadEntry(vehicle)) {
    vehicle.outOfServiceReadBy.push({
      userId: state.user.id,
      role: state.user.role,
      readAt: new Date().toISOString()
    });
    saveData();
    saveCollectionItemToFirestore("vehicles", vehicle);
  }
  render();
}

function bindEvents() {
  bindSupportAssistanceReadOnlyGuard();
  document.querySelectorAll("[data-screen]").forEach((button) => button.addEventListener("click", () => {
    const nextScreen = button.dataset.screen;
    state.mobileMoreOpen = false;
    if (nextScreen === "sncbApp" && canAccessSncbApp()) {
      state.activeApp = "sncb";
      saveSession(state.user);
      return render();
    }
    state.screen = nextScreen;
    if (nextScreen === "dashboard") {
      resetDashboardContext();
      state.screen = "dashboard";
    } else {
      state.selectedChildId = "";
      state.editingChildId = "";
      state.selectedType = "";
      state.selectedId = "";
      state.editingType = "";
      state.editingId = "";
      state.editingAccessType = "";
      state.editingAccessId = "";
      state.search = "";
    }
    render();
  }));

  document.querySelectorAll("[data-mobile-more-toggle]").forEach((button) => button.addEventListener("click", () => {
    state.mobileMoreOpen = !state.mobileMoreOpen;
    render();
  }));

  document.querySelectorAll("[data-mobile-more-close]").forEach((button) => button.addEventListener("click", () => {
    state.mobileMoreOpen = false;
    render();
  }));

  document.querySelectorAll("[data-choose-app]").forEach((button) => button.addEventListener("click", () => chooseApplication(button.dataset.chooseApp)));
  document.querySelectorAll("[data-change-app]").forEach((button) => button.addEventListener("click", () => {
    state.activeApp = "";
    saveSession(state.user);
    render();
  }));
  document.querySelectorAll("[data-open-gts-app]").forEach((button) => button.addEventListener("click", () => {
    state.activeApp = "gts";
    state.screen = "dashboard";
    saveSession(state.user);
    render();
  }));
  document.querySelectorAll("[data-open-replacement-rules-dashboard]").forEach((button) => button.addEventListener("click", () => {
    state.screen = "transportGroup";
    state.transportGroupTab = "replacementRules";
    state.selectedChildId = "";
    state.selectedType = "";
    state.selectedId = "";
    render();
  }));

  document.querySelector("[data-dismiss-notifications]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    markCurrentNotificationsSeen();
    render();
  });

  document.querySelector(".notification-toast")?.addEventListener("click", (event) => {
    const nextScreen = event.currentTarget.dataset.notificationLink || "dashboard";
    markCurrentNotificationsSeen();
    state.screen = nextScreen;
    state.selectedChildId = "";
    state.selectedType = "";
    state.selectedId = "";
    state.editingChildId = "";
    state.editingType = "";
    state.editingId = "";
    render();
  });

  document.querySelectorAll("[data-parent-child]").forEach((button) => button.addEventListener("click", () => {
    state.parentChildId = button.dataset.parentChild;
    state.parentRequestChildId = "";
    state.search = "";
    markStudentIssuesRead(state.parentChildId);
    render();
  }));

  document.querySelectorAll("[data-parent-request]").forEach((button) => button.addEventListener("click", () => {
    state.parentRequestChildId = button.dataset.parentRequest;
    render();
  }));

  document.querySelectorAll("[data-open-message-child]").forEach((button) => button.addEventListener("click", () => {
    state.messageChildId = button.dataset.openMessageChild;
    markPrivateConversationRead(state.messageChildId);
    state.screen = "messages";
    render();
  }));
  document.querySelectorAll("[data-open-team-conversation]").forEach((button) => button.addEventListener("click", () => {
    state.selectedTeamConversationId = button.dataset.openTeamConversation;
    render();
  }));
  document.querySelectorAll("[data-open-direct-conversation]").forEach((button) => button.addEventListener("click", () => {
    state.selectedDirectConversationId = button.dataset.openDirectConversation;
    render();
  }));
  document.querySelectorAll("[data-transfer-delay-form]").forEach((form) => form.addEventListener("submit", saveTransferDelay));
  document.querySelectorAll("[data-resolve-transfer-delay]").forEach((button) => button.addEventListener("click", () => resolveTransferDelay(button.dataset.resolveTransferDelay)));
  document.querySelectorAll("[data-message-tab]").forEach((button) => button.addEventListener("click", () => {
    state.messagesTab = button.dataset.messageTab;
    state.editingAnnouncementId = "";
    render();
  }));

  document.querySelectorAll("[data-cancel-parent-request]").forEach((button) => button.addEventListener("click", () => {
    state.parentRequestChildId = "";
    render();
  }));

  document.querySelectorAll("[data-open-child]").forEach((button) => button.addEventListener("click", () => {
    state.selectedChildId = button.dataset.openChild;
    if (isParent()) state.parentChildId = button.dataset.openChild;
    markStudentIssuesRead(state.selectedChildId);
    state.editingChildId = "";
    state.selectedType = "";
    state.selectedId = "";
    state.editingType = "";
    state.editingId = "";
    state.screen = "children";
    state.search = "";
    render();
  }));

  document.querySelectorAll("[data-open-type]").forEach((button) => button.addEventListener("click", () => {
    const type = button.dataset.openType;
    const id = button.dataset.openId;
    if (isAdmin() && button.dataset.filterResult === "1" && !["users", "parents"].includes(type)) state.activeFilter = { type, id };
    if (isAdmin() && ["users", "parents"].includes(type)) {
      state.selectedChildId = "";
      state.selectedType = "";
      state.selectedId = "";
      state.editingChildId = "";
      state.editingType = "";
      state.editingId = "";
      state.editingAccessType = "";
      state.editingAccessId = "";
      state.accessCodesTab = type === "parents" ? "parents" : "users";
      state.screen = "users";
      state.search = "";
      render();
      return;
    }
    if (isAdmin() && button.dataset.filterResult === "1" && type === "drivers") {
      state.selectedChildId = "";
      state.selectedType = "";
      state.selectedId = "";
      state.editingChildId = "";
      state.editingType = "";
      state.editingId = "";
      state.screen = "dashboard";
      state.search = "";
      render();
      return;
    }
    if (type === "children") {
      state.selectedChildId = id;
      state.screen = "children";
    } else {
      state.selectedType = type;
      state.selectedId = id;
      state.screen = type;
    }
    state.editingChildId = "";
    state.editingType = "";
    state.search = "";
    render();
  }));

  document.querySelectorAll("[data-back]").forEach((button) => button.addEventListener("click", () => {
    state.selectedChildId = "";
    state.editingChildId = "";
    state.selectedType = "";
    state.selectedId = "";
    render();
  }));

  document.querySelectorAll("[data-edit-child]").forEach((button) => button.addEventListener("click", () => {
    state.editingChildId = button.dataset.editChild;
    state.selectedType = "";
    state.selectedId = "";
    render();
  }));

  document.querySelectorAll("[data-special-attention]").forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation();
    const child = childVisibleFromCurrentContext(button.dataset.specialAttention);
    if (!canSeeSpecialAttention(child)) return;
    alert(`Attention spéciale\n\nType : ${child.typeAttention || "information"}\nNiveau : ${child.niveauAttention || "information"}\n\n${child.noteAttention || "Aucune note renseignée."}`);
  }));

  document.querySelectorAll("[data-permission-explain]").forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation();
    alert(button.dataset.permissionExplain || "Aucun détail disponible.");
  }));

  document.querySelectorAll("[data-offline-retry]").forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation();
    retryOfflineConflicts();
  }));

  document.querySelectorAll("[data-offline-sync-now]").forEach((button) => button.addEventListener("click", async (event) => {
    event.stopPropagation();
    if (navigator.onLine === false) {
      alert("Connexion internet indisponible. La donnée sera envoyée dès que la connexion revient.");
      return;
    }
    offlineSyncNotice = "Envoi vers Firebase";
    await syncOfflineQueue();
    const remaining = loadOfflineQueue().filter((item) => item.status !== "synced");
    if (remaining.length) alert(`La synchronisation n’est pas terminée.\n\n${offlineConflictDetails()}`);
    render();
  }));

  document.querySelectorAll("[data-offline-details]").forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation();
    alert(`Données à vérifier\n\n${offlineConflictDetails()}`);
  }));

  document.querySelectorAll("[data-generate-child-pdf]").forEach((button) => button.addEventListener("click", () => {
    const child = childVisibleFromCurrentContext(button.dataset.generateChildPdf);
    if (!canGenerateChildPdf(child)) return alert("Génération PDF non autorisée.");
    openChildPdfPreview(child);
  }));

  document.querySelectorAll("[data-new-child]").forEach((button) => button.addEventListener("click", () => {
    state.editingChildId = "new";
    state.selectedChildId = "";
    render();
  }));

  document.querySelectorAll("[data-edit-type]").forEach((button) => button.addEventListener("click", () => {
    state.editingType = button.dataset.editType;
    state.editingId = button.dataset.editId;
    render();
  }));

  document.querySelectorAll("[data-new-type]").forEach((button) => button.addEventListener("click", () => {
    state.editingType = button.dataset.newType;
    state.editingId = "new";
    state.selectedType = "";
    state.selectedId = "";
    render();
  }));

  document.querySelectorAll("[data-delete-type]").forEach((button) => button.addEventListener("click", () => {
    if (!confirm("Supprimer cette fiche ?")) return;
    const type = button.dataset.deleteType;
    const item = visibleCollection(type).find((entry) => entry.id === button.dataset.deleteId);
    if (!canDeleteGeneric(type, item)) return;
    const deletedId = button.dataset.deleteId;
    rememberDeletedRecord(type, deletedId);
    data[type] = data[type].filter((entry) => entry.id !== deletedId);
    recordHistoryDeletion(type, item);
    saveData();
    deleteCollectionItemFromFirestore(type, deletedId);
    state.selectedType = "";
    state.selectedId = "";
    render();
  }));

  document.querySelectorAll("[data-delete-child]").forEach((button) => button.addEventListener("click", () => {
    const child = visibleChildren().find((entry) => entry.id === button.dataset.deleteChild);
    if (!canDeleteChild(child)) return;
    state.pendingDeleteChildId = button.dataset.deleteChild;
    render();
  }));
  document.getElementById("cancel-child-delete")?.addEventListener("click", () => {
    state.pendingDeleteChildId = "";
    render();
  });
  document.getElementById("confirm-child-delete")?.addEventListener("click", () => {
    const child = visibleChildren().find((entry) => entry.id === state.pendingDeleteChildId);
    if (!canDeleteChild(child)) {
      state.pendingDeleteChildId = "";
      return render();
    }
    const deletedId = child.id;
    rememberDeletedRecord("children", deletedId);
    data.children = data.children.filter((entry) => entry.id !== deletedId);
    recordHistoryDeletion("children", child);
    saveData();
    deleteChildFromFirestore(deletedId);
    state.pendingDeleteChildId = "";
    state.selectedChildId = "";
    state.editingChildId = "";
    if (state.activeFilter?.type === "children" && state.activeFilter.id === deletedId) state.activeFilter = null;
    render();
  });

  document.querySelectorAll("[data-cancel-edit]").forEach((button) => button.addEventListener("click", () => {
    state.editingChildId = "";
    render();
  }));

  document.querySelectorAll("[data-cancel-generic]").forEach((button) => button.addEventListener("click", () => {
    state.editingType = "";
    state.editingId = "";
    render();
  }));

  const form = document.getElementById("child-form");
  if (form) form.addEventListener("submit", saveChild);
  document.querySelectorAll("#parent-absence-form").forEach((absenceForm) => absenceForm.addEventListener("submit", saveParentAbsence));
  document.querySelectorAll("[data-student-issue-form]").forEach((form) => form.addEventListener("submit", saveStudentIssue));
  document.querySelectorAll("[data-student-issue-reply]").forEach((form) => form.addEventListener("submit", replyStudentIssue));
  document.querySelectorAll("[data-student-issue-status]").forEach((button) => button.addEventListener("click", () => updateStudentIssueStatus(button.dataset.studentIssueStatus, button.dataset.issueStatus)));
  const childBirthDate = document.querySelector("#child-form [name='birthDate']");
  if (childBirthDate) childBirthDate.addEventListener("input", updateComputedAgeField);
  const childTransferSelect = document.querySelector("#child-form [name='hasTransfer']");
  if (childTransferSelect) childTransferSelect.addEventListener("change", () => {
    const transferExtra = document.querySelector("#child-form [data-transfer-extra]");
    if (transferExtra) transferExtra.hidden = childTransferSelect.value !== "true";
  });
  bindTecStopAutocomplete();
  bindAddressAutocomplete();
  const genericForm = document.getElementById("generic-form");
  if (genericForm) genericForm.addEventListener("submit", saveGeneric);
  const outOfServiceForm = document.getElementById("vehicle-out-service-form");
  if (outOfServiceForm) outOfServiceForm.addEventListener("submit", saveVehicleOutOfService);
  document.querySelectorAll("[data-select-out-service]").forEach((button) => button.addEventListener("click", () => {
    state.outOfServiceVehicleId = button.dataset.selectOutService;
    render();
  }));
  document.querySelectorAll("[data-resolve-out-service]").forEach((button) => button.addEventListener("click", () => {
    resolveVehicleOutOfService(button.dataset.resolveOutService);
  }));
  const replacementRuleFormElement = document.getElementById("replacement-rule-form");
  if (replacementRuleFormElement) replacementRuleFormElement.addEventListener("submit", saveReplacementRule);
  const historyFilterForm = document.getElementById("history-filter-form");
  if (historyFilterForm) historyFilterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(historyFilterForm);
    state.historyFilterText = String(formData.get("historyFilterText") || "").trim();
    state.historyFilterEntityType = String(formData.get("historyFilterEntityType") || "all");
    state.historyFilterDate = String(formData.get("historyFilterDate") || "");
    render();
  });
  document.getElementById("clear-history-filters")?.addEventListener("click", () => {
    state.historyFilterText = "";
    state.historyFilterEntityType = "all";
    state.historyFilterDate = "";
    render();
  });
  document.getElementById("leave-request-form")?.addEventListener("submit", saveLeaveRequest);
  document.querySelectorAll("[data-transport-request-form]").forEach((form) => form.addEventListener("submit", saveTransportRequest));
  document.getElementById("vehicle-repair-form")?.addEventListener("submit", saveVehicleRepair);
  document.getElementById("anomaly-form")?.addEventListener("submit", saveAnomaly);
  document.querySelectorAll("[data-leave-action]").forEach((button) => button.addEventListener("click", () => updateLeaveRequestStatus(button.dataset.leaveId, button.dataset.leaveAction)));
  document.querySelectorAll("[data-request-status]").forEach((button) => button.addEventListener("click", () => updateRequestStatus(button.dataset.requestStatus, button.dataset.requestId, button.dataset.statusValue)));
  document.querySelectorAll("[data-print-request]").forEach((button) => button.addEventListener("click", () => openRequestPrintPreview(button.dataset.printRequest, button.dataset.printId)));
  document.querySelectorAll("[data-requests-tab]").forEach((button) => button.addEventListener("click", () => {
    state.requestsTab = button.dataset.requestsTab;
    state.requestsFilter = "all";
    render();
  }));
  document.querySelectorAll("[data-requests-filter]").forEach((button) => button.addEventListener("click", () => {
    state.requestsFilter = button.dataset.requestsFilter;
    render();
  }));
  document.querySelectorAll("[data-edit-replacement-rule]").forEach((button) => button.addEventListener("click", () => {
    state.editingReplacementRuleId = button.dataset.editReplacementRule;
    render();
  }));
  document.querySelectorAll("[data-delete-replacement-rule]").forEach((button) => button.addEventListener("click", () => deleteReplacementRule(button.dataset.deleteReplacementRule)));
  document.getElementById("out-of-service-vehicle-select")?.addEventListener("change", (event) => {
    state.outOfServiceVehicleId = event.target.value;
    render();
  });
  document.querySelectorAll("[data-ack-vehicle-oos]").forEach((button) => button.addEventListener("click", () => acknowledgeVehicleOutOfService(button.dataset.ackVehicleOos)));
  document.querySelectorAll("[data-ack-replacement-rule]").forEach((button) => button.addEventListener("click", () => acknowledgeReplacementRule(button.dataset.ackReplacementRule)));
  const createUser = document.getElementById("create-user-form");
  if (createUser) createUser.addEventListener("submit", createUserFromForm);
  document.getElementById("service-status-form")?.addEventListener("submit", saveServiceStatus);
  document.getElementById("print-support-access-codes")?.addEventListener("click", printSupportAccessCodesPdf);
  document.querySelectorAll("[data-print-support-access-type]").forEach((button) => button.addEventListener("click", () => {
    printSingleSupportAccessPdf(button.dataset.printSupportAccessType, button.dataset.printSupportAccessId);
  }));
  document.querySelectorAll("[data-print-access-card-type]").forEach((button) => button.addEventListener("click", () => {
    openAccessCardPrintPreview(button.dataset.printAccessCardType, button.dataset.printAccessCardId);
  }));
  const createAdmin = document.getElementById("create-admin-form");
  if (createAdmin) createAdmin.addEventListener("submit", createAdminFromForm);
  const parentChangeForm = document.getElementById("parent-change-form");
  if (parentChangeForm) parentChangeForm.addEventListener("submit", saveParentChangeRequest);
  const createParent = document.getElementById("create-parent-form");
  if (createParent) {
    createParent.addEventListener("submit", createParentFromForm);
    ["firstName", "lastName", "phone"].forEach((name) => {
      createParent.elements[name]?.addEventListener("input", () => autoFillParentStudentFromChildFile(createParent));
    });
    createParent.elements.linkedChildrenIds?.addEventListener("input", () => {
      createParent.elements.linkedChildrenIds.dataset.autofilled = "false";
      autoFillParentStudentFromChildFile(createParent);
    });
    createParent.elements.linkedChildrenIds?.addEventListener("change", () => {
      createParent.elements.linkedChildrenIds.dataset.autofilled = "false";
    });
    createParent.elements.studentLastName?.addEventListener("input", () => {
      createParent.elements.studentLastName.dataset.autofilled = "false";
      if (createParent.elements.linkedChildrenIds) createParent.elements.linkedChildrenIds.dataset.autofilled = "true";
      autoFillParentStudentFromChildFile(createParent);
    });
    autoFillParentStudentFromChildFile(createParent);
  }
  const accessPersonForm = document.getElementById("access-person-form");
  if (accessPersonForm) accessPersonForm.addEventListener("submit", saveAccessPerson);
  const ownCodeForm = document.getElementById("own-code-form");
  if (ownCodeForm) ownCodeForm.addEventListener("submit", saveOwnAccessCode);
  const assistantCircuitForm = document.getElementById("assistant-circuit-form");
  if (assistantCircuitForm) assistantCircuitForm.addEventListener("submit", saveAssistantCircuitSettings);
  const parentContactForm = document.getElementById("parent-contact-form");
  if (parentContactForm) parentContactForm.addEventListener("submit", saveParentContactSettings);
  const interfaceConfigForm = document.getElementById("interface-config-form");
  if (interfaceConfigForm) interfaceConfigForm.addEventListener("submit", saveInterfaceConfig);
  document.getElementById("reset-interface-config")?.addEventListener("click", resetInterfaceConfig);
  document.querySelectorAll("[data-edit-access-type]").forEach((button) => button.addEventListener("click", () => {
    state.editingAccessType = button.dataset.editAccessType;
    state.editingAccessId = button.dataset.editAccessId;
    render();
  }));
  document.querySelectorAll("[data-cancel-access-edit]").forEach((button) => button.addEventListener("click", () => {
    state.editingAccessType = "";
    state.editingAccessId = "";
    render();
  }));
  document.querySelectorAll("[data-access-tab]").forEach((button) => button.addEventListener("click", () => {
    state.accessCodesTab = button.dataset.accessTab;
    state.editingAccessType = "";
    state.editingAccessId = "";
    render();
  }));
  document.querySelectorAll("[data-settings-tab]").forEach((button) => button.addEventListener("click", () => {
    state.settingsTab = button.dataset.settingsTab;
    state.editingAccessType = "";
    state.editingAccessId = "";
    render();
  }));
  document.getElementById("generate-support-temp-access")?.addEventListener("click", createTemporarySupportAccess);
  document.querySelectorAll("[data-revoke-support-access]").forEach((button) => button.addEventListener("click", () => revokeTemporarySupportAccess(button.dataset.revokeSupportAccess)));
  document.querySelectorAll("[data-transport-group-tab]").forEach((button) => button.addEventListener("click", () => {
    state.transportGroupTab = button.dataset.transportGroupTab;
    state.selectedChildId = "";
    state.editingChildId = "";
    state.selectedType = "";
    state.selectedId = "";
    state.editingType = "";
    state.editingId = "";
    render();
  }));
  document.querySelectorAll("[data-security-group-tab]").forEach((button) => button.addEventListener("click", () => {
    state.securityGroupTab = button.dataset.securityGroupTab;
    state.editingAccessType = "";
    state.editingAccessId = "";
    render();
  }));
  document.querySelectorAll("[data-theme-choice]").forEach((button) => button.addEventListener("click", () => {
    saveThemePreference(button.dataset.themeChoice);
  }));
  document.querySelectorAll("[data-notification-choice]").forEach((button) => button.addEventListener("click", () => {
    saveNotificationPreference("notificationsEnabled", button.dataset.notificationChoice === "enabled");
  }));
  document.querySelectorAll("[data-notification-sound]").forEach((button) => button.addEventListener("click", () => {
    saveNotificationPreference("notificationSoundEnabled", button.dataset.notificationSound === "enabled");
  }));
  const supportRequestForm = document.getElementById("support-request-form");
  if (supportRequestForm) supportRequestForm.addEventListener("submit", createSupportRequest);
  document.querySelectorAll("[data-access-request-action]").forEach((button) => button.addEventListener("click", () => handleAccessRequestAction(button.dataset.accessRequestId, button.dataset.accessRequestAction)));
  document.querySelectorAll("[data-access-request-reply]").forEach((form) => form.addEventListener("submit", saveAccessRequestReply));
  const announcementFormElement = document.getElementById("announcement-form");
  if (announcementFormElement) announcementFormElement.addEventListener("submit", saveRoleAnnouncement);
  document.querySelectorAll("[data-edit-announcement]").forEach((button) => button.addEventListener("click", () => {
    state.editingAnnouncementId = button.dataset.editAnnouncement;
    render();
  }));
  document.querySelectorAll("[data-cancel-announcement]").forEach((button) => button.addEventListener("click", () => {
    state.editingAnnouncementId = "";
    render();
  }));
  document.querySelectorAll("[data-delete-announcement]").forEach((button) => button.addEventListener("click", () => deleteRoleAnnouncement(button.dataset.deleteAnnouncement)));
  document.querySelectorAll("[data-reset-parent-code]").forEach((button) => button.addEventListener("click", resetParentCode));
  document.querySelectorAll("[data-disable-parent]").forEach((button) => button.addEventListener("click", toggleParentAccess));
  document.querySelectorAll("[data-delete-parent]").forEach((button) => button.addEventListener("click", deleteParentAccess));
  document.querySelectorAll("[data-review-request]").forEach((button) => button.addEventListener("click", reviewParentRequest));
  document.querySelectorAll("[data-message-form]").forEach((form) => form.addEventListener("submit", sendMessage));
  document.querySelectorAll("[data-team-message-form]").forEach((form) => form.addEventListener("submit", sendTeamMessage));
  document.querySelectorAll("[data-direct-message-form]").forEach((form) => form.addEventListener("submit", sendDirectMessage));
  document.querySelectorAll("[data-direct-reply-form]").forEach((form) => form.addEventListener("submit", sendDirectReply));
  document.querySelectorAll("[data-delete-message-id]").forEach((button) => button.addEventListener("click", () => {
    deleteMessage(button.dataset.deleteMessageType, button.dataset.deleteMessageOwner, button.dataset.deleteMessageId);
  }));
  document.querySelectorAll("[data-support-filter]").forEach((button) => button.addEventListener("click", () => {
    state.supportFilter = button.dataset.supportFilter;
    state.selectedSupportRequestId = "";
    render();
  }));
  document.querySelectorAll("[data-open-support-request], [data-user-support-request]").forEach((button) => button.addEventListener("click", () => {
    state.selectedSupportRequestId = button.dataset.openSupportRequest || button.dataset.userSupportRequest;
    markSupportRequestRead(state.selectedSupportRequestId);
    render();
  }));
  document.querySelectorAll("[data-support-status]").forEach((button) => button.addEventListener("click", () => {
    updateSupportStatus(button.dataset.supportStatus, button.dataset.statusValue);
  }));
  document.querySelectorAll("[data-delete-support-request]").forEach((button) => button.addEventListener("click", () => {
    deleteSupportRequest(button.dataset.deleteSupportRequest);
  }));
  document.querySelectorAll("[data-support-message-form]").forEach((form) => form.addEventListener("submit", sendSupportMessage));
  const createUserRole = document.getElementById("create-user-role");
  if (createUserRole) {
    const syncAdminFields = () => {
      document.querySelector(".admin-hidden-fields")?.classList.toggle("is-hidden", ["admin", "support"].includes(createUserRole.value));
      document.querySelector(".driver-sncb-access-field")?.classList.toggle("is-hidden", createUserRole.value !== "driver");
      document.querySelector(".driver-association-field")?.classList.toggle("is-hidden", createUserRole.value !== "assistant");
    };
    createUserRole.addEventListener("change", syncAdminFields);
    syncAdminFields();
  }
  document.querySelectorAll("[data-reset-code]").forEach((button) => button.addEventListener("click", resetUserCode));
  document.querySelectorAll("[data-delete-user]").forEach((button) => button.addEventListener("click", deleteUser));
  document.querySelectorAll("[data-toggle-admin]").forEach((button) => button.addEventListener("click", toggleAdminAccess));
  document.querySelectorAll("[data-delete-admin]").forEach((button) => button.addEventListener("click", deleteAdmin));
  const driverPickerSearch = document.getElementById("driver-picker-search");
  if (driverPickerSearch) driverPickerSearch.addEventListener("input", () => {
    state.driverPickerSearch = driverPickerSearch.value;
    render();
    const next = document.getElementById("driver-picker-search");
    if (next) {
      next.focus();
      next.setSelectionRange(next.value.length, next.value.length);
    }
  });
  const driverSelect = document.getElementById("dashboard-driver-select");
  if (driverSelect) driverSelect.addEventListener("change", () => {
    if (driverSelect.value) {
      state.activeFilter = { type: "drivers", id: driverSelect.value };
    } else {
      state.activeFilter = null;
    }
    state.selectedChildId = "";
    state.selectedType = "";
    state.selectedId = "";
    state.editingChildId = "";
    state.editingType = "";
    state.editingId = "";
    state.search = "";
    state.screen = "dashboard";
    render();
  });
  const assistantSelect = document.getElementById("dashboard-assistant-select");
  if (assistantSelect) assistantSelect.addEventListener("change", () => {
    if (assistantSelect.value) {
      state.activeFilter = { type: "assistants", id: assistantSelect.value };
    } else {
      state.activeFilter = null;
    }
    state.selectedChildId = "";
    state.selectedType = "";
    state.selectedId = "";
    state.editingChildId = "";
    state.editingType = "";
    state.editingId = "";
    state.search = "";
    state.screen = "dashboard";
    render();
  });
  document.querySelectorAll("[data-pick-driver]").forEach((button) => button.addEventListener("click", () => {
    state.activeFilter = { type: "drivers", id: button.dataset.pickDriver };
    state.selectedChildId = "";
    state.selectedType = "";
    state.selectedId = "";
    state.editingChildId = "";
    state.editingType = "";
    state.editingId = "";
    state.search = "";
    state.screen = "dashboard";
    render();
  }));
  document.querySelectorAll("[data-pick-assistant]").forEach((button) => button.addEventListener("click", () => {
    state.activeFilter = { type: "assistants", id: button.dataset.pickAssistant };
    state.selectedChildId = "";
    state.selectedType = "";
    state.selectedId = "";
    state.editingChildId = "";
    state.editingType = "";
    state.editingId = "";
    state.search = "";
    state.screen = "dashboard";
    render();
  }));
  document.querySelectorAll("[data-pick-circuit]").forEach((button) => button.addEventListener("click", () => {
    state.activeFilter = { type: "circuits", id: button.dataset.pickCircuit };
    state.selectedChildId = "";
    state.selectedType = "";
    state.selectedId = "";
    state.editingChildId = "";
    state.editingType = "";
    state.editingId = "";
    state.search = "";
    state.screen = "dashboard";
    render();
  }));
  document.getElementById("clear-driver-search-button")?.addEventListener("click", () => {
    state.driverPickerSearch = "";
    render();
  });

  const search = document.getElementById("global-search");
  if (search) search.addEventListener("input", () => {
    state.search = search.value;
    render();
    const next = document.getElementById("global-search");
    if (next) {
      next.focus();
      next.setSelectionRange(next.value.length, next.value.length);
    }
  });

  document.getElementById("logout-button")?.addEventListener("click", logout);
  document.querySelectorAll("[data-dashboard-action]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.dashboardAction === "associated-children") {
      state.screen = "children";
      state.selectedChildId = "";
      state.editingChildId = "";
      state.selectedType = "";
      state.selectedId = "";
      state.search = "";
      render();
    }
    if (button.dataset.dashboardAction === "associated-assistants") {
      state.screen = "assistants";
      state.selectedChildId = "";
      state.editingChildId = "";
      state.selectedType = "";
      state.selectedId = "";
      state.search = "";
      render();
    }
    if (button.dataset.dashboardAction === "associated-schools") {
      state.screen = "schools";
      state.selectedChildId = "";
      state.editingChildId = "";
      state.selectedType = "";
      state.selectedId = "";
      state.search = "";
      render();
    }
    if (button.dataset.dashboardAction === "out-of-service-vehicles") {
      state.screen = "vehicles";
      state.outOfServiceVehicleId = activeOutOfServiceVehicles()[0]?.id || state.outOfServiceVehicleId || "";
      state.selectedChildId = "";
      state.editingChildId = "";
      state.selectedType = "";
      state.selectedId = "";
      state.search = "";
      render();
    }
  }));
  document.querySelectorAll("#reset-filter-button, #show-all-data-button").forEach((button) => button.addEventListener("click", () => {
    resetDashboardContext();
    state.screen = "dashboard";
    render();
  }));
}

function bindSupportAssistanceReadOnlyGuard() {
  if (!isSupportAssistanceSession()) return;
  const blockedButtonSelector = [
    "[data-edit-child]",
    "[data-new-child]",
    "[data-delete-child]",
    "[data-generate-child-pdf]",
    "[data-edit-type]",
    "[data-new-type]",
    "[data-delete-type]",
    "[data-reset-code]",
    "[data-delete-user]",
    "[data-toggle-admin]",
    "[data-delete-admin]",
    "[data-print-access-card-type]",
    "[data-print-support-access-type]",
    "[data-support-status]",
    "[data-delete-support-request]",
    "[data-delete-message-id]",
    "[data-leave-action]",
    "[data-request-status]",
    "[data-resolve-transfer-delay]",
    "[data-resolve-out-service]",
    "[data-edit-replacement-rule]",
    "[data-delete-replacement-rule]",
    "[data-revoke-support-access]",
    "#generate-support-temp-access"
  ].join(",");
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      supportAssistanceMutationBlocked();
    }, true);
  });
  document.querySelectorAll(blockedButtonSelector).forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      supportAssistanceMutationBlocked();
    }, true);
  });
}

function saveGeneric(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const type = form.dataset.type;
  const id = form.dataset.id;
  const current = id === "new" ? null : visibleCollection(type).find((entry) => entry.id === id);
  if (id !== "new" && !canEditGeneric(type, current)) return alert("Modification non autorisée.");
  if (id === "new" && !canCreateGeneric(type)) return alert("Création non autorisée.");
  const before = cloneHistorySnapshot(current);
  const item = id === "new" ? blankFor(type) : { ...current };
  fieldsFor(type).forEach(([key]) => {
    if (type === "drivers" && key === "replacementDriverName" && !isAdmin()) return;
    if (id !== "new" && isGenericFieldReadonly(type, key)) return;
    item[key] = form.elements[key]?.value || "";
  });
  if (type === "circuits" && state.user?.role === "assistant") syncAssistantCircuitEdit(item);
  if (type === "circuits") syncCircuitRelationsEdit(item);
  if (type === "assistants" && state.user?.role === "assistant") syncAssistantProfileEdit(item);
  item.updatedAt = new Date().toISOString();
  item.updatedBy = state.user.id;
  const index = data[type].findIndex((entry) => entry.id === item.id);
  if (index >= 0) data[type][index] = item;
  else data[type].push(item);
  if (type === "vehicles") syncVehicleCircuitEdit(item);
  recordHistoryChanges(type, before, item);
  saveData();
  saveCollectionItemToFirestore(type, item);
  state.editingType = "";
  state.editingId = "";
  if (state.activeFilter?.type === type) state.activeFilter = { type, id: item.id };
  state.selectedType = type;
  state.selectedId = item.id;
  render();
}

function syncAssistantCircuitEdit(circuit) {
  if (!circuit.name) return;
  circuit.assistantId = circuit.assistantId || state.user.id;
  const user = data.users.find((item) => item.id === state.user.id);
  const assistant = data.assistants.find((item) => item.id === state.user.id);
  [user, assistant, state.user].filter(Boolean).forEach((profile) => {
    const assigned = new Set(profile.assignedCircuits || []);
    assigned.add(circuit.name);
    profile.assignedCircuits = [...assigned];
    profile.schoolCircuit = profile.schoolCircuit || circuit.name;
    if (circuit.schoolName) profile.assignedSchool = profile.assignedSchool || circuit.schoolName;
    if (circuit.schoolName) profile.schoolName = profile.schoolName || circuit.schoolName;
    profile.updatedAt = new Date().toISOString();
    profile.updatedBy = state.user.id;
  });
  if (user) saveCollectionItemToFirestore("users", user);
  if (assistant) saveCollectionItemToFirestore("assistants", assistant);
  saveSession(state.user);
}

function syncCircuitRelationsEdit(circuit) {
  const driver = driverByRef(circuit.driverId);
  if (driver) circuit.driverId = driver.id;
  const vehicle = data.vehicles.find((item) => item.id === circuit.vehicleId || item.circuitId === circuit.name);
  if (vehicle) {
    vehicle.circuitId = circuit.name || vehicle.circuitId || "";
    vehicle.driverId = circuit.driverId || vehicle.driverId || "";
    vehicle.assistantId = circuit.assistantId || vehicle.assistantId || "";
    vehicle.schoolName = circuit.schoolName || vehicle.schoolName || "";
    vehicle.updatedAt = new Date().toISOString();
    vehicle.updatedBy = state.user.id;
    saveCollectionItemToFirestore("vehicles", vehicle);
  }
  data.children.forEach((child) => {
    if (child.circuitNumber !== circuit.name) return;
    child.driverId = circuit.driverId || child.driverId || "";
    child.assistantId = circuit.assistantId || child.assistantId || "";
    child.vehicleId = circuit.vehicleId || vehicle?.id || child.vehicleId || "";
    child.schoolName = circuit.schoolName || child.schoolName || "";
    child.updatedAt = new Date().toISOString();
    child.updatedBy = state.user.id;
    saveChildToFirestore(child);
  });
}

function syncAssistantProfileEdit(assistant) {
  assistant.assignedCircuits = assistant.assignedCircuits?.length ? assistant.assignedCircuits : [assistant.schoolCircuit].filter(Boolean);
  const user = data.users.find((item) => item.id === assistant.id);
  if (user) {
    user.firstName = assistant.firstName || user.firstName || "";
    user.lastName = assistant.lastName || user.lastName || "";
    user.phone = assistant.phone || user.phone || "";
    user.assignedCircuits = assistant.assignedCircuits;
    user.assignedSchool = assistant.schoolName || user.assignedSchool || "";
    user.updatedAt = new Date().toISOString();
    user.updatedBy = state.user.id;
    saveCollectionItemToFirestore("users", user);
  }
  if (assistant.id === state.user.id) {
    Object.assign(state.user, user || assistant);
    saveSession(state.user);
  }
}

function syncVehicleCircuitEdit(vehicle) {
  const requestedCircuit = String(vehicle.circuitId || "").trim();
  data.circuits.forEach((circuit) => {
    const isRequested = requestedCircuit && (circuit.name === requestedCircuit || circuit.id === requestedCircuit);
    if (circuit.vehicleId === vehicle.id && !isRequested) {
      circuit.vehicleId = "";
      circuit.updatedAt = vehicle.updatedAt;
      circuit.updatedBy = state.user.id;
      saveCollectionItemToFirestore("circuits", circuit);
    }
  });
  const circuit = data.circuits.find((item) => item.name === requestedCircuit || item.id === requestedCircuit);
  if (!circuit) {
    vehicle.circuitId = requestedCircuit;
    return;
  }
  vehicle.circuitId = circuit.name || requestedCircuit;
  vehicle.driverId = vehicle.driverId || circuit.driverId || "";
  vehicle.assistantId = vehicle.assistantId || circuit.assistantId || "";
  vehicle.schoolName = vehicle.schoolName || circuit.schoolName || "";
  circuit.vehicleId = vehicle.id;
  circuit.updatedAt = vehicle.updatedAt;
  circuit.updatedBy = state.user.id;
  saveCollectionItemToFirestore("circuits", circuit);
}

function saveRoleAnnouncement(event) {
  event.preventDefault();
  if (!isAdmin() || isPrimaryAdmin()) return;
  const form = event.currentTarget;
  const targetRole = form.dataset.targetRole;
  if (!["driver", "assistant"].includes(targetRole)) return;
  const id = form.dataset.announcementId === "new" ? `announcement-${Date.now()}` : form.dataset.announcementId;
  const existing = data.roleAnnouncements.find((item) => item.id === id);
  const before = cloneHistorySnapshot(existing);
  const now = new Date().toISOString();
  const announcement = existing || {
    id,
    targetRole,
    recipientType: "role_group",
    recipientIds: [targetRole],
    createdBy: state.user.id,
    createdByName: fullName(state.user),
    createdAt: now,
    readBy: []
  };
  announcement.title = form.elements.title.value.trim();
  announcement.content = form.elements.content.value.trim();
  announcement.targetRole = targetRole;
  announcement.important = form.elements.important.checked;
  announcement.updatedAt = now;
  if (!announcement.title || !announcement.content) return alert("Titre et contenu obligatoires.");
  if (!existing) data.roleAnnouncements.push(announcement);
  recordHistoryChanges("roleAnnouncements", before, announcement);
  saveData();
  saveRoleAnnouncementToFirestore(announcement);
  state.editingAnnouncementId = "";
  render();
}

function deleteRoleAnnouncement(id) {
  if (!isAdmin() || isPrimaryAdmin()) return;
  if (!confirm("Supprimer ce message général ?")) return;
  const deleted = (data.roleAnnouncements || []).find((announcement) => announcement.id === id);
  data.roleAnnouncements = (data.roleAnnouncements || []).filter((announcement) => announcement.id !== id);
  recordHistoryDeletion("roleAnnouncements", deleted);
  saveData();
  deleteRoleAnnouncementFromFirestore(id);
  state.editingAnnouncementId = "";
  render();
}

function validateCode(newCode, confirmCode) {
  if (!newCode) return "Code vide interdit.";
  if (!/^\d{4,}$/.test(newCode)) return "Le code doit contenir au minimum 4 chiffres.";
  if (newCode !== confirmCode) return "La confirmation est differente.";
  return "";
}

async function saveOwnAccessCode(event) {
  event.preventDefault();
  if (!["driver", "assistant", "support"].includes(state.user?.role)) return alert("Modification non autorisée.");
  const form = event.currentTarget;
  const user = data.users.find((item) => item.id === state.user.id && item.role === state.user.role);
  if (!user) return alert("Utilisateur introuvable.");
  const oldCode = form.elements.oldCode.value.trim();
  const newCode = form.elements.newCode.value.trim();
  const confirmCode = form.elements.confirmCode.value.trim();
  if (!await credentialMatches(user, oldCode, "personal")) return alert("Ancien code incorrect.");
  const error = validateCode(newCode, confirmCode);
  if (error) return alert(error);
  user.accessCodeHash = await hashSecret(newCode);
  user.passwordHash = user.accessCodeHash;
  user.accessCode = "";
  user.temporaryAccessHash = "";
  user.temporaryAccessCode = "";
  user.isTemporaryCode = false;
  user.firstLoginCompleted = true;
  user.resetRequired = false;
  user.passwordUpdatedAt = new Date().toISOString();
  user.accessCodeUpdatedAt = user.passwordUpdatedAt;
  user.updatedAt = new Date().toISOString();
  user.updatedBy = user.id;
  state.user = user;
  saveData();
  saveSession(user);
  saveCollectionItemToFirestore("users", user);
  alert("Code d’accès modifié.");
  render();
}

function baseRequestRecord(idPrefix, status = "pending") {
  const now = new Date().toISOString();
  return {
    id: `${idPrefix}-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    createdBy: state.user.id,
    createdByName: fullName(state.user),
    role: state.user.role,
    status,
    readBy: []
  };
}

function saveLeaveRequest(event) {
  event.preventDefault();
  if (state.user?.role !== "driver") return alert("Action réservée aux chauffeurs.");
  const form = event.currentTarget;
  const request = {
    ...baseRequestRecord("leave", "pending"),
    startDate: form.elements.startDate.value,
    endDate: form.elements.endDate.value,
    reason: form.elements.reason.value.trim()
  };
  if (!request.startDate || !request.endDate) return alert("Date début et date fin sont obligatoires.");
  data.leaveRequests.unshift(request);
  saveData();
  saveCollectionItemToFirestore("leaveRequests", request);
  alert("Demande de congé envoyée.");
  render();
}

function updateLeaveRequestStatus(id, status) {
  if (!isTransportManagerUser()) return alert("Validation réservée au gestionnaire de transport.");
  const request = data.leaveRequests.find((item) => item.id === id);
  if (!request) return;
  request.status = status;
  request.reviewedBy = state.user.id;
  request.reviewedAt = new Date().toISOString();
  request.updatedAt = request.reviewedAt;
  request.readBy = [];
  saveData();
  saveCollectionItemToFirestore("leaveRequests", request);
  render();
}

function saveTransportRequest(event) {
  event.preventDefault();
  if (!isTransportManagerUser()) return alert("Action réservée au gestionnaire de transport.");
  const form = event.currentTarget;
  const collection = form.dataset.transportRequestForm;
  const formData = new FormData(form);
  const request = {
    ...baseRequestRecord(collection === "poolTransport" ? "pool" : "extra", formData.get("status") || "scheduled"),
    school: String(formData.get("school") || "").trim(),
    date: String(formData.get("date") || "").trim(),
    departureTime: String(formData.get("departureTime") || "").trim(),
    returnTime: String(formData.get("returnTime") || "").trim(),
    studentCount: String(formData.get("studentCount") || "").trim(),
    studentList: String(formData.get("studentList") || "").trim(),
    companions: String(formData.get("companions") || "").trim(),
    poolLocation: String(formData.get("poolLocation") || "").trim(),
    destination: String(formData.get("destination") || "").trim(),
    tripType: String(formData.get("tripType") || "").trim(),
    responsibleContact: String(formData.get("responsibleContact") || "").trim(),
    driverId: String(formData.get("driverId") || "").trim(),
    vehicleId: String(formData.get("vehicleId") || "").trim(),
    notes: String(formData.get("notes") || "").trim()
  };
  data[collection].unshift(request);
  saveData();
  saveCollectionItemToFirestore(collection, request);
  render();
}

function saveVehicleRepair(event) {
  event.preventDefault();
  if (state.user?.role !== "driver") return alert("Action réservée aux chauffeurs.");
  const form = event.currentTarget;
  const vehicle = data.vehicles.find((item) => item.id === form.elements.vehicleId.value) || {};
  const request = {
    ...baseRequestRecord("repair", "reported"),
    vehicleId: form.elements.vehicleId.value,
    vehicleLabel: vehicle.busNumber || form.elements.vehicleId.value,
    category: form.elements.category.value,
    urgency: form.elements.urgency.value,
    description: form.elements.description.value.trim(),
    photoNotes: form.elements.photoNotes.value.trim(),
    reportedAt: new Date().toISOString(),
    followUp: ""
  };
  if (!request.description) return alert("Description obligatoire.");
  data.vehicleRepairs.unshift(request);
  saveData();
  saveCollectionItemToFirestore("vehicleRepairs", request);
  alert("Réparation signalée.");
  render();
}

function saveAnomaly(event) {
  event.preventDefault();
  if (state.user?.role !== "driver") return alert("Action réservée aux chauffeurs.");
  const form = event.currentTarget;
  const request = {
    ...baseRequestRecord("anomaly", "reported"),
    category: form.elements.category.value,
    description: form.elements.description.value.trim(),
    eventDate: form.elements.eventDate.value,
    eventTime: form.elements.eventTime.value,
    location: form.elements.location.value.trim(),
    childName: form.elements.childName.value.trim(),
    circuitNumber: form.elements.circuitNumber.value.trim(),
    important: form.elements.important.checked,
    photoNotes: form.elements.photoNotes.value.trim()
  };
  if (!request.description) return alert("Description obligatoire.");
  data.anomalies.unshift(request);
  saveData();
  saveCollectionItemToFirestore("anomalies", request);
  alert("Anomalie déclarée.");
  render();
}

function updateRequestStatus(collection, id, status) {
  if (!isTransportManagerUser()) return alert("Action réservée au gestionnaire de transport.");
  const item = (data[collection] || []).find((entry) => entry.id === id);
  if (!item) return;
  item.status = status;
  item.updatedAt = new Date().toISOString();
  item.updatedBy = state.user.id;
  saveData();
  saveCollectionItemToFirestore(collection, item);
  render();
}

function openRequestPrintPreview(collection, id) {
  const item = (data[collection] || []).find((entry) => entry.id === id);
  if (!item) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return alert("Autorisez les fenêtres pop-up pour générer le PDF.");
  const title = collection === "poolTransport" ? "Transport piscine" : "Transport extra-scolaire";
  const rows = Object.entries(item).filter(([key, value]) => !["id", "readBy"].includes(key) && value !== undefined && value !== null && String(value).trim() !== "");
  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html lang="fr-BE"><head><meta charset="UTF-8"><title>${esc(title)}</title><style>body{font-family:Arial,sans-serif;background:#eef5fb;margin:0}.page{max-width:860px;margin:auto;padding:24px}.toolbar{display:flex;gap:8px;justify-content:flex-end;margin-bottom:14px}button{border:0;border-radius:10px;padding:10px 12px;font-weight:800}.primary{background:#075b8f;color:white}section,header{background:white;border-radius:16px;padding:18px;margin-bottom:12px;border:1px solid #d6e4ef}header{background:#075b8f;color:white}.row{display:grid;grid-template-columns:190px 1fr;gap:12px;border-top:1px solid #edf3f7;padding:8px 0}.label{font-weight:900;color:#587082}@media print{.toolbar{display:none}body{background:white}}</style></head><body><main class="page"><div class="toolbar"><button class="primary" onclick="window.print()">Télécharger / imprimer PDF</button><button onclick="navigator.share?navigator.share({title:document.title,text:'${esc(title)}'}):window.print()">Exporter / partager</button></div><header><p>Gestion Transport Scolaire</p><h1>${esc(title)}</h1><p>Généré le ${esc(formatDateTime(new Date().toISOString()))}</p></header><section>${rows.map(([key, value]) => `<div class="row"><span class="label">${esc(key)}</span><span>${esc(String(displayValue(value)))}</span></div>`).join("")}</section></main></body></html>`);
  printWindow.document.close();
}

function saveAssistantCircuitSettings(event) {
  event.preventDefault();
  if (state.user?.role !== "assistant") return alert("Modification non autorisée.");
  const form = event.currentTarget;
  const assignedCircuits = form.elements.assignedCircuits.value.split(",").map((value) => value.trim()).filter(Boolean);
  if (!assignedCircuits.length) return alert("Indiquez au moins un circuit.");
  const user = data.users.find((item) => item.id === state.user.id && item.role === "assistant");
  const assistant = data.assistants.find((item) => item.id === state.user.id);
  if (!user || !assistant) return alert("Convoyeuse introuvable.");
  user.assignedCircuits = assignedCircuits;
  user.assignedSchool = [...new Set(data.circuits.filter((circuit) => assignedCircuits.includes(circuit.name) || assignedCircuits.includes(circuit.id)).map((circuit) => circuit.schoolName).filter(Boolean))].join(", ") || user.assignedSchool || "";
  user.updatedAt = new Date().toISOString();
  user.updatedBy = state.user.id;
  assistant.schoolCircuit = assignedCircuits[0] || assistant.schoolCircuit || "";
  assistant.assignedCircuits = assignedCircuits;
  assistant.schoolName = user.assignedSchool || assistant.schoolName || "";
  assistant.updatedAt = user.updatedAt;
  assistant.updatedBy = state.user.id;
  data.circuits.forEach((circuit) => {
    if (assignedCircuits.includes(circuit.name) || assignedCircuits.includes(circuit.id)) {
      circuit.assistantId = assistant.id;
      circuit.updatedAt = user.updatedAt;
      circuit.updatedBy = state.user.id;
      saveCollectionItemToFirestore("circuits", circuit);
    }
  });
  data.vehicles.forEach((vehicle) => {
    if (assignedCircuits.includes(vehicle.circuitId)) {
      vehicle.assistantId = assistant.id;
      user.assignedVehicleId = user.assignedVehicleId || vehicle.id;
      vehicle.updatedAt = user.updatedAt;
      vehicle.updatedBy = state.user.id;
      saveCollectionItemToFirestore("vehicles", vehicle);
    }
  });
  data.children.forEach((child) => {
    if (assignedCircuits.includes(child.circuitNumber)) {
      child.assistantId = assistant.id;
      child.updatedAt = user.updatedAt;
      child.updatedBy = state.user.id;
      saveChildToFirestore(child);
    }
  });
  state.user = user;
  saveSession(user);
  saveData();
  saveCollectionItemToFirestore("users", user);
  saveCollectionItemToFirestore("assistants", assistant);
  alert("Circuit mis à jour.");
  render();
}

function saveThemePreference(value) {
  const theme = ["light", "dark", "auto"].includes(value) ? value : "auto";
  localStorage.setItem(THEME_KEY, theme);
  if (state.user) {
    const collection = state.user.role === "parent" ? "parents" : "users";
    const record = data[collection].find((item) => item.id === state.user.id);
    if (record) {
      record.themePreference = theme;
      record.updatedAt = new Date().toISOString();
      state.user = record;
      saveSession(record);
      saveData();
      saveCollectionItemToFirestore(collection, record);
    }
  }
  applyThemePreference();
  render();
}

function saveServiceStatus(event) {
  event.preventDefault();
  if (!isAdmin()) return alert("Modification réservée au gestionnaire de transport.");
  const form = event.currentTarget;
  const status = form.elements.status.value;
  const meta = serviceStatusMeta(status);
  data.serviceStatus = {
    id: "current",
    status,
    message: form.elements.message.value.trim() || meta.short,
    autoMode: false,
    lastCheckedAt: data.serviceStatus?.lastCheckedAt || "",
    updatedAt: new Date().toISOString(),
    updatedBy: state.user?.id || ""
  };
  saveData();
  saveServiceStatusToFirestore(data.serviceStatus);
  alert("État des services mis à jour.");
  render();
}

function saveParentContactSettings(event) {
  event.preventDefault();
  if (!isAdmin() || isPrimaryAdmin()) return alert("Modification réservée au gestionnaire de transport.");
  const form = event.currentTarget;
  data.parentContact = {
    title: form.elements.title.value.trim() || "Contact transport scolaire",
    phone: form.elements.phone.value.trim(),
    email: form.elements.email.value.trim(),
    address: form.elements.address.value.trim(),
    openingHours: form.elements.openingHours.value.trim(),
    message: form.elements.message.value.trim(),
    updatedAt: new Date().toISOString(),
    updatedBy: state.user.id
  };
  saveData();
  saveParentContactToFirestore(data.parentContact);
  alert("Contact parent mis à jour.");
  render();
}

function saveAccessPerson(event) {
  event.preventDefault();
  if (!isAdmin() || isPrimaryAdmin()) return;
  const form = event.currentTarget;
  const type = form.dataset.accessType;
  const id = form.dataset.accessId;
  const person = type === "parents"
    ? data.parents.find((item) => item.id === id)
    : data.users.find((item) => item.id === id);
  if (!person) return alert("Personne introuvable.");
  if (type !== "parents" && !canManageUserAccess(person)) return alert("Action non autorisée pour ce compte.");
  const linkedBefore = type !== "parents" ? cloneHistorySnapshot(linkedAccessRecord(person)) : null;
  const identifierNumber = form.elements.identifierNumber?.value.trim() || defaultIdentifierForUser(person);
  if (type !== "parents") {
    const duplicateIdentifier = data.users.find((item) =>
      item.id !== id &&
      item.role === person.role &&
      normalizeLoginValue(item.identifierNumber) === normalizeLoginValue(identifierNumber)
    );
    if (duplicateIdentifier) return alert("Ce numéro identifiant est déjà utilisé pour ce rôle.");
  }

  person.lastName = form.elements.lastName.value.trim();
  person.firstName = form.elements.firstName.value.trim();
  person.phone = form.elements.phone?.value.trim() || "";
  person.email = form.elements.email?.value.trim() || "";
  if (type !== "parents") person.identifierNumber = person.id === "admin" ? "6183" : identifierNumber;
  if (type !== "parents") person.identifier = person.identifierNumber;
  if (type !== "parents") person.username = person.identifierNumber;
  if (person.role === "admin" && form.elements.isActive) {
    if (person.id === "admin" && !form.elements.isActive.checked) {
      return alert("Le gestionnaire de transport principal doit rester actif.");
    }
    if (!form.elements.isActive.checked && activeAdminCount() <= 1 && person.isActive !== false) {
      return alert("Impossible de désactiver le seul gestionnaire de transport actif.");
    }
    person.companyName = form.elements.companyName?.value.trim() || "";
    delete person.accessLastName;
    delete person.accessFirstName;
    person.assignedCircuits = [];
    person.assignedVehicleId = "";
    person.assignedSchool = "";
    person.isActive = form.elements.isActive.checked;
    person.visualTheme = form.elements.visualThemeSpw?.checked ? "spw" : "";
    person.createdBy = form.elements.createdBy?.value.trim() || person.createdBy || "";
    person.createdAt = form.elements.createdAt?.value || person.createdAt || new Date().toISOString();
  }
  person.updatedAt = new Date().toISOString();
  person.updatedBy = state.user.id;

  if (type === "parents") {
    person.linkedChildrenIds = selectedChildIdsFromField(form.elements.linkedChildrenIds);
    person.studentLastNameIdentifier = parentStudentIdentifier(person);
    person.username = person.studentLastNameIdentifier || person.lastName || "";
    person.loginChildName = person.studentLastNameIdentifier || person.username || "";
    syncParentLinks(person);
    saveCollectionItemToFirestore("parents", person);
    person.linkedChildrenIds.forEach((childId) => {
      const child = data.children.find((item) => item.id === childId);
      if (child) saveChildToFirestore(child);
    });
  } else {
    syncUserLinkedRecord(person, form);
    saveCollectionItemToFirestore("users", person);
    const linked = linkedAccessRecord(person);
    if (linked) {
      const linkedType = person.role === "driver" ? "drivers" : "assistants";
      recordHistoryChanges(linkedType, linkedBefore, linked);
      saveCollectionItemToFirestore(linkedType, linked);
    }
  }

  saveData();
  if (state.user.id === person.id) {
    state.user = person;
    saveSession(person);
  }
  state.editingAccessType = "";
  state.editingAccessId = "";
  render();
}

function syncUserLinkedRecord(user, form) {
  if (user.role === "driver") {
    user.assignedVehicleId = form.elements.assignedVehicleId?.value.trim() || "";
    user.assignedCircuits = form.elements.assignedCircuits.value.split(",").map((value) => value.trim()).filter(Boolean);
    user.assignedSchool = form.elements.assignedSchool.value.trim();
    user.hasSncbReplacementAccess = form.elements.hasSncbReplacementAccess?.checked === true;
    let driver = data.drivers.find((item) => item.id === user.id);
    if (!driver) {
      driver = { id: user.id, firstName: "", lastName: "", phone: "", busNumber: "", licensePlate: "", schoolCircuit: "", schoolName: "" };
      data.drivers.push(driver);
    }
    driver.firstName = user.firstName;
    driver.lastName = user.lastName;
    driver.phone = user.phone;
    driver.hasSncbReplacementAccess = user.hasSncbReplacementAccess;
    driver.schoolCircuit = user.assignedCircuits[0] || driver.schoolCircuit || "";
    driver.schoolName = user.assignedSchool || driver.schoolName || "";
    if (user.assignedVehicleId) {
      const vehicle = data.vehicles.find((item) => item.id === user.assignedVehicleId);
      if (vehicle) {
        vehicle.driverId = user.id;
        saveCollectionItemToFirestore("vehicles", vehicle);
      }
    }
    data.circuits.forEach((circuit) => {
      if (user.assignedCircuits.includes(circuit.name) || user.assignedCircuits.includes(circuit.id)) {
        circuit.driverId = user.id;
        if (user.assignedVehicleId) circuit.vehicleId = user.assignedVehicleId;
        if (user.assignedSchool) circuit.schoolName = user.assignedSchool;
        saveCollectionItemToFirestore("circuits", circuit);
      }
    });
  }
  if (user.role === "assistant") {
    user.assignedCircuits = form.elements.assignedCircuits.value.split(",").map((value) => value.trim()).filter(Boolean);
    user.assignedSchool = form.elements.assignedSchool.value.trim();
    const rawDriverRef = form.elements.driverId?.value.trim() || "";
    const driverId = driverByRef(rawDriverRef)?.id || rawDriverRef;
    let assistant = data.assistants.find((item) => item.id === user.id);
    if (!assistant) {
      assistant = { id: user.id, firstName: "", lastName: "", phone: "", schoolCircuit: "" };
      data.assistants.push(assistant);
    }
    assistant.firstName = user.firstName;
    assistant.lastName = user.lastName;
    assistant.phone = user.phone;
    assistant.schoolCircuit = user.assignedCircuits[0] || assistant.schoolCircuit || "";
    assistant.schoolName = user.assignedSchool || assistant.schoolName || "";
    assistant.driverId = driverId;
    data.vehicles.forEach((vehicle) => {
      if (vehicle.driverId === driverId || user.assignedCircuits.includes(vehicle.circuitId)) {
        vehicle.assistantId = user.id;
        saveCollectionItemToFirestore("vehicles", vehicle);
      }
    });
    data.circuits.forEach((circuit) => {
      if (user.assignedCircuits.includes(circuit.name) || user.assignedCircuits.includes(circuit.id)) {
        circuit.assistantId = user.id;
        if (driverId) circuit.driverId = driverId;
        if (user.assignedSchool) circuit.schoolName = user.assignedSchool;
        saveCollectionItemToFirestore("circuits", circuit);
      }
    });
  }
}

async function createAdminFromForm(event) {
  event.preventDefault();
  if (!isAdmin() || isPrimaryAdmin()) return;
  const form = event.currentTarget;
  const temporaryCode = generateUniqueAccessCode();
  const visualTheme = form.elements.visualThemeSpw.checked ? "spw" : "";
  const identifierNumber = generateUniqueIdentifier("admin", { visualTheme });
  const now = new Date().toISOString();
  const admin = {
    id: `admin-${Date.now()}`,
    role: "admin",
    username: identifierNumber,
    identifier: identifierNumber,
    companyName: form.elements.companyName.value.trim(),
    identifierNumber,
    firstName: form.elements.firstName.value.trim(),
    lastName: form.elements.lastName.value.trim(),
    phone: form.elements.phone.value.trim(),
    email: form.elements.email.value.trim(),
    ...generatedTemporaryAccessData(temporaryCode, now),
    temporaryAccessHash: await hashSecret(temporaryCode),
    accessCodeHash: "",
    passwordHash: "",
    recoveryCodeHash: "",
    recoveryAnswerHash: "",
    firstLoginCompleted: false,
    resetRequired: true,
    assignedCircuits: [],
    assignedVehicleId: "",
    assignedSchool: "",
    visualTheme,
    isActive: form.elements.isActive.checked,
    createdBy: state.user.id,
    createdAt: now,
    updatedAt: now
  };
  data.users.push(admin);
  saveData();
  saveCollectionItemToFirestore("users", admin);
  alert(`Gestionnaire de transport créé.\nIdentifiant : ${identifierNumber}\nCode temporaire : ${temporaryCode}`);
  render();
}

function activeAdminCount() {
  return data.users.filter((user) => user.role === "admin" && user.isActive !== false).length;
}

function toggleAdminAccess(event) {
  if (!isAdmin() || isPrimaryAdmin()) return;
  const admin = data.users.find((user) => user.id === event.currentTarget.dataset.toggleAdmin && user.role === "admin");
  if (!admin) return alert("Gestionnaire de transport introuvable.");
  const nextActive = admin.isActive === false;
  if (admin.id === "admin" && !nextActive) return alert("Le gestionnaire de transport principal doit rester actif.");
  if (!nextActive && activeAdminCount() <= 1) return alert("Impossible de désactiver le seul gestionnaire de transport actif.");
  admin.isActive = nextActive;
  admin.updatedAt = new Date().toISOString();
  admin.updatedBy = state.user.id;
  saveData();
  saveCollectionItemToFirestore("users", admin);
  render();
}

function deleteAdmin(event) {
  if (!isAdmin() || isPrimaryAdmin()) return;
  const id = event.currentTarget.dataset.deleteAdmin;
  const admin = data.users.find((user) => user.id === id && user.role === "admin");
  if (!admin) return alert("Gestionnaire de transport introuvable.");
  if (!canRemoveAdmin(admin)) return alert("Impossible de supprimer ce gestionnaire de transport.");
  if (!confirm("Supprimer ce gestionnaire de transport ?")) return;
  rememberDeletedRecord("users", id);
  data.users = data.users.filter((user) => user.id !== id);
  saveData();
  deleteCollectionItemFromFirestore("users", id);
  render();
}

async function createUserFromForm(event) {
  event.preventDefault();
  if (!isAdmin() || isPrimaryAdmin()) return;
  const form = event.currentTarget;
  const temporaryCode = generateUniqueAccessCode();
  const role = form.elements.role.value;
  if (isSpwAccount() && role !== "assistant") return alert("Le SPW peut créer uniquement des accès convoyeuse.");
  if (role === "driver" && !isTransportManagerUser()) return alert("Seul le gestionnaire de transport peut créer un chauffeur.");
  if (role === "assistant" && !canManageAssistantAccounts()) return alert("Seul le SPW peut créer une convoyeuse.");
  const identifierNumber = generateUniqueIdentifier(role);
  const now = new Date().toISOString();
  const id = `${role}-${Date.now()}`;
  const user = {
    id,
    firstName: form.elements.firstName.value.trim(),
    lastName: form.elements.lastName.value.trim(),
    role,
    identifier: identifierNumber,
    identifierNumber,
    username: identifierNumber,
    ...generatedTemporaryAccessData(temporaryCode, now),
    temporaryAccessHash: await hashSecret(temporaryCode),
    accessCodeHash: "",
    passwordHash: "",
    firstLoginCompleted: false,
    resetRequired: true,
    assignedCircuits: ["admin", "support"].includes(role) ? [] : form.elements.assignedCircuits.value.split(",").map((value) => value.trim()).filter(Boolean),
    assignedVehicleId: ["admin", "support"].includes(role) ? "" : form.elements.assignedVehicleId.value.trim(),
    assignedSchool: ["admin", "support"].includes(role) ? "" : form.elements.assignedSchool.value.trim(),
    hasSncbReplacementAccess: role === "driver" && form.elements.hasSncbReplacementAccess?.checked === true,
    isActive: true,
    createdBy: state.user.id,
    createdAt: now,
    updatedAt: now
  };
  data.users.push(user);
  if (["driver", "assistant"].includes(role)) {
    syncUserLinkedRecord(user, form);
  }
  saveData();
  saveCollectionItemToFirestore("users", user);
  const linked = linkedAccessRecord(user);
  if (linked) {
    const linkedType = role === "driver" ? "drivers" : "assistants";
    recordHistoryChanges(linkedType, null, linked);
    saveCollectionItemToFirestore(linkedType, linked);
  }
  alert(`Utilisateur créé.\nIdentifiant : ${identifierNumber}\nCode temporaire : ${temporaryCode}`);
  render();
}

async function resetUserCode(event) {
  if (!isAdmin() || isPrimaryAdmin()) return;
  const user = data.users.find((item) => item.id === event.currentTarget.dataset.resetCode);
  if (!user) return alert("Utilisateur introuvable.");
  if (!canManageUserAccess(user)) return alert("Action non autorisée pour ce compte.");
  const temporaryCode = generateUniqueAccessCode();
  Object.assign(user, generatedTemporaryAccessData(temporaryCode));
  user.temporaryAccessHash = await hashSecret(temporaryCode);
  user.accessCodeHash = "";
  user.passwordHash = "";
  user.recoveryCodeHash = "";
  user.recoveryAnswerHash = "";
  user.firstLoginCompleted = false;
  user.resetRequired = true;
  user.updatedAt = new Date().toISOString();
  user.updatedBy = state.user.id;
  recordSecurityLog(user, "temporary_code_generated", "success");
  saveData();
  saveCollectionItemToFirestore("users", user);
  alert(`Accès réinitialisé.\nIdentifiant : ${user.identifierNumber || defaultIdentifierForUser(user)}\nCode temporaire : ${temporaryCode}`);
  render();
}

function deleteUser(event) {
  if (!isAdmin() || isPrimaryAdmin()) return;
  const id = event.currentTarget.dataset.deleteUser;
  if (id === state.user.id) return alert("Impossible de supprimer l’utilisateur connecté.");
  const user = data.users.find((item) => item.id === id);
  if (!canManageUserAccess(user)) return alert("Action non autorisée pour ce compte.");
  if (user?.role === "admin" && !canRemoveAdmin(user)) return alert("Impossible de supprimer ce gestionnaire de transport.");
  if (!confirm("Supprimer cet utilisateur ?")) return;
  rememberDeletedRecord("users", id);
  data.users = data.users.filter((user) => user.id !== id);
  saveData();
  deleteCollectionItemFromFirestore("users", id);
  render();
}

function formHasAnyPrefix(form, prefix) {
  for (const key of form.keys()) {
    if (String(key).startsWith(prefix)) return true;
  }
  return false;
}

function saveChild(event) {
  event.preventDefault();
  const child = state.editingChildId === "new" ? blankChild() : data.children.find((item) => item.id === state.editingChildId);
  if (!child) return;
  if (state.editingChildId === "new" && !canCreateChild()) return alert("Création non autorisée.");
  if (state.editingChildId !== "new" && !canManageChild(child)) return;
  const before = state.editingChildId === "new" ? null : cloneHistorySnapshot(child);
  const form = new FormData(event.currentTarget);
  const firstName = String(form.get("firstName") || "").trim();
  const lastName = String(form.get("lastName") || "").trim();
  const birthDate = String(form.get("birthDate") || "").trim();
  if (!firstName) return alert("Le prénom de l’élève est obligatoire.");
  if (!lastName) return alert("Le nom de l’élève est obligatoire.");
  if (!birthDate) return alert("La date de naissance de l’élève est obligatoire.");
  const duplicateChild = (data.children || []).find((item) =>
    item.id !== child.id &&
    normalizeTextSearch(item.firstName) === normalizeTextSearch(firstName) &&
    normalizeTextSearch(item.lastName) === normalizeTextSearch(lastName) &&
    String(item.birthDate || "") === birthDate
  );
  if (duplicateChild) {
    return alert(`Doublon possible : ${fullName(duplicateChild)} existe déjà avec la même date de naissance.`);
  }
  [
    "lastName", "firstName", "birthDate", "schoolName", "circuitNumber",
    "streetName", "streetNumber", "postalCode", "city", "phone",
    "pickupStop", "transferVehicleId",
    "transferLocation", "transferDriverId", "transferAssistantId", "transferCircuitId", "transferSchoolCircuitId",
    "transportStatus", "exclusionType", "exclusionReason", "exclusionStartDate", "exclusionEndDate",
    "schoolPhone", "schoolEmail", "schoolAddress", "schoolNotes"
  ].forEach((key) => {
    if (form.has(key)) child[key] = String(form.get(key) || "").trim();
  });
  if (form.has("autonomyStatus")) child.autonomyStatus = String(form.get("autonomyStatus") || "").trim();
  child.homeAddress = [child.streetName, child.streetNumber].filter(Boolean).join(" ");
  child.street = child.streetName || "";
  child.houseNumber = child.streetNumber || "";
  child.age = age(child.birthDate);
  const rawPickupCircuit = String(form.get("pickupCircuitId") || "").trim();
  const rawSchoolCircuit = String(form.get("schoolCircuitId") || "").trim();
  const pickupCircuit = circuitByRef(rawPickupCircuit);
  const schoolCircuit = circuitByRef(rawSchoolCircuit);
  if (rawPickupCircuit && !pickupCircuit) return alert("Le circuit de prise en charge sélectionné est introuvable.");
  if (rawSchoolCircuit && !schoolCircuit) return alert("Le circuit vers l’école sélectionné est introuvable.");
  child.pickupCircuitId = pickupCircuit?.id || "";
  child.schoolCircuitId = schoolCircuit?.id || "";
  child.morningCircuit = circuitLabelByRef(child.pickupCircuitId) || child.morningCircuit || "";
  child.returnCircuit = circuitLabelByRef(child.schoolCircuitId) || child.returnCircuit || "";
  child.circuitNumber = child.morningCircuit || child.circuitNumber;
  if (form.has("hasTransfer")) {
    child.hasTransfer = String(form.get("hasTransfer")) === "true";
    child.changesBusAtTransfer = child.hasTransfer && event.currentTarget.elements.changesBusAtTransfer?.checked === true;
    child.staysInSameBus = !child.hasTransfer || !child.changesBusAtTransfer;
    if (!child.hasTransfer) {
      child.transferSchoolCircuitId = "";
      child.transferDriverId = "";
      child.transferAssistantId = "";
    } else if (child.transferSchoolCircuitId) {
      const transferCircuit = circuitByRef(child.transferSchoolCircuitId);
      child.transferSchoolCircuitId = transferCircuit?.id || child.transferSchoolCircuitId;
    }
  }
  if (canEditChildTransportAssociations()) {
    const rawDriver = String(form.get("driverId") || "").trim();
    const rawAssistant = String(form.get("assistantId") || "").trim();
    const driver = driverByRef(rawDriver);
    const assistant = assistantByRef(rawAssistant);
    if (rawDriver && !driver) return alert("Le chauffeur sélectionné est introuvable.");
    if (rawAssistant && !assistant) return alert("La convoyeuse sélectionnée est introuvable.");
    child.driverId = driver?.id || child.driverId || "";
    child.assistantId = assistant?.id || child.assistantId || "";
    const vehicle = data.vehicles.find((item) => item.driverId === child.driverId || item.assistantId === child.assistantId);
    child.vehicleId = vehicle?.id || child.vehicleId || "";
    child.transferVehicleId = vehicle?.busNumber || child.transferVehicleId || "";
  }
  if (formHasAnyPrefix(form, "medicalHelpSheet.")) {
    const sheet = normalizeMedicalHelpSheet(child);
    Object.keys(sheet).forEach((key) => {
      sheet[key] = form.get(`medicalHelpSheet.${key}`) || "";
    });
    child.medicalHelpSheet = sheet;
    syncMedicalHelpSheet(child);
  }
  if (formHasAnyPrefix(form, "alternatingResidence.")) {
    const residence = normalizeAlternatingResidence(child);
    Object.keys(residence).forEach((key) => {
      if (key === "enabled") return;
      residence[key] = form.get(`alternatingResidence.${key}`) || "";
    });
    residence.enabled = event.currentTarget.elements["alternatingResidence.enabled"]?.checked === true;
    child.alternatingResidence = residence;
    child.alternatingCustody = {
      enabled: residence.enabled,
      evenWeekAddress: residence.motherAddress,
      oddWeekAddress: residence.fatherAddress,
      evenWeekParent: "Maman",
      oddWeekParent: "Papa",
      notes: residence.notes
    };
  }
  if (formHasAnyPrefix(form, "autonomy.")) {
    child.autonomy = {
      autonomous: event.currentTarget.elements["autonomy.autonomous"]?.checked === true,
      accompanimentRequired: event.currentTarget.elements["autonomy.accompanimentRequired"]?.checked === true,
      boardingHelp: String(form.get("autonomy.boardingHelp") || "").trim(),
      exitHelp: String(form.get("autonomy.exitHelp") || "").trim(),
      enhancedSupervision: event.currentTarget.elements["autonomy.enhancedSupervision"]?.checked === true,
      notes: String(form.get("autonomy.notes") || "").trim()
    };
  }
  if (form.has("exclusionType") || form.has("exclusionReason") || form.has("exclusionStartDate") || form.has("exclusionEndDate")) {
    child.transportExclusion = {
      status: child.exclusionType || "actif",
      startDate: child.exclusionStartDate || "",
      endDate: child.exclusionEndDate || "",
      reason: child.exclusionReason || "",
      notes: child.transportExclusion?.notes || ""
    };
  }
  delete child.schoolLocation;
  if (formHasAnyPrefix(form, "guardians.")) {
    child.guardians = readPersonFromForm(form, "guardians");
    child.responsiblePersons = child.guardians;
  }
  if (formHasAnyPrefix(form, "authorizedPickupPersons.")) {
    child.authorizedPickupPersons = readPersonFromForm(form, "authorizedPickupPersons");
    child.authorizedPersons = child.authorizedPickupPersons;
  }
  if (event.currentTarget.elements.attentionSpeciale) {
    child.attentionSpeciale = event.currentTarget.elements.attentionSpeciale.checked === true;
    child.typeAttention = child.attentionSpeciale ? String(form.get("typeAttention") || "").trim() : "";
    child.noteAttention = child.attentionSpeciale ? String(form.get("noteAttention") || "").trim() : "";
    child.niveauAttention = child.attentionSpeciale ? String(form.get("niveauAttention") || "information").trim() : "information";
    child.sensitiveStudent = {
      enabled: child.attentionSpeciale,
      attentionLevel: child.niveauAttention,
      instructions: child.noteAttention,
      internalNotes: String(form.get("sensitiveStudent.internalNotes") || child.sensitiveStudent?.internalNotes || "").trim()
    };
  }
  if (state.user?.role === "assistant" && !userCircuitNames().has(child.circuitNumber)) {
    return alert("Vous pouvez ajouter uniquement un élève lié à votre circuit.");
  }
  applyLinkedChildData(child);
  const now = new Date().toISOString();
  if (!child.createdAt) child.createdAt = now;
  if (!child.createdBy) child.createdBy = state.user?.id || "system";
  if (!child.createdByRole) child.createdByRole = state.user?.role || "system";
  child.updatedAt = now;
  child.updatedBy = state.user?.id || "system";
  child.updatedByRole = state.user?.role || "system";
  if (!data.children.some((item) => item.id === child.id)) data.children.push(child);
  recordHistoryChanges("children", before, child);
  syncCollectionAliases(data);
  saveData();
  saveChildToFirestore(child);
  state.selectedChildId = child.id;
  if (state.activeFilter?.type === "children") state.activeFilter = { type: "children", id: child.id };
  state.editingChildId = "";
  render();
}

function saveParentAbsence(event) {
  event.preventDefault();
  if (!isParent()) return;
  const form = event.currentTarget;
  const child = visibleChildren().find((item) => item.id === form.dataset.childId);
  if (!child) return alert("Élève introuvable.");
  const mode = form.elements.absenceMode.value;
  const dateAbsence = mode === "tomorrow"
    ? tomorrowDateString()
    : mode === "custom"
      ? form.elements.dateAbsence.value
      : localDateString();
  if (!dateAbsence) return alert("La date d’absence est obligatoire.");
  const existing = (data.studentAbsences || []).find((absence) =>
    absence.studentId === child.id &&
    absence.parentId === state.user.id &&
    absence.dateAbsence === dateAbsence &&
    absence.status === "absence_parent_declared"
  );
  const now = new Date().toISOString();
  const absence = {
    ...(existing || {}),
    id: existing?.id || `absence-${child.id}-${dateAbsence}-${Date.now()}`,
    studentId: child.id,
    studentName: fullName(child),
    parentId: state.user.id,
    circuitId: absenceCircuitIdForChild(child),
    driverId: child.driverId || childDriver(child)?.id || "",
    assistantId: child.assistantId || childAssistant(child)?.id || "",
    dateAbsence,
    motif: String(form.elements.motif.value || "").trim(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    status: "absence_parent_declared"
  };
  data.studentAbsences = data.studentAbsences || [];
  if (existing) {
    Object.assign(existing, absence);
  } else {
    data.studentAbsences.push(absence);
  }
  saveData();
  saveCollectionItemToFirestore("studentAbsences", absence);
  alert("Absence signalée.");
  render();
}

function saveTransferDelay(event) {
  event.preventDefault();
  if (!["driver", "assistant"].includes(state.user?.role)) return;
  const form = event.currentTarget;
  const transfer = transferById(form.dataset.transferDelayForm);
  if (!transfer || !canManageTransferDelay(transfer)) return alert("Vous ne pouvez pas signaler un retard sur ce transfert.");
  const selectedMinutes = form.elements.delayMinutes.value;
  const delayMinutes = selectedMinutes === "custom" ? Number(form.elements.customDelayMinutes.value) : Number(selectedMinutes);
  if (!Number.isFinite(delayMinutes) || delayMinutes <= 0) return alert("La durée du retard est obligatoire.");
  const now = new Date().toISOString();
  const previousActive = (data.transferDelays || []).filter((delay) => delay.status === "active" && delay.transferId === transfer.transferId);
  previousActive.forEach((delay) => {
    const before = cloneHistorySnapshot(delay);
    delay.status = "resolved";
    delay.resolvedAt = now;
    delay.resolvedById = state.user.id;
    delay.resolvedByRole = state.user.role;
    recordHistoryChanges("transferDelays", before, delay);
    saveCollectionItemToFirestore("transferDelays", delay);
  });
  const delay = {
    id: `delay-${transfer.transferId}-${Date.now()}`,
    transferId: transfer.transferId,
    transferName: transfer.transferName,
    circuitId: transfer.circuitId,
    driverId: transfer.driverId || "",
    convoyeurId: transfer.convoyeurId || transfer.assistantId || "",
    studentsIds: transfer.studentsIds || [],
    parentIds: transfer.parentIds || [],
    createdById: state.user.id,
    createdByRole: state.user.role,
    delayMinutes,
    reason: String(form.elements.reason.value || "").trim(),
    createdAt: now,
    status: "active"
  };
  data.transferDelays = data.transferDelays || [];
  data.transferDelays.push(delay);
  recordHistoryChanges("transferDelays", null, delay);
  if (form.elements.notifyParentsSms?.checked === true) {
    queueSmsAlerts("delay", childrenForTransfer(transfer), {
      circuitId: transfer.circuitId,
      delayMinutes,
      message: delay.reason
    });
  }
  saveData();
  saveCollectionItemToFirestore("transferDelays", delay);
  render();
}

function resolveTransferDelay(delayId) {
  const delay = (data.transferDelays || []).find((item) => item.id === delayId);
  if (!delay) return;
  const transfer = transferById(delay.transferId);
  if (!transfer || !canManageTransferDelay(transfer)) return alert("Vous ne pouvez pas terminer ce retard.");
  const before = cloneHistorySnapshot(delay);
  delay.status = "resolved";
  delay.resolvedAt = new Date().toISOString();
  delay.resolvedById = state.user.id;
  delay.resolvedByRole = state.user.role;
  recordHistoryChanges("transferDelays", before, delay);
  saveData();
  saveCollectionItemToFirestore("transferDelays", delay);
  render();
}

function readPersonFromForm(form, key) {
  const indexes = new Set();
  for (const name of form.keys()) {
    const match = String(name).match(new RegExp(`^${key}\\.(\\d+)\\.`));
    if (match) indexes.add(Number(match[1]));
  }
  return [...indexes].sort((a, b) => a - b).map((index) => ({
    lastName: form.get(`${key}.${index}.lastName`) || "",
    firstName: form.get(`${key}.${index}.firstName`) || "",
    phone: form.get(`${key}.${index}.phone`) || "",
    email: form.get(`${key}.${index}.email`) || "",
    address: form.get(`${key}.${index}.address`) || "",
    relation: form.get(`${key}.${index}.relation`) || "",
    note: form.get(`${key}.${index}.note`) || ""
  })).filter((person) => Object.values(person).some(Boolean));
}

function saveParentChangeRequest(event) {
  event.preventDefault();
  if (!isParent()) return;
  const child = selectedParentChild();
  if (!child) return;
  const form = new FormData(event.currentTarget);
  const isRequiredMedicalCompletion = event.currentTarget.dataset.medicalCompletionRequired === "1";
  const guardian = parentGuardianForChild(child);
  const syncedAddress = child.homeAddress || guardian.address || "";
  const driver = childDriver(child);
  const assistant = childAssistant(child);
  const sheet = normalizeMedicalHelpSheet(child);
  const fields = [
    ["homeAddress", "adresse", syncedAddress],
    ["guardianPhone", "téléphone parent", guardian.phone],
    ["medicalHelpSheet.hasAllergies", "allergies oui/non", sheet.hasAllergies],
    ["medicalHelpSheet.allergiesDetails", "précisions allergies", sheet.allergiesDetails],
    ["medicalHelpSheet.hasMedicalConditions", "affections médicales oui/non", sheet.hasMedicalConditions],
    ["medicalHelpSheet.medicalConditionsDetails", "précisions affections médicales", sheet.medicalConditionsDetails],
    ["medicalHelpSheet.medicalSymptoms", "symptômes particuliers", sheet.medicalSymptoms],
    ["medicalHelpSheet.symptomInstructions", "consignes en cas de symptôme", sheet.symptomInstructions],
    ["medicalHelpSheet.transitionObject", "objet de transition", sheet.transitionObject],
    ["medicalHelpSheet.mobilityHelp", "aide déplacement", sheet.mobilityHelp],
    ["medicalHelpSheet.tripOccupation", "occupation trajet", sheet.tripOccupation],
    ["medicalHelpSheet.transportSickness", "mal des transports", sheet.transportSickness],
    ["medicalHelpSheet.communicationHelp", "aide communication", sheet.communicationHelp],
    ["medicalHelpSheet.nonVerbalCommunication", "communication non verbale", sheet.nonVerbalCommunication],
    ["medicalHelpSheet.pictograms", "pictogrammes", sheet.pictograms],
    ["medicalHelpSheet.signs", "signes", sheet.signs],
    ["medicalHelpSheet.careAdviceNotes", "remarques santé", sheet.careAdviceNotes],
    ["parentNotes", "notes parents", child.parentNotes]
  ];
  const created = [];
  fields.forEach(([key, label, oldValue]) => {
    const newValue = String(form.get(key) || "").trim();
    if (newValue !== String(oldValue || "").trim()) {
      created.push({
        id: `request-${Date.now()}-${created.length}`,
        childId: child.id,
        childName: fullName(child),
        parentId: state.user.id,
        parentName: fullName(state.user),
        driverId: driver?.id || child.driverId || "",
        assistantId: assistant?.id || child.assistantId || "",
        fieldChanged: key,
        fieldLabel: label,
        oldValue: oldValue || "",
        newValue,
        status: "pending",
        driverApproval: "pending",
        assistantApproval: "pending",
        reviewedAt: "",
        reviewedBy: "",
        rejectionReason: "",
        createdAt: new Date().toISOString()
      });
    }
  });
  if (!created.length && !isRequiredMedicalCompletion) return alert("Aucune modification détectée.");
  if (created.length) data.parentChangeRequests.push(...created);
  if (isRequiredMedicalCompletion) {
    child.parentMedicalHelpCompletedAt = new Date().toISOString();
    child.parentMedicalHelpCompletedBy = state.user.id;
    saveChildToFirestore(child);
  }
  saveData();
  created.forEach(saveParentRequestToFirestore);
  state.parentRequestChildId = "";
  alert(created.length ? "Demande envoyée au chauffeur et à la convoyeuse." : "Fiche médicale confirmée.");
  render();
}

function reviewParentRequest(event) {
  const request = data.parentChangeRequests.find((item) => item.id === event.currentTarget.dataset.reviewRequest);
  if (!request || !["driver", "assistant"].includes(state.user?.role)) return;
  if (request.driverId !== state.user.id && request.assistantId !== state.user.id) return;
  const child = visibleChildren().find((item) => item.id === request.childId);
  if (!child) return;
  const action = event.currentTarget.dataset.reviewAction;
  if (action === "approve") {
    const before = cloneHistorySnapshot(child);
    applyParentRequest(request);
    child.updatedAt = new Date().toISOString();
    child.updatedBy = state.user.id;
    request.status = "approved";
    if (state.user.role === "driver") request.driverApproval = "approved";
    if (state.user.role === "assistant") request.assistantApproval = "approved";
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = state.user.id;
    recordHistoryChanges("children", before, child);
  } else if (action === "reject") {
    const reason = prompt("Raison du refus ?");
    request.status = "rejected";
    request.rejectionReason = reason || "Refuse";
    if (state.user.role === "driver") request.driverApproval = "rejected";
    if (state.user.role === "assistant") request.assistantApproval = "rejected";
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = state.user.id;
  } else {
    addSystemMessage(request.childId, `Confirmation demandee pour la modification : ${request.fieldLabel || request.fieldChanged}.`);
  }
  saveData();
  saveParentRequestToFirestore(request);
  if (action === "approve") saveChildToFirestore(child);
  render();
}

function applyParentRequest(request) {
  const child = data.children.find((item) => item.id === request.childId);
  if (!child) return;
  if (request.fieldChanged === "guardianPhone") {
    child.guardians = child.guardians?.length ? child.guardians : [{}];
    const parent = data.parents.find((item) => item.id === request.parentId) || {};
    const guardian = child.guardians.find((item) => guardianMatchesParent(item, parent)) || child.guardians[0];
    guardian.phone = request.newValue;
  } else if (request.fieldChanged?.startsWith("medicalHelpSheet.")) {
    child.medicalHelpSheet = normalizeMedicalHelpSheet(child);
    child.medicalHelpSheet[request.fieldChanged.replace("medicalHelpSheet.", "")] = request.newValue;
    syncMedicalHelpSheet(child);
  } else {
    child[request.fieldChanged] = request.newValue;
  }
}

function addSystemMessage(childId, text) {
  data.messages[childId] = data.messages[childId] || [];
  const child = data.children.find((item) => item.id === childId) || {};
  const message = {
    id: `msg-${Date.now()}`,
    text,
    authorId: state.user.id,
    authorName: fullName(state.user),
    authorRole: state.user.role,
    recipientType: "role_group",
    recipientIds: privateRecipientIdsForChild(child),
    createdAt: new Date().toISOString(),
    readBy: [state.user.id]
  };
  data.messages[childId].push(message);
  saveChildMessageToFirestore(childId, message);
}

function saveStudentIssue(event) {
  event.preventDefault();
  const child = childVisibleFromCurrentContext(event.currentTarget.dataset.studentIssueForm);
  if (!canSignalStudentIssue(child)) return alert("Signalement non autorisé.");
  const form = event.currentTarget;
  const description = form.elements.description.value.trim();
  if (!description) return alert("Description obligatoire.");
  const now = new Date().toISOString();
  const issue = {
    id: `issue-${Date.now()}`,
    childId: child.id,
    childName: fullName(child),
    type: form.elements.type.value,
    description,
    importance: form.elements.importance.value,
    status: "open",
    createdBy: state.user.id,
    createdByName: fullName(state.user),
    createdByRole: state.user.role,
    createdAt: now,
    updatedAt: now,
    driverId: child.driverId || childDriver(child)?.id || "",
    assistantId: child.assistantId || childAssistant(child)?.id || "",
    parentIds: parentListForChild(child).map((parent) => parent.id),
    spwIds: (data.users || []).filter((user) => user.role === "admin" && user.visualTheme === "spw").map((user) => user.id),
    readBy: [state.user.id]
  };
  data.studentIssues.unshift(issue);
  data.studentIssueMessages[issue.id] = [];
  recordHistoryChanges("studentIssues", null, issue);
  saveData();
  saveCollectionItemToFirestore("studentIssues", issue);
  alert("Problème signalé aux personnes concernées.");
  render();
}

function replyStudentIssue(event) {
  event.preventDefault();
  const issue = data.studentIssues.find((item) => item.id === event.currentTarget.dataset.studentIssueReply);
  if (!issue || !canSeeStudentIssue(issue)) return;
  const before = cloneHistorySnapshot(issue);
  const text = event.currentTarget.elements.messageText.value.trim();
  if (!text) return;
  const message = {
    id: `issue-msg-${Date.now()}`,
    text,
    authorId: state.user.id,
    authorName: fullName(state.user),
    authorRole: state.user.role,
    createdAt: new Date().toISOString(),
    readBy: [state.user.id]
  };
  data.studentIssueMessages[issue.id] = data.studentIssueMessages[issue.id] || [];
  data.studentIssueMessages[issue.id].push(message);
  issue.updatedAt = message.createdAt;
  issue.readBy = [...new Set([...(issue.readBy || []), state.user.id])];
  if (issue.status === "open" && ["admin", "driver", "assistant"].includes(state.user.role)) issue.status = "in_progress";
  recordHistoryChanges("studentIssues", before, issue);
  saveData();
  saveCollectionItemToFirestore("studentIssues", issue);
  saveStudentIssueMessageToFirestore(issue.id, message);
  render();
}

function updateStudentIssueStatus(issueId, status) {
  const issue = data.studentIssues.find((item) => item.id === issueId);
  if (!canManageStudentIssue(issue)) return;
  const before = cloneHistorySnapshot(issue);
  issue.status = status;
  issue.updatedAt = new Date().toISOString();
  issue.updatedBy = state.user.id;
  issue.readBy = [...new Set([...(issue.readBy || []), state.user.id])];
  recordHistoryChanges("studentIssues", before, issue);
  saveData();
  saveCollectionItemToFirestore("studentIssues", issue);
  render();
}

function sendMessage(event) {
  event.preventDefault();
  const childId = event.currentTarget.dataset.messageForm;
  const child = visibleChildren().find((item) => item.id === childId);
  if (!child || !canReadPrivateConversation(child)) return;
  const text = event.currentTarget.elements.messageText.value.trim();
  if (!text) return;
  data.messages[childId] = data.messages[childId] || [];
  const message = {
    id: `msg-${Date.now()}`,
    text,
    authorId: state.user.id,
    authorName: fullName(state.user),
    authorRole: state.user.role,
    recipientType: "role_group",
    recipientIds: privateRecipientIdsForChild(child),
    createdAt: new Date().toISOString(),
    readBy: [state.user.id]
  };
  data.messages[childId].push(message);
  saveData();
  saveChildMessageToFirestore(childId, message);
  render();
}

function sendTeamMessage(event) {
  event.preventDefault();
  if (!["driver", "assistant"].includes(state.user?.role)) return;
  const conversationId = event.currentTarget.dataset.teamMessageForm;
  const conversation = teamConversationsForUser(state.messagesTab).find((item) => item.conversationId === conversationId);
  if (!conversation || !conversation.participants.includes(state.user.id)) return;
  const text = event.currentTarget.elements.teamMessageText.value.trim();
  if (!text) return;
  const now = new Date().toISOString();
  const message = {
    id: `team-msg-${Date.now()}`,
    text,
    authorId: state.user.id,
    authorName: fullName(state.user),
    authorRole: state.user.role,
    recipientIds: conversation.participants,
    recipientRoles: conversation.participantRoles,
    createdAt: now,
    readBy: [state.user.id]
  };
  data.teamMessageItems[conversationId] = data.teamMessageItems[conversationId] || [];
  data.teamMessageItems[conversationId].push(message);
  const stored = { ...conversation, lastMessage: text, lastMessageAt: now, createdAt: conversation.createdAt || now };
  const index = data.teamMessages.findIndex((item) => item.conversationId === conversationId);
  if (index >= 0) data.teamMessages[index] = stored;
  else data.teamMessages.push(stored);
  saveData();
  saveTeamMessageToFirestore(stored, message);
  render();
}

function sendDirectMessage(event) {
  event.preventDefault();
  if (!isAdmin() && !["driver", "assistant"].includes(state.user?.role)) return;
  const form = event.currentTarget;
  const targetRole = form.dataset.directMessageForm;
  const recipientId = form.elements.recipientId.value;
  const subject = form.elements.subject.value.trim();
  const text = form.elements.messageText.value.trim();
  if (!recipientId || !subject || !text) return alert("Destinataire, sujet et message obligatoires.");
  const recipient = directRecipientOptions(targetRole).find((item) => item.id === recipientId);
  if (!recipient) return;
  const conversationId = directConversationId(state.user.id, recipientId, subject);
  const now = new Date().toISOString();
  const existing = data.directMessages.find((item) => item.conversationId === conversationId);
  const conversation = {
    conversationId,
    senderId: existing?.senderId || state.user.id,
    senderName: existing?.senderName || fullName(state.user),
    senderRole: existing?.senderRole || state.user.role,
    recipientId: existing?.recipientId || recipientId,
    recipientName: existing?.recipientName || fullName(recipient),
    recipientRole: existing?.recipientRole || targetRole,
    subject,
    lastMessage: text,
    lastMessageAt: now,
    participants: [...new Set([state.user.id, recipientId])],
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
  const message = directMessagePayload(conversation, text, now);
  data.directMessageItems[conversationId] = data.directMessageItems[conversationId] || [];
  data.directMessageItems[conversationId].push(message);
  upsertDirectConversation(conversation);
  state.selectedDirectConversationId = conversationId;
  saveData();
  saveDirectMessageToFirestore(conversation, message);
  render();
}

function sendDirectReply(event) {
  event.preventDefault();
  const conversation = data.directMessages.find((item) => item.conversationId === event.currentTarget.dataset.directReplyForm);
  if (!conversation || !canReadDirectConversation(conversation)) return;
  const text = event.currentTarget.elements.directMessageText.value.trim();
  if (!text) return;
  const now = new Date().toISOString();
  const message = directMessagePayload(conversation, text, now);
  data.directMessageItems[conversation.conversationId] = data.directMessageItems[conversation.conversationId] || [];
  data.directMessageItems[conversation.conversationId].push(message);
  conversation.lastMessage = text;
  conversation.lastMessageAt = now;
  conversation.updatedAt = now;
  upsertDirectConversation(conversation);
  saveData();
  saveDirectMessageToFirestore(conversation, message);
  render();
}

function directMessagePayload(conversation, text, createdAt) {
  return {
    id: `direct-msg-${Date.now()}`,
    text,
    authorId: state.user.id,
    authorName: fullName(state.user),
    authorRole: state.user.role,
    createdAt,
    readBy: [state.user.id]
  };
}

function upsertDirectConversation(conversation) {
  const index = data.directMessages.findIndex((item) => item.conversationId === conversation.conversationId);
  if (index >= 0) data.directMessages[index] = conversation;
  else data.directMessages.push(conversation);
}

function refreshDirectConversationPreview(conversationId) {
  const conversation = data.directMessages.find((item) => item.conversationId === conversationId);
  if (!conversation) return null;
  const messages = [...(data.directMessageItems?.[conversationId] || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const last = messages[messages.length - 1] || null;
  conversation.lastMessage = last?.text || "";
  conversation.lastMessageAt = last?.createdAt || "";
  conversation.updatedAt = new Date().toISOString();
  upsertDirectConversation(conversation);
  return conversation;
}

function refreshTeamConversationPreview(conversationId) {
  const conversation = data.teamMessages.find((item) => item.conversationId === conversationId);
  if (!conversation) return null;
  const messages = [...(data.teamMessageItems?.[conversationId] || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const last = messages[messages.length - 1] || null;
  conversation.lastMessage = last?.text || "";
  conversation.lastMessageAt = last?.createdAt || "";
  const index = data.teamMessages.findIndex((item) => item.conversationId === conversationId);
  if (index >= 0) data.teamMessages[index] = conversation;
  return conversation;
}

function directConversationId(senderId, recipientId, subject) {
  const people = [senderId, recipientId].sort().join("-");
  const key = subject.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 36) || "message";
  return `direct-${people}-${key}`;
}

function createSupportRequest(event) {
  event.preventDefault();
  if (!canAccessSupportCenter() || isParent()) return alert("Centre support technique non accessible depuis le compte parent.");
  const form = event.currentTarget;
  const subject = form.elements.subject.value.trim();
  const messageText = form.elements.message.value.trim();
  if (!subject || !messageText) return alert("Sujet et message obligatoires.");
  const now = new Date().toISOString();
  const context = supportContextForUser();
  const request = {
    id: `support-${Date.now()}`,
    userId: state.user.id,
    userName: form.elements.userName.value.trim() || fullName(state.user),
    userRole: state.user.role,
    subject,
    message: messageText,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    assignedSupport: "",
    lastReplyAt: "",
    context,
    readBy: [state.user.id]
  };
  const message = {
    id: `support-msg-${Date.now()}`,
    text: messageText,
    authorId: state.user.id,
    authorName: request.userName,
    authorRole: state.user.role,
    createdAt: now,
    readBy: [state.user.id]
  };
  data.supportRequests.push(request);
  data.supportMessages[request.id] = [message];
  saveData();
  saveSupportRequestToFirestore(request);
  saveSupportMessageToFirestore(request.id, message);
  alert("Demande envoyée au support");
  state.selectedSupportRequestId = request.id;
  render();
}

function createAccessRequestFromLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const firstName = form.elements.firstName.value.trim();
  const lastName = form.elements.lastName.value.trim();
  const phone = form.elements.phone.value.trim();
  const email = form.elements.email.value.trim();
  const requestedRole = form.elements.requestedRole.value;
  if (!firstName || !lastName || !phone || !email) return alert("Nom, prénom, téléphone et e-mail sont obligatoires.");
  const now = new Date().toISOString();
  const request = {
    id: `access-${Date.now()}`,
    firstName,
    lastName,
    phone,
    email,
    requestedRole,
    message: form.elements.message.value.trim(),
    childFirstName: form.elements.childFirstName?.value.trim() || "",
    childLastName: form.elements.childLastName?.value.trim() || "",
    schoolName: form.elements.schoolName?.value.trim() || "",
    circuitNumber: form.elements.circuitNumber?.value.trim() || "",
    status: "pending",
    createdAt: now,
    reviewedAt: "",
    reviewedBy: "",
    supportResponse: ""
  };
  data.accessRequests = data.accessRequests || [];
  data.accessRequests.unshift(request);
  saveData();
  saveAccessRequestToFirestore(request);
  state.loginAccessRequestOpen = false;
  state.loginAccessRequestRole = "driver";
  state.loginNotice = "Demande envoyée. Le support ou le gestionnaire de transport vous contactera.";
  renderLogin();
}

function createSupportRequestFromLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const firstName = form.elements.firstName.value.trim();
  const lastName = form.elements.lastName.value.trim();
  const phone = form.elements.phone.value.trim();
  const email = form.elements.email.value.trim();
  const requesterRole = form.elements.requesterRole.value;
  const subject = form.elements.subject.value.trim();
  const messageText = form.elements.message.value.trim();
  if (!firstName || !lastName || !phone || !email || !subject || !messageText) {
    return alert("Nom, prénom, téléphone, e-mail, sujet et message sont obligatoires.");
  }
  const now = new Date().toISOString();
  const guestId = `guest-${Date.now()}`;
  const userName = `${firstName} ${lastName}`.trim();
  const request = {
    id: `support-${Date.now()}`,
    userId: guestId,
    userName,
    userRole: requesterRole,
    subject,
    message: messageText,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    assignedSupport: "",
    lastReplyAt: "",
    context: {
      source: "page connexion",
      requesterRole: roleLabel(requesterRole),
      userPhone: phone,
      userEmail: email
    },
    readBy: []
  };
  const message = {
    id: `support-msg-${Date.now()}`,
    text: messageText,
    authorId: guestId,
    authorName: userName,
    authorRole: requesterRole,
    createdAt: now,
    readBy: [guestId]
  };
  data.supportRequests = data.supportRequests || [];
  data.supportMessages = data.supportMessages || {};
  data.supportRequests.unshift(request);
  data.supportMessages[request.id] = [message];
  saveData();
  saveSupportRequestToFirestore(request);
  saveSupportMessageToFirestore(request.id, message);
  state.loginAccessRequestOpen = false;
  state.loginNotice = "Demande envoyée au support.";
  renderLogin();
}

async function handlePasswordResetFromLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const verified = resetVerifiedAccount();
  const now = new Date().toISOString();
  if (verified) {
    const newPassword = form.elements.newPassword.value.trim();
    const confirmPassword = form.elements.confirmPassword.value.trim();
    if (!newPassword || newPassword.length < 4) return alert("Le nouveau code personnel doit contenir au moins 4 caractères.");
    if (newPassword !== confirmPassword) return alert("La confirmation ne correspond pas.");
    const recoveryCode = generateRecoveryCode();
    verified.accessCodeHash = await hashSecret(newPassword);
    verified.passwordHash = verified.accessCodeHash;
    verified.recoveryCodeHash = await hashSecret(recoveryCode);
    verified.accessCode = "";
    verified.temporaryAccessHash = "";
    verified.temporaryAccessCode = "";
    verified.isTemporaryCode = false;
    verified.firstLoginCompleted = true;
    verified.resetRequired = false;
    verified.passwordUpdatedAt = now;
    verified.accessCodeUpdatedAt = now;
    verified.failedResetAttempts = 0;
    verified.resetBlockedUntil = "";
    verified.updatedAt = now;
    recordSecurityLog(verified, "password_reset_success", "success");
    saveData();
    saveCollectionItemToFirestore(state.passwordResetVerifiedType, verified);
    alert(`Nouveau code de récupération unique à conserver : ${recoveryCode}\n\nIl ne sera plus affiché ensuite.`);
    state.loginForgotPasswordOpen = false;
    state.passwordResetVerifiedType = "";
    state.passwordResetVerifiedId = "";
    state.loginNotice = "Code personnel réinitialisé avec succès";
    renderLogin();
    return;
  }
  const role = form.elements.requesterRole.value;
  const identity = {
    role,
    identifier: form.elements.identifier.value.trim(),
    firstName: form.elements.firstName.value.trim(),
    lastName: form.elements.lastName.value.trim(),
    contact: form.elements.contact.value.trim(),
    recoveryCode: form.elements.recoveryCode.value.trim()
  };
  if (!identity.identifier || !identity.firstName || !identity.lastName || !identity.contact || !identity.recoveryCode) {
    return alert("Tous les champs de vérification sont obligatoires.");
  }
  const account = await findPasswordResetAccount(identity);
  if (!account) {
    const relatedAccount = findPasswordResetAccountByIdentifier(identity);
    if (relatedAccount) {
      relatedAccount.failedResetAttempts = Number(relatedAccount.failedResetAttempts || 0) + 1;
      if (relatedAccount.failedResetAttempts >= 5) relatedAccount.resetBlockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      relatedAccount.updatedAt = now;
      saveCollectionItemToFirestore(role === "parent" ? "parents" : "users", relatedAccount);
    }
    recordSecurityLog(relatedAccount, relatedAccount?.resetBlockedUntil ? "password_reset_blocked" : "password_reset_failed", relatedAccount?.resetBlockedUntil ? "blocked" : "failed");
    saveData();
    alert("Les informations fournies ne correspondent à aucun compte.");
    renderLogin();
    return;
  }
  if (resetBlocked(account)) {
    recordSecurityLog(account, "password_reset_blocked", "blocked");
    saveData();
    alert("Trop de tentatives. Réessayez plus tard.");
    renderLogin();
    return;
  }
  account.failedResetAttempts = 0;
  account.resetBlockedUntil = "";
  account.updatedAt = now;
  state.passwordResetVerifiedType = role === "parent" ? "parents" : "users";
  state.passwordResetVerifiedId = account.id;
  saveData();
  renderLogin();
}

function handleAccessRequestAction(requestId, action) {
  const request = (data.accessRequests || []).find((item) => item.id === requestId);
  if (!request || (!isAdmin() && !isSupport())) return;
  if (isPrimaryAdmin()) return;
  if (action === "create-code") return createAccessCodeFromRequest(request);
  if (action === "approve" && isAdmin()) request.status = "approved";
  if (action === "reject" && isAdmin()) request.status = "rejected";
  if (action === "in_progress" && isSupport()) request.status = "in_progress";
  if (action === "forward" && isSupport()) {
    request.status = "in_progress";
    request.supportResponse = request.supportResponse || "Demande transmise au gestionnaire de transport.";
  }
  request.reviewedAt = new Date().toISOString();
  request.reviewedBy = state.user.id;
  saveData();
  saveAccessRequestToFirestore(request);
  render();
}

function saveAccessRequestReply(event) {
  event.preventDefault();
  if (!isSupport()) return;
  const request = (data.accessRequests || []).find((item) => item.id === event.currentTarget.dataset.accessRequestReply);
  if (!request) return;
  request.supportResponse = event.currentTarget.elements.supportResponse.value.trim();
  request.status = request.status === "pending" ? "in_progress" : request.status;
  request.reviewedAt = new Date().toISOString();
  request.reviewedBy = state.user.id;
  saveData();
  saveAccessRequestToFirestore(request);
  render();
}

async function createAccessCodeFromRequest(request) {
  if (!isTransportManagerUser() && !isSpwAccount()) return;
  const temporaryCode = generateUniqueAccessCode();
  const now = new Date().toISOString();
  let createdIdentifier = "";
  if (request.requestedRole === "parent") {
    createdIdentifier = request.childLastName || request.lastName;
    const parent = {
      id: `parent-${Date.now()}`,
      role: "parent",
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
      email: request.email,
      username: createdIdentifier,
      loginChildName: createdIdentifier,
      ...generatedTemporaryAccessData(temporaryCode, now),
      temporaryAccessHash: await hashSecret(temporaryCode),
      accessCodeHash: "",
      passwordHash: "",
      recoveryCodeHash: "",
      recoveryAnswerHash: "",
      firstLoginCompleted: false,
      resetRequired: true,
      linkedChildrenIds: [],
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
    data.parents.push(parent);
    saveCollectionItemToFirestore("parents", parent);
  } else {
    const id = `${request.requestedRole}-${Date.now()}`;
    createdIdentifier = generateUniqueIdentifier(request.requestedRole);
    const user = {
      id,
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
      email: request.email,
      role: request.requestedRole,
      identifier: createdIdentifier,
      identifierNumber: createdIdentifier,
      username: createdIdentifier,
      ...generatedTemporaryAccessData(temporaryCode, now),
      temporaryAccessHash: await hashSecret(temporaryCode),
      accessCodeHash: "",
      passwordHash: "",
      firstLoginCompleted: false,
      resetRequired: true,
      assignedCircuits: request.circuitNumber ? [request.circuitNumber] : [],
      assignedVehicleId: "",
      assignedSchool: request.schoolName || "",
      isActive: true,
      createdBy: state.user.id,
      createdAt: now,
      updatedAt: now
    };
    data.users.push(user);
    const profile = { id, firstName: request.firstName, lastName: request.lastName, phone: request.phone, schoolCircuit: request.circuitNumber || "", schoolName: request.schoolName || "" };
    if (request.requestedRole === "driver") {
      profile.busNumber = "";
      profile.licensePlate = "";
      data.drivers.push(profile);
      saveCollectionItemToFirestore("drivers", profile);
    }
    if (request.requestedRole === "assistant") data.assistants.push(profile);
    if (request.requestedRole === "assistant") saveCollectionItemToFirestore("assistants", profile);
    saveCollectionItemToFirestore("users", user);
  }
  request.status = "approved";
  request.reviewedAt = now;
  request.reviewedBy = state.user.id;
  saveData();
  saveAccessRequestToFirestore(request);
  alert(`Accès créé.\nIdentifiant : ${createdIdentifier}\nCode temporaire : ${temporaryCode}`);
  render();
}

function generateUniqueAccessCode() {
  let code = "";
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (accessCodeAlreadyVisibleOrTemporary(code));
  return code;
}

function accessCodeAlreadyVisibleOrTemporary(code) {
  const normalized = String(code || "").trim();
  return [...(data.users || []), ...(data.parents || [])].some((person) =>
    [person.accessCode, person.temporaryAccessCode].some((value) => String(value || "").trim() === normalized)
  );
}

function sendSupportMessage(event) {
  event.preventDefault();
  const requestId = event.currentTarget.dataset.supportMessageForm;
  const request = data.supportRequests.find((item) => item.id === requestId);
  if (!request) return;
  if (!isSupport() && request.userId !== state.user.id) return;
  const text = event.currentTarget.elements.supportMessageText.value.trim();
  if (!text) return;
  const now = new Date().toISOString();
  const message = {
    id: `support-msg-${Date.now()}`,
    text,
    authorId: state.user.id,
    authorName: fullName(state.user),
    authorRole: state.user.role,
    createdAt: now,
    readBy: [state.user.id]
  };
  data.supportMessages[requestId] = data.supportMessages[requestId] || [];
  data.supportMessages[requestId].push(message);
  request.updatedAt = now;
  request.lastReplyAt = now;
  if (isSupport() && request.status === "pending") {
    request.status = "in_progress";
    request.assignedSupport = state.user.id;
  }
  request.readBy = [state.user.id];
  saveData();
  saveSupportRequestToFirestore(request);
  saveSupportMessageToFirestore(requestId, message);
  render();
}

function deleteMessage(type, ownerId, messageId) {
  if (!confirm("Supprimer ce message ?")) return;
  if (type === "private") return deletePrivateMessage(ownerId, messageId);
  if (type === "direct") return deleteDirectMessage(ownerId, messageId);
  if (type === "team") return deleteTeamMessage(ownerId, messageId);
  if (type === "support") return deleteSupportMessage(ownerId, messageId);
}

function deletePrivateMessage(childId, messageId) {
  const messages = data.messages?.[childId] || [];
  const message = messages.find((item) => item.id === messageId);
  if (!canDeleteMessage(message, "private")) return;
  data.messages[childId] = messages.filter((item) => item.id !== messageId);
  saveData();
  deleteChildMessageFromFirestore(childId, messageId);
  render();
}

function deleteDirectMessage(conversationId, messageId) {
  const messages = data.directMessageItems?.[conversationId] || [];
  const message = messages.find((item) => item.id === messageId);
  if (!canDeleteMessage(message, "direct")) return;
  data.directMessageItems[conversationId] = messages.filter((item) => item.id !== messageId);
  const conversation = refreshDirectConversationPreview(conversationId);
  saveData();
  deleteDirectMessageFromFirestore(conversationId, messageId, conversation);
  render();
}

function deleteTeamMessage(conversationId, messageId) {
  const messages = data.teamMessageItems?.[conversationId] || [];
  const message = messages.find((item) => item.id === messageId);
  if (!canDeleteMessage(message, "team")) return;
  data.teamMessageItems[conversationId] = messages.filter((item) => item.id !== messageId);
  const conversation = refreshTeamConversationPreview(conversationId);
  saveData();
  deleteTeamMessageFromFirestore(conversationId, messageId, conversation);
  render();
}

function deleteSupportMessage(requestId, messageId) {
  const messages = data.supportMessages?.[requestId] || [];
  const message = messages.find((item) => item.id === messageId);
  if (!canDeleteMessage(message, "support")) return;
  data.supportMessages[requestId] = messages.filter((item) => item.id !== messageId);
  const request = data.supportRequests.find((item) => item.id === requestId);
  if (request) {
    const remaining = data.supportMessages[requestId] || [];
    const last = remaining[remaining.length - 1] || null;
    request.lastReplyAt = last?.createdAt || "";
    request.updatedAt = new Date().toISOString();
    saveSupportRequestToFirestore(request);
  }
  saveData();
  deleteSupportMessageFromFirestore(requestId, messageId);
  render();
}

function updateSupportStatus(requestId, status) {
  if (!isSupport()) return;
  const request = data.supportRequests.find((item) => item.id === requestId);
  if (!request) return;
  request.status = status;
  request.updatedAt = new Date().toISOString();
  request.assignedSupport = state.user.id;
  request.readBy = [...new Set([...(request.readBy || []), state.user.id])];
  saveData();
  saveSupportRequestToFirestore(request);
  render();
}

function deleteSupportRequest(requestId) {
  if (!isSupport()) return;
  if (!confirm("Supprimer cette demande support ?")) return;
  data.supportRequests = data.supportRequests.filter((request) => request.id !== requestId);
  delete data.supportMessages[requestId];
  if (state.selectedSupportRequestId === requestId) state.selectedSupportRequestId = "";
  saveData();
  deleteSupportRequestFromFirestore(requestId);
  render();
}

function markSupportRequestRead(requestId) {
  const request = data.supportRequests.find((item) => item.id === requestId);
  if (!request) return;
  request.readBy = [...new Set([...(request.readBy || []), state.user.id])];
  (data.supportMessages[requestId] || []).forEach((message) => {
    message.readBy = [...new Set([...(message.readBy || []), state.user.id])];
  });
  saveData();
}

async function createParentFromForm(event) {
  event.preventDefault();
  if (!isAdmin() || isPrimaryAdmin()) return;
  const form = event.currentTarget;
  const temporaryCode = generateUniqueAccessCode();
  const parentIdentity = {
    firstName: form.elements.firstName.value.trim(),
    lastName: form.elements.lastName.value.trim(),
    phone: form.elements.phone.value.trim(),
    email: form.elements.email.value.trim()
  };
  const resolved = resolveParentLinkedChildren(
    form.elements.studentLastName.value,
    selectedChildIdsFromField(form.elements.linkedChildrenIds),
    parentIdentity
  );
  if (resolved.error) return alert(resolved.error);
  const id = `parent-${Date.now()}`;
  const username = resolved.studentLastNameIdentifier || parentIdentity.lastName;
  const parent = {
    id,
    role: "parent",
    firstName: parentIdentity.firstName,
    lastName: parentIdentity.lastName,
    phone: parentIdentity.phone,
    email: parentIdentity.email,
    username,
    loginChildName: username,
    ...generatedTemporaryAccessData(temporaryCode),
    temporaryAccessHash: await hashSecret(temporaryCode),
    accessCodeHash: "",
    passwordHash: "",
    recoveryCodeHash: "",
    recoveryAnswerHash: "",
    firstLoginCompleted: false,
    resetRequired: true,
    studentLastNameIdentifier: resolved.studentLastNameIdentifier,
    linkedChildrenIds: resolved.linkedChildrenIds,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.parents.push(parent);
  syncParentLinks(parent);
  saveData();
  saveCollectionItemToFirestore("parents", parent);
  alert(`Accès parent créé.\nIdentifiant : ${username}\nCode temporaire : ${temporaryCode}`);
  render();
}

function syncParentLinks() {
  data.children.forEach((child) => {
    const linkedParents = (data.parents || []).filter((parent) => (parent.linkedChildrenIds || []).includes(child.id));
    child.parentIds = linkedParents.map((parent) => parent.id);
    child.parentAccessCode = "";
  });
}

async function resetParentCode(event) {
  const parent = data.parents.find((item) => item.id === event.currentTarget.dataset.resetParentCode);
  if (!parent || !isAdmin() || isPrimaryAdmin()) return;
  const temporaryCode = generateUniqueAccessCode();
  Object.assign(parent, generatedTemporaryAccessData(temporaryCode));
  parent.temporaryAccessHash = await hashSecret(temporaryCode);
  parent.accessCodeHash = "";
  parent.passwordHash = "";
  parent.recoveryCodeHash = "";
  parent.recoveryAnswerHash = "";
  parent.firstLoginCompleted = false;
  parent.resetRequired = true;
  parent.updatedAt = new Date().toISOString();
  recordSecurityLog(parent, "temporary_code_generated", "success");
  syncParentLinks(parent);
  saveData();
  saveCollectionItemToFirestore("parents", parent);
  alert(`Accès parent réinitialisé.\nIdentifiant : ${parentStudentIdentifier(parent) || parent.username || parent.lastName}\nCode temporaire : ${temporaryCode}`);
  render();
}

function toggleParentAccess(event) {
  const parent = data.parents.find((item) => item.id === event.currentTarget.dataset.disableParent);
  if (!parent || !isAdmin() || isPrimaryAdmin()) return;
  parent.isActive = parent.isActive === false;
  parent.updatedAt = new Date().toISOString();
  saveData();
  render();
}

function deleteParentAccess(event) {
  const id = event.currentTarget.dataset.deleteParent;
  if (!isAdmin() || isPrimaryAdmin() || !confirm("Supprimer cet accès parent ?")) return;
  data.parents = data.parents.filter((parent) => parent.id !== id);
  data.children.forEach((child) => {
    child.parentIds = (child.parentIds || []).filter((parentId) => parentId !== id);
  });
  saveData();
  render();
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(VIEW_STATE_KEY);
  resetViewState();
  state.user = null;
  state.loginMode = "";
  renderLogin();
}

function bindSessionActivityTracking() {
  ["click", "keydown", "scroll", "touchstart", "pointerdown"].forEach((eventName) => {
    window.addEventListener(eventName, () => {
      if (!checkSessionInactivity()) updateSessionActivity();
    }, { passive: true });
  });
  setInterval(checkSessionInactivity, 60 * 1000);
}

window.addEventListener("error", (event) => {
  console.error(event.error || event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error(event.reason);
});

bindSessionActivityTracking();
initOfflineMode();
startFirestoreRealtimeSync();
render();
