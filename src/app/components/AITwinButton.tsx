"use client";

type Props = {
  label?: string;
};

export default function AITwinButton({ label = "Meet AI Twins" }: Props) {
  return (
    <button
      className="relative group border-2 border-white text-white px-12 py-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-700 hover:from-purple-700 hover:to-pink-500 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 shadow-xl"
      onClick={() => window?.alert?.('AI Twin feature is coming soon (beta launch)!')}
      style={{ minWidth: 220 }}
    >
      <span>{label}</span>
      <span className="ml-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full animate-bounce">Beta</span>
    </button>
  );
}
