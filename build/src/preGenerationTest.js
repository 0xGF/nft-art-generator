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
const canvas_1 = require("canvas");
const path = __importStar(require("path"));
const paths_1 = require("./paths");
const config_1 = require("./config/config");
const lodash_1 = require("lodash");
/**
 * Checks that attributes are noted under the config.layers "source of truth"
 */
function checkTypeExists(expectedTypeId, config) {
    if (config.layers[expectedTypeId] != null) {
        return true;
    }
    console.log(`Type ${expectedTypeId} does not exist in config.layers`);
    return false;
}
function checkTypeAndValueExists(expectedTypeId, expectedValueId, config) {
    if (checkTypeExists(expectedTypeId, config)) {
        if (config.layers[expectedTypeId].values[expectedValueId] != null) {
            return true;
        }
        console.log(`Value under ${expectedTypeId}: ${expectedValueId} does not exist in config.layers`);
    }
    return false;
}
/**
 * File check
 */
async function checkImageFileExists(expectedTypeId, expectedValueId, rootAssetsPath) {
    const filePath = path.join(rootAssetsPath, expectedTypeId, `${expectedValueId}.png`);
    try {
        await (0, canvas_1.loadImage)(filePath);
        return true;
    }
    catch (err) {
        console.log(`Image ${filePath} not found.`);
        return false;
    }
}
/**
 * Checks a rule to be valid (i.e. all referenced types & values are present in global config.layers)
 */
function checkGenerationRule(rule, ruleTypeId, config) {
    if (rule.type !== "onlyAllow" && rule.type !== "exclude") {
        console.log(`Given rule type ${rule.type} for rule under ${ruleTypeId} is not valid - only "onlyAllow" and "exclude" are permitted`);
    }
    // Check types & values
    for (const typeId of Object.keys(rule.typeIdToValues)) {
        if (checkTypeExists(typeId, config)) {
            if (rule.typeIdToValues[typeId] !== "all") {
                for (const valueId of rule.typeIdToValues[typeId]) {
                    checkTypeAndValueExists(typeId, valueId, config);
                }
            }
        }
    }
}
/**
 * Runs a few simple checks to guard against runtime errors during generation
 * @param config
 */
async function runPreGenerationTest(config) {
    // First check all the given layers for the image files
    for (const layerTypeId of Object.keys(config.layers)) {
        for (const valueId of Object.keys(config.layers[layerTypeId].values)) {
            await checkImageFileExists(layerTypeId, valueId, paths_1.rootAssetsDirectory);
        }
    }
    // Now check the generation orders
    config.metadataGenerationLayerOrder.forEach((layerTypeId) => checkTypeExists(layerTypeId, config));
    config.imageGenerationLayerOrder.forEach((layerTypeId) => checkTypeExists(layerTypeId, config));
    // Check that metadata & image generation layers account for the same layers
    if (!(0, lodash_1.isEqual)(Array.from(new Set(config.metadataGenerationLayerOrder)), Array.from(new Set(config.imageGenerationLayerOrder)))) {
        console.log("Metadata layer order and image layer order have different layer types. Is something missing?");
    }
    console.log("Checking items under generationRules");
    // Now check conditional logic
    for (const generationRuleTypeId of Object.keys(config.generationRules)) {
        if (!checkTypeExists(generationRuleTypeId, config)) {
            continue;
        }
        const typeFilter = config.generationRules[generationRuleTypeId];
        if (typeFilter.type === "byValue") {
            // Check all the values
            for (const ruleValueId of Object.keys(typeFilter.valueIdToRule)) {
                if (!checkTypeAndValueExists(generationRuleTypeId, ruleValueId, config)) {
                    continue;
                }
                // Check this rule
                checkGenerationRule(typeFilter.valueIdToRule[ruleValueId], generationRuleTypeId, config);
            }
        }
        else if (typeFilter.type === "all") {
            // Check this rule
            checkGenerationRule(typeFilter.rule, generationRuleTypeId, config);
        }
        else {
            console.log(`Invalid type filter for generation rule keyed by ${generationRuleTypeId}`);
        }
    }
}
runPreGenerationTest(config_1.config).then(() => console.log("Done!"));
