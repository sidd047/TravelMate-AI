import os
import traceback
import time

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai

# Load environment variables from backend/.env
load_dotenv()

app = FastAPI(title="TravelMate AI")

# Allow requests from frontend development servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TripRequest(BaseModel):
    destination: str = Field(min_length=1)
    budget: int = Field(gt=0)
    days: int = Field(gt=0)
    travel_style: str = Field(min_length=1)
    interests: str = Field(min_length=1)


@app.get("/")
def home():
    return {"message": "TravelMate AI Backend is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/api/itinerary")
def generate_itinerary(trip: TripRequest):
    print("DEBUG: Itinerary endpoint executed")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is missing. Check backend/.env.",
        )

    prompt = f"""
You are TravelMate AI, a helpful travel itinerary planner.

Create a practical travel itinerary using these details:

Destination: {trip.destination}
Total budget in INR: {trip.budget}
Duration: {trip.days} days
Travel style: {trip.travel_style}
Interests: {trip.interests}

Requirements:
1. Create a day-by-day itinerary.
2. Suggest morning, afternoon, and evening activities.
3. Include approximate costs in Indian Rupees.
4. Suggest food, transport, and accommodation where relevant.
5. Keep the estimated total within the given budget.
6. Mention that prices and opening hours must be verified.
7. Do not invent confirmed bookings or live prices.
8. Use clear headings and readable formatting.
"""

    try:
        client = genai.Client(api_key=api_key)

        print("DEBUG 1: Gemini request starting...")
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
        )
        print("DEBUG 2: Gemini response received!")

        itinerary = response.text

        if not itinerary or not itinerary.strip():
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty itinerary. Please try again.",
            )

        return {
            "message": "Itinerary generated successfully!",
            "destination": trip.destination,
            "budget": trip.budget,
            "days": trip.days,
            "travel_style": trip.travel_style,
            "interests": trip.interests,
            "itinerary": itinerary,
        }

    except HTTPException:
        raise

    except Exception as error:
        traceback.print_exc()
        print("Gemini API error:", repr(error))

        error_text = str(error).lower()
        if "503" in error_text or "unavailable" in error_text or "high demand" in error_text:
            detail = (
                "Gemini is temporarily busy (503 UNAVAILABLE). "
                "Please wait a minute and try again."
            )
        elif "429" in error_text or "resource_exhausted" in error_text:
            detail = (
                "Gemini API quota or rate limit reached. Check your API quota "
                "and billing, then try again later."
            )
        else:
            detail = (
                "Itinerary generation failed. Check the backend terminal "
                "for the actual Gemini API error."
            )

        raise HTTPException(status_code=502, detail=detail) from error
