# AWS Lex Chatbot Integration Guide - DAAI Fellowship Platform

This integration guide explains how to build, configure, and integrate a courses-assistant chatbot using **AWS Lex V2**, **FastAPI**, and **React** for the DAAI Fellowship Platform.

---

## 1. Project Structure Analysis

From a meticulous scan of the workspace, here are the key insertion and integration points for the chatbot:

### Backend Architecture (`daai-backend`)
*   **Database Models (`app/models/`)**: 
    *   [track_model.py](file:///c:/Users/LENOVO/Downloads/AWS_Project/daai-backend/app/models/track_model.py) (`Track`): Has `title`, `slug`, `description`.
    *   [learning_module_model.py](file:///c:/Users/LENOVO/Downloads/AWS_Project/daai-backend/app/models/learning_module_model.py) (`LearningModule`): Has `title`, `description`, `track_id`, `track`.
    *   [lesson_model.py](file:///c:/Users/LENOVO/Downloads/AWS_Project/daai-backend/app/models/lesson_model.py) (`Lesson`): Has `title`, `description`, `content`, `module_id`, `track_id`.
*   **Routing System (`app/api/v1/`)**:
    *   [router.py](file:///c:/Users/LENOVO/Downloads/AWS_Project/daai-backend/app/api/v1/router.py): Where we register all versioned routes. We will include `/chatbot` routes here.
*   **Configuration (`app/core/config.py`)**:
    *   [config.py](file:///c:/Users/LENOVO/Downloads/AWS_Project/daai-backend/app/core/config.py): We will extend this settings class to load AWS and Lex credentials.

### Frontend Architecture (`daai-webapp`)
*   **Routing & Layout (`src/layouts/`)**:
    *   [FellowLayout.jsx](file:///c:/Users/LENOVO/Downloads/AWS_Project/daai-webapp/src/layouts/FellowLayout.jsx): The layout wrapping all pages for authenticated Fellows. This is the optimal place to mount our floating chatbot widget.
*   **State & Services (`src/store/` & `src/services/`)**:
    *   We will define `chatbotStore.js` to manage the UI state, chat history, and loading indicators.
    *   We will define `chatbotService.js` to communicate with the FastAPI chatbot backend endpoint.

---

## 2. AWS Lex V2 Configuration Guide

To build a chatbot that answers questions about tracks, modules, and lessons, we need to create and train a bot in the AWS Console (using **AWS Lex V2**).

### Step 2.1: Create the Bot
1. Open the **Amazon Lex console**.
2. Click **Create bot** and select **Create a blank bot**.
3. Configure the bot settings:
   *   **Bot name**: `Dai`
   *   **IAM permissions**: Select *Create a role with basic Amazon Lex permissions*.
   *   **Children's Online Privacy Protection Act (COPPA)**: Select *No*.
   *   **Idle session timeout**: Set to `5 minutes` (or as preferred).
4. Under **Add language to bot**:
   *   Select **English (US)**.
   *   Select a **Voice** (or choose *None* for text-only).
5. Click **Done**.

### Step 2.2: Define Custom Slot Types
To help Lex recognize fellowship courses, modules, or tracks, create custom slot types:
1. Navigate to **Slot types** in the left menu.
2. Click **Add slot type** -> **Add blank slot type**.
3. Name: `FellowshipTrackType`
   *   Add values representing current tracks, such as: `AWS`, `Salesforce`, `QA`.
4. Create another blank slot type: `CourseTopicType`
   *   Add values representing common module topics for your tracks:
       *   **AWS**: `EC2`, `S3`, `IAM`, `Lambda`, `DynamoDB`, `CloudFormation`
       *   **Salesforce**: `Apex`, `SOQL`, `Lightning Web Components`, `Flows`, `Objects`
       *   **QA**: `Selenium`, `Cypress`, `Manual Testing`, `Test Cases`, `Automation`

### Step 2.3: Configure Intents
Create intents to handle student inquiries. The Lex bot matches student sentences to these intents.

#### Intent 1: GreetingIntent
*   **Utterances**: `Hi`, `Hello`, `Hey`, `Is anyone there?`, `Can you help me?`
*   **Response (static)**: `"Hello! I'm your DAAI Fellowship Assistant. I can help you with courses, learning tracks, modules, and lessons. What would you like to know?"`

#### Intent 2: GetTracksIntent
*   **Utterances**: `What tracks are available?`, `List the tracks`, `What fellowship programs do you have?`, `Tell me about the learning tracks`
*   **Fulfillment / Response**: 
    You can choose between **Option A (AWS Lambda Code Hook)** or **Option B (FastAPI Backend Interception)** to supply this data dynamically.

    #### Option A: AWS Lambda Code Hook (Fulfillment on AWS Side)
    Configure AWS Lex to invoke an AWS Lambda function for the `GetTracksIntent`. Here is a production-ready Lambda handler in Python:
    ```python
    import os
    import pymongo

    # Initialize MongoDB client (Cache connection outside handler to reduce cold-start latency)
    MONGO_URI = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
    client = pymongo.MongoClient(MONGO_URI)
    db = client[os.environ.get("DATABASE_NAME", "daai_fellowship")]

    def lambda_handler(event, context):
        intent_name = event['sessionState']['intent']['name']
        
        if intent_name == 'GetTracksIntent':
            try:
                # Query active tracks from MongoDB
                # Ensure the Lambda has VPC access if your DB is hosted in a private cluster
                tracks_cursor = db['tracks'].find({"status": "ACTIVE"})
                tracks = [t['title'] for t in tracks_cursor]
                
                if tracks:
                    track_list = ", ".join(tracks)
                    message = f"We currently offer the following tracks: {track_list}. Which one would you like to explore?"
                else:
                    message = "We don't have any active fellowship tracks available at the moment."
            except Exception as e:
                # Fallback to defaults if DB connection fails
                message = "We currently offer tracks like AWS, Salesforce, and QA. Which one would you like to explore?"
                
            return {
                "sessionState": {
                    "dialogAction": {
                        "type": "Close"
                    },
                    "intent": {
                        "name": intent_name,
                        "state": "Fulfilled"
                    }
                },
                "messages": [
                    {
                        "contentType": "PlainText",
                        "content": message
                    }
                ]
            }
    ```

    #### Option B: FastAPI Backend Interception (Client-Side Fulfillment - Recommended)
    Avoid configuring and maintaining extra AWS Lambda permissions, VPC subnets, and database connection overheads by querying MongoDB dynamically inside your FastAPI backend when Lex delegates or returns the intent.
    
    Update the `send_message` method in [lex_service.py](file:///c:/Users/LENOVO/Downloads/AWS_Project/daai-backend/app/services/lex_service.py):
    ```python
    async def send_message(self, session_id: str, text: str) -> dict:
        # ... (previous boto3 recognize_text logic) ...
        try:
            response = self.client.recognize_text(
                botId=settings.AWS_LEX_BOT_ID,
                botAliasId=settings.AWS_LEX_BOT_ALIAS_ID,
                localeId=settings.AWS_LEX_BOT_LOCALE_ID,
                sessionId=session_id,
                text=text
            )
            
            intent_name = response.get("sessionState", {}).get("intent", {}).get("name")
            messages = []
            
            # Intercept intent for dynamic DB query
            if intent_name == "GetTracksIntent":
                from app.models.track_model import Track, TrackStatus
                active_tracks = await Track.find(Track.status == TrackStatus.ACTIVE).to_list()
                if active_tracks:
                    titles = [t.title for t in active_tracks]
                    track_list = ", ".join(titles)
                    messages.append({
                        "content": f"We currently offer the following tracks: {track_list}. Which one would you like to explore?",
                        "contentType": "PlainText"
                    })
                else:
                    messages.append({
                        "content": "There are no active tracks available right now.",
                        "contentType": "PlainText"
                    })
            else:
                # Regular fallback to Lex configured response
                for msg in response.get("messages", []):
                    messages.append({
                        "content": msg.get("content"),
                        "contentType": msg.get("contentType")
                    })
            
            return {
                "messages": messages,
                "sessionState": response.get("sessionState", {})
            }
        except Exception as e:
            # error handling...
    ```

##### Intent 3: GetModulesIntent
*   **Utterances**: `What modules are in {TrackName}?`, `Show me the syllabus for {TrackName}`, `List modules under {TrackName}`
*   **Slots**:
    *   Name: `TrackName`, Slot Type: `FellowshipTrackType`, Required: `Yes`.
    *   Prompt if missing: `"Which track's modules would you like to see?"`
*   **Fulfillment / Response**:

    ##### Option A: AWS Lambda Code Hook
    Add this condition under your AWS Lambda handler:
    ```python
    elif intent_name == 'GetModulesIntent':
        track_slot = event['sessionState']['intent']['slots'].get('TrackName')
        if track_slot and 'value' in track_slot:
            track_name = track_slot['value']['interpretedValue']
            try:
                # Query published learning modules under this track name (case-insensitive)
                modules_cursor = db['learning_modules'].find({
                    "track": {"$regex": f"^{track_name}$", "$options": "i"},
                    "status": "PUBLISHED"
                }).sort("order", 1)
                modules = [m['title'] for m in modules_cursor]
                
                if modules:
                    module_list = ", ".join(modules)
                    message = f"Here are the modules in the {track_name} track: {module_list}."
                else:
                    message = f"I couldn't find any published modules under the '{track_name}' track."
            except Exception as e:
                message = f"Could not retrieve modules for '{track_name}' at this time."
        else:
            message = "Which track's modules would you like to see?"
    ```

    ##### Option B: FastAPI Backend Interception (lex_service.py)
    Add this block to your backend interception chain in `send_message`:
    ```python
            elif intent_name == "GetModulesIntent":
                slots = response.get("sessionState", {}).get("intent", {}).get("slots", {})
                track_slot = slots.get("TrackName")
                if track_slot and track_slot.get("value"):
                    track_name = track_slot["value"]["interpretedValue"]
                    from app.models.learning_module_model import LearningModule, LearningModuleStatus
                    import re
                    
                    # Search modules matching the track name (case-insensitive)
                    modules = await LearningModule.find(
                        {"track": re.compile(f"^{track_name}$", re.IGNORECASE), "status": LearningModuleStatus.PUBLISHED}
                    ).sort("+order").to_list()
                    
                    if modules:
                        module_titles = [m.title for m in modules]
                        messages.append({
                            "content": f"Here are the modules in the {track_name} track: " + ", ".join(module_titles),
                            "contentType": "PlainText"
                        })
                    else:
                        messages.append({
                            "content": f"I couldn't find any published modules in the {track_name} track.",
                            "contentType": "PlainText"
                        })
                else:
                    messages.append({
                        "content": "Which track's modules would you like to check?",
                        "contentType": "PlainText"
                    })
    ```

#### Intent 4: GetLessonHelpIntent
*   **Utterances**: `I need help with {Topic}`, `Can you explain {Topic}?`, `Tell me about {Topic}`, `What is {Topic}?`
*   **Slots**:
    *   Name: `Topic`, Slot Type: `CourseTopicType` (or `AMAZON.FreeVal` for open-ended queries), Required: `Yes`.
    *   Prompt if missing: `"What topic do you need help with?"`
*   **Fulfillment / Response**:

    ##### Option A: AWS Lambda Code Hook
    Add this condition under your AWS Lambda handler:
    ```python
    elif intent_name == 'GetLessonHelpIntent':
        topic_slot = event['sessionState']['intent']['slots'].get('Topic')
        if topic_slot and 'value' in topic_slot:
            topic = topic_slot['value']['interpretedValue']
            try:
                # Find published lesson containing the topic in title or content
                lesson = db['lessons'].find_one({
                    "$or": [
                        {"title": {"$regex": topic, "$options": "i"}},
                        {"content": {"$regex": topic, "$options": "i"}}
                    ],
                    "status": "PUBLISHED"
                })
                
                if lesson:
                    desc = lesson.get('description', '')
                    content_preview = lesson.get('content', '')[:200]
                    message = f"Here is what we cover in the lesson '{lesson['title']}':\n\n{desc}\n\n*Overview:* {content_preview}..."
                else:
                    message = f"I couldn't find any specific lesson on '{topic}'. Can you try asking about a different topic?"
            except Exception as e:
                message = "I encountered an error looking up that topic."
        else:
            message = "What topic do you need help with?"
    ```

    ##### Option B: FastAPI Backend Interception (lex_service.py)
    Add this block to your backend interception chain in `send_message`:
    ```python
            elif intent_name == "GetLessonHelpIntent":
                slots = response.get("sessionState", {}).get("intent", {}).get("slots", {})
                topic_slot = slots.get("Topic")
                if topic_slot and topic_slot.get("value"):
                    topic = topic_slot["value"]["interpretedValue"]
                    from app.models.lesson_model import Lesson, LessonStatus
                    import re
                    
                    # Search case-insensitively in title and content
                    pattern = re.compile(topic, re.IGNORECASE)
                    lesson = await Lesson.find_one(
                        {"$or": [{"title": pattern}, {"content": pattern}], "status": LessonStatus.PUBLISHED}
                    )
                    
                    if lesson:
                        messages.append({
                            "content": f"Here is information about **{lesson.title}**:\n\n{lesson.description or 'No description available.'}\n\n*Content:* {lesson.content[:200]}...",
                            "contentType": "PlainText"
                        })
                    else:
                        messages.append({
                            "content": f"I couldn't find any matching lessons for '{topic}' in our catalog.",
                            "contentType": "PlainText"
                        })
                else:
                    messages.append({
                        "content": "What topic do you need help with?",
                        "contentType": "PlainText"
                    })
    ```

### Step 2.4: Build and Publish
1. Click **Build** at the top right of the Lex console.
2. Once built successfully, click **Test** to try it out in the AWS chat panel.
3. Click **Publish** to create a new version.
4. Create a **Bot Alias** (e.g., `TestAlias`) and associate it with the active version. Copy the following:
   *   **Bot ID** (e.g., `ABC123XYZ4`)
   *   **Bot Alias ID** (e.g., `TSTALIASID`)
   *   **Locale ID** (usually `en_US`)

---

## 3. Backend Integration (FastAPI)

We will configure the FastAPI backend to relay messages from the frontend React app to the AWS Lex runtime.

### Step 3.1: Install Dependencies
Add `boto3` to [requirements.txt](file:///c:/Users/LENOVO/Downloads/AWS_Project/daai-backend/requirements.txt):
```txt
boto3==1.34.0
```

### Step 3.2: Update Config Schema
Modify [config.py](file:///c:/Users/LENOVO/Downloads/AWS_Project/daai-backend/app/core/config.py) to declare environment variables for AWS Lex:

```python
# Insert within app/core/config.py in the Settings class

    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    AWS_REGION: str = "us-east-1"
    AWS_LEX_BOT_ID: str | None = None
    AWS_LEX_BOT_ALIAS_ID: str | None = None
    AWS_LEX_BOT_LOCALE_ID: str = "en_US"
```

Add these key/value slots inside your local environment configuration `daai-backend/.env`:
```ini
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_LEX_BOT_ID=your-lex-bot-id
AWS_LEX_BOT_ALIAS_ID=your-lex-bot-alias-id
AWS_LEX_BOT_LOCALE_ID=en_US
```

### Step 3.3: Implement the Lex Service
Create a new service at `daai-backend/app/services/lex_service.py` to communicate with Amazon Lex:

```python
# [NEW] app/services/lex_service.py
import boto3
from app.core.config import settings

class LexChatbotService:
    def __init__(self):
        # Initializes the Lex V2 Runtime client
        self.client = boto3.client(
            "lexv2-runtime",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )

    async def send_message(self, session_id: str, text: str) -> dict:
        """
        Sends user text input to AWS Lex V2 Bot and returns the bot responses.
        """
        if not settings.AWS_LEX_BOT_ID or not settings.AWS_LEX_BOT_ALIAS_ID:
            # Fallback or stub for local testing without AWS configured
            return {
                "messages": [{"content": f"[Local Mock] You said: {text}. Configure AWS Lex to receive live replies.", "contentType": "PlainText"}],
                "sessionState": {}
            }

        try:
            response = self.client.recognize_text(
                botId=settings.AWS_LEX_BOT_ID,
                botAliasId=settings.AWS_LEX_BOT_ALIAS_ID,
                localeId=settings.AWS_LEX_BOT_LOCALE_ID,
                sessionId=session_id,
                text=text
            )
            
            # Map Lex messages to clean format
            messages = []
            for msg in response.get("messages", []):
                messages.append({
                    "content": msg.get("content"),
                    "contentType": msg.get("contentType")
                })
            
            return {
                "messages": messages,
                "sessionState": response.get("sessionState", {})
            }
        except Exception as e:
            # Proper error logging
            print(f"AWS Lex Error: {str(e)}")
            return {
                "messages": [{"content": "Sorry, I am having trouble connecting to my brain right now.", "contentType": "PlainText"}],
                "error": str(e)
            }

lex_chatbot_service = LexChatbotService()
```

### Step 3.4: Create the API Endpoint
Create a new route file at `daai-backend/app/api/v1/routes/chatbot_routes.py`:

```python
# [NEW] app/api/v1/routes/chatbot_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.services.lex_service import lex_chatbot_service
from app.dependencies.auth_dependency import get_current_user # verify path in your actual codebase
from app.models.user_model import User

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    messages: list[dict]
    session_state: dict | None = None

@router.post("/message", response_model=ChatResponse)
async def chat_with_bot(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty"
        )
    
    # Use user ID as the session ID to maintain continuous context for the user
    session_id = f"user_{str(current_user.id)}"
    
    response_data = await lex_chatbot_service.send_message(
        session_id=session_id,
        text=payload.message
    )
    
    return ChatResponse(
        messages=response_data.get("messages", []),
        session_state=response_data.get("sessionState")
    )
```

### Step 3.5: Register Chatbot Route
Import and mount the new chatbot router inside [router.py](file:///c:/Users/LENOVO/Downloads/AWS_Project/daai-backend/app/api/v1/router.py):

```python
# Within app/api/v1/router.py
from app.api.v1.routes import chatbot_routes

# Include route
api_router.include_router(
    chatbot_routes.router,
    prefix="/chatbot",
    tags=["Chatbot"]
)
```

---

## 4. Frontend Integration (React & Zustand)

Let's build a modern, high-quality, floating chatbot UI in the frontend.

### Step 4.1: Create API Service
Create `daai-webapp/src/services/chatbotService.js` to call our backend API endpoint:

```javascript
// [NEW] src/services/chatbotService.js
import axiosClient from "../api/axiosClient";

export const sendChatbotMessage = async (message) => {
  const res = await axiosClient.post("/chatbot/message", { message });
  return res.data;
};
```

### Step 4.2: Create Zustand State Store
Create a global state store to maintain chat logs and loading/typing indicators. Create `daai-webapp/src/store/chatbotStore.js`:

```javascript
// [NEW] src/store/chatbotStore.js
import { create } from "zustand";
import { sendChatbotMessage } from "../services/chatbotService";

const useChatbotStore = create((set, get) => ({
  isOpen: false,
  messages: [
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your DAAI assistant. How can I help you with your fellowship tracks or courses today?",
      timestamp: new Date(),
    },
  ],
  isTyping: false,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  
  sendMessage: async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: text,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
    }));

    try {
      const response = await sendChatbotMessage(text);
      
      const newBotMessages = response.messages.map((msg, index) => ({
        id: `bot-${Math.random().toString(36).substring(2, 9)}-${index}`,
        sender: "bot",
        text: msg.content,
        timestamp: new Date(),
      }));

      set((state) => ({
        messages: [...state.messages, ...newBotMessages],
        isTyping: false,
      }));
    } catch (error) {
      const errorMessage = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "Sorry, I am having trouble connecting. Please try again.",
        timestamp: new Date(),
      };
      set((state) => ({
        messages: [...state.messages, errorMessage],
        isTyping: false,
      }));
    }
  },
  
  clearChat: () => set({
    messages: [
      {
        id: "welcome",
        sender: "bot",
        text: "Hello! I am your DAAI assistant. How can I help you with your fellowship tracks or courses today?",
        timestamp: new Date(),
      },
    ],
  }),
}));

export default useChatbotStore;
```

### Step 4.3: Build the Premium Chatbot Component
Create a modern, responsive, floating chatbot component at `daai-webapp/src/components/chatbot/LexChatbot.jsx`. It includes scroll lock handling, typing states, and high-quality visuals matching the shadcn aesthetic:

```jsx
// [NEW] src/components/chatbot/LexChatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Trash2, GraduationCap } from "lucide-react";
import useChatbotStore from "../../store/chatbotStore";

export default function LexChatbot() {
  const { isOpen, messages, isTyping, toggleChat, sendMessage, clearChat } = useChatbotStore();
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4f46e5] text-white shadow-xl hover:scale-105 hover:bg-[#4338ca] active:scale-95 transition-all duration-300"
          title="Ask Assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Main Chat Panel */}
      {isOpen && (
        <div className="flex h-[520px] w-[360px] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">DAAI Assistant</h3>
                <span className="text-[10px] text-indigo-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="rounded-md p-1.5 hover:bg-white/10 transition-colors"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4 text-indigo-100" />
              </button>
              <button
                onClick={toggleChat}
                className="rounded-md p-1.5 hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all ${
                    msg.sender === "user"
                      ? "bg-[#4f46e5] text-white rounded-br-none"
                      : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === "user" ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl bg-white border border-slate-100 px-4 py-3 shadow-sm rounded-bl-none">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#4f46e5]" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#4f46e5]" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#4f46e5]" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="border-t border-slate-100 bg-white p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about modules, assignments..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#4f46e5] focus:bg-white focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4f46e5] text-white shadow-md hover:bg-[#4338ca] active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none disabled:active:scale-100 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
```

### Step 4.4: Render Chatbot in Student Portal
Add the `<LexChatbot />` to [FellowLayout.jsx](file:///c:/Users/LENOVO/Downloads/AWS_Project/daai-webapp/src/layouts/FellowLayout.jsx) to make it available for all students while they view modules/lessons:

```jsx
import FellowPortalContext from '../components/portal/FellowPortalContext'
import { fellowNavigation } from '../constants/navigation'
import PortalLayout from './PortalLayout'
import LexChatbot from '../components/chatbot/LexChatbot' // <-- IMPORT

export default function FellowLayout() {
  return (
    <>
      <PortalLayout
        navigation={fellowNavigation}
        portalLabel="Fellow"
        profilePath="/fellow/profile/settings"
        contextSlot={<FellowPortalContext />}
      />
      <LexChatbot /> {/* <-- RENDER WIDGET */}
    </>
  )
}
```

---

## 5. Verification & Testing Checklist

Once both layers are integrated, test the workflow using the following checks:

1.  **Dependency Verification**:
    Ensure `boto3` is successfully installed in the Python virtual environment:
    ```bash
    pip install boto3
    ```
2.  **Environment Setup Verification**:
    Check if the `.env` variables `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_LEX_BOT_ID` and `AWS_LEX_BOT_ALIAS_ID` are configured correctly.
3.  **FastAPI Endpoint Test**:
    Run the backend and visit Swagger docs at `/docs`. Make a POST request to `/api/v1/chatbot/message` with a body `{"message": "Hello"}` and verify that AWS Lex returns a status 200 with the greeting text.
4.  **UI Verification**:
    Run the React development server:
    ```bash
    npm run dev
    ```
    Log in as a fellow (student role). Ensure the floating Indigo chat button is rendered at the bottom-right corner. Click it to open the window, type messages, and observe responses and typing animations.
