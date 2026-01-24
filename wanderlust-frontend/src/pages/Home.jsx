import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import ListingCard from "../components/ListingCard";
import Skeleton from "../components/Skeleton";

const CATEGORIES = [
  { key: "", label: "Trending", icon: "fa-fire" },
  { key: "Rooms", label: "Rooms", icon: "fa-bed" },
  { key: "Iconic Cities", label: "Iconic Cities", icon: "fa-city" },
  { key: "Mountains", label: "Mountains", icon: "fa-mountain" },
  { key: "Amazing Pools", label: "Amazing Pools", icon: "fa-person-swimming" },
  { key: "Camping", label: "Camping", icon: "fa-tent" },
  { key: "Farms", label: "Farms", icon: "fa-tractor" },
  { key: "Arctic", label: "Arctic", icon: "fa-snowflake" },
  { key: "Domes", label: "Domes", icon: "fa-igloo" },
  { key: "Boats", label: "Boats", icon: "fa-sailboat" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Top Rated" },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 9);
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search") || "";

  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState({
    totalPages: 1,
    currentPage: page,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (search) q.set("search", search);
    if (sort) q.set("sort", sort);
    q.set("page", String(page));
    q.set("limit", String(limit));
    return q.toString();
  }, [category, search, sort, page, limit]);

  function goToPage(nextPage) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  }

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/listings?${query}`);

        if (!ignore) {
          const m = res.data.meta || {};
          const totalPages = m.totalPages || 1;
          const currentPage = m.currentPage || page;

          setListings(res.data.data || []);
          setMeta({
            totalPages,
            currentPage,
            totalItems: m.totalItems || 0,
            hasNextPage: !!m.hasNextPage,
            hasPrevPage: !!m.hasPrevPage,
          });

          if (page > totalPages) {
            goToPage(totalPages);
          }
        }
      } catch (e) {
        if (!ignore) setError(e?.response?.data?.message || "Failed to load listings");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);

    if (key !== "page") next.set("page", "1");

    setSearchParams(next);
  }

  function setCategory(nextCategory) {
    updateParam("category", nextCategory);
  }

  return (
    <div className="container-fluid px-4" style={{ paddingTop: 12, paddingBottom: 18 }}>
      {/* Filters row: Desktop categories strip + Mobile dropdown + Sort */}
      <div className="wl-filterbar">
        {/* Desktop horizontal strip */}
        <div id="wlf-filters" className="wl-cat-desktop">
          {CATEGORIES.map((c) => {
            const active = (c.key || "") === (category || "");
            return (
              <div
                key={c.label}
                className={`wlf-filter ${active ? "active" : ""}`}
                onClick={() => setCategory(c.key)}
                role="button"
                tabIndex={0}
                title={c.label}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setCategory(c.key);
                }}
              >
                <i className={`fa-solid ${c.icon}`} />
                <div>{c.label}</div>
              </div>
            );
          })}
        </div>

        {/* Mobile dropdown (shows on small screens) */}
        <div className="wl-cat-mobile">
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Trending</option>
            {CATEGORIES.filter((c) => c.key).map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="wl-sort">
          <select
            className="form-select"
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Meta */}
      <div style={{ marginTop: 10, marginBottom: 12, opacity: 0.8 }}>
        {loading ? "Loading..." : `${meta.totalItems} results • Page ${meta.currentPage} of ${meta.totalPages}`}
      </div>

      {/* Results */}
      {error ? (
        <div style={{ padding: 16 }}>Error: {error}</div>
      ) : loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #333",
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Skeleton height={160} radius={14} />
              <div style={{ marginTop: 12 }}>
                <Skeleton height={18} width="85%" />
                <div style={{ height: 10 }} />
                <Skeleton height={14} width="60%" />
                <div style={{ height: 10 }} />
                <Skeleton height={14} width="40%" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div>No results found.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {listings.map((l) => (
            <ListingCard key={l._id} listing={l} />
          ))}
        </div>
      )}
      {/* Pagination */}
      {!loading && !error && meta.totalPages > 1 && (
        <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center" }}>
          <button disabled={!meta.hasPrevPage} onClick={() => goToPage(meta.currentPage - 1)}>
            Prev
          </button>

          <span>
            Page {meta.currentPage} / {meta.totalPages}
          </span>

          <button disabled={!meta.hasNextPage} onClick={() => goToPage(meta.currentPage + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
