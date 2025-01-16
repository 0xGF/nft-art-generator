/**
 * Represents an applied attribute, which has a layer type and value
 */
export type Attribute = {
  typeId: string;
  valueId: string;
};

/**
 * Represents a type of layer
 */
export type LayerType = {
  id: string; // Folder name
  name: string; // Display name
  skipFrequency: number; // How often to skip applying this layer, higher means more skips
};

/**
 * Represents a possible value of a layer
 */
export type LayerValue = {
  id: string; // Layer image filename
  name: string; // Display name
  relativeFrequency: number; // How often the value occurs across all values for this type, higher is more common
};
