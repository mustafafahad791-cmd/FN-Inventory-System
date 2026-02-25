import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentBranch, setCurrentBranch] = useState(null);
  const [items, setItems] = useState([]);
  const [templates, setTemplates] = useState([]);

  const updateBranch = useCallback((branch) => {
    setCurrentBranch(branch);
  }, []);

  return (
    <AppContext.Provider value={{
      currentBranch,
      updateBranch,
      items,
      setItems,
      templates,
      setTemplates
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
