from typing import List, Dict, Any, Optional, AsyncGenerator
import json
import asyncio
try:
    from openai import OpenAI, AsyncOpenAI
except ImportError:
    OpenAI = None
    AsyncOpenAI = None

from services.summary_service import SummaryService

class LlmService:
    @staticmethod
    def generate_chat_response(messages: List[Dict[str, Any]], api_key: Optional[str] = None) -> Optional[str]:
        """
        Synchronous call to LLM. Returns the LLM response text or None if it fails.
        """
        key, model, base_url = SummaryService.extract_client_config(api_key)
        
        if not OpenAI or not key:
            print("[LlmService] No valid OpenAI library or API key found.", flush=True)
            return None
            
        try:
            client = OpenAI(api_key=key, base_url=base_url, timeout=12.0)
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.6,
                max_tokens=800
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"[LlmService] Synchronous LLM generation failed: {e}", flush=True)
            return None

    @staticmethod
    async def generate_chat_response_stream(messages: List[Dict[str, Any]], api_key: Optional[str] = None) -> AsyncGenerator[str, None]:
        """
        Asynchronous streaming generator for Server-Sent Events (SSE).
        Yields tokens as they arrive.
        """
        key, model, base_url = SummaryService.extract_client_config(api_key)
        
        if not AsyncOpenAI or not key:
            print("[LlmService] No valid AsyncOpenAI library or API key found for streaming.", flush=True)
            yield "data: [ERROR] API key missing or invalid.\n\n"
            yield "data: [DONE]\n\n"
            return
            
        try:
            client = AsyncOpenAI(api_key=key, base_url=base_url, timeout=12.0)
            stream = await client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.6,
                max_tokens=800,
                stream=True
            )
            
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    # Properly escape for SSE
                    escaped_content = json.dumps({"content": content})
                    yield f"data: {escaped_content}\n\n"
                    
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            print(f"[LlmService] Async streaming LLM failed: {e}", flush=True)
            error_payload = json.dumps({"error": "Connection to LLM failed."})
            yield f"data: {error_payload}\n\n"
            yield "data: [DONE]\n\n"
