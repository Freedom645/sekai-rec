import { ref } from 'vue';

type DialogText = {
  title?: string;
  text?: string;
  ok?: string;
  cancel?: string;
};

interface NoticeText {
  title?: string;
  text?: string;
  close?: string;
}

const isOpen = ref<boolean>(false);

const dialogText = ref<DialogText>({
  title: '確認',
  text: '',
  ok: 'OK',
  cancel: 'キャンセル',
});

let _resolve: (value: boolean | PromiseLike<boolean>) => void;

export function useConfirmDialog() {
  const confirm = (props: DialogText = {}) => {
    dialogText.value.title = props.title ?? '確認';
    dialogText.value.text = props.text ?? '';
    dialogText.value.ok = props.ok ?? 'OK';
    dialogText.value.cancel = props.cancel ?? 'キャンセル';
    isOpen.value = true;
    return new Promise<boolean>((resolve) => {
      _resolve = resolve;
    });
  };

  const notice = (props: NoticeText = {}) => {
    dialogText.value.title = props.title ?? '確認';
    dialogText.value.text = props.text ?? '';
    dialogText.value.ok = '';
    dialogText.value.cancel = props.close ?? '閉じる';
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
    notice,
    ok,
    cancel,
    close,
    isOpen,
    dialogText,
  };
}
