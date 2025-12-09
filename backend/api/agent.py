from __future__ import annotations

from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from langgraph.checkpoint.memory import InMemorySaver

from backend.agents.graphs.service_graph import build_service_graph
from backend.agents.state import initial_service_state
from backend.api.auth import get_current_user

router = APIRouter(prefix="/agent", tags=["agent"])

# Build a graph instance with a shared in-memory checkpointer
_memory = InMemorySaver()
_service_graph = build_service_graph()


class ChatRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None


class ResumeRequest(BaseModel):
    thread_id: str
    value: Dict[str, Any]  # user response to interrupt (e.g., {"value": "..."} or approval)


def _invoke_graph(user_id: int, message: str, thread_id: Optional[str] = None):
    state = initial_service_state()
    state["user_id"] = user_id
    state["user_goal"] = message
    config = {"configurable": {"thread_id": thread_id or f"thread_{user_id}"}}
    result = _service_graph.invoke(state, config=config)
    return result, config["configurable"]["thread_id"]


def _resume_graph(user_id: int, thread_id: str, value: Dict[str, Any]):
    config = {"configurable": {"thread_id": thread_id}}
    result = _service_graph.invoke(value, config=config)
    return result


@router.post("/chat")
def chat(payload: ChatRequest, user=Depends(get_current_user)):
    result, thread_id = _invoke_graph(user.id, payload.message, payload.thread_id)
    interrupt_payload = None
    if isinstance(result, dict) and "ask" in result:
        interrupt_payload = result["ask"]
    steps = result.get("steps_log", []) if isinstance(result, dict) else []
    return {
        "thread_id": thread_id,
        "state": result,
        "messages": result.get("messages", []),
        "interrupt": interrupt_payload,
        "steps": steps,
    }


@router.post("/resume")
def resume(payload: ResumeRequest, user=Depends(get_current_user)):
    result = _resume_graph(user.id, payload.thread_id, payload.value)
    interrupt_payload = None
    if isinstance(result, dict) and "ask" in result:
        interrupt_payload = result["ask"]
    steps = result.get("steps_log", []) if isinstance(result, dict) else []
    return {
        "thread_id": payload.thread_id,
        "state": result,
        "messages": result.get("messages", []),
        "interrupt": interrupt_payload,
        "steps": steps,
    }

