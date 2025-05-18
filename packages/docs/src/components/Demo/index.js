import { useEffect, useRef } from 'react';
import DOMY from '@site/static/index.js';
import styles from './styles.module.css';

if (!window.DOMY) window.DOMY = DOMY;

const Demo = ({ code, domy, components }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = code;
    DOMY.createApp(domy).components(components?.()).mount(ref.current);
  }, []);

  return <div className={styles.demo} ref={ref} />;
};

export default Demo;
