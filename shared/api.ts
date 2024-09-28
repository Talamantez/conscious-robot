export interface Book {
  items: Chapter[];
}

export interface Chapter {
  // Non-empty in API request and response
  id?: string;

  // Non-empty in API response
  versionstamp?: string;

  text: string;
  imgUrl: string;
  createdAt: number;
  updatedAt: number;
}
