import Hero from '@/features/home/Hero';
import HowItWorks from '@/features/home/HowItWorks';
import MenuPreview from '@/features/home/MenuPreview';
import PickupPolicy from '@/features/home/PickupPolicy';
import ClosingCta from '@/features/home/ClosingCta';
import { getMenuPreview } from '@/features/home/get-menu-preview';

// The menu changes rarely: rebuild this page's data at most every 5 minutes.
export const revalidate = 300;

export default async function HomePage() {
    const menu = await getMenuPreview();

    return (
        <>
            <Hero />
            <HowItWorks />
            <MenuPreview items={menu} />
            <PickupPolicy />
            <ClosingCta />
        </>
    );
}
