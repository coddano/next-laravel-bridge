import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Sanctum Authentication',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Full integration with Laravel Sanctum. Login, logout, user fetching,
        and route protection with Middleware and HOCs.
      </>
    ),
  },
  {
    title: 'React Query Power',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Fetch data from your Laravel API with caching, automatic refetching,
        and easy mutation management.
      </>
    ),
  },
  {
    title: 'Access Control (ACL)',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Manage roles and permissions with ease using the <code>useGate</code> hook
        and the <code>&lt;Can&gt;</code> component.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {/* Placeholder for now if no SVG */}
        {/* <Svg className={styles.featureSvg} role="img" /> */}
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
