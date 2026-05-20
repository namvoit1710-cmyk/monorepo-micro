import { Ship } from "lucide-react";

const SUGGESTIONS = [
  "Phân tích manifest hàng nhập cảng hôm nay",
  "Kiểm tra trạng thái container lạnh theo tiêu chuẩn SMDG",
  "Tổng hợp báo cáo xuất nhập khẩu tuần này",
];

interface WelcomeScreenProps {
  onSuggestion?: (text: string) => void;
}

export function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Ship className="size-7" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">SMDG AI Assistant</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Trợ lý thông minh cho quy trình logistics và cảng biển
          </p>
        </div>
      </div>

      <div className="grid w-full max-w-lg gap-2">
        {SUGGESTIONS.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onSuggestion?.(text)}
            className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-card-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
