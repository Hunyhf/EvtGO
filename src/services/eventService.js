import dayjs from 'dayjs';
import { getEventImageUrl } from '@utils/imageHelper';
import { ticketApi } from '@apis/ticketApi';

export const EventService = {
    /**
     * Format thông tin sự kiện cơ bản
     */
    formatEvent(event, price = 0) {
        const now = dayjs();
        const posterObj =
            event.images?.find(img => img.isCover) || event.images?.[0];
        const endEvent = dayjs(
            event.endDate
                ? `${event.endDate} ${event.endTime || '23:59:59'}`
                : event.startDate
        );
        const startMoment = dayjs(
            `${event.startDate} ${event.startTime || '00:00:00'}`
        );

        return {
            ...event,
            title: event.name,
            price,
            url: getEventImageUrl(event.id, posterObj?.url),
            isPast: now.isAfter(endEvent),
            startMoment
        };
    },

    /**
     * Fetch giá cho từng sự kiện (Logic cứu cháy từ BE)
     */
    async fetchEventPrice(eventId) {
        try {
            const res = await ticketApi.getAll({
                filter: `event.id:${eventId} and ticketType:'STANDARD'`
            });
            const tickets = res?.result || res?.content || [];
            return tickets.length > 0 ? tickets[0].price : 0;
        } catch (err) {
            return 0;
        }
    }
};
