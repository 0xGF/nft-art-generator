"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config/config");
const ipfsUtils_1 = require("./utils/ipfsUtils");
const lodash_1 = require("lodash");
const fs = __importStar(require("fs"));
const paths_1 = require("./paths");
const nft_storage_1 = require("nft.storage");
const UPLOAD_BATCH_SIZE = 10;
/**
 * Uploads generated files from target/metadata and target/images
 * to IPFS.
 * @param config
 */
async function uploadToIpfs(config) {
    const nftStorageClient = (0, ipfsUtils_1.createNftStorageClient)();
    const chunkedItemNumbers = (0, lodash_1.chunk)((0, lodash_1.range)(1, config.batchSize + 1), UPLOAD_BATCH_SIZE);
    const tokenIdToUri = {};
    for (const chunk of chunkedItemNumbers) {
        const processPromises = chunk.map(async (itemNumber) => {
            const uploadResult = await uploadItem(itemNumber, nftStorageClient);
            tokenIdToUri[itemNumber] = uploadResult.url;
        });
        await Promise.all(processPromises);
    }
    fs.writeFileSync(paths_1.tokenIdToUriFilePath, JSON.stringify(tokenIdToUri, null, 2));
}
async function uploadItem(itemNumber, nftStorageClient) {
    if (itemNumber % 500 === 0) {
        console.log('Processing item', itemNumber);
    }
    const metadata = JSON.parse(fs.readFileSync((0, paths_1.getMetadataFilePath)(itemNumber)).toString());
    return nftStorageClient.store({
        ...metadata,
        image: new nft_storage_1.File([await fs.promises.readFile((0, paths_1.getImageFilePath)(itemNumber))], `${itemNumber.toFixed(0)}.png`, {
            type: 'image/png',
        }),
    });
}
uploadToIpfs(config_1.config);
