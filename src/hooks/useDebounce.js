import { useState, useEffect } from 'react';

/**
 * Debounces a value by the given delay.
 * Returns the debounced value that only updates after `delay` ms of inactivity.
 */
const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
