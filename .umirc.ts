import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/login", component: "index", layout: false },
    {
      path: "/",
      component: "@/layouts/index",
      wrappers: ["@/wrappers/auth"],
      layout: false,
      routes: [
        { path: "", component: "@/pages/home" },
        { path: "home", component: "@/pages/home" },
        { path: "follow", component: "@/pages/follow" },
        { path: "profile", component: "@/pages/profile" },
        { path: "profile/:address", component: "@/pages/profile" },
        { path: "tweet/:id", component: "@/pages/tweet" },
        { path: "setting", component: "@/pages/setting" },
      ],
    },
    {
      path: "/dashboardLogin",
      component: "@/pages/dashboard/login",
      layout: false,
    },
    {
      path: "/dashboard",
      component: "@/layouts/dashboard",
      layout: false,
      routes: [
        { path: "/dashboard/styles", component: "@/pages/dashboard/styles" },
        { path: "/dashboard/fees", component: "@/pages/dashboard/fees" },
        { path: "/dashboard/rpc", component: "@/pages/dashboard/rpc" },
      ],
    },
  ],

  plugins: ["@umijs/plugins/dist/model", "@umijs/plugins/dist/request"],
  model: {},
  request: {},
  npmClient: "pnpm",
  // outputPath: '../server-shownow/public',
  esbuildMinifyIIFE: true,
});
