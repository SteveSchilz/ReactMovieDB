import { useEffect, useState } from "react";
import StarRating from "./StarRating.js";

/* Refer to the readme regarding setting up omdbApiKey if this import fails */
import secrets from "./secrets.json";
const omdbAPIKey = secrets.omdbApiKey;

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [movieDetails, setMovieDetails] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSetQuery(message) {
    setQuery(message);
    setIsLoading(false);
    setIsLoadingDetails(false);
    setSelectedId(null);
    setError("");
  }

  function handleSelectMovie(id) {
    console.log("Handle Select Movie w/ID: " + id);
    setSelectedId(id);
    setIsLoadingDetails(true);
  }

  function handleSetWatched(movie) {
    console.log(watched.length + "watched Movies");
    if (watched.filter((m) => m.imdbID === movie.imdbID).length === 0) {
      setWatched((watched) => [...watched, movie]);
    } else {
      setWatched((watched) => watched.filter((m) => m.imdbID !== movie.imdbID));
    }
  }

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
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

  useEffect(
    function () {
      async function fetchMovieDetails() {
        try {
          setError("");
          console.log("fetching Details...");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${omdbAPIKey}&i=${selectedId}`
          );
          if (!res.ok) {
            throw new Error(
              "Something Went Wrong: Unable to fetch movie details"
            );
          }

          const data = await res.json();
          if (data.Response === "False") {
            throw new Error("Movie Details Not Found");
          }
          data.isWatched = false; // Always start off not watched when fetched
          data.userRating = 0; // and with a user rating of 0
          data.countRatingDecisions = 0; // and Rating decision count of 0
          setMovieDetails(data);
          console.log("Successfully fetched details for " + data.title);
        } catch (err) {
          console.log(err.message);
          setError(err.message);
          setSelectedId(null);
        } finally {
          setIsLoadingDetails(false);
          console.log("...done fetching details");
        }
      }
      if (selectedId != null) fetchMovieDetails();
    },
    [selectedId]
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
          {isLoading && <Loader text="Loading Movies" />}
          {!isLoading && !error && (
            <MovieList
              movies={movies}
              selectedId={selectedId}
              setSelectedId={handleSelectMovie}
            />
          )}
          {query && error && <ErrorMessage message={error} />}
          {!query && <PromptSearch />}
        </ToggleBox>
        <ToggleBox>
          {selectedId && !isLoadingDetails && (
            <MovieDetails
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              setWatchedMovie={handleSetWatched}
              movieDetails={movieDetails}
            />
          )}
          {isLoadingDetails && <Loader text="Loading Details" />}
          {!selectedId && (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                selectedId={selectedId}
                setSelectedId={handleSelectMovie}
              />
            </>
          )}
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
  const [tempQuery, setTempQuery] = useState("");

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

function Loader({ text }) {
  return <h3 className="loader">{text}...</h3>;
}

function ErrorMessage({ message }) {
  return <p className="error">❌ Error: {message}</p>;
}

function PromptSearch() {
  return (
    <p className="error">
      🔍 To search for movies, enter text in the search bar and press ENTER
    </p>
  );
}

function MovieList({ movies, selectedId, setSelectedId }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
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

function Movie({ movie, selectedId, setSelectedId }) {
  function selectMovie() {
    setSelectedId((selectedId) =>
      selectedId === movie.imdbID ? null : movie.imdbID
    );
  }

  return (
    <li onClick={selectMovie}>
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

// { Poster, Title, Type, Year, imdbID}
function MovieDetails({
  selectedId,
  setSelectedId,
  setWatchedMovie,
  movieDetails,
}) {
  if (movieDetails == null) {
    return;
  }

  function onSetWatched() {
    const newWatchedMovie = {
      imdbID: selectedId,
      Title,
      Year: Year,
      Poster: Poster,
      imdbRating: Number(imdbRating),
      runtime: Number(Runtime.split(" ").at(0)),
      /* We don't destructure these, because they are editable.
       * We save the entire movieDetails struct in the watch list whenver
       * the rating changes or we add the movie to the watched list
       */
      // Number(movieDetails.userRating),
      // countRatingDecisions: 0 /*countRef.current,*/,
      // isWatched: movieDetails.isWatched,
    };

    setWatchedMovie(newWatchedMovie);
  }

  function onCloseMovie() {
    setSelectedId(null);
  }

  function onSetRating(rating) {
    movieDetails.userRating = Number(rating);
    /* if the movie is on the watched list, update the movieDetails to include the new watched rating */
    if (movieDetails.isWatched) {
      setWatchedMovie(movieDetails);
    }
  }

  /* Destructure Movie Details to get local variables */
  const {
    Title = movieDetails.Title,
    Year = movieDetails.Year,
    Poster = movieDetails.Poster,
    Runtime = movieDetails.Runtime,
    imdbRating = movieDetails.imdbRating,
    Plot = movieDetails.Plot,
    Released = movieDetails.Released,
    Actors = movieDetails.Actors,
    Director = movieDetails.Director,
    Genre = movieDetails.Genre,
  } = movieDetails;
  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onCloseMovie}>
          &larr;
        </button>
        <h2>{Title}</h2>
        <img
          src={Poster}
          alt={`Poster of ${Title}`}
          className="details-overview"
        ></img>
        <div className="details-overview">
          <h2>{Title}</h2>
          <p>
            {Released} &bull; {Runtime}
          </p>
          <p>{Genre}</p>
          <p>
            <span>⭐️</span>
            {imdbRating} IMDB Rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          <StarRating
            messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
            defaultRating={movieDetails.userRating}
            maxRating={10}
            size={24}
            onSetRating={onSetRating}
          />
          {movieDetails.userRating > 0 && (
            <button className="btn-add" onClick={onSetWatched}>
              {!movieDetails.isWatched ? "Add To" : "Remove From"} Watched List
            </button>
          )}
        </div>
        <p>
          <em>{Plot}</em>
        </p>
        <p>Starring {Actors}</p>
        <p>Directed By {Director}</p>
      </section>
      <hr />
      {movieDetails.isWatched ? "True" : "False"}
      <p className="starRatingStyle">
        This movie was rated {movieDetails.userRating} stars
      </p>
    </div>
  );
}

function WatchedMovieList({ watched, selectedId, setSelectedId }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
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

function WatchedMovie({ movie, selectedId, setSelectedId }) {
  function onWatchedClick() {
    if (selectedId === null) {
      setSelectedId(movie.imdbID);
    }
  }

  return (
    <li onClick={onWatchedClick}>
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
