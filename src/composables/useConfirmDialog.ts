import { ref } from 'vue';

type DialogText = {
  title?: string;
  text?: string;
  ok?: string;
  cancel?: string;
};

const isOpen = ref<boolean>(false);

const dialogText = ref<DialogText>({
  title: '確認',
  text: '',
  ok: 'OK',
  cancel: 'キャンセル',
});

export function useConfirmDialog() {
  let _resolve: (value: boolean | PromiseLike<boolean>) => void;
  const confirm = (props: DialogText = {}) => {
    dialogText.value.title = props.title ?? '確認';
    dialogText.value.text = props.text;
    dialogText.value.ok = props.ok ?? 'OK';
    dialogText.value.cancel = props.cancel ?? 'キャンセル';
    isOpen.value = true;
    return new Promise<boolean>((resolve) => {
      _resolve = resolve;
    });
  };

  const ok = () => {
    isOpen.value = false;
    _resolve(true);
  };

  const cancel = () => {
    isOpen.value = false;
    _resolve(false);
  };

  const close = () => {
    isOpen.value = false;
  };

  return {
    confirm,
    ok,
    cancel,
    close,
    isOpen,
    dialogText,
  };
}
