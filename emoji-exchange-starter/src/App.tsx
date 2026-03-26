import { useState, useEffect } from "react";
import type { Listing } from "./types";
import { seedListings } from "./seed";

const ACCENT_COLORS = [
  { name: "Red", pink: "#ff8a80", purple: "#d32f2f" },
  { name: "Orange", pink: "#ffcc99", purple: "#ff7043" },
  { name: "Pink", pink: "#ffb6c1", purple: "#9370db" },
  { name: "Blue", pink: "#add8e6", purple: "#6a5acd" },
  { name: "Green", pink: "#77dd77", purple: "#4caf50" }
];

export default function App() {
  const [listings] = useState<Listing[]>(seedListings);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [accentIndex, setAccentIndex] = useState<number>(0);

  // Apply accent colors to CSS variables
  useEffect(() => {
    const accent = ACCENT_COLORS[accentIndex];
    if (accent) {
      document.documentElement.style.setProperty("--color-accent-pink", accent.pink);
      document.documentElement.style.setProperty("--color-accent-purple", accent.purple);
      // Update button background gradient to new accent colors
      document.documentElement.style.setProperty(
        "--color-button-bg",
        `linear-gradient(135deg, ${accent.pink}, ${accent.purple})`
      );
    }
  }, [accentIndex]);

  const toggleView = () => {
    setViewMode((prev) => (prev === "grid" ? "compact" : "grid"));
  };

  const handleAccentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAccentIndex(Number(e.target.value));
  };

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Browse Listings</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button className="button button-secondary" onClick={toggleView} aria-label="Toggle view">
              {viewMode === "grid" ? "Switch to Compact Table View" : "Switch to Grid View"}
            </button>
            <label htmlFor="accent-select" style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
              Accent Color:
            </label>
            <select
              id="accent-select"
              value={accentIndex}
              onChange={handleAccentChange}
              className="input"
              style={{ minWidth: "140px" }}
              aria-label="Select accent color"
            >
              {ACCENT_COLORS.map((color, idx) => (
                <option key={color.name} value={idx}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="listing-grid">
            {listings.map((listing) => (
              <div key={listing.id} className="card">
                <div className="card-top">
                  <span className="emoji" aria-label={listing.name} role="img">
                    {listing.emoji}
                  </span>
                  <span
                    className={`rarity rarity-${listing.rarity.toLowerCase()}`}
                    aria-label={`Rarity: ${listing.rarity}`}
                  >
                    {listing.rarity}
                  </span>
                </div>
                <h3>{listing.name}</h3>
                <p className="category">Category: {listing.category}</p>
              </div>
            ))}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--color-panel-border)" }}>Emoji</th>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--color-panel-border)" }}>Category</th>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--color-panel-border)" }}>Rarity</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} style={{ borderBottom: "1px solid var(--color-panel-border)" }}>
                  <td style={{ padding: "8px" }}>
                    <span className="emoji" aria-label={listing.name} role="img">
                      {listing.emoji}
                    </span>
                  </td>
                  <td style={{ padding: "8px" }}>{listing.category}</td>
                  <td style={{ padding: "8px" }}>
                    <span
                      className={`rarity rarity-${listing.rarity.toLowerCase()}`}
                      aria-label={`Rarity: ${listing.rarity}`}
                    >
                      {listing.rarity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
