import { useRouter } from 'next/navigation';

export default function useBack() {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  return goBack;
}