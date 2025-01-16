"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataFilePath = exports.getImageFilePath = exports.tokenIdToUriFilePath = exports.statsJsonFilePath = exports.collectionJsonFilePath = exports.rootTargetDirectory = exports.rootAssetsDirectory = void 0;
const path_1 = __importDefault(require("path"));
/**
 * Paths for generation
 */
exports.rootAssetsDirectory = path_1.default.join(__dirname, '../', 'assets');
exports.rootTargetDirectory = path_1.default.join(__dirname, '../', 'target');
exports.collectionJsonFilePath = path_1.default.join(exports.rootTargetDirectory, 'collection.json');
exports.statsJsonFilePath = path_1.default.join(exports.rootTargetDirectory, 'collectionStats.json');
exports.tokenIdToUriFilePath = path_1.default.join(exports.rootTargetDirectory, 'tokenIdToUri.json');
function getImageFilePath(itemNumber) {
    return path_1.default.join(exports.rootTargetDirectory, 'images', `${itemNumber.toFixed(0)}.png`);
}
exports.getImageFilePath = getImageFilePath;
function getMetadataFilePath(itemNumber) {
    return path_1.default.join(exports.rootTargetDirectory, 'metadata', `${itemNumber.toFixed(0)}.json`);
}
exports.getMetadataFilePath = getMetadataFilePath;
