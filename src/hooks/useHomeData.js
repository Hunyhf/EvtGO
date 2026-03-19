// src/hooks/useHomeData.js
import { useState, useEffect } from 'react';
import { genresApi } from '@apis/genresApi';
import { eventApi } from '@apis/eventApi';
import { EventService } from '@services/eventService';

export const useHomeData = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [genresRes, eventsRes] = await Promise.all([
                    genresApi.getAll(),
                    eventApi.getAll({
                        page: 0,
                        size: 50,
                        filter: 'isPublished:true'
                    })
                ]);

                const genres = genresRes?.result || genresRes || [];
                const allEvents =
                    eventsRes?.result?.content || eventsRes?.result || [];

                // Transform dữ liệu sử dụng Service
                const eventsWithDetails = await Promise.all(
                    allEvents.map(async event => {
                        const price = await EventService.fetchEventPrice(
                            event.id
                        );
                        return EventService.formatEvent(event, price);
                    })
                );

                // Grouping logic (vẫn giữ ở đây hoặc tách ra Utils nếu phức tạp hơn)
                const finalSections = genres.map(genre => ({
                    ...genre,
                    events: eventsWithDetails
                        .filter(e => e.genre?.id === genre.id)
                        .sort(
                            (a, b) =>
                                a.isPast - b.isPast ||
                                a.startMoment.unix() - b.startMoment.unix()
                        )
                }));

                setSections(finalSections);
            } catch (error) {
                console.error('[useHomeData] Error:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return { sections, loading };
};
