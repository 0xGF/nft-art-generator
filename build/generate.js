"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./src/config/config");
// Ensure environment variables are loaded
require("dotenv").config();
async function generateNFT() {
    try {
        console.log(`Generating NFT: ${config_1.config.name}`);
        // Add your NFT minting logic here
    }
    catch (error) {
        console.error("Error generating NFT:", error);
    }
}
generateNFT();
