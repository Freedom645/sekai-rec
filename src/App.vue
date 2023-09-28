<template>
  <v-app>
    <v-app-bar>
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer" />
      </template>
      <v-app-bar-title>
        <RouterLink to="/">Sekai Rec</RouterLink>
      </v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list nav>
        <RouterLink v-for="menu in sideMenuList" :key="menu.title" :to="menu.to">
          <v-list-item :prepend-icon="menu.icon" :title="menu.title" :value="menu.title" />
        </RouterLink>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="main-container pa-0">
        <RouterView />
      </v-container>
    </v-main>

    <confirm-dialog />
    <progress-overlay />
  </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { RouterView, RouterLink } from 'vue-router';
import {
  VApp,
  VAppBar,
  VAppBarNavIcon,
  VAppBarTitle,
  VNavigationDrawer,
  VList,
  VListItem,
  VMain,
  VContainer,
} from 'vuetify/components';
import ConfirmDialog from '@/components/utils/ConfirmDialog.vue';
import ProgressOverlay from '@/components/utils/ProgressOverlay.vue';

const drawer = ref(true);
const sideMenuList = [
  { title: 'ホーム', to: '/', icon: 'mdi-home' },
  { title: 'スコア登録', to: '/register', icon: 'mdi-pencil-plus' },
  { title: 'スコア解析', to: '/register-image', icon: 'mdi-text-recognition' },
  { title: 'ハイスコア一覧', to: '/score', icon: 'mdi-file-document-multiple' },
];
</script>

<style scoped>
.main-container {
  max-width: 1280px;
  background-color: var(--color-background);
  min-height: calc(100vh - 64px);
}
</style>
