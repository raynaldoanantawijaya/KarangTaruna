import React, { useRef, useEffect, useState } from 'react';

export type RulerChange = {
    leftIndent?: number; // CSS margin-left
    firstLineIndent?: number; // CSS text-indent
    rightIndent?: number; // CSS margin-right
};

interface RulerProps {
    maxWidth?: number;
    padding?: number;
    leftIndent?: number; // CSS margin-left
    firstLineIndent?: number; // CSS text-indent
    rightIndent?: number; // CSS margin-right
    onChange?: (change: RulerChange) => void;
}

export default function Ruler({
    maxWidth = 800,
    padding = 48,
    leftIndent = 0,
    firstLineIndent = 0,
    rightIndent = 0,
    onChange
}: RulerProps) {
    const [width, setWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<'left' | 'first' | 'right' | null>(null);
    const [dragX, setDragX] = useState<number | null>(null); // Visual position for the guide line

    // Resize observer to match container width
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width);
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const handleMouseDown = (type: 'left' | 'first' | 'right') => (e: React.MouseEvent) => {
        e.preventDefault();
        setDragging(type);

        // Initial visual feedback position
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) setDragX(e.clientX - rect.left);
    };

    useEffect(() => {
        if (!dragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;

            // Constrain to usable area ??
            // 0 = padding
            // Max = width - padding

            if (dragging === 'left') {
                // margin-left = relativeX - padding
                const newMargin = Math.max(0, relativeX - padding);

                // Visual Update
                const newPos = padding + newMargin;
                setDragX(newPos);

                onChange?.({ leftIndent: newMargin });
            } else if (dragging === 'first') {
                // First line marker position = padding + margin-left + text-indent
                // We know current margin-left (leftIndent prop)
                // positions: relativeX
                // text-indent = relativeX - (padding + leftIndent)
                const currentLeftPos = padding + leftIndent;
                const newTextIndent = relativeX - currentLeftPos;

                setDragX(relativeX);
                onChange?.({ firstLineIndent: newTextIndent });
            } else if (dragging === 'right') {
                // Right margin marker position = width - padding - margin-right
                // margin-right = width - padding - relativeX
                const rightEdge = width - padding;
                const newMarginRight = Math.max(0, rightEdge - relativeX);

                // Visual pos for Right Marker (from left)
                // The marker is rendered with `right: padding + rightIndent`
                // But for the guide line (left-based), position is width - (padding + marginRight)
                const guidePos = width - (padding + newMarginRight);
                setDragX(guidePos);

                onChange?.({ rightIndent: newMarginRight });
            }
        };

        const handleMouseUp = () => {
            setDragging(null);
            setDragX(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, width, padding, leftIndent, onChange]);

    // Calculate visual positions
    // Left Marker (Hanging Indent / Margin Left)
    const leftMarkerPos = padding + leftIndent;

    // First Line Marker
    const firstMarkerPos = padding + leftIndent + firstLineIndent;

    // Right Marker
    const rightMarkerPos = padding + rightIndent; // CSS right is from right edge (using absolute right style)

    // Generate ticks
    const renderTicks = () => {
        const ticks = [];
        const tickSpacing = 10;
        const majorTickInterval = 50;

        const startX = padding;
        const endX = width - padding;

        if (endX < startX) return [];

        for (let i = 0; i <= (endX - startX); i += tickSpacing) {
            const isMajor = i % majorTickInterval === 0;
            const height = isMajor ? 12 : 6;

            ticks.push(
                <div
                    key={i}
                    className={`absolute bottom-0 border-l ${isMajor ? 'border-slate-500 dark:border-slate-400 h-3' : 'border-slate-700 dark:border-slate-300 h-1.5'}`}
                    style={{ left: startX + i }}
                >
                    {isMajor && (
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 dark:text-slate-600 font-medium select-none">
                            {i}
                        </span>
                    )}
                </div>
            );
        }
        return ticks;
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-8 bg-slate-900 dark:bg-slate-50 border-b border-slate-700 dark:border-slate-300 relative select-none"
        >
            {/* Guide Line - Absolute relative to Ruler, but high enough to extend down */}
            {dragX !== null && (
                <div
                    className="absolute top-8 w-px h-[9999px] border-l border-dashed border-black dark:border-white z-50 pointer-events-none opacity-50"
                    style={{ left: dragX }}
                />
            )}

            {/* Background Track - Masked if needed, but ticks are calculated within range anyway */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {renderTicks()}
            </div>

            {/* First Line Indent Marker (Triangle Down) - Controls text-indent */}
            <div
                className="absolute top-0 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary cursor-col-resize z-20 hover:scale-110 transition-transform"
                style={{ left: firstMarkerPos }}
                onMouseDown={handleMouseDown('first')}
                title="First Line Indent"
            />

            {/* Left Indent Marker (Triangle Up) - Controls margin-left */}
            <div
                className="absolute bottom-0 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-primary cursor-col-resize z-10 hover:scale-110 transition-transform"
                style={{ left: leftMarkerPos }}
                onMouseDown={handleMouseDown('left')}
                title="Left Indent"
            />

            {/* Right Indent Marker */}
            <div
                className="absolute bottom-0 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-primary cursor-col-resize z-10 hover:scale-110 transition-transform"
                style={{ right: padding + rightIndent }} // Right marker is positioned from right edge
                onMouseDown={handleMouseDown('right')}
                title="Right Indent"
            />
        </div>
    );
}
