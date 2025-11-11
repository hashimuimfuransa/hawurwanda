import { useTranslationStore } from '../translationStore';

export const useTranslation = () => {
  const { t } = useTranslationStore();
  return t;
};