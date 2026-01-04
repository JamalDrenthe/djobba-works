import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

// Type definitions
interface MicrocopyEntry {
  key: string;
  content_nl: string;
  content_en: string;
  variables?: string[];
}

interface MicrocopyCache {
  [key: string]: {
    nl: string;
    en: string;
    variables: string[];
  };
}

// Cache for microcopy
let microcopyCache: MicrocopyCache = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch microcopy from database
 */
async function fetchMicrocopy(): Promise<MicrocopyCache> {
  // Check if cache is still valid
  if (Date.now() - cacheTimestamp < CACHE_DURATION && Object.keys(microcopyCache).length > 0) {
    return microcopyCache;
  }

  try {
    const { data, error } = await supabase
      .from('microcopy')
      .select('*');

    if (error) throw error;

    // Build cache
    const newCache: MicrocopyCache = {};
    (data || []).forEach((entry: MicrocopyEntry) => {
      newCache[entry.key] = {
        nl: entry.content_nl,
        en: entry.content_en,
        variables: entry.variables || []
      };
    });

    microcopyCache = newCache;
    cacheTimestamp = Date.now();

    return microcopyCache;
  } catch (error) {
    console.error('Error fetching microcopy:', error);
    return microcopyCache;
  }
}

/**
 * Get microcopy text with variable substitution
 */
export async function getMicrocopy(
  key: string, 
  variables: Record<string, string | number> = {},
  language: 'nl' | 'en' = 'nl'
): Promise<string> {
  const cache = await fetchMicrocopy();
  const entry = cache[key];

  if (!entry) {
    console.warn(`Microcopy key "${key}" not found`);
    return `[${key}]`;
  }

  let text = language === 'nl' ? entry.nl : entry.en;

  // Substitute variables
  entry.variables.forEach(variable => {
    const value = variables[variable];
    if (value !== undefined) {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      text = text.replace(regex, String(value));
    }
  });

  return text;
}

/**
 * React hook for microcopy
 */
export function useMicrocopy(
  key: string, 
  variables: Record<string, string | number> = {},
  language: 'nl' | 'en' = 'nl'
) {
  const [text, setText] = useState<string>(`[${key}]`);
  const [loading, setLoading] = useState(true);

  // Convert variables to string for dependency array
  const variablesStr = JSON.stringify(variables);

  useEffect(() => {
    let isMounted = true;

    async function loadText() {
      try {
        const microcopyText = await getMicrocopy(key, variables, language);
        if (isMounted) {
          setText(microcopyText);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading microcopy:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadText();

    return () => {
      isMounted = false;
    };
  }, [key, variablesStr, language]);

  return { text, loading };
}

/**
 * React hook for multiple microcopy entries
 */
export function useMultipleMicrocopy(
  keys: string[],
  variables: Record<string, string | number> = {},
  language: 'nl' | 'en' = 'nl'
) {
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Convert dependencies to strings
  const keysStr = keys.join(',');
  const variablesStr = JSON.stringify(variables);

  useEffect(() => {
    let isMounted = true;

    async function loadTexts() {
      try {
        const cache = await fetchMicrocopy();
        const newTexts: Record<string, string> = {};

        keys.forEach(key => {
          const entry = cache[key];
          if (entry) {
            let text = language === 'nl' ? entry.nl : entry.en;

            // Substitute variables
            entry.variables.forEach(variable => {
              const value = variables[variable];
              if (value !== undefined) {
                const regex = new RegExp(`{{${variable}}}`, 'g');
                text = text.replace(regex, String(value));
              }
            });

            newTexts[key] = text;
          } else {
            newTexts[key] = `[${key}]`;
          }
        });

        if (isMounted) {
          setTexts(newTexts);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading multiple microcopy:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTexts();

    return () => {
      isMounted = false;
    };
  }, [keysStr, variablesStr, language, keys, variables]);

  return { texts, loading };
}

/**
 * Component to display microcopy with automatic loading
 */
export function MicrocopyText({
  key,
  variables = {},
  language = 'nl',
  className = '',
  fallback = null,
}: {
  key: string;
  variables?: Record<string, string | number>;
  language?: 'nl' | 'en';
  className?: string;
  fallback?: React.ReactNode;
}) {
  const { text, loading } = useMicrocopy(key, variables, language);

  if (loading) {
    return fallback ? React.createElement('span', null, fallback) : React.createElement('span', { className }, 'Laden...');
  }

  if (text.startsWith('[') && text.endsWith(']')) {
    return fallback ? React.createElement('span', null, fallback) : React.createElement('span', { className }, text);
  }

  return React.createElement('span', { className }, text);
}

/**
 * Component to display microcopy with loading state
 */
export function MicrocopyTextWithLoading({
  key,
  variables = {},
  language = 'nl',
  className = '',
  loadingComponent = null,
}: {
  key: string;
  variables?: Record<string, string | number>;
  language?: 'nl' | 'en';
  className?: string;
  loadingComponent?: React.ReactNode;
}) {
  const { text, loading } = useMicrocopy(key, variables, language);

  if (loading) {
    return loadingComponent ? React.createElement('span', null, loadingComponent) : React.createElement('span', { className }, 'Laden...');
  }

  return React.createElement('span', { className }, text);
}

/**
 * Utility function to format currency in microcopy
 */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Utility function to format dates in microcopy
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Clear microcopy cache (useful for testing or force refresh)
 */
export function clearMicrocopyCache(): void {
  microcopyCache = {};
  cacheTimestamp = 0;
}

// Export cache for testing purposes
export { microcopyCache };