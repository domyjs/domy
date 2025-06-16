import { useEffect, useState } from 'react';
import Demo from '../Demo';

export default function RouterExample() {
  const [routerDeps, setRouterDeps] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [{ default: DOMY }, createRouter] = await Promise.all([
        import('@domyjs/core'),
        import('../../../../router')
      ]);

      function r(path, name) {
        return {
          route: path,
          name,
          component: DOMY.createComponent({
            html: `<div><h1>${name}</h1></div>`
          })
        };
      }

      const routes = [r('/', 'Home'), r('/about', 'About'), r('/user/:id', 'User')];
      const { router, RouterView, RouterLink } = createRouter({
        hashMode: true,
        routes
      });

      setRouterDeps({ router, RouterView, RouterLink });
    };

    load();
  }, []);

  if (!routerDeps) return <div>Loading DOMY router…</div>;

  return (
    <Demo
      code={`
<nav>
  <router-link to="/">Home</router-link>
  <router-link to="/about">About</router-link>
  <router-link to="/user/42">User</router-link>
</nav>

<router-view></router-view>

<footer>
  Current route: {{ $router.path }}<br />
  Parameters: {{ JSON.stringify($router.params) }}
</footer>
`}
      components={() => ({
        RouterView: routerDeps.RouterView,
        RouterLink: routerDeps.RouterLink
      })}
      plugins={() => [routerDeps.router]}
    />
  );
}
