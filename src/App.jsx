import { useEffect, useState } from "react";
import { isCancel } from "axios";
import { getPopularMovies, searchMovies } from "./api/tmdb";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
import "./App.css";
const MAX_PAGES = 500;

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const request = search
      ? searchMovies(search, page, controller.signal)
      : getPopularMovies(page, controller.signal);

    request
      .then((data) => {
        setMovies((prev) => {
          if (page === 1) return data.results;          
          const seen = new Set(prev.map((m) => m.id));
          return [...prev, ...data.results.filter((m) => !seen.has(m.id))];
        });
        setTotalPages(Math.min(data.total_pages, MAX_PAGES));
        setLoading(false);
      })
      .catch((err) => {
        if (isCancel(err)) return;
        setError("Couldn't load movies. Try again later.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [search, page]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearch(query.trim());
    setPage(1);
  };

  const initialLoad = loading && page === 1;
  const noResults = !loading && !error && search && movies.length === 0;

  return (
    <main className="app">
      <h1>Movie Explorer</h1>

      <form className="search" onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies…"
          aria-label="Search movies"
        />
        <button type="submit">Search</button>
      </form>

      {initialLoad && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {noResults && <p className="empty">No results for "{search}"</p>}

      {!initialLoad && movies.length > 0 && (
        <div className="grid">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} onSelect={setSelected} />
          ))}
        </div>
      )}

      {!initialLoad && !error && page < totalPages && movies.length > 0 && (
        <button className="load-more" onClick={() => setPage((p) => p + 1)} disabled={loading}>
          {loading ? "Loading…" : "Load more"}
        </button>
      )}

      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}