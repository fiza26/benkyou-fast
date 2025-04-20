import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LearnView from '../views/LearnView.vue'
import LearnTwoView from '../views/LearnTwoView.vue'
import LearnThreeView from '../views/LearnThreeView.vue'
import LoginView from '../views/LoginView.vue'
import supabase from '@/supabase'

let localUser

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/learn',
      name: 'learn',
      component: LearnView,
      meta: { requiresAuth: true }
    },
    {
      path: '/learntwo',
      name: 'learntwo',
      component: LearnTwoView,
      meta: { requiresAuth: true }
    },
    {
      path: '/learnthree',
      name: 'learnthree',
      component: LearnThreeView,
      // meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView 
    }
  ]
})

async function getUser(next) {
  localUser = await supabase.auth.getSession();
  if (localUser.data.session == null) {
    next('/login');
  } else {
    next();
  }
}

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    getUser(next);
  } else {
    next();
  }
})

export default router
