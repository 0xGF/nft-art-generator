import { config } from "./src/config/config";

// Ensure environment variables are loaded
require("dotenv").config();

async function generateNFT() {
  try {
    console.log(`Generating NFT: ${config.name}`);
    // Add your NFT minting logic here
  } catch (error) {
    console.error("Error generating NFT:", error);
  }
}

generateNFT();
