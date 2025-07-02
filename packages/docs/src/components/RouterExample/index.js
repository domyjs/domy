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

    .slide-enter {
      position: absolute;
      transition: all 0.5s ease;
      transform: translateX(5rem);
      opacity: 0;
    }

    .slide-enter-to {
      transform: translateX(0rem);
      opacity: 1;
    }

    .slide-out {
      position: absolute;
      transition: all 0.5s ease;
      opacity: 1;
    }

    .slide-out-to {
      transform: translateX(-5rem);
      opacity: 0;
    }
</style>
<nav>
  <router-link to="/" active-class="underline">Home</router-link>
  <router-link to="/about" active-class="underline">About</router-link>
  <router-link to="/user/42" active-class="underline">User</router-link>
</nav>

<div style="height: 4rem; position: relative; overflow: hidden">
  <router-view transition="slide"></router-view>
</div>

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
