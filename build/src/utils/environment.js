"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
require('dotenv').config();
exports.environment = {
    nftStorageKey: process.env.NFT_STORAGE_KEY,
    aesEncryptionKey: process.env.AES_ENCRYPTION_KEY,
};
