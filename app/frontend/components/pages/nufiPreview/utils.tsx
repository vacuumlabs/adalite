import {h, JSX} from 'preact'

type NufiListProps = {
  title?: string
  list: string[]
  icon?: JSX.Element
}

export const NufiList = ({title, list, icon}: NufiListProps) => {
  return (
    <div className="np-space-y-3">
      {title && <h2 className="np-heading np-heading--md">{title}</h2>}
      <ul className={`np-ul ${icon ? 'np-ul--icon' : ''} np-space-y-3`}>
        {list.map((item, index) => (
          <li key={index}>
            {icon && <span>{icon}</span>}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type NudiCardProps = {
  text: JSX.Element
  icon: JSX.Element
  href: string
}

export const NufiCard = ({icon, text, href}: NudiCardProps) => {
  return (
    <a href={href} className="np-card" target="_blank">
      <div className="np-card__left">
        <div className="np-card__icon-wrapper">{icon}</div>
      </div>
      <p className="np-full-width">{text}</p>
    </a>
  )
}

export const ComparisonLabel = ({label}: {label: string}) => {
  return (
    <div className="np-flex-center">
      <p>{label}</p>
    </div>
  )
}

type ComparisonRowProps = {
  heading?: boolean
  firstItem?: JSX.Element
  secondItem?: JSX.Element
  thirdItem: JSX.Element
}

export const YoutubeEmbed = ({embedId}) => (
  <div className="np-video-section">
    <iframe
      src={`https://www.youtube.com/embed/${embedId}`}
      frameBorder="0"
      allowFullScreen
      title="Embedded youtube"
      className="np-video-section__iframe"
    />
  </div>
)

export const ComparisonRow = ({
  firstItem,
  secondItem,
  thirdItem,
  heading = false,
}: ComparisonRowProps) => {
  return (
    <div className="np-comparison-row">
      {firstItem && (
        <div
          className={`np-comparison-row__item np-comparison-row__item--${
            heading ? 'heading-highlighted' : 'highlighted'
          }`}
        >
          {firstItem}
        </div>
      )}
      {secondItem && (
        <div
          className={`np-comparison-row__item np-comparison-row__item--${
            heading ? 'heading-regular' : 'regular'
          }`}
        >
          {secondItem}
        </div>
      )}
      <div
        className={`np-comparison-row__item np-comparison-row__item--${
          heading ? 'heading-regular' : 'regular'
        } last`}
      >
        {thirdItem}
      </div>
    </div>
  )
}
