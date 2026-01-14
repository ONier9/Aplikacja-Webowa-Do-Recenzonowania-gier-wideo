export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface TimestampFields {
  created_at: string;
  updated_at: string;
}