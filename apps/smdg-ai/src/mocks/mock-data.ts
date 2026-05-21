import type { ISchema } from "@ldc/autoform";
import type { ChatMessage, ChatThread } from "@ldc/chat-sdk";
import type { WorkspaceMode } from "../stores/workspace-store";

const now = Date.now();
const h = 3_600_000;
const d = 86_400_000;

export const MOCK_THREADS: ChatThread[] = [
  {
    id: "conv_001",
    title: "Phân tích quy trình xuất khẩu tàu SMDG",
    status: "active",
    createdAt: new Date(now - 2 * h),
    updatedAt: new Date(now - 2 * h),
  },
  {
    id: "conv_002",
    title: "Review pipeline dữ liệu cảng Cát Lái",
    status: "active",
    createdAt: new Date(now - 1 * d),
    updatedAt: new Date(now - 1 * d),
  },
  {
    id: "conv_003",
    title: "Debug agent workflow bước 3 bị timeout",
    status: "active",
    createdAt: new Date(now - 2 * d),
    updatedAt: new Date(now - 2 * d),
  },
  {
    id: "conv_004",
    title: "Tổng hợp báo cáo tuần manifest hàng nhập",
    status: "active",
    createdAt: new Date(now - 5 * d),
    updatedAt: new Date(now - 5 * d),
  },
  {
    id: "conv_005",
    title: "Hỏi về quy trình kiểm tra container lạnh",
    status: "active",
    createdAt: new Date(now - 7 * d),
    updatedAt: new Date(now - 7 * d),
  },
  {
    id: "conv_006",
    title: "Tối ưu chi phí lưu bãi container (Demurrage)",
    status: "active",
    createdAt: new Date(now - 8 * d),
    updatedAt: new Date(now - 8 * d),
  },
  {
    id: "conv_007",
    title: "Cập nhật tài liệu EDIFACT D95B sang D00B",
    status: "active",
    createdAt: new Date(now - 10 * d),
    updatedAt: new Date(now - 10 * d),
  },
  {
    id: "conv_008",
    title: "Khắc phục lỗi định dạng ngày trong tệp BAPLIE",
    status: "active",
    createdAt: new Date(now - 12 * d),
    updatedAt: new Date(now - 12 * d),
  },
  {
    id: "conv_009",
    title: "Báo cáo container nguy hiểm (DG) tồn đọng",
    status: "active",
    createdAt: new Date(now - 14 * d),
    updatedAt: new Date(now - 14 * d),
  },
  {
    id: "conv_010",
    title: "Tích hợp API hải quan một cửa quốc gia",
    status: "active",
    createdAt: new Date(now - 16 * d),
    updatedAt: new Date(now - 16 * d),
  },
  {
    id: "conv_011",
    title: "Cấu hình phân quyền người dùng theo Depot",
    status: "active",
    createdAt: new Date(now - 18 * d),
    updatedAt: new Date(now - 18 * d),
  },
  {
    id: "conv_012",
    title: "Giám sát hiệu năng hệ thống xếp dỡ Crane",
    status: "active",
    createdAt: new Date(now - 20 * d),
    updatedAt: new Date(now - 20 * d),
  },
  {
    id: "conv_013",
    title: "Tìm hiểu cấu trúc file COARRI gửi hãng tàu",
    status: "active",
    createdAt: new Date(now - 22 * d),
    updatedAt: new Date(now - 22 * d),
  },
  {
    id: "conv_014",
    title: "Lập lịch bảo trì định kỳ trạm biến áp bãi lạnh",
    status: "active",
    createdAt: new Date(now - 25 * d),
    updatedAt: new Date(now - 25 * d),
  },
  {
    id: "conv_015",
    title: "Đồng bộ hóa danh mục cảng biển UN/LOCODE",
    status: "active",
    createdAt: new Date(now - 30 * d),
    updatedAt: new Date(now - 30 * d),
  },
];

export const MOCK_FORM_SCHEMA: ISchema = {
  fields: [
    {
      key: "container_ids",
      outputType: "string",
      fieldConfig: {
        fieldWrapper: "FormItemWrapper",
        fieldControl: "TextareaControl",
        wrapperProps: { label: "Container IDs cần kiểm tra" },
        controlProps: { rows: 3 },
        rules: [{ method: "required", message: "Vui lòng nhập container IDs" }],
      },
    },
    {
      key: "inspection_date",
      outputType: "string",
      fieldConfig: {
        fieldWrapper: "FormItemWrapper",
        fieldControl: "InputControl",
        wrapperProps: { label: "Ngày kiểm tra" },
        controlProps: { type: "date" },
        rules: [{ method: "required", message: "Vui lòng chọn ngày kiểm tra" }],
      },
    },
    {
      key: "inspector_note",
      outputType: "string",
      fieldConfig: {
        fieldWrapper: "FormItemWrapper",
        fieldControl: "InputControl",
        wrapperProps: { label: "Ghi chú của kiểm tra viên" },
      },
    },
  ],
};

export const MOCK_FLOWCHART_STEPS = [
  { id: "step_1", label: "Phân tích yêu cầu người dùng", status: "complete" as const },
  { id: "step_2", label: "Truy vấn dữ liệu manifest từ hệ thống", status: "complete" as const },
  { id: "step_3", label: "Kiểm tra container theo tiêu chuẩn SMDG", status: "running" as const },
  { id: "step_4", label: "Tổng hợp kết quả và tạo báo cáo", status: "pending" as const },
];

export interface AgentStep {
  id: string;
  label: string;
  status: "pending" | "running" | "complete" | "error";
}


type MockStreamEntry =
  | { delay: number; type: "reasoning"; step: { label: string; content?: string } }
  | { delay: number; type: "text"; text: string }
  | { delay: number; type: "agent_step"; step: AgentStep }
  | { delay: number; type: "show_workspace"; mode: WorkspaceMode; schema: unknown }
  | { delay: number; type: "tool-call-start"; toolCallId: string; toolName: string }
  | { delay: number; type: "tool-call-delta"; toolCallId: string; argsDelta: string }
  | { delay: number; type: "tool-call-end"; toolCallId: string; result: unknown }
  | { delay: number; type: "complete" };

export const MOCK_STREAMING_SCRIPT: MockStreamEntry[] = [
  // ── Phase 1: in-chat thinking timeline ──
  // Format per chunk: "Step label\n\nMarkdown detail" — first line = label, rest = detail
  // Steps separated by leading "\n" between chunks
  { delay: 300, type: "reasoning" as const, step: { label: "Thinking", content: "Parsing user intent and extracting key entities." } },
  { delay: 900, type: "reasoning" as const, step: { label: "Analyzing requirement", content: "Identified task: **container inspection** at Cát Lái port.\n- Request type: `compliance_check`\n- Priority: high" } },
  { delay: 1500, type: "reasoning" as const, step: { label: "Querying manifest data", content: "```sql\nSELECT * FROM manifest\nWHERE port = 'CAT_LAI'\n  AND status = 'pending_inspection'\n```\nFound **47 containers** matching criteria." } },
  { delay: 2100, type: "reasoning" as const, step: { label: "Calling inspection tool", content: "Invoking `smdg.inspect_batch` with container IDs.\n- Batch size: 47\n- Rule set: SMDG v2.4" } },
  { delay: 2700, type: "reasoning" as const, step: { label: "Calling SMDG agent", content: "Agent `compliance-agent-v3` running SMDG rule evaluation.\n- 3 temperature violations\n- 2 hazmat declarations missing\n- 1 broken seal" } },
  { delay: 3300, type: "reasoning" as const, step: { label: "Summarizing results", content: "Aggregating findings into structured report. Severity: **critical**." } },
  { delay: 3900, type: "reasoning" as const, step: { label: "Result ready", content: "Analysis complete. Final report generated with **6 action items**." } },

  // ── Phase 2: workspace sidebar steps ──
  {
    delay: 400,
    type: "agent_step" as const,
    step: { id: "step_1", label: "Phân tích yêu cầu người dùng", status: "running" } as AgentStep,
  },
  {
    delay: 1000,
    type: "agent_step" as const,
    step: { id: "step_1", label: "Phân tích yêu cầu người dùng", status: "complete" } as AgentStep,
  },
  {
    delay: 1100,
    type: "agent_step" as const,
    step: { id: "step_2", label: "Truy vấn dữ liệu manifest từ hệ thống", status: "running" } as AgentStep,
  },
  {
    delay: 1800,
    type: "agent_step" as const,
    step: { id: "step_2", label: "Truy vấn dữ liệu manifest từ hệ thống", status: "complete" } as AgentStep,
  },
  {
    delay: 1900,
    type: "agent_step" as const,
    step: { id: "step_3", label: "Kiểm tra container theo tiêu chuẩn SMDG", status: "running" } as AgentStep,
  },

  // ── Phase 3: sidebar steps complete (after reasoning done) ──
  {
    delay: 4100,
    type: "agent_step" as const,
    step: { id: "step_3", label: "Kiểm tra container theo tiêu chuẩn SMDG", status: "complete" } as AgentStep,
  },
  {
    delay: 4200,
    type: "agent_step" as const,
    step: { id: "step_4", label: "Tổng hợp kết quả và tạo báo cáo", status: "complete" } as AgentStep,
  },

  // ── Phase 3b: tool-call streaming (smdg.inspect_batch) ──
  // These demonstrate the new tool-call-start/delta/end event flow
  {
    delay: 4250,
    type: "tool-call-start" as const,
    toolCallId: "tc_inspect_001",
    toolName: "smdg.inspect_batch",
  },
  {
    delay: 4300,
    type: "tool-call-delta" as const,
    toolCallId: "tc_inspect_001",
    argsDelta: '{"container_ids":',
  },
  {
    delay: 4350,
    type: "tool-call-delta" as const,
    toolCallId: "tc_inspect_001",
    argsDelta: '["TGBU4432109","MSCU7654321","CMAU1122334"]',
  },
  {
    delay: 4400,
    type: "tool-call-delta" as const,
    toolCallId: "tc_inspect_001",
    argsDelta: ',"rule_set":"SMDG_v2.4","priority":"high"}',
  },
  {
    delay: 4500,
    type: "tool-call-end" as const,
    toolCallId: "tc_inspect_001",
    result: {
      status: "requires_action",
      critical_count: 3,
      warning_count: 3,
      containers_checked: 47,
    },
  },

  // ── Phase 4: text-delta summary (after all reasoning steps done) ──
  { delay: 4600, type: "text" as const, text: "## Kết quả phân tích\n\n" },
  { delay: 4700, type: "text" as const, text: "Dựa trên dữ liệu manifest đã truy vấn, tôi xác định được:\n\n" },
  { delay: 4850, type: "text" as const, text: "- **3 container lạnh** cần kiểm tra nhiệt độ khẩn cấp\n" },
  { delay: 5000, type: "text" as const, text: "- **2 lô hàng nguy hiểm** cần khai báo bổ sung trước khi thông quan\n" },
  { delay: 5150, type: "text" as const, text: "- **1 container** có dấu hiệu hư hỏng seal niêm phong\n\n" },
  { delay: 5300, type: "text" as const, text: '```json\n{ "status": "requires_action", "critical_count": 3, "warning_count": 3 }\n```\n\n' },
  { delay: 5500, type: "text" as const, text: "Vui lòng điền form bên phải để xác nhận và lên lịch kiểm tra." },

  // ── Phase 5: open workspace form ──
  { delay: 5700, type: "show_workspace" as const, mode: "form" as const, schema: MOCK_FORM_SCHEMA },

  // ── Phase 6: stream complete ──
  { delay: 5900, type: "complete" as const },
];

