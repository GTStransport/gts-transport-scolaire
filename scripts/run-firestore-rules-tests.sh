#!/usr/bin/env bash
set -euo pipefail

if ! java -version >/dev/null 2>&1 && [ -x "/opt/homebrew/opt/openjdk@21/bin/java" ]; then
  export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
  export JAVA_HOME="/opt/homebrew/opt/openjdk@21"
fi

firebase emulators:exec --only firestore "node tests/firestore-rules.test.mjs"
