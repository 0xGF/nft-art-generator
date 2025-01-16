import { Config } from "../types/ConfigTypes";

export const config: Config = {
  batchSize: 1000,
  name: "Sample NFT Collection",
  description: "A sample configuration for NFT generation",
  format: {
    height: 512,
    width: 512,
  },
  // Rules for generating the NFT metadata. If you want to exclude a layer, you can do so here by specifying the valueIdToRule. For example for the blue background, we want to exclude the blue clothing layer.
  generationRules: {
    background: {
      type: "byValue",
      valueIdToRule: {
        blue: {
          type: "exclude",
          typeIdToValues: {
            clothing: ["light"],
          },
        },
      },
    },
  },
  // Order of layers in the metadata generation. Aka if you rely on a layer to be generated before another, you can specify that here.
  metadataGenerationLayerOrder: ["background", "skin", "clothing", "glasses"],
  // Order of layers in the image
  imageGenerationLayerOrder: ["background", "skin", "clothing", "glasses"],
  layers: {
    background: {
      info: {
        skipFrequency: 0,
        id: "background",
        name: "Background",
      },
      values: {
        blue: {
          id: "blue",
          name: "Blue",
          relativeFrequency: 5,
        },
        green: {
          id: "green",
          name: "Green",
          relativeFrequency: 5,
        },
      },
    },
    skin: {
      info: {
        skipFrequency: 0,
        id: "skin",
        name: "Skin",
      },
      values: {
        light: {
          id: "light",
          name: "Light",
          relativeFrequency: 5,
        },
        dark: {
          id: "dark",
          name: "Dark",
          relativeFrequency: 5,
        },
      },
    },
    clothing: {
      info: {
        skipFrequency: 0,
        id: "clothing",
        name: "Clothing",
      },
      values: {
        orange: {
          id: "orange",
          name: "Orange",
          relativeFrequency: 5,
        },
        blue: {
          id: "blue",
          name: "Blue",
          relativeFrequency: 5,
        },
      },
    },
  },
};
