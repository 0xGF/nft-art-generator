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
const fs = __importStar(require("fs"));
const paths_1 = require("./paths");
const config_1 = require("./config/config");
const helpers_1 = require("./utils/helpers");
const path_1 = __importDefault(require("path"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const environment_1 = require("./utils/environment");
async function doShit(config) {
    const tokenIdToUri = JSON.parse(fs.readFileSync(paths_1.tokenIdToUriFilePath).toString());
    // Randomize tokens
    const tokenDataOriginal = Object.keys(tokenIdToUri).map((tokenId) => {
        return {
            id: Number(tokenId),
            uri: tokenIdToUri[tokenId],
        };
    });
    (0, helpers_1.shuffleArrayInPlace)(tokenDataOriginal);
    // TEMP: Repeat uris to simualte 10k
    const tokenData = [];
    for (let i = 0; i < 100; i++) {
        tokenData.push(...tokenDataOriginal);
    }
    const jsonUris = JSON.stringify(tokenData, null, 2);
    // Unencrypted
    fs.writeFileSync(path_1.default.join(paths_1.rootTargetDirectory, 'tokenDataRaw.json'), jsonUris);
    // Encrypt JSON
    const encryptedJson = crypto_js_1.default.AES.encrypt(jsonUris, environment_1.environment.aesEncryptionKey).toString();
    fs.writeFileSync(path_1.default.join(paths_1.rootTargetDirectory, 'tokenData.txt'), encryptedJson);
    // Check
    const decryptedJsonBytes = crypto_js_1.default.AES.decrypt(encryptedJson, environment_1.environment.aesEncryptionKey);
    if (decryptedJsonBytes.toString(crypto_js_1.default.enc.Utf8) !== jsonUris) {
        throw Error('Decrypted is not the same as original');
    }
}
doShit(config_1.config);
