"use client";

import { useEffect, useMemo, useState } from "react";

type ViolationOption = {
  violation_number: string | null;
  city?: string;
  amount?: number;
  status?: string;
  description?: string;
};

type ChatMessage =
  | { role: "assistant" | "user"; type?: "text"; content: string }
  | {
      role: "assistant";
      type: "options";
      prompt: string;
      scenario: string;
      options: any[];
    }
  | {
      role: "assistant";
      type: "form";
      title: string;
      scenario: string;
      fields: Array<{
        key: string;
        label: string;
        type: "text" | "date" | "select";
        options?: string[];
      }>;
    }
  | {
      role: "assistant";
      type: "validation";
      content: string;
      scenario?: string;
    }
  | {
      role: "assistant";
      type: "payment";
      fee: number;
      context?: any;
      label?: string;
    }
  | {
      role: "assistant";
      type: "add_balance";
      needed: number;
      context?: any;
    }
  | {
      role: "assistant";
      type: "summary";
      content: string;
    };
type Interrupt = {
  ask?: string;
  field?: string;
  options?: any;
  field_type?: string;
};
type StepLog = any;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const staticServices = [
  { icon: "📅", label: "مواعيد" },
  { icon: "👥", label: "العمالة" },
  { icon: "👨‍👩‍👧‍👦", label: "أفراد الأسرة" },
  { icon: "🚗", label: "المركبات" },
  { icon: "💻", label: "خدماتي" },
];

const suggestionChips = ["📄 الوثائق", "🚗 المركبات", "👨‍👩‍👧‍👦 العائلة"];

const demoViolations: ViolationOption[] = [
  {
    violation_number: "V-1001",
    city: "الرياض",
    amount: 300,
    status: "unpaid",
    description: "تجاوز السرعة المحددة على الطريق الدائري الشرقي.",
  },
  {
    violation_number: "V-1002",
    city: "جدة",
    amount: 150,
    status: "unpaid",
    description: "الوقوف في مكان غير مسموح.",
  },
  {
    violation_number: "V-1003",
    city: "مكة",
    amount: 200,
    status: "paid",
    description: "عدم ربط حزام الأمان.",
  },
];

const apiHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

function useStoredToken() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("absher_token");
    if (saved) setToken(saved);
  }, []);
  const save = (val: string) => {
    localStorage.setItem("absher_token", val);
    setToken(val);
  };
  const clear = () => {
    localStorage.removeItem("absher_token");
    setToken(null);
  };
  return { token, save, clear };
}

