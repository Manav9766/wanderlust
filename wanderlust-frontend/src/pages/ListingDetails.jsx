import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Skeleton from "../components/Skeleton";
import ConfirmDialog from "../components/ConfirmDialog";

// MapLibre CSS (required)
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { toast } = useToast();

  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Confirm dialog state (generic)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState(null); // "delete-review" | "delete-listing"
  const [confirmReviewId, setConfirmReviewId] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  // AI review summarizer
  const [reviewSummary, setReviewSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // Review form (create)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  // Review edit state
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });
  const [editLoading, setEditLoading] = useState(false);

  async function refreshListing() {
    const res = await api.get(`/listings/${id}`);
    setListing(res.data.data);
  }

  // -------- Confirm helpers --------
  function openDeleteReviewConfirm(reviewId) {
    setConfirmMode("delete-review");
    setConfirmReviewId(reviewId);
    setConfirmOpen(true);
  }

  function openDeleteListingConfirm() {
    setConfirmMode("delete-listing");
    setConfirmReviewId(null);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setConfirmMode(null);
    setConfirmReviewId(null);
  }
  // -------------------------------
  async function handleSummarizeReviews() {
    if (!listing?.reviews?.length) return;

    try {
      setSummaryLoading(true);
      setReviewSummary("");
      setSummaryError("");

      const res = await api.post("/ai/summarize-reviews", {
        listingId: id,
      });

      const text = res?.data?.summary || "";
      if (!text.trim()) {
        setSummaryError("AI returned empty summary.");
        return;
      }

      setReviewSummary(text);
    } catch (e) {
      setSummaryError(
        e?.response?.data?.message || "Failed to summarize reviews",
      );
    } finally {
      setSummaryLoading(false);
    }
  }

  // -------------------------------

  async function handleCreateReview(e) {
    e.preventDefault();

    try {
      setReviewLoading(true);

      await api.post(`/listings/${id}/reviews`, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      setReviewForm({ rating: 5, comment: "" });
      await refreshListing();

      toast.success("Review posted");
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Failed to add review");
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      setActionLoading(true);

      await api.delete(`/listings/${id}/reviews/${reviewId}`);
      await refreshListing();

      if (editingReviewId === reviewId) {
        setEditingReviewId(null);
        setEditForm({ rating: 5, comment: "" });
      }

      toast.success("Review deleted");
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Failed to delete review");
    } finally {
      setActionLoading(false);
      closeConfirm();
    }
  }

  async function handleDeleteListing() {
    try {
      setActionLoading(true);

      await api.delete(`/listings/${id}`);
      toast.success("Listing deleted");
      navigate("/", { replace: true });
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Failed to delete listing");
    } finally {
      setActionLoading(false);
      closeConfirm();
    }
  }

  async function handleConfirm() {
    if (confirmMode === "delete-review" && confirmReviewId) {
      await handleDeleteReview(confirmReviewId);
      return;
    }
    if (confirmMode === "delete-listing") {
      await handleDeleteListing();
      return;
    }
    closeConfirm();
  }

  function startEditReview(r) {
    setEditingReviewId(r._id);
    setEditForm({
      rating: r.rating ?? 5,
      comment: r.comment ?? "",
    });
  }

  function cancelEditReview() {
    setEditingReviewId(null);
    setEditForm({ rating: 5, comment: "" });
  }

  async function saveEditReview(reviewId) {
    try {
      setEditLoading(true);

      await api.put(`/listings/${id}/reviews/${reviewId}`, {
        rating: Number(editForm.rating),
        comment: editForm.comment,
      });

      await refreshListing();
      toast.success("Review updated");
      cancelEditReview();
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Failed to update review");
    } finally {
      setEditLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/listings/${id}`);
        if (!ignore) setListing(res.data.data);
      } catch (e) {
        if (!ignore)
          setError(e?.response?.data?.message || "Failed to load listing");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  // ---------------- MAP ----------------
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // destroy old map if listing changes
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (!listing) return;

    const coords = listing?.geometry?.coordinates;
    const ok =
      Array.isArray(coords) &&
      coords.length === 2 &&
      typeof coords[0] === "number" &&
      typeof coords[1] === "number" &&
      !(coords[0] === 0 && coords[1] === 0);

    if (!ok) return;
    if (!mapRef.current) return;

    const key = import.meta.env.VITE_MAPTILER_KEY;
    if (!key) return;

    const [lng, lat] = coords;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${key}`,
      center: [lng, lat],
      zoom: 11,
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right",
    );

    new maplibregl.Marker({ color: "#e11d48" })
      .setLngLat([lng, lat])
      .addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [listing]);
  // -------------------------------------

  if (loading) {
    return (
      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <Skeleton height={28} width="60%" />
        <div style={{ height: 12 }} />
        <Skeleton height={360} radius={12} />
        <div style={{ height: 14 }} />
        <Skeleton height={16} width="45%" />
        <div style={{ height: 10 }} />
        <Skeleton height={16} width="30%" />
        <div style={{ height: 10 }} />
        <Skeleton height={16} width="35%" />
      </div>
    );
  }

  if (error) return <div style={{ padding: 16 }}>Error: {error}</div>;
  if (!listing) return <div style={{ padding: 16 }}>Not found.</div>;

  // OWNER CHECK
  const ownerId =
    typeof listing.owner === "object" ? listing.owner?._id : listing.owner;
  const isOwner =
    user && ownerId && (ownerId === user.id || ownerId === user._id);

  const img =
    listing?.image?.url ||
    listing?.image ||
    "https://via.placeholder.com/600x400?text=Listing";

  const myReview = user
    ? (listing.reviews || []).find((r) => {
        const authorId =
          typeof r.author === "object" ? r.author?._id : r.author;
        return authorId && (authorId === user.id || authorId === user._id);
      })
    : null;

  const coords = listing?.geometry?.coordinates;
  const hasGoodCoords =
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === "number" &&
    typeof coords[1] === "number" &&
    !(coords[0] === 0 && coords[1] === 0);

  const missingMapKey = !import.meta.env.VITE_MAPTILER_KEY;

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <ConfirmDialog
        open={confirmOpen}
        title={
          confirmMode === "delete-listing"
            ? "Delete listing?"
            : "Delete review?"
        }
        message={
          confirmMode === "delete-listing"
            ? "This will permanently delete the listing and all its reviews. This action cannot be undone."
            : "This will permanently delete your review. This action cannot be undone."
        }
        confirmText={
          confirmMode === "delete-listing" ? "Delete listing" : "Delete review"
        }
        cancelText="Cancel"
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
        loading={actionLoading}
      />

      <h1 style={{ fontSize: 28, marginBottom: 12 }}>{listing.title}</h1>

      {isOwner && (
        <div
          style={{
            marginBottom: 10,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <Link to={`/listing/${listing._id}/edit`}>Edit</Link>

          <button
            type="button"
            onClick={openDeleteListingConfirm}
            disabled={actionLoading}
          >
            Delete listing
          </button>
        </div>
      )}

      <img
        src={img}
        alt={listing.title}
        style={{
          width: "100%",
          height: 360,
          objectFit: "cover",
          borderRadius: 12,
        }}
      />

      <div style={{ marginTop: 12, opacity: 0.85 }}>
        {listing.location}, {listing.country}
      </div>

      <div style={{ marginTop: 8, fontWeight: 600 }}>
        ₹{listing.price} / night
      </div>

      <div style={{ marginTop: 8 }}>
        Rating: {listing.avgRating ?? 0} ({listing.reviewCount ?? 0})
      </div>

      <p style={{ marginTop: 12, lineHeight: 1.5 }}>{listing.description}</p>

      {/* REVIEWS FIRST */}
      <h3 style={{ marginTop: 24 }}>Reviews</h3>
      {listing.reviews?.length > 0 && (
        <div style={{ marginTop: 10, marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
            onClick={handleSummarizeReviews}
            disabled={summaryLoading}
            title="Summarize reviews using AI"
          >
            {summaryLoading ? (
              "Summarizing..."
            ) : (
              <>
                <i className="fa-brands fa-github"></i>
                Summarize Reviews with AI
              </>
            )}
          </button>

          {/* <button
      type="button"
      onClick={handleSummarizeReviews}
      disabled={summaryLoading}
    >
      {summaryLoading ? "Summarizing..." : "Summarize Reviews with AI"}
    </button> */}

          {reviewSummary && (
            <div
              style={{
                marginTop: 10,
                padding: 12,
                border: "1px solid #333",
                borderRadius: 10,
                background: "#fafafa",
              }}
            >
              <strong>AI Summary</strong>
              <p style={{ marginTop: 6 }}>{reviewSummary}</p>
            </div>
          )}

          {summaryError && (
            <div style={{ marginTop: 8, color: "red" }}>{summaryError}</div>
          )}
        </div>
      )}

      {/* Add Review Form */}
      {user ? (
        myReview ? (
          <div style={{ marginTop: 10, marginBottom: 14, opacity: 0.85 }}>
            You already reviewed this listing. You can edit your review below.
          </div>
        ) : (
          <form
            onSubmit={handleCreateReview}
            style={{
              marginTop: 10,
              marginBottom: 14,
              padding: 12,
              border: "1px solid #333",
              borderRadius: 12,
              display: "grid",
              gap: 10,
              maxWidth: 600,
            }}
          >
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ opacity: 0.85 }}>Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, rating: e.target.value }))
                }
                style={{ padding: 8 }}
              >
                <option value={5}>5 ★</option>
                <option value={4}>4 ★</option>
                <option value={3}>3 ★</option>
                <option value={2}>2 ★</option>
                <option value={1}>1 ★</option>
              </select>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ opacity: 0.85 }}>Comment</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, comment: e.target.value }))
                }
                rows={3}
                required
                placeholder="Share your experience..."
                style={{ padding: 10 }}
              />
            </div>

            <button disabled={reviewLoading} type="submit">
              {reviewLoading ? "Posting..." : "Post Review"}
            </button>
          </form>
        )
      ) : (
        <div style={{ marginTop: 10, marginBottom: 14, opacity: 0.85 }}>
          <Link to="/login">Login</Link> to leave a review.
        </div>
      )}

      {/* Reviews List */}
      {listing.reviews?.length ? (
        <div style={{ display: "grid", gap: 10 }}>
          {listing.reviews.map((r) => {
            const authorId =
              typeof r.author === "object" ? r.author?._id : r.author;
            const isMyReview =
              user &&
              authorId &&
              (authorId === user.id || authorId === user._id);
            const isEditing = editingReviewId === r._id;

            return (
              <div
                key={r._id}
                style={{
                  border: "1px solid #333",
                  borderRadius: 12,
                  padding: 12,
                  maxWidth: 700,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {!isEditing ? (
                      <>
                        <div style={{ fontWeight: 600 }}>{r.rating}★</div>
                        <div style={{ opacity: 0.85, marginTop: 4 }}>
                          {r.comment}
                        </div>
                        <div
                          style={{ opacity: 0.6, marginTop: 6, fontSize: 13 }}
                        >
                          {typeof r.author === "object"
                            ? r.author?.username
                            : ""}
                        </div>
                      </>
                    ) : (
                      <div style={{ display: "grid", gap: 10 }}>
                        <div style={{ display: "grid", gap: 6 }}>
                          <label style={{ opacity: 0.85 }}>Rating</label>
                          <select
                            value={editForm.rating}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                rating: e.target.value,
                              }))
                            }
                            style={{ padding: 8 }}
                          >
                            <option value={5}>5 ★</option>
                            <option value={4}>4 ★</option>
                            <option value={3}>3 ★</option>
                            <option value={2}>2 ★</option>
                            <option value={1}>1 ★</option>
                          </select>
                        </div>

                        <div style={{ display: "grid", gap: 6 }}>
                          <label style={{ opacity: 0.85 }}>Comment</label>
                          <textarea
                            value={editForm.comment}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                comment: e.target.value,
                              }))
                            }
                            rows={3}
                            required
                            style={{ padding: 10 }}
                          />
                        </div>

                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => saveEditReview(r._id)}
                            disabled={editLoading}
                          >
                            {editLoading ? "Saving..." : "Save"}
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditReview}
                            disabled={editLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isMyReview && !isEditing && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <button type="button" onClick={() => startEditReview(r)}>
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => openDeleteReviewConfirm(r._id)}
                        style={{ height: 36 }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>No reviews yet.</div>
      )}

      {/* MAP MOVED BELOW REVIEWS */}
      <h3 style={{ marginTop: 22 }}>Where you'll be</h3>

      {missingMapKey ? (
        <div style={{ opacity: 0.8, marginTop: 8 }}>
          Map unavailable: add <code>VITE_MAPTILER_KEY</code> in frontend{" "}
          <code>.env</code>.
        </div>
      ) : !hasGoodCoords ? (
        <div style={{ opacity: 0.8, marginTop: 8 }}>
          Map unavailable: this listing has no valid coordinates yet. (Fix by
          geocoding on the backend when creating/updating listings.)
        </div>
      ) : (
        <div
          ref={mapRef}
          style={{
            marginTop: 10,
            height: 420,
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.12)",
          }}
        />
      )}
    </div>
  );
}
