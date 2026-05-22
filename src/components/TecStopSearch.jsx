import { useMemo, useState } from "react";

function normalizeSearch(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function stopLabel(stop = {}) {
  return [stop.name || stop.stop_name, stop.city, stop.code || stop.stop_id].filter(Boolean).join(" - ");
}

export default function TecStopSearch({ value = "", stops = [], onChange, label = "Arrêt de prise en charge" }) {
  const [query, setQuery] = useState(value);
  const suggestions = useMemo(() => {
    const search = normalizeSearch(query);
    if (search.length < 3) return [];
    return stops
      .filter((stop) => normalizeSearch([stop.name, stop.stop_name, stop.city, stop.stop_id, stop.code].join(" ")).includes(search))
      .slice(0, 8);
  }, [query, stops]);

  return (
    <label className="autocomplete-field">
      <span>{label}</span>
      <input
        value={query}
        autoComplete="off"
        placeholder="Tapez au moins 3 lettres ou écrivez manuellement"
        onChange={(event) => {
          setQuery(event.target.value);
          onChange?.(event.target.value);
        }}
      />
      {suggestions.length > 0 && (
        <div className="autocomplete-suggestions">
          {suggestions.map((stop) => (
            <button
              key={stop.id || stop.stop_id}
              type="button"
              onClick={() => {
                const nextValue = stopLabel(stop);
                setQuery(nextValue);
                onChange?.(nextValue);
              }}
            >
              <strong>{stop.name || stop.stop_name}</strong>
              <span>{[stop.city, stop.code || stop.stop_id].filter(Boolean).join(" - ")}</span>
            </button>
          ))}
        </div>
      )}
      <small className="field-hint">Suggestions TEC après 3 lettres. La saisie manuelle reste possible.</small>
    </label>
  );
}
