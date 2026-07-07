/** A passport/nationality the explorer can start from. */
export type Citizenship = {
  code: string;
  name: string;
  /** Flag emoji placeholder until a real flag asset/icon set lands. */
  flag: string | null;
};
