import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AddTaskView from '@/views/AddTaskView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
    },
    {
      path: '/add-task',
      component: AddTaskView,
    },
    {
      path: '/tasks',
      component: () => import('../views/taskCollectionView.vue'),
    },
  ],
});

export default router;
