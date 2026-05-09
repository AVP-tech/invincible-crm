"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, GripHorizontal, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Position = {
  top: number;
  left: number;
};

const STORAGE_KEY = "invincible-captain-hook-position-v2";
const DRAG_HINT_STORAGE_KEY = "invincible-captain-hook-drag-hint-dismissed-v1";
const VIEWPORT_MARGIN = 16;
const MINIMIZED_SIZE = 56;
const DRAG_THRESHOLD = 6;

function clampPosition(position: Position, width: number, height: number): Position {
  const vpWidth = typeof window !== "undefined" ? (window.visualViewport?.width ?? window.innerWidth) : 1024;
  const vpHeight = typeof window !== "undefined" ? (window.visualViewport?.height ?? window.innerHeight) : 800;

  const maxLeft = Math.max(VIEWPORT_MARGIN, vpWidth - width - VIEWPORT_MARGIN);
  const maxTop = Math.max(VIEWPORT_MARGIN, vpHeight - height - VIEWPORT_MARGIN);

  return {
    top: Math.min(Math.max(VIEWPORT_MARGIN, position.top), maxTop),
    left: Math.min(Math.max(VIEWPORT_MARGIN, position.left), maxLeft),
  };
}

function getDefaultPosition(): Position {
  if (typeof window === "undefined") return { top: 100, left: 100 };
  const vpWidth = window.visualViewport?.width ?? window.innerWidth;
  const vpHeight = window.visualViewport?.height ?? window.innerHeight;
  const isDesktop = vpWidth >= 1024;
  const left = isDesktop
    ? VIEWPORT_MARGIN + 24
    : Math.max(VIEWPORT_MARGIN, vpWidth - MINIMIZED_SIZE - 28);
  const top = Math.max(
    isDesktop ? 96 : 88,
    vpHeight - MINIMIZED_SIZE - (isDesktop ? 112 : 124)
  );

  return { top, left };
}

