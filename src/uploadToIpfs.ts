import { Config } from './types/ConfigTypes';
import { config } from './config/config';
import { createNftStorageClient } from './utils/ipfsUtils';
import { chunk, range } from 'lodash';
import * as fs from 'fs';
import {
  getImageFilePath,
  getMetadataFilePath,
  tokenIdToUriFilePath,
} from './paths';
import { File, NFTStorage } from 'nft.storage';
import { NftMetadata } from './types/CollectionTypes';

const UPLOAD_BATCH_SIZE = 10;

/**
 * Uploads generated files from target/metadata and target/images
 * to IPFS.
 * @param config
 */
async function uploadToIpfs(config: Config) {
  const nftStorageClient = createNftStorageClient();

  const chunkedItemNumbers = chunk(
    range(1, config.batchSize + 1),
    UPLOAD_BATCH_SIZE
  );
  const tokenIdToUri: Record<number, string> = {};

  for (const chunk of chunkedItemNumbers) {
    const processPromises = chunk.map(async (itemNumber: number) => {
      const uploadResult = await uploadItem(itemNumber, nftStorageClient);
      tokenIdToUri[itemNumber] = uploadResult.url;
    });
    await Promise.all(processPromises);
  }

  fs.writeFileSync(tokenIdToUriFilePath, JSON.stringify(tokenIdToUri, null, 2));
}

async function uploadItem(itemNumber: number, nftStorageClient: NFTStorage) {
  if (itemNumber % 500 === 0) {
    console.log('Processing item', itemNumber);
  }

  const metadata: NftMetadata = JSON.parse(
    fs.readFileSync(getMetadataFilePath(itemNumber)).toString()
  );

  return nftStorageClient.store({
    ...metadata,
    image: new File(
      [await fs.promises.readFile(getImageFilePath(itemNumber))],
      `${itemNumber.toFixed(0)}.png`,
      {
        type: 'image/png',
      }
    ),
  });
}

uploadToIpfs(config);
