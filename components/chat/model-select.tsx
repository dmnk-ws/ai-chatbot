import { Check, ChevronDown, Layers } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { useModel } from "@/contexts/ModelContext";
import { models } from "@/lib/ai/models";

function ModelSelect() {
  const { selectedModel, setSelectedModel } = useModel();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleChange = (modelId: string) => {
    setSelectedModel(modelId);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 h-8 px-2 rounded-lg bg-background ${!isOpen && "hover:bg-gray-100 cursor-pointer"}`}
      >
        <Layers className="w-4 h-4 text-black" />
        <span className="text-xs font-medium">{selectedModel}</span>
        <ChevronDown
          className={`w-4 h-4 text-black transition-transform duration-100 ${isOpen && "rotate-180"}`}
        />
      </button>
      {isOpen && (
        <div className="absolute bottom-full mb-1 min-w-[200px] bg-white border border-gray-300 rounded-lg shadow-lg p-1 z-50">
          {models.map((m) => (
            <button
              key={m.model}
              type="button"
              onClick={() => {
                handleChange(m.model);
                setIsOpen(false);
              }}
              className="w-full px-2 py-1 text-left hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <div className="grid grid-cols-[16px_1fr] gap-2 items-center">
                <div className="w-4 h-4">
                  {m.model === selectedModel && (
                    <Check className="w-4 h-4 text-black" />
                  )}
                </div>
                <span className="text-xs">{m.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ModelSelect;
