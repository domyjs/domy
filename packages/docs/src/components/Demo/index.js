import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import DOMY from '../../../../domy/dist';

const Demo = ({ code, domy, components, config, plugins }) => {
  const ref = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isMounted) return;

    const load = async () => {
      try {
        if (!ref.current || typeof window === 'undefined') return;

        if (!window.DOMY) window.DOMY = DOMY;

        ref.current.innerHTML = code;

        const loadedPlugins = plugins ? await plugins() : [];

        DOMY.createApp(domy)
          .configure(config ?? {})
          .plugins(loadedPlugins)
          .components(components?.())
          .mount(ref.current);

        setIsMounted(true);
      } catch (err) {
        console.error('[Demo] Load error:', err);
      }
    };

    load();
  }, [ref.current, isMounted]);

  return <div className={styles.demo} ref={ref} />;
};

export default Demo;
