import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating.js";

/* Refer to the readme regarding setting up omdbApiKey if this import fails */
import secrets from "./secrets.json";
const omdbAPIKey = secrets.omdbApiKey;

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [movieDetails, setMovieDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // Lazy Initial State: useState with a callback to initialize it
  // Function must be pure, with no arguments
  // Value returned will be used as initial state
  const [watched, setWatched] = useState(function () {
    const storedValue = JSON.parse(localStorage.getItem("watched"));
    if (typeof storedValue === "undefined" || storedValue === null) {
      return [];
    }
    return storedValue;
  });

  function handleSetQuery(message) {
    console.log("Set Query(", message, ")");
    setQuery(message);
    setIsLoading(false);
    setIsLoadingDetails(false);
    setSelectedId(null);
    setError("");
    setMovies([]);
  }

  function handleSelectMovie(id) {
    console.log("Handle Select Movie w/ID: " + id);
    const watchedMovie = watched.filter((m) => m.imdbID === id);
    if (watchedMovie.length === 0) {
      // We only show the loading message if this movie is not already on watched list
      setIsLoadingDetails(true);
    } else if (watchedMovie.length === 1) {
    }
    setSelectedId(id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleSetWatched(movie, update) {
    const notInList =
      watched.filter((m) => m.imdbID === movie.imdbID).length === 0;

    var updatedMovieList = [];

    if (notInList) {
      /* If movie is not in list add it to the list */
      updatedMovieList = [...watched, movie];
      setWatched((watched) => updatedMovieList);
    } else {
      /* If it's already in the list, either update it, or remove it from the list */
      if (update) {
        /* Update the user-details */
        const updatedMovie = {
          ...movie,
          countRatingDecisions: movie.countRatingDecisions,
          userRating: movie.userRating,
          isWatched: movie.isWatched,
        };
        const updatedMovieList = watched.map((wm) =>
          wm.imdbID === movie.imdbID ? updatedMovie : wm
        );
        setWatched(updatedMovieList);
      } else {
        /* Remove movie from list */
        setWatched((watched) =>
          watched.filter((m) => m.imdbID !== movie.imdbID)
        );
      }
    }
  }

  function handleDeleteWatched(id) {
    setSelectedId(null);
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  // Save a copy of the movie data to browser local storage
  //
  // LocalStorage is key/Value pair storage in browser - depends on the exact URL
  //
  // Runs on: Watched updated
  // Since this runs any time the watched list is updated, we have updated
  // state for the watched array, we no longer need to do fancy workarounds
  // like spreading the array to add the new movie.
  useEffect(
    function saveLocally() {
      // Local Storage ==
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  useEffect(
    function () {
      // This API allows us to abort the request in a cleanup function
      // when a second request comes in while this one is running.
      // To do this, we pass controller.signal in the fetch request,
      // and use the cleanup function to abort the request: that happens
      // when a new request comes in BEFORE the current one has completed.
      const controller = new AbortController();

      async function fetchMovies() {
        if (query === "") return;

        try {
          setIsLoading(true);
          setError("");

          console.log("fetching...");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${omdbAPIKey}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error("Something Went Wrong: Unable to fetch movies");
          }

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie Not Found");

          setMovies(data?.Search);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
            setMovies([]);
          }
        } finally {
          setIsLoading(false);
          console.log("...done fetching Movies");
        }
      }
      fetchMovies();

      // Return a cleanup function to be called when complete.
      // This one will cancel any long-running query when a new
      // request is submitted before this one completes.
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  useEffect(
    function () {
      async function fetchMovieDetails() {
        if (selectedId === null) {
          return;
        }
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
          console.log("...Successfully fetched details for " + data.Title);
        } catch (err) {
          console.log(err.message);
          setError(err.message);
          setSelectedId(null);
        } finally {
          setIsLoadingDetails(false);
          //console.log("...done fetching details");
        }
      }

      if (selectedId != null) {
        const selectedMovie = watched.filter((m) => m.imdbID === selectedId);
        if (selectedMovie.length === 0) {
          fetchMovieDetails();
        } else if (selectedMovie.length === 1) {
          // Reloading a movie from the watched list
          setMovieDetails(selectedMovie[0]);
        }
      }
    },
    [selectedId, watched]
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
              setWatchedMovie={handleSetWatched}
              onCloseMovie={handleCloseMovie}
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
                onDeleteWatched={handleDeleteWatched}
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
      <span> </span>
    </div>
  );
}

function Search({ movies, query, setQuery }) {
  // TempQuery is used to hold the state while user is typing.
  // When user hits enter (form submit), setQuery is called to
  // submit the query through the fetchMovies hook. This approach
  // greatly reduces calls to the API, however, you need to be
  // careful about the difference between setQuery and SetTempQuery.
  //
  // tempQuery holds the visual contents of the search box.
  // query is the value as submitted to the Open Movie DB API.
  const [tempQuery, setTempQuery] = useState("");

  // This creates a reference to a DOM element in a declarative way...
  // Referenced in the actual HTML input element as ref={inputEl}
  const inputEl = useRef(null);

  // Initialize our ref on mount (empty dependency array)
  // This is after the DOM has been loaded
  useEffect(function initialFocus() {
    inputEl.current.focus();
  }, []);

  // Key handler to set focus on Search input and clear current results
  useEffect(
    function enterKeyHandler() {
      function keyCallback(e) {
        if (document.activeElement === inputEl.current) {
          return;
        }

        if (e.code === "Enter") {
          inputEl.current.focus();
          inputEl.current.value = "";
          setTempQuery(""); // Temp Query is local state before we hit enter
          setQuery(""); // Query is the actual state that is searched
          return;
        }
      }
      document.addEventListener("keydown", keyCallback);

      // Cleanup function removes the event listener because we call
      // this everytime we call setQuery
      return () => {
        document.removeEventListener("keydown", keyCallback);
      };
    },
    [setQuery, setTempQuery]
  );

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Submit Query: " + tempQuery + " (curent Q=" + query + ")");
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
        ref={inputEl}
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
    setSelectedId(selectedId === movie.imdbID ? null : movie.imdbID);
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
  setWatchedMovie,
  onCloseMovie,
  movieDetails,
}) {
  // Note: Jonas passes in the entire watched list.  Instead, I pass in only
  //       MovieDetails object, which allows me to open a movie from the watched list.
  //
  // Jonas also has some state here:
  //
  // * const [movie, setMovie] = useState({});                // Corresponds to my movieDetails parameter
  // * const [isLoading, setIsLoading] = useState(false);     // Handled at top level in my app
  //
  // I had to add this one to properly implement useRef counter,
  // it duplicates "MovieDetails.userRating"
  // So far he doesn't seem to be using this ref for anything other
  // than demonstrating how useRef works, so.. candidate for removal
  const [localUserRating, setLocalUserRating] = useState(0);
  const [localIsWatched, setLocalIsWatched] = useState(() => {
    if (movieDetails.length > 0 && "isWatched" in movieDetails[0]) {
      return movieDetails.isWatched;
    } else {
      return false;
    }
  });

  //const [avgRating, setAvgRating] = useState(0);
  //const [avgCount, setAvgCount] = useState(0);

  // countRef UseRef: implements a counter.
  // Note that:
  //  1. unlike a useState, there is no setter
  //  2. We directly manipulate the current variable
  const countRatingDecisionsRef = useRef(movieDetails.countRatingDecisions);

  useEffect(
    function countUserRating() {
      if (localUserRating === 0) {
        // Do nothing
      } else {
        countRatingDecisionsRef.current++;
      }
    },
    [localUserRating]
  );

  // Effect with Cleanup to Set Document Title (Tab in Chrome)
  useEffect(
    function setupTitle() {
      if (movieDetails !== null) {
        document.title = `🎬 🎥Movie | ${movieDetails.Title}`;
        //After the initial render, effect runs after the cleanup from the previous render
        //console.log("Setting title movie ${movieDetails.Title");
      }
      /* The Cleanup function is returned from the effect.
       * Runs on every render, just before this effect runs, and at unmount.
       * Note: even on the unmount call, we have access to the entire "MovieDetails"
       *       state, because a javascript Closure "MovieDetails" is still alive.
       */
      return function () {
        document.title = "React Movie List";
        // After 1st render, the cleanup runs "before" the effect.
        //console.log("Clean up effect for movie ${movieDetails.Title");
      };
    },
    [movieDetails]
  );

  /*
   * Then we use an html function to install an event listener.
   * So we are kind of bypassing the whole react system (Escape Hatch)
   *
   * We put it here in the MovieDetails(as opposed to main)
   * so that it is only running when movie details is on the screen
   */
  useEffect(
    function escapeKeyListener() {
      // event listener must be exactly the same function in the
      // addListener and remove listener callsd.
      function keyHandler(e) {
        if (e.code === "Escape") {
          onCloseMovie();
          //console.log("Closing!!!!");
        }
      }
      ///console.log("Adding Key Handler");
      document.addEventListener("keydown", keyHandler);

      // Cleanup Function - Remove event listener so we don't
      // keep adding more everytime
      return function () {
        ///console.log("Removing Key Handler");
        document.removeEventListener("keydown", keyHandler);
      };
    },
    [onCloseMovie]
  );

  function onSetWatched() {
    setLocalIsWatched((isWatched) => !isWatched);

    const newWatchedMovie = {
      imdbID: selectedId,
      Title,
      Year: Year,
      Poster: Poster,
      imdbRating: Number(imdbRating),
      Runtime: Number(Runtime.split(" ").at(0)),
      userRating: Number(localUserRating),
      countRatingDecisions: countRatingDecisionsRef.current,
      isWatched: !localIsWatched,
    };
    setWatchedMovie(newWatchedMovie, false);
    //onCloseMovie();  // This line will close the details after adding to the watch list
  }

  /* If the user rates the movie, they must have watched it, so we add it to the watched list*/
  function handleSetRating(rating) {
    /* We get an initial call to this function when the StarRating component is initialized */
    if (rating === 0 || rating === movieDetails.userRating) return;

    setLocalUserRating(rating);

    const modifiedMovieDetails = {
      ...movieDetails,
      isWatched: true,
      userRating: Number(rating),
      countRatingDecisions:
        localUserRating === 0 ? 1 : countRatingDecisionsRef.current + 1,
    };

    if (movieDetails.isWatched) {
      setWatchedMovie(modifiedMovieDetails, true); // true = Update existing movie
    } else {
      setWatchedMovie(modifiedMovieDetails, false); // Not an update, add to list)
    }
  }

  if (movieDetails == null) {
    console.log("Movie Details is NULL!!");
    alert("Null movie Details!!!");
    return;
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
    /* We don't destructure these, because there is local state for them.
     * We save the entire movieDetails struct in the watch list whenver
     * the rating changes or we add the movie to the watched list
     */
    //userRating = Number(movieDetails.userRating),
    //countRatingDecisions = 0 /*countRef.current,*/,
    //isWatched = movieDetails.isWatched,
  } = movieDetails;
  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onCloseMovie}>
          &larr;
        </button>
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
      {/* <p>{avgRating}</p> */}
      <section>
        <div className="rating">
          <StarRating
            messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
            defaultRating={movieDetails.userRating}
            maxRating={10}
            size={24}
            onSetRating={handleSetRating}
          />
          <button className="btn-add" onClick={onSetWatched}>
            {!movieDetails.isWatched ? "Add To" : "Remove From"} Watched List
          </button>
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

function WatchedMovieList({
  watched,
  selectedId,
  setSelectedId,
  onDeleteWatched,
}) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(
    watched.map((movie) => movie.Runtime?.match(/\d+/)?.[0] ?? 0)
  );

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
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(0)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovie({ movie, selectedId, setSelectedId, onDeleteWatched }) {
  function onDeleteClick(e) {
    e.stopPropagation(); // Prevent event from also being handled in onwatchedClick
    onDeleteWatched(movie.imdbID);
  }
  function onWatchedClick(e, id) {
    if (selectedId === null) {
      setSelectedId(id);
    }
  }

  return (
    <li onClick={(e) => onWatchedClick(e, movie.imdbID)}>
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
          <span>{movie.Runtime}</span>
        </p>
        <button
          className="btn-delete"
          onClick={(e) => onDeleteClick(e, movie.imdbID)}
        >
          ❌
        </button>
      </div>
    </li>
  );
}
