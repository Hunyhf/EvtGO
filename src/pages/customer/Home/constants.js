export const BANNER_DATA = [
    {
        id: 1,
        url: 'https://images.tkbcdn.com/2/614/350/ts/ds/99/bf/cc/3e72843901a98a50e12e855d3334b6b6.png'
    },
    {
        id: 2,
        url: 'https://images.tkbcdn.com/2/614/350/ts/ds/99/bf/cc/3e72843901a98a50e12e855d3334b6b6.png'
    },
    {
        id: 3,
        url: 'https://images.tkbcdn.com/2/614/350/ts/ds/99/bf/cc/3e72843901a98a50e12e855d3334b6b6.png'
    }
];

export const TRENDING_DATA = Array.from({ length: 10 }).map((_, index) => ({
    id: index + 1,
    url: 'https://images.tkbcdn.com/2/614/350/ts/ds/4c/33/45/0e36aee3253a98d8bbc82d8ad2462722.png',
    title: `Sự kiện âm nhạc cực hot ${index + 1}`,
    date: '10/02/2026'
}));
