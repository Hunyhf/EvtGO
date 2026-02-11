export const ROLE_ID = {
    ADMIN: 1,
    CUSTOMER: 2,
    ORGANIZER: 3,
    STAFF: 4
};

export const ROLE_REDIRECT_MAP = {
    [ROLE_ID.ADMIN]: '/admin',
    [ROLE_ID.CUSTOMER]: '/',
    [ROLE_ID.ORGANIZER]: '/organizer',
    [ROLE_ID.STAFF]: '/staff'
};
