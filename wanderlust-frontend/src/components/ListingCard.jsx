import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

export default function ListingCard({ listing }) {
  const { isFavorite, toggleFavorite, isPending } = useFavorites();

  const fav = isFavorite(listing._id);
  const pending = isPending(listing._id);

  const img =
    listing?.image?.url ||
    listing?.image ||
    "https://via.placeholder.com/900x600?text=Listing";

  function onHeart(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(listing._id); // ✅ FIX: send ID, not object
  }

  return (
    <Link to={`/listing/${listing._id}`} className="text-decoration-none text-dark">
      <div className="position-relative wl-card">
        <img className="wl-card-img" src={img} alt={listing.title} />

        <button
          type="button"
          className={`wl-heart ${fav ? "active" : ""}`}
          onClick={onHeart}
          aria-label="Toggle favorite"
          disabled={pending}
          title={pending ? "Updating..." : fav ? "Remove from favorites" : "Add to favorites"}
        >
          <i className={`fa-${fav ? "solid" : "regular"} fa-heart`} />
        </button>

        <div className="pt-2">
          <div className="wl-card-title">{listing.title}</div>
          <div className="wl-card-meta">
            {listing.location}, {listing.country}
          </div>
          <div className="fw-semibold">${listing.price} / night</div>
        </div>
      </div>
    </Link>
  );
}
