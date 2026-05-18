import type { ExecutionStatus } from "@/features/workflows/types/workflow-log";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@ldc/ui";

const EXECUTION_STATUS_CLASS: Record<ExecutionStatus, string> = {
    PROCESSING: "bg-yellow-100 text-yellow-700",
    SUCCESS: "bg-green-100 text-green-700",
    ERROR: "bg-red-100 text-red-700",
    TIMEOUT: "bg-gray-100 text-gray-600",
};

interface ExecutionStatusBadgeProps {
    status: ExecutionStatus;
}

const ExecutionStatusBadge = ({ status }: ExecutionStatusBadgeProps) => {
    const { t } = useLanguage();
    return (
        <span
            className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide",
                EXECUTION_STATUS_CLASS[status]
            )}
            title={t(`log.status.${status}`)}
        >
            {t(`log.status.${status}`)}
        </span>
    );
};

export default ExecutionStatusBadge;
