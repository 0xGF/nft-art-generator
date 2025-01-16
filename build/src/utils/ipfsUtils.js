"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNftStorageClient = void 0;
const nft_storage_1 = require("nft.storage");
const environment_1 = require("./environment");
function createNftStorageClient() {
    return new nft_storage_1.NFTStorage({
        token: environment_1.environment.nftStorageKey,
    });
}
exports.createNftStorageClient = createNftStorageClient;
