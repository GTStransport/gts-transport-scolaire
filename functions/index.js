import crypto from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import { onSchedule } from "firebase-functions/v2/scheduler";
import nodemailer from "nodemailer";
import webpush from "web-push";

initializeApp();

const db = getFirestore();
const auth = getAuth();
const messaging = getMessaging();
webpush.setVapidDetails(
  "mailto:support@gestion-transport-scolaire.be",
  "BBYdZGOpyTCLIfSqD9jXSahh6bfLQ1lz38qd-sRs5-djLuOID22OyPGeSGvrjFKrxuJDLkOcR675VHIiYF4E2Bc",
  "MamyxsKTelKnPYpsSo0HZOknsHFnr_mt2i4Ll3d8ZQs"
);

const SYSTEM_ADMIN_ACCOUNT = {
  id: "admin",
  role: "admin",
  adminType: "system",
  identifier: "6183",
  identifierNumber: "6183",
  username: "6183",
  firstName: "Administrateur",
  lastName: "Système",
  accessCode: "1901",
  firstLoginCompleted: true,
  resetRequired: false,
  isTemporaryCode: false,
  isActive: true,
  createdBy: "system"
};

const ROLE_COLLECTIONS = {
  admin: ["users", "transportManagers"],
  parent: ["parents"],
  driver: ["users", "drivers"],
  assistant: ["users", "assistants"],
  support: ["users"],
  admin: ["users", "transportManagers"],
  system_admin: ["users"],
  transport_manager: ["users", "transportManagers"],
  spw: ["users"]
};

const FCM_REGION = "europe-west1";
setGlobalOptions({
  region: FCM_REGION,
  memory: "256MiB",
  timeoutSeconds: 60,
  maxInstances: 1,
  concurrency: 1,
  cpu: "gcf_gen1"
});

const VALID_ROLES = new Set(["admin", "system_admin", "transport_manager", "spw", "driver", "assistant", "parent", "support"]);
const BELGIUM_TIME_ZONE = "Europe/Brussels";
const DEFAULT_SUPPORT_EMAIL_TO = "support@gts-connect.be";
const BELGIUM_SCHOOL_BLOCKED_PERIODS = [
  { label: "Fête de la Communauté française", start: "2026-09-27", end: "2026-09-27" },
  { label: "Vacances d'automne", start: "2026-10-19", end: "2026-11-01" },
  { label: "Fête des morts", start: "2026-11-02", end: "2026-11-02" },
  { label: "Armistice", start: "2026-11-11", end: "2026-11-11" },
  { label: "Vacances d'hiver", start: "2026-12-21", end: "2027-01-03" },
  { label: "Mardi gras", start: "2027-02-09", end: "2027-02-09" },
  { label: "Vacances de détente", start: "2027-02-22", end: "2027-03-07" },
  { label: "Lundi de Pâques", start: "2027-03-29", end: "2027-03-29" },
  { label: "Vacances de printemps", start: "2027-04-26", end: "2027-05-09" },
  { label: "Jeudi de l'Ascension", start: "2027-05-06", end: "2027-05-06" },
  { label: "Lundi de Pentecôte", start: "2027-05-17", end: "2027-05-17" },
  { label: "Début des vacances d'été", start: "2027-07-03", end: "2027-07-03" }
];

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function legacyFallbackHash(value) {
  return `plain-fallback:${Buffer.from(String(value || ""), "utf8").toString("base64")}`;
}

function identifierMatches(user, identifier) {
  const entered = normalize(identifier);
  return [
    user.identifier,
    user.identifierNumber,
    user.username,
    user.login,
    user.driverIdentifier,
    user.assistantIdentifier,
    user.managerIdentifier,
    user.id
  ].some((value) => normalize(value) === entered);
}

function isPrimaryAdmin(user) {
  return user?.role === "system_admin"
    || user?.role === "admin_system"
    || (user?.role === "admin" && (user?.adminType === "system" || user?.identifierNumber === "6183" || user?.identifier === "6183"));
}

function isSpw(user) {
  return user?.role === "spw"
    || (user?.role === "admin" && (user?.adminType === "spw" || user?.visualTheme === "spw"));
}

function isTransportManager(user) {
  return user?.role === "transport_manager"
    || user?.role === "gestionnaire_transport"
    || (user?.role === "admin" && !isPrimaryAdmin(user) && !isSpw(user));
}

function roleMatchesLoginMode(loginMode, user) {
  if (!user) return false;
  if (loginMode === "system_admin") return isPrimaryAdmin(user);
  if (loginMode === "transport_manager") return isTransportManager(user);
  if (loginMode === "spw") return isSpw(user);
  if (loginMode === "driver") return user.role === "driver" || !!user.driverIdentifier || !!user.busNumber;
  if (loginMode === "assistant") return user.role === "assistant" || !!user.assistantIdentifier;
  return user.role === loginMode;
}

function gtsRuleRole(user) {
  if (isPrimaryAdmin(user)) return "system_admin";
  if (isTransportManager(user)) return "transport_manager";
  if (isSpw(user)) return "spw";
  if (user.role) return user.role;
  if (user.driverIdentifier || user.busNumber) return "driver";
  if (user.assistantIdentifier) return "assistant";
  return user.role || "";
}

function credentialMatches(user, code) {
  if (!user || !code) return { ok: false, usedTemporary: false };
  const hashed = sha256(code);
  const fallback = legacyFallbackHash(code);
  const personalMatch = user.isTemporaryCode !== true
    && user.firstLoginCompleted !== false
    && (
      user.accessCodeHash === hashed
      || user.accessCodeHash === fallback
      || user.passwordHash === hashed
      || user.passwordHash === fallback
      || (!!user.accessCode && user.accessCode === code)
    );
  const temporaryMatch = (
    user.temporaryAccessHash === hashed
    || user.temporaryAccessHash === fallback
    || ((user.isTemporaryCode === true || user.firstLoginCompleted === false) && !!user.accessCode && user.accessCode === code)
  );
  if (personalMatch) return { ok: true, usedTemporary: false };
  if (temporaryMatch) return { ok: true, usedTemporary: true };
  return { ok: false, usedTemporary: false };
}

async function parentLinkedToChild(parent, child) {
  const linkedIds = Array.isArray(parent.linkedChildrenIds) ? parent.linkedChildrenIds : [];
  const parentIds = Array.isArray(child.parentIds) ? child.parentIds : [];
  return linkedIds.includes(child.id)
    || parentIds.includes(parent.id)
    || child.parentId === parent.id
    || normalize(parent.loginChildName) === normalize(child.lastName)
    || normalize(parent.studentLastName) === normalize(child.lastName);
}

async function parentHasChildName(parent, childName) {
  const wanted = normalize(childName);
  if (!wanted) return false;
  const collections = ["students", "children"];
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    for (const doc of snapshot.docs) {
      const child = { id: doc.id, ...doc.data() };
      const nameMatches = normalize(child.lastName) === wanted || normalize(`${child.firstName || ""}${child.lastName || ""}`) === wanted;
      if (nameMatches && await parentLinkedToChild(parent, child)) return true;
    }
  }
  return false;
}

async function withLinkedUserCredentials(collectionName, account) {
  if (!account?.id || collectionName === "users" || collectionName === "parents") return account;
  const userDoc = await db.collection("users").doc(account.id).get();
  if (!userDoc.exists) return account;
  const user = { id: userDoc.id, ...userDoc.data() };
  return {
    ...account,
    ...user,
    id: account.id,
    firstName: user.firstName || account.firstName || "",
    lastName: user.lastName || account.lastName || "",
    phone: user.phone || account.phone || "",
    email: user.email || account.email || "",
    transportManagerId: user.transportManagerId || account.transportManagerId || "",
    assignedCircuits: Array.isArray(user.assignedCircuits) && user.assignedCircuits.length ? user.assignedCircuits : (account.assignedCircuits || []),
    assignedSchool: user.assignedSchool || account.assignedSchool || account.schoolName || "",
    assignedVehicleId: user.assignedVehicleId || account.assignedVehicleId || account.vehicleId || ""
  };
}

