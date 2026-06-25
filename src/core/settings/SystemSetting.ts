export type SystemSettingValue = boolean | string | number | null;

export type SystemSettingMetadata = Readonly<Record<string, unknown>>;

export interface SystemSetting<TValue extends SystemSettingValue = SystemSettingValue> {
  readonly key: string;
  readonly value: TValue;
  readonly metadata?: SystemSettingMetadata;
}

export type SystemSettingResolutionContext = Readonly<Record<string, unknown>>;

