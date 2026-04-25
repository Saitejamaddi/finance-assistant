import { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleAuth } from './GoogleAuthContext';
import { writeAllCategories } from '../services/SheetsService';

const CategoryContext = createContext();
const DEFAULT_CATEGORIES = ['Food','Transport','Bills','Entertainment','Shopping','Health','Other'];

export const CategoryProvider = ({ children }) => {
  const { spreadsheetId, initialData, setSyncing } = useGoogleAuth();
  const [customCategories, setCustomCategories] = useState([]);

  useEffect(() => {
    if (initialData?.categories) {
      setCustomCategories(initialData.categories);
    }
  }, [initialData]);

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  const syncCategories = async (updated) => {
    if (!spreadsheetId) return;
    setSyncing(true);
    try {
      await writeAllCategories(spreadsheetId, updated);
    } finally {
      setSyncing(false);
    }
  };

  const addCategory = async (name) => {
    const trimmed = name.trim();
    if (!trimmed || allCategories.includes(trimmed)) return;
    const updated = [...customCategories, trimmed];
    setCustomCategories(updated);
    await syncCategories(updated);
  };

  const deleteCategory = async (name) => {
    if (DEFAULT_CATEGORIES.includes(name)) return;
    const updated = customCategories.filter((c) => c !== name);
    setCustomCategories(updated);
    await syncCategories(updated);
  };

  return (
    <CategoryContext.Provider value={{ allCategories, customCategories, DEFAULT_CATEGORIES, addCategory, deleteCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);