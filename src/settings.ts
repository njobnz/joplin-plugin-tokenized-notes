import joplin from 'api';
import localization from './localization';
import { validateJoplinId as validId } from './utilities';
import { localStoreSettingsKey, settingsSectionName as sectionName } from './constants';
import { SettingItem, SettingItemType, SettingStorage } from 'api/types';
import { PluginSettings } from './types';

/**
 * Reads stored settings from localStorage.
 *
 * @returns {PluginSettings} Plugin settings object.
 */
export const readSettings = (): PluginSettings =>
  JSON.parse(localStorage.getItem(localStoreSettingsKey));

/**
 * Registers plugin settings.
 *
 * @returns {Promise<void>} A promise.
 */
export const registerSettings = async () => {
  const settingsSpec: Record<keyof PluginSettings, SettingItem> = {
    autocomplete: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__autocomplete,
      description: localization.setting__autocomplete__description,
      type: SettingItemType.Bool,
      value: true,
    },

    idsOnly: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__idsOnly,
      description: localization.setting__idsOnly__description,
      type: SettingItemType.Bool,
      value: false,
    },

    folders: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__folders,
      description: localization.setting__folders__description,
      type: SettingItemType.String,
      value: '',
    },

    tags: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__tags,
      description: localization.setting__tags__description,
      type: SettingItemType.String,
      value: '',
    },

    prefix: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__prefix,
      description: localization.setting__prefix__description,
      type: SettingItemType.String,
      value: '%%',
    },

    suffix: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__suffix,
      description: localization.setting__suffix__description,
      type: SettingItemType.String,
      value: '%%',
    },

    blockFence: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__blockFence,
      description: localization.setting__blockFence__description,
      type: SettingItemType.Bool,
      value: true,
      advanced: true,
    },

    renderMarkdown: {
      public: true,
      section: sectionName,
      storage: SettingStorage.File,
      label: localization.setting__renderMarkdown,
      description: localization.setting__renderMarkdown__description,
      type: SettingItemType.Bool,
      value: false,
      advanced: true,
    },
  };

  /**
   * Fetches plugin settings from Joplin's API and stores them in localStorage.
   * Makes settings easily accessible in non-async functions.
   *
   * This function is triggered whenever settings are changed.
   */
  const storeSettings = async () => {
    const settings = new Map<string, any>();
    for (const setting in settingsSpec) {
      let value: any = (await joplin.settings.values(setting))[setting];
      if (setting === 'folders' || setting === 'tags')
        value = value.split(/[ ,;|]/).filter(i => validId(i));
      settings.set(setting, value);
    }
    localStorage.setItem(localStoreSettingsKey, JSON.stringify(Object.fromEntries(settings)));
  };

  await joplin.settings.registerSection(sectionName, {
    label: localization.settings__appName,
    description: localization.settings__description,
    iconName: 'fas fa-laptop-code',
  });
  await joplin.settings.registerSettings(settingsSpec);
  await joplin.settings.onChange(storeSettings);
  await storeSettings();
};
