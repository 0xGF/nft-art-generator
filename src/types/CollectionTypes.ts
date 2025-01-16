import { Attribute } from './LayerTypes';

// Generated collection of only attributes
export type CollectionOfAttributes = {
  [itemId: string]: Attribute[];
};

// Set of derived stats
export type CollectionStats = {
  // Type ID -> Value ID -> # Occurances
  [typeId: string]: {
    [valueId: string]: number;
  };
};

export type NftAttribute = {
  trait_type: string;
  value: string;
};

// RandomEarth & Opensea metadata standard
export type NftMetadata = {
  name: string;
  description: string;
  attributes: NftAttribute[];
};
