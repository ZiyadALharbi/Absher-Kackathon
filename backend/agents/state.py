from typing import Any, Dict, List, Literal, Optional, TypedDict

Mode = Literal["service", "info"]

class ServiceState(TypedDict, total=False):
    user_id: Optional[int]
    mode: Mode
    service_code: Optional[str]
    user_goal: Optional[str]
    collected_slots: Dict[str, Any]
    missing_slots: List[Dict[str, Any]]
    validation_results: List[Dict[str, Any]]
    last_tool_result: Optional[Dict[str, Any]]
    messages: List[Dict[str, Any]]
    human_required: bool
    pause_reason: Optional[str]
    info_answer: Optional[str]  # for FAQ/RAG answers
    steps_log: List[Dict[str, Any]]

def initial_service_state() -> ServiceState:
    return {
        "user_id": None,
        "mode": "service",
        "service_code": None,
        "user_goal": None,
        "collected_slots": {},
        "missing_slots": [],
        "validation_results": [],
        "last_tool_result": None,
        "messages": [],
        "human_required": False,
        "pause_reason": None,
        "info_answer": None,
        "steps_log": [],
    }