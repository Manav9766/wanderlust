import ListingCard from "../components/ListingCard";
import { useFavorites } from "../context/FavoritesContext";

export default function Favorites() {
  const { favorites, loading } = useFavorites();

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Your Favorites</h1>

      {loading ? (
        <div>Loading...</div>
      ) : favorites.length === 0 ? (
        <div>No favorites yet.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {favorites.map((l) => (
            <ListingCard key={l._id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
