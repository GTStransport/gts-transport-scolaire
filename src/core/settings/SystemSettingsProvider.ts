import type { SystemSetting, SystemSettingResolutionContext } from "./SystemSetting";

export abstract class SystemSettingsProvider {
  abstract getSetting<TValue extends SystemSetting["value"] = SystemSetting["value"]>(
    key: string,
    context?: SystemSettingResolutionContext,
  ): SystemSetting<TValue> | Promise<SystemSetting<TValue>>;

  async getValue<TValue extends SystemSetting["value"] = SystemSetting["value"]>(
    key: string,
    context?: SystemSettingResolutionContext,
  ): Promise<TValue> {
    const setting = await this.getSetting<TValue>(key, context);

    return setting.value;
  }
}

export class EmptySystemSettingsProvider extends SystemSettingsProvider {
  getSetting(key: string): SystemSetting<null> {
    return {
      key,
      value: null,
    };
  }
}

