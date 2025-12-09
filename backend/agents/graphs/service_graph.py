# from __future__ import annotations
# import json
# from typing import Dict, Any
# from langgraph.graph import StateGraph, START, END
# from langgraph.types import interrupt
# from langgraph.checkpoint.memory import InMemorySaver
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import StrOutputParser

# from backend.agents.state import ServiceState
# from backend.agents.llm import get_llm  # shared LLM factory


# _llm = get_llm()
# _parser = StrOutputParser()


# _intent_prompt = ChatPromptTemplate.from_template(
#     """أنت مصنف نوايا لخدمات حكومية.
# حدد: mode = "service" أو "info".
# إن كانت خدمة، اختر كود الخدمة المناسب من القائمة.
# أعد الرد JSON فقط: {{"mode": "...", "service_code": "... أو null"}}

# الأكواد المتاحة:
# - renew_driving_license
# - traffic_violation_payment_extension
# - traffic_violation_objection
# - traffic_accident_report
# - traffic_accident_objection_or_waiver
# - national_id_issue_family_member
# - national_id_renewal
# - national_id_replacement_lost
# - national_id_replacement_damaged

# أمثلة:
# "أبغى أجدد الرخصة" -> service, renew_driving_license
# "كيف أجدد؟" -> info
# "أبغى أمدد مهلة المخالفة" -> service, traffic_violation_payment_extension

# نص المستخدم: {user_goal}

# الرد بصيغة JSON فقط.
# """
# )
# _intent_chain = _intent_prompt | _llm | _parser


# def intent_node(state: ServiceState) -> Dict[str, Any]:
#     # If preselected (handoff), honor it
#     if state.get("service_code"):
#         return {
#             "mode": "service",
#             "service_code": state["service_code"],
#             "user_goal": state.get("user_goal") or "متابعة خدمة",
#         }

#     user_goal = state.get("user_goal") or ""
#     raw = _intent_chain.invoke({"user_goal": user_goal})
#     try:
#         data = json.loads(raw)
#         mode = data.get("mode", "info")
#         service_code = data.get("service_code")
#     except Exception:
#         mode, service_code = "info", None

#     if mode != "service":
#         return {"mode": "info", "info_answer": None, "user_goal": user_goal or "استفسار"}

#     return {
#         "mode": "service",
#         "service_code": service_code,
#         "user_goal": user_goal or "متابعة خدمة",
#     }


# def info_answer_node(state: ServiceState) -> Dict[str, Any]:
#     # TODO: replace with RAG/FAQ answer. For now, stub a generic reply.
#     answer = state.get("info_answer") or "هذه إجابة تجريبية للاستفسار."
#     return {"info_answer": answer}


# def load_requirements_node(state: ServiceState) -> Dict[str, Any]:
#     # TODO: load real requirements from service_requirements.json
#     missing = state.get("missing_slots") or [
#         {
#             "field": "renewal_duration",
#             "prompt": "اختر مدة التجديد (2/5/10 سنوات)",
#             "source": "user",
#             "field_type": "enum",
#             "options": [2, 5, 10],
#             "required": True,
#         }
#     ]
#     return {"missing_slots": missing}


# def slot_fill_node(state: ServiceState):
#     missing = state.get("missing_slots", [])
#     collected = state.get("collected_slots", {})
#     for slot in missing:
#         field = slot.get("field")
#         if field not in collected and slot.get("source") == "user":
#             answer = interrupt(
#                 {
#                     "ask": slot.get("prompt"),
#                     "field": field,
#                     "options": slot.get("options"),
#                     "field_type": slot.get("field_type"),
#                 }
#             )
#             new_collected = dict(collected)
#             new_collected[field] = answer.get("value")
#             new_missing = [s for s in missing if s.get("field") != field]
#             return {"collected_slots": new_collected, "missing_slots": new_missing}
#     return {}


# def validate_node(state: ServiceState) -> Dict[str, Any]:
#     return {
#         "validation_results": [{"check": "stub", "passed": True, "message": "ok"}],
#         "human_required": False,
#         "pause_reason": None,
#     }

