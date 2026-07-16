let tossLoadPromise: Promise<any> | null = null;

export function loadTossPayments(): Promise<any> {
  if (tossLoadPromise) return tossLoadPromise;

  tossLoadPromise = new Promise((resolve, reject) => {
    const existing = (window as any).TossPayments;
    if (existing) {
      resolve(existing);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.async = true;
    script.onload = () => resolve((window as any).TossPayments);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return tossLoadPromise;
}
