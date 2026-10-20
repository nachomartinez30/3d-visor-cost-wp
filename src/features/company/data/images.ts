/**
 * Photos from Unsplash (Unsplash License). Each URL was checked to return HTTP 200.
 * Alt texts are translated in company.json -> images.<id>.alt.
 * To replace an image, change `src` and the credit; keep the id.
 */
export interface CompanyImage {
  readonly id: 'hero' | 'farm' | 'printing';
  readonly src: string;
  readonly photographer: string;
  readonly sourceUrl: string;
}

const unsplash = (photo: string, width: number) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=70`;

export const companyImages: Record<CompanyImage['id'], CompanyImage> = {
  hero: {
    id: 'hero',
    src: unsplash('photo-1758435170505-e9b2772348c1', 1400),
    photographer: 'Jakub Żerdzicki',
    sourceUrl: 'https://unsplash.com/photos/gJ8bkUlUFkY',
  },
  farm: {
    id: 'farm',
    src: unsplash('photo-1611117775350-ac3950990985', 1000),
    photographer: 'Minku Kang',
    sourceUrl: 'https://unsplash.com/photos/aCniNTiIFd8',
  },
  printing: {
    id: 'printing',
    src: unsplash('photo-1758387836566-6a342434f5b4', 1000),
    photographer: 'Jakub Żerdzicki',
    sourceUrl: 'https://unsplash.com/photos/W_SYA5yU9p8',
  },
};
