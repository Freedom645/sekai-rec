import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import ScoreAnalyzerView from '@/views/ScoreAnalyzerView.vue';
import ScoreRegisterView from '@/views/ScoreRegisterView.vue';
import HighScoreView from '@/views/HighScoreView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
      meta: { name: 'ホーム' },
    },
    {
      path: '/register',
      component: ScoreRegisterView,
      meta: { name: 'スコア登録' },
    },
    {
      path: '/register-image',
      component: ScoreAnalyzerView,
      meta: { name: 'スコア解析' },
    },
    {
      path: '/score',
      component: HighScoreView,
      meta: { name: 'ハイスコア一覧' },
    },
  ],
});

router.afterEach((to) => {
  const title = 'Sekai Rec';
  if (typeof to.meta?.name === 'string') {
    document.title = `${to.meta.name} |  ${title}`;
  } else {
    document.title = title;
  }
});

export default router;
