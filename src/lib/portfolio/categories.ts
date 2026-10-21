/** Shared category values for portfolio content and a future admin editor. */
export const portfolioServices = ['Websites', 'Marketing', 'Content & Creative'] as const;
export type PortfolioService = (typeof portfolioServices)[number];
