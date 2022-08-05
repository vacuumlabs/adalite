import {h} from 'preact'

export const ListItemIcon = () => (
  <svg
    className="np-icon"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill="#292929" />
    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="#757575" />
  </svg>
)

export const ExtensionIcon = () => (
  <svg
    className="np-icon"
    focusable="false"
    aria-hidden="true"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
    data-testid="ExtensionIcon"
    tabIndex={-1}
    title="Extension"
  >
    <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z" />
  </svg>
)

export const WebIcon = () => (
  <svg
    className="np-icon"
    focusable="false"
    aria-hidden="true"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 24 24"
    data-testid="PublicIcon"
    tabIndex={-1}
    title="Public"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
)
export const CloseIcon = () => (
  <svg className="np-icon np-icon--red" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)

export const CheckIcon = () => (
  <svg className="np-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
)

export const PlayIcon = () => (
  <svg
    width="20"
    height="20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="np-icon"
    viewBox="0 0 20 20"
  >
    <path
      d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0ZM8 14.5v-9l6 4.5-6 4.5Z"
      fill="#fff"
    />
  </svg>
)
