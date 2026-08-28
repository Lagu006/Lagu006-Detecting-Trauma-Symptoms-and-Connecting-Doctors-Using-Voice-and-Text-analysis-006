from typing import List, Dict, Any, Optional
import database
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

class SummaryService:
    @staticmethod
    def extract_client_config(api_key: Optional[str] = None):
        if not api_key or api_key.startswith("dummy"):
            return None, "gpt-4o-mini", None
        if api_key.startswith("AIzaSy"):
            return api_key, "gemini-1.5-flash", "https://generativelanguage.googleapis.com/v1beta/openai/"
        return api_key, "gpt-4o-mini", None

    @staticmethod
    def generate_summary(thread_id: str, db_messages: List[Dict[str, Any]], current_summary: str, api_key: Optional[str] = None) -> str:
        """
        If conversation exceeds 20 messages, creates a summary of the older messages
        and appends it to the current summary.
        """
        if len(db_messages) <= 20:
            return current_summary

        first_msgs = [m.get("content", "") for m in db_messages[:3] if m.get("content")]
        if not first_msgs:
            return current_summary

        key, model, base_url = SummaryService.extract_client_config(api_key)
        if OpenAI and key:
            try:
                client = OpenAI(api_key=key, base_url=base_url, timeout=3.0, max_retries=1)
                prompt = (
                    "Summarize the following early conversation context concisely. "
                    "Focus on the patient's primary symptoms, triggers, and any coping mechanisms discussed. "
                    "Do not include recent messages."
                )
                
                messages_to_summarize = [{"role": "system", "content": prompt}]
                for msg in db_messages[:5]:
                    messages_to_summarize.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
                    
                response = client.chat.completions.create(
                    model=model,
                    messages=messages_to_summarize,
                    temperature=0.3,
                    max_tokens=150
                )
                
                new_summary = response.choices[0].message.content.strip()
                combined_summary = f"{current_summary}\n- {new_summary}".strip()
                
                # Update the summary in the database
                database.update_thread_summary(thread_id, combined_summary)
                return combined_summary
                
            except Exception as e:
                print(f"[SummaryService] Summary LLM failed: {e}", flush=True)

        # Fallback heuristic summary
        heuristic_summary = f"Patient previously discussed: {'; '.join(first_msgs[:3][:100])}..."
        combined = f"{current_summary}\n- {heuristic_summary}".strip()
        database.update_thread_summary(thread_id, combined)
        return combined
