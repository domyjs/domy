import createRouter from '../../../../router';
import DOMY from '@domyjs/core';
import Demo from '../Demo';

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

export default function RouterExample() {
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
        RouterLink,
        RouterView
      })}
      plugins={() => [router]}
    />
  );
}
