import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NavContextType = {
  activeId: string;
  handleNav: (id: string) => void;
};

const NavContext = createContext<NavContextType | undefined>(undefined);

export const NavProvider = ({ children }: { children: ReactNode }) => {
  const [activeId, setActiveId] = useState("dashboard");

  const handleNav = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  return (
    <NavContext.Provider value={{ activeId, handleNav }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => {
  const context = useContext(NavContext);
  if (context === undefined) {
    throw new Error('useNav must be used within a NavProvider');
  }
  return context;
};
