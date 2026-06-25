import type { FeatureFlag, FeatureFlagEvaluationContext } from "./FeatureFlag";

export abstract class FeatureFlagProvider {
  abstract getFlag<TValue extends FeatureFlag["value"] = boolean>(
    key: string,
    context?: FeatureFlagEvaluationContext,
  ): FeatureFlag<NonNullable<TValue>> | Promise<FeatureFlag<NonNullable<TValue>>>;

  async isEnabled(key: string, context?: FeatureFlagEvaluationContext): Promise<boolean> {
    const flag = await this.getFlag(key, context);

    return flag.enabled;
  }
}

export class DisabledFeatureFlagProvider extends FeatureFlagProvider {
  getFlag(key: string): FeatureFlag {
    return {
      key,
      enabled: false,
    };
  }
}

