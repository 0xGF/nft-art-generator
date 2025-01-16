import { Attribute } from '../types/LayerTypes';
import { Config } from '../types/ConfigTypes';
import { createCanvas, Image, loadImage } from 'canvas';
import path from 'path';
import { orderBy } from 'lodash';
import * as fs from 'fs';
import { NftMetadata } from '../types/CollectionTypes';

/**
 * Retrieves an asset for the attribute
 * @param attribute
 * @param rootAssetsPath
 */
async function getAttributeImage(
  attribute: Attribute,
  rootAssetsPath: string
): Promise<Image> {
  return loadImage(
    path.join(rootAssetsPath, attribute.typeId, `${attribute.valueId}.png`)
  );
}

/**
 * Creates and exports an image for a given set of attributes
 * @param config
 * @param attributes
 * @param rootAssetsPath
 * @param outputFilePath
 */
export async function exportImage(
  config: Config,
  attributes: Attribute[],
  rootAssetsPath: string,
  outputFilePath: string
) {
  const width = config.format.width;
  const height = config.format.height;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  const orderedAttributes = orderBy(attributes, (attr) =>
    config.imageGenerationLayerOrder.indexOf(attr.typeId)
  );

  for (const attr of orderedAttributes) {
    ctx.drawImage(
      await getAttributeImage(attr, rootAssetsPath),
      0,
      0,
      width,
      height
    );
  }

  fs.writeFileSync(outputFilePath, canvas.toBuffer('image/png'));
}

/**
 * Exports metadata for a set of attributes under the RandomEarth format
 * @param config
 * @param attributes
 * @param itemNumber
 * @param outputFilePath
 */
export function exportMetadata(
  config: Config,
  attributes: Attribute[],
  itemNumber: number,
  outputFilePath: string
) {
  const itemName = config.name + ' #' + itemNumber.toFixed(0);

  // Sanity check that we don't have duplicate values for a trait type
  const attrTypeSet = new Set();

  const metadata: NftMetadata = {
    name: itemName,
    description: config.description,
    attributes: attributes.map((attr) => {
      if (attrTypeSet.has(attr.typeId)) {
        throw Error(
          `Attribute type ${attr.typeId} already exists! Check ${itemName}`
        );
      }
      attrTypeSet.add(attr.typeId);

      return {
        trait_type: attr.typeId,
        value: attr.valueId,
      };
    }),
  };

  // Write metadata
  fs.writeFileSync(outputFilePath, JSON.stringify(metadata, null, 2));
}
