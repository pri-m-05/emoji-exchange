import { useEffect, useMemo, useState } from "react";
import { DEFAULT_USER, seedListings, seedRequests } from "./seed";
import type { Category, ExchangeRequest, Listing, Rarity } from "./types";

const LISTINGS_KEY = "emoji-exchange:listings";
const REQUESTS_KEY = "emoji-exchange:requests";

function readLocalStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rarityClass(rarity: Rarity): string {
  return `rarity rarity-${rarity.toLowerCase()}`;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [proposalListingId, setProposalListingId] = useState<string | null>(null);

  const [newEmoji, setNewEmoji] = useState("✨");
  const [newName, setNewName] = useState("");
  const [newRarity, setNewRarity] = useState<Rarity>("Common");
  const [newCategory, setNewCategory] = useState<Category>("Smileys");
  const [newDescription, setNewDescription] = useState("");
  const [newWanted, setNewWanted] = useState("");

  const [offerEmoji, setOfferEmoji] = useState("🎧");
  const [offerMessage, setOfferMessage] = useState("");

  useEffect(() => {
    setListings(readLocalStorage<Listing[]>(LISTINGS_KEY, seedListings));
    setRequests(readLocalStorage<ExchangeRequest[]>(REQUESTS_KEY, seedRequests));
  }, []);

  useEffect(() => {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  }, [requests]);

  const visibleListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        `${listing.emoji} ${listing.name} ${listing.owner} ${listing.description}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesCategory = category === "All" || listing.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, listings, search]);

  const myListings = listings.filter((listing) => listing.owner === currentUser);
  const incomingRequests = requests.filter((request) => {
    const listing = listings.find((item) => item.id === request.listingId);
    return listing?.owner === currentUser;
  });

  function handleAddListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newName.trim()) return;

    const listing: Listing = {
      id: crypto.randomUUID(),
      emoji: newEmoji.trim() || "✨",
      name: newName.trim(),
      owner: currentUser.trim() || DEFAULT_USER,
      rarity: newRarity,
      category: newCategory,
      description: newDescription.trim() || "No description yet.",
      wanted: newWanted.trim() || "Open to offers.",
      status: "available"
    };

    setListings((current) => [listing, ...current]);
    setNewEmoji("✨");
    setNewName("");
    setNewDescription("");
    setNewWanted("");
    setNewRarity("Common");
    setNewCategory("Smileys");
  }

  function handleCreateRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!proposalListingId) return;

    const listing = listings.find((item) => item.id === proposalListingId);
    if (!listing) return;

    const request: ExchangeRequest = {
      id: crypto.randomUUID(),
      listingId: listing.id,
      listingEmoji: listing.emoji,
      listingName: listing.name,
      fromUser: currentUser.trim() || DEFAULT_USER,
      offeredEmoji: offerEmoji.trim() || "🎁",
      message: offerMessage.trim() || "Interested in trading!",
      status: "pending",
      createdAt: new Date().toISOString()
    };

    setRequests((current) => [request, ...current]);
    setOfferEmoji("🎧");
    setOfferMessage("");
    setProposalListingId(null);
  }

  function handleRequestDecision(requestId: string, decision: "accepted" | "declined") {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId ? { ...request, status: decision } : request
      )
    );

    if (decision === "accepted") {
      setListings((current) =>
        current.map((listing) =>
          listing.id === requests.find((r) => r.id === requestId)?.listingId
            ? { ...listing, status: "traded" }
            : listing
        )
      );
    }
  }

  function handleResetDemo() {
    localStorage.removeItem(LISTINGS_KEY);
    localStorage.removeItem(REQUESTS_KEY);
    setListings(seedListings);
    setRequests(seedRequests);
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Emoji Exchange</p>
          <h1>Trade tiny icons like they matter way too much.</h1>
          <p className="hero-copy">
            A playful starter app where people list emoji collectibles and send exchange
            offers. It is simple on purpose so you can push it quickly, then use it as a repo
            for your autonomous agent tests.
          </p>
        </div>

        <div className="hero-actions">
          <label className="label">
            Current user
            <input
              className="input"
              value={currentUser}
              onChange={(event) => setCurrentUser(event.target.value)}
            />
          </label>
          <button className="button button-secondary" onClick={handleResetDemo}>
            Reset demo data
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <div className="panel-header">
            <h2>Browse listings</h2>
            <p>Search, filter, and send trade requests.</p>
          </div>

          <div className="toolbar">
            <input
              className="input"
              placeholder="Search emoji, owner, or vibe..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="input"
              value={category}
              onChange={(event) => setCategory(event.target.value as "All" | Category)}
            >
              <option value="All">All categories</option>
              <option value="Smileys">Smileys</option>
              <option value="Animals">Animals</option>
              <option value="Food">Food</option>
              <option value="Objects">Objects</option>
            </select>
          </div>

          <div className="listing-grid">
            {visibleListings.map((listing) => (
              <article key={listing.id} className="card">
                <div className="card-top">
                  <span className="emoji">{listing.emoji}</span>
                  <span className={rarityClass(listing.rarity)}>{listing.rarity}</span>
                </div>

                <h3>{listing.name}</h3>
                <p className="muted">
                  Owned by {listing.owner} · {listing.category}
                </p>
                <p>{listing.description}</p>
                <p className="wanted">Wants: {listing.wanted}</p>

                <div className="card-footer">
                  <span className={listing.status === "available" ? "status ok" : "status done"}>
                    {listing.status}
                  </span>
                  <button
                    className="button"
                    disabled={listing.owner === currentUser || listing.status !== "available"}
                    onClick={() => setProposalListingId(listing.id)}
                  >
                    Offer trade
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="sidebar">
          <section className="panel">
            <div className="panel-header">
              <h2>Create a listing</h2>
              <p>Seed the repo with your own item.</p>
            </div>

            <form className="form" onSubmit={handleAddListing}>
              <label className="label">
                Emoji
                <input
                  className="input"
                  value={newEmoji}
                  onChange={(event) => setNewEmoji(event.target.value)}
                  maxLength={4}
                />
              </label>

              <label className="label">
                Name
                <input
                  className="input"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="Sparkles"
                />
              </label>

              <label className="label">
                Rarity
                <select
                  className="input"
                  value={newRarity}
                  onChange={(event) => setNewRarity(event.target.value as Rarity)}
                >
                  <option value="Common">Common</option>
                  <option value="Rare">Rare</option>
                  <option value="Legendary">Legendary</option>
                </select>
              </label>

              <label className="label">
                Category
                <select
                  className="input"
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value as Category)}
                >
                  <option value="Smileys">Smileys</option>
                  <option value="Animals">Animals</option>
                  <option value="Food">Food</option>
                  <option value="Objects">Objects</option>
                </select>
              </label>

              <label className="label">
                Description
                <textarea
                  className="input textarea"
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                />
              </label>

              <label className="label">
                What you want back
                <textarea
                  className="input textarea"
                  value={newWanted}
                  onChange={(event) => setNewWanted(event.target.value)}
                />
              </label>

              <button className="button button-primary" type="submit">
                Add listing
              </button>
            </form>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Incoming requests</h2>
              <p>Approve or decline trade offers for your items.</p>
            </div>

            <div className="request-list">
              {incomingRequests.length === 0 ? (
                <p className="muted">No incoming requests yet.</p>
              ) : (
                incomingRequests.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-top">
                      <strong>
                        {request.fromUser} wants {request.listingEmoji} {request.listingName}
                      </strong>
                      <span className={`status ${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    <p>Offering: {request.offeredEmoji}</p>
                    <p className="muted">{request.message}</p>

                    {request.status === "pending" ? (
                      <div className="inline-actions">
                        <button
                          className="button button-primary"
                          onClick={() => handleRequestDecision(request.id, "accepted")}
                        >
                          Accept
                        </button>
                        <button
                          className="button button-secondary"
                          onClick={() => handleRequestDecision(request.id, "declined")}
                        >
                          Decline
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>My listings</h2>
              <p>Quick check of what belongs to {currentUser}.</p>
            </div>

            <div className="request-list">
              {myListings.length === 0 ? (
                <p className="muted">You do not own any listings yet.</p>
              ) : (
                myListings.map((listing) => (
                  <div key={listing.id} className="mini-card">
                    <div>
                      <strong>
                        {listing.emoji} {listing.name}
                      </strong>
                      <p className="muted">{listing.status}</p>
                    </div>
                    <span className={rarityClass(listing.rarity)}>{listing.rarity}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </main>

      {proposalListingId ? (
        <div className="modal-backdrop" onClick={() => setProposalListingId(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header">
              <h2>Send trade request</h2>
              <p>Pitch your best emoji deal.</p>
            </div>

            <form className="form" onSubmit={handleCreateRequest}>
              <label className="label">
                Your offered emoji
                <input
                  className="input"
                  value={offerEmoji}
                  onChange={(event) => setOfferEmoji(event.target.value)}
                  maxLength={4}
                />
              </label>

              <label className="label">
                Message
                <textarea
                  className="input textarea"
                  value={offerMessage}
                  onChange={(event) => setOfferMessage(event.target.value)}
                />
              </label>

              <div className="inline-actions">
                <button className="button button-primary" type="submit">
                  Send request
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setProposalListingId(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
