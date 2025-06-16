import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

const Demo = ({ code, domy, components, config, plugins }) => {
  const ref = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsClient(true);

    const load = async () => {
      try {
        if (!ref.current || typeof window === 'undefined') return;

        const { default: DOMY } = await import('../../../../domy/dist');

        if (!window.DOMY) window.DOMY = DOMY;

        console.log('DOMY');
        ref.current.innerHTML = code;

        const loadedPlugins = plugins ? await plugins() : [];

        DOMY.createApp(domy)
          .configure(config ?? {})
          .plugins(loadedPlugins)
          .components(components?.())
          .mount(ref.current);
      } catch (err) {
        console.error('[Demo] Load error:', err);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [isClient]);

  // Return empty container if not on client
  if (!isClient) return <div className={styles.demo}>Loading...</div>;

  return <div className={styles.demo} ref={ref} />;
};

export default Demo;
