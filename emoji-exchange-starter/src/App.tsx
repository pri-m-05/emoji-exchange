import { useState, useEffect } from "react";
import type { Listing, ExchangeRequest } from "./types";
import { seedListings, seedRequests, DEFAULT_USER } from "./seed";

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

  // State for emoji holdings (owned by DEFAULT_USER)
  const [holdings, setHoldings] = useState<Listing[]>([]);

  // State for exchange requests (seeded)
  const [requests] = useState<ExchangeRequest[]>(seedRequests);

  // State for modal visibility
  const [showInbox, setShowInbox] = useState(false);

  // State for suggested emoji input
  const [suggestedEmoji, setSuggestedEmoji] = useState("");

  // State for rarity info message
  const [rarityInfo, setRarityInfo] = useState<string | null>(null);

  // New state to toggle showing only owned emojis
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);

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

  // Update holdings on listings change
  useEffect(() => {
    const owned = listings.filter((l) => l.owner === DEFAULT_USER);
    setHoldings(owned);
  }, [listings]);

  const toggleView = () => {
    setViewMode((prev) => (prev === "grid" ? "compact" : "grid"));
  };

  const handleAccentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAccentIndex(Number(e.target.value));
  };

  const openInbox = () => {
    setShowInbox(true);
  };

  const closeInbox = () => {
    setShowInbox(false);
  };

  const handleSuggestedEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSuggestedEmoji(value);
    // Clear rarity info on input change
    setRarityInfo(null);
  };

  // New function to evaluate rarity on button click
  const evaluateRarityLevel = () => {
    const value = suggestedEmoji.trim();
    if (value === "") {
      setRarityInfo(null);
      return;
    }
    // Check if emoji exists in listings
    const found = listings.find(
      (listing) => listing.emoji === value || listing.name.toLowerCase() === value.toLowerCase()
    );
    if (found) {
      setRarityInfo(`This emoji is already listed with rarity: ${found.rarity}`);
    } else {
      setRarityInfo("This appears to be a new emoji!");
    }
  };

  const handleSuggestEmojiSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (suggestedEmoji.trim() === "") return;
    alert(`Thank you for suggesting the emoji: ${suggestedEmoji}`);
    setSuggestedEmoji("");
    setRarityInfo(null);
  };

  // Handler to toggle showing only owned emojis
  const toggleShowOwned = () => {
    setShowOwnedOnly((prev) => !prev);
  };

  // Determine which listings to show based on showOwnedOnly
  const displayedListings = showOwnedOnly ? holdings : listings;

  return (
    <main className="page-shell">
      {/* Account info moved to top-left corner with minimalistic style */}
      <header style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <span className="emoji" aria-label="User emoji" role="img" style={{ fontSize: "28px" }}>
          🙂
        </span>
        <div style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "16px" }}>
          {DEFAULT_USER}
        </div>
      </header>

      <section className="panel">
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Browse Listings</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              className="button button-secondary"
              onClick={toggleView}
              aria-label="Toggle view"
              style={{
                display: "flex",
                gap: "8px",
                padding: "6px 10px",
                alignItems: "center",
                borderRadius: "12px"
              }}
            >
              <span
                className={`view-icon ${viewMode === "grid" ? "selected" : ""}`}
                aria-hidden="true"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  padding: "4px"
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </span>
              <span
                className={`view-icon ${viewMode === "compact" ? "selected" : ""}`}
                aria-hidden="true"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  padding: "4px"
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </span>
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
            {/* Inbox button with icon */}
            <button
              className="button button-secondary"
              onClick={openInbox}
              aria-label="Open inbox"
              title="Inbox"
              style={{ position: "relative" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
              >
                <path d="M22 12h-6l-2 3-2-3H2" />
                <path d="M2 12v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7" />
                <path d="M16 5a4 4 0 0 1-8 0" />
              </svg>
              {/* Badge for pending requests count */}
              {requests.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    backgroundColor: "var(--color-accent-pink)",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px",
                    fontWeight: "700",
                    lineHeight: 1,
                    userSelect: "none"
                  }}
                >
                  {requests.length}
                </span>
              )}
            </button>
            {/* New button to toggle owned emojis view */}
            <button
              className="button button-secondary"
              onClick={toggleShowOwned}
              aria-pressed={showOwnedOnly}
              aria-label="Toggle view to show only owned emojis"
              title={showOwnedOnly ? "Show all listings" : "Show only your emojis"}
              style={{ whiteSpace: "nowrap" }}
            >
              {showOwnedOnly ? "Show All Listings" : "Show My Emojis"}
            </button>
          </div>
        </div>

        {/* Emoji holdings area */}
        <section className="panel" style={{ marginBottom: "20px" }} aria-label="Your emoji holdings">
          <div className="panel-header">
            <h2>Your Emoji Holdings</h2>
            {holdings.length === 0 && <p className="muted">You currently hold no emojis.</p>}
          </div>
          {holdings.length > 0 && (
            <div className="compact-list" aria-live="polite">
              {holdings.map((emoji) => (
                <div key={emoji.id} className="compact-list-item">
                  <span className="emoji" aria-label={emoji.name} role="img">
                    {emoji.emoji}
                  </span>
                  <span className="category">{emoji.name}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {viewMode === "grid" ? (
          <div className="listing-grid">
            {displayedListings.map((listing) => (
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
              {displayedListings.map((listing) => (
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

        {/* Suggest an Emoji input area at bottom */}
        <section className="panel" style={{ marginTop: "24px" }} aria-label="Suggest an emoji">
          <div className="panel-header">
            <h2>Suggest an Emoji</h2>
            <p className="muted">Have an emoji you want to see here? Suggest it below!</p>
          </div>
          <form onSubmit={handleSuggestEmojiSubmit} className="form">
            <label htmlFor="suggest-emoji-input" className="label">
              Emoji or Name
              <input
                id="suggest-emoji-input"
                type="text"
                className="input"
                placeholder="e.g. 🐉 or Dragon"
                value={suggestedEmoji}
                onChange={handleSuggestedEmojiChange}
                aria-label="Suggest an emoji or name"
                autoComplete="off"
              />
            </label>
            {/* Replace checkbox with button for rarity evaluation */}
            <button
              type="button"
              onClick={evaluateRarityLevel}
              disabled={suggestedEmoji.trim() === ""}
              className="button button-secondary"
              style={{ marginBottom: "8px" }}
              aria-label="Evaluate rarity"
            >
              Evaluate Rarity
            </button>
            {rarityInfo && (
              <p style={{ color: "var(--color-text-secondary)", fontWeight: "600", marginTop: "4px" }}>
                {rarityInfo}
              </p>
            )}
            <button type="submit" className="button" disabled={suggestedEmoji.trim() === ""}>
              Submit Suggestion
            </button>
          </form>
        </section>

        {/* Inbox modal for past sent requests */}
        {showInbox && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="inbox-title">
            <div className="modal">
              <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h2 id="inbox-title">Inbox - Past Sent Requests</h2>
                <button
                  onClick={closeInbox}
                  aria-label="Close inbox"
                  className="button button-secondary"
                  style={{ fontSize: "18px", lineHeight: 1, padding: "4px 10px" }}
                >
                  &times;
                </button>
              </header>
              {requests.length === 0 ? (
                <p className="muted">You have no past sent requests.</p>
              ) : (
                <div className="request-list">
                  {requests.map((req) => (
                    <div key={req.id} className="request-card" style={{ marginBottom: "12px" }}>
                      <div className="request-top" style={{ gap: "8px" }}>
                        <span className="emoji" aria-label={req.listingName} role="img" style={{ fontSize: "32px" }}>
                          {req.listingEmoji}
                        </span>
                        <div style={{ flex: 1 }}>
                          <strong>{req.listingName}</strong> (Requested from you)
                          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "var(--color-text-muted)" }}>
                            Offered: <span className="emoji" aria-label="Offered emoji" role="img">
                              {req.offeredEmoji}
                            </span>
                          </p>
                        </div>
                        <span
                          className={`status status-${req.status}`}
                          style={{ whiteSpace: "nowrap", fontSize: "12px" }}
                          aria-label={`Status: ${req.status}`}
                        >
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </div>
                      <p style={{ marginTop: "6px", fontStyle: "italic" }}>&quot;{req.message}&quot;</p>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                        Sent: {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
