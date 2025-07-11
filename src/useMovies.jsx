import {useEffect, useState} from 'react'
const KEY = `60a65fba`
export function useMovies(query){
    const [movies, setMovies] = useState([]);
    const [isLoading , setIsLoading] = useState(false)
    const [error, setError] = useState("") 

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
        // handleCloseMovie()
        fetchData();
        }, 
      [query]);
      return {movies , isLoading , error};
}