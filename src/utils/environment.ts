require('dotenv').config();

export type Environment = {
  nftStorageKey: string;
  aesEncryptionKey: string;
};

export const environment: Environment = {
  nftStorageKey: process.env.NFT_STORAGE_KEY!,
  aesEncryptionKey: process.env.AES_ENCRYPTION_KEY!,
};
