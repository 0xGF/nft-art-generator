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
const fs = __importStar(require("fs"));
const lodash_1 = require("lodash");
const assetUtils_1 = require("./utils/assetUtils");
const config_1 = require("./config/config");
const paths_1 = require("./paths");
async function generateAssetsFromCollection(config) {
    const collection = JSON.parse(fs.readFileSync(paths_1.collectionJsonFilePath).toString());
    const items = Object.values(collection);
    for (const idx of (0, lodash_1.range)(items.length)) {
        if (idx % 500 === 0) {
            console.log('On index', idx);
        }
        const itemAttributes = items[idx];
        const itemNumber = idx + 1;
        // Export the image
        await (0, assetUtils_1.exportImage)(config, itemAttributes, paths_1.rootAssetsDirectory, (0, paths_1.getImageFilePath)(itemNumber));
        // Export the metadata file
        (0, assetUtils_1.exportMetadata)(config, itemAttributes, itemNumber, (0, paths_1.getMetadataFilePath)(itemNumber));
    }
}
generateAssetsFromCollection(config_1.config).then(() => {
    console.log('Done!');
});
