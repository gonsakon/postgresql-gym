import { createApp, h } from "vue";
import { createRouter, createWebHashHistory, RouterView } from "vue-router";
import App from "./App.vue";
import { lessons } from "./courseData";
import "./styles.css";

// 每關一個網址：/#/lesson/:lessonId。用 hash 模式，純前端路由——
// 部署到 GitHub Pages 等靜態主機時，深連結／重整不會 404，也不需要 server 設定。
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: `/lesson/${lessons[0].id}` },
    { path: "/lesson/:lessonId", name: "lesson", component: App },
    { path: "/:pathMatch(.*)*", redirect: `/lesson/${lessons[0].id}` }
  ]
});

createApp({ render: () => h(RouterView) }).use(router).mount("#app");
