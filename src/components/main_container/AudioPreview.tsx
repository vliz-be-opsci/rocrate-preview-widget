import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js";
import { FaSync, FaSearchPlus, FaSearchMinus, FaRedo, FaPlay, FaPause } from "react-icons/fa";

interface AudioPreviewProps {
    fileUrl: string;
    fileSize: number;
    mimeType: string;
}

const AudioPreview = ({ fileUrl, fileSize, mimeType }: AudioPreviewProps) => {
    const waveformRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (waveformRef.current && timelineRef.current) {
            wavesurferRef.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: "#4CAF9C",
                progressColor: "#388E7B",
                height: 100,
                loopSelection: true,
                plugins: [
                    TimelinePlugin.create({
                        container: timelineRef.current,
                        primaryColor: "#4CAF9C",
                        secondaryColor: "#388E7B",
                        primaryFontColor: "#4CAF9C",
                        secondaryFontColor: "#388E7B",
                    }),
                ],
            });

            wavesurferRef.current.load(fileUrl);

            wavesurferRef.current.on("ready", () => {
                setDuration(wavesurferRef.current?.getDuration() || 0);
            });

            wavesurferRef.current.on("play", () => setIsPlaying(true));
            wavesurferRef.current.on("pause", () => setIsPlaying(false));

            return () => {
                wavesurferRef.current?.destroy();
            };
        }
    }, [fileUrl]);

    const togglePlayPause = () => {
        wavesurferRef.current?.playPause();
    };

    const changePlaybackRate = (rate: number) => {
        setPlaybackRate(rate);
        if (wavesurferRef.current) {
            wavesurferRef.current.setPlaybackRate(rate);
        }
    };

    const changeZoomLevel = (level: number) => {
        setZoomLevel(level);
        if (wavesurferRef.current) {
            wavesurferRef.current.zoom(level);
        }
    };

    const resetZoom = () => {
        setZoomLevel(1);
        if (wavesurferRef.current) {
            wavesurferRef.current.zoom(1);
        }
    };

    return (
        <div className="audio-preview">
            <div className="flex space-x-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">File Size: {fileSize} bytes</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">MIME Type: {mimeType}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Duration: {duration.toFixed(2)} seconds</span>
            </div>
            <div ref={waveformRef} className="waveform mx-auto" />
            <div ref={timelineRef} className="wave-timeline mx-auto" />
            <div className="flex justify-center mt-4 space-x-4">
                <div className="card bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <FaSync className="mr-2" /> Playback Controls
                    </h3>
                    <button onClick={togglePlayPause} className="w-full px-4 py-2 bg-blue-500 text-white rounded mb-2 flex items-center justify-center">
                        {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <div className="flex items-center space-x-2">
                        <span>Speed: {playbackRate.toFixed(1)}x</span>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={playbackRate}
                            onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                            className="slider"
                        />
                    </div>
                </div>
                <div className="card bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <FaSearchPlus className="mr-2" /> Zoom Controls
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                        <span>Zoom Level: {zoomLevel} </span>
                        <input
                            type="range"
                            min="10"
                            max="1000"
                            step="1"
                            value={zoomLevel}
                            onChange={(e) => changeZoomLevel(parseInt(e.target.value, 10))}
                            className="slider"
                        />
                    </div>
                    <button onClick={resetZoom} className="px-4 py-2 bg-blue-500 text-white rounded">
                        <FaRedo className="mr-2" /> Reset Zoom
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AudioPreview;
