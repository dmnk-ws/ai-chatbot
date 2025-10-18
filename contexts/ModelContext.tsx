"use client";

import React, { createContext, useContext, useState } from "react";

import { models } from "@/lib/ai/models";

interface ModelContextType {
  selectedModel: string;
  selectedProvider: string;
  setSelectedModel: (modelId: string) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [selectedModel, setSelectedModelState] = useState(models[0].model);

  const selectedProvider =
    models.find((m) => m.model === selectedModel)?.provider || "";

  const setSelectedModel = (modelId: string) => {
    setSelectedModelState(modelId);
  };

  return (
    <ModelContext.Provider
      value={{ selectedModel, selectedProvider, setSelectedModel }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);

  if (!context) throw new Error("useModel must be used within a ModelProvider");

  return context;
}
