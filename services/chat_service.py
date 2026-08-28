from typing import Dict, Any, AsyncGenerator, Optional
import json

from services.memory_service import MemoryService
from services.summary_service import SummaryService
from services.severity_service import SeverityService
from services.prompt_service import PromptService
from services.llm_service import LlmService
from services.fallback_service import FallbackService

class ChatService:
    @staticmethod
    def process_chat_request(
        user_msg: str, 
        thread_id: str, 
        user_id: str, 
        api_key: Optional[str] = None, 
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Synchronous ChatGPT-like conversation pipeline.
        User -> Memory -> Context -> Analyzer -> LLM -> Safety -> Store -> Reply
        """
        # 1. Load Memory & State
        db_messages = MemoryService.get_recent_messages(thread_id, limit=20)
        previous_state = MemoryService.get_user_state(thread_id) or {}
        
        # 2. Summarize if needed
        current_summary = previous_state.get("summary", "")
        if len(db_messages) >= 20:
            current_summary = SummaryService.generate_summary(thread_id, db_messages, current_summary, api_key)
            
        # 3. Save User Message
        MemoryService.save_message(role="user", content=user_msg, thread_id=thread_id, user_id=user_id)

        # 4. Trauma Analyzer (Structured Reasoning)
        new_state = SeverityService.analyze_trauma_state(user_msg, previous_state, api_key)
        
        # Is this an explain mode request?
        is_explain_mode = SeverityService.is_explain_more_mode(user_msg)

        # 5. Build Context
        state_for_prompt = {
            "severity": new_state.get("severity", "LOW"),
            "primary_concern": new_state.get("primary_concern", "General Mental Wellness"),
            "risk_level": new_state.get("risk", "Low"),
            "panic_level": "None",
            "summary": current_summary
        }
        
        formatted_messages = PromptService.build_context(
            state=state_for_prompt, 
            recent_messages=db_messages, 
            current_user_msg=user_msg, 
            is_explain_mode=is_explain_mode,
            language=language
        )
        
        # 6. Call LLM
        reply_text = LlmService.generate_chat_response(formatted_messages, api_key)
        
        # 7. Fallback & Store
        if not reply_text:
            print("[ChatService] LLM failed, using practical fallback.", flush=True)
            fallback_scores = SeverityService.fallback_keyword_analysis(user_msg)
            reply_text = FallbackService.build_practical_response(state_for_prompt, user_msg, language)
            
        # Store assistant message
        MemoryService.save_message(
            role="assistant", 
            content=reply_text, 
            thread_id=thread_id, 
            user_id=user_id,
            matched_condition=new_state.get("primary_concern"),
            severity=new_state.get("severity"),
            confidence=new_state.get("confidence")
        )
        
        # Store updated structured state
        MemoryService.save_user_state(
            thread_id=thread_id,
            user_id=user_id,
            severity=new_state.get("severity", "LOW"),
            primary_concern=new_state.get("primary_concern", "General Mental Wellness"),
            risk_level=new_state.get("risk", "Low"),
            panic_level="None",
            sleep_issue=0,
            doctor_recommended=0,
            confidence=new_state.get("confidence", 1.0),
            summary=current_summary
        )
        
        return {
            "text": reply_text,
            "severity": new_state.get("severity"),
            "primary_concern": new_state.get("primary_concern")
        }

    @staticmethod
    async def process_chat_request_stream(
        user_msg: str, 
        thread_id: str, 
        user_id: str, 
        api_key: Optional[str] = None, 
        language: str = "en"
    ) -> AsyncGenerator[str, None]:
        """
        Asynchronous ChatGPT-like conversation pipeline using Server-Sent Events (SSE).
        """
        # 1. Load Memory & State
        db_messages = MemoryService.get_recent_messages(thread_id, limit=20)
        previous_state = MemoryService.get_user_state(thread_id) or {}
        
        # 2. Summarize if needed
        current_summary = previous_state.get("summary", "")
        if len(db_messages) >= 20:
            current_summary = SummaryService.generate_summary(thread_id, db_messages, current_summary, api_key)
            
        # 3. Save User Message
        MemoryService.save_message(role="user", content=user_msg, thread_id=thread_id, user_id=user_id)

        # 4. Trauma Analyzer (Structured Reasoning)
        new_state = SeverityService.analyze_trauma_state(user_msg, previous_state, api_key)
        
        is_explain_mode = SeverityService.is_explain_more_mode(user_msg)

        # 5. Build Context
        state_for_prompt = {
            "severity": new_state.get("severity", "LOW"),
            "primary_concern": new_state.get("primary_concern", "General Mental Wellness"),
            "risk_level": new_state.get("risk", "Low"),
            "panic_level": "None",
            "summary": current_summary
        }
        
        formatted_messages = PromptService.build_context(
            state=state_for_prompt, 
            recent_messages=db_messages, 
            current_user_msg=user_msg, 
            is_explain_mode=is_explain_mode,
            language=language
        )
        
        # 6. Call LLM & Stream
        full_reply = ""
        stream_gen = LlmService.generate_chat_response_stream(formatted_messages, api_key)
        
        async for chunk in stream_gen:
            if chunk.startswith("data: ") and chunk != "data: [DONE]\\n\\n" and chunk != "data: [DONE]\n\n":
                try:
                    payload = chunk[6:].strip()
                    if payload and payload != "[DONE]":
                        data = json.loads(payload)
                        if "content" in data:
                            full_reply += data["content"]
                except Exception as e:
                    pass
            yield chunk
            
        if not full_reply:
            print("[ChatService] Streaming LLM failed, using practical fallback.", flush=True)
            full_reply = FallbackService.build_practical_response(state_for_prompt, user_msg, language)
            fallback_payload = json.dumps({"content": full_reply})
            yield f"data: {fallback_payload}\n\n"
            yield "data: [DONE]\n\n"
            
        # 7. Store final state
        MemoryService.save_message(
            role="assistant", 
            content=full_reply, 
            thread_id=thread_id, 
            user_id=user_id,
            matched_condition=new_state.get("primary_concern"),
            severity=new_state.get("severity"),
            confidence=new_state.get("confidence")
        )
        
        MemoryService.save_user_state(
            thread_id=thread_id,
            user_id=user_id,
            severity=new_state.get("severity", "LOW"),
            primary_concern=new_state.get("primary_concern", "General Mental Wellness"),
            risk_level=new_state.get("risk", "Low"),
            panic_level="None",
            sleep_issue=0,
            doctor_recommended=0,
            confidence=new_state.get("confidence", 1.0),
            summary=current_summary
        )
