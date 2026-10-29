import { useState } from "react";
import "./App.css";

function App() {
const [destination, setDestination] = useState("");
const [budget, setBudget] = useState("10000");
const [days, setDays] = useState("3");
const [travelStyle, setTravelStyle] = useState("Adventure");
const [interests, setInterests] = useState("Nature, Food");

const [loading, setLoading] = useState(false);
const [itinerary, setItinerary] = useState(null);
const [error, setError] = useState("");

async function handleSubmit(event) {
console.log("GENERATE BUTTON CLICKED");
event.preventDefault();

setLoading(true);
setItinerary(null);
setError("");

try {
  const response = await fetch(
    "http://127.0.0.1:8002/api/itinerary",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destination: destination.trim(),
        budget: Number(budget),
        days: Number(days),
        travel_style: travelStyle,
        interests: interests.trim(),
      }),
    }
  );
  console.log("API RESPONSE STATUS:", response.status);
  const data = await response.json();
  console.log("API RESPONSE DATA:", data);

  if (!response.ok) {
    throw new Error(
      data.detail
        ? JSON.stringify(data.detail)
        : "Unable to send trip details."
    );
  }

  setItinerary(data);
  console.log("ITINERARY STATE UPDATED");
}  catch (err) {
  console.error("TravelMate API error:", err);
  setError(err.message || "Something went wrong.");
} finally {
  setLoading(false);
}


}

return ( <div className="app"> <nav className="navbar"> <a className="brand" href="#"> <span className="brand-icon">✈</span>
TravelMate AI </a>


    <span className="nav-label">
      Your Personal Travel Planner
    </span>
  </nav>

  <main className="main-container">
    <section className="hero">
      <span className="eyebrow">
        YOUR NEXT ADVENTURE STARTS HERE
      </span>

      <h1>
        Your Journey,
        <br />
        <span>Your Perfect Itinerary.</span>
      </h1>

      <p>
        Tell us where you want to go and plan your next
        adventure with TravelMate AI.
      </p>
    </section>

    <section className="planner-card">
      <div className="card-heading">
        <h2>Plan Your Trip</h2>
        <p>Enter your travel preferences below.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="destination">
            Where do you want to go?
          </label>

          <input
            id="destination"
            type="text"
            placeholder="e.g. Manali, Goa, Jaipur"
            value={destination}
            onChange={(event) =>
              setDestination(event.target.value)
            }
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="budget">Total Budget (₹)</label>

            <input
              id="budget"
              type="number"
              min="1"
              value={budget}
              onChange={(event) =>
                setBudget(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="days">Duration (Days)</label>

            <input
              id="days"
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={(event) =>
                setDays(event.target.value)
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="travelStyle">Travel Style</label>

          <select
            id="travelStyle"
            value={travelStyle}
            onChange={(event) =>
              setTravelStyle(event.target.value)
            }
          >
            <option value="Adventure">Adventure</option>
            <option value="Relaxation">Relaxation</option>
            <option value="Cultural">Cultural</option>
            <option value="Nature">Nature</option>
            <option value="Budget">Budget Friendly</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="interests">Your Interests</label>

          <input
            id="interests"
            type="text"
            placeholder="e.g. Nature, Food, Mountains"
            value={interests}
            onChange={(event) =>
              setInterests(event.target.value)
            }
            required
          />

          <small>
            Separate multiple interests with commas.
          </small>
        </div>

        <button
          className="generate-button"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Sending Your Trip Details..."
            : "Generate My Itinerary"}

          {!loading && <span> →</span>}
        </button>
      </form>

      {error && (
        <div className="error-box" role="alert">
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      )}

      {itinerary && (
        <section className="result-box" aria-live="polite">
          <span className="result-label">
            BACKEND RESPONSE
          </span>

          <h2>Your Trip Details</h2>

          <p className="success-message">
            {itinerary.message}
          </p>

          <div className="result-item">
            <span>Destination</span>
            <strong>{itinerary.destination}</strong>
          </div>

          <div className="result-item">
            <span>Budget</span>
            <strong>
              ₹{Number(itinerary.budget).toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="result-item">
            <span>Duration</span>
            <strong>{itinerary.days} days</strong>
          </div>

          <div className="result-item">
            <span>Travel Style</span>
            <strong>{itinerary.travel_style}</strong>
          </div>

          <div className="result-item">
            <span>Interests</span>
            <strong>{itinerary.interests}</strong>
          </div>

        <div className="itinerary-content">
  <h3>🗺️ Your AI-Generated Itinerary</h3>

  {itinerary.itinerary ? (
    <pre>
      {typeof itinerary.itinerary === "string"
        ? itinerary.itinerary
        : JSON.stringify(itinerary.itinerary, null, 2)}
    </pre>
  ) : (
    <p>
      Your trip details were received, but the backend
      did not return an itinerary.
    </p>
  )}
</div>
        </section>
      )}
    </section>

    <section className="features">
      <div className="feature-card">
        <span>🗺️</span>
        <h3>Personalized Planning</h3>
        <p>
          Plan according to your destination and preferences.
        </p>
      </div>

      <div className="feature-card">
        <span>💰</span>
        <h3>Budget Awareness</h3>
        <p>
          Keep your travel budget in mind while planning.
        </p>
      </div>

      <div className="feature-card">
        <span>✨</span>
        <h3>AI-Powered Travel</h3>
        <p>
          AI itinerary generation is our upcoming feature.
        </p>
      </div>
    </section>

    <footer className="footer">
      TravelMate AI · Built for your next adventure
    </footer>
  </main>
</div>


);
}

export default App;
