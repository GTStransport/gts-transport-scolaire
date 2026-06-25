export type FeatureFlagValue = boolean | string | number;

export type FeatureFlagMetadata = Readonly<Record<string, unknown>>;

export interface FeatureFlag<TValue extends FeatureFlagValue = boolean> {
  readonly key: string;
  readonly enabled: boolean;
  readonly value?: TValue;
  readonly metadata?: FeatureFlagMetadata;
}

export type FeatureFlagEvaluationContext = Readonly<Record<string, unknown>>;

