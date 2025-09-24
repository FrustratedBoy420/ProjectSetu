export type DonationEventDetail = { projectId: string; amount: number };

export const DONATION_EVENT = 'setu:donation';

export function emitDonationEvent(detail: DonationEventDetail): void {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent(DONATION_EVENT, { detail }));
    }
}

export function onDonationEvent(handler: (detail: DonationEventDetail) => void): () => void {
    const listener = (e: Event) => {
        const ce = e as CustomEvent<DonationEventDetail>;
        handler(ce.detail);
    };
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener(DONATION_EVENT, listener as EventListener);
    }
    return () => {
        if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
            window.removeEventListener(DONATION_EVENT, listener as EventListener);
        }
    };
}


