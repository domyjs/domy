import type { DomyPluginDefinition, DomySpecialHelper } from '@domyjs/core/src/types/Domy';
import DOMY from '@domyjs/core';

declare global {
  interface Window {
    DOMY: typeof DOMY;
  }
}

type Dict = {
  [key: string]: string | Dict;
};

type Settings = {
  messages: Record<string, Dict>;
  currentLangage: string;
  defaultCallbackLangage: string;
};

class I18NHelper {
  public langage: { value: { lang: string } };

  constructor(public settings: Settings) {
    this.langage = window.DOMY.signal({ lang: this.settings.currentLangage });
  }

  getHook() {
    return {
      getSupportedLangages: () => {
        return Object.keys(this.settings.messages);
      },
      getLangage: () => {
        return this.langage.value.lang;
      },
      setLangage: (newLangage: string) => {
        let destinationLangage = newLangage;
        if (!(newLangage in this.settings.messages)) {
          destinationLangage = this.settings.defaultCallbackLangage;
          console.warn(
            `I18N: The langage "${newLangage}" doesn't exist. Switched to "${destinationLangage}".`
          );
        }
        this.langage.value.lang = destinationLangage;
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
    const langage = this.getHook();

    return (
      obj: string | { key: string; defaultMessage: string },
      data: Record<string, string> = {}
    ) => {
      const isObj = typeof obj === 'object';

      const key = isObj ? obj.key : obj;
      const defaultMessage = isObj ? obj.defaultMessage : obj;

      const dataReg = /\{\{\s*(.+?)\s*\}\}/gi;
      const messages = this.settings.messages[langage.getLangage()];
      let message = domy.utils.get<string>(messages, key);

      if (!message) {
        console.warn(`I18N: Invalide key "${key}".`);
        return defaultMessage;
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
    throw new Error(`I18N: The current langage "${options.currentLangage}" must be in messages.`);
  }

  if (!(options.defaultCallbackLangage in options.messages)) {
    throw new Error(
      `I18N: The default callback langage "${options.defaultCallbackLangage}" must be in messages.`
    );
  }

  const i18nInstance = new I18NHelper(options);

  return {
    useI18n: () => {
      const helperToHook = window.DOMY.helperToHookRegistrer.getHook;
      const hook = {
        t: helperToHook(i18nInstance.messageHandler.bind(i18nInstance) as any)() as ReturnType<
          I18NHelper['messageHandler']
        >,
        ...i18nInstance.getHook()
      };
      return hook;
    },
    i18nPlugin: (domyPluginSetter: DomyPluginDefinition) => {
      domyPluginSetter.helper('i18n', i18nInstance.getHook.bind(i18nInstance));
      domyPluginSetter.helper('t', i18nInstance.messageHandler.bind(i18nInstance));
    }
  };
}

export default i18n;
