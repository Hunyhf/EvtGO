import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { genresApi } from '@apis/genresApi';
import { eventApi } from '@apis/eventApi';
import { ticketApi } from '@apis/ticketApi';
import { getEventImageUrl } from '@utils/imageHelper';

export const useHomeData = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const now = dayjs();

                // 1. Fetch danh sách Genre và TẤT CẢ sự kiện đang hiển thị (chỉ 2 request chính)
                const [genresRes, eventsRes] = await Promise.all([
                    genresApi.getAll(),
                    eventApi.getAll({
                        page: 0,
                        size: 50, // Lấy đủ dùng cho trang chủ
                        filter: 'isPublished:true'
                    })
                ]);

                const genres = Array.isArray(genresRes)
                    ? genresRes
                    : genresRes?.result || [];
                const allEvents =
                    eventsRes?.result?.content || eventsRes?.result || [];

                // 2. Tối ưu fetching giá vé: Chỉ fetch cho những sự kiện có trong danh sách
                // Lưu ý: Đây là cách "cứu cháy" khi BE chưa gộp giá vào Event.
                const eventsWithPrice = await Promise.all(
                    allEvents.map(async event => {
                        try {
                            const ticketRes = await ticketApi.getAll({
                                filter: `event.id:${event.id} and ticketType:'STANDARD'`
                            });
                            const tickets =
                                ticketRes?.result || ticketRes?.content || [];
                            const price =
                                tickets.length > 0 ? tickets[0].price : 0;

                            const posterObj =
                                event.images?.find(img => img.isCover) ||
                                event.images?.[0];
                            const endEvent = dayjs(
                                event.endDate
                                    ? `${event.endDate} ${event.endTime || '23:59:59'}`
                                    : event.startDate
                            );
                            const startEvent = dayjs(
                                `${event.startDate} ${event.startTime || '00:00:00'}`
                            );

                            return {
                                ...event,
                                title: event.name,
                                price,
                                url: getEventImageUrl(event.id, posterObj?.url),
                                isPast: now.isAfter(endEvent),
                                startMoment: startEvent
                            };
                        } catch (err) {
                            return { ...event, price: 0, isPast: true };
                        }
                    })
                );

                // 3. Group sự kiện vào các Genre tương ứng (Xử lý tại Client - cực nhanh)
                const finalSections = genres.map(genre => {
                    const genreEvents = eventsWithPrice
                        .filter(e => e.genre?.id === genre.id)
                        .sort((a, b) => {
                            if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
                            return !a.isPast
                                ? a.startMoment.unix() - b.startMoment.unix()
                                : b.startMoment.unix() - a.startMoment.unix();
                        });

                    return { ...genre, events: genreEvents };
                });

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