# def human_review_node(state: ServiceState):
#     review = interrupt(
#         {
#             "action": "review",
#             "reason": state.get("pause_reason") or "تأكيد يدوي مطلوب",
#             "state_snapshot": state,
#         }
#     )
#     return {"human_required": False, "pause_reason": None, "last_tool_result": review}

# def act_node(state: ServiceState) -> Dict[str, Any]:
#     return {"last_tool_result": {"status": "stubbed_success"}}

# def summarize_node(state: ServiceState) -> Dict[str, Any]:
#     if state.get("mode") == "info":
#         content = state.get("info_answer") or "تم الرد على الاستفسار."
#     else:
#         content = f"تم تنفيذ الخدمة {state.get('service_code')} (تجريبي)."
#     return {
#         "messages": state.get("messages", []) + [{"role": "assistant", "content": content}]
#     }

from __future__ import annotations
import json
from typing import Dict, Any, List
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, interrupt
from langgraph.checkpoint.memory import InMemorySaver
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.checkpoint.memory import InMemorySaver
from backend.agents.state import ServiceState
from backend.agents.llm import get_llm
from backend.agents.tools.common import (
    load_service_requirements_from_store,
    fetch_faq_for_service,
    auto_fill_system_fields,
    validate_with_tools,
    execute_service_action,
)

# -------------------------------------------------------------------
# LLM setup (shared for intent + info)
# -------------------------------------------------------------------
_llm = get_llm()
_parser = StrOutputParser()

_intent_prompt = ChatPromptTemplate.from_template(
    """أنت مصنف نوايا لخدمات حكومية.
حدد: mode = "service" أو "info".
إن كانت خدمة، اختر كود الخدمة المناسب من القائمة.
أعد الرد JSON فقط: {{"mode": "...", "service_code": "... أو null"}}

الأكواد المتاحة:
- renew_driving_license
- traffic_violation_payment_extension
- traffic_violation_objection
- traffic_accident_report
- traffic_accident_objection_or_waiver
- national_id_issue_family_member
- national_id_renewal
- national_id_replacement_lost
- national_id_replacement_damaged

أمثلة:
"أبغى أجدد الرخصة" -> service, renew_driving_license
"كيف أجدد؟" -> info
"أبغى أمدد مهلة المخالفة" -> service, traffic_violation_payment_extension

نص المستخدم: {user_goal}

الرد بصيغة JSON فقط.
"""
)
_intent_chain = _intent_prompt | _llm | _parser

_info_prompt = ChatPromptTemplate.from_template(
    """أنت مساعد حكومي يجيب بإيجاز ووضوح على استفسارات المستخدم.
سياق مختصر: {context}
سؤال المستخدم: {user_goal}
الرد العربي المختصر:"""
)
_info_chain = _info_prompt | _llm | _parser

# -------------------------------------------------------------------
# Nodes
# -------------------------------------------------------------------
def intent_node(state: ServiceState) -> Dict[str, Any]:
    if state.get("service_code"):
        return {
            "mode": "service",
            "service_code": state["service_code"],
            "user_goal": state.get("user_goal") or "متابعة خدمة",
        }
    user_goal = state.get("user_goal") or ""
    raw = _intent_chain.invoke({"user_goal": user_goal})
    try:
        data = json.loads(raw)
        mode = data.get("mode", "info")
        service_code = data.get("service_code")
    except Exception:
        mode, service_code = "info", None

    if mode != "service":
        return {"mode": "info", "info_answer": None, "user_goal": user_goal or "استفسار"}

    return {
        "mode": "service",
        "service_code": service_code,
        "user_goal": user_goal or "متابعة خدمة",
    }


def info_answer_node(state: ServiceState) -> Dict[str, Any]:
    user_goal = state.get("user_goal") or ""
    # Fetch notes/steps if a service_code was inferred; else generic
    faq_context = fetch_faq_for_service(state.get("service_code"))
    try:
        answer = _info_chain.invoke({"context": faq_context, "user_goal": user_goal})
    except Exception:
        answer = "هذه إجابة تجريبية للاستفسار."
    return {"info_answer": answer}