async function withTransportProfileData(account) {
  if (!account?.id || !["driver", "assistant"].includes(account.role)) return account;
  const profileCollection = account.role === "driver" ? "drivers" : "assistants";
  const profileDoc = await db.collection(profileCollection).doc(account.id).get();
  if (!profileDoc.exists) return account;
  const profile = { id: profileDoc.id, ...profileDoc.data() };
  return {
    ...profile,
    ...account,
    id: account.id,
    profileId: profile.id,
    transportManagerId: account.transportManagerId || profile.transportManagerId || "",
    assignedCircuits: Array.isArray(account.assignedCircuits) && account.assignedCircuits.length
      ? account.assignedCircuits
      : (Array.isArray(profile.assignedCircuits) && profile.assignedCircuits.length ? profile.assignedCircuits : (profile.schoolCircuit ? [profile.schoolCircuit] : [])),
    assignedSchool: account.assignedSchool || profile.assignedSchool || profile.schoolName || "",
    assignedVehicleId: account.assignedVehicleId || profile.assignedVehicleId || profile.vehicleId || ""
  };
}

async function findAccount({ role, loginMode, identifier, studentLastName }) {
  if (
    role === "system_admin" &&
    loginMode === "system_admin" &&
    identifierMatches(SYSTEM_ADMIN_ACCOUNT, identifier)
  ) {
    const adminDoc = await db.collection("users").doc(SYSTEM_ADMIN_ACCOUNT.id).get();
    const storedAdmin = adminDoc.exists ? { id: adminDoc.id, ...adminDoc.data() } : {};
    return {
      user: { ...SYSTEM_ADMIN_ACCOUNT, ...storedAdmin, id: SYSTEM_ADMIN_ACCOUNT.id, isActive: storedAdmin.isActive !== false },
      collectionName: "users"
    };
  }
  const collectionNames = ROLE_COLLECTIONS[role] || ["users"];
  for (const collectionName of collectionNames) {
    const snapshot = await db.collection(collectionName).get();
    for (const doc of snapshot.docs) {
      const user = { id: doc.id, ...doc.data() };
      if (user.isActive === false) continue;
      if (role === "parent") {
        if (user.role && user.role !== "parent") continue;
        if (await parentHasChildName(user, studentLastName || identifier)) return { user, collectionName };
        continue;
      }
      const inferredRole = gtsRuleRole(user);
      if (!VALID_ROLES.has(inferredRole || "")) continue;
      if (!roleMatchesLoginMode(loginMode || role, { ...user, role: user.role || inferredRole })) continue;
      if (!identifierMatches(user, identifier)) continue;
      const hydratedUser = await withTransportProfileData(await withLinkedUserCredentials(collectionName, { ...user, role: user.role || inferredRole }));
      return { user: hydratedUser, collectionName };
    }
  }
  return null;
}

function claimsForUser(user) {
  const ruleRole = gtsRuleRole(user);
  return {
    userId: user.id || "",
    profileId: user.profileId || "",
    role: ruleRole,
    adminType: user.adminType || "",
    visualTheme: user.visualTheme || "",
    identifierNumber: user.identifierNumber || user.identifier || "",
    transportManagerId: user.transportManagerId || (["transport_manager", "admin", "spw"].includes(ruleRole) ? user.id || "" : ""),
    assignedCircuits: Array.isArray(user.assignedCircuits) ? user.assignedCircuits : [],
    assignedSchools: Array.isArray(user.assignedSchools) ? user.assignedSchools : (user.assignedSchool ? [user.assignedSchool] : []),
    linkedChildrenIds: Array.isArray(user.linkedChildrenIds) ? user.linkedChildrenIds : []
  };
}

function publicUserForClient(user) {
  const forbidden = new Set([
    "accessCode",
    "temporaryAccessCode",
    "accessCodeHash",
    "temporaryAccessHash",
    "passwordHash",
    "recoveryCodeHash",
    "recoveryAnswerHash",
    "code",
    "displayCode"
  ]);
  return Object.fromEntries(Object.entries(user || {}).filter(([key]) => !forbidden.has(key)));
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function normalizePhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function fullName(user = {}) {
  return `${user.firstName || ""} ${user.lastName || ""}`.trim();
}

function chunk(values = [], size = 500) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) chunks.push(values.slice(index, index + size));
  return chunks;
}

function notificationTitleForMessage(message = {}, fallback = "Nouveau message") {
  if (message.title) return String(message.title);
  if (message.authorName) return `${fallback} de ${message.authorName}`;
  return fallback;
}

function messageBody(message = {}, fallback = "Ouvrez GTS pour consulter le message.") {
  return String(message.body || message.message || message.text || fallback).slice(0, 180);
}

function truncateText(value, maxLength = 1200) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function supportRequestEmailConfig() {
  return {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SUPPORT_EMAIL_FROM || process.env.SMTP_USER || "",
    to: process.env.SUPPORT_EMAIL_TO || DEFAULT_SUPPORT_EMAIL_TO
  };
}

function requesterEmailForSupportRequest(request = {}) {
  return String(request.context?.userEmail || request.context?.email || request.userEmail || request.email || "").trim();
}

function supportTicketNumberForDate(date = new Date()) {
  const stamp = date.getTime();
  const day = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `GTS-${day}-${String(stamp).slice(-6)}`;
}

function supportTicketNumber(request = {}) {
  if (request.ticketNumber) return String(request.ticketNumber);
  const source = request.createdAt ? new Date(request.createdAt) : new Date(Number(String(request.id || "").replace(/\D/g, "")) || Date.now());
  if (Number.isFinite(source.getTime())) return supportTicketNumberForDate(source);
  return request.id || "Ticket support";
}

