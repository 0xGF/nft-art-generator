import { Config, GenerationRuleType } from '../types/ConfigTypes';
import { Attribute, LayerType } from '../types/LayerTypes';
import { intersection } from 'lodash';

// TODO: Memoize
/**
 * Given a set of applied attributes, determine the allowed layer values for the layer type
 *
 * @param config
 * @param layerType
 * @param itemAttributes
 */
export function getAllowedLayerValueIds(
  config: Config,
  layerType: LayerType,
  itemAttributes: Attribute[]
): string[] {
  const allowedIdsForEachAttr = itemAttributes.map((appliedAttr) =>
    getPossibleLayerValueIds(config, appliedAttr, layerType)
  );
  return intersection(...allowedIdsForEachAttr);
}

/**
 * Retrieves the possible OD values for the layerType given an already applied attribute
 * @param config
 * @param appliedAttribute
 * @param layerType
 */
function getPossibleLayerValueIds(
  config: Config,
  appliedAttribute: Attribute,
  layerType: LayerType
): string[] {
  const allLayerValueIds = Object.keys(config.layers[layerType.id].values);

  let generationRuleType: GenerationRuleType;
  let generationRuleArgs: string[] | 'all'; // Type ID -> array of Value IDs or "all" to include all values for a type

  const generationRuleForAppliedType =
    config.generationRules?.[appliedAttribute.typeId];
  if (generationRuleForAppliedType == null) {
    // No generation rule for this applied attribute - all are possible
    return allLayerValueIds;
  }

  if (generationRuleForAppliedType.type === 'byValue') {
    // Generation rule applies to only certain values - check if this attribute is relevant
    const generationRuleForAppliedValue =
      generationRuleForAppliedType.valueIdToRule[appliedAttribute.valueId];

    if (generationRuleForAppliedValue == null) {
      return allLayerValueIds;
    }

    // See if the generation rule is applicable to the current layer type
    const generationRuleValues =
      generationRuleForAppliedValue.typeIdToValues[layerType.id];
    if (generationRuleValues == null) {
      return allLayerValueIds;
    }

    // Found applicable generation rule
    generationRuleType = generationRuleForAppliedValue.type;
    generationRuleArgs = generationRuleValues;
  } else {
    // Generation rule applies to all of this type
    const generationRuleValues =
      generationRuleForAppliedType.rule.typeIdToValues[layerType.id];
    // No generation rule for current layer type
    if (generationRuleValues == null) {
      return allLayerValueIds;
    }

    // Found applicable generation rule
    generationRuleType = generationRuleForAppliedType.rule.type;
    generationRuleArgs = generationRuleValues;
  }

  // Generation rule exists
  if (generationRuleType === 'onlyAllow') {
    return generationRuleArgs === 'all'
      ? allLayerValueIds
      : allLayerValueIds.filter((val) => generationRuleArgs.includes(val));
  } else {
    // Exclude
    return generationRuleArgs === 'all'
      ? []
      : allLayerValueIds.filter((val) => !generationRuleArgs.includes(val));
  }
}