export default function Page() {
  const { token, save: saveToken, clear } = useStoredToken();
  const effectiveToken = useMemo(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("absher_token");
      return token || stored;
    }
    return token;
  }, [token]);
  const [view, setView] = useState<"login" | "dashboard">("login");
  const [displayName, setDisplayName] = useState("Demo User");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [nationalId, setNationalId] = useState("1111");
  const [pin, setPin] = useState("123456");

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interrupt, setInterrupt] = useState<Interrupt | null>(null);
  const [steps, setSteps] = useState<StepLog[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(200);

  // Restore session if token exists
  useEffect(() => {
    if (effectiveToken) {
      setView("dashboard");
      // Try to restore thread
      const storedThread = localStorage.getItem("absher_thread_id");
      if (storedThread) {
        resumeThread(storedThread, { value: "استمرار" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveToken]);

  const apiPost = async (path: string, body: any, withAuth = true) => {
    const tokenToUse = withAuth ? effectiveToken : null;
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: apiHeaders(tokenToUse ?? undefined),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.json();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);
    setLoginError(null);
    try {
      const data = await apiPost(
        "/auth/login",
        { national_id: nationalId, pin },
        false
      );
      saveToken(data.token);
      setDisplayName(data.display_name || "مستخدم أبشر");
      setView("dashboard");
    } catch (err: any) {
      setLoginError("تعذر تسجيل الدخول. تحقق من الهوية أو الرقم السري.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const openChat = () => {
    setChatOpen(true);
    setChatError(null);
    if (!messages.length && !interrupt && effectiveToken) {
      sendMessage("مرحباً، أريد المساعدة");
    }
  };

  const closeChat = () => {
    setChatOpen(false);
  };

  const persistThread = (id: string) => {
    localStorage.setItem("absher_thread_id", id);
  };

  const applyResponse = (resp: any, userMessage?: string) => {
    if (userMessage) {
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    }
    const backendMsgs = (resp.messages || []) as ChatMessage[];
    setMessages((prev) => [...prev, ...backendMsgs]);
    setInterrupt(resp.interrupt || null);
    setSteps(resp.steps || []);
    setThreadId(resp.thread_id);
    if (resp.thread_id) persistThread(resp.thread_id);
    setPending(false);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || pending) return;
    // Append user message
    appendMessage({ role: "user", content: text.trim(), type: "text" });
    // Handle frontend-only scenarios
    const scenario = detectLocalIntent(text.trim());
    if (scenario) {
      startScenario(scenario);
      setInput("");
      return;
    }
    if (!effectiveToken) {
      setChatError("الرجاء تسجيل الدخول قبل بدء المحادثة.");
      return;
    }
    setPending(true);
    setChatError(null);
    try {
      const resp = await apiPost("/agent/chat", {
        message: text.trim(),
        thread_id: threadId,
      });
      applyResponse(resp);
      setInput("");
    } catch (err: any) {
      setChatError("فشل إرسال الرسالة. حاول مجدداً.");
      setPending(false);
    }
  };

  const resumeThread = async (tid: string, payload: any) => {
    if (pending) return;
    if (!effectiveToken) {
      setChatError("الرجاء تسجيل الدخول قبل المتابعة.");
      return;
    }
    setPending(true);
    setChatError(null);
    try {
      const resp = await apiPost("/agent/resume", {
        thread_id: tid,
        value: payload,
      });
      applyResponse(resp);
    } catch (err: any) {
      setChatError("تعذر المتابعة. حاول مرة أخرى.");
      setPending(false);
    }
  };

  const handleInterruptSubmit = async (value: any) => {
    if (!threadId) return;
    await resumeThread(threadId, { value });
  };

  const handleLogout = () => {
    clear();
    localStorage.removeItem("absher_thread_id");
    setMessages([]);
    setInterrupt(null);
    setSteps([]);
    setThreadId(null);
    setChatOpen(false);
    setView("login");
  };

  const appendMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const detectLocalIntent = (text: string): string | null => {
    const lower = text.toLowerCase();
    const hasViolation =
      lower.includes("مخالفة") ||
      lower.includes("مخالفاتي") ||
      lower.includes("مخالفات") ||
      lower.includes("violation");
    const pay =
      lower.includes("سداد") ||
      lower.includes("اسدد") ||
      lower.includes("ادفع") ||
      lower.includes("pay");
    const show =
      lower.includes("اعرض") ||
      lower.includes("عرض") ||
      lower.includes("استعلام") ||
      lower.includes("show");
    const extension = lower.includes("تمديد") || lower.includes("مهلة");
    const objection = lower.includes("اعتراض") || lower.includes("اعترض");
    const license = lower.includes("رخصة") || lower.includes("الرخصة");
    const idRenew = lower.includes("هوية") && lower.includes("تجديد");
    const idReplace =
      /بدل\s*(?:فاقد|فقد|تالف|تلِف|مفقود)/.test(lower) ||
      lower.includes("بدل فاقد") ||
      lower.includes("بدل تالف") ||
      lower.includes("فاقد الهوية") ||
      lower.includes("فقد الهوية");
    const idFamily =
      lower.includes("لأحد أفراد") || lower.includes("لأفراد الأسرة");
    if (hasViolation && pay) return "violation_pay";
    if (hasViolation && show) return "violation_show";
    if (hasViolation && extension) return "violation_extension";
    if (hasViolation && objection) return "violation_objection";
    if (license) return "license_renewal";
    if (idRenew) return "id_renewal";
    if (idReplace) return "id_replacement";
    if (idFamily) return "id_family_issue";
    return null;
  };

  const startViolationSelect = (
    scenario: string,
    filter: (v: ViolationOption) => boolean
  ) => {
    const options = demoViolations.filter(filter);
    appendMessage({
      role: "assistant",
      type: "options",
      prompt:
        scenario === "violation_pay"
          ? "اختر مخالفة لسدادها"
          : "اختر مخالفة لعرض التفاصيل",
      scenario,
      options: options.length
        ? options
        : [{ violation_number: null, description: "لا توجد مخالفات" }],
    });
  };

  const handlePaymentFlow = (fee: number, context: any) => {
    if (walletBalance < fee) {
      appendMessage({
        role: "assistant",
        type: "add_balance",
        needed: fee - walletBalance,
        context,
      });
    } else {
      setWalletBalance((b) => b - fee);
      appendMessage({
        role: "assistant",
        type: "summary",
        content: `تم الدفع بنجاح. المتبقي في المحفظة ${
          walletBalance - fee
        } ريال.`,
      });
    }
  };

  const handleOptionSelect = (scenario: string, option: any) => {
    switch (scenario) {
      case "violation_pay": {
        const fee = option.amount || 0;
        appendMessage({
          role: "assistant",
          type: "payment",
          fee,
          context: { violation: option, scenario },
          label: `سداد المخالفة ${option.violation_number}`,
        });
        break;
      }
      case "violation_show": {
        appendMessage({
          role: "assistant",
          type: "summary",
          content: `تفاصيل المخالفة ${option.violation_number}: المدينة ${
            option.city ?? "-"
          }، المبلغ ${option.amount ?? 0}، الحالة ${option.status ?? "-"}. ${
            option.description ?? ""
          }`,
        });
        if (option.status === "unpaid") {
          appendMessage({
            role: "assistant",
            type: "payment",
            fee: option.amount || 0,
            context: { violation: option, scenario: "violation_pay" },
            label: `سداد المخالفة ${option.violation_number}`,
          });
        }
        break;
      }
      case "violation_extension": {
        appendMessage({
          role: "assistant",
          type: "summary",
          content: `تم قبول طلب تمديد مهلة المخالفة ${option.violation_number}.`,
        });
        break;
      }
      case "violation_objection": {
        const reasons = ["الصورة غير واضحة", "المخالفة مسددة", "سبب آخر"];
        appendMessage({
          role: "assistant",
          type: "options",
          prompt: `اختر سبب الاعتراض على المخالفة ${option.violation_number}`,
          scenario: "violation_objection_reason",
          options: reasons,
        });
        break;
      }
      case "violation_objection_reason": {
        appendMessage({
          role: "assistant",
          type: "summary",
          content: `تم تقديم الاعتراض. السبب: ${option}`,
        });
        break;
      }
      case "license_renewal": {
        const fee = option.fee || 0;
        appendMessage({
          role: "assistant",
          type: "payment",
          fee,
          context: { scenario, option },
          label: `تجديد الرخصة لمدة ${option.label}`,
        });
        break;
      }
      case "id_renewal":
      case "id_replacement":
      case "id_family_issue": {
        appendMessage({
          role: "assistant",
          type: "payment",
          fee: 100,
          context: { scenario },
          label: "رسوم الخدمة 100 ريال",
        });
        break;
      }
      default:
        break;
    }
  };

  const handleAddBalance = (amount: number, context: any) => {
    setWalletBalance((b) => b + amount);
    appendMessage({
      role: "assistant",
      type: "summary",
      content: `تم شحن رصيدك. الرصيد الحالي ${walletBalance + amount} ريال.`,
    });
    if (context?.violation || context?.scenario) {
      appendMessage({
        role: "assistant",
        type: "payment",
        fee: context?.violation?.amount || context?.fee || 0,
        context,
        label: context?.label || "إتمام الدفع",
      });
    }
  };

  const handlePay = (fee: number, context: any) => {
    handlePaymentFlow(fee, context);
  };

  const startScenario = (scenario: string) => {
    switch (scenario) {
      case "violation_pay":
        startViolationSelect(scenario, (v) => v.status === "unpaid");
        break;
      case "violation_show":
        startViolationSelect(scenario, () => true);
        break;
      case "violation_extension":
        startViolationSelect(scenario, (v) => v.status === "unpaid");
        break;
      case "violation_objection":
        startViolationSelect(scenario, () => true);
        break;
      case "license_renewal": {
        const durations = [
          { label: "سنتين", fee: 75 },
          { label: "5 سنوات", fee: 200 },
          { label: "10 سنوات", fee: 400 },
        ];
        appendMessage({
          role: "assistant",
          type: "options",
          prompt: "اختر مدة تجديد الرخصة",
          scenario,
          options: durations,
        });
        break;
      }
      case "id_renewal":
        appendMessage({
          role: "assistant",
          type: "summary",
          content: "التحقق: متاح للتجديد.",
        });
        handleOptionSelect(scenario, {});
        break;
      case "id_replacement":
        appendMessage({
          role: "assistant",
          type: "form",
          title: "بيانات البلاغ",
          scenario: "id_replacement_form",
          fields: [
            { key: "loss_date", label: "تاريخ الفقد/التلف", type: "date" },
            {
              key: "country",
              label: "الدولة",
              type: "select",
              options: ["السعودية", "دولة أخرى"],
            },
            {
              key: "city",
              label: "المدينة",
              type: "select",
              options: ["الرياض", "جدة", "مكة", "الدمام"],
            },
          ],
        });
        break;
      case "id_family_issue":
        appendMessage({
          role: "assistant",
          type: "summary",
          content: "التحقق: البيانات جاهزة.",
        });
        handleOptionSelect(scenario, {});
        break;
      default:
        break;
    }
  };

  const stepChips = useMemo(() => {
    if (!steps?.length) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {steps.map((s: any, idx: number) => (
          <span
            key={idx}
            className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs"
          >
            {Object.keys(s)[0]}
          </span>
        ))}
      </div>
    );
  }, [steps]);

  const renderOptions = (opts: any) => {
    if (!opts) return null;
    if (Array.isArray(opts)) {
      return (
        <div className="flex flex-wrap gap-2 mt-3">
          {opts.map((o, idx) => (
            <button
              key={idx}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:border-green-500 transition"
              onClick={() => handleInterruptSubmit(o)}
            >
              {typeof o === "object" ? JSON.stringify(o) : String(o)}
            </button>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderInterruptCard = () => {
    if (!interrupt?.ask) return null;
    const fieldType = interrupt.field_type || "text";
    if (fieldType === "enum" || fieldType === "select") {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-gray-800 font-semibold mb-2">{interrupt.ask}</p>
          {renderOptions(interrupt.options)}
        </div>
      );
    }
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="text-gray-800 font-semibold mb-3">{interrupt.ask}</p>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
            placeholder="اكتب إجابتك هنا"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleInterruptSubmit((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-xl"
            onClick={(e) => {
              const val = (e.currentTarget.previousSibling as HTMLInputElement)
                ?.value;
              handleInterruptSubmit(val);
              (e.currentTarget.previousSibling as HTMLInputElement).value = "";
            }}
          >
            إرسال
          </button>
        </div>
      </div>
    );
  };

  const MessageBubble = ({ msg }: { msg: ChatMessage }) => {
    // Options card
    if (msg.type === "options") {
      return (
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">🤖</span>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
              <p className="text-gray-800 font-semibold mb-3">{msg.prompt}</p>
              <div className="space-y-2">
                {msg.options.map((o, idx) => (
                  <button
                    key={idx}
                    className="w-full text-right px-4 py-3 rounded-xl border border-gray-200 hover:border-green-500 transition flex flex-col"
                    onClick={() => handleOptionSelect(msg.scenario, o)}
                  >
                    {typeof o === "object" ? (
                      <>
                        {"violation_number" in o && (
                          <span className="font-semibold text-emerald-700">
                            مخالفة رقم: {o.violation_number ?? "غير متاحة"}
                          </span>
                        )}
                        {"city" in o && (
                          <span className="text-sm text-gray-600">
                            المدينة: {o.city ?? "-"} | المبلغ: {o.amount ?? 0} |
                            الحالة: {o.status ?? "-"}
                          </span>
                        )}
                        {"description" in o && (
                          <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {o.description}
                          </span>
                        )}
                        {"label" in o && (
                          <span className="font-semibold text-emerald-700">
                            {o.label} - الرسوم {o.fee ?? 0} ريال
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-700">{String(o)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Payment card
    if (msg.type === "payment") {
      return (
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">🤖</span>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-800 font-semibold">
                  {msg.label ?? "بطاقة الدفع"}
                </p>
                <span className="text-emerald-700 font-bold">
                  {msg.fee} ريال
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                الرصيد الحالي: {walletBalance} ريال.
              </p>
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow hover:shadow-md transition"
                  onClick={() => handlePay(msg.fee, msg.context)}
                >
                  ادفع الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Add balance card
    if (msg.type === "add_balance") {
      const amounts = [100, 200, 500];
      return (
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">🤖</span>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-amber-200">
              <p className="text-gray-800 font-semibold mb-2">
                الرصيد غير كافٍ. تحتاج إلى {msg.needed} ريال إضافية.
              </p>
              <div className="flex gap-2 flex-wrap">
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    className="px-4 py-2 rounded-xl border border-gray-200 hover:border-green-500"
                    onClick={() => handleAddBalance(amt, msg.context)}
                  >
                    اشحن {amt} ريال
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Summary / text fallback
    const isAssistant = msg.role === "assistant";
    return (
      <div className={`flex gap-3 ${isAssistant ? "" : "justify-end"}`}>
        {isAssistant && (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">🤖</span>
          </div>
        )}
        <div
          className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-sm ${
            isAssistant
              ? "bg-white rounded-tr-none"
              : "bg-green-600 text-white rounded-tl-none"
          }`}
        >
          <p className="leading-relaxed text-sm">{(msg as any).content}</p>
        </div>
        {!isAssistant && (
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-700 text-sm">👤</span>
          </div>
        )}
      </div>
    );
  };

  const LoginView = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-xl max-w-4xl w-full grid lg:grid-cols-2">
        <div className="bg-gradient-to-br from-green-700 to-emerald-600 text-white rounded-3xl lg:rounded-r-none p-10 flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
              <img
                src="/portal/individuals/assets/images/logo.svg"
                className="w-12 h-12"
                alt="Absher"
              />
            </div>
            <h1 className="text-3xl font-bold mb-3">أبشر - تسجيل الدخول</h1>
            <p className="text-emerald-100 text-sm leading-relaxed">
              أدخل بيانات الهوية والرمز السري للوصول إلى لوحة التحكم والمساعد
              الذكي.
            </p>
          </div>
          <div className="text-emerald-100 text-sm space-y-1">
            <p>هوية تجريبية: 1111</p>
            <p>رمز سري: 123456</p>
          </div>
        </div>
        <form className="p-10 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-gray-700 font-semibold">رقم الهوية</label>
            <input
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right focus:border-green-600 outline-none"
              placeholder="أدخل رقم الهوية"
            />
          </div>
          <div className="space-y-2">
            <label className="text-gray-700 font-semibold">الرمز السري</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              type="password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right focus:border-green-600 outline-none"
              placeholder="أدخل الرمز السري"
            />
          </div>
          {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
          <button
            type="submit"
            disabled={loadingLogin}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition disabled:opacity-60"
          >
            {loadingLogin ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );

  const DashboardHeader = (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-8 h-8 bg-green-600 rounded-full"></div>
          <div className="flex flex-col items-end">
            <div className="text-xs text-gray-500">VISION</div>
            <div className="text-2xl font-bold text-gray-800">2030</div>
            <div className="text-xs text-gray-600">
              المملكة العربية السعودية
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
              <img
                src="/portal/individuals/assets/images/personal_photo.png"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        <nav className="flex-1 flex items-center justify-center gap-4 mx-8">
          {[
            { label: "لوحة المعلومات" },
            { label: "تعديل معلومات المستخدم" },
            { label: "الاشعارات" },
            { label: "دليل الخدمات" },
            { label: "English" },
            { label: "تسجيل الخروج", onClick: handleLogout },
          ].map((item, idx) => (
            <button
              key={idx}
              className="flex flex-col items-center gap-1 px-4 py-2 border-r border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-50 rounded text-left"
              onClick={item.onClick}
            >
              <span className="text-xs text-gray-700 text-center font-medium">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center overflow-hidden">
            <img
              src="/portal/individuals/assets/images/logo.svg"
              alt="Logo"
              className="w-full h-full p-2 object-contain bg-white"
            />
          </div>
        </div>
      </div>
    </header>
  );

  const DashboardMain = (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
      <div className="w-full lg:w-64 space-y-3">
        {[
          { icon: "zap", label: "الخدمات الإلكترونية", active: true },
          { icon: "eye", label: "التقاويض" },
          { icon: "help-circle", label: "استبيانات أبشر" },
          { icon: "dollar-sign", label: "المدفوعات الحكومية" },
        ].map((item, idx) => (
          <button
            key={idx}
            className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg border-r-4 transition-all ${
              item.active
                ? "bg-green-50 border-r-green-600"
                : "bg-gray-50 border-r-gray-300 hover:bg-gray-100"
            }`}
          >
            <span className="w-5 h-5 text-green-600">•</span>
            <span className="font-medium text-sm text-gray-700">
              {item.label}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-green-600 font-bold text-lg">بحث</div>
            <input
              type="text"
              placeholder="اكتب هنا للبحث"
              className="flex-1 outline-none text-sm text-gray-600 placeholder:text-gray-400 text-right"
            />
            <span className="w-5 h-5 text-gray-400">‹</span>
          </div>
        </div>
        <div className="space-y-12">
          <div className="grid grid-cols-5 gap-6">
            {staticServices.map((svc, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm p-6 text-center h-full flex flex-col justify-between items-center transition-transform hover:-translate-y-1 border border-gray-100 cursor-pointer"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 mx-auto">
                  <span className="text-4xl">{svc.icon}</span>
                </div>
                <div className="w-full mt-auto">
                  <div className="bg-green-700 text-white py-3 px-4 rounded-lg font-bold w-full text-sm">
                    {svc.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center items-center gap-4 mt-4">
                <div className="w-32 h-px bg-gray-300"></div>
                <h2 className="text-xl font-bold text-gray-500 bg-white px-4 z-10 relative">
                  خدمات أخرى
                </h2>
                <div className="w-32 h-px bg-gray-300"></div>
              </div>
            </div>
            <div className="flex items-center gap-4 px-8 relative">
              <button className="p-2 hover:bg-gray-100 rounded absolute left-0 z-10">
                <span className="w-8 h-8 text-green-600 font-bold">‹</span>
              </button>
              <div className="flex-1 flex gap-4 overflow-hidden justify-center">
                {[
                  { icon: "✈️", text: "إيقاف الخدمات وقيود السفر" },
                  { icon: "📊", text: "مزاد اللوحات الإلكتروني" },
                  { icon: "🤝", text: "مبايعة المركبات" },
                  { icon: "📋", text: "تقارير أبشر", badge: "جديد" },
                  { icon: "📋", text: "إصدار شهادة خلو سوابق", badge: "جديد" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center gap-4 relative min-w-[180px] max-w-[220px] shadow-sm"
                  >
                    {item.badge && (
                      <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-[10px] font-bold transform translate-x-2 -translate-y-2 shadow-md z-10">
                        {item.badge}
                      </div>
                    )}
                    <span className="text-4xl text-green-600">{item.icon}</span>
                    <p className="text-sm font-semibold text-gray-500 text-center">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
              <button className="p-2 hover:bg-gray-100 rounded absolute right-0 z-10">
                <span className="w-8 h-8 text-green-600 font-bold">›</span>
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button className="w-3 h-3 rounded-full bg-green-600"></button>
              <button className="w-3 h-3 rounded-full bg-gray-300"></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ChatModal = (
    <div
      className={`${
        chatOpen ? "flex" : "hidden"
      } fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] items-center justify-center p-4`}
    >
      <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">🤖</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                عون - المساعد الذكي
              </h3>
              <p className="text-emerald-100 text-sm">متصل • جاهز للمساعدة</p>
            </div>
          </div>
          <button
            onClick={closeChat}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-full transition-all flex items-center gap-2"
          >
            ✕
          </button>
        </div>
        <div className="relative flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {!messages.length && (
              <>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-2xl rounded-tr-none px-5 py-3 shadow-sm">
                      <p className="text-gray-800 leading-relaxed">
                        مرحباً! أنا عون، مساعدك الذكي في خدمات أبشر 👋
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 inline-block">
                      الآن
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-2xl rounded-tr-none px-5 py-3 shadow-sm">
                      <p className="text-gray-800 leading-relaxed">
                        أستطيع مساعدتك في الخدمات، المخالفات، الحوادث، وتجديد
                        الوثائق.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <p className="text-gray-500 text-sm">
                      أو اختر من الاقتراحات:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestionChips.map((c) => (
                        <button
                          key={c}
                          onClick={() => sendMessage(c)}
                          className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-gray-100 transition-all shadow-sm"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
            {messages.map((m, idx) => (
              <MessageBubble key={idx} msg={m} />
            ))}
            {stepChips}
            {interrupt && renderInterruptCard()}
            {!effectiveToken && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm">
                الرجاء تسجيل الدخول لبدء المحادثة.
              </div>
            )}
            {chatError && (
              <div className="text-red-600 text-sm">{chatError}</div>
            )}
          </div>
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="اكتب رسالتك هنا..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage(input);
                }}
                className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 text-gray-700 text-right"
                dir="rtl"
                disabled={!effectiveToken}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={pending || !effectiveToken}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full shadow hover:shadow-lg transition disabled:opacity-60"
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DashboardView = (
    <div className="bg-gray-50 min-h-screen">
      {DashboardHeader}
      {DashboardMain}
      <button
        onClick={openChat}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 flex items-center gap-3 z-50 animate-pulse hover:animate-none group"
      >
        <span className="text-lg font-bold">عون - المساعد الذكي</span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
      </button>
      {ChatModal}
    </div>
  );

  return view === "login" ? LoginView : DashboardView;
}
