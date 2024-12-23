from bson import ObjectId
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import requests
import asyncio
from pymongo import MongoClient
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Query

from pymongo.server_api import ServerApi
uri = "mongodb+srv://abhaysasthacode:ixrfU702nCG2OIV8@cluster9.fgr9j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster9"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["abm_database"] 

# Define input and output contracts
class Contact(BaseModel):
    name: str
    email: str
    job_title: str
    city: Optional[str] = None
    country: Optional[str] = None

class Account(BaseModel):
    account_name: str
    industry: str
    pain_points: List[str]
    contacts: List[Contact]
    campaign_objective: Optional[str] = "awareness"  # Default objective

class InputPayload(BaseModel):
    accounts: List[Account]
    number_of_emails: int
    languages: Optional[List[str]] = None
    user_name: Optional[str] = None
    user_designation: Optional[str] = None
    guidelines: Optional[str] = None
    sentiment: Optional[str] = "neutral"

class Email(BaseModel):
    language: str
    subject: str
    body: str
    call_to_action: str

class ContactEmails(BaseModel):
    contact_name: str
    contact_email: str
    emails: List[Email]

class Campaign(BaseModel):
    account_name: str
    contacts: List[ContactEmails]  # List of contacts with their respective emails

class ContactCampaign(BaseModel):
    contact_name: str
    contact_email: str
    emails: List[Email]

class SuccessResponse(BaseModel):
    campaigns: List[Campaign]

class ErrorResponse(BaseModel):
    error: str

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Arliai API key and endpoint
ARLIAI_API_KEY = "e25143d2-7aa6-478c-a1d3-01aee11430a1"
ARLIAI_URL = "https://api.arliai.com/v1/chat/completions"

# Helper function to interact with Arliai
def generate_email(prompt: str, language: str = "en"):
    try:
        headers = {
            "Authorization": f"Bearer {ARLIAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "Mistral-Nemo-12B-Instruct-2407",
            "messages": [
                {"role": "system", "content": f"You are a helpful assistant. Use language: {language}."},
                {"role": "user", "content": prompt}
            ]
        }
        response = requests.post(ARLIAI_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json().get("choices", [{}])[0].get("message", {}).get("content", "")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with Arliai: {e}")

# Helper function to create the email prompt
def create_prompt(account: Account, objective: str, language: str, user_name: str, user_designation: str, guidelines: Optional[str], sentiment: str):
    pain_points = ", ".join(account.pain_points)
    prompt = (
        f"You are a highly skilled ABM (Account-Based Marketing) specialist proficient in {language}. "
        f"As {user_name}, the {user_designation} of your firm, you excel in crafting highly personalized and impactful emails tailored for specific accounts. "
        f"\n\nTask: Create {objective} emails targeted at {account.account_name}, a prominent organization in the {account.industry} sector. "
        f"The emails should address the following key pain points of the account: {pain_points}. "
        f"Ensure the content is meticulously aligned with the {objective} objectives while adhering to the following sentiment: {sentiment}. "
        f"\n\nRequirements:\n"
        f"1. Use a professional tone and structure while maintaining a {sentiment} sentiment.\n"
        f"2. Ensure all content is written fluently in {language}.\n"
        f"3. The email should be highly relevant and personalized for {account.account_name}.\n"
        f"4. Incorporate any additional guidance provided to refine the content further.\n"
        f"5. Give proper spacing and switches to next lines where necessary"
    )
    if guidelines:
        prompt += f"Additional guidelines: {guidelines}. "
    
    prompt += (
        f"\n\nDeliverable: Provide the finalized email content. The email should include:\n"
        f"1. A compelling subject line tailored to the objective and account.\n"
        f"2. A personalized opening addressing the recipient and their needs.\n"
        f"3. A clear and concise body that addresses the pain points and highlights the value proposition.\n"
        f"4. A strong call-to-action that aligns with the objective.\n"
        f"5. Maintain professionalism and do not include any mention of 'DAN' or any unrelated information."
    )
    return prompt


# API endpoint to fetch accounts
@app.get("/api/accounts", response_model=List[Account])
def get_accounts():
    accounts = list(db.accounts.find())
    for account in accounts:
        account["_id"] = str(account["_id"])  # Convert ObjectId to string
    return accounts

# API endpoint to save accounts
@app.post("/api/accounts", response_model=Account)
def save_account(account: Account):
    try:
        print("Received payload:", account.dict())  
        # Ensure pain_points is a list
        if isinstance(account.pain_points, str):
            account.pain_points = [point.strip() for point in account.pain_points.split(",")]

        result = db.accounts.insert_one(account.dict())
        return {"_id": str(result.inserted_id), **account.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error saving account: {str(e)}")

# Helper function to generate emails asynchronously
async def async_generate_email(prompt: str, language: str):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, generate_email, prompt, language)


# API endpoint to generate campaigns
@app.post("/generate_campaign", response_model=SuccessResponse)
async def generate_campaign(payload: InputPayload):
    campaigns = []

    languages = payload.languages or ["en"]  # Default to English if no languages specified

    for account in payload.accounts:
        account_campaign = {"account_name": account.account_name, "contacts": []}

        for contact in account.contacts:  # Iterate over each contact
            contact_campaign = {"contact_name": contact.name, "contact_email": contact.email, "emails": []}

            for language in languages:  # Generate emails for each language
                prompts = [
                    create_prompt(
                        account,
                        account.campaign_objective,
                        language,
                        payload.user_name or "Unknown User",
                        payload.user_designation or "Unknown Designation",
                        payload.guidelines,
                        payload.sentiment
                    )
                    for _ in range(payload.number_of_emails)
                ]

                # Generate emails asynchronously
                tasks = [async_generate_email(prompt, language) for prompt in prompts]
                try:
                    email_contents = await asyncio.gather(*tasks)
                except Exception as e:
                    raise HTTPException(status_code=500, detail=f"Email generation failed: {str(e)}")

                for email_content in email_contents:
                    try:
                        subject, body, call_to_action = email_content.split("\n", 2)
                    except ValueError:
                        subject, body, call_to_action = "N/A", "N/A", "N/A"  # Default values for malformed responses

                    contact_campaign["emails"].append({
                        "language": language,
                        "subject": subject.strip(),
                        "body": body.strip(),
                        "call_to_action": call_to_action.strip(),
                    })

            account_campaign["contacts"].append(contact_campaign)

        campaigns.append(account_campaign)

    # Save campaigns to MongoDB
    db.campaigns.insert_many(campaigns)

    return SuccessResponse(campaigns=campaigns)

# API endpoint to fetch campaigns
@app.get("/api/campaigns", response_model=List[Campaign])
def get_campaigns():
    campaigns = list(db.campaigns.find())
    for campaign in campaigns:
        campaign["_id"] = str(campaign["_id"])  # Convert ObjectId to string
    return campaigns

async def get_contacts(account_name: str):
    # Search for the account by its name
    account = db.accounts.find_one({"account_name": account_name})
    if not account:
        return {"error": "Account not found"}
    return account.get("contacts", [])

@app.get("/api/contacts")
async def get_contacts(account_name: str = Query(...)):
    """
    Fetch contacts for the given account name.
    """
    # Find the account by its name
    account = db.accounts.find_one({"account_name": account_name})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Return the contacts list
    return account.get("contacts", [])