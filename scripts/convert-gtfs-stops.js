import fs from "node:fs";
import path from "node:path";

const inputFile = process.argv[2] || "data/stops.txt";
const outputFile = process.argv[3] || "data/tec-stops.json";

function parseCsv(content) {
  const rows = [];
  let row = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];
    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  row.push(current.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeSearch(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function extractCity(stopName = "") {
  const words = String(stopName).trim().split(/\s+/);
  const cityWords = [];
  for (const word of words) {
    const letters = word.replace(/[^A-Za-zÀ-ÿ-]/g, "");
    if (!letters) continue;
    if (letters === letters.toUpperCase()) cityWords.push(word);
    else break;
  }
  return cityWords.join(" ");
}

function cleanStopName(stopName = "", city = "") {
  const normalizedName = String(stopName).trim();
  if (!city) return normalizedName;
  return normalizedName.replace(new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i"), "").trim() || normalizedName;
}

const absoluteInput = path.resolve(process.cwd(), inputFile);
const absoluteOutput = path.resolve(process.cwd(), outputFile);
const rows = parseCsv(fs.readFileSync(absoluteInput, "utf8"));
const headers = rows.shift() || [];
const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));
const stops = new Map();

rows.forEach((row) => {
  const stopId = row[headerIndex.stop_id] || "";
  const stopCode = row[headerIndex.stop_code] || "";
  const rawName = row[headerIndex.stop_name] || "";
  if (!stopId || !rawName) return;
  const city = extractCity(rawName);
  const name = cleanStopName(rawName, city);
  const stop = {
    id: stopId,
    stop_id: stopId,
    code: stopCode,
    name,
    stop_name: rawName,
    city,
    lat: Number.parseFloat(row[headerIndex.stop_lat] || ""),
    lon: Number.parseFloat(row[headerIndex.stop_lon] || "")
  };
  stop.searchName = normalizeSearch([stop.name, stop.stop_name, stop.city, stop.stop_id, stop.code].filter(Boolean).join(" "));
  stops.set(stop.id, stop);
});

fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
fs.writeFileSync(absoluteOutput, `${JSON.stringify(Array.from(stops.values()))}\n`);
console.log(`${stops.size} arrêts TEC convertis vers ${outputFile}`);
