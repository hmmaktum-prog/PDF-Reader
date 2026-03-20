import React, { createContext, useContext, useState } from 'react';

interface ContinueContextProps {
  sharedFilePath: string | null;
  setSharedFilePath: (path: string | null) => void;
  clearState: () => void;
}

const ContinueContext = createContext<ContinueContextProps>({
  sharedFilePath: null,
  setSharedFilePath: () => {},
  clearState: () => {},
});

export const ContinueProvider = ({ children }: { children: React.ReactNode }) => {
  const [sharedFilePath, setSharedFilePath] = useState<string | null>(null);

  const clearState = () => {
    setSharedFilePath(null);
  };

  return (
    <ContinueContext.Provider value={{ sharedFilePath, setSharedFilePath, clearState }}>
      {children}
    </ContinueContext.Provider>
  );
};

export const useContinueTool = () => useContext(ContinueContext);
