'use client'
import { useState, useEffect, useRef } from 'react'
import { Howl, Howler } from 'howler'
import { CirclePlay, CirclePause, SkipForward, SkipBack } from 'lucide-react'

export type MusicCardProps = {
  src: string;
  poster: string;
  autoPlay?: boolean;
  mainColor?: string;
  title?: string;
  artist?: string;
  showSkip?: boolean;
}

export function MusicCard({ src, poster, autoPlay = false, mainColor = '#3b82f6', title = 'Unknown Title', artist = 'Unknown Artist', showSkip = false }: MusicCardProps) {

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const howler = useRef<Howl | null>(null)
  const progressInterval = useRef<number | null>(null)
  const triedFallback = useRef(false)
  const FALLBACK_URL = 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3'

  useEffect(() => {
    if (howler.current) {
      howler.current.stop()
      if (progressInterval.current) window.clearInterval(progressInterval.current)
    }

    triedFallback.current = false

    const normalize = (u: string) => {
      try {
        if (/^\//.test(u)) return new URL(u, window.location.origin).href
      } catch { }
      return u
    }

    const init = (source: string) => {
      const sound = new Howl({
        src: [source],
        html5: true,
        preload: true,
        onpause: () => {
          setIsPlaying(false)
          if (progressInterval.current) window.clearInterval(progressInterval.current)
        },
        onplay: () => {
          setError(null)
          setIsPlaying(true)
          updateProgress()
        },
        onend: () => {
          setIsPlaying(false)
          if (progressInterval.current) window.clearInterval(progressInterval.current)
          setProgress(0)
        },
        onstop: () => {
          setIsPlaying(false)
          if (progressInterval.current) window.clearInterval(progressInterval.current)
          setProgress(0)
        },
        onload: () => {
          setDuration(sound.duration() || 0)
        },
        onloaderror: (_id, err) => {
          // Retry once with a known-good fallback URL
          if (!triedFallback.current && source !== FALLBACK_URL) {
            triedFallback.current = true
            try { sound.unload() } catch { }
            setError('Primary audio unavailable. Using fallback sample...')
            init(FALLBACK_URL)
            return
          }
          setError('Failed to load audio')
          // eslint-disable-next-line no-console
          console.warn('Audio load error', err, { src: source })
        },
        onplayerror: (_id, err) => {
          // Resume AudioContext then retry
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ctx: any = (Howler as any).ctx || (Howler as any)._audioContext
          if (ctx && ctx.state === 'suspended' && ctx.resume) ctx.resume()
          try { sound.play() } catch { }
        }
      })

      howler.current = sound
      if (autoPlay) {
        try { sound.play() } catch { }
      }
    }

    init(normalize(src))

    return () => {
      if (progressInterval.current) window.clearInterval(progressInterval.current)
      if (howler.current) {
        try { howler.current.unload() } catch { }
      }
    }
  }, [src])

  const updateProgress = () => {
    if (!howler.current) return
    if (progressInterval.current) window.clearInterval(progressInterval.current)
    progressInterval.current = window.setInterval(() => {
      const seek = (howler.current?.seek() as number) || 0
      setProgress(seek)
      if (!duration) {
        try { setDuration(howler.current?.duration() || 0) } catch { }
      }
    }, 300)
  }

  const handlePlayPause = () => {
    if (!howler.current) return
    // Resume AudioContext on user gesture
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: any = (Howler as any).ctx || (Howler as any)._audioContext
    if (ctx && ctx.state === 'suspended' && ctx.resume) ctx.resume()

    const next = !isPlaying
    setIsPlaying(next)
    if (next) {
      try { howler.current.play() } catch { }
    } else {
      try { howler.current.pause() } catch { }
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!howler.current || !duration) return

    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newPosition = percentage * duration

    howler.current.seek(newPosition)
    setProgress(newPosition)
  }

  const handleSkip = (direction: 'forward' | 'backward') => {
    if (!howler.current) return

    const currentTime = (howler.current.seek() as number) || 0
    const skipAmount = 10
    const newTime = direction === 'forward'
      ? Math.min(currentTime + skipAmount, duration)
      : Math.max(currentTime - skipAmount, 0)

    howler.current.seek(newTime)
    setProgress(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const cardStyle = {
    '--main-color': mainColor,
    '--hover-color': `${mainColor}33`,
  } as React.CSSProperties

  return (
    <section
      className="w-[20rem] bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-4 
        shadow-xl hover:shadow-2xl transition-all duration-300 
        hover:bg-white/20 dark:hover:bg-black/30"
      style={cardStyle}
    >
      {/* 海报图片容器 */}
      <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden group bg-gray-100">
        <img
          src={poster}
          alt="music poster"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* 音乐信息 */}
      <div className="mb-4 px-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {artist}
        </p>
      </div>

      {/* 进度条 */}
      <div className="mb-4 px-2">
        <div
          className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-[var(--main-color)] rounded-full relative"
            style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 
              bg-[var(--main-color)] rounded-full shadow-md transform scale-0 
              group-hover:scale-100 transition-transform"
            />
          </div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-between px-4">
        {showSkip ? (
          <button
            onClick={() => handleSkip('backward')}
            className="p-2 text-gray-600 dark:text-gray-400 
              hover:text-[var(--main-color)] dark:hover:text-[var(--main-color)] 
              transition-colors"
            title="Back 10s"
          >
            <SkipBack className="w-6 h-6" />
          </button>
        ) : <div className="w-8" />}
        <button
          onClick={handlePlayPause}
          className="p-2 text-[var(--main-color)] hover:opacity-80 transition-colors"
        >
          {isPlaying ?
            <CirclePause className="w-8 h-8" /> :
            <CirclePlay className="w-8 h-8" />
          }
        </button>
        {showSkip ? (
          <button
            onClick={() => handleSkip('forward')}
            className="p-2 text-gray-600 dark:text-gray-400 
              hover:text-[var(--main-color)] dark:hover:text-[var(--main-color)] 
              transition-colors"
            title="Forward 10s"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        ) : <div className="w-8" />}
      </div>

      {error ? (
        <p className="mt-3 px-2 text-xs text-red-600">{error} Check audio URL or file path.</p>
      ) : null}
    </section>
  )
}

// Drive-aware wrapper that preserves the MusicCard UI but normalizes Google Drive links
function isGoogleDriveUrl(url: string) {
  try {
    const u = new URL(url, 'http://x')
    return u.hostname.includes('drive.google.com')
  } catch {
    return false
  }
}

function toGoogleDriveDownloadUrl(url: string) {
  try {
    const u = new URL(url, 'http://x')
    if (!u.hostname.includes('drive.google.com')) return url
    // Try path-based pattern /file/d/ID/...
    const parts = u.pathname.split('/')
    const idx = parts.indexOf('d')
    const id = idx >= 0 ? parts[idx + 1] : (u.searchParams.get('id') || '')
    if (id) return `https://drive.google.com/uc?id=${id}&export=download`
  } catch { }
  return url
}

function toGoogleDrivePreviewUrl(url: string) {
  try {
    const u = new URL(url, 'http://x')
    // Try path-based pattern /file/d/ID/...
    const parts = u.pathname.split('/');
    const idx = parts.indexOf('d');
    if (idx >= 0 && parts[idx + 1]) {
      const id = parts[idx + 1];
      return `https://drive.google.com/file/d/${id}/preview`;
    }
    const qid = u.searchParams.get('id');
    if (qid) {
      return `https://drive.google.com/file/d/${qid}/preview`;
    }
  } catch { }
  return url
}

export function DriveMusicCard(props: MusicCardProps) {
  const src = isGoogleDriveUrl(props.src) ? toGoogleDriveDownloadUrl(props.src) : props.src
  return <MusicCard {...props} src={src} />
}

export function DriveMusicEmbedCard({ src, poster, title = 'Unknown Title', artist = 'Unknown Artist', showSkip = false }: MusicCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const embedSrc = isGoogleDriveUrl(src) ? toGoogleDrivePreviewUrl(src) : src
  const cardStyle = {
    '--main-color': '#3b82f6',
    '--hover-color': `#3b82f633`,
  } as React.CSSProperties

  const handlePlayPause = () => setIsPlaying((p) => !p)

  return (
    <section
      className="w-[25rem]  bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-4 
        shadow-xl hover:shadow-2xl transition-all duration-300 
        hover:bg-white/20 dark:hover:bg-black/30"
      style={cardStyle}
    >
      {/* Poster image (same as MusicCard) */}
      <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden group bg-gray-100">
        <img
          src={poster}
          alt="music poster"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          aria-label="Open in Google Drive"
          className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/60 text-white hover:bg-black/70"
          title="Open in Drive"
        >
          {/* external icon via simple svg to avoid extra deps here */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M14 3h7v7h-2V6.414l-9.293 9.293-1.414-1.414L17.586 5H14V3z" />
            <path d="M5 5h6v2H7v10h10v-4h2v6H5V5z" />
          </svg>
        </a>
      </div>

      {/* 音乐信息 */}
      <div className="mb-4 px-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {artist}
        </p>
      </div>

      {/* Progress area replaced with a compact Drive player when playing */}
      <div className="mb-4 px-2">

        <div className="rounded-md overflow-hidden bg-gray-900/90">
          <iframe
            src={embedSrc}
            className="w-full h-12"
            allow="autoplay"
            title="Google Drive audio preview"
          />
        </div>

      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-between px-4">
        {showSkip ? (
          <button
            disabled
            className="p-2 text-gray-600 dark:text-gray-400 
              hover:text-[var(--main-color)] dark:hover:text-[var(--main-color)] 
              transition-colors cursor-not-allowed"
            title="Back 10s"
          >
            <SkipBack className="w-6 h-6" />
          </button>
        ) : <div className="w-8" />}
        {/* <button
          onClick={handlePlayPause}
          className="p-2 text-[var(--main-color)] hover:opacity-80 transition-colors"
        >
          {isPlaying ?
            <CirclePause className="w-8 h-8" /> :
            <CirclePlay className="w-8 h-8" />
          }
        </button> */}
        {showSkip ? (
          <button
            disabled
            className="p-2 text-gray-600 dark:text-gray-400 
              hover:text-[var(--main-color)] dark:hover:text-[var(--main-color)] 
              transition-colors cursor-not-allowed"
            title="Forward 10s"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        ) : <div className="w-8" />}
      </div>
    </section>
  )
}
