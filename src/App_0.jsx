import { useState, useEffect } from "react";
import StarRating from './StarRating'
const KEY = `60a65fba`


const average = (arr) => {
  const validNumbers = arr.filter(
    (val) => typeof val === "number" && !isNaN(val)
  );
  if (validNumbers.length === 0) return 0;
  return validNumbers.reduce((acc, cur) => acc + cur, 0) / validNumbers.length;
};


export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading , setIsLoading] = useState(false)
  const [error, setError] = useState("") 
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState("");
  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useState(
    ()=>{
      const storedValue = localStorage.getItem("watched")

      return storedValue ? JSON.parse(storedValue) : [];
    }
  );
  
  const handleSelectMovie = (id) =>{
    setSelectedId(selectedId => (id === selectedId ? null : id))
  }

  function handleCloseMovie(){
    setSelectedId(null)
  }

  function handleAddWatched(movie){
    setWatched(watched => [...watched, movie])
  }

  function handleDeleteWatched(imdbID) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== imdbID));
  }

  useEffect(function(){
    localStorage.setItem("watched",JSON.stringify(watched))
  },[watched])

  useEffect(function (){
    const controller = new AbortController()
    async function fetchData() {
      try{
      setIsLoading(true)
      setError("")
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`
        , {signal: controller.signal}
      );
      
      if (!res.ok) throw new Error ("Oops, Something went wrong")

      const data = await res.json();
      if (data.Response === "False") throw new Error ("Movie not found")

      setMovies(data.Search);
    }catch(err){    
      if(err.name !== "AbortError"){
        setError(err.message)
      }  
      }finally{
        setIsLoading(false)
      }
      }
      if (!query.length || query.length < 3 ) {
        setMovies([]);
        setError("");
        return;
      }
    handleCloseMovie()
    fetchData();
    }, 
  [query]);

  return (
    <>
     <NavBar>
        <Search query={query} setQuery={setQuery}/>
        <NumResult movies= {movies} />
     </NavBar>
      <Main movies= {movies}>
        <Box >
          {isLoading && <Loader/>}
          {!isLoading && !error &&  <MovieList movies={movies} onSelectMovie={handleSelectMovie}/>}
          {error && <ErrorMessage message={error}/>}
        </Box>
        <Box>
          {selectedId? 
          <MovieDetails 
            selectedId={selectedId} 
            onCloseMovie={handleCloseMovie}
            onAddWatched={handleAddWatched}
            watched={watched}
          /> :
          <>
            <WatchedSummary watched={watched}/>
            <WatchedMovieList watched={watched} onDelete={handleDeleteWatched}/>
          </>}
        </Box>       
      </Main>
    </>
  );
}

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}){
  const [movie, setMovie] = useState({}) 
  const [isLoading, setIsLoading] = useState(false)
  const [userRating , setUserRating] = useState("")

  const isWatched = watched.map(movie => movie.imdbID).includes(selectedId)


  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre
  } = movie

  function handleAdd(){
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      runtime: Number(runtime.split(" ").at(0)),
      imdbRating: Number(imdbRating),
      userRating
    };
    onAddWatched(newWatchedMovie)
    onCloseMovie()
  }

  useEffect(function(){
    function callback(e){
      if(e.code == 'Escape'){
        onCloseMovie()
        console.log("Closing"); 
      }
    }

    document.addEventListener('keydown' , callback)

    return function(){
      document.removeEventListener('keydown' , callback)
    }
  },[onCloseMovie])

  useEffect(function(){
    async function getMovieDetails(){
      setIsLoading(true)
      const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);

      const data = await res.json();
      setIsLoading(false)
      setMovie(data)
    }

    getMovieDetails()
  }, [selectedId])

  useEffect(function(){
    if (!title) return;
    document.title = `Movie || ${title}`

    return function(){
      document.title = `usePopcorn`
    }
  },[title])


  return <div className="details">
    {
      isLoading ? <Loader /> : 
      <>
       <header>
        <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
        <img src={poster} alt={`poster of ${movie} movie`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>
              ⭐
            </span>
            {imdbRating}IMDB Rating
          </p>
        </div>
       </header>
       <section>
        <div className="rating">
          {!isWatched ? 
          <>
            <StarRating maxRating={10} size={24} onSetRating={setUserRating}/>
            {
              userRating > 0 && 
              (
                <button className="btn-add" onClick={handleAdd}>
                  + add to watched
                </button>
              )
            }
          </> : <p>You rated this Movie</p>}
        </div>
        <p><em>{plot}</em></p>
        <p>Staring {actors}</p>
        <p>Directed by {director}</p>
       </section>
      </>
    }
    
  </div>
}

function ErrorMessage({message}){
  return<p className="error">
    <span>⛔</span>{message === "Failed to fetch" ? `oops, seems you are offline 📶 
    Check your internet connection and try again` : message}
  </p>
}
function Loader(){
  return <p className="loader">Loading . . .</p>
}

function NavBar({children}){
  return(
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
    )
}

function MovieList({movies, onSelectMovie}){
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie}/>
      ))}
    </ul>
  )
}
function Logo(){
  return(
      <div className="logo">
          <span role="img">🍿</span>
          <h1>usePopcorn</h1>
      </div>
  )
}

function Search({query, setQuery}){
    return(
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
    )
}

function NumResult({movies}){
    return(
        <p className="num-results">
            Found <strong>{movies.length}</strong> results
        </p>
    )
}
function Main({children}){
    return(
        <main className="main">
            {children}
        </main>
    )
}

// function WatchedBox(){
//     
//     const [isOpen2, setIsOpen2] = useState(true);
    
//     return(
//         <div className="box">
//           <button
//             className="btn-toggle"
//             onClick={() => setIsOpen2((open) => !open)}
//           >
//             {isOpen2 ? "–" : "+"}
//           </button>
//           {isOpen2 && (
//             
//           )}
//         </div>
//     )
// }
function Box({children}){
    const [isOpen, setIsOpen] = useState(true);
    
    return(
      <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
            >
            {isOpen ? "–" : "+"}
          </button>
          {isOpen && (
            children
          )}
        </div>
    )
}


function Movie({movie, onSelectMovie}){
  return(
    <li onClick={()=> onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}


function WatchedSummary({watched}){
  // const avgImdbRating = average(watched.map((movie) => Number(movie.imdbRating))).toFixed(2);
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
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMovieList({watched, onDelete}){
  return(
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie key={movie.imdbID} movie ={movie} onDelete={onDelete}/>
      ))}  
    </ul>
  )
} 

function WatchedMovie({movie, onDelete}){
  return(
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <button className='btn-delete' onClick={() => onDelete(movie.imdbID)}>
          ❌
      </button>
      <h3>{movie.title}</h3>
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
  )
}