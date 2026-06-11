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
            
            intent_name = response.get("sessionState", {}).get("intent", {}).get("name")
            messages = []

            # Map Lex messages or execute client-side fulfillment (FastAPI Interception)
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

            else:
                # Fallback to standard Lex responses
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
