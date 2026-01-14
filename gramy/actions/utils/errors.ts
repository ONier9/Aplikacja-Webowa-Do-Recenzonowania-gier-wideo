export function handleActionError(error: unknown, defaultMessage: string) {
  console.error('Action error:', error);
  
  const message = error instanceof Error 
    ? error.message 
    : typeof error === 'string' 
      ? error 
      : defaultMessage;
      
  return {
    success: false,
    error: message
  };
}

export class ActionError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ActionError';
  }
}