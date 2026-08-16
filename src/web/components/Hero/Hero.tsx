import { Link } from 'react-router-dom'
import type { HeroProps } from './Hero.types'
import styles from './Hero.module.css'

export default function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaLink,
  onCtaClick,
  imageSrc,
  imageAlt,
}: HeroProps) {
  const backgroundImageUrl =
    imageSrc || 'https://cdn.365evergreen.com/media/plant-cover-1440-900.webp'

  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className={styles.content}>
        <div className={styles.copy}>
                  <h1 id="home-hero-title" className={styles.title}>
            {title}
          </h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {ctaLabel ? (
          onCtaClick ? (
            <button type="button" className={styles.cta} onClick={onCtaClick}>
              {ctaLabel}
            </button>
          ) : ctaLink ? (
            <Link to={ctaLink} className={styles.cta}>
              {ctaLabel}
            </Link>
          ) : null
        ) : null}
      </div>
      <div
        className={styles.image}
        role="img"
        aria-label={imageAlt}
        style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
      />
    </section>
  )
}
