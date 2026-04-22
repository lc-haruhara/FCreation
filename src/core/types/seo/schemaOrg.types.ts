export type SchemaOrgContext = "https://schema.org";

export type SchemaLanguageTag = string;

export type SchemaGraphId = string;

export type SchemaGraphNode = { "@type": string; "@id"?: SchemaGraphId } & Record<
  string,
  unknown
>;

export type SchemaGraphDocument = {
  "@context": SchemaOrgContext;
  "@graph": SchemaGraphNode[];
};

export type SchemaOrgJsonLd = SchemaGraphDocument | SchemaGraphNode;