function supportHistoryEntry(label, by = "system") {
  return {
    id: `history-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    label,
    at: new Date().toISOString(),
    by,
    byName: by === "system" ? "Système" : by
  };
}

function supportRequestContextRows(context = {}) {
  return [
    ["Téléphone", context.userPhone || context.phone],
    ["E-mail", context.userEmail || context.email],
    ["Enfant", context.childName],
    ["École", context.schoolName],
    ["Circuit", context.circuitNumber],
    ["Chauffeur", context.driverName],
    ["Convoyeuse", context.assistantName]
  ].filter(([, value]) => String(value || "").trim());
}

function supportRequestEmailText(request = {}) {
  const rows = [
    ["Ticket", supportTicketNumber(request)],
    ["Demande", request.id],
    ["Nom", request.userName],
    ["Rôle", request.userRole],
    ["Catégorie", request.category || "technical"],
    ["Priorité", request.priority || "normal"],
    ["Échéance", request.dueAt || ""],
    ["Sujet", request.subject],
    ["Statut", request.status],
    ["Date", request.createdAt],
    ...supportRequestContextRows(request.context || {})
  ];
  return [
    "Nouvelle demande de support GTS",
    "",
    ...rows.map(([label, value]) => `${label} : ${value}`),
    "",
    "Message :",
    truncateText(request.message || ""),
    "",
    "Ouvrir l’application : https://gestion-transport-scolaire.web.app/app"
  ].join("\n");
}

function supportOverdueDigestEmailText(requests = []) {
  return [
    "Tickets support en retard",
    "",
    `${requests.length} ticket(s) ont dépassé leur échéance SLA.`,
    "",
    ...requests.flatMap((request, index) => [
      `${index + 1}. ${supportTicketNumber(request)} - ${request.subject || "Sans sujet"}`,
      `Statut : ${request.status || "pending"}`,
      `Priorité : ${request.priority || "normal"}`,
      `Catégorie : ${request.category || "technical"}`,
      `Demandeur : ${request.userName || ""} (${request.userRole || ""})`,
      `Échéance : ${request.dueAt || ""}`,
      `Assigné : ${request.assignedSupport || "non assigné"}`,
      ""
    ]),
    "Ouvrir l’application : https://gestion-transport-scolaire.web.app/app"
  ].join("\n");
}

function supportDurationLabel(ms) {
  const hours = Math.round(ms / (60 * 60 * 1000));
  if (hours < 24) return `${hours} h`;
  return `${Math.round(hours / 24)} j`;
}

function supportBreakdownText(requests = [], key = "category") {
  const counts = new Map();
  requests.forEach((request) => {
    const label = String(request[key] || (key === "priority" ? "normal" : "technical"));
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => `${label}: ${count}`)
    .join(", ") || "aucune donnée";
}

function supportReportMetricsForRequests(requests = []) {
  const closed = requests.filter((request) => ["resolved", "closed"].includes(String(request.status || "")));
  const resolvedDurations = closed
    .map((request) => {
      const start = new Date(request.createdAt || "").getTime();
      const end = new Date(request.resolvedAt || request.closedAt || request.updatedAt || "").getTime();
      return Number.isFinite(start) && Number.isFinite(end) && end >= start ? end - start : null;
    })
    .filter((value) => value !== null);
  const ratings = requests.map((request) => Number(request.satisfactionRating)).filter((value) => Number.isFinite(value) && value > 0);
  const slaEligible = requests.filter((request) => ["resolved", "closed"].includes(String(request.status || "")) && request.dueAt);
  const slaOk = slaEligible.filter((request) => {
    const due = new Date(request.dueAt || "").getTime();
    const done = new Date(request.resolvedAt || request.closedAt || request.updatedAt || "").getTime();
    return Number.isFinite(due) && Number.isFinite(done) && done <= due;
  }).length;
  const opened = requests.filter((request) => !["resolved", "closed"].includes(String(request.status || "")));
  const overdue = opened.filter((request) => {
    const dueAt = new Date(request.dueAt || "").getTime();
    return Number.isFinite(dueAt) && dueAt < Date.now();
  });
  return {
    total: requests.length,
    opened: opened.length,
    closed: closed.length,
    overdue: overdue.length,
    unassigned: opened.filter((request) => !request.assignedSupport).length,
    urgent: opened.filter((request) => request.priority === "urgent").length,
    anonymized: requests.filter((request) => request.anonymizedAt).length,
    averageResolution: resolvedDurations.length ? supportDurationLabel(resolvedDurations.reduce((sum, value) => sum + value, 0) / resolvedDurations.length) : "N/A",
    averageSatisfaction: ratings.length ? `${(ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1)}/5` : "N/A",
    slaCompliance: slaEligible.length ? `${Math.round((slaOk / slaEligible.length) * 100)}%` : "N/A",
    categoryBreakdown: supportBreakdownText(requests, "category"),
    priorityBreakdown: supportBreakdownText(requests, "priority")
  };
}

function supportWeeklyReportEmailText(metrics = {}, requests = []) {
  const latest = [...requests]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 10);
  return [
    "Rapport hebdomadaire support GTS",
    "",
    `Total tickets: ${metrics.total}`,
    `Ouverts: ${metrics.opened}`,
    `Résolus / fermés: ${metrics.closed}`,
    `En retard: ${metrics.overdue}`,
    `Non assignés: ${metrics.unassigned}`,
    `Urgents: ${metrics.urgent}`,
    `Tickets anonymisés: ${metrics.anonymized}`,
    `Temps moyen de résolution: ${metrics.averageResolution}`,
    `Satisfaction moyenne: ${metrics.averageSatisfaction}`,
    `Respect SLA: ${metrics.slaCompliance}`,
    "",
    `Catégories: ${metrics.categoryBreakdown}`,
    `Priorités: ${metrics.priorityBreakdown}`,
    "",
    "Derniers tickets mis à jour:",
    ...latest.map((request, index) => `${index + 1}. ${supportTicketNumber(request)} - ${request.status || "pending"} - ${request.subject || "Sans sujet"}`),
    "",
    "Ouvrir l’application : https://gestion-transport-scolaire.web.app/app"
  ].join("\n");
}

function supportRequestConfirmationEmailText(request = {}) {
  return [
    "Bonjour,",
    "",
    "Votre demande de support a bien été reçue.",
    "",
    `Numéro de ticket : ${supportTicketNumber(request)}`,
    `Identifiant technique : ${request.id || ""}`,
    `Sujet : ${request.subject || ""}`,
    `Date : ${request.createdAt || ""}`,
    "",
    "Message transmis :",
    truncateText(request.message || ""),
    "",
    "Le support vous répondra dès que possible.",
    "",
    "Gestion Transport Scolaire"
  ].join("\n");
}

function supportReplyEmailText(request = {}, message = {}) {
  return [
    "Bonjour,",
    "",
    "Une réponse a été ajoutée à votre demande de support.",
    "",
    `Numéro de ticket : ${supportTicketNumber(request)}`,
    `Identifiant technique : ${request.id || ""}`,
    `Sujet : ${request.subject || ""}`,
    `Réponse de : ${message.authorName || "Support"}`,
    `Date : ${message.createdAt || ""}`,
    "",
    "Réponse :",
    truncateText(message.text || ""),
    "",
    "Vous pouvez consulter votre demande dans l’application GTS.",
    "",
    "Gestion Transport Scolaire"
  ].join("\n");
}

async function sendMailMessage({ to, replyTo, subject, text } = {}) {
  const config = supportRequestEmailConfig();
  if (!config.host || !config.user || !config.pass || !config.from || !to) {
    console.warn("support email skipped: SMTP configuration missing", {
      hasHost: Boolean(config.host),
      hasUser: Boolean(config.user),
      hasPass: Boolean(config.pass),
      hasFrom: Boolean(config.from),
      hasTo: Boolean(to)
    });
    return { sent: false, reason: "missing_config" };
  }
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
  await transporter.sendMail({
    from: config.from,
    to,
    replyTo,
    subject,
    text
  });
  return { sent: true };
}

async function sendSupportRequestEmail(request = {}) {
  const config = supportRequestEmailConfig();
  return sendMailMessage({
    to: config.to,
    replyTo: requesterEmailForSupportRequest(request) || undefined,
    subject: `[GTS Support] ${supportTicketNumber(request)} - ${truncateText(request.subject || "Nouvelle demande", 100)}`,
    text: supportRequestEmailText(request)
  });
}

async function sendSupportOverdueDigestEmail(requests = []) {
  const config = supportRequestEmailConfig();
  return sendMailMessage({
    to: config.to,
    subject: `[GTS Support] ${requests.length} ticket(s) en retard`,
    text: supportOverdueDigestEmailText(requests)
  });
}

async function sendSupportWeeklyReportEmail(metrics = {}, requests = []) {
  const config = supportRequestEmailConfig();
  return sendMailMessage({
    to: config.to,
    subject: "[GTS Support] Rapport hebdomadaire",
    text: supportWeeklyReportEmailText(metrics, requests)
  });
}

async function processSupportWeeklyReport({ triggeredBy = "schedule" } = {}) {
  const snapshot = await db.collection("supportRequests").get();
  const requests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const metrics = supportReportMetricsForRequests(requests);
  const result = await sendSupportWeeklyReportEmail(metrics, requests);
  const checkedAt = new Date().toISOString();
  await db.collection("supportReports").doc("weekly").set({
    lastSentAt: checkedAt,
    lastStatus: result.sent ? "sent" : "skipped",
    lastReason: result.reason || "",
    triggeredBy,
    metrics
  }, { merge: true });
  console.log("support weekly report processed", {
    status: result.sent ? "sent" : "skipped",
    reason: result.reason || "",
    total: metrics.total,
    triggeredBy
  });
  return { status: result.sent ? "sent" : "skipped", reason: result.reason || "", total: metrics.total };
}

async function processSupportOverdueDigest({ force = false, triggeredBy = "schedule" } = {}) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const snapshot = await db.collection("supportRequests").get();
  const overdue = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data(), ref: doc.ref }))
    .filter((request) => !["resolved", "closed"].includes(String(request.status || "")))
    .filter((request) => {
      const dueAt = new Date(request.dueAt || "").getTime();
      return Number.isFinite(dueAt) && dueAt < now.getTime();
    })
    .filter((request) => force || String(request.lastOverdueDigestAt || "").slice(0, 10) !== today)
    .sort((a, b) => new Date(a.dueAt || 0) - new Date(b.dueAt || 0))
    .slice(0, 50);
  if (!overdue.length) {
    console.log("support overdue digest skipped: no overdue ticket", { triggeredBy, force });
    await db.collection("supportReports").doc("overdueDigest").set({
      lastRunAt: now.toISOString(),
      lastStatus: "skipped",
      lastReason: "no_overdue_ticket",
      lastCount: 0,
      triggeredBy,
      force
    }, { merge: true });
    return { count: 0, status: "skipped", reason: "no_overdue_ticket" };
  }
  const result = await sendSupportOverdueDigestEmail(overdue);
  const batch = db.batch();
  const checkedAt = now.toISOString();
  overdue.forEach((request) => {
    batch.set(request.ref, {
      lastOverdueDigestAt: checkedAt,
      lastOverdueDigestStatus: result.sent ? "sent" : "skipped",
      lastOverdueDigestReason: result.reason || "",
      lastOverdueDigestTriggeredBy: triggeredBy
    }, { merge: true });
  });
  await batch.commit();
  await db.collection("supportReports").doc("overdueDigest").set({
    lastRunAt: checkedAt,
    lastStatus: result.sent ? "sent" : "skipped",
    lastReason: result.reason || "",
    lastCount: overdue.length,
    triggeredBy,
    force
  }, { merge: true });
  console.log("support overdue digest processed", {
    count: overdue.length,
    status: result.sent ? "sent" : "skipped",
    reason: result.reason || "",
    triggeredBy,
    force
  });
  return { count: overdue.length, status: result.sent ? "sent" : "skipped", reason: result.reason || "" };
}

function anonymizedSupportRequestPayload(request = {}, anonymizedAt = new Date().toISOString()) {
  return {
    userId: `anonymized-${request.id || "support"}`,
    userName: "Demandeur anonymisé",
    subject: `${supportTicketNumber(request)} - ticket anonymisé`,
    message: "[Anonymisé]",
    context: {},
    assignedSupport: "",
    internalNote: "",
    readBy: [],
    requesterConfirmationEmailReason: "",
    requesterConfirmationEmailError: "",
    emailNotificationError: "",
    anonymizedAt,
    anonymizedReason: "closed_12_months",
    updatedAt: anonymizedAt,
    history: [supportHistoryEntry("Anonymisation RGPD après 12 mois de clôture")]
  };
}

function anonymizedSupportMessagePayload(request = {}, anonymizedAt = new Date().toISOString()) {
  return {
    text: "[Message anonymisé]",
    authorId: `anonymized-${request.id || "support"}`,
    authorName: "Anonymisé",
    readBy: [],
    emailToRequesterError: "",
    anonymizedAt
  };
}

async function processClosedSupportAnonymization({ triggeredBy = "schedule" } = {}) {
  const now = new Date();
  const threshold = now.getTime() - 365 * 24 * 60 * 60 * 1000;
  const snapshot = await db.collection("supportRequests").where("status", "==", "closed").get();
  const toAnonymize = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data(), ref: doc.ref }))
    .filter((request) => !request.anonymizedAt)
    .filter((request) => {
      const closedAt = new Date(request.closedAt || request.updatedAt || "").getTime();
      return Number.isFinite(closedAt) && closedAt <= threshold;
    })
    .slice(0, 25);
  if (!toAnonymize.length) {
    console.log("support anonymization skipped: no closed ticket", { triggeredBy });
    await db.collection("supportReports").doc("anonymization").set({
      lastRunAt: now.toISOString(),
      lastStatus: "skipped",
      lastReason: "no_closed_ticket",
      lastCount: 0,
      lastMessageCount: 0,
      triggeredBy
    }, { merge: true });
    return { count: 0, status: "skipped", reason: "no_closed_ticket" };
  }
  const anonymizedAt = now.toISOString();
  let messageCount = 0;
  for (const supportRequest of toAnonymize) {
    const batch = db.batch();
    batch.set(supportRequest.ref, anonymizedSupportRequestPayload(supportRequest, anonymizedAt), { merge: true });
    const messagesSnapshot = await supportRequest.ref.collection("messages").limit(100).get();
    messagesSnapshot.docs.forEach((messageDoc) => {
      batch.set(messageDoc.ref, anonymizedSupportMessagePayload(supportRequest, anonymizedAt), { merge: true });
      messageCount += 1;
    });
    await batch.commit();
  }
  console.log("support tickets anonymized", {
    count: toAnonymize.length,
    messageCount,
    triggeredBy
  });
  await db.collection("supportReports").doc("anonymization").set({
    lastRunAt: anonymizedAt,
    lastStatus: "done",
    lastReason: "",
    lastCount: toAnonymize.length,
    lastMessageCount: messageCount,
    triggeredBy
  }, { merge: true });
  return { count: toAnonymize.length, messageCount, status: "done" };
}

async function sendSupportRequestConfirmationEmail(request = {}) {
  const requesterEmail = requesterEmailForSupportRequest(request);
  if (!requesterEmail) return { sent: false, reason: "missing_requester_email" };
  return sendMailMessage({
    to: requesterEmail,
    subject: `[GTS Support] Confirmation ${supportTicketNumber(request)} - ${truncateText(request.subject || request.id || "Demande reçue", 80)}`,
    text: supportRequestConfirmationEmailText(request)
  });
}

async function sendSupportReplyEmail(request = {}, message = {}) {
  const requesterEmail = requesterEmailForSupportRequest(request);
  if (!requesterEmail) return { sent: false, reason: "missing_requester_email" };
  return sendMailMessage({
    to: requesterEmail,
    subject: `[GTS Support] Réponse ${supportTicketNumber(request)} - ${truncateText(request.subject || request.id || "Demande support", 80)}`,
    text: supportReplyEmailText(request, message)
  });
}

function tokenEntriesFromProfile(profile = {}) {
  const entries = [];
  if (profile.fcmToken) entries.push({ token: profile.fcmToken });
  if (Array.isArray(profile.fcmTokens)) {
    profile.fcmTokens.forEach((entry) => {
      if (typeof entry === "string") entries.push({ token: entry });
      else if (entry?.token) entries.push(entry);
    });
  }
  return entries.filter((entry) => entry.token);
}

function webPushSubscriptionsFromProfile(profile = {}) {
  return (Array.isArray(profile.webPushSubscriptions) ? profile.webPushSubscriptions : [])
    .filter((subscription) => subscription?.endpoint && subscription?.keys?.p256dh && subscription?.keys?.auth)
    .filter((subscription) => subscription.platform === "ios-pwa" || String(subscription.endpoint || "").includes("web.push.apple.com"));
}

function linkedTransportProfileForNotificationUser(user = {}, transportProfiles = []) {
  if (!["driver", "assistant"].includes(gtsRuleRole(user))) return null;
  return transportProfiles.find((profile) => profile.id === user.profileId || profile.id === user.id || profile.firebaseUid === user.firebaseUid)
    || transportProfiles.find((profile) => normalizePhone(profile.phone) && normalizePhone(profile.phone) === normalizePhone(user.phone))
    || transportProfiles.find((profile) => normalize(fullName(profile)) && normalize(fullName(profile)) === normalize(fullName(user)))
    || null;
}

async function allNotificationProfiles() {
  const [usersSnapshot, parentsSnapshot, driversSnapshot, assistantsSnapshot] = await Promise.all([
    db.collection("users").get(),
    db.collection("parents").get(),
    db.collection("drivers").get(),
    db.collection("assistants").get()
  ]);
  const drivers = driversSnapshot.docs.map((doc) => ({ id: doc.id, collectionName: "drivers", ...doc.data(), role: "driver" }));
  const assistants = assistantsSnapshot.docs.map((doc) => ({ id: doc.id, collectionName: "assistants", ...doc.data(), role: "assistant" }));
  const users = usersSnapshot.docs.map((doc) => {
    const user = { id: doc.id, collectionName: "users", ...doc.data() };
    const role = gtsRuleRole(user);
    const linkedProfile = linkedTransportProfileForNotificationUser(user, role === "driver" ? drivers : role === "assistant" ? assistants : []);
    const notificationAliases = unique([
      user.id,
      user.firebaseUid,
      user.profileId,
      user.userId,
      linkedProfile?.id,
      linkedProfile?.firebaseUid,
      linkedProfile?.profileId,
      linkedProfile?.userId
    ]);
    return {
      ...user,
      profileId: user.profileId || linkedProfile?.id || "",
      notificationAliases
    };
  });
  return [
    ...users,
    ...parentsSnapshot.docs.map((doc) => ({ id: doc.id, collectionName: "parents", ...doc.data() }))
  ].filter((profile) => profile.isActive !== false && profile.notificationsEnabled !== false);
}

async function profilesForRecipients({ recipientIds = [], recipientRoles = [], excludeUserIds = [] } = {}) {
  const recipientIdSet = new Set(recipientIds.filter(Boolean));
  const recipientRoleSet = new Set(recipientRoles.filter(Boolean));
  const excluded = new Set(excludeUserIds.filter(Boolean));
  const profiles = await allNotificationProfiles();
  return profiles.filter((profile) => {
    const identityIds = [profile.id, profile.firebaseUid, profile.profileId, profile.userId].filter(Boolean);
    if (identityIds.some((id) => excluded.has(id))) return false;
    if (identityIds.some((id) => recipientIdSet.has(id))) return true;
    return recipientRoleSet.has(gtsRuleRole(profile));
  });
}

async function sendPushToProfiles(profiles = [], payload = {}) {
  const tokens = unique(profiles.flatMap((profile) => tokenEntriesFromProfile(profile).map((entry) => entry.token)));
  const subscriptionsByEndpoint = new Map();
  profiles.flatMap(webPushSubscriptionsFromProfile).forEach((subscription) => {
    if (subscription?.endpoint) subscriptionsByEndpoint.set(subscription.endpoint, subscription);
  });
  const subscriptions = [...subscriptionsByEndpoint.values()];
  const data = Object.fromEntries(
    Object.entries(payload.data || {}).map(([key, value]) => [key, String(value ?? "")])
  );
  const title = String(payload.title || "Gestion Transport Scolaire");
  const body = String(payload.body || "");
  await Promise.allSettled([
    ...chunk(tokens).map((tokenChunk) => messaging.sendEachForMulticast({
      tokens: tokenChunk,
      notification: { title, body },
      data,
      webpush: {
        notification: {
          icon: "/assets/icon-192.png",
          badge: "/assets/icon-192.png"
        },
        fcmOptions: {
          link: payload.link || "https://gestion-transport-scolaire.web.app/app"
        }
      }
    })),
    ...subscriptions.map((subscription) => webpush.sendNotification(subscription, JSON.stringify({
      title,
      body,
      data,
      url: payload.link || "/app"
    })).catch((error) => {
      if (![404, 410].includes(error?.statusCode)) {
        console.warn("webpush send failed", error?.statusCode || "", error?.message || String(error));
      }
    }))
  ]);
}

function profileIdentityIds(profile = {}) {
  return unique([profile.id, profile.firebaseUid, profile.profileId, profile.userId, ...(profile.notificationAliases || [])]);
}

function profileMatchesAuth(profile = {}, authContext = {}) {
  const token = authContext.token || {};
  const wanted = new Set(unique([authContext.uid, token.uid, token.userId, token.profileId]));
  return profileIdentityIds(profile).some((id) => wanted.has(id));
}

async function sendPushToRecipients({ recipientIds = [], recipientRoles = [], excludeUserIds = [], title, body, data = {}, link } = {}) {
  const profiles = await profilesForRecipients({ recipientIds, recipientRoles, excludeUserIds });
  await sendPushToProfiles(profiles, { title, body, data, link });
}

async function sendMessagePush(message = {}, context = {}) {
  const recipientIds = unique(message.recipientIds || []);
  if (!recipientIds.length) return;
  await sendPushToRecipients({
    recipientIds,
    excludeUserIds: [message.authorId],
    title: notificationTitleForMessage(message),
    body: messageBody(message),
    link: "https://gestion-transport-scolaire.web.app/app",
    data: {
      type: "message",
      fcmType: "message",
      messageId: message.id || context.messageId || "",
      conversationId: context.conversationId || "",
      collectionName: context.collectionName || "",
      url: "/app"
    }
  });
}

function isScheduledPrivateParentMessage(message = {}) {
  return message.authorRole === "parent" && message.deliveryStatus === "scheduled" && Boolean(message.deliverAt);
}

function belgiumDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("fr-BE", {
    timeZone: BELGIUM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type)?.value || "";
  const key = `${value("year")}-${value("month")}-${value("day")}`;
  return {
    key,
    day: new Date(`${key}T12:00:00Z`).getUTCDay(),
    hour: Number(value("hour"))
  };
}

function isBelgiumSchoolBlockedDateKey(key = "") {
  return BELGIUM_SCHOOL_BLOCKED_PERIODS.some((period) => key >= period.start && key <= period.end);
}

function isParentDeliveryMomentAllowed(now = new Date()) {
  const parts = belgiumDateParts(now);
  if ([0, 6].includes(parts.day)) return false;
  if (isBelgiumSchoolBlockedDateKey(parts.key)) return false;
  return parts.hour >= 6 && parts.hour < 18;
}

function isPrivateMessageDeliverable(message = {}, now = new Date()) {
  if (!isScheduledPrivateParentMessage(message)) return true;
  if (!isParentDeliveryMomentAllowed(now)) return false;
  const deliverAt = new Date(message.deliverAt).getTime();
  return Number.isFinite(deliverAt) && deliverAt <= now.getTime();
}

export const loginWithGtsCode = onCall({ region: "europe-west1", invoker: "public" }, async (request) => {
  const payload = request.data || {};
  const role = String(payload.role || "").trim();
  const loginMode = String(payload.loginMode || role).trim();
  const identifier = String(payload.identifier || "").trim();
  const code = String(payload.code || "").trim();
  const studentLastName = String(payload.studentLastName || "").trim();

  if (!role || !code || !VALID_ROLES.has(role)) {
    throw new HttpsError("invalid-argument", "Identifiants invalides.");
  }

  const found = await findAccount({ role, loginMode, identifier, studentLastName });
  if (!found) {
    throw new HttpsError("unauthenticated", "Identifiant ou code incorrect.");
  }

  const match = credentialMatches(found.user, code);
  if (!match.ok) {
    throw new HttpsError("unauthenticated", "Identifiant ou code incorrect.");
  }

  const uid = found.user.id;
  const claims = claimsForUser(found.user);
  let token = "";
  try {
    token = await auth.createCustomToken(uid, claims);
  } catch (error) {
    console.error("loginWithGtsCode:createCustomToken failed", {
      uid,
      role: claims.role,
      code: error?.code || "",
      message: error?.message || String(error)
    });
    throw new HttpsError("internal", `Token Firebase impossible: ${error?.code || error?.message || "erreur inconnue"}`);
  }
  try {
    const loginPatch = {
      firebaseUid: uid,
      lastFirebaseAuthAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (found.user.profileId) loginPatch.profileId = found.user.profileId;
    if (found.user.transportManagerId) loginPatch.transportManagerId = found.user.transportManagerId;
    if (claims.role) loginPatch.role = found.user.role || claims.role;
    await db.collection(found.collectionName).doc(found.user.id).set(loginPatch, { merge: true });
  } catch (error) {
    console.error("loginWithGtsCode:firestoreUpdate failed", {
      collectionName: found.collectionName,
      userId: found.user.id,
      code: error?.code || "",
      message: error?.message || String(error)
    });
    throw new HttpsError("internal", `Mise à jour compte impossible: ${error?.code || error?.message || "erreur inconnue"}`);
  }

  return {
    token,
    uid,
    role: claims.role,
    userId: found.user.id,
    collectionName: found.collectionName,
    user: publicUserForClient({ ...found.user, firebaseUid: uid }),
    usedTemporary: match.usedTemporary,
    firstLoginRequired: match.usedTemporary || found.user.firstLoginCompleted === false || found.user.resetRequired === true
  };
});

export const testCurrentUserPush = onCall({ region: FCM_REGION }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Connexion Firebase requise.");
  }
  const profiles = (await allNotificationProfiles()).filter((profile) => profileMatchesAuth(profile, request.auth));
  const tokens = unique(profiles.flatMap((profile) => tokenEntriesFromProfile(profile).map((entry) => entry.token)));
  const subscriptions = unique(profiles.flatMap((profile) => webPushSubscriptionsFromProfile(profile).map((subscription) => subscription.endpoint)));
  const appleSubscriptions = subscriptions.filter((endpoint) => String(endpoint || "").includes("web.push.apple.com"));
  if (profiles.length) {
    await sendPushToProfiles(profiles, {
      title: "Test notification GTS",
      body: "Si vous voyez ceci, les notifications fonctionnent.",
      link: "https://gestion-transport-scolaire.web.app/app",
      data: {
        type: "test",
        fcmType: "test",
        notificationId: `test-${Date.now()}`,
        url: "/app"
      }
    });
  }
  return {
    uid: request.auth.uid,
    userId: request.auth.token?.userId || "",
    profileId: request.auth.token?.profileId || "",
    profileCount: profiles.length,
    profileIds: profiles.map((profile) => profile.id),
    fcmTokenCount: tokens.length,
    webPushSubscriptionCount: subscriptions.length,
    appleWebPushSubscriptionCount: appleSubscriptions.length,
    attempted: profiles.length > 0
  };
});

function authIdentityIds(authContext = {}) {
  return unique([
    authContext.uid,
    authContext.token?.userId,
    authContext.token?.profileId
  ]);
}

function canManageSupportEmail(authContext = {}) {
  const role = authContext.token?.role || "";
  if (["support", "system_admin"].includes(role)) return true;
  return role === "admin" && (authContext.token?.adminType === "system" || authContext.token?.identifierNumber === "6183");
}

function directMessageRoleAllowed(authContext = {}, conversation = {}, message = {}) {
  const role = authContext.token?.role || "";
  if (!["transport_manager", "spw", "driver", "assistant", "admin"].includes(role)) return false;
  if (role === "admin" && (authContext.token?.adminType === "system" || authContext.token?.identifierNumber === "6183")) return false;
  return role === conversation.senderRole
    || role === conversation.recipientRole
    || role === message.authorRole;
}

function directMessageIdentityAllowed(authContext = {}, conversation = {}, message = {}) {
  const ids = authIdentityIds(authContext);
  const allowedIds = unique([
    conversation.senderId,
    conversation.recipientId,
    message.authorId,
    ...(Array.isArray(conversation.participants) ? conversation.participants : [])
  ]);
  return ids.some((id) => allowedIds.includes(id));
}

export const sendDirectMessage = onCall({ region: FCM_REGION }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Connexion Firebase requise.");
  }
  const conversation = request.data?.conversation || {};
  const message = request.data?.message || {};
  const conversationId = String(conversation.conversationId || "").trim();
  const messageId = String(message.id || "").trim();
  const text = String(message.text || "").trim();
  if (!conversationId || !messageId || !text) {
    throw new HttpsError("invalid-argument", "Conversation, identifiant message et texte requis.");
  }
  if (text.length > 4000 || String(conversation.subject || "").length > 180) {
    throw new HttpsError("invalid-argument", "Message trop long.");
  }
  if (
    !directMessageIdentityAllowed(request.auth, conversation, message)
    && !directMessageRoleAllowed(request.auth, conversation, message)
  ) {
    throw new HttpsError("permission-denied", "Utilisateur non autorisé pour cette conversation.");
  }

  const now = new Date().toISOString();
  const storedConversation = {
    ...conversation,
    conversationId,
    participants: Array.isArray(conversation.participants) ? unique(conversation.participants.map(String)) : authIdentityIds(request.auth),
    updatedAt: conversation.updatedAt || now,
    createdAt: conversation.createdAt || now
  };
  const storedMessage = {
    ...message,
    id: messageId,
    text,
    createdAt: message.createdAt || now,
    readBy: Array.isArray(message.readBy) ? unique(message.readBy.map(String)) : authIdentityIds(request.auth)
  };

  const batch = db.batch();
  batch.set(db.collection("directMessageEvents").doc(messageId), {
    id: messageId,
    conversationId,
    conversation: storedConversation,
    message: storedMessage,
    visibleIds: unique([...(storedConversation.participants || []), storedConversation.senderId, storedConversation.recipientId, storedMessage.authorId]),
    visibleRoles: unique([storedConversation.senderRole, storedConversation.recipientRole, storedMessage.authorRole]),
    transportManagerId: storedConversation.transportManagerId || storedMessage.transportManagerId || "",
    createdAt: storedMessage.createdAt || now,
    updatedAt: now
  }, { merge: true });
  batch.set(db.collection("directMessageSendLogs").doc(`${conversationId}_${messageId}`), {
    id: `${conversationId}_${messageId}`,
    conversationId,
    messageId,
    authorId: storedMessage.authorId || "",
    authorRole: storedMessage.authorRole || "",
    senderRole: storedConversation.senderRole || "",
    recipientRole: storedConversation.recipientRole || "",
    createdAt: now,
    authUid: request.auth.uid,
    authUserId: request.auth.token?.userId || "",
    authProfileId: request.auth.token?.profileId || "",
    authRole: request.auth.token?.role || "",
    status: "written"
  }, { merge: true });
  await batch.commit();
  return { ok: true, conversationId, messageId };
});

export const notifyPrivateMessageCreated = onDocumentCreated({
  region: FCM_REGION,
  document: "privateMessages/{conversationId}/messages/{messageId}"
}, async (event) => {
  const message = { id: event.params.messageId, ...event.data?.data() };
  if (!isPrivateMessageDeliverable(message)) return;
  await sendMessagePush(message, {
    collectionName: "privateMessages",
    conversationId: event.params.conversationId,
    messageId: event.params.messageId
  });
});

export const deliverScheduledPrivateMessages = onSchedule({
  region: FCM_REGION,
  schedule: "every 5 minutes",
  timeZone: "Europe/Brussels"
}, async () => {
  const nowDate = new Date();
  const now = nowDate.toISOString();
  const snapshot = await db.collectionGroup("messages")
    .where("deliveryStatus", "==", "scheduled")
    .limit(200)
    .get();
  const deliveries = [];
  snapshot.forEach((docSnap) => {
    const message = { id: docSnap.id, ...docSnap.data() };
    if (!isPrivateMessageDeliverable(message, nowDate)) return;
    const conversationRef = docSnap.ref.parent?.parent;
    if (!conversationRef || conversationRef.parent?.id !== "privateMessages") return;
    deliveries.push({ docRef: docSnap.ref, conversationId: conversationRef.id, message });
  });
  for (const delivery of deliveries) {
    const deliveredMessage = {
      ...delivery.message,
      deliveryStatus: "delivered",
      deliveredAt: now
    };
    await delivery.docRef.set({
      deliveryStatus: "delivered",
      deliveredAt: now
    }, { merge: true });
    await sendMessagePush(deliveredMessage, {
      collectionName: "privateMessages",
      conversationId: delivery.conversationId,
      messageId: deliveredMessage.id
    });
  }
  console.log("deliverScheduledPrivateMessages", { checked: snapshot.size, delivered: deliveries.length });
});

export const notifyDirectMessageCreated = onDocumentCreated({
  region: FCM_REGION,
  document: "directMessages/{conversationId}/messages/{messageId}"
}, async (event) => {
  const message = { id: event.params.messageId, ...event.data?.data() };
  await sendMessagePush(message, {
    collectionName: "directMessages",
    conversationId: event.params.conversationId,
    messageId: event.params.messageId
  });
});

export const notifyDirectMessageEventCreated = onDocumentCreated({
  region: FCM_REGION,
  document: "directMessageEvents/{messageId}"
}, async (event) => {
  const eventData = event.data?.data() || {};
  const message = { id: event.params.messageId, ...(eventData.message || {}) };
  await sendMessagePush(message, {
    collectionName: "directMessageEvents",
    conversationId: eventData.conversationId || message.conversationId || "",
    messageId: event.params.messageId
  });
});

export const notifyTeamMessageCreated = onDocumentCreated({
  region: FCM_REGION,
  document: "teamMessages/{conversationId}/messages/{messageId}"
}, async (event) => {
  const message = { id: event.params.messageId, ...event.data?.data() };
  await sendMessagePush(message, {
    collectionName: "teamMessages",
    conversationId: event.params.conversationId,
    messageId: event.params.messageId
  });
});

export const notifySupportMessageCreated = onDocumentCreated({
  region: FCM_REGION,
  document: "supportRequests/{requestId}/messages/{messageId}"
}, async (event) => {
  const message = { id: event.params.messageId, ...event.data?.data() };
  const requestSnapshot = await db.collection("supportRequests").doc(event.params.requestId).get();
  const supportRequest = requestSnapshot.exists ? { id: event.params.requestId, ...requestSnapshot.data() } : { id: event.params.requestId };
  try {
    await sendPushToRecipients({
      recipientIds: unique([supportRequest.userId]),
      recipientRoles: ["support", "transport_manager", "spw"],
      excludeUserIds: [message.authorId],
      title: notificationTitleForMessage(message, "Message support"),
      body: messageBody(message),
      link: "https://gestion-transport-scolaire.web.app/app",
      data: {
        type: "support_message",
        fcmType: "message",
        requestId: event.params.requestId,
        messageId: event.params.messageId,
        url: "/app"
      }
    });
  } catch (error) {
    console.error("support push failed", {
      requestId: event.params.requestId,
      messageId: event.params.messageId,
      code: error?.code || "",
      message: error?.message || String(error)
    });
  }
  const requesterIds = unique([supportRequest.userId]);
  const isRequesterMessage = requesterIds.includes(message.authorId);
  const isSupportReply = !isRequesterMessage && ["support", "admin", "transport_manager", "spw", "system_admin"].includes(String(message.authorRole || ""));
  if (isSupportReply) {
    try {
      const result = await sendSupportReplyEmail(supportRequest, message);
      await event.data?.ref.set({
        emailToRequesterStatus: result.sent ? "sent" : "skipped",
        emailToRequesterReason: result.reason || "",
        emailToRequesterSentAt: result.sent ? new Date().toISOString() : "",
        emailToRequesterCheckedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("support reply email failed", {
        requestId: event.params.requestId,
        messageId: event.params.messageId,
        code: error?.code || "",
        message: error?.message || String(error)
      });
      await event.data?.ref.set({
        emailToRequesterStatus: "failed",
        emailToRequesterError: String(error?.message || error || "Erreur mail").slice(0, 500),
        emailToRequesterCheckedAt: new Date().toISOString()
      }, { merge: true });
    }
  }
});

export const emailSupportRequestCreated = onDocumentCreated({
  region: FCM_REGION,
  document: "supportRequests/{requestId}"
}, async (event) => {
  const request = { id: event.params.requestId, ...event.data?.data() };
  if (!request?.id || request.emailNotificationSentAt) return;
  try {
    const [internalSettled, confirmationSettled] = await Promise.allSettled([
      sendSupportRequestEmail(request),
      sendSupportRequestConfirmationEmail(request)
    ]);
    const internalResult = internalSettled.status === "fulfilled" ? internalSettled.value : { sent: false, reason: "send_failed" };
    const confirmationResult = confirmationSettled.status === "fulfilled" ? confirmationSettled.value : { sent: false, reason: "send_failed" };
    if (internalSettled.status === "rejected") {
      console.error("support internal email failed", {
        requestId: event.params.requestId,
        code: internalSettled.reason?.code || "",
        message: internalSettled.reason?.message || String(internalSettled.reason)
      });
    }
    if (confirmationSettled.status === "rejected") {
      console.error("support requester confirmation email failed", {
        requestId: event.params.requestId,
        code: confirmationSettled.reason?.code || "",
        message: confirmationSettled.reason?.message || String(confirmationSettled.reason)
      });
    }
    await event.data?.ref.set({
      emailNotificationStatus: internalResult.sent ? "sent" : "skipped",
      emailNotificationReason: internalResult.reason || "",
      emailNotificationError: internalSettled.status === "rejected" ? String(internalSettled.reason?.message || internalSettled.reason || "Erreur mail").slice(0, 500) : "",
      emailNotificationSentAt: internalResult.sent ? new Date().toISOString() : "",
      requesterConfirmationEmailStatus: confirmationResult.sent ? "sent" : "skipped",
      requesterConfirmationEmailReason: confirmationResult.reason || "",
      requesterConfirmationEmailError: confirmationSettled.status === "rejected" ? String(confirmationSettled.reason?.message || confirmationSettled.reason || "Erreur mail").slice(0, 500) : "",
      requesterConfirmationEmailSentAt: confirmationResult.sent ? new Date().toISOString() : "",
      emailNotificationCheckedAt: new Date().toISOString()
    }, { merge: true });
    console.log("support request emails processed", {
      requestId: event.params.requestId,
      ticketNumber: supportTicketNumber(request),
      internalStatus: internalResult.sent ? "sent" : "skipped",
      confirmationStatus: confirmationResult.sent ? "sent" : "skipped"
    });
  } catch (error) {
    console.error("support request email failed", {
      requestId: event.params.requestId,
      code: error?.code || "",
      message: error?.message || String(error)
    });
    await event.data?.ref.set({
      emailNotificationStatus: "failed",
      emailNotificationError: String(error?.message || error || "Erreur mail").slice(0, 500),
      emailNotificationCheckedAt: new Date().toISOString()
    }, { merge: true });
  }
});

export const resendSupportEmail = onCall({
  region: FCM_REGION
}, async (request) => {
  if (!request.auth || !canManageSupportEmail(request.auth)) {
    throw new HttpsError("permission-denied", "Accès support non autorisé.");
  }
  const requestId = String(request.data?.requestId || "").trim();
  const kind = String(request.data?.kind || "request").trim();
  const messageId = String(request.data?.messageId || "").trim();
  if (!requestId) throw new HttpsError("invalid-argument", "Ticket support manquant.");

  const requestRef = db.collection("supportRequests").doc(requestId);
  const requestSnapshot = await requestRef.get();
  if (!requestSnapshot.exists) throw new HttpsError("not-found", "Ticket support introuvable.");
  const supportRequest = { id: requestId, ...requestSnapshot.data() };
  const checkedAt = new Date().toISOString();

  if (kind === "reply") {
    if (!messageId) throw new HttpsError("invalid-argument", "Message support manquant.");
    const messageRef = requestRef.collection("messages").doc(messageId);
    const messageSnapshot = await messageRef.get();
    if (!messageSnapshot.exists) throw new HttpsError("not-found", "Réponse support introuvable.");
    const message = { id: messageId, ...messageSnapshot.data() };
    try {
      const result = await sendSupportReplyEmail(supportRequest, message);
      await messageRef.set({
        emailToRequesterStatus: result.sent ? "sent" : "skipped",
        emailToRequesterReason: result.reason || "",
        emailToRequesterError: "",
        emailToRequesterSentAt: result.sent ? checkedAt : "",
        emailToRequesterCheckedAt: checkedAt,
        emailToRequesterResentAt: checkedAt,
        emailToRequesterResentBy: request.auth.token?.userId || request.auth.uid || ""
      }, { merge: true });
      return {
        ok: true,
        status: result.sent ? "sent" : "skipped",
        message: result.sent ? "Réponse renvoyée au demandeur." : "Réponse non envoyée : adresse demandeur manquante ou configuration incomplète."
      };
    } catch (error) {
      await messageRef.set({
        emailToRequesterStatus: "failed",
        emailToRequesterError: String(error?.message || error || "Erreur mail").slice(0, 500),
        emailToRequesterCheckedAt: checkedAt,
        emailToRequesterResentAt: checkedAt,
        emailToRequesterResentBy: request.auth.token?.userId || request.auth.uid || ""
      }, { merge: true });
      throw new HttpsError("internal", "Renvoi de la réponse impossible.", error?.message || String(error));
    }
  }

  const [internalSettled, confirmationSettled] = await Promise.allSettled([
    sendSupportRequestEmail(supportRequest),
    sendSupportRequestConfirmationEmail(supportRequest)
  ]);
  const internalResult = internalSettled.status === "fulfilled" ? internalSettled.value : { sent: false, reason: "send_failed" };
  const confirmationResult = confirmationSettled.status === "fulfilled" ? confirmationSettled.value : { sent: false, reason: "send_failed" };
  await requestRef.set({
    emailNotificationStatus: internalResult.sent ? "sent" : "skipped",
    emailNotificationReason: internalResult.reason || "",
    emailNotificationError: internalSettled.status === "rejected" ? String(internalSettled.reason?.message || internalSettled.reason || "Erreur mail").slice(0, 500) : "",
    emailNotificationSentAt: internalResult.sent ? checkedAt : "",
    requesterConfirmationEmailStatus: confirmationResult.sent ? "sent" : "skipped",
    requesterConfirmationEmailReason: confirmationResult.reason || "",
    requesterConfirmationEmailError: confirmationSettled.status === "rejected" ? String(confirmationSettled.reason?.message || confirmationSettled.reason || "Erreur mail").slice(0, 500) : "",
    requesterConfirmationEmailSentAt: confirmationResult.sent ? checkedAt : "",
    emailNotificationCheckedAt: checkedAt,
    emailNotificationResentAt: checkedAt,
    emailNotificationResentBy: request.auth.token?.userId || request.auth.uid || ""
  }, { merge: true });
  if (internalSettled.status === "rejected" || confirmationSettled.status === "rejected") {
    throw new HttpsError("internal", "Au moins un e-mail support n’a pas pu être renvoyé.");
  }
  return {
    ok: true,
    internalStatus: internalResult.sent ? "sent" : "skipped",
    confirmationStatus: confirmationResult.sent ? "sent" : "skipped",
    message: "E-mails du ticket renvoyés."
  };
});

export const sendSupportOverdueDigest = onSchedule({
  region: FCM_REGION,
  schedule: "every day 08:00",
  timeZone: BELGIUM_TIME_ZONE
}, async () => {
  await processSupportOverdueDigest({ triggeredBy: "schedule" });
});

export const sendSupportOverdueDigestNow = onCall({
  region: FCM_REGION
}, async (request) => {
  if (!request.auth || !canManageSupportEmail(request.auth)) {
    throw new HttpsError("permission-denied", "Accès support non autorisé.");
  }
  const result = await processSupportOverdueDigest({
    force: true,
    triggeredBy: request.auth.token?.userId || request.auth.uid || "manual"
  });
  return {
    ok: true,
    ...result,
    message: result.count ? `${result.count} ticket(s) en retard relancé(s).` : "Aucun ticket en retard à relancer."
  };
});

export const sendSupportWeeklyReport = onSchedule({
  region: FCM_REGION,
  schedule: "every monday 08:30",
  timeZone: BELGIUM_TIME_ZONE
}, async () => {
  await processSupportWeeklyReport({ triggeredBy: "schedule" });
});

export const sendSupportWeeklyReportNow = onCall({
  region: FCM_REGION
}, async (request) => {
  if (!request.auth || !canManageSupportEmail(request.auth)) {
    throw new HttpsError("permission-denied", "Accès support non autorisé.");
  }
  const result = await processSupportWeeklyReport({
    triggeredBy: request.auth.token?.userId || request.auth.uid || "manual"
  });
  return {
    ok: true,
    ...result,
    message: result.status === "sent" ? "Rapport support envoyé par e-mail." : "Rapport support non envoyé : configuration e-mail incomplète."
  };
});

export const closeResolvedSupportTickets = onSchedule({
  region: FCM_REGION,
  schedule: "every day 07:45",
  timeZone: BELGIUM_TIME_ZONE
}, async () => {
  const now = new Date();
  const threshold = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const snapshot = await db.collection("supportRequests").where("status", "==", "resolved").get();
  const toClose = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data(), ref: doc.ref }))
    .filter((request) => {
      const resolvedAt = new Date(request.resolvedAt || request.updatedAt || "").getTime();
      return Number.isFinite(resolvedAt) && resolvedAt <= threshold;
    })
    .slice(0, 100);
  if (!toClose.length) {
    console.log("support auto close skipped: no ticket");
    await db.collection("supportReports").doc("autoClose").set({
      lastRunAt: now.toISOString(),
      lastStatus: "skipped",
      lastReason: "no_ticket",
      lastCount: 0,
      triggeredBy: "schedule"
    }, { merge: true });
    return;
  }
  const closedAt = now.toISOString();
  const batch = db.batch();
  toClose.forEach((request) => {
    const history = Array.isArray(request.history) ? request.history.slice(-49) : [];
    batch.set(request.ref, {
      status: "closed",
      closedAt,
      updatedAt: closedAt,
      autoClosedAt: closedAt,
      autoClosedReason: "resolved_7_days",
      history: [...history, supportHistoryEntry("Clôture automatique après 7 jours résolus")]
    }, { merge: true });
  });
  await batch.commit();
  await db.collection("supportReports").doc("autoClose").set({
    lastRunAt: closedAt,
    lastStatus: "done",
    lastReason: "",
    lastCount: toClose.length,
    triggeredBy: "schedule"
  }, { merge: true });
  console.log("support tickets auto closed", { count: toClose.length });
});

export const anonymizeClosedSupportTickets = onSchedule({
  region: FCM_REGION,
  schedule: "every monday 03:15",
  timeZone: BELGIUM_TIME_ZONE
}, async () => {
  await processClosedSupportAnonymization({ triggeredBy: "schedule" });
});

export const anonymizeClosedSupportTicketsNow = onCall({
  region: FCM_REGION
}, async (request) => {
  if (!request.auth || !canManageSupportEmail(request.auth)) {
    throw new HttpsError("permission-denied", "Accès support non autorisé.");
  }
  const result = await processClosedSupportAnonymization({
    triggeredBy: request.auth.token?.userId || request.auth.uid || "manual"
  });
  return {
    ok: true,
    ...result,
    message: result.count ? `${result.count} ticket(s) support anonymisé(s).` : "Aucun ticket support à anonymiser."
  };
});

export const notifyStudentIssueMessageCreated = onDocumentCreated({
  region: FCM_REGION,
  document: "studentIssues/{issueId}/messages/{messageId}"
}, async (event) => {
  const message = { id: event.params.messageId, ...event.data?.data() };
  const issueSnapshot = await db.collection("studentIssues").doc(event.params.issueId).get();
  const issue = issueSnapshot.exists ? issueSnapshot.data() : {};
  await sendPushToRecipients({
    recipientIds: unique([issue.driverId, issue.assistantId, ...(issue.driverIds || []), ...(issue.parentIds || [])]),
    recipientRoles: ["transport_manager", "spw"],
    excludeUserIds: [message.authorId],
    title: notificationTitleForMessage(message, "Réponse signalement élève"),
    body: messageBody(message),
    link: "https://gestion-transport-scolaire.web.app/app",
    data: {
      type: "student_issue_message",
      fcmType: "message",
      issueId: event.params.issueId,
      messageId: event.params.messageId,
      url: "/app"
    }
  });
});

export const notifyAppNotificationCreated = onDocumentCreated({
  region: FCM_REGION,
  document: "notifications/{notificationId}"
}, async (event) => {
  const notification = { id: event.params.notificationId, ...event.data?.data() };
  if (notification.status && notification.status !== "active") return;
  await sendPushToRecipients({
    recipientIds: unique([notification.userId, ...(notification.recipientIds || [])]),
    recipientRoles: notification.recipientRoles || [],
    excludeUserIds: notification.createdBy ? [notification.createdBy] : [],
    title: notification.title || "Gestion Transport Scolaire",
    body: notification.message || notification.body || "Nouvelle notification",
    link: "https://gestion-transport-scolaire.web.app/app",
    data: {
      type: notification.type || "general",
      fcmType: notification.fcmType || notification.type || "general",
      notificationId: event.params.notificationId,
      entityId: notification.entityId || "",
      url: "/app"
    }
  });
});
