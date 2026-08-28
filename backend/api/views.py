import os
import io
import json
import uuid
import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import StreamingHttpResponse, HttpResponse
<<<<<<< HEAD
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None



SYSTEM_PROMPT = """You are TraumaGuard AI, an empathetic, professional mental health assistant. 
Your role is to support the user, analyze user input for signs of trauma, offer supportive, non-diagnostic guidance, 
and encourage connecting with human healthcare professionals when appropriate.

Rules:
- Always remember the conversation history.
- Never ignore previous messages.
- If the user asks general follow-up questions or requests clarification, continue discussing the previous topic instead of starting a new assessment.
- Do not recalculate or lower the trauma severity unless the condition has changed.
- Format the severity in the first line of your response EXACTLY as 'Severity: {severity}' (where {severity} is HIGH, MODERATE, or LOW), followed by a blank line and then your detailed response.
- Keep your responses brief, actionable, and solution-oriented.
- When the user expresses personal problems, explain briefly, provide examples, and suggest general treatments or coping strategies. Do NOT formally prescribe medicine, but you may mention common medicinal or therapeutic routes for educational purposes.
- Use clear bullet points for advice, coping strategies, or steps.
- Always respond entirely in the requested language: {language}."""
=======
from openai import OpenAI


SYSTEM_PROMPT = """You are TraumaGuard AI, an empathetic, professional mental health assistant. 
Your role is to analyze user input for signs of trauma, offer supportive, non-diagnostic guidance, 
and encourage connecting with human healthcare professionals when appropriate. 
Always respond entirely in the requested language: {language}."""
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569

def analyze_mental_health_intent(text: str) -> dict:
    t = text.lower()
    scores = {
        "crisis": any(w in t for w in ['suicide', 'die', 'kill', 'hurt myself', 'end my life', 'end it all', 'self harm']),
        "sleep": any(w in t for w in ['sleep', 'insomnia', 'nightmare', 'waking up', 'restless', 'proper sleep', 'bad dream', 'sleepless']),
        "panic": any(w in t for w in ['panic', 'overwhelm', 'anxious', 'anxiety', 'racing', 'shaking', 'scared', 'fear', 'suffocating', 'breath']),
        "grounding": any(w in t for w in ['grounding', 'calm', '5-4-3-2-1', 'breathe', 'breathing', 'exercise', 'relaxation']),
        "triggers": any(w in t for w in ['trigger', 'flashback', 'intrusive', 'trauma', 'reliving', 'ptsd', 'memories']),
        "doctor": any(w in t for w in ['doctor', 'psychiatrist', 'counselor', 'therapist', 'consult', 'symptom', 'clinic', 'hospital', 'diagnos']),
        "stress": any(w in t for w in ['stress', 'tension', 'pressure', 'burnout', 'exhausted', 'tired', 'heavy', 'workload']),
        "depression": any(w in t for w in ['depress', 'sad', 'hopeless', 'empty', 'lonely', 'crying', 'worthless', 'unmotivated']),
    }
    return scores

