/**
 * Common React component props and utility types
 * Part of the FSD shared layer
 */

export interface ComponentBaseProps {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Enhanced component props interface for React components
 * Includes accessibility and testing attributes
 */
export interface ComponentProps extends ComponentBaseProps {
  id?: string;
  testId?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
}
