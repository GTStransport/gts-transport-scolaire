#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${FIREBASE_PROJECT_ID:-gestion-transport-scolaire}"

paths=(
  "users/driver"
  "users/assistant"
  "parents/parent-1"
  "parents/parent-2"
  "drivers/driver"
  "assistants/assistant"
  "vehicles/vehicle-1"
  "schools/school-1"
  "circuits/circuit-12"
  "circuits/circuit-18"
  "children/child-1"
  "children/child-2"
  "children/child-3"
  "students/child-1"
  "students/child-2"
  "students/child-3"
  "studentMedical/child-1"
  "studentMedical/child-2"
  "studentMedical/child-3"
  "studentSensitive/child-1"
  "studentSensitive/child-2"
  "studentSensitive/child-3"
  "parentChangeRequests/request-demo-1"
  "supportRequests/support-demo-1"
  "privateMessages/child-1"
  "privateMessages/child-2"
  "privateMessages/child-3"
  "roleAnnouncements/announcement-driver-1"
  "roleAnnouncements/announcement-assistant-1"
  "tecStops/tec-demo-eglise-namur"
  "tecStops/tec-demo-place-communale"
  "tecStops/tec-demo-rue-moulin"
  "tecStops/tec-demo-gare-namur"
  "tecStops/tec-demo-hopital"
)

echo "Nettoyage des donnees de demonstration sur ${PROJECT_ID}"
for path in "${paths[@]}"; do
  echo "- ${path}"
  firebase firestore:delete "${path}" --project "${PROJECT_ID}" --recursive --force >/dev/null
done
echo "Nettoyage demo termine."
