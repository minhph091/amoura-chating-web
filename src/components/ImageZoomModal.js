import React, { useState, useCallback, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from './Icons';

const ImageZoomModal = ({ imageUrl, onClose }) => {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    if (!imageUrl) return null;

    const handleClose = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClose) {
            onClose();
        }
    }, [onClose]);

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            handleClose(e);
        }
    }, [handleClose]);

    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'Escape':
                handleClose(e);
                break;
            case '+':
            case '=':
                e.preventDefault();
                setScale(prev => Math.min(prev * 1.2, 5));
                break;
            case '-':
                e.preventDefault();
                setScale(prev => Math.max(prev / 1.2, 0.1));
                break;
            case '0':
                e.preventDefault();
                setScale(1);
                setRotation(0);
                setPosition({ x: 0, y: 0 });
                break;
            case 'r':
                e.preventDefault();
                setRotation(prev => prev + 90);
                break;
        }
    }, [handleClose]);

    const handleZoomIn = useCallback(() => {
        setScale(prev => Math.min(prev * 1.2, 5));
    }, []);

    const handleZoomOut = useCallback(() => {
        setScale(prev => Math.max(prev / 1.2, 0.1));
    }, []);

    const handleRotate = useCallback(() => {
        setRotation(prev => prev + 90);
    }, []);

    const handleReset = useCallback(() => {
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    }, []);

    const handleDownload = useCallback(() => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `image_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [imageUrl]);

    const handleMouseDown = useCallback((e) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    }, [scale, position]);

    const handleMouseMove = useCallback((e) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    }, [isDragging, scale, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(prev => Math.max(0.1, Math.min(5, prev * delta)));
    }, []);

    // Reset on new image
    useEffect(() => {
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    }, [imageUrl]);

    // Add event listeners
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleKeyDown, handleMouseMove, handleMouseUp]);

    return (
        <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex justify-center items-center p-4"
            onClick={handleBackdropClick}
            onWheel={handleWheel}
            tabIndex={-1}
        >
            {/* Close button */}
            <button 
                onClick={handleClose}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute top-4 right-4 p-3 text-white hover:text-pink-400 hover:bg-white/10 rounded-full transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-label="Đóng"
            >
                <X size={24} />
            </button>

            {/* Controls */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-xl p-2 z-10">
                <button 
                    onClick={handleZoomIn}
                    className="p-2 text-white hover:text-pink-400 hover:bg-white/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    aria-label="Phóng to"
                >
                    <ZoomIn size={20} />
                </button>
                <button 
                    onClick={handleZoomOut}
                    className="p-2 text-white hover:text-pink-400 hover:bg-white/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    aria-label="Thu nhỏ"
                >
                    <ZoomOut size={20} />
                </button>
                <button 
                    onClick={handleRotate}
                    className="p-2 text-white hover:text-pink-400 hover:bg-white/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    aria-label="Xoay"
                >
                    <RotateCcw size={20} />
                </button>
                <button 
                    onClick={handleReset}
                    className="p-2 text-white hover:text-pink-400 hover:bg-white/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    aria-label="Đặt lại"
                >
                    <span className="text-sm font-bold">⟲</span>
                </button>
                <button 
                    onClick={handleDownload}
                    className="p-2 text-white hover:text-pink-400 hover:bg-white/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    aria-label="Tải xuống"
                >
                    <Download size={20} />
                </button>
            </div>

            {/* Zoom info */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 z-10">
                <span className="text-white text-sm font-medium">
                    {Math.round(scale * 100)}% • {rotation}°
                </span>
            </div>

            {/* Image container */}
            <div 
                className="relative overflow-hidden rounded-lg cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                style={{ 
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
            >
                <img 
                    src={imageUrl} 
                    alt="Zoomed" 
                    className="max-w-[90vw] max-h-[90vh] object-contain select-none"
                    style={{
                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                    }}
                    draggable={false}
                />
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 z-10">
                <span className="text-white text-xs">
                    Sử dụng chuột để di chuyển • Cuộn để zoom • R để xoay • ESC để đóng
                </span>
            </div>
        </div>
    );
};

export default ImageZoomModal; 