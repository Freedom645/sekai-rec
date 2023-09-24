import { ref } from 'vue';

const isShow = ref<boolean>(false);

interface Settings {
  color?: string;
  size?: number;
  width?: number;
}

const settings = ref<Settings>({
  color: 'primary',
  size: 64,
  width: 6,
});

export const useProgressOverlay = () => {
  const show = (props: Settings = {}) => {
    settings.value.color = props.color ?? 'primary';
    settings.value.size = props.size ?? 64;
    settings.value.width = props.width ?? 6;
    isShow.value = true;
  };

  const hidden = () => {
    isShow.value = false;
  };

  return {
    show,
    hidden,
    isShow,
    settings,
  };
};
