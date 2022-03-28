import React, { useContext, useEffect, useState } from 'react'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import fallbackImage from 'src/assets/fallback-image.jpg'
import { getProgress, install, launch, sendKill } from 'src/helpers'
import { uninstall, updateGame } from 'src/helpers/library'
import ContextProvider from 'src/state/ContextProvider'
import { GameStatus, InstallProgress, Runner } from 'src/types'
import GameCardGrid from '../GameCardGrid'
import GameCardList from '../GameCardList'
import './index.css'

const { ipcRenderer } = window.require('electron')
const storage: Storage = window.localStorage

interface Card {
  appName: string
  buttonClick: () => void
  cover: string
  coverList: string
  hasUpdate: boolean
  isGame: boolean
  isInstalled: boolean
  logo: string
  size: string
  title: string
  version: string
  isMacNative: boolean
  isLinuxNative: boolean
  runner: Runner
  forceCard?: boolean
}

const GameCard = ({
  cover,
  title,
  appName,
  isGame,
  isInstalled,
  // logo,
  coverList,
  size = '',
  hasUpdate,
  buttonClick,
  forceCard,
  isMacNative,
  isLinuxNative,
  runner
}: Card) => {
  const previousProgress = JSON.parse(
    storage.getItem(appName) || '{}'
  ) as InstallProgress
  const [progress, setProgress] = useState(
    previousProgress ??
      ({
        bytes: '0.00MiB',
        eta: '00:00:00',
        path: '',
        percent: '0.00%',
        folder: ''
      } as InstallProgress)
  )
  const { t } = useTranslation('gamepage')

  const { libraryStatus, layout, handleGameStatus, platform } =
    useContext(ContextProvider)
  const history = useHistory()
  const isWin = platform === 'win32'

  const grid = forceCard || layout === 'grid'

  const gameStatus: GameStatus = libraryStatus.filter(
    (game) => game.appName === appName
  )[0]

  const hasDownloads = Boolean(
    libraryStatus.filter(
      (game) => game.status === 'installing' || game.status === 'updating'
    ).length
  )

  const { status, folder } = gameStatus || {}
  const isInstalling = status === 'installing' || status === 'updating'
  const isPlaying = status === 'playing'
  const path =
    isWin || isMacNative || isLinuxNative
      ? `/settings/${appName}/other`
      : `/settings/${appName}/wine`

  useEffect(() => {
    const progressInterval = setInterval(async () => {
      if (isInstalling) {
        const progress = await ipcRenderer.invoke(
          'requestGameProgress',
          appName,
          runner
        )

        if (progress) {
          if (previousProgress) {
            const legendaryPercent = getProgress(progress)
            const heroicPercent = getProgress(previousProgress)
            const newPercent: number = Math.round(
              (legendaryPercent / 100) * (100 - heroicPercent) + heroicPercent
            )
            progress.percent = `${newPercent}%`
          }
          return setProgress(progress)
        }

        setProgress(progress)
      }
    }, 1500)
    return () => clearInterval(progressInterval)
  }, [isInstalling, appName])

  // const { percent = '' } = progress
  const installingGrayscale = isInstalling
    ? `${125 - getProgress(progress)}%`
    : '100%'

  const imageSrc = getImageFormatting()

  async function handleUpdate() {
    await handleGameStatus({ appName, runner, status: 'updating' })
    await updateGame(appName, runner)
    return handleGameStatus({ appName, runner, status: 'done' })
  }

  function getImageFormatting() {
    const imageBase = grid ? cover : coverList
    if (imageBase === 'fallback') {
      return fallbackImage
    }
    if (runner === 'legendary') {
      return `${imageBase}?h=400&resize=1&w=300`
    } else {
      return imageBase
    }
  }

  const renderIcon = () => {
    if (isPlaying) {
      return 'stop'
    }
    if (isInstalling) {
      return 'cancel'
    }
    if (isInstalled && isGame) {
      return 'play'
    }
    if (!isInstalled && !hasDownloads) {
      return 'download'
    }
    return null
  }

  const action = renderIcon()
  const actions = {
    play: action === 'play' ? () => handlePlay(runner) : null,
    stop: action === 'stop' ? () => handlePlay(runner) : null,
    cancel: action === 'cancel' ? () => handlePlay(runner) : null,
    download: action === 'download' ? () => buttonClick() : null,
    settings:
      isInstalled && isGame
        ? () =>
            history.push({
              pathname: path,
              state: { fromGameCard: true, runner }
            })
        : null,
    update: hasUpdate ? () => handleUpdate() : null,
    uninstall: isInstalled
      ? () => uninstall({ appName, handleGameStatus, t, runner })
      : null
  }

  return (
    <>
      <ContextMenuTrigger id={appName} attributes={{ tabIndex: -1 }}>
        {grid && (
          <GameCardGrid
            appName={appName}
            installingGrayscale={installingGrayscale}
            isInstalled={isInstalled}
            imageSrc={imageSrc}
            title={title}
            gameStatus={gameStatus}
            actions={actions}
          />
        )}
        {!grid && (
          <GameCardList
            appName={appName}
            installingGrayscale={installingGrayscale}
            isInstalled={isInstalled}
            imageSrc={imageSrc}
            title={title}
            size={size}
            gameStatus={gameStatus}
            actions={actions}
          />
        )}
        <ContextMenu id={appName} className="contextMenu">
          {actions.play && (
            <MenuItem onClick={actions.play}>
              {t('label.playing.start')}
            </MenuItem>
          )}
          {actions.settings && (
            <MenuItem onClick={actions.settings}>
              {t('submenu.settings')}
            </MenuItem>
          )}
          {actions.update && (
            <MenuItem onClick={actions.update}>
              {t('button.update', 'Update')}
            </MenuItem>
          )}
          {actions.download && (
            <MenuItem onClick={actions.download}>
              {t('button.install')}
            </MenuItem>
          )}
          {actions.uninstall && (
            <MenuItem onClick={actions.uninstall}>
              {t('button.uninstall')}
            </MenuItem>
          )}
          {actions.cancel && (
            <MenuItem onClick={actions.cancel}>{t('button.cancel')}</MenuItem>
          )}
        </ContextMenu>
      </ContextMenuTrigger>
    </>
  )

  async function handlePlay(runner: Runner) {
    if (!isInstalled) {
      return await install({
        appName,
        handleGameStatus,
        installPath: folder || 'default',
        isInstalling,
        previousProgress,
        progress,
        t,
        runner
      })
    }
    if (status === 'playing' || status === 'updating') {
      await handleGameStatus({ appName, runner, status: 'done' })
      return sendKill(appName, runner)
    }
    if (isInstalled) {
      return await launch({ appName, t, runner })
    }
    return
  }
}

export default GameCard
