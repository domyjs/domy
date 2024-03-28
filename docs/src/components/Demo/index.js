import React, { useEffect, useRef } from 'react';
import DOMY from '@site/static/index.js';
import styles from './styles.module.css';

const Demo = ({ code, domy }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = code;
      DOMY(domy);
    }
  }, [code, domy]);

  return (
    <>
      <div className={styles.demo} ref={ref} />
    </>
  );
};

export default Demo;
