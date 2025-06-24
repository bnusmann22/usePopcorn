import { useEffect, useState } from 'react';

const KEY = `60a65fba`;
const query = `jamil`;

const Test = () => {
  const [noRatingMovies, setNoRatingMovies] = useState([]);
  const [avgRating, setAvgRating] = useState(null);

  useEffect(() => {
    const fetchFullMovies = async () => {
      try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&s=${query}`);
        const data = await res.json();

        if (data.Response === "True") {
          const searchResults = data.Search;

          const detailedPromises = searchResults.map(async (movie) => {
            const detailedRes = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${movie.imdbID}`);
            return detailedRes.json();
          });

          const fullMovies = await Promise.all(detailedPromises);

          const ratings = [];
          const unrated = [];

          fullMovies.forEach((movie) => {
            const rating = parseFloat(movie.imdbRating);
            if (!isNaN(rating)) {
              ratings.push(rating);
            } else {
              unrated.push(movie.Title || "Untitled");
            }
          });

          const average =
            ratings.length > 0
              ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
              : "No rated movies";

          setAvgRating(average);
          setNoRatingMovies(unrated);
        } else {
          setAvgRating("No results");
          setNoRatingMovies([]);
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setAvgRating("Error");
        setNoRatingMovies([]);
      }
    };

    if (query) {
      fetchFullMovies();
    }
  }, [query]);

  return (
    <div>
      <h2>🎯 Average IMDb Rating: {avgRating}</h2>

      {noRatingMovies.length > 0 && (
        <>
          <h3>⛔ Movies Without Ratings:</h3>
          <ul>
            {noRatingMovies.map((title, index) => (
              <li key={index}>{title}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Test;
