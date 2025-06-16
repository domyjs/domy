import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

const Demo = ({ code, domy, components, config, plugins }) => {
  const ref = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsClient(true);

    const load = async () => {
      if (!ref.current || typeof window === 'undefined') return;

      const { default: DOMY } = await import('../../../../domy/dist');

      if (!window.DOMY) window.DOMY = DOMY;

      ref.current.innerHTML = code;
      DOMY.createApp(domy)
        .configure(config ?? {})
        .plugins((await plugins?.()) ?? [])
        .components(components?.())
        .mount(ref.current);
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Return empty container if not on client
  if (!isClient) return <div className={styles.demo} />;

  return <div className={styles.demo} ref={ref} />;
};

export default Demo;