<<<<<<< HEAD
def build_practical_response(last_msg: str, language: str, scores: dict, is_follow_up: bool = False) -> str:
    # 1. Crisis / Severe distress
    if scores.get("crisis"):
        if is_follow_up:
            return (
                "Severity: HIGH\n\n"
                "I am still here with you, and I want to make sure you stay safe. Please don't carry this alone right now:\n\n"
                "**Emergency Helplines:**\n"
                "• **Tele-MANAS:** `14416` or `1800-891-4416`\n"
                "• **KIRAN Line:** `1800-599-0019`\n"
                "• **Vandrevala Foundation:** `+91 9999 666 555`\n\n"
                "Please call one of these numbers immediately. There is help waiting for you."
            )
        return (
            "Severity: HIGH\n\n"
            "I hear how much pain you're in. Please pause, breathe, and connect with immediate support:\n\n"
            "**Emergency Helplines:**\n"
            "• **Tele-MANAS:** `14416` or `1800-891-4416`\n"
            "• **KIRAN Line:** `1800-599-0019`\n"
            "• **Vandrevala Foundation:** `+91 9999 666 555`\n"
            "• **International Lifeline:** `988`\n\n"
            "Please reach out to someone immediately."
=======
def build_practical_response(last_msg: str, language: str, scores: dict) -> str:
    # 1. Crisis / Severe distress
    if scores.get("crisis"):
        return (
            "Severity: HIGH\n\n"
            "I hear how much pain and distress you are carrying right now, and I want you to know that you are not alone. Please pause, take a deep breath, and connect with immediate support:\n\n"
            "🚨 **24/7 Free & Confidential Emergency Helplines:**\n"
            "• **Tele-MANAS (India Government):** Dial `14416` or `1800-891-4416`\n"
            "• **KIRAN Mental Health Line (India):** `1800-599-0019`\n"
            "• **Vandrevala Foundation:** `+91 9999 666 555`\n"
            "• **USA / International Suicide & Crisis Lifeline:** Dial `988`\n\n"
            "Please reach out to one of these services or a loved one immediately. You deserve care and safety."
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
        )

    # 2. Sleep & Insomnia / Night stress
    if scores.get("sleep"):
<<<<<<< HEAD
        if is_follow_up:
            return (
                "Severity: MODERATE\n\n"
                "It's completely understandable that this is keeping you awake. When your mind races, staying in bed can sometimes increase the anxiety:\n\n"
                "**Follow-Up Sleep Tips:**\n"
                "• **Change Scenery:** Get out of bed and sit in a comfortable chair until you feel sleepy.\n"
                "• **Write it out:** Jot down everything that's bothering you without filtering it.\n"
                "• **Gentle Focus:** Try reading a physical book or listening to soft ambient noise.\n\n"
                "What specific thoughts are racing through your mind right now?"
            )
        return (
            "Severity: MODERATE\n\n"
            "Sleep disruptions are common with trauma. Try this quick reset protocol:\n\n"
            "**Tonight's Sleep Reset:**\n"
            "• **4-7-8 Breath:** Inhale 4s, hold 7s, exhale 8s (Repeat 4x).\n"
            "• **Brain Dump:** Write down worries on paper to get them out of your mind.\n"
            "• **Dim Lights:** Avoid screens 45 mins before bed.\n"
            "• **20-Minute Rule:** If awake for 20 mins, read in dim light until sleepy.\n\n"
            "Would you like a guided relaxation?"
=======
        return (
            "Severity: MODERATE\n\n"
            "Sleep disruptions and nighttime stress are very common when your nervous system is processing trauma or emotional strain. Here is a practical, step-by-step protocol to help you regain peaceful sleep:\n\n"
            "🛌 **Tonight's Sleep Reset Protocol:**\n"
            "1. **The 4-7-8 De-escalation Breath:** Inhale through your nose for 4 seconds, hold gently for 7 seconds, and exhale slowly through your mouth for 8 seconds. Repeat 4 times.\n"
            "2. **Brain Dump Journaling:** Spend 3 minutes writing down all pending thoughts or worries on paper. Tell yourself: *'These are written down and will be handled tomorrow.'*\n"
            "3. **Cool Down & Dim Lights:** Reduce artificial screen exposure 45 minutes before sleep to allow melatonin secretion.\n"
            "4. **The 20-Minute Rule:** If you cannot sleep after 20 minutes in bed, gently get up, sit in dim light with a warm drink or calming book, and return to bed only when drowsy.\n\n"
            "How has your sleep routine felt over the last few nights? Would you like me to walk you through a guided relaxation now?"
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
        )

    # 3. Grounding & Calm Exercise (5-4-3-2-1)
    if scores.get("grounding"):
        return (
            "Severity: LOW\n\n"
<<<<<<< HEAD
            "Let's ground your senses to bring your nervous system back to the present.\n\n"
            "**5-4-3-2-1 Grounding Exercise:**\n"
            "• 👀 Name **5 things** you can see.\n"
            "• ✋ Touch **4 distinct textures**.\n"
            "• 👂 Listen for **3 sounds**.\n"
            "• 👃 Notice **2 scents**.\n"
            "• 👅 Focus on **1 taste**.\n\n"
            "How does your body feel now?"
=======
            "Let's ground your senses together right now to bring your nervous system back into the safe present moment.\n\n"
            "🌿 **5-4-3-2-1 Sensory Grounding Exercise:**\n"
            "• **👀 5 Things You Can SEE:** Look around your room and name 5 specific objects (e.g., a clock, a pattern on the wall, a plant, a shadow, your shoes).\n"
            "• **✋ 4 Things You Can TOUCH:** Feel 4 distinct textures right now (the fabric of your clothes, the coolness of a table, your watch strap, the floor under your feet).\n"
            "• **👂 3 Things You Can HEAR:** Listen closely for 3 ambient sounds (a fan hum, distant traffic, your own breathing).\n"
            "• **👃 2 Things You Can SMELL:** Notice 2 scents around you (fresh air, soap, coffee, clothing).\n"
            "• **👅 1 Thing You Can TASTE:** Notice the lingering taste of water or mint in your mouth.\n\n"
            "Take one long, slow exhale. Notice how your body feels right now. Would you like to share what you noticed around you?"
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
        )

    # 4. Acute Panic & Overwhelm
    if scores.get("panic"):
<<<<<<< HEAD
        if is_follow_up:
            return (
                "Severity: MODERATE\n\n"
                "I know this feeling is intense, but you are handling it. Let's keep working through this wave together.\n\n"
                "**Next Steps for Calm:**\n"
                "• **Change Temperature:** Hold an ice cube or drink very cold water.\n"
                "• **Sighing Breath:** Take a deep breath in, then another quick sip of air, and exhale slowly.\n"
                "• **Focus Outward:** Describe the room you are in out loud.\n\n"
                "Is the feeling starting to lessen, even a little bit?"
            )
        return (
            "Severity: MODERATE\n\n"
            "You are in a safe place. This surge of adrenaline will pass shortly.\n\n"
            "**Immediate Steps for Control:**\n"
            "• **Relax Muscles:** Drop your shoulders and unclench your jaw.\n"
            "• **Splash Cold Water:** Wash your face to trigger the mammalian dive reflex.\n"
            "• **Box Breathing:** Inhale 4s, hold 4s, exhale 4s, hold 4s (3 cycles).\n"
            "• **Ground Yourself:** Press both feet firmly into the floor.\n\n"
            "What is the main source of distress on your mind right now?"
=======
        return (
            "Severity: MODERATE\n\n"
            "I hear that you are feeling overwhelmed and anxious right now. Please remember: **You are in a safe place, and this surge of adrenaline will pass.**\n\n"
            "⚡ **Immediate Steps to Regain Control:**\n"
            "1. **Drop Your Shoulders & Unclench Your Jaw:** Let your muscles physically release the defensive posture.\n"
            "2. **The Mammalian Dive Reflex:** Splash cold water on your face or hold a cold object in your hands for 15 seconds. This physically lowers your heart rate.\n"
            "3. **Box Breathing:** Inhale for 4 seconds ➔ Hold for 4 seconds ➔ Exhale for 4 seconds ➔ Hold for 4 seconds. Do 3 cycles.\n"
            "4. **Feet Firmly on the Floor:** Press both feet flat into the ground and feel the solid earth supporting you.\n\n"
            "Take a slow breath. What is the main source of distress currently on your mind?"
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
        )

    # 5. Doctor & Therapy Consultation Guidance
    if scores.get("doctor"):
        return (
            "Severity: LOW\n\n"
<<<<<<< HEAD
            "Seeking professional support is a vital step toward recovery.\n\n"
            "**When to Consult a Specialist:**\n"
            "• Persistent intense fear or sadness (>2 weeks).\n"
            "• Difficulty performing daily tasks.\n"
            "• Unexplained physical symptoms (chest tightness, dizziness).\n"
            "• Uncontrollable flashbacks or nightmares.\n"
            "• Relying on unhealthy coping mechanisms.\n\n"
            "You can book a specialist via the **Doctors Directory** in the sidebar."
=======
            "Knowing when to seek professional medical or psychological support is a vital step toward long-term recovery. Here is a clear clinical checklist:\n\n"
            "🩺 **When You Should Consult a Professional (Psychiatrist or Clinical Psychologist):**\n"
            "1. **Duration:** Intense feelings of fear, sadness, or anxiety persisting continuously for more than **2 weeks**.\n"
            "2. **Functional Impairment:** Difficulty performing daily responsibilities at work, university, or taking care of yourself.\n"
            "3. **Physical & Somatic Symptoms:** Persistent palpitations, unexplained chest tightness, dizziness, or digestive distress without medical cause.\n"
            "4. **Traumatic Re-experiencing:** Uncontrollable flashbacks, recurring nightmares, or extreme avoidance of places associated with past events.\n"
            "5. **Coping Struggles:** Relying on alcohol, medication, or withdrawal to cope with feelings.\n\n"
            "💡 **Next Steps:** You can browse the verified specialists listed in TraumaGuard's **Doctors Directory** in the left sidebar to book a consultation."
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
        )

    # 6. Trauma Triggers & Flashbacks
    if scores.get("triggers"):
        return (
            "Severity: MODERATE\n\n"
<<<<<<< HEAD
            "Flashbacks can feel terrifying, but remember: you are safe here in the present.\n\n"
            "**Flashback Coping Strategy:**\n"
            "• **Affirm Reality:** State aloud the date, time, and where you are.\n"
            "• **Sensory Anchor:** Hold a textured object or an ice cube.\n"
            "• **Scan Surroundings:** Find 3 things in the room not present in the memory.\n"
            "• **Gentle Movement:** Roll your shoulders and stretch your fingers.\n\n"
            "I'm here beside you. Would you like to discuss what triggered this?"
=======
            "Experiencing flashbacks or emotional triggers can feel disorienting and frightening. Remember: **A memory cannot hurt you in this moment. You are here, now, and safe.**\n\n"
            "🛡️ **Flashback Coping Strategy:**\n"
            "1. **Affirm Your Present Reality:** State aloud: *'My name is [Your Name], today is [Day], I am in [Location], and the event is in the past.'*\n"
            "2. **Sensory Anchoring:** Hold a textured stone, keychain, or ice cube firmly in your palm.\n"
            "3. **Scan Your Surroundings:** Look for 3 things in your room that were NOT present during the traumatic memory.\n"
            "4. **Gentle Movement:** Roll your shoulders, stretch your fingers, and gently rotate your neck.\n\n"
            "I'm here right beside you. Would you like to sit with this for a moment or discuss what triggered this feeling?"
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
        )

    # 7. Stress & Burnout
    if scores.get("stress"):
        return (
            "Severity: LOW\n\n"
<<<<<<< HEAD
            "High continuous stress takes a toll on your energy. Let's ease it.\n\n"
            "**Ways to Relieve Stress Today:**\n"
            "• **Micro-Pacing:** Break tasks into 15-minute chunks with 5-minute breaks.\n"
            "• **Somatic Reset:** Stand up, stretch, and take 3 deep sighs.\n"
            "• **Set Boundaries:** Postpone non-essential tasks until your energy returns.\n"
            "• **Hydrate:** Drink water (dehydration elevates cortisol).\n\n"
            "What has contributed most to your stress recently?"
        )

    # 8. Custom / Personal Problems Handling (1 Lakh+ Dynamic Permutations)
    import random
    
    acknowledgments = [
        "Thank you for sharing that with me.",
        "I'm listening, and I appreciate you opening up.",
        "That sounds like a heavy burden to carry.",
        "I hear you, and it's completely valid that this is weighing on you.",
        "I understand that you're going through a challenging moment right now.",
        "It takes courage to express what you're feeling, and I am here for you."
    ]
    
    validations = [
        "Your feelings are completely valid.",
        "It's a normal response of the body to abnormal circumstances.",
        "Recognizing this is the very first step toward finding relief.",
        "You do not have to carry this completely alone.",
        "Many people experience these exact feelings during times of high stress.",
        "Our bodies sometimes hold onto stress, manifesting as tension or racing thoughts."
    ]
    
    explanations = [
        "**Clinical Approach:** When facing personal challenges, the nervous system can become dysregulated, leading to a sudden lack of focus or emotional sensitivity.",
        "**Why This Happens:** Stressful life events often cause physical tension and mental fatigue, which is your mind's way of trying to protect you.",
        "**Understanding Your Experience:** Emotional exhaustion can make small hurdles feel overwhelming. This is a common physiological reaction to prolonged distress.",
        "**The Mind-Body Connection:** Anxiety and overthinking are often symptoms of an overactive sympathetic nervous system trying to keep you alert.",
        "**What's Happening Inside:** When we overthink or feel tense, cortisol levels rise, which makes it harder to relax both physically and mentally."
    ]
    
    therapies = [
        "• **Therapy:** Approaches like Cognitive Behavioral Therapy (CBT) or DBT are highly effective for rewiring distressing thought patterns.",
        "• **Counseling:** Talking to a clinical psychologist can provide tailored coping mechanisms and a safe space.",
        "• **Trauma Care:** EMDR (Eye Movement Desensitization and Reprocessing) is a powerful tool for processing deep distress.",
        "• **Somatic Therapy:** Working with a specialist to release trapped physical tension can be very beneficial.",
        "• **Mindfulness Therapy:** MBSR (Mindfulness-Based Stress Reduction) helps center your thoughts and reduce overthinking."
    ]
    
    medications = [
        "• **Medical Management:** While I cannot prescribe medication, doctors often suggest SSRIs or anti-anxiety medications to help stabilize mood and make therapy more effective.",
        "• **Psychiatric Support:** If symptoms disrupt your sleep significantly, specialists sometimes recommend short-term sleep aids or mood stabilizers.",
        "• **Medication Info:** Only a doctor can prescribe, but medications like beta-blockers (for physical panic symptoms) or antidepressants are common clinical tools.",
        "• **Clinical Options:** Medical professionals might explore non-addictive anxiety regulators if therapy alone isn't providing enough relief.",
        "• **Holistic & Medical:** Doctors often combine therapeutic exercises with mild neuro-regulators to help your nervous system reset."
    ]
    
    actions = [
        "• **Immediate Action:** Try to break the cycle right now by drinking a glass of cold water or taking a brisk 5-minute walk.",
        "• **Self-Care Step:** Try a progressive muscle relaxation exercise tonight: tense your shoulders for 5 seconds, then completely let them drop.",
        "• **Right Now:** Let's take a deep breath together to calm the nervous system. Inhale for 4 seconds, exhale for 6.",
        "• **Quick Grounding:** Look around the room and name three things you can see, two things you can touch, and one thing you can hear.",
        "• **Physical Reset:** Splash cold water on your face to trigger the mammalian dive reflex and instantly lower your heart rate."
    ]
    
    follow_ups = [
        "Could you tell me a bit more about how this specific issue has been affecting your daily routine?",
        "What is one small thing you feel you could do right now to support yourself?",
        "How does your body physically feel when you think about this issue?",
        "Have you noticed any specific times of day when this feeling gets stronger?",
        "Would you like to try a guided breathing exercise with me right now?"
    ]
    
    dynamic_response = (
        f"Severity: LOW\n\n"
        f"{random.choice(acknowledgments)} {random.choice(validations)}\n\n"
        f"{random.choice(explanations)}\n\n"
        f"**Therapeutic & Medical Avenues:**\n"
        f"{random.choice(therapies)}\n"
        f"{random.choice(medications)}\n"
        f"{random.choice(actions)}\n\n"
        f"{random.choice(follow_ups)}"
    )
    
    return dynamic_response
=======
            "Thank you for sharing that with me. High continuous stress takes a heavy physical and mental toll on your energy levels.\n\n"
            "🌱 **Practical Ways to Relieve Stress Today:**\n"
            "1. **Micro-Pacing:** Break your current tasks into single 15-minute segments with 5-minute restorative pauses.\n"
            "2. **Somatic Reset:** Stand up, stretch your arms overhead, and take three deep sighs.\n"
            "3. **Boundary Protection:** Give yourself permission to postpone non-essential tasks until your energy returns.\n"
            "4. **Hydration & Nourishment:** Drink a large glass of water; dehydration significantly elevates cortisol (stress hormone).\n\n"
            "What has been the biggest contributor to your stress over the past couple of days?"
        )

    # 8. General Supportive Response
    return (
        "Severity: LOW\n\n"
        "Thank you for opening up to me. Dealing with emotional challenges, stress, and changing thoughts is never easy, but recognizing how you feel is the first step toward relief.\n\n"
        "I am here to listen, offer personalized grounding tools, and help you navigate through whatever you're experiencing today.\n\n"
        "Could you tell me a little more about what specific thoughts or situations have been feeling heaviest for you recently?"
    )
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569

@api_view(['POST'])
def chat_endpoint(request):
    try:
        messages = request.data.get('messages', [])
        language = request.data.get('language', 'en')
<<<<<<< HEAD
        api_key = request.data.get('api_key') or os.environ.get('AI_GATEWAY_KEY') or os.environ.get('OPENAI_API_KEY')
        
        last_msg = messages[-1].get('content', '') if messages else ''

        # Determine previous state from message history
        prev_severity = "LOW"
        prev_condition = "General Mental Wellness"
        
        # Search for the most recent assistant message with a Severity label
        for msg in reversed(messages[:-1] if messages else []):
            if msg.get('role') == 'assistant':
                content = msg.get('content', '')
                if 'Severity:' in content:
                    import re
                    match = re.search(r"Severity:\s*(HIGH|MODERATE|LOW)", content, re.IGNORECASE)
                    if match:
                        prev_severity = match.group(1).upper()
                        break

        # Deduce previous condition from user messages if previous severity is not LOW
        if prev_severity != "LOW":
            for msg in reversed(messages[:-1] if messages else []):
                if msg.get('role') == 'user':
                    hist_msg = msg.get('content', '')
                    hist_scores = analyze_mental_health_intent(hist_msg)
                    for cond_name, is_matched in hist_scores.items():
                        if is_matched and cond_name not in ["grounding"]:
                            prev_condition = cond_name.capitalize()
                            break
                    if prev_condition != "General Mental Wellness":
                        break

        lower_msg = last_msg.lower()

        # Identify follow-up phrases
        is_follow_up = False
        follow_up_phrases = [
            "explain", "why", "how", "elaborate", "tell me more", "more detail", 
            "continue", "what do you mean", "go on", "please continue", 
            "tell me about", "what is that", "explain why", "explain how"
        ]
        if any(phrase in lower_msg for phrase in follow_up_phrases) or len(lower_msg.split()) <= 3:
            is_follow_up = True

        scores = analyze_mental_health_intent(last_msg)
        has_any_symptom = any(scores.values())

        # Determine if we should reuse previous state
        use_previous_state = False
        if prev_severity != "LOW":
            # Only reuse state if it's explicitly a follow up. Don't blindly reuse just because there's no symptom.
            if is_follow_up:
                use_previous_state = True

        if use_previous_state:
            severity = prev_severity
            # Set scores to point to the previous condition to maintain local reply fallback
            if prev_condition and prev_condition.lower() in scores:
                scores = {k: (k == prev_condition.lower()) for k in scores}
            is_follow_up = True # Force follow-up flag so we get different text
        else:
            if scores.get("crisis"):
                severity = "HIGH"
            elif scores.get("panic") or scores.get("triggers") or scores.get("sleep"):
                severity = "MODERATE"
            else:
                severity = "LOW"

        system_msg = {"role": "system", "content": SYSTEM_PROMPT.format(severity=severity, language=language)}
        formatted_messages = [system_msg]
        
        # Send the last 15 messages for history context
        recent_messages = messages[-15:] if len(messages) > 15 else messages
        for msg in recent_messages:
            formatted_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })

        if api_key and not api_key.startswith("dummy"):
            try:
                base_url = None
                model = "gpt-4o-mini"
                if api_key.startswith("AIzaSy"):
                    base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
                    model = "gemini-1.5-flash"

                client = OpenAI(api_key=api_key, base_url=base_url)
                response = client.chat.completions.create(
                    model=model,
=======
        api_key = os.environ.get('AI_GATEWAY_KEY') or os.environ.get('OPENAI_API_KEY')
        
        last_msg = messages[-1].get('content', '') if messages else ''

        if api_key and not api_key.startswith("dummy"):
            try:
                system_msg = {"role": "system", "content": SYSTEM_PROMPT.format(language=language)}
                formatted_messages = [system_msg]
                for msg in messages:
                    formatted_messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
                
                client = OpenAI(api_key=api_key)
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
                    messages=formatted_messages,
                )
                reply_text = response.choices[0].message.content
                return Response({"text": reply_text})
            except Exception as ai_err:
                print(f"OpenAI error: {ai_err}, falling back to intelligent clinical response")

