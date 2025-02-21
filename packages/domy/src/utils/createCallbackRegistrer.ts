type Callback = () => void;

/**
 * Allow to create a registrer for callbacks
 * Usefull for onMounted, onUnmount ...
 * @returns
 *
 * @author yoannchb-pro
 */
export function createCallbackRegistrer<T = Callback>() {
  const callbackList: T[] = [];

  return {
    fn(cb: T) {
      callbackList.push(cb);
    },
    clear() {
      callbackList.length = 0;
    },
    getCallbacks() {
      return callbackList;
    }
  };
}
