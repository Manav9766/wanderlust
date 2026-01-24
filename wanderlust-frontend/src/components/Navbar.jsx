import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { favorites } = useFavorites();

  const [searchParams, setSearchParams] = useSearchParams();

  // Home page reads `search`
  const searchFromUrl = searchParams.get("search") || "";
  const [search, setSearch] = useState(searchFromUrl);

  useEffect(() => {
    setSearch(searchFromUrl);
  }, [searchFromUrl]);

  const canShowSearch = useMemo(() => location.pathname === "/", [location.pathname]);
  const favCount = useMemo(() => favorites?.length || 0, [favorites]);

  function handleSubmit(e) {
    e.preventDefault();

    const next = new URLSearchParams(searchParams);
    const value = search.trim();

    if (!value) next.delete("search");
    else next.set("search", value);

    next.set("page", "1");
    setSearchParams(next);
  }

  function clearSearch() {
    const next = new URLSearchParams(searchParams);
    next.delete("search");
    next.set("page", "1");
    setSearchParams(next);
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/", { replace: true });
    }
  }

  function goCreateListing() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/listing/new");
  }

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <i className="fa-solid fa-compass wl-brand" style={{ fontSize: 22 }} />
          <span className="wl-brand" style={{ fontWeight: 800, letterSpacing: 0.2 }}>
            Wanderlust
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#wlNavbar"
          aria-controls="wlNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="wlNavbar">
          {/* Center search bar (HOME ONLY) */}
          {canShowSearch && (
            <form className="d-flex mx-lg-auto wl-search align-items-center" onSubmit={handleSubmit}>
              <input
                className="form-control me-2 wl-input"
                type="search"
                placeholder="Search destinations"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary wl-btn wl-btn-sm" type="submit">
                <i className="fa-solid fa-magnifying-glass me-2" />
                Search
              </button>

              {searchFromUrl && (
                <button className="btn btn-outline-secondary ms-2" type="button" onClick={clearSearch}>
                  Clear
                </button>
              )}
            </form>
          )}

          {/* Right side links */}
          <ul className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-3 mt-3 mt-lg-0">
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/favorites">
                  Favorites <span className="wl-badge">{favCount}</span>
                </Link>
              </li>
            )}

            <li className="nav-item">
              <button className="btn btn-link nav-link" type="button" onClick={goCreateListing}>
                List your property
              </button>
            </li>

            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link text-muted">Hi, {user.username}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-dark btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">
                    Sign Up
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Log In
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
