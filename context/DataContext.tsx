import React, { createContext, useContext, useMemo } from 'react';
import { IDataProvider } from '../data/contracts';
import { LocalStorageProvider } from '../data/providers/local/LocalStorageProvider';
import { HttpApiProvider } from '../data/providers/http/HttpApiProvider';

const DataContext = createContext<IDataProvider | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const provider = useMemo(() => {
    // Determine data source from environment variables
    // In many environments, import.meta.env is used instead of process.env
    const source = (import.meta as any).env?.VITE_DATA_SOURCE || 'local';
    
    if (source === 'api') {
      return new HttpApiProvider();
    }
    
    // Default to local storage provider
    return new LocalStorageProvider();
  }, []);

  return (
    <DataContext.Provider value={provider}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};