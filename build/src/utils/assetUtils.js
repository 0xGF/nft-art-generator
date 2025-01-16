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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportMetadata = exports.exportImage = void 0;
const canvas_1 = require("canvas");
const path_1 = __importDefault(require("path"));
const lodash_1 = require("lodash");
const fs = __importStar(require("fs"));
/**
 * Retrieves an asset for the attribute
 * @param attribute
 * @param rootAssetsPath
 */
async function getAttributeImage(attribute, rootAssetsPath) {
    return (0, canvas_1.loadImage)(path_1.default.join(rootAssetsPath, attribute.typeId, `${attribute.valueId}.png`));
}
/**
 * Creates and exports an image for a given set of attributes
 * @param config
 * @param attributes
 * @param rootAssetsPath
 * @param outputFilePath
 */
async function exportImage(config, attributes, rootAssetsPath, outputFilePath) {
    const width = config.format.width;
    const height = config.format.height;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    const orderedAttributes = (0, lodash_1.orderBy)(attributes, (attr) => config.imageGenerationLayerOrder.indexOf(attr.typeId));
    for (const attr of orderedAttributes) {
        ctx.drawImage(await getAttributeImage(attr, rootAssetsPath), 0, 0, width, height);
    }
    fs.writeFileSync(outputFilePath, canvas.toBuffer('image/png'));
}
exports.exportImage = exportImage;
/**
 * Exports metadata for a set of attributes under the RandomEarth format
 * @param config
 * @param attributes
 * @param itemNumber
 * @param outputFilePath
 */
function exportMetadata(config, attributes, itemNumber, outputFilePath) {
    const itemName = config.name + ' #' + itemNumber.toFixed(0);
    // Sanity check that we don't have duplicate values for a trait type
    const attrTypeSet = new Set();
    const metadata = {
        name: itemName,
        description: config.description,
        attributes: attributes.map((attr) => {
            if (attrTypeSet.has(attr.typeId)) {
                throw Error(`Attribute type ${attr.typeId} already exists! Check ${itemName}`);
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
exports.exportMetadata = exportMetadata;
