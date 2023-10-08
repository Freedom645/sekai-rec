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
        <template v-for="menu in sideMenuList" :key="menu.title">
          <template v-if="isMenuGroup(menu)">
            <v-list-group :title="menu.title" :group="menu.path">
              <template v-slot:activator="{ props }">
                <v-list-item v-bind="props" :prepend-icon="menu.prependIcon" :title="menu.title" />
              </template>
              <RouterLink v-for="item in menu.list" :key="item.title" :to="menu.path + item.path">
                <v-list-item :prepend-icon="item.prependIcon" :title="item.title" :value="item.title" />
              </RouterLink>
            </v-list-group>
          </template>
          <template v-if="isMenuItem(menu)">
            <RouterLink :to="menu.path">
              <v-list-item :prepend-icon="menu.prependIcon" :title="menu.title" :value="menu.title" />
            </RouterLink>
          </template>
        </template>
        <!-- <RouterLink v-for="menu in sideMenuList" :key="menu.title" :to="menu.to">
          <v-list-item :prepend-icon="menu.icon" :title="menu.title" :value="menu.title" />
        </RouterLink> -->
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
interface MenuGroup {
  type: 'group';
  title: string;
  path: string;
  list: MenuItem[];
  prependIcon?: string;
}

interface MenuItem {
  type: 'item';
  title: string;
  path: string;
  prependIcon?: string;
}

const sideMenuList: (MenuGroup | MenuItem)[] = [
  { type: 'item', title: 'ホーム', path: '/', prependIcon: 'mdi-home' },
  {
    type: 'group',
    title: 'スコア登録',
    path: '/register',
    prependIcon: 'mdi-pencil-plus',
    list: [
      { type: 'item', title: '手動', path: '/manual', prependIcon: 'mdi-gesture-tap' },
      { type: 'item', title: '画像解析', path: '/image', prependIcon: 'mdi-text-recognition' },
    ],
  },
  { type: 'item', title: 'ハイスコア一覧', path: '/score', prependIcon: 'mdi-file-document-multiple' },
  {
    type: 'group',
    title: '設定',
    path: '/settings',
    prependIcon: 'mdi-cog',
    list: [{ type: 'item', title: '解析プリセット', path: '/preset', prependIcon: 'mdi-tune-variant' }],
  },
];

function isMenuGroup(arg: any): arg is MenuGroup {
  return arg?.type === 'group';
}

function isMenuItem(arg: any): arg is MenuItem {
  return arg?.type === 'item';
}
</script>

<style scoped>
.main-container {
  max-width: 1280px;
  background-color: var(--color-background);
  min-height: calc(100vh - 64px);
}
</style>
