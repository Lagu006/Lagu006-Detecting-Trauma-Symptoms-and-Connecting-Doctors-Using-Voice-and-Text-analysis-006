from typing import List, Dict, Any, Optional
import database

class MemoryService:
    @staticmethod
    def save_message(role: str, content: str, thread_id: str, user_id: str, 
                     matched_condition: Optional[str] = None, 
                     severity: Optional[str] = None, 
                     confidence: Optional[float] = None) -> bool:
        """Saves a single message to the conversation memory."""
        try:
            return database.save_chat_message(
                role=role,
                content=content,
                thread_id=thread_id,
                user_id=user_id,
                matched_condition=matched_condition,
                severity=severity,
                confidence=confidence
            )
        except Exception as e:
            print(f"[MemoryService] Error saving message: {e}", flush=True)
            return False

    @staticmethod
    def get_recent_messages(thread_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieves the recent conversation history up to the specified limit."""
        try:
            messages = database.get_thread_messages(thread_id)
            if len(messages) > limit:
                return messages[-limit:]
            return messages
        except Exception as e:
            print(f"[MemoryService] Error retrieving messages: {e}", flush=True)
            return []

    @staticmethod
    def get_user_state(thread_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves the current structured user state for the session."""
        try:
            return database.get_user_state(thread_id)
        except Exception as e:
            print(f"[MemoryService] Error getting user state: {e}", flush=True)
            return None

    @staticmethod
    def save_user_state(
        thread_id: str,
        user_id: str,
        severity: str,
        primary_concern: str,
        risk_level: str,
        panic_level: str,
        sleep_issue: int,
        doctor_recommended: int,
        confidence: float,
        summary: str
    ) -> Optional[Dict[str, Any]]:
        """Persists the updated structured user state."""
        try:
            return database.save_user_state(
                thread_id=thread_id,
                user_id=user_id,
                severity=severity,
                primary_concern=primary_concern,
                risk_level=risk_level,
                panic_level=panic_level,
                sleep_issue=sleep_issue,
                doctor_recommended=doctor_recommended,
                confidence=confidence,
                summary=summary
            )
        except Exception as e:
            print(f"[MemoryService] Error saving user state: {e}", flush=True)
            return None
