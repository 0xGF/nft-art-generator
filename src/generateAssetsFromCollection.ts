import { Config } from './types/ConfigTypes';
import { CollectionOfAttributes } from './types/CollectionTypes';
import * as fs from 'fs';
import { range } from 'lodash';
import { exportImage, exportMetadata } from './utils/assetUtils';
import { config } from './config/config';
import {
  collectionJsonFilePath,
  getImageFilePath,
  getMetadataFilePath,
  rootAssetsDirectory,
} from './paths';

async function generateAssetsFromCollection(config: Config) {
  const collection: CollectionOfAttributes = JSON.parse(
    fs.readFileSync(collectionJsonFilePath).toString()
  );
  const items = Object.values(collection);

  for (const idx of range(items.length)) {
    if (idx % 500 === 0) {
      console.log('On index', idx);
    }

    const itemAttributes = items[idx];
    const itemNumber = idx + 1;

    // Export the image
    await exportImage(
      config,
      itemAttributes,
      rootAssetsDirectory,
      getImageFilePath(itemNumber)
    );

    // Export the metadata file
    exportMetadata(
      config,
      itemAttributes,
      itemNumber,
      getMetadataFilePath(itemNumber)
    );
  }
}

generateAssetsFromCollection(config).then(() => {
  console.log('Done!');
});
