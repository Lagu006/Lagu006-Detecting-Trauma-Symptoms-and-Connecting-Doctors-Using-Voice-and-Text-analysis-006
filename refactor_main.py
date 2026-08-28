import sys

with open('main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = 816 - 1
end_idx = 1588 - 1

new_code = """
from services.chat_service import ChatService

# ==============================================================================
# CHAT ENDPOINTS (Delegated to ChatService)
# ==============================================================================

@app.post("/api/chat")
@app.post("/api/chat/")
async def mental_health_chat(req: ChatMessageRequest):
    try:
        user_id = req.user_id if hasattr(req, 'user_id') and req.user_id else "usr_default"
        language = req.language if hasattr(req, 'language') and req.language else "en"
        api_key = req.api_key if hasattr(req, 'api_key') else None
        
        # Use provided thread_id or create a new one
        thread_id = req.thread_id
        if not thread_id:
            import uuid
            thread_id = "th_" + uuid.uuid4().hex[:8]

        result = ChatService.process_chat_request(
            user_msg=req.message,
            thread_id=thread_id,
            user_id=user_id,
            api_key=api_key,
            language=language
        )
        
        return JSONResponse({
            "text": result["text"],
            "thread_id": thread_id,
            "matched_condition": result["primary_concern"],
            "severity": result["severity"]
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/api/chat/stream")
@app.post("/api/chat/stream/")
async def mental_health_chat_stream(req: Optional[ChatMessageRequest] = None):
    try:
        if not req:
            raise HTTPException(status_code=400, detail="Request body missing")
            
        user_id = req.user_id if hasattr(req, 'user_id') and req.user_id else "usr_default"
        language = req.language if hasattr(req, 'language') and req.language else "en"
        api_key = req.api_key if hasattr(req, 'api_key') else None
        
        thread_id = req.thread_id
        if not thread_id:
            import uuid
            thread_id = "th_" + uuid.uuid4().hex[:8]

        return StreamingResponse(
            ChatService.process_chat_request_stream(
                user_msg=req.message,
                thread_id=thread_id,
                user_id=user_id,
                api_key=api_key,
                language=language
            ), 
            media_type="text/event-stream"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

"""

with open('main.py', 'w', encoding='utf-8') as f:
    f.writelines(lines[:start_idx])
    f.write(new_code)
    f.writelines(lines[end_idx:])

print('main.py refactored successfully.')
