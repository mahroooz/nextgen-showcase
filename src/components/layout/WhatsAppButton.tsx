import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const phone = "15551234567";
  const text = encodeURIComponent("Hi NextGen Digital — I'd like to discuss a project.");
  return (
    <a
      href={`https://wa.me/${phone}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:scale-105 active:scale-95 transition-transform"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-50 animate-ping" aria-hidden />
    </a>
  );
}
