export type DecodedToken = {
  id: number;
  exp: number;
};

export type BANFeature = {
  properties: {
    id: string;
    label: string;
  };
};

export type TypeIntervention = {
  id: number;
  nom: string;
  prix_depart: number;
};

export type Slot = {
  id: number;
  debut: string;
};