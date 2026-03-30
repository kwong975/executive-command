/**
 * Guarded action execution helper.
 * Sends guardrail metadata with the action payload and handles error parsing.
 */

import { api } from "./api";
import { showActionToast } from "@/components/ActionToast";
import type { GuardrailMetadata } from "@/components/ActionConfirmationModal";

export interface ActionError {
  code: string;
  message: string;
}

export async function executeGuardedAction(
  actionType: string,
  targetType: string,
  targetId: string,
  payload: Record<string, unknown>,
  guardrail: GuardrailMetadata,
): Promise<{ ok: boolean; action_id?: string; result?: Record<string, unknown>; error?: ActionError }> {
  try {
    const result = await api.executeAction(actionType, targetType, targetId, {
      ...payload,
      guardrail,
      reason: guardrail.reason || payload.reason,
      actor_type: "operator",
      actor_id: guardrail.client_surface || "command",
    });
    showActionToast("success", `${actionType.replace(/_/g, " ")} completed`);
    return result;
  } catch (err: unknown) {
    let errorInfo: ActionError = { code: "UNKNOWN", message: "Action failed" };
    if (err instanceof Error) {
      try {
        // Backend returns structured JSON in the error detail
        const match = err.message.match(/API \d+: (.*)/);
        if (match) {
          const parsed = JSON.parse(match[1]);
          if (parsed.detail) {
            const detail = typeof parsed.detail === "string" ? JSON.parse(parsed.detail) : parsed.detail;
            errorInfo = detail;
          }
        }
      } catch {
        errorInfo.message = err.message;
      }
    }
    showActionToast("error", errorInfo.message);
    return { ok: false, error: errorInfo };
  }
}

/**
 * Execute a non-guarded action (no confirmation required).
 */
export async function executeAction(
  actionType: string,
  targetType: string,
  targetId: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; action_id?: string; result?: Record<string, unknown> }> {
  try {
    const result = await api.executeAction(actionType, targetType, targetId, {
      ...payload,
      actor_type: "operator",
      actor_id: "command",
    });
    showActionToast("success", `${actionType.replace(/_/g, " ")} completed`);
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Action failed";
    showActionToast("error", message);
    return { ok: false };
  }
}
