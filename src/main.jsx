import { StrictMode } from 'react'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App_0'

import StarRating from "./StarRating"

function Test(){
  const [movieRating , setMovieRating] = useState(0)
  return <div>
    <StarRating maxRating={10} size={30} color='blue' onSetRating={setMovieRating}/>
    <p>This movie was rated {movieRating} stars</p>
  </div>
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App />  */}
    <>
      <StarRating maxRating={5} messages= {["Terrible", "Bad" , "average" , "Good" , "Excellent"]}/>  
      <StarRating maxRating={10} size={20} color='red' defaultRating={5}/> 
      <Test/>
    </>
  </StrictMode>,
)
