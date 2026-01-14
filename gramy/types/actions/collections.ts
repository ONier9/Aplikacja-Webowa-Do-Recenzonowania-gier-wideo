export interface CollectionInput {
  name: string;
  description: string;
  isPublic?: boolean;
}

export interface CollectionUpdate {
  name?: string;
  description?: string;
  is_public?: boolean;
}