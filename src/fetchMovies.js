import { useEffect, useState } from "react";

/* Refer to the readme regarding setting up omdbApiKey if this import fails */
import secrets from "./secrets.json";
const omdbAPIKey = secrets.omdbApiKey;

// Custom Hook (must start with use): useFetchMovies
//
// Notes:
// * Jonas's convention is use named export as opposed to export default
// * is a regular javascript function, so it has direct parameters, not props.
export function useFetchMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
          const getString = `http://www.omdbapi.com/?apikey=${omdbAPIKey}&s=${query}`;
          console.log(getString);
          const res = await fetch(getString, { signal: controller.signal });
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

  function clearMovieList() {
    setMovies([]);
    setIsLoading(false);
    setError("");
  }
  return { movies, isLoading, error, clearMovieList };
}
