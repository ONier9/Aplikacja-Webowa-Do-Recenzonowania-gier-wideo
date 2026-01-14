'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateProfile() {
  revalidatePath('/profile/[username]', 'page');
}

export async function revalidateGame(gameId?: string) {
  if (gameId) {
    revalidatePath(`/game/${gameId}`);
  } else {
    revalidatePath('/game/[id]', 'page');
  }
}

export async function revalidateCollection(collectionId?: string) {
  if (collectionId) {
    revalidatePath(`/collection/${collectionId}`, 'page');
  } else {
    revalidatePath('/collection/[id]', 'page');
  }
}

export  async function revalidateCollectionsList() {
  revalidatePath('/collections', 'page');
}

export async function revalidateAdmin() {
  revalidatePath('/admin', 'page');
}

export async function revalidateAllGamePaths(gameId?: string) {
  revalidateProfile();
  revalidateGame(gameId);
}