from __future__ import annotations

from typing import Any, Dict, Optional
from langchain_core.tools import tool

from backend.agents.tools.common import (
    load_service_requirements_from_store,
    fetch_faq_for_service,
    auto_fill_system_fields,
    validate_with_tools,
    execute_service_action,
)


@tool("get_service_requirements", return_direct=True)
def get_service_requirements(service_code: str) -> Dict[str, Any]:
    """Fetch the full requirements entry for a given service_code."""
    return load_service_requirements_from_store(service_code)


@tool("get_service_faq", return_direct=True)
def get_service_faq(service_code: str) -> str:
    """Fetch notes/steps text for a given service_code to answer info queries."""
    return fetch_faq_for_service(service_code)


@tool("auto_fill_fields", return_direct=True)
def auto_fill_fields(user_id: int, service_code: str, collected_slots: Dict[str, Any]) -> Dict[str, Any]:
    """Attempt to auto-fill system-derived fields using user/system data."""
    req = load_service_requirements_from_store(service_code)
    filled = auto_fill_system_fields(collected_slots, req, user_id)
    return filled


@tool("validate_service", return_direct=True)
def validate_service(user_id: int, service_code: str, collected_slots: Dict[str, Any]) -> Dict[str, Any]:
    """Run validations (wallet, windows, duplicates) for the given service and current slots."""
    req = load_service_requirements_from_store(service_code)
    results, human_required, pause_reason = validate_with_tools(user_id, req, collected_slots)
    return {
        "validation_results": results,
        "human_required": human_required,
        "pause_reason": pause_reason,
    }


@tool("execute_service", return_direct=True)
def execute_service(user_id: int, service_code: str, collected_slots: Dict[str, Any]) -> Dict[str, Any]:
    """Execute the service action (includes payment debit if required)."""
    req = load_service_requirements_from_store(service_code)
    return execute_service_action(user_id, service_code, req, collected_slots)

