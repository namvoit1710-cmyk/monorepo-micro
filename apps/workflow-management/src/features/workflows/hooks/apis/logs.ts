/**
 * @description Sync workflow logs to the server. 
 * Will be update in the next version. 
 * Currently, we are not using this API.
 */

import api from "@/lib/api";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { IApiErrorBody } from "../../types/api";
import { IWorkflowLogs } from "../../types/workflow-log";

interface ISyncLogsPayload {
  workflowId: string;
  logs: IWorkflowLogs[];
}

interface ISyncLogsResponse {
  ok: boolean;
  syncedIds: string[];
}

export const useSyncWorkflowLogs = (
  options?: Omit<
    UseMutationOptions<ISyncLogsResponse, AxiosError<IApiErrorBody>, ISyncLogsPayload>,
    "mutationFn"
  >
) => {
  return useMutation({
    mutationFn: ({ workflowId, logs }: ISyncLogsPayload): Promise<ISyncLogsResponse> =>
      api.post(`/workflows/${workflowId}/logs/sync`, { logs }),
    ...options,
  });
};
