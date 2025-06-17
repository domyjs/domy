import { useEffect, useState } from 'react';
import Demo from '../Demo';
import createRouter from '../../../../router';
import DOMY from '../../../../domy/dist';

export default function RouterExample() {
  const [routerDeps, setRouterDeps] = useState(null);

  useEffect(() => {
    if (routerDeps) return;

    const load = () => {
      if (!window.DOMY) window.DOMY = DOMY;

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
  }, [routerDeps]);

  if (!routerDeps) return <div>Loading DOMY router…</div>;

  return (
    <Demo
      code={`
<style>
.underline{
  text-decoration: underline;
}

    .fade-enter {
      transition: all 0.3s ease;
      opacity: 0;
    }

    .fade-enter-to {
      opacity: 1;
    }

    .fade-out {
      transition: all 0.3s ease;
      opacity: 1;
    }

    .fade-out-to {
      opacity: 0;
    }
</style>
<nav>
  <router-link to="/" active-class="underline">Home</router-link>
  <router-link to="/about" active-class="underline">About</router-link>
  <router-link to="/user/42" active-class="underline">User</router-link>
</nav>

<router-view transition="fade"></router-view>

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
