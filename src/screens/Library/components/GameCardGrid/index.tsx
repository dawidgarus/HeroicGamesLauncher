import { faRepeat } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import cx from 'classnames'
import React, { CSSProperties, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ReactComponent as DownIcon } from 'src/assets/down-icon.svg'
import { ReactComponent as PlayIcon } from 'src/assets/play-icon.svg'
import { ReactComponent as SettingsIcon } from 'src/assets/settings-sharp.svg'
import { ReactComponent as StopIconAlt } from 'src/assets/stop-icon-alt.svg'
import { ReactComponent as StopIcon } from 'src/assets/stop-icon.svg'
import { GameStatus } from 'src/types'
import './index.css'

export interface GameCardGridProps {
  appName: string
  installingGrayscale: string
  isInstalled: boolean
  imageSrc: string
  title: string
  gameStatus: GameStatus | undefined
  actions: {
    play: (() => void) | null
    stop: (() => void) | null
    cancel: (() => void) | null
    download: (() => void) | null
    settings: (() => void) | null
    update: (() => void) | null
  }
}

const GameCardGrid: React.FC<GameCardGridProps> = ({
  appName,
  installingGrayscale,
  isInstalled,
  imageSrc,
  title,
  gameStatus,
  actions
}) => {
  const { t } = useTranslation('gamepage')

  const status = useMemo(() => {
    switch (gameStatus?.status) {
      case 'installing':
      case 'updating':
        return t('status.installing') + ` ${'50%'}`
      case 'moving':
        return t('gamecard.moving', 'Moving')
      case 'repairing':
        return t('gamecard.repairing', 'Repairing')
      default:
        return null
    }
  }, [gameStatus?.status])

  return (
    <Link
      className={cx('GameCardGrid', {
        'GameCardGrid--installed': isInstalled
      })}
      to={{
        pathname: `/gameconfig/${appName}`
      }}
      style={{ '--installing-effect': installingGrayscale } as CSSProperties}
    >
      <img src={imageSrc} className="GameCardGrid__image" alt="cover" />
      <div className="GameCardGrid__title">
        <div className="GameCardGrid__ellipsis">{title}</div>
      </div>
      <div className="GameCardGrid__actions">
        {actions.update && (
          <div
            className="GameCardGrid__action"
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault()
              actions.update?.()
            }}
          >
            <FontAwesomeIcon size={'2x'} icon={faRepeat} />
          </div>
        )}
        <div className="GameCardGrid__status">{status}</div>
        {actions.settings && (
          <div
            className="GameCardGrid__action"
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault()
              actions.settings?.()
            }}
          >
            <SettingsIcon className="GameCard__settingsIcon" />
          </div>
        )}
        {actions.download && (
          <div
            className="GameCardGrid__action"
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault()
              actions.download?.()
            }}
          >
            <DownIcon className="GameCard__installIcon" />
          </div>
        )}
        {actions.cancel && (
          <div
            className="GameCardGrid__action"
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault()
              actions.cancel?.()
            }}
          >
            <StopIcon className="GameCard__cancelIcon" />
          </div>
        )}
        {actions.stop && (
          <div
            className="GameCardGrid__action"
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault()
              actions.stop?.()
            }}
          >
            <StopIconAlt />
          </div>
        )}
        {actions.play && (
          <div
            className="GameCardGrid__action"
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault()
              actions.play?.()
            }}
          >
            <PlayIcon className="GameCard__playIcon" />
          </div>
        )}
      </div>
    </Link>
  )
}

export default GameCardGrid
