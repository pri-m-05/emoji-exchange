import { useState } from "react";
import type { Listing } from "./types";
import { seedListings } from "./seed";

export default function App() {
  const [listings] = useState<Listing[]>(seedListings);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const toggleView = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="panel-header">
          <h2>Browse Listings</h2>
          <button className="button button-secondary" onClick={toggleView} aria-label="Toggle view">
            {viewMode === "grid" ? "Switch to List View" : "Switch to Grid View"}
          </button>
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
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--color-panel-border)" }}>Rarity</th>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--color-panel-border)" }}>Category</th>
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
                  <td style={{ padding: "8px" }}>
                    <span
                      className={`rarity rarity-${listing.rarity.toLowerCase()}`}
                      aria-label={`Rarity: ${listing.rarity}`}
                    >
                      {listing.rarity}
                    </span>
                  </td>
                  <td style={{ padding: "8px" }}>{listing.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
