export class CollectionValidator {
  static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Collection name is required');
    }
    
    if (name.length > 100) {
      throw new Error('Collection name must be less than 100 characters');
    }
  }
  
  static validateDescription(description?: string): void {
    if (description && description.length > 500) {
      throw new Error('Description must be less than 500 characters');
    }
  }
  
  static validateCollectionInput(input: { name: string; description?: string }): void {
    this.validateName(input.name);
    this.validateDescription(input.description);
  }
}