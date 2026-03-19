import { useRef } from 'react';

export const useHorizontalScroll = (scrollRatio = 0.8) => {
    const scrollRef = useRef(null);

    const handleScroll = direction => {
        const { current } = scrollRef;
        if (!current) return;

        const scrollAmount = current.clientWidth * scrollRatio;
        const leftPos =
            direction === 'left'
                ? current.scrollLeft - scrollAmount
                : current.scrollLeft + scrollAmount;

        current.scrollTo({ left: leftPos, behavior: 'smooth' });
    };

    return { scrollRef, handleScroll };
};
