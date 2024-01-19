import { useEffect, useState } from "react";

/* Refer to the readme regarding setting up omdbApiKey if this import fails */
import secrets from "./secrets.json";
const omdbAPIKey = secrets.omdbApiKey;

export function useFetchDetails(selectedId, watched) {
  const [movieDetails, setMovieDetails] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      async function fetchMovieDetails() {
        if (selectedId === null) {
          return;
        }
        try {
          setIsLoadingDetails(true);
          setError("");
          const getString = `http://www.omdbapi.com/?apikey=${omdbAPIKey}&i=${selectedId}`;
          console.log("fetching Details using ", getString);
          const res = await fetch(getString);
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
          //          setSelectedId(null);
        } finally {
          setIsLoadingDetails(false);
          //console.log("...done fetching details");
        }
      }

      // useFetchDetails main function body:
      // fetches details or load from the watch list
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

  function clearDetailsError() {
    setIsLoadingDetails(false);
    setError(false);
  }
  return {
    movieDetails,
    isLoadingDetails,
    error,
    clearDetailsError,
  };
}
