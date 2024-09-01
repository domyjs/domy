import type { DomyPluginDefinition, DomySpecialHelper } from '@domyjs/core/src/types/Domy';
import { get } from './get';

type Dict = {
  [key: string]: string | Dict;
};

type Settings = {
  messages: Record<string, Dict>;
  currentLangage: string;
  defaultCallbackLangage: string;
};

let langage: { lang: string };
let settings: Settings;

/**
 * Give the i18n helper
 * It allow us to get/set the langage
 * @param domy
 * @returns
 *
 * @author yoannchb-pro
 */
function getI18nHelper(domy: DomySpecialHelper) {
  if (!langage) langage = domy.reactive({ lang: settings.currentLangage });

  return {
    getSupportedLangages() {
      return Object.keys(settings.messages);
    },
    getLangage() {
      return langage.lang;
    },
    setLangage(newLangage: string) {
      let destinationLangage = newLangage;
      if (!(newLangage in settings.messages)) {
        destinationLangage = settings.defaultCallbackLangage;
        console.warn(
          `(I18N) The langage "${newLangage}" doesn't exist. Switched to "${destinationLangage}".`
        );
      }
      langage.lang = destinationLangage;
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
function messageHandler(domy: DomySpecialHelper) {
  const langage = getI18nHelper(domy);

  return (key: string, data: Record<string, string> = {}) => {
    const dataReg = /\{\{\s*(.+?)\s*\}\}/gi;
    const messages = settings.messages[langage.getLangage()];
    let message = get(messages, key) as string | false;

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

  settings = options;

  return (domyPluginSetter: DomyPluginDefinition) => {
    domyPluginSetter.helper('i18n', getI18nHelper);
    domyPluginSetter.helper('t', messageHandler);
  };
}

export default i18n;
