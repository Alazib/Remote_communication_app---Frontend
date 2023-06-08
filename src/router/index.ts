import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import { setupLayouts } from 'virtual:generated-layouts';
import generatedRoutes from 'virtual:generated-pages';
import { useAuthStore } from 'src/stores/auth';

const routes = setupLayouts(generatedRoutes);

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from) => {
    const event: Record<string, unknown> = { to: to, from: from };

    event.redirectTo = `/auth/?next=${to.path}`;

    const authStore = useAuthStore();

    const userIsNotRegister = !authStore.isLoggedIn;
    const viewNeedsAuth = to.meta.authRequired === true;
    const avoidInfiniteRedirectionLoop = to.name !== 'auth';

    console.log('DESDE', from, from.meta.authRequired);
    console.log('HACIA', to, to.meta.authRequired);

    if (userIsNotRegister && viewNeedsAuth && avoidInfiniteRedirectionLoop) {
      console.log('REDIRIGIENDO a' + event.redirectTo, viewNeedsAuth);
      return event.redirectTo as string;
    }
  });

  return Router;
});
