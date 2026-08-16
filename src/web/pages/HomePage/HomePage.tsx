import { useState } from 'react'
import Drawer from '../../components/Drawer/Drawer'
import Hero from '../../components/Hero/Hero'

export default function HomePage() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const openDrawer = () => setIsDrawerOpen(true)
    const closeDrawer = () => setIsDrawerOpen(false)

  return (
  <>
        <div className="home-page-hero">
            <Hero
                title="We are Microsoft specialists"
                subtitle="Track change, reduce surprises, and communicate with confidence through a practical, searchable knowledge hub."
                ctaLabel="See how it works"
                onCtaClick={openDrawer}
                imageSrc="https://cdn.365evergreen.com/media/plant-cover-1440-900.webp"
                imageAlt="Green plant stems in a glass vase on a white surface" />
        </div>
        <div>
            Pauli
        </div>
        <Drawer
            isOpen={isDrawerOpen}
            onClose={closeDrawer}
            title="Start a conversation"
            description="Tell us" /></>
    )
}