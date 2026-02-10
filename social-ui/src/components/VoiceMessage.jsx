import { useState, useRef, useEffect } from "react";

export default function VoiceMessage({ src }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    // Generate static waveform bars (simulated)
    const [bars] = useState(() => Array.from({ length: 40 }, () => Math.floor(Math.random() * 40) + 10));

    const handleSeek = (e) => {
        const audio = audioRef.current;
        if (!audio) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.min(Math.max(x / rect.width, 0), 1);
        audio.currentTime = percent * audio.duration;
    };

    return (
        <div className="flex items-center gap-3 p-2 min-w-[200px] max-w-[300px] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <button
                onClick={togglePlay}
                className="shrink-0 w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition"
            >
                {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                )}
            </button>

            <div
                className="flex-1 flex flex-col justify-center cursor-pointer group"
                onClick={handleSeek}
            >
                <div className="flex items-center justify-between h-8 gap-[2px]">
                    {bars.map((height, i) => {
                        const percent = (i / bars.length) * 100;
                        const isPlayed = percent < progress;
                        return (
                            <div
                                key={i}
                                className={`w-1 rounded-full transition-colors ${isPlayed ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-500'}`}
                                style={{ height: `${height}%` }}
                            />
                        );
                    })}
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1 select-none font-mono">
                    <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <audio ref={audioRef} src={src} className="hidden" />
        </div>
    );
}