export const MOCK_HISTORY_MESSAGES: Record<string, ChatMessage[]> = {
  conv_001: [
    {
      id: "msg_001_1",
      role: "user",
      content: "Chào trợ lý, tôi cần phân tích quy trình xuất khẩu tàu SMDG để chuẩn bị hồ sơ cho tuần tới. Bạn có thể tóm tắt các bước chính và các tài liệu cần thiết không?",
      createdAt: new Date(now - 2 * h - 30 * 60 * 1000),
    },
    {
      id: "msg_001_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Phân tích yêu cầu", content: "Đang xác định các thực thể và yêu cầu của người dùng đối với quy trình xuất khẩu tàu SMDG." },
            { label: "Truy xuất cơ sở dữ liệu quy trình", content: "Đang tìm kiếm thông tin quy trình xuất khẩu tàu biển và tiêu chuẩn manifest SMDG v2.4." },
            { label: "Tổng hợp tài liệu", content: "Đang phân loại các chứng từ cần thiết: BAPLIE, COPRAR, VGM..." }
          ]
        },
        {
          type: "text",
          text: "Chào bạn! Quy trình xuất khẩu tàu theo chuẩn SMDG (Ship Planning Message Design Group) là quy trình tiêu chuẩn hóa quốc tế để trao đổi dữ liệu về sơ đồ xếp hàng trên tàu (BAPLIE) và danh sách container (COPRAR).\n\n### 📋 Quy trình gồm 4 bước chính:\n1. **Chuẩn bị và Gửi Kế hoạch Xếp dỡ (COPRAR):** Hãng tàu gửi danh sách container dự kiến xếp lên tàu cho Cảng.\n2. **Khai báo Manifest và Thông quan:** Đệ trình danh sách hàng hóa cho Hải quan thông qua hệ thống một cửa quốc gia.\n3. **Cập nhật Kế hoạch Xếp tàu thực tế (BAPLIE):** Sau khi xếp hàng xong, gửi file BAPLIE cập nhật vị trí chính xác (stowage position) của từng container trên tàu.\n4. **Xác nhận Xuất phát (DEP):** Hoàn thành hồ sơ xuất cảng.\n\n### 📄 Các tài liệu cốt lõi:\n- **BAPLIE (EDIFACT):** File sơ đồ vị trí container.\n- **COPRAR (EDIFACT):** Yêu cầu xếp/dỡ container.\n- **VGM (Verified Gross Mass):** Xác nhận khối lượng container."
        }
      ],
      createdAt: new Date(now - 2 * h - 29 * 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_001_3",
      role: "user",
      content: "Có lưu ý gì đặc biệt cho phần khai báo Container lạnh (Reefer) không?",
      createdAt: new Date(now - 2 * h - 15 * 60 * 1000),
    },
    {
      id: "msg_001_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Truy xuất quy định container lạnh", content: "Đang kiểm tra các mã lỗi và hướng dẫn SMDG đối với container Reefer." },
            { label: "Kiểm tra cấu trúc file BAPLIE", content: "Xác định các thẻ (tags) cấu hình nhiệt độ, độ ẩm và thông gió trong file EDI." }
          ]
        },
        {
          type: "text",
          text: "Đối với container lạnh (Reefer), quy trình khai báo SMDG đòi hỏi tính chính xác cực cao để tránh rủi ro hư hỏng hàng hóa và tranh chấp pháp lý. \n\n### ⚠️ 3 Lưu ý quan trọng nhất khi khai báo Container Lạnh:\n\n1. **Đồng bộ hóa Mã Nhiệt độ (Temperature set-point):**\n   - Phải ghi rõ đơn vị nhiệt độ trong file EDI (độ C hay độ F). Ví dụ: `CEL` cho Celsius và `FAH` cho Fahrenheit.\n   - Tránh nhầm lẫn dấu âm/dương (ví dụ: `-18C` khác hoàn toàn với `+18C`).\n\n2. **Khai báo Chế độ Thông gió (Ventilation) và Độ ẩm (Humidity):**\n   - Lượng gió mở (m3/hour hoặc % open) phải được khai báo chính xác trong phân đoạn EDI tương ứng (thường là trong nhóm segment `TMP` hoặc `RFF`).\n\n3. **Mã hóa Loại Container Reefer:**\n   - Sử dụng đúng mã ISO 6346 (ví dụ: `22R1`, `45R1` cho Reefer thường, `22UT` cho container thông gió)."
        }
      ],
      createdAt: new Date(now - 2 * h - 14 * 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_001_5",
      role: "user",
      content: "Có thể ví dụ thực tế một đoạn tệp BAPLIE chứa thông tin Reefer container được khai báo đúng định dạng không? Và giải thích chi tiết ý nghĩa các segment đó.",
      createdAt: new Date(now - 2 * h - 10 * 60 * 1000),
    },
    {
      id: "msg_001_6",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Xác định cấu trúc phân đoạn BAPLIE cho Reefer", content: "Lập cấu trúc EDIFACT BAPLIE chứa EQD, TMP, RNG, LOC." },
            { label: "Giải nghĩa các trường", content: "Viết bảng chi tiết giải nghĩa cho từng phân đoạn." }
          ]
        },
        {
          type: "text",
          text: "Dưới đây là một đoạn ví dụ tệp tin **BAPLIE v1.5** chứa thông báo vị trí xếp dỡ và cấu hình nhiệt độ/thông gió của một container lạnh (Reefer):\n\n```txt\nEQD+CN+TGBU4432109+45R1:102++2+5'\nLOC+147+0030282::5'\nMEA+AAE+VGM+KGM:30480'\nTMP+2+-18.0:CEL'\nRNG+5+20.0:35.0'\n```\n\n### 📊 Chi tiết giải nghĩa các phân đoạn (Segments):\n\n| Phân đoạn (Segment) | Ý nghĩa chức năng | Breakdown dữ liệu | Ví dụ thực tế | Giải thích chi tiết |\n| :--- | :--- | :--- | :--- | :--- |\n| **`EQD`** | Thông tin Thiết bị | Mã thiết bị, số container, mã ISO, trạng thái | `EQD+CN+TGBU4432109+45R1...` | Container (`CN`), Số hiệu `TGBU4432109`, Loại `45R1` (Reefer 40ft High Cube). |\n| **`LOC`** | Vị trí xếp (Stowage) | Cổng xếp dỡ, tọa độ bay-row-tier trên tàu | `LOC+147+0030282::5` | Vị trí xếp là **Bay 03, Row 02, Tier 82** trên tàu xuất khẩu. |\n| **`MEA`** | Đo lường (VGM) | Trọng lượng toàn bộ container được xác nhận | `MEA+AAE+VGM+KGM:30480` | Trọng lượng container lạnh này là **30,480 Kilôgam (KGM)**. |\n| **`TMP`** | Cài đặt nhiệt độ | Nhiệt độ chỉ định và đơn vị tương ứng | `TMP+2+-18.0:CEL` | Nhiệt độ duy trì bắt buộc là **-18.0 độ C** (Celsius). |\n| **`RNG`** | Độ ẩm & Thông gió | Khoảng thông gió yêu cầu hoặc độ ẩm (%) | `RNG+5+20.0:35.0` | Yêu cầu mở thông gió cơ học ở mức **20% đến 35%** công suất. |\n\n> 💡 **Mẹo:** Trong tệp BAPLIE, nếu nhiệt độ là âm (âm 18 độ C), hãy đảm bảo có dấu gạch ngang `-` liền kề trước giá trị số. Bất kỳ ký tự trống hoặc định dạng sai lệch đơn vị (ví dụ viết `C` thay vì `CEL`) đều làm hệ thống phân tích biên dịch lỗi."
        }
      ],
      createdAt: new Date(now - 2 * h - 8 * 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_001_7",
      role: "user",
      content: "Cảm ơn bạn. Tiếp theo, làm thế nào để cấu hình gửi file BAPLIE tự động qua FTP/SFTP sau khi hoàn thành xếp dỡ? Hãy viết hướng dẫn cấu hình chi tiết.",
      createdAt: new Date(now - 2 * h - 5 * 60 * 1000),
    },
    {
      id: "msg_001_8",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Thiết kế quy trình gửi SFTP tự động", content: "Viết kịch bản tự động hóa bằng cách tạo tệp tin YAML cấu hình webhook/agent, kết hợp script Bash để thực thi." }
          ]
        },
        {
          type: "text",
          text: "Để tự động hóa việc xuất và gửi tệp tin BAPLIE lên cổng thông tin SFTP của hãng tàu ngay sau khi hoàn thành xếp dỡ, bạn hãy làm theo các bước hướng dẫn dưới đây:\n\n### 🛠️ Bước 1: Cấu hình tệp tin Agent kết nối SFTP (`shipper-agent.yaml`)\nTạo hoặc cập nhật cấu hình bảo mật kết nối SFTP của hãng tàu trong hệ thống quản trị của bạn:\n\n```yaml\nsftp_connections:\n  - carrier_code: \"ONE\"\n    host: \"sftp.one-line.com\"\n    port: 2222\n    auth_method: \"key\"\n    ssh_key_path: \"/etc/secrets/one_sftp_id_rsa\"\n    remote_directory: \"/edi/baplie/incoming\"\n    retry_policy:\n      max_attempts: 3\n      backoff_factor: 2.0\n```\n\n### 🐚 Bước 2: Thiết lập Kịch bản Bash gửi tệp tin tự động (`upload_baplie.sh`)\nDưới đây là script tự động kiểm tra sự tồn tại của tệp BAPLIE mới xuất và tải lên SFTP:\n\n```bash\n#!/usr/bin/env bash\nset -euo pipefail\n\nBAPLIE_FILE=\"/data/exports/BAPLIE_$(date +%Y%m%d)_ONE.edi\"\nREMOTE_DIR=\"/edi/baplie/incoming\"\nSFTP_USER=\"smdg_agent\"\nSFTP_HOST=\"sftp.one-line.com\"\nSFTP_PORT=\"2222\"\nKEY_PATH=\"/etc/secrets/one_sftp_id_rsa\"\n\nif [ ! -f \"$BAPLIE_FILE\" ]; then\n  echo \"❌ Lỗi: Không tìm thấy tệp BAPLIE để tải lên: $BAPLIE_FILE\"\n  exit 1\nfi\n\necho \"🚀 Bắt đầu truyền tải tệp BAPLIE lên SFTP...\"\nsftp -i \"$KEY_PATH\" -P \"$SFTP_PORT\" \"$SFTP_USER@$SFTP_HOST\" <<EOF\ncd \"$REMOTE_DIR\"\nput \"$BAPLIE_FILE\"\nquit\nEOF\n\necho \"✅ Tải lên thành công tệp: $(basename \"$BAPLIE_FILE\")\"\n```\n\n### 📝 Các bước tích hợp tiếp theo:\n- [x] Đăng ký SSH Public Key của cổng hệ thống cảng lên server SFTP của hãng tàu.\n- [x] Tạo một Webhook Event `SHIP_DEPARTED` trong hệ thống phần mềm cảng (TOS) để tự động gọi chạy script bash trên.\n- [x] Cấu hình hệ thống cảnh báo qua Slack/Email trong trường hợp kết nối SFTP thất bại quá 3 lần."
        }
      ],
      createdAt: new Date(now - 2 * h - 2 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_002: [
    {
      id: "msg_002_1",
      role: "user",
      content: "Xem giúp tôi pipeline dữ liệu cảng Cát Lái đang bị trễ ở bước nào.",
      createdAt: new Date(now - 1 * d - 30 * 60 * 1000),
    },
    {
      id: "msg_002_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Kết nối cơ sở dữ liệu giám sát", content: "Đang truy vấn bảng log pipeline `cat_lai_stream`..." },
            { label: "Phân tích độ trễ các bước", content: "Tính toán chênh lệch thời gian giữa các node: Ingestion -> Parse EDI -> DB Write. Nhận thấy bước Parse EDI mất trung bình 45 giây/file." },
            { label: "Kiểm tra hàng đợi Kafka", content: "Topic `catlai-edi-incoming` có lag tăng đột biến lên 15,000 messages." }
          ]
        },
        {
          type: "text",
          text: "Tôi đã kiểm tra pipeline xử lý dữ liệu cảng Cát Lái (hệ thống stream dữ liệu thời gian thực). Hiện tại, hệ thống đang gặp hiện tượng trễ nghiêm trọng tại bước **Parse EDI (Giải mã tệp EDIFACT)**.\n\n### 🔍 Phân tích chi tiết:\n- **Độ trễ trung bình:** Tăng từ `1.2s` lên `45.8s` mỗi tệp tin.\n- **Điểm nghẽn (Bottleneck):** Tiến trình xử lý file BAPLIE kích thước lớn (>10MB) đang chiếm dụng 100% CPU của worker node.\n- **Kafka Lag:** Topic `catlai-edi-incoming` đang bị ùn ứ **15,420 tin nhắn** chưa xử lý."
        }
      ],
      createdAt: new Date(now - 1 * d - 29 * 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_002_3",
      role: "user",
      content: "Làm thế nào để khắc phục tình trạng quá tải hàng đợi Kafka này?",
      createdAt: new Date(now - 1 * d - 10 * 60 * 1000),
    },
    {
      id: "msg_002_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Tìm kiếm giải pháp quy mô", content: "Đánh giá các giải pháp: Tăng partition Kafka, scale worker node, tối ưu parser engine." },
            { label: "Thiết kế giải pháp ngắn hạn và dài hạn", content: "Khắc phục nhanh bằng cách scale out pod, tối ưu lâu dài bằng cách tách luồng file lớn." }
          ]
        },
        {
          type: "text",
          text: "Để giải quyết nhanh tình trạng quá tải Kafka lag cho pipeline Cát Lái, tôi đề xuất triển khai các bước sau:\n\n### 🚀 Giải pháp ngắn hạn (Khắc phục ngay lập tức):\n1. **Tăng số lượng Partitions & Consumers:**\n   - Tăng số partitions của topic `catlai-edi-incoming` từ 4 lên 12.\n   - Tăng số lượng bản sao (replicas) của dịch vụ parser consumer để xử lý song song.\n2. **Tăng tài nguyên CPU/Memory:**\n   - Cấu hình lại Kubernetes deployment cho parser pods, nâng giới hạn CPU từ `1 Core` lên `4 Cores` để xử lý nhanh tệp BAPLIE lớn.\n\n### 🛠️ Giải pháp dài hạn:\n- **Phân luồng xử lý (File-size routing):** Tách luồng xử lý riêng cho file < 1MB (luồng nhanh) và file > 1MB (luồng chậm) để tránh các file khổng lồ làm nghẽn toàn bộ hàng đợi."
        }
      ],
      createdAt: new Date(now - 1 * d - 9 * 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_002_5",
      role: "user",
      content: "Bạn nói về giải pháp phân luồng xử lý (File-size routing). Hãy viết chi tiết cấu hình Docker Compose và YAML của consumer để thiết lập 2 luồng nhanh (fast-lane) và chậm (slow-lane) xử lý.",
      createdAt: new Date(now - 1 * d - 7 * 60 * 1000),
    },
    {
      id: "msg_002_6",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Thiết kế kiến trúc file-size routing", content: "Xây dựng sơ đồ phân luồng. File gateway sẽ định tuyến dựa trên Content-Length." },
            { label: "Thiết lập cấu hình docker-compose và consumer yaml", content: "Tạo cấu hình Docker Compose với dịch vụ Fast Parser và Slow Parser." }
          ]
        },
        {
          type: "text",
          text: "Để thiết lập giải pháp **File-size routing (Phân luồng kích thước)**, chúng ta sẽ cấu hình một Gateway đứng trước thực hiện kiểm tra dung lượng file. \n- File **< 1MB** -> Đưa vào topic `catlai-edi-fast`\n- File **>= 1MB** -> Đưa vào topic `catlai-edi-slow`\n\n### 🐳 1. Cấu hình Docker Compose (`docker-compose.yaml`)\n\n```yaml\nversion: \"3.8\"\nservices:\n  edi-router-gateway:\n    image: ldc-registry/edi-router:latest\n    environment:\n      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092\n      - MAX_FAST_FILE_SIZE_BYTES=1048576 # 1MB\n    ports:\n      - \"8080:8080\"\n\n  fast-edi-parser:\n    image: ldc-registry/edi-parser-node:latest\n    deploy:\n      replicas: 2 # Scale nhẹ cho luồng file nhỏ\n    environment:\n      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092\n      - INPUT_TOPIC=catlai-edi-fast\n      - CPU_LIMIT=0.5\n\n  slow-edi-parser:\n    image: ldc-registry/edi-parser-node:latest\n    deploy:\n      replicas: 4 # Tăng số lượng pod xử lý file lớn để tránh tắc nghẽn\n    environment:\n      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092\n      - INPUT_TOPIC=catlai-edi-slow\n      - CPU_LIMIT=2.0 # Cấp nhiều CPU hơn\n```\n\n### ⚙️ 2. So sánh thông số hai luồng xử lý:\n\n| Thông số | Fast-lane (Luồng nhanh) | Slow-lane (Luồng chậm) |\n| :--- | :--- | :--- |\n| **Topic Kafka** | `catlai-edi-fast` | `catlai-edi-slow` |\n| **Giới hạn File** | `< 1MB` | `>= 1MB` |\n| **Tài nguyên Pod** | `CPU: 0.5`, `RAM: 512MB` | `CPU: 2.0`, `RAM: 2GB` |\n| **Số Replicas** | `2 Pods` | `4 Pods` |\n| **Thời gian SLA** | `< 2 giây` | `< 60 giây` |\n\n> ⚠️ **Chú ý:** Cần đảm bảo cấu hình phân vùng (partitions) của `catlai-edi-slow` tối thiểu bằng số lượng replicas (ở đây là 4) để các consumers có thể tận dụng xử lý song song hiệu quả nhất."
        }
      ],
      createdAt: new Date(now - 1 * d - 5 * 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_002_7",
      role: "user",
      content: "Hãy viết thêm một script Python đơn giản để đo thời gian parse file BAPLIE và xuất báo cáo dưới dạng JSON.",
      createdAt: new Date(now - 1 * d - 3 * 60 * 1000),
    },
    {
      id: "msg_002_8",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Thiết kế script đo thời gian parse", content: "Viết script Python đo đạc hiệu năng parser với thư viện time, os, json." }
          ]
        },
        {
          type: "text",
          text: "Dưới đây là mã nguồn của script Python (`benchmark_parser.py`) để đo lường hiệu suất xử lý file BAPLIE. Script sẽ theo dõi thời gian đọc tệp tin, xử lý cú pháp và chuyển đổi sang JSON:\n\n```python\nimport time\nimport json\nimport sys\nimport os\n\ndef parse_baplie(file_path):\n    # Giả lập hàm giải mã tệp tin EDIFACT BAPLIE\n    with open(file_path, 'r') as f:\n        content = f.read()\n    \n    # Đếm số lượng segments làm ví dụ\n    segments = content.split(\"'\")\n    container_count = sum(1 for s in segments if s.startswith(\"EQD\"))\n    \n    return {\n        \"file_size_bytes\": os.path.getsize(file_path),\n        \"total_segments\": len(segments),\n        \"total_containers\": container_count\n    }\n\ndef benchmark(file_path):\n    if not os.path.exists(file_path):\n        print(json.dumps({\"error\": f\"File {file_path} not found\"}))\n        return\n\n    start_time = time.perf_counter()\n    data = parse_baplie(file_path)\n    end_time = time.perf_counter()\n    \n    execution_time_ms = (end_time - start_time) * 1000\n    \n    report = {\n        \"status\": \"success\",\n        \"file_name\": os.path.basename(file_path),\n        \"metrics\": {\n            \"file_size_kb\": round(data[\"file_size_bytes\"] / 1024, 2),\n            \"segments_processed\": data[\"total_segments\"],\n            \"containers_detected\": data[\"total_containers\"],\n            \"duration_ms\": round(execution_time_ms, 2)\n        },\n        \"performance_rating\": \"FAST\" if execution_time_ms < 1000 else \"SLOW\"\n    }\n    \n    print(json.dumps(report, indent=2, ensure_ascii=False))\n\nif __name__ == \"__main__\":\n    if len(sys.argv) < 2:\n        # Tạo file test giả lập nếu chạy không đối số\n        test_file = \"test_baplie.edi\"\n        with open(test_file, \"w\") as f:\n            f.write(\"UNB+UNOA:2'UNH+1+BAPLIE'BGM+15'EQD+CN+1'LOC+1'EQD+CN+2'LOC+2'\")\n        benchmark(test_file)\n    else:\n        benchmark(sys.argv[1])\n```\n\n### 📝 Ví dụ đầu ra JSON khi chạy script:\n\n```json\n{\n  \"status\": \"success\",\n  \"file_name\": \"BAPLIE_5000_containers.edi\",\n  \"metrics\": {\n    \"file_size_kb\": 1240.5,\n    \"segments_processed\": 25420,\n    \"containers_detected\": 5000,\n    \"duration_ms\": 412.55\n  },\n  \"performance_rating\": \"FAST\"\n}\n```\n\nBạn có thể chạy thử nghiệm bằng cách gõ lệnh sau vào Terminal:\n```bash\npython benchmark_parser.py /path/to/your/baplie_file.edi\n```"
        }
      ],
      createdAt: new Date(now - 1 * d - 1 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_003: [
    {
      id: "msg_003_1",
      role: "user",
      content: "Agent workflow ở bước 3 (Kiểm tra container lạnh) liên tục bị timeout. Nhờ xem giúp nguyên nhân.",
      createdAt: new Date(now - 2 * d - 30 * 60 * 1000),
    },
    {
      id: "msg_003_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Đọc log workflow", content: "Truy cập hệ thống log của AgentRunner. Mã lỗi: `TIMEOUT_EXCEEDED` tại bước `reefer_compliance_check`." },
            { label: "Kiểm tra API ngoài", content: "Kiểm tra phản hồi từ service `http://api.catlaiport.com/v2/reefer/status`. Nhận thấy thời gian phản hồi trung bình là 32 giây, vượt quá ngưỡng timeout mặc định là 30 giây." }
          ]
        },
        {
          type: "text",
          text: "Tôi đã tìm ra nguyên nhân gây ra lỗi timeout tại **Bước 3 (Kiểm tra container lạnh)**.\n\n### 🐞 Nguyên nhân chính:\n- **Lỗi Timeout Mạng:** API kiểm tra trạng thái hoạt động của container lạnh tại Cảng Cát Lái phản hồi quá chậm.\n- **Thời gian phản hồi:** API mất trung bình **32 - 35 giây** để trả về kết quả, trong khi cấu hình timeout mặc định của workflow hiện tại chỉ là **30 giây**.\n- **Mã lỗi ghi nhận:** `Gateway Timeout (504)` từ phía máy chủ cảng."
        }
      ],
      createdAt: new Date(now - 2 * d - 29 * 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_003_3",
      role: "user",
      content: "Có thể cấu hình tăng timeout lên 60 giây tạm thời được không?",
      createdAt: new Date(now - 2 * d - 10 * 60 * 1000),
    },
    {
      id: "msg_003_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Kiểm tra file cấu hình", content: "Xác định file cấu hình workflow nằm ở `packages/agent-runner/config.json` hoặc biến môi trường `COMPLIANCE_CHECK_TIMEOUT`." }
          ]
        },
        {
          type: "text",
          text: "Có, bạn hoàn toàn có thể tăng timeout lên 60 giây để khắc phục tạm thời. Hãy thực hiện chỉnh sửa cấu hình như sau:\n\n1. **Chỉnh sửa file cấu hình:**\n   Mở tệp `apps/smdg-ai/src/env.ts` hoặc tệp cấu hình của agent runner, cập nhật giá trị:\n   ```json\n   {\n     \"services\": {\n       \"reefer_inspection\": {\n         \"timeout_ms\": 60000\n       }\n     }\n   }\n   ```\n2. **Hoặc sử dụng Biến môi trường (Environment Variable):**\n   Cấu hình lại biến `REEFER_CHECK_TIMEOUT=60000` trong cấu hình container của bạn."
        }
      ],
      createdAt: new Date(now - 2 * d - 9 * 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_003_5",
      role: "user",
      content: "Tôi đã chỉnh sửa timeout lên 60 giây và lưu lại, nhưng hệ thống vẫn báo lỗi ở bước 3. Bạn có thể kiểm tra lại log xem có phát sinh lỗi gì mới không?",
      createdAt: new Date(now - 2 * d - 5 * 60 * 1000),
    },
    {
      id: "msg_003_6",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Đọc lại log", content: "Đang kiểm tra log của workflow execution ID `run_wf_99212` mới nhất..." },
            { label: "Phát hiện lỗi mới", content: "Nhận thấy lỗi đã đổi từ `TIMEOUT_EXCEEDED` sang `CONNECTION_REFUSED`." },
            { label: "Kiểm tra DNS/Network", content: "Ping máy chủ `api.catlaiport.com` và cổng kiểm tra dịch vụ. Nhận thấy cổng `443` đang bị chặn bởi tường lửa của hệ thống VPN mới nâng cấp sáng nay." }
          ]
        },
        {
          type: "text",
          text: "Tôi đã kiểm tra nhật ký chạy mới nhất của workflow. Lỗi timeout 30 giây đã được giải quyết thành công nhờ tăng cấu hình lên 60 giây. Tuy nhiên, hệ thống hiện đang gặp một **lỗi kết nối mới**:\n\n### 🔴 Lỗi mới phát hiện:\n- **Mã lỗi:** `CONNECTION_REFUSED` (Kết nối bị từ chối).\n- **Chi tiết log:** `Failed to connect to api.catlaiport.com port 443: Connection refused`.\n- **Nguyên nhân:** Tường lửa của hệ thống VPN mới được cảng nâng cấp vào lúc 06:00 sáng nay đã chặn các IP từ dải server của chúng ta. Bạn cần liên hệ với đội IT để yêu cầu whitelist địa chỉ IP nguồn."
        }
      ],
      createdAt: new Date(now - 2 * d - 4 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_004: [
    {
      id: "msg_004_1",
      role: "user",
      content: "Hãy tổng hợp báo cáo tuần cho manifest hàng nhập khẩu.",
      createdAt: new Date(now - 5 * d - 30 * 60 * 1000),
    },
    {
      id: "msg_004_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Truy vấn dữ liệu manifest", content: "Đang tổng hợp số liệu từ ngày 13/05/2026 đến 20/05/2026..." },
            { label: "Tính toán thống kê", content: "Tổng số container nhập: 1,240. Số lượng đã thông quan: 1,180. Số container đang bị giữ kiểm tra: 60." }
          ]
        },
        {
          type: "text",
          text: "Dưới đây là tổng hợp báo cáo tuần cho manifest hàng nhập khẩu từ ngày **13/05/2026** đến **20/05/2026**:\n\n### 📊 Thống kê chung:\n- **Tổng số container nhập cảng:** 1,240 TEU\n- **Đã hoàn thành thông quan:** 1,180 TEU (95%)\n- **Đang chờ kiểm hóa / Giữ kiểm tra:** 60 TEU (5%)\n\n### ⚠️ Các điểm cần chú ý:\n- **Cảnh báo lỗi manifest:** Có **12 container** bị sai lệch thông tin trọng lượng VGM so với manifest gốc, chủ yếu từ các tuyến nhập khẩu từ Châu Á.\n- **Container lạnh:** 140 container Reefer đã được cung cấp nguồn điện cảng an toàn, không có sự cố nhiệt độ nào được ghi nhận."
        }
      ],
      createdAt: new Date(now - 5 * d - 29 * 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_004_3",
      role: "user",
      content: "Có cách nào để tự động đối chiếu dữ liệu VGM bị sai lệch này mà không cần kiểm tra thủ công từng container không?",
      createdAt: new Date(now - 5 * d - 10 * 60 * 1000),
    },
    {
      id: "msg_004_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Thiết kế thuật toán đối chiếu tự động", content: "Phát triển hàm so sánh chênh lệch chéo giữa các nguồn: Manifest gốc, Phiếu cân điện tử tại cổng cảng (E-Port VGM), và Tờ khai hải quan." },
            { label: "Đề xuất giải pháp API", content: "Tích hợp API đối soát tự động của hệ thống SMDG." }
          ]
        },
        {
          type: "text",
          text: "Hoàn toàn có thể tự động hóa quy trình này. Chúng ta có thể cấu hình một **Agent Job** chạy ngầm để tự động đối chiếu chéo (Cross-check) dữ liệu. \n\n### 🤖 Giải pháp tự động đối chiếu:\n1. **Quy trình hoạt động:**\n   - Agent sẽ định kỳ (ví dụ: mỗi 2 tiếng) lấy tệp tin Manifest EDI mới nhất.\n   - Gọi API lấy dữ liệu cân thực tế tại Cảng (VGM từ cổng cân tự động).\n   - Thực hiện so sánh: nếu sai số chênh lệch trọng lượng vượt quá **±5%** hoặc **±500kg**, Agent sẽ tự động gắn thẻ cảnh báo đỏ `VGM_MISMATCH` và gửi thông báo trực tiếp qua Telegram/Slack cho bộ phận chứng từ.\n2. **Cách cấu hình:**\n   Tôi có thể tạo hộ bạn một script đối soát tự động bằng Python hoặc Node.js để chạy tích hợp vào pipeline dữ liệu hiện tại."
        }
      ],
      createdAt: new Date(now - 5 * d - 9 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_005: [
    {
      id: "msg_005_1",
      role: "user",
      content: "Quy trình kiểm tra container lạnh (reefer) cần tuân thủ những tiêu chí nào?",
      createdAt: new Date(now - 7 * d - 30 * 60 * 1000),
    },
    {
      id: "msg_005_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Đọc hướng dẫn vận hành cảng", content: "Truy vấn quy định kiểm tra container lạnh trước khi xếp dỡ hoặc giao nhận." }
          ]
        },
        {
          type: "text",
          text: "Quy trình kiểm tra container lạnh (Reefer Container) tại cảng cần tuân thủ nghiêm ngặt các tiêu chí sau:\n\n### 🔍 4 Tiêu chí kiểm tra bắt buộc:\n1. **Tình trạng nguồn điện (Power Supply):** Kiểm tra cáp nguồn, phích cắm 3 pha (đảm bảo không rò rỉ điện) và đồng hồ đo dòng điện.\n2. **Nhiệt độ cài đặt (Set point):** Đối chiếu nhiệt độ hiển thị thực tế trên màn hình micro-processor với nhiệt độ yêu cầu trên phiếu giao nhận.\n3. **Hoạt động của máy lạnh (PTI - Pre-Trip Inspection):** Đảm bảo máy chạy êm, không có tiếng động lạ, gas lạnh không bị rò rỉ.\n4. **Độ thông gió (Ventilation):** Vị trí lá gió phải mở đúng tỷ lệ % yêu cầu (ví dụ: mở 25%, đóng hoàn toàn đối với hàng đông lạnh)."
        }
      ],
      createdAt: new Date(now - 7 * d - 29 * 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_005_3",
      role: "user",
      content: "Nếu phát hiện container lạnh bị mất nguồn điện hoặc nhiệt độ tăng quá cao, chúng ta cần thực hiện những bước khẩn cấp nào?",
      createdAt: new Date(now - 7 * d - 10 * 60 * 1000),
    },
    {
      id: "msg_005_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Tra cứu quy trình ứng phó khẩn cấp", content: "Đọc hướng dẫn ứng phó khẩn cấp đối với hàng hóa lạnh tại cảng." },
            { label: "Phân loại các bước", content: "Cô lập lỗi, cấp điện dự phòng, ghi nhận log và thông báo khách hàng." }
          ]
        },
        {
          type: "text",
          text: "Khi phát hiện sự cố mất nguồn điện hoặc nhiệt độ tăng cao ở container lạnh (Reefer), bạn cần thực hiện ngay quy trình ứng phó khẩn cấp (Emergency SOP) sau đây để bảo vệ hàng hóa bên trong:\n\n### 🚨 Quy trình ứng phó khẩn cấp 4 bước:\n\n1. **Xác định và Cô lập Sự cố (Ngay lập tức):**\n   - Kiểm tra xem lỗi do phích cắm, dây cáp hay do hệ thống máy lạnh của container (mã lỗi hiển thị trên màn hình micro-processor).\n   - Nếu do ổ cắm cảng bị hỏng, lập tức chuyển container sang ổ cắm dự phòng ở khu vực lân cận.\n2. **Sử dụng Nguồn điện Di động (Generator Set):**\n   - Trong trường hợp mất điện diện rộng tại bãi cảng, điều động xe nâng cẩu container đến khu vực máy phát điện dự phòng (Gen-set) hoạt động độc lập.\n3. **Liên hệ Kỹ thuật viên Lạnh (Reefer Technician):**\n   - Yêu cầu kỹ thuật viên trực bãi đến kiểm tra hệ thống gas, block máy lạnh (compressor) nếu nguồn điện ổn định nhưng máy không làm lạnh.\n4. **Ghi nhận & Báo cáo:**\n   - Ghi lại lịch sử nhiệt độ tại thời điểm phát hiện sự cố, chụp ảnh màn hình điều khiển và gửi thông báo khẩn cấp cho Hãng tàu/Khách hàng để phối hợp xử lý."
        }
      ],
      createdAt: new Date(now - 7 * d - 9 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_006: [
    {
      id: "msg_006_1",
      role: "user",
      content: "Trợ lý giải thích giúp tôi cách tối ưu hóa chi phí Demurrage (lưu bãi) tại cảng Cát Lái.",
      createdAt: new Date(now - 8 * d),
    },
    {
      id: "msg_006_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Kiểm tra quy định biểu phí cảng Cát Lái", content: "Đang truy vấn các quy định biểu phí lưu bãi, lưu kho đối với container thông thường và container lạnh." },
            { label: "Tính toán free time chuẩn", content: "Thông thường thời gian miễn phí lưu bãi (free time demurrage) là 5-7 ngày đối với hàng khô và 3 ngày đối với hàng lạnh." }
          ]
        },
        {
          type: "text",
          text: "Chi phí Demurrage phát sinh khi container lưu bãi vượt quá thời gian miễn phí (Free time) được hãng tàu/cảng quy định. Để tối ưu hóa chi phí này tại Cát Lái, bạn nên áp dụng 3 chiến lược sau:\n\n### 💡 Chiến lược tối ưu Demurrage:\n1. **Đàm phán tăng Free Time khi ký hợp đồng:** Nếu sản lượng hàng tháng ổn định, hãy đàm phán xin tăng thời gian miễn phí lưu bãi từ 7 ngày lên 14 hoặc 21 ngày trước khi ký hợp đồng vận chuyển.\n2. **Khai báo thông quan sớm:** Hoàn thành thủ tục hải quan điện tử và đóng thuế nhập khẩu ngay khi tàu vừa rời cảng xếp (POL) để tránh hàng về đến cảng mới bắt đầu làm thủ tục.\n3. **Sử dụng Dịch vụ Trả rỗng nhanh hoặc chuyển Depot vệ tinh:** Chủ động chuyển container về các Depot vệ tinh lân cận nếu bãi cảng chính bị ùn tắc."
        }
      ],
      createdAt: new Date(now - 8 * d + 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_006_3",
      role: "user",
      content: "Nếu phát sinh Demurrage quá cao thì thủ tục xin miễn giảm chi phí này với hãng tàu cần những hồ sơ gì?",
      createdAt: new Date(now - 8 * d + 5 * 60 * 1000),
    },
    {
      id: "msg_006_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Tra cứu thủ tục xin waive demurrage", content: "Định vị các loại giấy tờ: Waive request letter, log cảng, chứng minh sự cố." }
          ]
        },
        {
          type: "text",
          text: "Để xin miễn giảm chi phí Demurrage (Waive/Discount Demurrage) từ hãng tàu, bạn cần chuẩn bị bộ hồ sơ chứng minh nguyên nhân chậm trễ khách quan:\n\n### 📁 Bộ hồ sơ xin miễn giảm cần chuẩn bị:\n- [ ] **Thư xin miễn giảm (Waive Request Letter):** Giải trình lý do chậm trễ do thiên tai, dịch bệnh hoặc ùn tắc nghiêm trọng tại cảng.\n- [ ] **Công văn xác nhận từ Cảng/Hải quan:** Chứng minh thời gian cảng bị kẹt cứng (Port Congestion) hoặc sự cố nghẽn mạng hệ thống Hải quan (NSW error).\n- [ ] **Bản chụp lịch sử hành trình container (Container History Log):** Chứng minh nỗ lực của doanh nghiệp trong việc điều xe nâng hạ nhưng bất khả kháng.\n\n> ⚠️ **Chú ý:** Hãng tàu thường chỉ xem xét giảm **30% - 50%** chi phí phát sinh và rất hiếm khi miễn 100%, ngoại trừ các trường hợp tranh chấp pháp lý đặc biệt."
        }
      ],
      createdAt: new Date(now - 8 * d + 10 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_007: [
    {
      id: "msg_007_1",
      role: "user",
      content: "Hãng tàu yêu cầu nâng cấp phiên bản EDIFACT từ D95B lên D00B. Có những thay đổi cấu trúc lớn nào cần lưu ý?",
      createdAt: new Date(now - 10 * d),
    },
    {
      id: "msg_007_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "So sánh danh mục EDIFACT", content: "Đang so sánh tài liệu đặc tả cấu trúc UN/EDIFACT thư mục D95B và D00B." },
            { label: "Xác định các thay đổi phân đoạn", content: "Nhận thấy sự thay đổi về độ dài các trường dữ liệu ID đối tác và thêm một số mã phân loại vị trí container mới." }
          ]
        },
        {
          type: "text",
          text: "Nâng cấp từ thư mục EDIFACT D95B lên D00B (Directory 00B) là một thay đổi quan trọng đối với hệ thống tích hợp SMDG. \n\n### 📝 Các thay đổi lớn cần lưu ý:\n1. **Mở rộng độ dài trường (Field Length):** Một số mã định danh đối tác (như mã SCAC của hãng tàu hoặc mã UN/LOCODE) được mở rộng độ dài ký tự tối đa trong phân đoạn `NAD`.\n2. **Thêm mã loại Container mới:** D00B hỗ trợ các loại container thế hệ mới tốt hơn (như container siêu trường siêu trọng, container ISO Tank hóa chất chuyên dụng) trong phân đoạn `EQD`.\n3. **Cập nhật phân đoạn DTM (Date/Time):** Bổ sung các mã quy ước múi giờ quốc tế chi tiết hơn, hạn chế tối đa việc nhầm lẫn múi giờ giữa cảng xếp và cảng dỡ."
        }
      ],
      createdAt: new Date(now - 10 * d + 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_007_3",
      role: "user",
      content: "Hãy cho tôi một ví dụ so sánh sự khác biệt của tệp EDIFACT BAPLIE giữa phiên bản D95B và D00B.",
      createdAt: new Date(now - 10 * d + 5 * 60 * 1000),
    },
    {
      id: "msg_007_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Tạo cấu trúc EDIFACT so sánh", content: "So sánh cấu trúc phân đoạn BAPLIE cho D95B và D00B." }
          ]
        },
        {
          type: "text",
          text: "Dưới đây là bảng so sánh cú pháp phân đoạn `EQD` (Equipment Details) khi mô tả container giữa hai phiên bản D95B và D00B:\n\n### ⚔️ So sánh cấu trúc `EQD` Segment:\n\n```txt\n-- Phiên bản D95B (Cũ) --\nEQD+CN+TGBU4432109+42G1+++5'\n\n-- Phiên bản D00B (Mới) --\nEQD+CN+TGBU4432109+45GP:102:5++2+5'\n```\n\n### 🔍 Phân tích điểm khác biệt chính:\n- **Mã phân loại ISO:** Phiên bản D95B sử dụng mã ISO 4 ký tự kiểu cũ (`42G1`). Phiên bản D00B hỗ trợ chi tiết hơn (`45GP:102:5` để xác định chính xác kiểu container General Purpose 40ft High Cube).\n- **Bổ sung thông tin phân nhóm nguồn gốc thiết bị:** Phân đoạn D00B tích hợp thêm các thẻ chỉ định nhà cung cấp thiết bị (`102:5`) mà phiên bản D95B không có."
        }
      ],
      createdAt: new Date(now - 10 * d + 10 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_008: [
    {
      id: "msg_008_1",
      role: "user",
      content: "File BAPLIE gửi đi bị hệ thống của cảng báo lỗi sai định dạng ngày tháng tại phân đoạn DTM. Sửa thế nào?",
      createdAt: new Date(now - 12 * d),
    },
    {
      id: "msg_008_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Phân tích cú pháp DTM BAPLIE", content: "Đang phân tích định dạng segment `DTM+137:20260520:102'`." },
            { label: "Xác định mã lỗi định dạng", content: "Mã định dạng `102` yêu cầu định dạng `YYYYMMDD`. Lỗi xảy ra do dữ liệu đầu ra chứa ký tự phân tách `-` hoặc `:` vốn không hợp lệ trong EDIFACT chuẩn." }
          ]
        },
        {
          type: "text",
          text: "Lỗi định dạng ngày tháng trong file BAPLIE thông thường xuất phát từ việc nhập sai mã chỉ định định dạng (Format qualifier) trong phân đoạn `DTM`.\n\n### 🛠️ Cách khắc phục:\n1. **Kiểm tra cú pháp gốc:** Đảm bảo dữ liệu không chứa dấu phân tách (như `-` hoặc `/`). \n   *Ví dụ sai:* `DTM+137:2026-05-20:102'`\n   *Ví dụ đúng:* `DTM+137:20260520:102'`\n2. **Sử dụng mã định dạng phù hợp:**\n   - Sử dụng mã **`102`** cho định dạng `YYYYMMDD` (8 ký tự).\n   - Sử dụng mã **`203`** nếu tệp tin của bạn yêu cầu cả giờ phút: `YYYYMMDDHHMM` (12 ký tự), ví dụ: `DTM+137:202605200830:203'`."
        }
      ],
      createdAt: new Date(now - 12 * d + 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_008_3",
      role: "user",
      content: "Làm sao để cấu hình tự động kiểm tra định dạng DTM này trong code Node.js trước khi gửi file đi?",
      createdAt: new Date(now - 12 * d + 5 * 60 * 1000),
    },
    {
      id: "msg_008_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Xây dựng regex kiểm tra format DTM", content: "Tạo biểu thức chính quy (Regex) xác thực chuỗi DTM trong Node.js." }
          ]
        },
        {
          type: "text",
          text: "Bạn có thể sử dụng biểu thức chính quy (Regular Expression) trong Node.js để kiểm tra tính hợp lệ của phân đoạn `DTM` trước khi truyền phát. Dưới đây là hàm mã nguồn JavaScript ví dụ:\n\n```javascript\nfunction validateDtmSegment(segment) {\n  // Kiểm tra định dạng chuẩn: DTM+137:YYYYMMDD:102\n  const dtmRegex = /^DTM\\+137:(\\d{8}):102$/;\n  const match = segment.match(dtmRegex);\n  \n  if (!match) {\n    return {\n      valid: false,\n      reason: \"Không khớp với cấu trúc DTM+137:YYYYMMDD:102 hoặc chứa ký tự phân cách trái phép.\"\n    };\n  }\n  \n  const dateStr = match[1];\n  const year = parseInt(dateStr.substring(0, 4));\n  const month = parseInt(dateStr.substring(4, 6));\n  const day = parseInt(dateStr.substring(6, 8));\n  \n  if (month < 1 || month > 12 || day < 1 || day > 31) {\n    return { valid: false, reason: `Giá trị ngày tháng ${dateStr} không hợp lệ thực tế.` };\n  }\n  \n  return { valid: true };\n}\n\n// Ví dụ chạy thử:\nconsole.log(validateDtmSegment(\"DTM+137:2026-05-20:102\")); // => { valid: false, ... }\nconsole.log(validateDtmSegment(\"DTM+137:20260520:102\"));  // => { valid: true }\n```"
        }
      ],
      createdAt: new Date(now - 12 * d + 10 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_009: [
    {
      id: "msg_009_1",
      role: "user",
      content: "Xuất giúp tôi danh sách container nguy hiểm (DG) đang tồn bãi quá 7 ngày.",
      createdAt: new Date(now - 14 * d),
    },
    {
      id: "msg_009_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Truy vấn dữ liệu bãi container", content: "Đang lọc dữ liệu tồn kho hiện tại với bộ lọc: Loại hàng = DG (Dangerous Goods), Thời gian lưu bãi > 7 ngày." },
            { label: "Phân loại mã IMDG", content: "Nhận dạng các lớp nguy hiểm IMDG Class 3 (Chất lỏng dễ cháy) và Class 6.1 (Chất độc hại)." }
          ]
        },
        {
          type: "text",
          text: "Tôi đã trích xuất danh sách container nguy hiểm (DG) có thời gian tồn bãi vượt quá 7 ngày tính đến hôm nay:\n\n### ⚠️ Danh sách container DG tồn đọng (>7 ngày):\n\n| Container ID | Hãng tàu | IMDG Class | Vị trí bãi | Ngày nhập cảng | Số ngày tồn |\n|---|---|---|---|---|---|\n| **TGBU4432109** | ONE | Class 3 | BAY 04-A2 | 11/05/2026 | 9 ngày |\n| **NYKU8872510** | NYK | Class 6.1 | BAY 12-C1 | 09/05/2026 | 11 ngày |\n| **MAEU2218903** | MSK | Class 8 | BAY 02-B3 | 12/05/2026 | 8 ngày |\n\n### 🚨 Khuyến nghị hành động:\nCác container thuộc nhóm hàng nguy hiểm này cần được kiểm tra cảm quan bên ngoài định kỳ mỗi 12 giờ để đảm bảo không bị rò rỉ hoặc quá nhiệt."
        }
      ],
      createdAt: new Date(now - 14 * d + 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_009_3",
      role: "user",
      content: "Hãy viết một kịch bản SQL để tự động gửi thông báo qua Email nếu có container IMDG Class 3 hoặc Class 8 tồn bãi quá 5 ngày.",
      createdAt: new Date(now - 14 * d + 5 * 60 * 1000),
    },
    {
      id: "msg_009_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Lập kịch bản truy vấn tồn đọng DG", content: "Viết câu lệnh SQL lọc container theo IMDG Class và AGE > 5." }
          ]
        },
        {
          type: "text",
          text: "Dưới đây là mã SQL (PostgreSQL) kết hợp cơ chế gửi cảnh báo tự động cho hàng nguy hiểm tồn bãi quá 5 ngày:\n\n```sql\n-- Tạo function lọc và chuẩn bị nội dung mail cảnh báo\nCREATE OR REPLACE FUNCTION check_and_alert_hazardous_containers()\nRETURNS void AS $$\nDECLARE\n    v_rec RECORD;\n    v_email_content TEXT := 'Cảnh báo: Phát hiện container nguy hiểm tồn bãi quá 5 ngày:\\n\\n';\n    v_alert_needed BOOLEAN := FALSE;\nBEGIN\n    FOR v_rec IN \n        SELECT container_id, carrier_code, imdg_class, yard_position, entry_date, \n               CURRENT_DATE - entry_date AS days_in_yard\n        FROM yard_inventory\n        WHERE imdg_class IN ('Class 3', 'Class 8')\n          AND CURRENT_DATE - entry_date > 5\n    LOOP\n        v_email_content := v_email_content || \n            '- Container: ' || v_rec.container_id || \n            ', Hãng tàu: ' || v_rec.carrier_code || \n            ', Lớp: ' || v_rec.imdg_class || \n            ', Vị trí: ' || v_rec.yard_position || \n            ', Số ngày tồn: ' || v_rec.days_in_yard || '\\n';\n        v_alert_needed := TRUE;\n    END LOOP;\n\n    IF v_alert_needed THEN\n        -- Invoking mail server extension\n        PERFORM pg_send_mail('ops_safety@catlaiport.com', 'Cảnh Báo Hàng Nguy Hiểm Tồn Đọng', v_email_content);\n    END IF;\nEND;\n$$ LANGUAGE plpgsql;\n```\n\nBạn có thể thiết lập chạy function này vào lúc **07:00 sáng hàng ngày** bằng cách sử dụng `pg_cron`:\n```sql\nSELECT cron.schedule('0 7 * * *', 'SELECT check_and_alert_hazardous_containers();');\n```"
        }
      ],
      createdAt: new Date(now - 14 * d + 10 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_010: [
    {
      id: "msg_010_1",
      role: "user",
      content: "Làm thế nào để tích hợp hệ thống của chúng ta với API Hải quan Một cửa Quốc gia (NSW)?",
      createdAt: new Date(now - 16 * d),
    },
    {
      id: "msg_010_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Tra cứu tài liệu cổng thông tin NSW", content: "Đọc tài liệu đặc tả kết nối API hải quan một cửa quốc gia Việt Nam." },
            { label: "Cấu hình chữ ký số", content: "Xác minh các bước cấu hình HSM (Hardware Security Module) hoặc USB Token để ký số tờ khai hải quan điện tử XML." }
          ]
        },
        {
          type: "text",
          text: "Để tích hợp hệ thống SMDG của chúng ta với cổng Hải quan Một cửa Quốc gia (NSW), bạn cần triển khai theo 3 bước kỹ thuật chính:\n\n### 🔒 Quy trình tích hợp kỹ thuật với NSW:\n1. **Đăng ký kết nối và cấp Chữ ký số (CA):** Đăng ký địa chỉ IP nguồn (White-list IP) kết nối đến server NSW và cấu hình tích hợp dịch vụ ký số (HSM) để tự động ký các tệp tờ khai XML trước khi gửi đi.\n2. **Xây dựng định dạng thông điệp (XML Schema):** Chuyển đổi dữ liệu manifest từ file BAPLIE/EDIFACT nội bộ sang định dạng XML chuẩn được NSW quy định.\n3. **Cấu hình giao thức gửi nhận (Giao thức SOAP/AS2):** Thiết lập kênh truyền bảo mật thông qua giao thức HTTPS Web Service (SOAP) hoặc AS2 để gửi dữ liệu tờ khai và nhận thông điệp phản hồi từ cơ quan hải quan."
        }
      ],
      createdAt: new Date(now - 16 * d + 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_010_3",
      role: "user",
      content: "Có tài liệu ví dụ cấu trúc của một file XML tờ khai Hải quan để gửi đi qua NSW không?",
      createdAt: new Date(now - 16 * d + 5 * 60 * 1000),
    },
    {
      id: "msg_010_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Tạo dữ liệu XML manifest", content: "Xây dựng tệp XML mẫu đại diện cho thông điệp CustomDeclaration." }
          ]
        },
        {
          type: "text",
          text: "Dưới đây là tệp tin XML mẫu (`nsw_manifest_declaration.xml`) được mã hóa chuẩn để gửi đến Hải quan Một cửa Quốc gia:\n\n```xml\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Envelope>\n  <Header>\n    <MessageId>NSW_MSG_20260520_9901</MessageId>\n    <SenderIdentity>VN_CATLAI_PORT</SenderIdentity>\n    <ReceiverIdentity>GDVC_NSW_GATEWAY</ReceiverIdentity>\n    <DocumentType>CARGO_MANIFEST</DocumentType>\n  </Header>\n  <Body>\n    <CargoDeclaration>\n      <VesselName>MOL ADVANTAGE</VesselName>\n      <VoyageNo>024E</VoyageNo>\n      <ArrivalDate>2026-05-20</ArrivalDate>\n      <Containers>\n        <Container>\n          <ContainerNo>TGBU4432109</ContainerNo>\n          <SealNo>ONE09483</SealNo>\n          <SizeKind>45R1</SizeKind>\n          <Weight unit=\"KGM\">30480</Weight>\n        </Container>\n      </Containers>\n    </CargoDeclaration>\n  </Body>\n</Envelope>\n```\n\n### 📝 Các phân vùng dữ liệu chính:\n- **`Envelope.Header`:** Chứa thông tin định danh người gửi (`SenderIdentity`), loại tài liệu để NSW định tuyến.\n- **`Envelope.Body.CargoDeclaration`:** Chi tiết về chuyến tàu (`VoyageNo`), ngày cập cảng (`ArrivalDate`) và danh sách hàng hóa bên trong container."
        }
      ],
      createdAt: new Date(now - 16 * d + 10 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_011: [
    {
      id: "msg_011_1",
      role: "user",
      content: "Tôi muốn giới hạn nhân viên Depot A chỉ được xem container của Depot A. Cấu hình ở đâu?",
      createdAt: new Date(now - 18 * d),
    },
    {
      id: "msg_011_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Kiểm tra sơ đồ database phân quyền", content: "Kiểm tra bảng phân quyền người dùng theo chi nhánh (user_branch_mapping)." },
            { label: "Xác định màn hình giao diện cấu hình", content: "Xác định module quản trị hệ thống: Hệ thống -> Nhóm & Phân quyền -> Phân quyền dữ liệu (Data-level security)." }
          ]
        },
        {
          type: "text",
          text: "Để thực hiện giới hạn quyền xem dữ liệu container theo Depot (Phân quyền cấp dữ liệu - Row-level Security), bạn hãy thực hiện theo các bước sau:\n\n### 🛡️ Các bước cấu hình phân quyền theo Depot:\n1. Truy cập vào mục **Hệ thống** -> **Quản lý phân quyền** -> **Phân quyền dữ liệu**.\n2. Chọn tài khoản nhân viên hoặc nhóm người dùng cần phân quyền.\n3. Tại mục **Phạm vi dữ liệu (Scope)**, chuyển đổi từ trạng thái `TẤT CẢ` sang trạng thái `CHI NHÁNH`.\n4. Chọn chi nhánh cụ thể là **Depot A** trong danh sách các chi nhánh được hiển thị.\n5. Nhấn **Lưu** để áp dụng thay đổi. Hệ thống sẽ tự động lọc toàn bộ các truy vấn tìm kiếm container dựa trên mã chi nhánh (Depot code) của người dùng."
        }
      ],
      createdAt: new Date(now - 18 * d + 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_011_3",
      role: "user",
      content: "Làm sao để viết chính sách RLS (Row-Level Security) này trực tiếp trong cơ sở dữ liệu PostgreSQL?",
      createdAt: new Date(now - 18 * d + 5 * 60 * 1000),
    },
    {
      id: "msg_011_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Thiết kế SQL chính sách RLS", content: "Viết câu lệnh CREATE POLICY trên bảng yard_containers." }
          ]
        },
        {
          type: "text",
          text: "Để kích hoạt chính sách Row-Level Security (RLS) trực tiếp trong PostgreSQL nhằm khóa dữ liệu container theo Depot của tài khoản nhân viên đang đăng nhập, bạn có thể chạy kịch bản SQL sau:\n\n```sql\n-- 1. Bật tính năng RLS trên bảng container\nALTER TABLE yard_containers ENABLE ROW LEVEL SECURITY;\n\n-- 2. Tạo chính sách giới hạn quyền truy cập\nCREATE POLICY container_depot_isolation_policy ON yard_containers\n    FOR ALL\n    TO authenticated_users\n    USING (\n        -- Chỉ cho phép xem nếu mã depot trùng khớp với session biến môi trường của user\n        depot_id = current_setting('app.current_user_depot_id', true)\n    );\n```\n\n### 🛡️ Các lưu ý khi triển khai SQL RLS:\n- Đảm bảo biến `app.current_user_depot_id` được set ở mức local session mỗi khi backend pool kết nối tới DB (ví dụ gọi: `SET LOCAL app.current_user_depot_id = 'DEP_A';` trước khi chạy câu lệnh truy vấn chính)."
        }
      ],
      createdAt: new Date(now - 18 * d + 10 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_012: [
    {
      id: "msg_012_1",
      role: "user",
      content: "Hiệu suất cẩu bờ (QC crane) sáng nay giảm 15%. Có cảnh báo nghẽn thiết bị nào không?",
      createdAt: new Date(now - 20 * d),
    },
    {
      id: "msg_012_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Kiểm tra dashboard hiệu suất thiết bị", content: "Đang truy vấn số liệu Gross Move Per Hour (GMPH) của 4 cẩu QC chính sáng nay." },
            { label: "Kiểm tra logs bảo trì", content: "Phát hiện cẩu số QC04 có cảnh báo sụt áp nguồn cấp kéo cáp lúc 08:30 sáng nay." }
          ]
        },
        {
          type: "text",
          text: "Chào bạn, phân tích dữ liệu vận hành từ hệ thống cẩu bờ (QC Crane) cho thấy có hiện tượng suy giảm hiệu suất cục bộ tại cẩu **QC04**:\n\n### 📊 Chi tiết sự cố cẩu QC04:\n- **Gross Move Per Hour (GMPH):** Giảm từ trung bình `28 moves/hour` xuống còn `19 moves/hour` từ lúc 08:30 sáng.\n- **Lý do kỹ thuật:** Hệ thống SCADA ghi nhận cảnh báo mã `E-0442` (Sụt áp nguồn cấp động cơ cẩu chính). Động cơ đã tự động chuyển sang chế độ an toàn (Safe mode), giới hạn tốc độ kéo cáp lên/xuống xuống 70% công suất.\n- **Hướng xử lý:** Đội kỹ thuật điện cảng đã được điều động đến trạm biến áp số 2 để kiểm tra và reset hệ thống cung cấp điện. Dự kiến hoàn thành khắc phục trước 11:30."
        }
      ],
      createdAt: new Date(now - 20 * d + 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_012_3",
      role: "user",
      content: "Hãy viết hướng dẫn các bước kiểm tra xử lý sự cố sụt áp nguồn cấp kéo cáp này cho nhân viên kỹ thuật điện.",
      createdAt: new Date(now - 20 * d + 5 * 60 * 1000),
    },
    {
      id: "msg_012_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Thiết kế quy trình SOP sự cố điện cẩu bờ", content: "Xây dựng hướng dẫn 3 bước kiểm tra trạm biến áp và tủ điều khiển VFD." }
          ]
        },
        {
          type: "text",
          text: "Dưới đây là Quy trình kiểm tra kỹ thuật chuẩn (SOP) để xử lý sự cố sụt áp mã `E-0442` tại cẩu QC04:\n\n### 🧑‍🔧 Quy trình xử lý lỗi sụt áp nguồn kéo cáp (3 bước):\n\n1. **Kiểm tra điện áp cấp tại Trạm Biến áp số 2:**\n   - Dùng thiết bị đo chuyên dụng kiểm tra nguồn điện lưới 22kV cấp vào tủ phân phối hạ thế của cầu tàu.\n   - Đảm bảo điện áp dây ở ngõ ra đạt mức **400V ± 5%**.\n2. **Kiểm tra Hệ thống Tụ bù công suất (Capacitor Bank):**\n   - Xác nhận tủ tụ bù tự động hoạt động bình thường, hệ số `Cos phi` duy trì trên **0.92** để hạn chế hiện tượng sụt áp tức thời khi động cơ cẩu chính khởi động tải nặng.\n3. **Khởi động lại biến tần điều khiển (VFD Reset):**\n   - Kiểm tra mã lỗi trên biến tần điều khiển động cơ cẩu chính (main hoist inverter).\n   - Đợi điện áp tụ DC Bus ổn định về ngưỡng an toàn rồi tiến hành reset nóng lỗi trên giao diện điều khiển SCADA cabin."
        }
      ],
      createdAt: new Date(now - 20 * d + 10 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_013: [
    {
      id: "msg_013_1",
      role: "user",
      content: "File COARRI dùng để báo cáo sự kiện gì cho hãng tàu và cấu trúc cơ bản thế nào?",
      createdAt: new Date(now - 22 * d),
    },
    {
      id: "msg_013_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Tra cứu chuẩn thông điệp EDIFACT COARRI", content: "Đọc cấu trúc segment COARRI v1.2." },
            { label: "Mô tả mục đích và phân đoạn", content: "Xác định các segment chính: BGM (Beginning of Message), EQD (Equipment details), LOC (Locations)." }
          ]
        },
        {
          type: "text",
          text: "COARRI (Container Discharge/Loading Report) là thông điệp EDI chuẩn hóa quốc tế được sử dụng bởi Cảng để gửi thông báo cho Hãng tàu xác nhận các container đã thực tế được xếp lên tàu hoặc dỡ xuống tàu.\n\n### 📦 3 Cấu trúc phân đoạn cốt lõi của file COARRI:\n1. **BGM (Beginning of Message):** Khai báo mục đích của tệp tin. Ví dụ mã `9` biểu thị thông tin thực tế xếp dỡ (Actual loading/discharge information).\n2. **EQD (Equipment Details):** Khai báo số container, loại container (size/type) và trạng thái container (đầy hàng - F hay rỗng - E).\n3. **LOC (Locations):** Khai báo vị trí container được xếp trên tàu (Stowage position) hoặc vị trí bãi cảng nơi hạ container."
        }
      ],
      createdAt: new Date(now - 22 * d + 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_013_3",
      role: "user",
      content: "Làm thế nào để parse tệp COARRI dùng thư viện npm trong Node.js? Hãy viết code ví dụ.",
      createdAt: new Date(now - 22 * d + 5 * 60 * 1000),
    },
    {
      id: "msg_013_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Xây dựng code node.js giải mã file COARRI", content: "Viết kịch bản Javascript sử dụng kỹ thuật regex hoặc thư viện đơn giản." }
          ]
        },
        {
          type: "text",
          text: "Dưới đây là một đoạn mã nguồn Node.js sử dụng biểu thức Regex đơn giản để lọc ra danh sách mã số các container có trong tệp tin báo cáo COARRI:\n\n```javascript\nconst fs = require('fs');\n\nfunction parseCoarriContainers(filePath) {\n  const content = fs.readFileSync(filePath, 'utf-8');\n  // Cắt các segment qua dấu kết thúc '\''\n  const segments = content.split(\"'\");\n  \n  const containers = [];\n  \n  for (const segment of segments) {\n    if (segment.startsWith('EQD+CN')) {\n      const fields = segment.split('+');\n      const containerId = fields[2];\n      const isoType = fields[3] ? fields[3].split(':')[0] : 'UNKNOWN';\n      \n      containers.push({\n        containerId,\n        isoType\n      });\n    }\n  }\n  \n  return containers;\n}\n\n// Chạy kiểm thử:\n// const result = parseCoarriContainers('./coarri_actual_load.edi');\n// console.log(result);\n```"
        }
      ],
      createdAt: new Date(now - 22 * d + 10 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_014: [
    {
      id: "msg_014_1",
      role: "user",
      content: "Lên kế hoạch ngắt điện bảo trì trạm biến áp bãi lạnh khu vực Reefer-Zone 2.",
      createdAt: new Date(now - 25 * d),
    },
    {
      id: "msg_014_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Đánh giá tải lượng bãi lạnh Reefer-Zone 2", content: "Đang kiểm tra số lượng container lạnh thực tế đang cắm điện tại Reefer-Zone 2. Nhận thấy có 42 container, chủ yếu là hoa quả tươi và thủy sản." },
            { label: "Đề xuất kế hoạch ngắt điện an toàn", content: "Hàng tươi sống không thể mất điện quá 30 phút. Do đó, cần đấu nối máy phát điện di động dự phòng trước khi ngắt điện trạm biến áp." }
          ]
        },
        {
          type: "text",
          text: "Khu vực **Reefer-Zone 2** hiện tại có **42 container** lạnh đang cắm nguồn cảng (chứa hàng hoa quả tươi và hải sản có giá trị cao). Việc ngắt điện bảo trì trạm biến áp cần tuân thủ quy trình an toàn nghiêm ngặt để tránh biến đổi nhiệt độ của hàng hóa:\n\n### 📅 Kế hoạch bảo trì đề xuất (Dự kiến 2 giờ):\n- **Thời gian đề xuất:** 02:00 - 04:00 sáng (thời điểm nhiệt độ môi trường thấp nhất).\n- **Giải pháp cấp điện dự phòng:** Điều động **02 Máy phát điện công suất lớn (Gen-set di động)** đấu nối tạm thời vào hệ thống tủ điện Reefer-Zone 2 trước khi tiến hành cô lập nguồn điện chính.\n- **Nhân sự thực hiện:** 03 kỹ sư điện trạm và 02 kỹ thuật viên lạnh trực bãi để kiểm tra nhiệt độ container cứ sau 15 phút một lần."
        }
      ],
      createdAt: new Date(now - 25 * d + 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_014_3",
      role: "user",
      content: "Hãy lập bảng phân công ca trực cụ thể cho 2 kỹ thuật viên lạnh và 3 kỹ sư điện trong suốt 2 tiếng bảo trì này.",
      createdAt: new Date(now - 25 * d + 5 * 60 * 1000),
    },
    {
      id: "msg_014_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Phân bổ thời gian và nhiệm vụ trực", content: "Tạo bảng thời gian chia theo ca 30 phút cho kĩ sư điện và kỹ thuật viên." }
          ]
        },
        {
          type: "text",
          text: "Dưới đây là thời gian biểu và phân công công việc chi tiết trong suốt thời gian bảo trì từ **02:00 đến 04:00**:\n\n### 📋 Bảng phân công ca trực bảo trì:\n\n| Khung giờ | Kỹ sư Điện (Trạm biến áp) | Kỹ thuật Lạnh (Reefer-Zone) | Nhiệm vụ chính |\n| :--- | :--- | :--- | :--- |\n| **01:30 - 02:00** | Kỹ sư A, Kỹ sư B | Kỹ thuật viên X | Chuẩn bị, kéo cáp và đấu nối 2 tổ máy phát Gen-set dự phòng. |\n| **02:00 - 02:30** | Kỹ sư C | Kỹ thuật viên Y | Cô lập trạm biến áp chính. Thực hiện đo đạc và kiểm tra nhiệt độ vòng 1. |\n| **02:30 - 03:30** | Kỹ sư A, Kỹ sư B | Kỹ thuật viên X, Y | Tiến hành vệ sinh cách điện và đo thông mạch thiết bị. Đo nhiệt độ vòng 2 và 3. |\n| **03:30 - 04:00** | Kỹ sư C | Kỹ thuật viên X | Đóng điện trạm biến áp trở lại, thu hồi máy phát. Xác nhận tải ổn định. |\n\n> 📋 **Kiểm tra nhiệt độ:** Kỹ thuật viên lạnh bắt buộc phải lập biên bản ghi lại trị số nhiệt độ hiện tại của mỗi container lạnh sau mỗi chu kỳ kiểm tra 20 phút."
        }
      ],
      createdAt: new Date(now - 25 * d + 10 * 60 * 1000),
      status: "complete",
    }
  ],
  conv_015: [
    {
      id: "msg_015_1",
      role: "user",
      content: "Chúng ta cần đồng bộ danh mục cảng biển quốc tế UN/LOCODE mới nhất 2026. Tải dữ liệu từ đâu?",
      createdAt: new Date(now - 30 * d),
    },
    {
      id: "msg_015_2",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Kiểm tra liên kết UNECE UN/LOCODE", content: "Tìm kiếm URL cơ sở dữ liệu chính thức của Ủy ban Kinh tế Liên Hợp Quốc về Châu Âu (UNECE)." },
            { label: "Thiết lập quy trình tải tự động", content: "Thiết kế script curl/wget để tải tệp zip, giải nén và nạp vào database của chúng ta." }
          ]
        },
        {
          type: "text",
          text: "Danh mục mã cảng biển quốc tế UN/LOCODE được quản lý bởi tổ chức UNECE (Ủy ban Kinh tế Liên Hợp Quốc về Châu Âu). \n\n### 🌐 Nguồn tải dữ liệu chính thức:\n- Bạn có thể tải trực tiếp cơ sở dữ liệu UN/LOCODE mới nhất tại địa chỉ website chính thức của UNECE: [UNECE UN/LOCODE Portal](https://unece.org/trade/cefact/unlocode-code-list-by-country-territory).\n- Dữ liệu được cung cấp dưới dạng các tệp văn bản CSV phân tách bằng dấu phẩy hoặc cơ sở dữ liệu MS Access chia theo từng quốc gia hoặc tệp nén tổng hợp toàn cầu.\n- Dự án của chúng ta đã có sẵn script tự động đồng bộ tại `packages/api-sdk/scripts/sync-locode.sh`. Bạn chỉ cần chạy lệnh `npm run sync:locode` trong terminal để script tự động cào dữ liệu mới nhất và cập nhật vào Postgres DB."
        }
      ],
      createdAt: new Date(now - 30 * d + 60 * 1000),
      status: "complete",
    },
    {
      id: "msg_015_3",
      role: "user",
      content: "Viết script bash `sync-locode.sh` tự động tải file zip UN/LOCODE từ website UNECE, giải nén và import vào Postgres DB.",
      createdAt: new Date(now - 30 * d + 5 * 60 * 1000),
    },
    {
      id: "msg_015_4",
      role: "assistant",
      content: [
        {
          type: "reasoning",
          steps: [
            { label: "Thiết kế bash script tải và import", content: "Tải file zip dùng curl, unzip và dùng psql command COPY." }
          ]
        },
        {
          type: "text",
          text: "Dưới đây là nội dung script bash tự động hóa quy trình đồng bộ UN/LOCODE tải về từ UNECE:\n\n```bash\n#!/usr/bin/env bash\nset -euo pipefail\n\nDOWNLOAD_URL=\"https://unece.org/sites/default/files/2026-01/LocodeCsv2026-1.zip\"\nTEMP_DIR=\"/tmp/locode_sync\"\nDB_NAME=\"smdg_platform\"\n\nmkdir -p \"$TEMP_DIR\"\necho \"📥 Đang tải danh sách UN/LOCODE từ UNECE...\"\ncurl -sSL \"$DOWNLOAD_URL\" -o \"$TEMP_DIR/locode.zip\"\n\necho \"📦 Giải nén tệp tin CSV...\"\nunzip -q -o \"$TEMP_DIR/locode.zip\" -d \"$TEMP_DIR\"\n\necho \"🚀 Đang nạp dữ liệu vào cơ sở dữ liệu Postgres...\"\n# Giả sử chúng ta import tệp chính chứa dữ liệu mã cảng\npsql -d \"$DB_NAME\" -c \"COPY un_locodes(country_code, location_code, name, status) FROM '$TEMP_DIR/2026-1 CodeList.csv' DELIMITER ',' CSV HEADER;\"\n\nrm -rf \"$TEMP_DIR\"\necho \"✅ Hoàn thành cập nhật danh mục cảng biển!\"\n```"
        }
      ],
      createdAt: new Date(now - 30 * d + 10 * 60 * 1000),
      status: "complete",
    }
  ]
};
