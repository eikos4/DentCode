"use client";
import { useState, useRef } from "react";
import { X } from "lucide-react";

export function TagsInput({
  value, onChange, placeholder, suggestions = [],
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const add = (tag: string) => {
    const t = tag.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
    setShowSuggestions(false);
    ref.current?.focus();
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      add(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      remove(value.length - 1);
    }
  };

  const filtered = suggestions.filter(
    (s) => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase()),
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 border border-slate-200 rounded-lg bg-white min-h-[38px] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        {value.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium pl-2 pr-1 py-0.5 rounded-md">
            {tag}
            <button type="button" onClick={() => remove(i)} className="hover:bg-blue-100 rounded p-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={ref}
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={handleKey}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[80px] text-sm outline-none bg-transparent"
        />
      </div>
      {showSuggestions && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
          {filtered.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={() => add(s)}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 transition"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
