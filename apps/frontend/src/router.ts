import Vue from "vue";
import Router from "vue-router";
import Dashboard from "./views/Dashboard.vue";

Vue.use(Router);

export function createRouter() {
  return new Router({
    mode: "history",
    base: import.meta.env.BASE_URL,
    routes: [
      {
        path: "/",
        component: Dashboard,
        alias: ["/quorum-monitor/:view?"],
        props: (route) => ({ view: route.query.view }),
        children: [
          {
            name: "network-dashboard",
            path: "/",
            alias: ["/network/stellar-public", "quorum-monitor"],
            components: {
              dashboard: () =>
                import("@/components/network/network-dashboard.vue"),
              sideBar: () =>
                import("@/components/network/sidebar/network-side-bar.vue"),
            },
            props: (route) => ({ view: route.query.view }),
            children: [],
          },
          {
            name: "node-dashboard",
            path: "nodes/:publicKey",
            alias: "quorum-monitor/:publicKey",
            components: {
              dashboard: () =>
                import(
                  /* webpackChunkName: "node-dashboard" */ "@/components/node/node-dashboard.vue"
                ),
              sideBar: () =>
                import(
                  /* webpackChunkName: "node-dashboard" */ "@/components/node/sidebar/node-side-bar.vue"
                ),
            },
            props: (route) => ({ view: route.query.view }),
          },
          {
            name: "organization-dashboard",
            path: "organizations/:organizationId",
            components: {
              dashboard: () =>
                import(
                  /* webpackChunkName: "organization-dashboard" */ "@/components/organization/organization-dashboard.vue"
                ),
              sideBar: () =>
                import(
                  /* webpackChunkName: "organization-dashboard" */ "@/components/organization/sidebar/organization-side-bar.vue"
                ),
            },
            props: (route) => ({ view: route.query.view }),
          },
        ],
      },
      {
        name: "nodes",
        path: "/nodes",
        component: () =>
          import(/* webpackChunkName: "nodes" */ "@/views/Nodes.vue"),
      },
      {
        name: "organizations",
        path: "/organizations",
        component: () =>
          import(
            /* webpackChunkName: "organizations" */ "@/views/Organizations.vue"
          ),
      },
      {
        name: "faq",
        path: "/faq",
        component: () =>
          import(/* webpackChunkName: "faq" */ "@/views/FAQ.vue"),
      },
      {
        name: "docs",
        path: "/docs",
        component: () =>
          import(/* webpackChunkName: "faq" */ "@/views/Docs.vue"),
      },
      {
        name: "federated-voting",
        path: "/federated-voting",
        component: () =>
          import(
            /* webpackChunkName: "federated-voting" */ "@/views/FederatedVoting.vue"
          ),
      },
      {
        path: "/notify",
        component: () =>
          import(/* webpackChunkName: "api" */ "@/views/Notify.vue"),

        children: [
          {
            name: "subscribe",
            path: "",
            component: () =>
              import(
                /* webpackChunkName: "notify-subscribe" */ "@/components/notify/subscribe.vue"
              ),
          },
          {
            name: "confirm",
            path: ":pendingSubscriptionId/confirm",
            component: () =>
              import(
                /* webpackChunkName: "notify-subscription-confirmed" */ "@/components/notify/confirm.vue"
              ),
          },
          {
            name: "unmute",
            path: ":subscriberRef/unmute",
            component: () =>
              import(
                /* webpackChunkName: "notify-subscription-unmute" */ "@/components/notify/unmute.vue"
              ),
          },
          {
            name: "unsubscribe",
            path: ":subscriberRef/unsubscribe",
            component: () =>
              import(
                /* webpackChunkName: "notify-subscription-unsubscribe" */ "@/components/notify/unsubscribe.vue"
              ),
          },
        ],
      },
      {
        name: "terms-and-conditions",
        path: "/terms-and-conditions",
        component: () =>
          import(
            /* webpackChunkName: "tac" */ "@/views/TermsAndConditions.vue"
          ),
      },
      {
        name: "privacy",
        path: "/privacy",
        component: () =>
          import(
            /* webpackChunkName: "notify-subscription-unsubscribe" */ "@/views/privacy-policy.vue"
          ),
      },
    ],

    scrollBehavior(to, from, savedPosition) {
      if (to.query["no-scroll"] === "1") {
        return;
      }

      // default we scroll to top or use history
      if (savedPosition) {
        return savedPosition;
      } else {
        return { x: 0, y: 0 };
      }
    },
  });
}
