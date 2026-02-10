"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * A hook that persists form data in sessionStorage.
 * Data persists across dialog open/close but clears on page reload.
 * 
 * @param key - Unique key for this form's storage
 * @param initialState - Default state when no persisted data exists
 * @returns [state, setState, clearState] - Similar to useState but persisted
 */
export function usePersistedFormData<T>(
    key: string,
    initialState: T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
    // Initialize state from sessionStorage or use initialState
    const [state, setState] = useState<T>(() => {
        if (typeof window === "undefined") return initialState;

        try {
            const stored = sessionStorage.getItem(key);
            if (stored) {
                return JSON.parse(stored) as T;
            }
        } catch (e) {
            console.warn(`Failed to parse persisted form data for key: ${key}`);
        }
        return initialState;
    });

    // Persist state changes to sessionStorage
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            sessionStorage.setItem(key, JSON.stringify(state));
        } catch (e) {
            console.warn(`Failed to persist form data for key: ${key}`);
        }
    }, [key, state]);

    // Clear persisted data (call after successful form submission)
    const clearState = useCallback(() => {
        if (typeof window !== "undefined") {
            sessionStorage.removeItem(key);
        }
        setState(initialState);
    }, [key, initialState]);

    return [state, setState, clearState];
}

/**
 * Hook for persisting individual form field values
 * Useful when you have multiple separate useState calls
 * 
 * @param formKey - Unique key for the entire form
 * @param fieldName - Name of this specific field
 * @param initialValue - Default value for this field
 */
export function usePersistedField<T>(
    formKey: string,
    fieldName: string,
    initialValue: T
): [T, (value: T) => void, () => void] {
    const fullKey = `${formKey}_${fieldName}`;

    const [value, setValue] = useState<T>(() => {
        if (typeof window === "undefined") return initialValue;

        try {
            const stored = sessionStorage.getItem(fullKey);
            if (stored) {
                return JSON.parse(stored) as T;
            }
        } catch (e) {
            // Silent fail
        }
        return initialValue;
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            sessionStorage.setItem(fullKey, JSON.stringify(value));
        } catch (e) {
            // Silent fail
        }
    }, [fullKey, value]);

    const clearField = useCallback(() => {
        if (typeof window !== "undefined") {
            sessionStorage.removeItem(fullKey);
        }
        setValue(initialValue);
    }, [fullKey, initialValue]);

    return [value, setValue, clearField];
}
