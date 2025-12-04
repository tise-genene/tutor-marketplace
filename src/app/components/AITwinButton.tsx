"use client";

type Props = {
  label?: string;
};

export default function AITwinButton({ label = "Meet AI Twins" }: Props) {
  return (
    <button
      className="relative group border border-white/20 text-white px-8 py-4 rounded-lg font-semibold text-base bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
      onClick={() => window?.alert?.('AI Twin feature is coming soon (beta launch)!')}
      style={{ minWidth: 200 }}
    >
      <span>{label}</span>
      <span className="bg-slate-700 text-white text-xs px-2 py-0.5 rounded">Beta</span>
    </button>
  );
}
