import { useEffect, useState } from "react";
import { tempMovieData, tempWatchedData } from "./temp-movie-data.js";
import StarRating from "./StarRating.js";

/* Refer to the readme regarding setting up omdbApiKey if this import fails */
import secrets from "./secrets.json";
const omdbAPIKey = secrets.omdbApiKey;

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState(tempMovieData);
  const [watched, setWatched] = useState(tempWatchedData);
  const [movieRating, setMovieRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  function handleSetQuery(message) {
    setQuery(message);
    setIsLoading(false);
    setError("");
  }

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          console.log("fetching...");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${omdbAPIKey}&s=${query}`
          );
          if (!res.ok) {
            throw new Error("Something Went Wrong: Unable to fetch movies");
          }

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie Not Found");

          setMovies(data?.Search);
        } catch (err) {
          console.log(err.message);
          setError(err.message);
          setMovies([]);
        } finally {
          setIsLoading(false);
          console.log("...done");
        }
      }
      fetchMovies();
    },
    [query]
  );

  return (
    <>
      <NavBar movies={movies}>
        <Logo />
        <Search movies={movies} query={query} setQuery={handleSetQuery} />
        <Results length={movies.length} />
      </NavBar>
      <Main>
        <ToggleBox>
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} />}
          {error && <ErrorMessage message={error} />}
        </ToggleBox>
        <ToggleBox>
          <WatchedSummary watched={watched} />
          <WatchedMovieList watched={watched} />
          <StarRating
            messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
            defaultRating={3}
            maxRating={5}
            color="red"
            size={36}
            className="starRatingStyle"
            onSetRating={setMovieRating}
          />
          <p className="starRatingStyle">
            This movie was rated {movieRating} stars
          </p>
        </ToggleBox>
      </Main>
    </>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function ToggleBox({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && <>{children}</>}
    </div>
  );
}

function NavBar({ movies, children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ movies, query, setQuery }) {
  const [tempQuery, setTempQuery] = useState("Animal");

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Submit" + tempQuery + " (Q=" + query);
    setQuery(tempQuery);
  }
  return (
    <form onSubmit={handleSubmit}>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={tempQuery}
        onChange={(e) => setTempQuery(e.target.value)}
      />
    </form>
  );
}

function Results({ length }) {
  return (
    <p className="num-results">
      Found <strong>{length}</strong> results
    </p>
  );
}

function Loader() {
  return <h3 className="loader">Loading...</h3>;
}

function ErrorMessage({ message }) {
  return <p className="error">❌ Error: {message}</p>;
}

function MovieList({ movies }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

/** Movie item:
 *
 *  Note: Since this React Component returns an html <li> component, you
 *      might expect that the key would be on the list item.
 *
 *      Instead the key property is assigned in the react component level above,
 *      This allows React to use the key to control re-renders
 */
function Movie({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedMovieList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovie({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
