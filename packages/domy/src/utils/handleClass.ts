/**
 * Handle class attribute if it's a string or an object like
 * { show: true }
 * or
 * ["show"]
 * @param executedValue
 * @param defaultClass
 *
 * @author yoannchb-pro
 */
export function handleClass(
  executedValue: any,
  defaultClass: string = ''
): { class: string; cleanedClass: (newDefaultClass: string) => string } {
  const classNames = new Set(defaultClass.split(/\s+/).filter(Boolean));
  const added = new Set<string>();

  if (typeof executedValue === 'string') {
    executedValue.split(/\s+/).forEach(cls => {
      classNames.add(cls);
      added.add(cls);
    });
  } else if (Array.isArray(executedValue)) {
    executedValue.forEach(cls => {
      classNames.add(cls);
      added.add(cls);
    });
  } else if (executedValue && typeof executedValue === 'object') {
    for (const [cls, shouldAdd] of Object.entries(executedValue)) {
      if (shouldAdd) {
        classNames.add(cls);
        added.add(cls);
      }
    }
  }

  const merged = [...classNames].join(' ');

  function cleanedClass(newDefaultClass: string): string {
    return newDefaultClass
      .split(/\s+/)
      .filter(cls => cls && !added.has(cls))
      .join(' ');
  }

  return { class: merged, cleanedClass };
}
