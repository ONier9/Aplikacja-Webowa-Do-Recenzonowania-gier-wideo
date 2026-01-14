'use server';
import { revalidatePath } from 'next/cache';

export async function revalidateProfilePath(username?: string) {
  if (username) revalidatePath(`/profile/${username}`);
  revalidatePath('/profile/[username]', 'page');
}

export async function revalidateGamePath(gameId?: string) {
  if (gameId) revalidatePath(`/game/${gameId}`);
  revalidatePath('/game/[id]', 'page');
}

export async function revalidateCollectionPath(collectionId?: string) {
  if (collectionId) revalidatePath(`/collection/${collectionId}`);
  revalidatePath('/collection/[id]', 'page');
}

export async function revalidateCollectionsListPath() {
  revalidatePath('/collections', 'page');
}

export async function revalidateAdminPath() {
  revalidatePath('/admin', 'page');
}

export async function revalidateAllForGame(gameId: string) {
  await revalidateProfilePath();
  await revalidateGamePath(gameId);
}

export async function revalidateAllForCollection(collectionId: string) {
  await revalidateProfilePath();
  await revalidateCollectionPath(collectionId);
  await revalidateCollectionsListPath();
}
