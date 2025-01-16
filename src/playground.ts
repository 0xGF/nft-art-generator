import { Config } from "./types/ConfigTypes";
import * as fs from "fs";
import { rootTargetDirectory, tokenIdToUriFilePath } from "./paths";
import { config } from "./config/config";
import { shuffleArrayInPlace } from "./utils/helpers";
import path from "path";
import CryptoJS from "crypto-js";
import { environment } from "./utils/environment";

type TokenData = {
  id: number;
  uri: string;
};

async function doShit(config: Config) {
  if (!fs.existsSync(tokenIdToUriFilePath)) {
    throw new Error(`File not found: ${tokenIdToUriFilePath}`);
  }

  const fileContent = fs.readFileSync(tokenIdToUriFilePath, "utf-8");
  if (!fileContent) {
    throw new Error(`File is empty: ${tokenIdToUriFilePath}`);
  }

  let tokenIdToUri: Record<string, string>;
  try {
    tokenIdToUri = JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Invalid JSON in file: ${tokenIdToUriFilePath}`);
  }

  // Randomize tokens
  const tokenDataOriginal = Object.keys(tokenIdToUri).map<TokenData>(
    (tokenId) => {
      return {
        id: Number(tokenId),
        uri: tokenIdToUri[tokenId],
      };
    }
  );
  shuffleArrayInPlace(tokenDataOriginal);

  // TEMP: Repeat uris to simulate 10k
  const tokenData: TokenData[] = [];
  for (let i = 0; i < 100; i++) {
    tokenData.push(...tokenDataOriginal);
  }

  const jsonUris = JSON.stringify(tokenData, null, 2);

  // Unencrypted
  fs.writeFileSync(
    path.join(rootTargetDirectory, "tokenDataRaw.json"),
    jsonUris
  );

  // Encrypt JSON
  const encryptedJson = CryptoJS.AES.encrypt(
    jsonUris,
    environment.aesEncryptionKey
  ).toString();
  fs.writeFileSync(
    path.join(rootTargetDirectory, "tokenData.txt"),
    encryptedJson
  );

  // Check
  const decryptedJsonBytes = CryptoJS.AES.decrypt(
    encryptedJson,
    environment.aesEncryptionKey
  );
  if (decryptedJsonBytes.toString(CryptoJS.enc.Utf8) !== jsonUris) {
    throw Error("Decrypted is not the same as original");
  }
}

doShit(config);