def load_requirements_node(state: ServiceState) -> Dict[str, Any]:
    service_code = state.get("service_code")
    if not service_code:
        return {"missing_slots": []}

    req = load_service_requirements_from_store(service_code)
    collected = dict(state.get("collected_slots", {}))

    user_id = state.get("user_id")
    collected = auto_fill_system_fields(collected, req, user_id)

    # Build missing_slots = required user inputs not yet collected
    missing_slots: List[Dict[str, Any]] = []
    for r in req.get("requirements", []):
        if r.get("source") == "user" and r.get("required", False):
            field = r.get("key") or r.get("field")
            if field and field not in collected:
                missing_slots.append(
                    {
                        "field": field,
                        "prompt": r.get("prompt") or r.get("field"),
                        "field_type": r.get("field_type") or "text",
                        "options": r.get("options"),
                        "required": True,
                    }
                )

    return {"missing_slots": missing_slots, "collected_slots": collected, "requirements_cache": req}


def slot_fill_node(state: ServiceState):
    missing = state.get("missing_slots", [])
    collected = state.get("collected_slots", {})

    for slot in missing:
        field = slot.get("field")
        if field not in collected and slot.get("source") == "user":
            answer = interrupt(
                {
                    "ask": slot.get("prompt"),
                    "field": field,
                    "options": slot.get("options"),
                    "field_type": slot.get("field_type"),
                }
            )
            new_collected = dict(collected)
            new_collected[field] = answer.get("value")
            new_missing = [s for s in missing if s.get("field") != field]
            return {"collected_slots": new_collected, "missing_slots": new_missing}

    return {}

def validate_node(state: ServiceState) -> Dict[str, Any]:
    req = state.get("requirements_cache") or {}
    collected = state.get("collected_slots", {})
    user_id = state.get("user_id")
    results, human_required, pause_reason = validate_with_tools(user_id, req, collected)
    return {
        "validation_results": results,
        "human_required": human_required,
        "pause_reason": pause_reason,
    }


def human_review_node(state: ServiceState):
    review = interrupt(
        {
            "action": "review",
            "reason": state.get("pause_reason") or "تأكيد يدوي مطلوب",
            "state_snapshot": state,
        }
    )
    return {"human_required": False, "pause_reason": None, "last_tool_result": review}


def act_node(state: ServiceState) -> Dict[str, Any]:
    req = state.get("requirements_cache") or {}
    collected = state.get("collected_slots", {})
    user_id = state.get("user_id")
    result = execute_service_action(user_id, state.get("service_code"), req, collected)
    return {"last_tool_result": result}


def summarize_node(state: ServiceState) -> Dict[str, Any]:
    if state.get("mode") == "info":
        content = state.get("info_answer") or "تم الرد على الاستفسار."
    else:
        content = f"تم تنفيذ الخدمة {state.get('service_code')} (تجريبي)."
    return {
        "messages": state.get("messages", []) + [{"role": "assistant", "content": content}]
    }

def build_service_graph():
    graph = StateGraph(ServiceState)
    graph.add_node("intent", intent_node)
    graph.add_node("info_answer", info_answer_node)
    graph.add_node("load_requirements", load_requirements_node)
    graph.add_node("slot_fill", slot_fill_node)
    graph.add_node("validate", validate_node)
    graph.add_node("human_review", human_review_node)
    graph.add_node("act", act_node)
    graph.add_node("summarize", summarize_node)

    graph.add_edge(START, "intent")
    graph.add_conditional_edges(
        "intent",
        lambda s: "info_answer" if s.get("mode") == "info" else "load_requirements",
        {"info_answer": "info_answer", "load_requirements": "load_requirements"},
    )
    graph.add_edge("info_answer", "summarize")
    graph.add_edge("load_requirements", "slot_fill")
    graph.add_edge("slot_fill", "validate")
    graph.add_conditional_edges(
        "validate",
        lambda s: "human_review" if s.get("human_required") else "act",
        {"human_review": "human_review", "act": "act"},
    )
    graph.add_edge("human_review", "act")
    graph.add_edge("act", "summarize")
    graph.add_edge("summarize", END)

    return graph.compile(
        checkpointer=InMemorySaver(),
        name= "Interactive chat/service Agent"
    )