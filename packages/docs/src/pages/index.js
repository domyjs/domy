import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import Logo from '@site/static/img/domy.png';
import CodeBlock from '@theme/CodeBlock';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <img src={Logo} alt="DOMY.js Logo" width={200} />
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/get-started">
            Get started →
          </Link>
        </div>
      </div>
    </header>
  );
}

function Feature({ title, description }) {
  return (
    <div className={clsx('col col--4', styles.feature)}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

const features = [
  {
    title: 'Lightweight and Fast',
    description:
      'DOMY.js is a minimalistic UI framework, perfect for small projects or embedding in larger applications.'
  },
  {
    title: 'Native Components',
    description:
      'Define components using plain HTML and simple logic, making your code clean and readable.'
  },
  {
    title: 'Reactive by Design',
    description:
      'Inspired by Vue and Alpine, DOMY.js offers seamless reactivity out of the box without complex APIs.'
  },
  {
    title: 'No Virtual DOM',
    description:
      "DOMY.js doesn't use any virtual DOM for rendering your content. It directly interacts with the real DOM."
  },
  {
    title: 'Directive-Based Syntax',
    description:
      'Build your UI declaratively using familiar directives like d-if, d-for, and d-watch.'
  },
  {
    title: 'Zero Dependencies',
    description:
      'DOMY.js runs with zero external dependencies, making it ideal for embedding, performance, and portability.'
  }
];

function HomepageFeatures() {
  return (
    <section>
      <div className="container">
        <div className={clsx('row', styles.features)}>
          {features.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <section className={styles.quickExample}>
          <div className="container text--center">
            <Heading as="h2">Quick Example</Heading>
            <p>This is a simple counter example with DOMY.js:</p>
            <div className={styles.codeBlock}>
              <CodeBlock language="html">
                {`<script src="https://unpkg.com/@domyjs/core@1.x.x"></script>

<p>Count: {{ count }}</p>
<button @click="count++">Increment</button>
<button @click="count--">Decrement</button>

<script>
  const { signal, watch } = DOMY;
  DOMY.createApp(() => {
    const count = signal(0);

    watch(
      ({ prevValue, newValue }) => {
        if (newValue < 0) count.value = prevValue;
      },
      () => count
    );

    return {
      count
    };
  }).mount();
</script>`}
              </CodeBlock>
            </div>
            <p>
              Or a basic implementation with <b>d-scope</b>:
            </p>
            <div className={styles.codeBlock}>
              <CodeBlock language="html">
                {`<script src="https://unpkg.com/@domyjs/core@1.x.x"></script>

<div d-scope="{ count: 0 }">
  <p>Count: {{ count }}</p>
  <button @click="count++">Increment</button>
  <button @click="count--">Decrement</button>
</div>

<script>
  DOMY.createApp().mount();
</script>`}
              </CodeBlock>
            </div>
            <p>
              <Link to="/docs/get-started" className="button button--primary">
                Learn more →
              </Link>
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
