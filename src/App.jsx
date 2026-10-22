import { useEffect, useState } from "react";
import { isCancel } from "axios";
import { getPopularMovies, searchMovies } from "./api/tmdb";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");   // what's typed in the box
  const [search, setSearch] = useState(""); // what was actually submitted
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const request = search
      ? searchMovies(search, page, controller.signal)
      : getPopularMovies(page, controller.signal);

    request
      .then((data) => {
        if(page === 1){
          setMovies(data.results);
        }else{
          setMovies((prev) => [...prev, ...data.results]);
        }
        setTotalPages(data.total_pages);
        setLoading(false);
      })
      .catch((err) => {
        if (isCancel(err)) return;
        setError("Couldn't load movies. Try again later.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [search, page]); // re-runs whenever a new search is submitted

  return (
    <main className="app">
      <h1>Movie Explorer</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(query.trim());
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies…"
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && search && movies.length === 0 && (
        <p className="empty">No results for "{search}"</p>
      )}

      {!loading && !error && (
        <div className="grid">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} onSelect={setSelected} />
          ))}
        </div>
      )}

      {!loading && page < totalPages && (
        <button onClick={() => setPage(page + 1)}>Load more</button>
      )}

      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} />}

    </main>
  );
}

export default App;