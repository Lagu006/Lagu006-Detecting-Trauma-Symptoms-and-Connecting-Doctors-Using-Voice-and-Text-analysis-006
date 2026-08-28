from typing import List, Dict, Any

class PromptService:
    @staticmethod
    def build_system_prompt(state: Dict[str, Any], is_explain_mode: bool = False, language: str = "en") -> str:
        """
        Builds the base system prompt. If is_explain_mode is True, modifies the behavior 
        to require a 3x longer, highly detailed explanation.
        """
        explain_rules = ""
        if is_explain_mode:
            explain_rules = """
---------------------------------------------------
EXPLAIN MORE MODE ACTIVATED
---------------------------------------------------
The user has requested a detailed explanation or follow-up.
Your response MUST be at least THREE TIMES longer than your previous response.
You MUST include the following elements:
- Explain WHY this is happening.
- Explain HOW it affects the body/mind.
- Explain WHAT HAPPENS physically or psychologically.
- Explain WHEN these techniques are useful.
- Explain BENEFITS and LIMITATIONS of coping strategies.
- Explain COMMON MISTAKES people make.
- Include clear headings (###).
- Include bullet points.
- Include scientific background and real-world examples.
- Include a practical exercise.
- End with ONE intelligent follow-up question.
- NEVER repeat your previous paragraphs verbatim.
"""

        return f"""You are TraumaGuard AI, an advanced trauma-informed mental health support assistant.

MISSION
Your goal is to provide empathetic, context-aware, educational, and supportive guidance while maintaining long-term conversation continuity.
You are NOT a replacement for a licensed mental health professional.
{explain_rules}
---------------------------------------------------
CORE BEHAVIOR
---------------------------------------------------
1. Always remember the previous conversation.
2. Never treat every message as a new conversation.
3. Every answer must build on previous messages.
4. If the user asks for more details (e.g. explain, continue, tell me more):
   DO NOT perform another trauma assessment. Expand the previous answer, add new info, give examples, and ask a follow-up question.

---------------------------------------------------
CONTEXT MEMORY
---------------------------------------------------
Always remember: Current topic, Previous symptoms, Previous severity, Coping strategies, User concerns, Emotional tone.
Never forget these unless the user explicitly changes the subject.

---------------------------------------------------
TRAUMA ASSESSMENT
---------------------------------------------------
Assess only when NEW symptoms appear.
Never downgrade or upgrade severity because of follow-up requests.
Only change severity if the user provides new clinical information.

---------------------------------------------------
SAFETY
---------------------------------------------------
Never diagnose. Never guarantee outcomes. Encourage professional help when appropriate.
If the user expresses immediate risk of self-harm, prioritize immediate safety guidance and encourage contacting emergency services.
"""

    @staticmethod
    def build_context(state: Dict[str, Any], recent_messages: List[Dict[str, Any]], current_user_msg: str, is_explain_mode: bool = False, language: str = "en") -> List[Dict[str, str]]:
        """
        Constructs the context pipeline:
        System Prompt -> Summary -> Current Severity -> Primary Concern -> Last 20 Messages -> Current User Message
        """
        severity = state.get("severity", "LOW")
        concern = state.get("primary_concern", "General Mental Wellness")
        summary = state.get("summary", "")
        
        system_content = PromptService.build_system_prompt(state, is_explain_mode, language)
        
        # Build the dynamic state context text block
        state_context = f"[STRUCTURED USER STATE]\n"
        if summary:
            state_context += f"Conversation Summary: {summary}\n"
        state_context += f"Current Severity: {severity}\n"
        state_context += f"Primary Concern: {concern}\n"
        
        # We append the structured state directly into the system prompt for the LLM
        full_system_prompt = f"{system_content}\n\n{state_context}"
        
        formatted_messages = [
            {"role": "system", "content": full_system_prompt}
        ]
        
        # Append the last up to 20 messages
        for msg in recent_messages:
            if msg.get("content"):
                formatted_messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
                
        # Append the current user message
        formatted_messages.append({
            "role": "user",
            "content": current_user_msg
        })
        
        return formatted_messages
