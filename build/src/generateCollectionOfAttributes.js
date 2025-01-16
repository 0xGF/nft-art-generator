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
const lodash_1 = require("lodash");
const generationRuleUtils_1 = require("./utils/generationRuleUtils");
const helpers_1 = require("./utils/helpers");
const fs = __importStar(require("fs"));
const sha1_1 = __importDefault(require("sha1"));
const config_1 = require("./config/config");
const paths_1 = require("./paths");
/**
 * Returns a unique ID associated with the applied attributes for deduplication
 * @param appliedAttributes
 */
function getItemId(appliedAttributes) {
    const identifier = (0, lodash_1.sortBy)(appliedAttributes, (a) => a.typeId)
        .map((attr) => `${attr.typeId}|${attr.valueId}`)
        .join(',');
    return (0, sha1_1.default)(identifier);
}
/**
 * Given config, generates ONLY the attributes for the collection (no images are created)
 *
 * @param config
 */
async function generateCollectionOfAttributes(config) {
    // To prevent blowing up the collection size, short-circuit the generation once we hit a given collection size
    // Add a buffer to allow for dedup
    const maxGenerationSizeBeforeDeduplication = config.batchSize * 5;
    // Deal with first layer
    const [firstLayerTypeId, ...otherLayerTypeIds] = config.metadataGenerationLayerOrder;
    const firstLayerType = config.layers[firstLayerTypeId].info;
    const firstLayerItems = [];
    Object.values(config.layers[firstLayerTypeId].values).forEach((layerValue) => {
        // Add to items with the given frequency
        firstLayerItems.push(...(0, helpers_1.arrayFilledWith)(() => [
            {
                typeId: firstLayerType.id,
                valueId: layerValue.id,
            },
        ], layerValue.relativeFrequency));
    });
    // Also add "skips", creating new arrays every time
    firstLayerItems.push(...(0, helpers_1.arrayFilledWith)(() => [], firstLayerType.skipFrequency));
    let currItems = firstLayerItems;
    // Deal with consecutive layers
    for (const layerId of otherLayerTypeIds) {
        // Create new items array
        const nextItems = [];
        const currLayerType = config.layers[layerId].info;
        console.log('Processing layer', layerId, 'with', currItems.length, 'current items');
        // Randomize and cut to max length for next round
        const prevElementsToProcess = (0, helpers_1.shuffleArrayInPlace)(currItems).slice(0, maxGenerationSizeBeforeDeduplication);
        // Add multiple per existing item to get to deduplication length
        const numAddedItemsPerExistingItem = Math.ceil((maxGenerationSizeBeforeDeduplication - prevElementsToProcess.length) /
            currItems.length);
        // Iterate over each item in randomized arr of curr items
        for (const itemAttributes of prevElementsToProcess) {
            // For each item, iterate over previous attributes and determine restrictions on this layer
            const allowedLayerValueIds = (0, generationRuleUtils_1.getAllowedLayerValueIds)(config, currLayerType, itemAttributes);
            // No allowed layer values - so just skip this layer and add existing item to next items
            if (allowedLayerValueIds.length === 0) {
                nextItems.push(...(0, helpers_1.arrayFilledWith)(() => [...itemAttributes], numAddedItemsPerExistingItem));
                continue;
            }
            // Now populate with relative frequencies and choose random values
            const layerValueIdsWithFrequencies = allowedLayerValueIds.reduce((prevArr, valueId) => {
                const valueFrequency = config.layers[layerId].values[valueId].relativeFrequency;
                prevArr.push(...Array(valueFrequency).fill(valueId));
                return prevArr;
            }, []);
            // Add skip frequencies
            layerValueIdsWithFrequencies.push(...Array(currLayerType.skipFrequency).fill(undefined));
            // Now randomize and take enough options
            const layerValueIdsToAdd = (0, helpers_1.shuffleArrayInPlace)(layerValueIdsWithFrequencies).slice(0, numAddedItemsPerExistingItem);
            // Apply picked values
            for (const layerValueId of layerValueIdsToAdd) {
                // Create the new item
                const newItem = [...itemAttributes];
                if (layerValueId) {
                    newItem.push({
                        typeId: currLayerType.id,
                        valueId: layerValueId,
                    });
                }
                nextItems.push(newItem);
            }
        }
        currItems = nextItems;
    }
    console.log('Generated', currItems.length, 'combinations');
    // Randomize
    (0, helpers_1.shuffleArrayInPlace)(currItems);
    // Randomize - again?
    (0, helpers_1.shuffleArrayInPlace)(currItems);
    // Begin exporting the collection
    const collection = {};
    // Trim to batch size
    for (const item of currItems) {
        if (Object.keys(collection).length === config.batchSize) {
            break;
        }
        const itemId = getItemId(item);
        // Duplicate item - skip
        if (collection[itemId] != null) {
            continue;
        }
        collection[itemId] = item;
    }
    if (Object.keys(collection).length !== config.batchSize) {
        throw Error('Could not generate enough unique items: ' +
            Object.keys(collection).length);
    }
    // Build stats
    const stats = {};
    // Initialize counts
    Object.values(config.layers).forEach((layerType) => {
        const layerValueIds = Object.keys(layerType.values);
        stats[layerType.info.id] = {};
        layerValueIds.forEach((valueId) => {
            stats[layerType.info.id][valueId] = 0;
        });
    });
    // Increment counts
    Object.values(collection).forEach((appliedAttrs) => {
        appliedAttrs.forEach((attr) => {
            stats[attr.typeId][attr.valueId] += 1;
        });
    });
    return [collection, stats];
}
generateCollectionOfAttributes(config_1.config).then(([collection, stats]) => {
    fs.writeFileSync(paths_1.collectionJsonFilePath, JSON.stringify(collection, null, 2));
    fs.writeFileSync(paths_1.statsJsonFilePath, JSON.stringify(stats, null, 2));
});
