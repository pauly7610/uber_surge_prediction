/**
 * Responsive design utilities
 */

// Breakpoints (in pixels)
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// Media query strings for use with baseui's useStyletron
export const mediaQueries = {
  xs: `@media screen and (min-width: ${breakpoints.xs}px)`,
  sm: `@media screen and (min-width: ${breakpoints.sm}px)`,
  md: `@media screen and (min-width: ${breakpoints.md}px)`,
  lg: `@media screen and (min-width: ${breakpoints.lg}px)`,
  xl: `@media screen and (min-width: ${breakpoints.xl}px)`,
  
  xsOnly: `@media screen and (max-width: ${breakpoints.sm - 1}px)`,
  smOnly: `@media screen and (min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`,
  mdOnly: `@media screen and (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  lgOnly: `@media screen and (min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`,
  xlOnly: `@media screen and (min-width: ${breakpoints.xl}px)`,
};

// Helper function to create responsive styles
export const createResponsiveStyles = (
  property: string,
  values: { xs?: string | number; sm?: string | number; md?: string | number; lg?: string | number; xl?: string | number }
) => {
  const styles: Record<string, any> = {};
  
  if (values.xs !== undefined) {
    styles[property] = values.xs;
  }
  
  if (values.sm !== undefined) {
    styles[mediaQueries.sm] = { [property]: values.sm };
  }
  
  if (values.md !== undefined) {
    styles[mediaQueries.md] = { [property]: values.md };
  }
  
  if (values.lg !== undefined) {
    styles[mediaQueries.lg] = { [property]: values.lg };
  }
  
  if (values.xl !== undefined) {
    styles[mediaQueries.xl] = { [property]: values.xl };
  }
  
  return styles;
};

// Helper for responsive font sizes
export const responsiveFontSize = (
  { xs, sm, md, lg, xl }: { xs?: string | number; sm?: string | number; md?: string | number; lg?: string | number; xl?: string | number }
) => createResponsiveStyles('fontSize', { xs, sm, md, lg, xl });

// Helper for responsive margins
export const responsiveMargin = (
  { xs, sm, md, lg, xl }: { xs?: string | number; sm?: string | number; md?: string | number; lg?: string | number; xl?: string | number }
) => createResponsiveStyles('margin', { xs, sm, md, lg, xl });

// Helper for responsive paddings
export const responsivePadding = (
  { xs, sm, md, lg, xl }: { xs?: string | number; sm?: string | number; md?: string | number; lg?: string | number; xl?: string | number }
) => createResponsiveStyles('padding', { xs, sm, md, lg, xl });

// Helper to determine if we're on a mobile device (client-side only)
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.md;
};

// Helper to determine if we're on a tablet device (client-side only)
export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
};

// Helper to determine if we're on a desktop device (client-side only)
export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.lg;
};

// Create a named object for the default export
const responsiveUtils = {
  breakpoints,
  mediaQueries,
  createResponsiveStyles,
  responsiveFontSize,
  responsiveMargin,
  responsivePadding,
  isMobile,
  isTablet,
  isDesktop,
};

export default responsiveUtils; 