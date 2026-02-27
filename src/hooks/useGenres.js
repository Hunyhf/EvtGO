import { useState, useEffect, useCallback, useMemo } from 'react';
import { genresApi } from '@apis/genresApi';

export const useGenres = (autoFetch = true, initialParams = {}) => {
    const [genres, setGenres] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const memoizedParams = useMemo(
        () => initialParams,
        [JSON.stringify(initialParams)]
    );

    const fetchGenres = useCallback(
        async (params = memoizedParams) => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await genresApi.getAll(params);
                const rawData =
                    res?.result ||
                    res?.data ||
                    res?.content ||
                    (Array.isArray(res) ? res : []);

                setGenres(rawData);
                return rawData;
            } catch (err) {
                console.error('>>> [useGenres] Error:', err);
                setError(err);
                return [];
            } finally {
                setIsLoading(false);
            }
        },
        [memoizedParams]
    );

    useEffect(() => {
        if (autoFetch) {
            fetchGenres();
        }
    }, [autoFetch, fetchGenres]);

    return { genres, isLoading, error, fetchGenres };
};

export default useGenres;
