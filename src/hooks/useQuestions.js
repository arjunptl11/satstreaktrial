import { useState, useCallback } from 'react';
import { getFilteredQuestions } from '../services/api';

export function useQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadQuestions = useCallback(async (difficulty = null, domain = null, count = 10) => {
    setLoading(true);
    setError(null);
    try {
      const qs = await getFilteredQuestions(difficulty, domain, count);
      setQuestions(qs);
      return qs;
    } catch (err) {
      setError(err.message || 'Failed to load questions');
      setQuestions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearQuestions = useCallback(() => {
    setQuestions([]);
    setError(null);
  }, []);

  return { questions, loading, error, loadQuestions, clearQuestions };
}
