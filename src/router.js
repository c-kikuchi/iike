import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import Viewer from "./viewer/index.vue"
import Meta from "./views/metaView.vue"
import Login from "./views/loginView.vue"
import akiyasuOcrSearchView from './views/akiyasuOcrSearchView.vue'
import Storetest from "./views/storetest.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    /*{
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/AboutView.vue')
    },*/
    {
      path: "/viewer/:bookid/:page?",
      name: "viewer",
      component: Viewer,
      beforeEnter(to, from, next){
        next();
      }
    },
    {
      path: "/ocrtext"
    },
    {
      path: "/meta/:bookid",
      name: "meta",
      component: Meta
    },
    {
      path: "/login",
      name:"login",
      component: Login
    },
    {
      path: "/storetest",
      name:"storetest",
      component: Storetest
    },
    {
      path: "/akiyasu-search/:word?",
      name:"akiyasu",
      component: akiyasuOcrSearchView
    }
  ]
})

export default router
