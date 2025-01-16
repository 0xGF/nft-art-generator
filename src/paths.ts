import path from 'path';

/**
 * Paths for generation
 */
export const rootAssetsDirectory = path.join(__dirname, '../', 'assets');
export const rootTargetDirectory = path.join(__dirname, '../', 'target');

export const collectionJsonFilePath = path.join(
  rootTargetDirectory,
  'collection.json'
);

export const statsJsonFilePath = path.join(
  rootTargetDirectory,
  'collectionStats.json'
);

export const tokenIdToUriFilePath = path.join(
  rootTargetDirectory,
  'tokenIdToUri.json'
);

export function getImageFilePath(itemNumber: number): string {
  return path.join(
    rootTargetDirectory,
    'images',
    `${itemNumber.toFixed(0)}.png`
  );
}

export function getMetadataFilePath(itemNumber: number): string {
  return path.join(
    rootTargetDirectory,
    'metadata',
    `${itemNumber.toFixed(0)}.json`
  );
}
