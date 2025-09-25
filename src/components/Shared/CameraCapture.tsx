import React, { useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!active) return;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
      } catch (e) {
        setError('Camera access denied');
      }
    };
    init();
    return () => {
      active = false;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="space-y-2">
      <div className="relative bg-black rounded-lg overflow-hidden">
        {error ? (
          <div className="text-sm text-red-600 p-3">{error}</div>
        ) : (
          <video ref={videoRef} className="w-full max-h-60" playsInline />
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <button
        type="button"
        onClick={capture}
        className="border border-gray-300 px-3 py-2 rounded-md text-sm"
      >
        Capture Photo
      </button>
    </div>
  );
};

export default CameraCapture;


