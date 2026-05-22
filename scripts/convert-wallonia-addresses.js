import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const inputFile = process.argv[2] || "data/Wallonia_postal_street.csv";
const outputFile = process.argv[3] || "data/wallonia-addresses.json";

function parseCsv(content) {
  const rows = [];
  let row = [];
  let current = "";
  let quoted = false;
  const separator = content.split(/\r?\n/, 1)[0]?.includes(";") ? ";" : ",";
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];
    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === separator && !quoted) {
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

function slug(value = "") {
  return normalizeSearch(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function valueFrom(record, names) {
  const entries = Object.entries(record);
  for (const name of names) {
    const direct = record[name];
    if (direct != null && String(direct).trim()) return String(direct).trim();
    const found = entries.find(([key]) => normalizeSearch(key) === normalizeSearch(name));
    if (found && String(found[1]).trim()) return String(found[1]).trim();
  }
  return "";
}

const absoluteInput = path.resolve(process.cwd(), inputFile);
const absoluteOutput = path.resolve(process.cwd(), outputFile);

if (!fs.existsSync(absoluteInput)) {
  console.error(`Fichier introuvable: ${inputFile}`);
  process.exit(1);
}

const addresses = new Map();

function recordFromCells(headers, cells) {
  const record = {};
  headers.forEach((header, index) => {
    record[header] = cells[index] || "";
  });
  return record;
}

function addRecord(record) {
  const street = valueFrom(record, ["street", "streetName", "street_name", "rue", "nom_rue", "streetname", "thoroughfare", "streetname_fr", "streetname_nl", "streetname_de"]);
  const postalCode = valueFrom(record, ["postalCode", "postcode", "post_code", "zip", "code_postal", "cp"]);
  const city = valueFrom(record, ["city", "commune", "municipality", "locality", "localite", "nom_commune", "postname_fr", "municipality_name_fr", "municipality_name_nl", "municipality_name_de"]);
  if (!street || !postalCode || !city) return;
  const id = slug([street, postalCode, city].join("-"));
  addresses.set(id, {
    id,
    street,
    postalCode,
    city,
    country: "Belgique",
    searchName: normalizeSearch([street, postalCode, city, "Belgique"].join(" "))
  });
}

async function readLargeCsv() {
  const rl = readline.createInterface({
    input: fs.createReadStream(absoluteInput, { encoding: "utf8" }),
    crlfDelay: Infinity
  });
  let headers = null;
  let count = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    const cells = parseCsv(`${line}\n`)[0] || [];
    if (!headers) {
      headers = cells;
      continue;
    }
    addRecord(recordFromCells(headers, cells));
    count += 1;
    if (count % 250000 === 0) console.log(`${count} lignes lues, ${addresses.size} rues uniques...`);
  }
}

await readLargeCsv();

const sorted = Array.from(addresses.values()).sort((a, b) =>
  a.city.localeCompare(b.city, "fr") || a.street.localeCompare(b.street, "fr") || a.postalCode.localeCompare(b.postalCode, "fr")
);

fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
fs.writeFileSync(absoluteOutput, `${JSON.stringify(sorted)}\n`);
console.log(`${sorted.length} rues wallonnes converties vers ${outputFile}`);
