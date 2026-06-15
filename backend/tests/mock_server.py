from fastapi import FastAPI, Request
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import time
import uuid

app = FastAPI(title="OpenAI-Compatible Mock LLM Server")

# --- Pydantic Schemas for Validation ---
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    temperature: Optional[float] = 1.0
    stream: Optional[bool] = False

class CompletionRequest(BaseModel):
    model: str
    prompt: Union[str, List[str]]
    max_tokens: Optional[int] = 16
    temperature: Optional[float] = 1.0

# --- Core Mock Generation Logic ---
def generate_gsm8k_mock_text() -> str:
    """
    GSM8K grading regex expects a chain of thought ending with #### <number>.
    This ensures lm_eval doesn't break and can parse valid mathematical scores.
    """
    return "Let's think step by step. The final answer is 42. #### 42"

# --- Endpoints ---

@app.get("/")
def root():
    return {"message": "Welcome to the OpenAI-Compatible Mock LLM Server!"}

@app.post("/v1/chat/completions")
def chat_completions(payload: ChatCompletionRequest):
    """Handles standard local-chat-completions requests."""
    return {
        "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": payload.model,
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": generate_gsm8k_mock_text()
                },
                "logprobs": None,
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": 15,
            "completion_tokens": 20,
            "total_tokens": 35
        }
    }

@app.post("/v1/completions")
def completions(payload: CompletionRequest):
    """Handles legacy local-completions requests."""
    return {
        "id": f"cmpl-{uuid.uuid4().hex[:12]}",
        "object": "text_completion",
        "created": int(time.time()),
        "model": payload.model,
        "choices": [
            {
                "text": generate_gsm8k_mock_text(),
                "index": 0,
                "logprobs": None,
                "finish_reason": "length"
            }
        ],
        "usage": {
            "prompt_tokens": 10,
            "completion_tokens": 20,
            "total_tokens": 30
        }
    }

# Health check to ensure server is running smoothly
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": time.time()}
