import React, { useEffect, useState, useRef } from 'react';

interface ImageResizerProps {
    editorRef: React.RefObject<HTMLDivElement | null>;
    selectedImage: HTMLImageElement | null;
    setSelectedImage: (img: HTMLImageElement | null) => void;
}

/**
 * Walk the offsetParent chain from `element` up to `stopAt`, summing
 * offsetTop/offsetLeft while subtracting any scrollTop/scrollLeft on
 * intermediate scroll containers.  This gives the position of the element
 * relative to `stopAt` independent of page scroll.
 */
function getOffsetRelativeTo(
    element: HTMLElement,
    stopAt: HTMLElement
): { top: number; left: number } {
    let top = 0;
    let left = 0;
    let el: HTMLElement | null = element;

    while (el && el !== stopAt) {
        top += el.offsetTop;
        left += el.offsetLeft;
        // subtract any scroll on the current offsetParent
        const op = el.offsetParent as HTMLElement | null;
        if (op && op !== stopAt) {
            top -= op.scrollTop;
            left -= op.scrollLeft;
        }
        el = op;
    }

    return { top, left };
}

export default function ImageResizer({ editorRef, selectedImage, setSelectedImage }: ImageResizerProps) {
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [resizing, setResizing] = useState<string | null>(null);
    const isTouchResizing = useRef(false);

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

            // ImageResizer is `absolute` inside `div.relative` (the direct parent of editorRef).
            // We compute position using offsetTop/offsetLeft traversal so it's immune to
            // page-level scroll — getBoundingClientRect is viewport-relative and breaks when
            // the body (not a local container) is the scroll element (common on mobile).
            const container = editorRef.current.parentElement;
            if (!container) return;

            const { top, left } = getOffsetRelativeTo(selectedImage, container);

            setPosition({
                top,
                left,
                width: selectedImage.offsetWidth,
                height: selectedImage.offsetHeight,
            });
        };

        updatePosition();

        const editor = editorRef.current;
        window.addEventListener('resize', updatePosition);
        editor.addEventListener('scroll', updatePosition);
        // Capture phase: catches scroll on any ancestor (page body, etc.)
        window.addEventListener('scroll', updatePosition, true);

        const resizeObserver = new ResizeObserver(updatePosition);
        resizeObserver.observe(selectedImage);

        const mutationObserver = new MutationObserver(() => {
            updatePosition();
            const start = performance.now();
            const trackTransition = () => {
                updatePosition();
                if (performance.now() - start < 500) requestAnimationFrame(trackTransition);
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
            window.removeEventListener('scroll', updatePosition, true);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [selectedImage, editorRef, setSelectedImage]);

    // ── Mouse (desktop) ──────────────────────────────────────────────────────
    const handleMouseDown = (direction: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setResizing(direction);
        if (!selectedImage) return;

        const startX = e.clientX;
        const startWidth = selectedImage.offsetWidth;
        const startHeight = selectedImage.offsetHeight;
        const aspectRatio = startWidth / startHeight;

        const handleMouseMove = (mv: MouseEvent) => {
            handleResize(direction, startWidth, aspectRatio, mv.clientX - startX);
        };
        const handleMouseUp = () => {
            setResizing(null);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // ── Touch (mobile) ───────────────────────────────────────────────────────
    const handleTouchStart = (direction: string) => (e: React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault(); // prevent deselect & scroll trigger
        setResizing(direction);
        isTouchResizing.current = true;
        if (!selectedImage || e.touches.length === 0) return;

        const startX = e.touches[0].clientX;
        const startWidth = selectedImage.offsetWidth;
        const startHeight = selectedImage.offsetHeight;
        const aspectRatio = startWidth / startHeight;

        const handleTouchMove = (mv: TouchEvent) => {
            mv.preventDefault();   // block page scroll while resizing
            mv.stopPropagation();
            if (mv.touches.length === 0) return;
            handleResize(direction, startWidth, aspectRatio, mv.touches[0].clientX - startX);
        };
        const handleTouchEnd = () => {
            setResizing(null);
            isTouchResizing.current = false;
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
    };

    // ── Resize arithmetic ────────────────────────────────────────────────────
    const handleResize = (direction: string, startWidth: number, aspectRatio: number, deltaX: number) => {
        if (!selectedImage) return;
        let newWidth = (direction === 'ne' || direction === 'se')
            ? startWidth + deltaX
            : startWidth - deltaX;

        if (newWidth < 50) newWidth = 50;
        selectedImage.style.width = `${newWidth}px`;
        selectedImage.style.height = `${newWidth / aspectRatio}px`;
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
            <div className="absolute -top-3 -left-3 sm:-top-1.5 sm:-left-1.5 w-6 h-6 sm:w-3 sm:h-3 bg-white dark:bg-slate-900 border-2 border-primary dark:border-white cursor-nw-resize pointer-events-auto rounded-full sm:rounded-none shadow-md"
                onMouseDown={handleMouseDown('nw')} onTouchStart={handleTouchStart('nw')} />
            {/* NE */}
            <div className="absolute -top-3 -right-3 sm:-top-1.5 sm:-right-1.5 w-6 h-6 sm:w-3 sm:h-3 bg-white dark:bg-slate-900 border-2 border-primary dark:border-white cursor-ne-resize pointer-events-auto rounded-full sm:rounded-none shadow-md"
                onMouseDown={handleMouseDown('ne')} onTouchStart={handleTouchStart('ne')} />
            {/* SW */}
            <div className="absolute -bottom-3 -left-3 sm:-bottom-1.5 sm:-left-1.5 w-6 h-6 sm:w-3 sm:h-3 bg-white dark:bg-slate-900 border-2 border-primary dark:border-white cursor-sw-resize pointer-events-auto rounded-full sm:rounded-none shadow-md"
                onMouseDown={handleMouseDown('sw')} onTouchStart={handleTouchStart('sw')} />
            {/* SE */}
            <div className="absolute -bottom-3 -right-3 sm:-bottom-1.5 sm:-right-1.5 w-6 h-6 sm:w-3 sm:h-3 bg-white dark:bg-slate-900 border-2 border-primary dark:border-white cursor-se-resize pointer-events-auto rounded-full sm:rounded-none shadow-md"
                onMouseDown={handleMouseDown('se')} onTouchStart={handleTouchStart('se')} />
        </div>
    );
}
