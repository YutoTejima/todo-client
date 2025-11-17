import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
    },
    {
      path: '/signup',
      // Vue Router で Dynamic Import をすると、 Code Splitting が有効になる
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '/login',
      // Vue Router で Dynamic Import をすると、 Code Splitting が有効になる
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/add-task',
      component: () => import('../views/AddTaskView.vue'),
    },
    {
      path: '/tasks',
      component: () => import('../views/taskCollectionView.vue'),
    },
  ],
});

export default router;
