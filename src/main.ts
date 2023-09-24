import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';

import './assets/main.css';

const app = createApp(App).use(createPinia()).use(router).use(vuetify);

app.mount('#app');
