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
import { SvgButton } from 'src/components/UI'
import { GameStatus } from 'src/types'
import './index.css'

export interface GameCardListProps {
  appName: string
  installingGrayscale: string
  isInstalled: boolean
  imageSrc: string
  title: string
  size: string
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

const GameCardList: React.FC<GameCardListProps> = ({
  appName,
  installingGrayscale,
  isInstalled,
  imageSrc,
  title,
  size,
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
    <div
      className={cx('GameCardList', {
        'GameCardList--installed': isInstalled
      })}
      style={{ '--installing-effect': installingGrayscale } as CSSProperties}
    >
      <Link
        className="GameCardList__link"
        to={{
          pathname: `/gameconfig/${appName}`
        }}
      >
        <img src={imageSrc} className="GameCardList__image" alt="cover" />
        <div className="GameCardList__title">
          {title}
          {status && <div className="GameCardList__status">{status}</div>}
        </div>
      </Link>
      <div className="GameCardList__size">
        {size && size !== 'null' ? size : '---'}
      </div>
      <div className="GameCardList__actions">
        {actions.update && (
          <SvgButton
            className="GameCardList__action"
            onClick={(e) => {
              e.preventDefault()
              actions.update?.()
            }}
          >
            <FontAwesomeIcon size={'2x'} icon={faRepeat} />
          </SvgButton>
        )}
        {actions.settings && (
          <SvgButton
            className="GameCardList__action"
            onClick={(e) => {
              e.preventDefault()
              actions.settings?.()
            }}
          >
            <SettingsIcon fill={'var(--text-default)'} />
          </SvgButton>
        )}
        {actions.download && (
          <SvgButton
            className="GameCardList__action"
            onClick={(e) => {
              e.preventDefault()
              actions.download?.()
            }}
          >
            <DownIcon />
          </SvgButton>
        )}
        {actions.cancel && (
          <SvgButton
            className="GameCardList__action"
            onClick={(e) => {
              e.preventDefault()
              actions.cancel?.()
            }}
          >
            <StopIcon />
          </SvgButton>
        )}
        {actions.stop && (
          <SvgButton
            className="GameCardList__action"
            onClick={(e) => {
              e.preventDefault()
              actions.stop?.()
            }}
          >
            <StopIconAlt />
          </SvgButton>
        )}
        {actions.play && (
          <SvgButton
            className="GameCardList__action"
            onClick={(e) => {
              e.preventDefault()
              actions.play?.()
            }}
          >
            <PlayIcon />
          </SvgButton>
        )}
      </div>
    </div>
  )
}

export default GameCardList
