from typing import Dict, Any

class FallbackService:
    @staticmethod
    def build_practical_response(state: Dict[str, Any], user_msg: str, language: str = "en") -> str:
        severity = state.get("severity", "LOW")
        concern = state.get("primary_concern", "General Mental Wellness")
        
        if severity == "HIGH":
            return (
                f"Severity: {severity}\n"
                f"Primary Concern: {concern}\n\n"
                "I hear how much pain you're in. Please pause, breathe, and connect with immediate support:\n\n"
                "**Emergency Helplines:**\n"
                "• **Tele-MANAS:** Dial `14416` or `1800-891-4416`\n"
                "• **KIRAN Line:** `1800-599-0019`\n"
                "• **International Lifeline:** Dial `988`\n\n"
                "Please reach out to someone immediately."
            )
        elif concern == "Panic/Anxiety" or concern == "Panic & Acute Anxiety":
            return (
                f"Severity: {severity}\n"
                f"Primary Concern: {concern}\n\n"
                "You are safe here. This surge of adrenaline will pass shortly.\n\n"
                "**Immediate Steps for Control:**\n"
                "• **Relax Muscles:** Drop your shoulders and unclench your jaw.\n"
                "• **Splash Cold Water:** Wash your face to trigger the dive reflex.\n"
                "• **Box Breathing:** Inhale 4s, hold 4s, exhale 4s, hold 4s (3 cycles).\n\n"
                "What is the main source of distress on your mind right now?"
            )
        else:
            return (
                f"Severity: {severity}\n"
                f"Primary Concern: {concern}\n\n"
                "Thank you for sharing that with me. Recognizing how you feel is the first step toward relief.\n\n"
                "**5-4-3-2-1 Grounding Exercise:**\n"
                "• 👀 Name **5 things** you can see.\n"
                "• ✋ Touch **4 distinct textures**.\n"
                "• 👂 Listen for **3 sounds**.\n"
                "• 👃 Notice **2 scents**.\n"
                "• 👅 Focus on **1 taste**.\n\n"
                "Could you tell me what specific thoughts have felt heaviest for you recently?"
            )
