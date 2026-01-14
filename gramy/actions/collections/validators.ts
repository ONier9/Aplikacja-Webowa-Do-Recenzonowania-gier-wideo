export const CollectionValidator = {
  validateCollectionInput(input: { name: string; description?: string }) {
    this.validateName(input.name);
    if (input.description) this.validateDescription(input.description);
  },

  validateName(name: string) {
    if (!name.trim()) throw new Error('Name cannot be empty');
    if (name.length > 100) throw new Error('Name too long');
  },

  validateDescription(description: string) {
    if (description.length > 500) throw new Error('Description too long');
  }
};
