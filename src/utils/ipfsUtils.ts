import { NFTStorage } from 'nft.storage';
import { environment } from './environment';

export function createNftStorageClient() {
  return new NFTStorage({
    token: environment.nftStorageKey,
  });
}
