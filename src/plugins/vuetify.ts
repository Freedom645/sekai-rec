import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'main',
    variations: false,
    themes: {
      main: {
        dark: true,
        colors: {
          primary: '#ff80fb',
          secondary: '#80faff',
          accent: '#80ffc3',
          error: '#ff8480',
          warning: '#ff5722',
          info: '#03a9f4',
          success: '#4caf50',
        },
      },
    },
  },
});

export default vuetify;
