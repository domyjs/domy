import type { DomyPluginDefinition, DomySpecialHelper } from '@domyjs/core/src/types/Domy';

type Dict = {
  [key: string]: string | Dict;
};

type Settings = {
  messages: Record<string, Dict>;
  currentLangage: string;
  defaultCallbackLangage: string;
};

class I18N {
  public langage: { lang: string } | undefined;

  constructor(public settings: Settings) {}

  /**
   * Give the i18n helper
   * It allow us to get/set the langage
   * @param domy
   * @returns
   *
   * @author yoannchb-pro
   */
  getI18nHelper(domy: DomySpecialHelper) {
    if (!this.langage) this.langage = domy.reactive({ lang: this.settings.currentLangage });

    return {
      getSupportedLangages: () => {
        return Object.keys(this.settings.messages);
      },
      getLangage: () => {
        return this.langage!.lang;
      },
      setLangage: (newLangage: string) => {
        let destinationLangage = newLangage;
        if (!(newLangage in this.settings.messages)) {
          destinationLangage = this.settings.defaultCallbackLangage;
          console.warn(
            `(I18N) The langage "${newLangage}" doesn't exist. Switched to "${destinationLangage}".`
          );
        }
        this.langage!.lang = destinationLangage;
      }
    };
  }

  /**
   * Render a i18n message with the specified data
   * Example: $t('greeting.hello', { name: 'Yoann' })
   * @param domy
   * @returns
   *
   * @author yoannchb-pro
   */
  messageHandler(domy: DomySpecialHelper) {
    const langage = this.getI18nHelper(domy);

    return (key: string, data: Record<string, string> = {}) => {
      const dataReg = /\{\{\s*(.+?)\s*\}\}/gi;
      const messages = this.settings.messages[langage.getLangage()];
      let message = domy.utils.get(messages, key) as string | undefined;

      if (!message) {
        console.warn(`(I18N) Invalide key "${key}".`);
        return key;
      }

      if (dataReg.test(message)) {
        message = message.replace(dataReg, function (match, key) {
          const paramValue = data[key];
          if (!paramValue) return match;
          return paramValue;
        });
      }

      return message;
    };
  }
}

/**
 * I18n plugin
 * @param options
 * @returns
 *
 * @author yoannchb-pro
 */
function i18n(options: Settings) {
  if (!(options.currentLangage in options.messages)) {
    throw new Error(`(I18N) The current langage "${options.currentLangage}" must be in messages.`);
  }

  if (!(options.defaultCallbackLangage in options.messages)) {
    throw new Error(
      `(I18N) The default callback langage "${options.defaultCallbackLangage}" must be in messages.`
    );
  }

  const i18n = new I18N(options);

  return (domyPluginSetter: DomyPluginDefinition) => {
    domyPluginSetter.helper('i18n', i18n.getI18nHelper.bind(i18n));
    domyPluginSetter.helper('t', i18n.messageHandler.bind(i18n));
  };
}

export default i18n;
