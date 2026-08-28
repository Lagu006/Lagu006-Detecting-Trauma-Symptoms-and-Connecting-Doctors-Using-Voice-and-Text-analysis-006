from typing import Dict, Any, Optional
import json
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

from services.summary_service import SummaryService

class SeverityService:
    @staticmethod
    def is_follow_up_request(user_msg: str) -> bool:
        """
        Detects if the user is asking a conversational follow-up request rather than stating new symptoms.
        """
        lower_msg = user_msg.lower().strip()
        
        # If it's a very short response, it's likely a follow-up or acknowledgment
        if len(lower_msg.split()) <= 3:
            return True
            
        follow_up_phrases = [
            "explain", "why", "how", "elaborate", "tell me more", "more detail", 
            "continue", "what do you mean", "go on", "please continue", 
            "tell me about", "what is that", "examples", "benefits", "risks", 
            "can you expand"
        ]
        
        return any(phrase in lower_msg for phrase in follow_up_phrases)
        
    @staticmethod
    def is_explain_more_mode(user_msg: str) -> bool:
        """
        Detects if the user explicitly requested a detailed explanation.
        """
        lower_msg = user_msg.lower().strip()
        explain_phrases = [
            "explain", "tell me more", "elaborate", "can you expand", 
            "more detail", "what do you mean", "details"
        ]
        return any(phrase in lower_msg for phrase in explain_phrases)

    @staticmethod
    def fallback_keyword_analysis(user_msg: str) -> Dict[str, Any]:
        """Lightweight keyword matching as a safety guardrail fallback."""
        t = user_msg.lower()
        if any(w in t for w in ['suicide', 'die', 'kill', 'hurt myself', 'end my life']):
            return {"severity": "HIGH", "primary_concern": "Crisis/Self-Harm", "risk": "High", "confidence": 0.8}
        if any(w in t for w in ['panic', 'overwhelm', 'anxious', 'racing']):
            return {"severity": "MODERATE", "primary_concern": "Panic/Anxiety", "risk": "Low", "confidence": 0.7}
        if any(w in t for w in ['trigger', 'flashback', 'trauma', 'ptsd']):
            return {"severity": "MODERATE", "primary_concern": "Trauma Trigger", "risk": "Medium", "confidence": 0.7}
        if any(w in t for w in ['sleep', 'insomnia', 'nightmare']):
            return {"severity": "LOW", "primary_concern": "Sleep Disturbance", "risk": "Low", "confidence": 0.7}
            
        return {"severity": "LOW", "primary_concern": "General Mental Wellness", "risk": "Low", "confidence": 0.5}

    @staticmethod
    def analyze_trauma_state(user_msg: str, previous_state: Dict[str, Any], api_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Uses LLM-assisted structured reasoning to determine severity and primary concern.
        Returns JSON-like dictionary.
        """
        # Rule 6: Only update severity when new symptoms appear.
        if SeverityService.is_follow_up_request(user_msg):
            # Keep previous severity and concern
            return {
                "severity": previous_state.get("severity", "LOW"),
                "primary_concern": previous_state.get("primary_concern", "General Mental Wellness"),
                "risk": previous_state.get("risk_level", "Low"),
                "confidence": previous_state.get("confidence", 1.0),
                "is_follow_up": True
            }

        key, model, base_url = SummaryService.extract_client_config(api_key)
        
        if OpenAI and key:
            try:
                client = OpenAI(api_key=key, base_url=base_url, timeout=4.0, max_retries=1)
                prompt = f"""Analyze the following patient message and extract the current psychological trauma state.
Return ONLY valid JSON matching this schema exactly:
{{
  "severity": "LOW" | "MODERATE" | "HIGH",
  "primary_concern": "String (e.g. Sleep Disturbance, Acute Panic)",
  "risk": "Low" | "Medium" | "High",
  "confidence": Float (0.0 to 1.0),
  "follow_up": ["String", "String"]
}}

Patient message: "{user_msg}"
"""
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "system", "content": prompt}],
                    response_format={ "type": "json_object" } if model.startswith("gpt-4") else None,
                    temperature=0.0,
                    max_tokens=150
                )
                
                content = response.choices[0].message.content.strip()
                if content.startswith("```json"):
                    content = content[7:-3].strip()
                    
                parsed = json.loads(content)
                parsed["is_follow_up"] = False
                
                # Sanitize severity
                if parsed.get("severity") not in ["LOW", "MODERATE", "HIGH"]:
                    parsed["severity"] = "LOW"
                    
                return parsed
            except Exception as e:
                print(f"[SeverityService] LLM JSON Analysis failed: {e}. Falling back to keywords.", flush=True)

        # Fallback if LLM fails
        result = SeverityService.fallback_keyword_analysis(user_msg)
        result["is_follow_up"] = False
        return result
