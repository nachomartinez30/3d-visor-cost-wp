/** What the customer selected in the options panel. */
export interface QuoteOptions {
  readonly materialId: string;
  readonly colorId: string;
  readonly infillPercent: number;
  readonly layerHeightId: string;
}