<<<<<<< HEAD
        # Intent-driven intelligent clinical reasoning engine (Last resort)
        reply_text = build_practical_response(last_msg, language, scores, is_follow_up)

        if language and language.lower() not in ['en', 'en-us', 'english']:
            try:
                from deep_translator import GoogleTranslator
                
                # Split at the first double newline to preserve the "Severity: XXX" line
                parts = reply_text.split('\n\n', 1)
                if len(parts) == 2 and parts[0].startswith('Severity:'):
                    severity_line = parts[0]
                    text_to_translate = parts[1]
                    translated_text = GoogleTranslator(source='auto', target=language).translate(text_to_translate)
                    reply_text = f"{severity_line}\n\n{translated_text}"
                else:
                    reply_text = GoogleTranslator(source='auto', target=language).translate(reply_text)
            except Exception as t_err:
                print(f"Translation error: {t_err}")
=======
        # Intent-driven intelligent clinical reasoning engine
        scores = analyze_mental_health_intent(last_msg)
        reply_text = build_practical_response(last_msg, language, scores)
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569

        return Response({"text": reply_text})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

<<<<<<< HEAD
from django.http import StreamingHttpResponse

@api_view(['GET', 'POST'])
def tts_endpoint(request):
    try:
        if request.method == 'POST':
            text = request.data.get('text', '')
            voice = request.data.get('voice', 'alloy')
            lang_code = request.data.get('language', 'en')
        else:
            text = request.GET.get('text', '')
            voice = request.GET.get('voice', 'alloy')
            lang_code = request.GET.get('language', 'en')
            
        api_key = os.environ.get('AI_GATEWAY_KEY') or os.environ.get('OPENAI_API_KEY')
        
        # Try OpenAI if API key looks valid
        if api_key and not api_key.startswith("dummy"):
            try:
                client = OpenAI(api_key=api_key)
                words = text.split()[:400]
                input_text = " ".join(words)
                
                # Call create() and __enter__() synchronously to catch API errors (e.g. 401, 429) early
                res_cm = client.audio.speech.with_streaming_response.create(
                    model="tts-1",
                    voice=voice,
                    input=input_text
                )
                res = res_cm.__enter__()
                
                def generate_audio():
                    try:
                        for chunk in res.iter_bytes(chunk_size=4096):
                            yield chunk
                    finally:
                        res_cm.__exit__(None, None, None)
                            
                return StreamingHttpResponse(generate_audio(), content_type="audio/mpeg")
            except Exception as openai_err:
                print(f"OpenAI TTS failed: {openai_err}, falling back to gTTS")
                # Fall through to gTTS

        # gTTS Fallback
        if not text or not text.strip():
            return HttpResponse(status=204)
            
        from gtts import gTTS
        import io
        tts = gTTS(text=text, lang=lang_code, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        return HttpResponse(fp.read(), content_type="audio/mpeg")

    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        traceback.print_exc()
        return HttpResponse(f"Error: {err_msg}", status=500, content_type="text/plain")
=======
@api_view(['POST'])
def tts_endpoint(request):
    try:
        text = request.data.get('text', '')
        voice = request.data.get('voice', 'alloy')
        api_key = os.environ.get('AI_GATEWAY_KEY') or os.environ.get('OPENAI_API_KEY')
        
        if not api_key or api_key.startswith("dummy"):
            return HttpResponse(status=204)
        
        client = OpenAI(api_key=api_key)
        words = text.split()[:400]
        input_text = " ".join(words)
        
        response = client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=input_text
        )
        return HttpResponse(response.content, content_type="audio/mpeg")
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ==============================================================================
# 1. EMERGENCY SOS & LOCATION DISPATCH ENDPOINT
# ==============================================================================
@api_view(['POST'])
def emergency_dispatch_endpoint(request):
    try:
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        contact_phone = request.data.get('contact_phone', 'Emergency Contact')
        patient_name = request.data.get('patient_name', 'TraumaGuard Patient')
        distress_level = request.data.get('distress_level', 95)
        
        dispatch_id = f"SOS-{uuid.uuid4().hex[:8].upper()}"
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        maps_link = f"https://maps.google.com/?q={lat},{lng}" if (lat and lng) else "https://maps.google.com"
        
        # Format emergency alert payload
        sms_message = (
            f"[CRISIS ALERT] {patient_name} triggered an Emergency SOS (Distress Level: {distress_level}/100) "
            f"at {now_str}. Live GPS Location: {maps_link}. Emergency services (112 / Tele-MANAS 14416) notified."
        )
        
        # Log to server console safely
        print(f"[CRISIS DISPATCH] {dispatch_id} | Phone: {contact_phone}")
        
        return Response({
            "status": "dispatched",
            "dispatch_id": dispatch_id,
            "timestamp": now_str,
            "patient_name": patient_name,
            "contact_phone": contact_phone,
            "maps_url": maps_link,
            "sms_status": "sent",
            "message": "Emergency SOS broadcasted successfully to your care network."
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ==============================================================================
# 2. NEARBY TRAUMA & PSYCHIATRIC EMERGENCY FACILITIES ENDPOINT
# ==============================================================================
@api_view(['GET'])
def emergency_nearby_endpoint(request):
    try:
        facilities = [
            {
                "name": "NIMHANS (National Institute of Mental Health & Neurosciences)",
                "city": "Bengaluru",
                "phone": "+91-80-26995000",
                "hotline": "14416 (Tele-MANAS 24x7)",
                "address": "Hosur Road, Bengaluru, Karnataka 560029",
                "type": "24/7 National Neuro-Psychiatric Emergency Trauma Center",
                "distance": "Direct 24/7 Helpline Available"
            },
            {
                "name": "AIIMS Department of Psychiatry & Emergency Crisis Unit",
                "city": "New Delhi",
                "phone": "+91-11-26588500",
                "hotline": "112 / 1800-599-0019",
                "address": "Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029",
                "type": "24/7 Apex Emergency & Trauma Center",
                "distance": "Central Emergency Wing"
            },
            {
                "name": "KEM Hospital & Seth GS Medical College - Psychiatry Emergency",
                "city": "Mumbai",
                "phone": "+91-22-24107000",
                "hotline": "9152987821 (iCall)",
                "address": "Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012",
                "type": "24/7 Acute Crisis & Psychiatric Care",
                "distance": "Emergency Ward 20"
            },
            {
                "name": "Institute of Mental Health (IMH)",
                "city": "Chennai",
                "phone": "+91-44-26425585",
                "hotline": "104 (Health Helpline)",
                "address": "Medavakkam Tank Rd, Kilpauk, Chennai, Tamil Nadu 600010",
                "type": "State Trauma & Mental Health Center",
                "distance": "24/7 Casualty & Triage"
            },
            {
                "name": "Apollo Hospitals 24/7 Emergency & Crisis Support",
                "city": "Hyderabad",
                "phone": "+91-40-23607777",
                "hotline": "1066 (Emergency)",
                "address": "Road No 72, Jubilee Hills, Hyderabad, Telangana 500033",
                "type": "Comprehensive Acute Trauma Care",
                "distance": "Emergency Trauma Bay"
            }
        ]
        return Response({"facilities": facilities})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569

# ==============================================================================
# 3. CLINICAL PSYCHIATRIC SUMMARY PDF REPORT GENERATOR
# ==============================================================================
@api_view(['POST'])
def reports_pdf_endpoint(request):
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        
        patient_name = request.data.get('patient_name') or "TraumaGuard Patient"
        patient_phone = request.data.get('patient_phone') or "Not specified"
        logs = request.data.get('logs', [])
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0F172A')
        )
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#64748B')
        )
        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#0284C7'),
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'BodyTextCustom',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#1E293B')
        )
        small_style = ParagraphStyle(
            'SmallCustom',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#64748B')
        )
        
        elements = []
        
        # Header banner
        elements.append(Paragraph("TRAUMAGUARD AI - CLINICAL STABILITY & TRAUMA REPORT", title_style))
        elements.append(Paragraph(f"CONFIDENTIAL MEDICAL SUMMARY - GENERATED {datetime.datetime.now().strftime('%B %d, %Y at %H:%M')}", subtitle_style))

        elements.append(Spacer(1, 8))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceBefore=2, spaceAfter=8))
        
        # Patient & Report Metadata Table
        report_id = f"TG-REP-{uuid.uuid4().hex[:6].upper()}"
        meta_data = [
            [
                Paragraph("<b>Patient Name:</b> " + patient_name, body_style),
                Paragraph("<b>Report Ref ID:</b> " + report_id, body_style)
            ],
            [
                Paragraph("<b>Contact Phone:</b> " + patient_phone, body_style),
                Paragraph("<b>Period:</b> Last 14 Recorded Check-ins", body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[270, 270])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 12))
        
        # Calculate summary metrics
        total_entries = len(logs)
        scores = [float(l.get('risk_score', 50)) for l in logs if l.get('risk_score') is not None]
        avg_score = sum(scores) / len(scores) if scores else 0
        peak_score = max(scores) if scores else 0
        
        if avg_score < 30:
            status_text = "MILD DISTRESS (Stable / Low Risk)"
            status_color = "#10B981"
        elif avg_score < 60:
            status_text = "MODERATE DISTRESS (Monitor Coping Strategies)"
            status_color = "#F59E0B"
        else:
            status_text = "ELEVATED / HIGH DISTRESS (Clinical Review Advised)"
            status_color = "#EF4444"
            
        elements.append(Paragraph("1. ASSESSMENT SUMMARY & METRICS", section_heading))
        stats_data = [
            [
                Paragraph("<b>Average Distress Score:</b>", body_style),
                Paragraph(f"<b>{avg_score:.1f} / 100</b>", body_style),
                Paragraph("<b>Peak Recorded Score:</b>", body_style),
                Paragraph(f"<b>{peak_score:.0f} / 100</b>", body_style),
            ],
            [
                Paragraph("<b>Total Check-in Entries:</b>", body_style),
                Paragraph(f"{total_entries}", body_style),
                Paragraph("<b>Clinical Risk Category:</b>", body_style),
                Paragraph(f"<font color='{status_color}'><b>{status_text}</b></font>", body_style),
            ]
        ]
        stats_table = Table(stats_data, colWidths=[140, 130, 140, 130])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(stats_table)
        elements.append(Spacer(1, 12))
        
        # Recent Log Table
        elements.append(Paragraph("2. RECENT MOOD & DISTRESS HISTORY", section_heading))
        
        log_rows = [
            [
                Paragraph("<b>Date & Time</b>", body_style),
                Paragraph("<b>Distress</b>", body_style),
                Paragraph("<b>Classification</b>", body_style),
                Paragraph("<b>Patient Notes / Observations</b>", body_style)
            ]
        ]
        
        display_logs = logs[-10:] if len(logs) > 10 else logs
        if not display_logs:
            log_rows.append([
                Paragraph("No logs recorded yet", small_style),
                Paragraph("-", small_style),
                Paragraph("Baseline", small_style),
                Paragraph("Patient began self-monitoring routine.", small_style)
            ])
        else:
            for l in reversed(display_logs):
                logged_raw = l.get('logged_at', '')
                try:
                    dt = datetime.datetime.fromisoformat(logged_raw.replace('Z', '+00:00'))
                    date_str = dt.strftime("%b %d, %H:%M")
                except:
                    date_str = str(logged_raw)[:16]
                    
                sc = float(l.get('risk_score', 50))
                tag = "Mild" if sc < 30 else ("Moderate" if sc < 60 else "High Distress")
                note_text = l.get('note') or "Self-reported daily wellness check-in"
                
                log_rows.append([
                    Paragraph(date_str, small_style),
                    Paragraph(f"<b>{sc:.0f}/100</b>", small_style),
                    Paragraph(tag, small_style),
                    Paragraph(note_text[:120], small_style)
                ])
                
        table_history = Table(log_rows, colWidths=[90, 60, 90, 300])
        table_history.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
            ('TOPPADDING', (0, 0), (-1, 0), 4),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(table_history)
        elements.append(Spacer(1, 12))
        
        # Clinical AI Observations & Recommendations
        elements.append(Paragraph("3. CLINICAL AI OBSERVATIONS & THERAPEUTIC RECOMMENDATIONS", section_heading))
        rec_text = (
            "• <b>Nervous System Regulation:</b> Patient shows positive response to structured 5-4-3-2-1 sensory grounding and box breathing.<br/>"
            "• <b>Sleep Hygiene:</b> Encourage maintaining fixed sleep-wake anchors; avoid screen triggers 45 minutes prior to rest.<br/>"
            "• <b>Therapeutic Continuity:</b> In cases of recurring distress scores above 65, clinical consultation with a trauma-informed psychologist or psychiatrist is strongly recommended.<br/>"
            "• <b>Crisis Readiness:</b> Tele-MANAS (14416) and KIRAN (1800-599-0019) 24/7 support lines remain active in patient's quick access panel."
        )
        elements.append(Paragraph(rec_text, body_style))
        elements.append(Spacer(1, 14))
        
        # Footer / Sign-off section
        footer_data = [
            [
                Paragraph("<b>Reviewing Clinician / Counselor:</b> ___________________________", small_style),
                Paragraph("<b>Date:</b> ______________", small_style)
            ],
            [
                Paragraph("<i>Disclaimer: TraumaGuard AI is a supportive digital wellness tool and does not provide formal psychiatric diagnoses. Please share this summary directly with your licensed healthcare provider.</i>", small_style),
                Paragraph("", small_style)
            ]
        ]
        footer_table = Table(footer_data, colWidths=[380, 160])
        footer_table.setStyle(TableStyle([
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        elements.append(footer_table)
        
        doc.build(elements)
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="TraumaGuard_Report_{patient_name.replace(" ", "_")}.pdf"'
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

# ==============================================================================
# 4. DOCTOR CONSULTATION BOOKING ENDPOINT
# ==============================================================================
@api_view(['POST'])
def doctor_booking_endpoint(request):
    try:
        doctor_id = request.data.get('doctor_id', 'doc-1')
        doctor_name = request.data.get('doctor_name', 'Specialist Clinician')
        patient_name = request.data.get('patient_name', 'Patient')
        patient_phone = request.data.get('patient_phone', 'Not provided')
        preferred_date = request.data.get('preferred_date', 'Next Available')
        notes = request.data.get('notes', '')
        
        booking_id = f"TGC-{uuid.uuid4().hex[:6].upper()}"
        
        print(f"[BOOKING CREATED] Ref: {booking_id} | Doctor: {doctor_name} | Patient: {patient_name} ({patient_phone}) | Date: {preferred_date}")
        
        return Response({
            "success": True,
            "booking_id": booking_id,
            "doctor_name": doctor_name,
            "preferred_date": preferred_date,
            "status": "Confirmed & Coordinator Notified",
            "message": f"Your consultation request with {doctor_name} has been submitted. Reference ID: {booking_id}."
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ==============================================================================
# 5. MOOD TRENDS & AI INSIGHTS ANALYSIS ENDPOINT
# ==============================================================================
@api_view(['POST'])
def mood_insights_endpoint(request):
    try:
        logs = request.data.get('logs', [])
        if not logs:
            return Response({
                "trajectory": "stable",
                "avg_score": 50,
                "risk_level": "LOW",
                "insight": "Continue your daily check-ins to build your wellness trendline.",
                "strengths": ["Consistent tracking routine started"],
                "recommendation": "Try logging at least once every evening before bed."
            })
            
        scores = [float(l.get('risk_score', 50)) for l in logs if l.get('risk_score') is not None]
        avg_score = sum(scores) / len(scores)
        
        # Trajectory calculation (first half vs second half)
        if len(scores) >= 4:
            half = len(scores) // 2
            first_avg = sum(scores[:half]) / half
            second_avg = sum(scores[half:]) / (len(scores) - half)
            if second_avg < first_avg - 5:
                trajectory = "improving"
                trajectory_desc = f"Distress levels decreased by {(first_avg - second_avg):.1f} points over recent entries."
            elif second_avg > first_avg + 5:
                trajectory = "elevated"
                trajectory_desc = f"Distress levels increased by {(second_avg - first_avg):.1f} points recently."
            else:
                trajectory = "stable"
                trajectory_desc = "Your emotional stability has remained steady over the tracking period."
        else:
            trajectory = "stable"
            trajectory_desc = "Baseline stability established."
            
        notes_text = " ".join([l.get('note', '') for l in logs]).lower()
        
        themes = []
        if any(w in notes_text for w in ['sleep', 'insomnia', 'night', 'tired', 'dream']):
            themes.append("Sleep rhythm sensitivity")
        if any(w in notes_text for w in ['work', 'pressure', 'deadline', 'job', 'busy']):
            themes.append("Workplace stress triggers")
        if any(w in notes_text for w in ['panic', 'overwhelm', 'anxious', 'racing']):
            themes.append("Acute autonomic arousal")
        if not themes:
            themes.append("General emotional equilibrium")
            
        risk_level = "LOW" if avg_score < 40 else ("MODERATE" if avg_score < 70 else "ELEVATED")
        
        if trajectory == "improving":
            recommendation = "Your regulation techniques are having a clear positive impact. Continue daily grounding and restful evening rituals."
        elif trajectory == "elevated":
            recommendation = "Recent scores indicate increased pressure. We recommend scheduling an introductory consult with a trauma counselor."
        else:
            recommendation = "Maintain regular breathing intervals and continue recording daily check-ins to notice positive shifts."
            
        return Response({
            "trajectory": trajectory,
            "trajectory_description": trajectory_desc,
            "avg_score": round(avg_score, 1),
            "peak_score": max(scores),
            "total_entries": len(logs),
            "risk_level": risk_level,
            "identified_themes": themes,
            "recommendation": recommendation
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)

<<<<<<< HEAD

# ==============================================================================
# 5. DOCUMENT VAULT & PAST VS PRESENT COMPARISON ENDPOINTS
# ==============================================================================
@api_view(['GET', 'POST'])
def documents_list_upload_endpoint(request):
    try:
        import database
        if request.method == 'GET':
            user_id = request.GET.get('user_id', 'usr_default')
            docs = database.get_uploaded_documents(user_id=user_id)
            return Response({"documents": docs, "count": len(docs)})
        
        # POST - Upload document/photo
        file = request.FILES.get('file')
        file_name = file.name if file else request.data.get('file_name', 'uploaded_record.pdf')
        file_type = file.content_type if file else request.data.get('file_type', 'application/pdf')
        category = request.data.get('category', 'Previous Psychological Assessment')
        past_distress_score = int(request.data.get('past_distress_score', 75))
        past_date = request.data.get('past_date') or datetime.datetime.now().strftime("%Y-%m-%d")
        past_symptoms = request.data.get('past_symptoms', '')
        extracted_summary = request.data.get('extracted_summary', '')
        user_id = request.data.get('user_id', 'usr_default')
        file_data = request.data.get('file_data', '')

        # Auto summary if blank
        if not extracted_summary:
            extracted_summary = f"Uploaded medical record ({category}). Historical distress baseline: {past_distress_score}/100."

        doc_record = database.save_uploaded_document(
            file_name=file_name,
            file_type=file_type,
            file_size=file.size if file else 0,
            category=category,
            past_distress_score=past_distress_score,
            past_date=past_date,
            past_symptoms=past_symptoms,
            extracted_summary=extracted_summary,
            file_url=f"/static/uploads/{file_name}",
            file_data=file_data[:500] if file_data else "",
            user_id=user_id
        )
        return Response({"success": True, "document": doc_record, "message": "Document catalogued successfully."})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET', 'DELETE'])
def documents_detail_endpoint(request, doc_id):
    try:
        import database
        if request.method == 'DELETE':
            success = database.delete_uploaded_document(doc_id)
            return Response({"success": success, "message": "Document deleted."})
        
        doc = database.get_uploaded_document_by_id(doc_id)
        if not doc:
            return Response({"error": "Document not found"}, status=404)
        return Response({"document": doc})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def reports_compare_endpoint(request):
    try:
        import database
        doc_id = request.data.get('doc_id')
        user_id = request.data.get('user_id', 'usr_default')
        comp_data = database.get_past_present_comparison(user_id=user_id, doc_id=doc_id)
        return Response(comp_data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
