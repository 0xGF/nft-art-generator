import { LayerType, LayerValue } from './LayerTypes';

export type GenerationRuleType = 'onlyAllow' | 'exclude';

export type GenerationRule = {
  type: GenerationRuleType;
  typeIdToValues: {
    [typeId: string]: string[] | 'all'; // Type ID -> array of Value IDs or "all" to include all values for a type
  };
};

export type Config = {
  name: string; // NFT Name, postfixed with #{item_number} -> ex. My Nft #1
  description: string; // NFT description
  batchSize: number; // Total size of collection
  format: ImageFormat;
  /**
   * Specify all layer types & values here
   */
  layers: {
    [layerTypeId: string]: {
      info: LayerType;
      values: {
        [layerValueId: string]: LayerValue;
      };
    };
  };
  /**
   * Order of applied layers when generating metadata, each string is the layerTypeId. Custom generation logic is applied
   * in this order, so any conditional logic (ex. limiting the set of types/values) must only address
   * types/values that come AFTER the current layer
   */
  metadataGenerationLayerOrder: string[];
  /**
   * Order of drawing the different layers, again an array of layerTypeIds
   */
  imageGenerationLayerOrder: string[];
  /**
   * Optional generation rules, ONLY specify if there are custom considerations
   */
  generationRules: {
    /**
     * Each generation rule is keyed by an applied type + value
     */
    [typeId: string]:
      | {
          /**
           * If 'byValue' then specify the values that this should be applied to
           */
          type: 'byValue';
          valueIdToRule: {
            [valueId: string]: GenerationRule;
          };
        }
      | {
          /**
           * If 'all' then no need to specify individual values
           */
          type: 'all';
          rule: GenerationRule;
        };
  };
};

export type ImageFormat = {
  width: number;
  height: number;
};
