import { sortBy } from 'lodash';
import { Attribute } from './types/LayerTypes';
import { Config } from './types/ConfigTypes';
import { getAllowedLayerValueIds } from './utils/generationRuleUtils';
import { arrayFilledWith, shuffleArrayInPlace } from './utils/helpers';
import * as fs from 'fs';
import sha1 from 'sha1';
import { config } from './config/config';
import {
  CollectionOfAttributes,
  CollectionStats,
} from './types/CollectionTypes';
import { collectionJsonFilePath, statsJsonFilePath } from './paths';

/**
 * Returns a unique ID associated with the applied attributes for deduplication
 * @param appliedAttributes
 */
function getItemId(appliedAttributes: Attribute[]) {
  const identifier = sortBy(appliedAttributes, (a) => a.typeId)
    .map((attr) => `${attr.typeId}|${attr.valueId}`)
    .join(',');
  return sha1(identifier);
}

/**
 * Given config, generates ONLY the attributes for the collection (no images are created)
 *
 * @param config
 */
async function generateCollectionOfAttributes(
  config: Config
): Promise<[CollectionOfAttributes, CollectionStats]> {
  // To prevent blowing up the collection size, short-circuit the generation once we hit a given collection size
  // Add a buffer to allow for dedup
  const maxGenerationSizeBeforeDeduplication = config.batchSize * 5;

  // Deal with first layer
  const [firstLayerTypeId, ...otherLayerTypeIds] =
    config.metadataGenerationLayerOrder;
  const firstLayerType = config.layers[firstLayerTypeId].info;
  const firstLayerItems: Attribute[][] = [];
  Object.values(config.layers[firstLayerTypeId].values).forEach(
    (layerValue) => {
      // Add to items with the given frequency
      firstLayerItems.push(
        ...arrayFilledWith(
          () => [
            {
              typeId: firstLayerType.id,
              valueId: layerValue.id,
            },
          ],
          layerValue.relativeFrequency
        )
      );
    }
  );
  // Also add "skips", creating new arrays every time
  firstLayerItems.push(
    ...arrayFilledWith(() => [], firstLayerType.skipFrequency)
  );

  let currItems: Attribute[][] = firstLayerItems;
  // Deal with consecutive layers
  for (const layerId of otherLayerTypeIds) {
    // Create new items array
    const nextItems: Attribute[][] = [];
    const currLayerType = config.layers[layerId].info;

    console.log(
      'Processing layer',
      layerId,
      'with',
      currItems.length,
      'current items'
    );

    // Randomize and cut to max length for next round
    const prevElementsToProcess = shuffleArrayInPlace(currItems).slice(
      0,
      maxGenerationSizeBeforeDeduplication
    );
    // Add multiple per existing item to get to deduplication length
    const numAddedItemsPerExistingItem = Math.ceil(
      (maxGenerationSizeBeforeDeduplication - prevElementsToProcess.length) /
        currItems.length
    );

    // Iterate over each item in randomized arr of curr items
    for (const itemAttributes of prevElementsToProcess) {
      // For each item, iterate over previous attributes and determine restrictions on this layer
      const allowedLayerValueIds = getAllowedLayerValueIds(
        config,
        currLayerType,
        itemAttributes
      );

      // No allowed layer values - so just skip this layer and add existing item to next items
      if (allowedLayerValueIds.length === 0) {
        nextItems.push(
          ...arrayFilledWith(
            () => [...itemAttributes],
            numAddedItemsPerExistingItem
          )
        );
        continue;
      }

      // Now populate with relative frequencies and choose random values
      const layerValueIdsWithFrequencies = allowedLayerValueIds.reduce(
        (prevArr, valueId) => {
          const valueFrequency =
            config.layers[layerId].values[valueId].relativeFrequency;
          prevArr.push(...Array(valueFrequency).fill(valueId));
          return prevArr;
        },
        [] as (string | undefined)[]
      );
      // Add skip frequencies
      layerValueIdsWithFrequencies.push(
        ...Array(currLayerType.skipFrequency).fill(undefined)
      );

      // Now randomize and take enough options
      const layerValueIdsToAdd = shuffleArrayInPlace(
        layerValueIdsWithFrequencies
      ).slice(0, numAddedItemsPerExistingItem);
      // Apply picked values
      for (const layerValueId of layerValueIdsToAdd) {
        // Create the new item
        const newItem = [...itemAttributes];
        if (layerValueId) {
          newItem.push({
            typeId: currLayerType.id,
            valueId: layerValueId,
          });
        }

        nextItems.push(newItem);
      }
    }

    currItems = nextItems;
  }

  console.log('Generated', currItems.length, 'combinations');

  // Randomize
  shuffleArrayInPlace(currItems);
  // Randomize - again?
  shuffleArrayInPlace(currItems);

  // Begin exporting the collection
  const collection: CollectionOfAttributes = {};
  // Trim to batch size
  for (const item of currItems) {
    if (Object.keys(collection).length === config.batchSize) {
      break;
    }
    const itemId = getItemId(item);

    // Duplicate item - skip
    if (collection[itemId] != null) {
      continue;
    }

    collection[itemId] = item;
  }

  if (Object.keys(collection).length !== config.batchSize) {
    throw Error(
      'Could not generate enough unique items: ' +
        Object.keys(collection).length
    );
  }

  // Build stats
  const stats: CollectionStats = {};
  // Initialize counts
  Object.values(config.layers).forEach((layerType) => {
    const layerValueIds = Object.keys(layerType.values);
    stats[layerType.info.id] = {};

    layerValueIds.forEach((valueId) => {
      stats[layerType.info.id][valueId] = 0;
    });
  });
  // Increment counts
  Object.values(collection).forEach((appliedAttrs) => {
    appliedAttrs.forEach((attr) => {
      stats[attr.typeId][attr.valueId] += 1;
    });
  });

  return [collection, stats];
}

generateCollectionOfAttributes(config).then(([collection, stats]) => {
  fs.writeFileSync(collectionJsonFilePath, JSON.stringify(collection, null, 2));
  fs.writeFileSync(statsJsonFilePath, JSON.stringify(stats, null, 2));
});
