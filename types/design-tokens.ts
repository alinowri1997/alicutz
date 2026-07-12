export type DesignTokenCategory =
  | "colors"
  | "typography"
  | "spacing"
  | "radius"
  | "shadow"
  | "motion"
  | "breakpoints"
  | "containers"
  | "buttons"
  | "cards";

export interface TypographyScale {
  display: string;
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  h5: string;
  h6: string;
  body: string;
  small: string;
  caption: string;
}

export interface DesignTokens {
  colors: Record<string, string>;
  typography: TypographyScale;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
  motion: Record<string, string>;
  breakpoints: Record<string, string>;
  containers: Record<string, string>;
  buttons: Record<string, string>;
  cards: Record<string, string>;
}
