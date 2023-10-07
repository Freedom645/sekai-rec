import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import ScoreAnalyzerView from '@/views/ScoreAnalyzerView.vue';
import ScoreRegisterView from '@/views/ScoreRegisterView.vue';
import HighScoreView from '@/views/HighScoreView.vue';
import SettingsView from '@/views/SettingsView.vue';
import PresetSettings from '@/views/SettingsViews/PresetSettings.vue';

export const RouterNames = {
  HOME: 'home',
  REGISTER: {
    MANUAL: 'register-manual',
    IMAGE: 'register-image',
  },
  SCORE: 'score',
  SETTINGS: {
    PRESET: 'settings-preset',
  },
} as const;

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: RouterNames.HOME,
      path: '/',
      component: HomeView,
      meta: { name: 'ホーム' },
    },
    {
      name: RouterNames.REGISTER.MANUAL,
      path: '/register/manual',
      component: ScoreRegisterView,
      meta: { name: 'スコア登録' },
    },
    {
      name: RouterNames.REGISTER.IMAGE,
      path: '/register/image',
      component: ScoreAnalyzerView,
      meta: { name: 'スコア登録' },
    },
    {
      name: RouterNames.SCORE,
      path: '/score',
      component: HighScoreView,
      meta: { name: 'ハイスコア一覧' },
    },
    {
      path: '/settings',
      component: SettingsView,
      meta: { name: '設定' },
      redirect: { name: RouterNames.SETTINGS.PRESET },
      children: [
        {
          name: RouterNames.SETTINGS.PRESET,
          path: 'preset',
          component: PresetSettings,
        },
        {
          path: '/settings/:pathMatch(.*)*',
          redirect: { name: RouterNames.SETTINGS.PRESET },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: RouterNames.HOME },
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