export function CaptainBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ahoy there, matey! I'm Captain Hook. How can I help you navigate your CRM today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [showDragHint, setShowDragHint] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 1024, height: 800 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    offsetX: number;
    offsetY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Position;
        setPosition(clampPosition(parsed, MINIMIZED_SIZE, MINIMIZED_SIZE));
        return;
      }
    } catch {
      // Ignore invalid local storage state and fall back to a safe default.
    }

    setPosition(getDefaultPosition());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setShowDragHint(window.localStorage.getItem(DRAG_HINT_STORAGE_KEY) !== "true");
  }, []);

  useEffect(() => {
    if (!position || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(DRAG_HINT_STORAGE_KEY, showDragHint ? "false" : "true");
  }, [showDragHint]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const syncWithinViewport = useCallback(() => {
    setPosition((current) => {
      if (!current) {
        return current;
      }

      const width = widgetRef.current?.offsetWidth ?? MINIMIZED_SIZE;
      const height = widgetRef.current?.offsetHeight ?? MINIMIZED_SIZE;
      const next = clampPosition(current, width, height);

      if (next.top === current.top && next.left === current.left) {
        return current;
      }

      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setViewportSize({
      width: window.visualViewport?.width ?? window.innerWidth,
      height: window.visualViewport?.height ?? window.innerHeight,
    });
  }, []);

  useEffect(() => {
    if (!position) return;
    syncWithinViewport();
  }, [isOpen, syncWithinViewport]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setViewportSize({
        width: window.visualViewport?.width ?? window.innerWidth,
        height: window.visualViewport?.height ?? window.innerHeight,
      });
      syncWithinViewport();
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, [syncWithinViewport]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!dragStateRef.current || !widgetRef.current) {
      return;
    }

    if (!dragStateRef.current.moved) {
      const distance = Math.hypot(
        event.clientX - dragStateRef.current.originX,
        event.clientY - dragStateRef.current.originY
      );
      dragStateRef.current.moved = distance >= DRAG_THRESHOLD;
    }

    if (!dragStateRef.current.moved) {
      return;
    }

    const next = clampPosition(
      {
        left: event.clientX - dragStateRef.current.offsetX,
        top: event.clientY - dragStateRef.current.offsetY,
      },
      widgetRef.current.offsetWidth || MINIMIZED_SIZE,
      widgetRef.current.offsetHeight || MINIMIZED_SIZE
    );

    setPosition(next);
  }, []);

  const stopDragging = useCallback(() => {
    dragStateRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDragging);
  }, [handlePointerMove]);

  const beginDragging = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!widgetRef.current) {
        return;
      }

      const rect = widgetRef.current.getBoundingClientRect();
      dragStateRef.current = {
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        originX: event.clientX,
        originY: event.clientY,
        moved: false,
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stopDragging);
    },
    [handlePointerMove, stopDragging]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, [handlePointerMove, stopDragging]);

  const dismissDragHint = useCallback(() => {
    setShowDragHint(false);
  }, []);

  const beginLauncherInteraction = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      beginDragging(event);
    },
    [beginDragging]
  );

  const completeLauncherInteraction = useCallback(() => {
    const wasDragged = Boolean(dragStateRef.current?.moved);
    const shouldOpen = dragStateRef.current && !dragStateRef.current.moved;
    stopDragging();

    if (wasDragged) {
      dismissDragHint();
    }

    if (shouldOpen) {
      dismissDragHint();
      setIsOpen(true);
    }
  }, [dismissDragHint, stopDragging]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/captain/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json().catch(() => null);
      const reply = typeof data?.reply === "string" ? data.reply.trim() : "";

      if (!res.ok || !reply) {
        throw new Error("Captain Hook reply failed");
      }

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Argh! The comms are down. Try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!position) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[10000]">
      <div
        ref={widgetRef}
        className="pointer-events-auto absolute"
        style={{ top: position.top, left: position.left }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="captain-open"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              style={{
                maxHeight: Math.max(200, viewportSize.height - VIEWPORT_MARGIN * 2),
                maxWidth: Math.max(200, viewportSize.width - VIEWPORT_MARGIN * 2),
              }}
              className="flex h-[36rem] w-[24rem] flex-col overflow-hidden rounded-[1.75rem] border border-gold/20 bg-[#132032]/95 shadow-[0_24px_60px_rgba(2,8,23,0.45)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gold/40">
                    <Image
                      src="/captain-bot.png"
                      alt="Captain Avatar"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <Bot className="absolute inset-0 m-auto h-6 w-6 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-white">Captain Hook</h3>
                    <p className="text-xs text-emerald-400">Always on Duty</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onPointerDown={beginDragging}
                    className="touch-none cursor-grab rounded-full p-2 text-white/55 transition-colors hover:bg-white/10 hover:text-white active:cursor-grabbing"
                    aria-label="Move Captain Hook"
                  >
                    <GripHorizontal className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Close Captain Hook chat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={"flex " + (msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={
                        "max-w-[85%] break-words rounded-2xl px-4 py-2 text-sm " +
                        (msg.role === "user"
                          ? "rounded-tr-none bg-gold text-black"
                          : "rounded-tl-none border border-white/5 bg-white/10 text-slate-200")
                      }
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-none border border-white/5 bg-white/10 px-4 py-3 text-white/50">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/10 bg-black/40 p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Captain Hook..."
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none transition focus:border-gold/50 focus:bg-white/10"
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    variant="primary"
                    className="h-10 w-10 shrink-0 rounded-xl bg-gold p-0 text-black hover:bg-gold/80"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="captain-closed"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative flex items-center"
            >
              <AnimatePresence>
                {showDragHint ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    className="pointer-events-none absolute bottom-full right-0 mb-3 w-max max-w-[11rem] rounded-2xl border border-gold/20 bg-[#132032]/95 px-3 py-2 text-left shadow-[0_18px_40px_rgba(2,8,23,0.35)] backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-gold">
                      <GripHorizontal className="h-3.5 w-3.5" />
                      <span>Drag me where you want</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-300">Tap me anytime to chat.</p>
                    <span className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-gold/20 bg-[#132032]/95" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <button
                type="button"
                onPointerDown={beginLauncherInteraction}
                onPointerUp={completeLauncherInteraction}
                onPointerCancel={stopDragging}
                className="group relative flex h-14 w-14 touch-none cursor-grab items-center justify-center rounded-full border-2 border-gold/50 bg-[#132032] shadow-[0_0_20px_rgba(230,193,106,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(230,193,106,0.45)] active:cursor-grabbing"
                aria-label="Open or move Captain Hook chat"
              >
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <Image
                    src="/captain-bot.png"
                    alt="Captain Hook"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <Bot className="h-7 w-7 text-gold drop-shadow-[0_0_5px_rgba(230,193,106,0.8)]" />

                <span className="absolute -right-1 -top-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-4 w-4 rounded-full border border-black bg-emerald-500" />
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
