import React, { useEffect, useState, useRef } from 'react';

interface ImageResizerProps {
    editorRef: React.RefObject<HTMLDivElement | null>;
    selectedImage: HTMLImageElement | null;
    setSelectedImage: (img: HTMLImageElement | null) => void;
}

export default function ImageResizer({ editorRef, selectedImage, setSelectedImage }: ImageResizerProps) {
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [resizing, setResizing] = useState<string | null>(null);
    // Track whether a touch resize is in progress — used to block page scroll
    const isTouchResizing = useRef(false);

    // Update overlay position based on selected image
    useEffect(() => {
        if (!selectedImage || !editorRef.current) {
            if (position.width !== 0) setPosition({ top: 0, left: 0, width: 0, height: 0 });
            return;
        }

        const updatePosition = () => {
            if (!selectedImage || !editorRef.current) return;

            if (!editorRef.current.contains(selectedImage)) {
                setSelectedImage(null);
                return;
            }

            // ImageResizer is inside a scrollable `.relative` parent.
            // getBoundingClientRect() gives viewport-relative coords.
            // We need to subtract the parent's viewport rect AND add its scroll offset
            // so that absolute positioning inside the parent is correct even when scrolled.
            const parent = editorRef.current.parentElement;
            if (!parent) return;

            const parentRect = parent.getBoundingClientRect();
            const imgRect = selectedImage.getBoundingClientRect();

            setPosition({
                // viewport offset + parent's own scroll position → correct local coords
                top: imgRect.top - parentRect.top + parent.scrollTop,
                left: imgRect.left - parentRect.left + parent.scrollLeft,
                width: imgRect.width,
                height: imgRect.height,
            });
        };

        updatePosition();

        const editor = editorRef.current;
        // Re-measure on window resize and any ancestor scroll
        window.addEventListener('resize', updatePosition);
        editor.addEventListener('scroll', updatePosition);
        // Also listen on the scroll container (admin page body)
        document.addEventListener('scroll', updatePosition, true);

        const resizeObserver = new ResizeObserver(updatePosition);
        resizeObserver.observe(selectedImage);

        const mutationObserver = new MutationObserver(() => {
            updatePosition();
            let start = performance.now();
            const trackTransition = () => {
                updatePosition();
                if (performance.now() - start < 500) {
                    requestAnimationFrame(trackTransition);
                }
            };
            requestAnimationFrame(trackTransition);
        });
        mutationObserver.observe(selectedImage, {
            attributes: true,
            attributeFilter: ['style', 'class', 'width', 'height']
        });

        if (!selectedImage.style.transition) {
            selectedImage.style.transition = 'margin 0.3s ease, width 0.3s ease, height 0.3s ease';
        }

        return () => {
            window.removeEventListener('resize', updatePosition);
            editor.removeEventListener('scroll', updatePosition);
            document.removeEventListener('scroll', updatePosition, true);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [selectedImage, editorRef, setSelectedImage]);


    const handleMouseDown = (direction: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setResizing(direction);

        if (!selectedImage) return;

        const startX = e.clientX;
        const startWidth = selectedImage.offsetWidth;
        const startHeight = selectedImage.offsetHeight;
        const aspectRatio = startWidth / startHeight;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            handleResize(direction, startWidth, aspectRatio, deltaX);
        };

        const handleMouseUp = () => {
            setResizing(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (direction: string) => (e: React.TouchEvent) => {
        e.stopPropagation();
        // Prevent triggering document click that would deselect the image
        e.preventDefault();
        setResizing(direction);
        isTouchResizing.current = true;

        if (!selectedImage || e.touches.length === 0) return;

        const startX = e.touches[0].clientX;
        const startWidth = selectedImage.offsetWidth;
        const startHeight = selectedImage.offsetHeight;
        const aspectRatio = startWidth / startHeight;

        const handleTouchMove = (moveEvent: TouchEvent) => {
            // CRITICAL: prevent page scroll while resizing the image
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            if (moveEvent.touches.length === 0) return;
            const deltaX = moveEvent.touches[0].clientX - startX;
            handleResize(direction, startWidth, aspectRatio, deltaX);
        };

        const handleTouchEnd = () => {
            setResizing(null);
            isTouchResizing.current = false;
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };

        // { passive: false } is required to allow preventDefault() inside touchmove
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
    };

    const handleResize = (direction: string, startWidth: number, aspectRatio: number, deltaX: number) => {
        if (!selectedImage) return;
        let newWidth = startWidth;

        if (direction === 'ne' || direction === 'se') {
            newWidth = startWidth + deltaX;
        } else if (direction === 'nw' || direction === 'sw') {
            newWidth = startWidth - deltaX;
        }

        if (newWidth < 50) newWidth = 50;
        const newHeight = newWidth / aspectRatio;

        selectedImage.style.width = `${newWidth}px`;
        selectedImage.style.height = `${newHeight}px`;
        selectedImage.style.maxWidth = '100%';
    };

    if (!selectedImage) return null;

    return (
        <div
            className="absolute pointer-events-none border-2 border-primary dark:border-slate-900 z-50 transition-none"
            style={{
                top: position.top,
                left: position.left,
                width: position.width,
                height: position.height,
                display: position.width ? 'block' : 'none'
            }}
        >
            {/* NW */}
            <div
                className="absolute -top-2.5 -left-2.5 sm:-top-1.5 sm:-left-1.5 w-6 h-6 sm:w-3 sm:h-3 bg-white dark:bg-slate-900 border border-primary dark:border-white cursor-nw-resize pointer-events-auto rounded-full sm:rounded-none shadow-sm flex items-center justify-center"
                onMouseDown={handleMouseDown('nw')}
                onTouchStart={handleTouchStart('nw')}
            />
            {/* NE */}
            <div
                className="absolute -top-2.5 -right-2.5 sm:-top-1.5 sm:-right-1.5 w-6 h-6 sm:w-3 sm:h-3 bg-white dark:bg-slate-900 border border-primary dark:border-white cursor-ne-resize pointer-events-auto rounded-full sm:rounded-none shadow-sm flex items-center justify-center"
                onMouseDown={handleMouseDown('ne')}
                onTouchStart={handleTouchStart('ne')}
            />
            {/* SW */}
            <div
                className="absolute -bottom-2.5 -left-2.5 sm:-bottom-1.5 sm:-left-1.5 w-6 h-6 sm:w-3 sm:h-3 bg-white dark:bg-slate-900 border border-primary dark:border-white cursor-sw-resize pointer-events-auto rounded-full sm:rounded-none shadow-sm flex items-center justify-center"
                onMouseDown={handleMouseDown('sw')}
                onTouchStart={handleTouchStart('sw')}
            />
            {/* SE */}
            <div
                className="absolute -bottom-2.5 -right-2.5 sm:-bottom-1.5 sm:-right-1.5 w-6 h-6 sm:w-3 sm:h-3 bg-white dark:bg-slate-900 border border-primary dark:border-white cursor-se-resize pointer-events-auto rounded-full sm:rounded-none shadow-sm flex items-center justify-center"
                onMouseDown={handleMouseDown('se')}
                onTouchStart={handleTouchStart('se')}
            />
        </div>
    );
}
