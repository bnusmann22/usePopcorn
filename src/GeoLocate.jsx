import {useState, useEffect} from 'react'

export default function GeoLocate(){
    const [isLoading, setIsLoading] = useState(false)
    const [countClicks, setCountClicks] =useState(0)
    const [position , setPosition] = useState({})
    const [error , setError] = useState(null)

    const {lat, lng} = position
    function getPosition(){
        setCountClicks(count => count + 1)
        if (!navigator.geolocation)
            return setError("Your Browser doesnt support geolocation")
        setIsLoading(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition(
                   { lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                })
                setIsLoading(false)
            },
            (error) =>{
                setError(error.message)
                setIsLoading(false)
            }

        )
    }
    return<div>
        <button onClick={getPosition} disabled={isLoading}>
            Get my Position
        </button>
        {isLoading && <p>Loading Position ...</p>}
        {error && <p>Error</p>}
        {!isLoading && !error && lat && lng && (
            <div>
                <p>
                    Your GPS position: 
                    <a
                        target='_blank'
                        rel="noreferrer"
                        href={`https://www.openstreetmap.org/#map=16/${lat}/${lng}`}
                    >
                        {lat} / {lng}
                    </a>
                </p>
                <div>
                    Tap on the position 👆🤗
                </div>
            </div>
        )}
    </div>
}