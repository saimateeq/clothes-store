import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { useSendChatMessageMutation } from "../../features/ai/aiApi";
import { normalizeProducts } from "../../features/products/productAdapter";
import { resizeImage } from "../../utils/imageUrl";

const GREETING = {
  role: "assistant",
  content:
    "Hi! I'm the VELORA shopping assistant. Ask me to find something, compare items, or build an outfit — I'll search our real collection for you.",
  products: [],
};

function ChatProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="flex w-32 shrink-0 flex-col gap-1.5 border border-line p-2 transition-colors hover:border-ink"
    >
      <div className="aspect-[3/4] overflow-hidden bg-line">
        <img src={resizeImage(product.images[0], 200)} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <span className="line-clamp-1 text-xs">{product.name}</span>
      <span className="price text-xs text-accent">${product.price}</span>
    </Link>
  );
}

export default function ShoppingAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sendMessage, { isLoading }] = useSendChatMessageMutation();
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    const nextMessages = [...messages, { role: "user", content: text, products: [] }];
    setMessages(nextMessages);

    try {
      const history = nextMessages
        .slice(0, -1)
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await sendMessage({ message: text, history }).unwrap();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply, products: normalizeProducts(res.data.products) },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err?.data?.message || "The shopping assistant is temporarily unavailable. Please try again.",
          products: [],
          isError: true,
        },
      ]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close shopping assistant" : "Open shopping assistant"}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-bg shadow-lg transition-opacity hover:opacity-85"
      >
        {open ? <X size={20} strokeWidth={1.5} /> : <Sparkles size={20} strokeWidth={1.5} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-5 z-40 flex h-[70vh] max-h-[560px] w-[92vw] max-w-sm flex-col border border-line bg-bg shadow-xl"
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-4">
              <Sparkles size={14} strokeWidth={1.5} className="text-accent" />
              <span className="label">Shopping Assistant</span>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-5">
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}>
                    <p
                      className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                        m.role === "user" ? "bg-ink text-bg" : m.isError ? "border border-accent text-accent" : "border border-line"
                      }`}
                    >
                      {m.content}
                    </p>
                    {m.products?.length > 0 && (
                      <div className="flex w-full gap-2 overflow-x-auto pb-1">
                        {m.products.map((p) => (
                          <ChatProductCard key={p._id} product={p} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start">
                    <p className="border border-line px-3 py-2 text-sm text-muted">Thinking…</p>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, sizes, styles…"
                className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center bg-ink text-bg transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                <Send size={14} strokeWidth={1.5} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
