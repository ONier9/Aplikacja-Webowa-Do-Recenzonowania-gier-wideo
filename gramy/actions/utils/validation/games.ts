export class GameLogValidator {
  static validateHoursPlayed(hours: number | null | undefined): void {
    if (hours !== null && hours !== undefined) {
      if (hours < 0) {
        throw new Error('Hours played cannot be negative');
      }
      if (hours > 99999) {
        throw new Error('Hours played cannot exceed 99999');
      }
    }
  }
  
  static validatePlayCount(count: number): void {
    if (count < 1) {
      throw new Error('Play count must be at least 1');
    }
    if (count > 999) {
      throw new Error('Play count cannot exceed 999');
    }
  }
  
  static validateLogData(data: { hours_played?: number | null; play_count?: number }): void {
    if (data.hours_played !== undefined) {
      this.validateHoursPlayed(data.hours_played);
    }
    
    if (data.play_count !== undefined) {
      this.validatePlayCount(data.play_count);
    }
  }
}