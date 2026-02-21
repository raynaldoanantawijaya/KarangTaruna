'use client';

import {
    ArrowLeft,
    Eye,
    Rocket,
    Heading1,
    Heading2,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Image as ImageIcon,
    Code,
    CloudUpload,
    X,
    Plus,
    Save,
    Search,
    AlignJustify,
    Palette,
    Indent,
    Outdent,
    ChevronDown,
    Highlighter,
    MoveVertical,
    PaintBucket,
    ListTree
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import ImageResizer from './ImageResizer';
import PermissionGate from '@/components/admin/PermissionGate';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/admin/ToastContext';
import EditorRuler, { RulerChange } from './EditorRuler';

export default function PostEditor() {
    return (
        <PermissionGate permission="manage_posts">
            <PostEditorContent />
        </PermissionGate>
    );
}

/**
 * Convert an image File to WebP format using Canvas API.
 * Resizes to maxWidth while maintaining aspect ratio.
 * Returns a base64 data URL string (data:image/webp;base64,...)
 */
function convertToWebP(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;
            // Resize if wider than maxWidth
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const webpDataUrl = canvas.toDataURL('image/webp', quality);
            resolve(webpDataUrl);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        img.src = url;
    });
}

function PostEditorContent() {
    console.log('Rendering PostEditor'); // Debug log to force HMR
    const router = useRouter();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const editorRef = React.useRef<HTMLDivElement>(null);
    const titleRef = React.useRef<HTMLDivElement>(null);

    const [activeFormats, setActiveFormats] = React.useState<string[]>([]);
    const [isMultilevelActive, setIsMultilevelActive] = React.useState(false); // New State

    // Sidebar States
    const [visibility, setVisibility] = React.useState<'public' | 'private' | 'password'>('public');
    const [showVisibilityOptions, setShowVisibilityOptions] = React.useState(false);
    const [featuredImage, setFeaturedImage] = React.useState<string | null>(null);
    const [isUploadingFeatured, setIsUploadingFeatured] = React.useState(false);
    const featuredInputRef = React.useRef<HTMLInputElement>(null);

    // Image Resizing State
    const [selectedImage, setSelectedImage] = React.useState<HTMLImageElement | null>(null);

    // Categories State
    const [categories, setCategories] = React.useState<string[]>(['Design', 'Development', 'Marketing', 'Tutorials']);
    const [selectedCategories, setSelectedCategories] = React.useState<string[]>(['Design']);
    const [newCategory, setNewCategory] = React.useState('');
    const [isAddingCategory, setIsAddingCategory] = React.useState(false);

    const handleAddCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setSelectedCategories([...selectedCategories, newCategory.trim()]); // Auto-select new cat
            setNewCategory('');
            setIsAddingCategory(false);
        }
    };

    const toggleCategory = (cat: string) => {
        if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter(c => c !== cat));
        } else {
            setSelectedCategories([...selectedCategories, cat]);
        }
    };

    // Tags State
    const [tags, setTags] = React.useState<string[]>(['ui-design', 'minimalism']);
    const [newTag, setNewTag] = React.useState('');

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = newTag.trim();
            if (tag && !tags.includes(tag)) {
                setTags([...tags, tag]);
                setNewTag('');
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploadingFeatured(true);
            try {
                // Convert to WebP (max 1200px, quality 80%)
                const webpDataUrl = await convertToWebP(file, 1200, 0.8);
                setFeaturedImage(webpDataUrl);
            } catch (error) {
                console.error('Image conversion error:', error);
                // Fallback to original format
                const reader = new FileReader();
                reader.onload = (e) => setFeaturedImage(e.target?.result as string);
                reader.readAsDataURL(file);
            } finally {
                setIsUploadingFeatured(false);
                event.target.value = '';
            }
        }
    };

    const removeFeaturedImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening upload dialog when clicking remove
        setFeaturedImage(null);
    };

    // Ruler State
    const [rulerState, setRulerState] = React.useState({
        leftIndent: 0,
        firstLineIndent: 0,
        rightIndent: 0
    });

    const isActive = (format: string) => activeFormats?.includes(format) || false;
    const isMultilevel = () => isMultilevelActive;

    const [focusedField, setFocusedField] = React.useState<'title' | 'body'>('body');

    // Handle Image Selection
    React.useEffect(() => {
        const handleImageClick = (e: MouseEvent) => {
            if (!editorRef.current) return;
            const target = e.target as HTMLElement;

            // Check if click is on an image inside the editor
            if (editorRef.current.contains(target) && target.tagName === 'IMG') {
                setSelectedImage(target as HTMLImageElement);
            } else {
                // Deselect if clicking elsewhere (handled by blur/focus mostly, but explicit click helps)
                // We need to be careful not to deselect when clicking the resizer itself
                // The resizer handles stopPropagation, so this should be fine.
                // But clicking toolbar shouldn't deselect? Maybe?
                // For now, simplify: if click is inside editor but not image, deselect.
                if (editorRef.current.contains(target) && target.tagName !== 'IMG') {
                    setSelectedImage(null);
                }
            }
        };

        const editor = editorRef.current;
        if (editor) {
            editor.addEventListener('click', handleImageClick);
            // Also prevent default drag behavior on images to allow our custom resize? 
            // Or just let it be. Taking control of dragstart might be needed.
        }

        return () => {
            if (editor) {
                editor.removeEventListener('click', handleImageClick);
            }
        };
    }, []);

    // Handle Image Deletion
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedImage) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault(); // Prevent deleting other content by accident
                if (editorRef.current && editorRef.current.contains(selectedImage)) {
                    selectedImage.remove();
                    setSelectedImage(null);
                    // Update formats/content state if needed
                    checkFormats();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedImage]);
    const [showBulletModal, setShowBulletModal] = React.useState(false);
    const [bulletType, setBulletType] = React.useState('disc');
    const [bulletAlignment, setBulletAlignment] = React.useState('left');

    const [showNumberModal, setShowNumberModal] = React.useState(false);
    const [showMultilevelModal, setShowMultilevelModal] = React.useState(false); // New Modal State
    const [showPublishConfirm, setShowPublishConfirm] = React.useState(false);
    const { showToast } = useToast();
    const [multilevelStyle, setMultilevelStyle] = React.useState('preset-paren'); // Default Style
    const [numberStyle, setNumberStyle] = React.useState('decimal');
    const [numberAlignment, setNumberAlignment] = React.useState('left');

    const [numberStartOption, setNumberStartOption] = React.useState<'new' | 'continue' | 'set'>('new');
    const [customStartValue, setCustomStartValue] = React.useState(1);

    // Selection State for Modals
    const [savedRange, setSavedRange] = React.useState<Range | null>(null);

    // List Logic Helpers
    const getSelectionParent = (tag: string) => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return null;
        let node = selection.anchorNode;
        while (node && node !== editorRef.current) {
            if (node.nodeName === tag.toUpperCase()) return node as HTMLElement;
            node = node.parentNode;
        }
        return null;
    };

    const applyBulletSettings = () => {
        // First ensure we have a list
        if (!document.queryCommandState('insertUnorderedList')) {
            document.execCommand('insertUnorderedList');
        }

        // Timeout to allow DOM update then find the list
        setTimeout(() => {
            const ul = getSelectionParent('ul');
            if (ul) {
                ul.style.listStyleType = bulletType;
                ul.style.textAlign = bulletAlignment;
                // Force styling if overridden by globals
                ul.style.cssText += `; list-style-type: ${bulletType} !important; text-align: ${bulletAlignment} !important;`;
            }
        }, 10);
        setShowBulletModal(false);
    };

    const applyNumberSettings = () => {
        // First ensure we have a list
        if (!document.queryCommandState('insertOrderedList')) {
            document.execCommand('insertOrderedList');
        }

        setTimeout(() => {
            const ol = getSelectionParent('ol');
            if (ol) {
                // Apply Style
                ol.setAttribute('type', numberStyle === 'decimal' ? '1' : numberStyle === 'upper-roman' ? 'I' : numberStyle === 'lower-roman' ? 'i' : numberStyle === 'upper-alpha' ? 'A' : 'a');
                ol.style.listStyleType = numberStyle;
                ol.style.textAlign = numberAlignment;

                // Apply Value/Start logic
                if (numberStartOption === 'new') {
                    ol.removeAttribute('start');
                } else if (numberStartOption === 'set') {
                    ol.setAttribute('start', customStartValue.toString());
                } else if (numberStartOption === 'continue') {
                    // Simple logic: if previous sibling is OL, take its start + length. 
                    // For now, simpler implementation: prompt user or just default to removing start (browser auto-calculates if strictly adjacent, but rarely are they).
                    // We'll trust the browser behavior or just do nothing specific for 'continue' other than NOT setting a fixed start.
                    ol.removeAttribute('start');
                }

                // Force CSS
                ol.style.cssText += `; list-style-type: ${numberStyle} !important; text-align: ${numberAlignment} !important;`;
            }
        }, 10);
        setShowNumberModal(false);
    };

    const checkFormats = () => {
        // Image Alignment Check
        if (selectedImage) {
            const formats: string[] = [];
            const marginLeft = selectedImage.style.marginLeft;
            const marginRight = selectedImage.style.marginRight;
            const margin = selectedImage.style.margin;

            if (margin === '0px auto' || margin === '0 auto') {
                formats.push('justifyCenter');
            } else if (marginLeft === 'auto' && marginRight === '0px') {
                formats.push('justifyRight');
            } else {
                // Default to left if block and no auto margins, or explicit left
                formats.push('justifyLeft');
            }
            setActiveFormats(formats);
            return;
        }

        const formats: string[] = [];
        if (document.queryCommandState('bold')) formats.push('bold');
        if (document.queryCommandState('italic')) formats.push('italic');
        if (document.queryCommandState('underline')) formats.push('underline');
        if (document.queryCommandState('strikeThrough')) formats.push('strikeThrough');
        if (document.queryCommandState('insertUnorderedList')) formats.push('insertUnorderedList');
        if (document.queryCommandState('insertOrderedList')) formats.push('insertOrderedList');
        if (document.queryCommandState('justifyLeft')) formats.push('justifyLeft');
        if (document.queryCommandState('justifyCenter')) formats.push('justifyCenter');
        if (document.queryCommandState('justifyRight')) formats.push('justifyRight');
        if (document.queryCommandState('justifyFull')) formats.push('justifyFull');
        setActiveFormats(formats);

        // Check for multilevel class
        const selection = window.getSelection();
        if (selection && selection.rangeCount && editorRef.current) {
            let node = selection.getRangeAt(0).commonAncestorContainer as HTMLElement;
            if (node.nodeType === 3) node = node.parentNode as HTMLElement;
            let foundMultilevel = false;
            let p = node;
            while (p && p !== editorRef.current) {
                // Ultra safe check for classList
                if (p.nodeType === 1) {
                    const el = p as HTMLElement;
                    // Fallback to getAttribute to avoid classList issues entirely
                    const className = el.getAttribute('class') || '';

                    // Check for preset classes
                    const isPreset = className.includes('list-preset-paren') ||
                        className.includes('list-preset-alpha-paren') ||
                        className.includes('list-preset-roman-paren');

                    if (el.tagName === 'OL' && (className.includes('is-multilevel') || isPreset)) {
                        foundMultilevel = true;
                        break;
                    }
                }
                p = p.parentNode as HTMLElement;
            }
            setIsMultilevelActive(foundMultilevel);

            // Ruler Sync
            const computedStyle = window.getComputedStyle(node);
            const marginLeft = parseFloat(computedStyle.marginLeft) || 0;
            const textIndent = parseFloat(computedStyle.textIndent) || 0;
            const marginRight = parseFloat(computedStyle.marginRight) || 0;

            setRulerState({
                leftIndent: marginLeft,
                firstLineIndent: textIndent,
                rightIndent: marginRight
            });

        } else {
            setIsMultilevelActive(false);
            setRulerState({ leftIndent: 0, firstLineIndent: 0, rightIndent: 0 });
        }
    };

    const handleRulerChange = (change: RulerChange) => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || !editorRef.current) return;

        const range = selection.getRangeAt(0);

        // Update local state for smooth dragging
        setRulerState(prev => ({ ...prev, ...change }));

        // Helper to apply styles
        const applyStyle = (el: HTMLElement) => {
            if (!editorRef.current?.contains(el)) return;
            if (change.leftIndent !== undefined) el.style.marginLeft = `${change.leftIndent}px`;
            if (change.firstLineIndent !== undefined) el.style.textIndent = `${change.firstLineIndent}px`;
            if (change.rightIndent !== undefined) el.style.marginRight = `${change.rightIndent}px`;
        };

        // If collapsed or single container, find closest block
        if (range.collapsed) {
            let node = range.commonAncestorContainer as HTMLElement;
            if (node.nodeType === 3) node = node.parentNode as HTMLElement;

            while (node && node !== editorRef.current) {
                const display = window.getComputedStyle(node).display;
                if (display === 'block' || display === 'list-item') {
                    applyStyle(node);
                    break;
                }
                node = node.parentNode as HTMLElement;
            }
            return;
        }

        // Multi-block selection: Iterate all potential blocks in editor
        // We target common block-level elements
        const blocks = editorRef.current.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, div');

        blocks.forEach((block) => {
            // Check if block intersects with range
            if (range.intersectsNode(block)) {
                // Ensure it is a direct block context (e.g. not a span inside a p, which wouldn't be in querySelectorAll anyway)
                // Also check if it's visible/rendered
                const style = window.getComputedStyle(block);
                if (style.display === 'none') return;

                // For nested structures (like li inside ul inside div), we might double apply?
                // Actually li inside ul is fine. checks intersect.
                // If a div wraps paragraphs, and both are selected?
                // Usually rich text editors flatten, but let's be careful.
                // If block has no block children, apply.
                if (block.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, div').length === 0) {
                    applyStyle(block as HTMLElement);
                } else {
                    // It's a container, usually we don't style the container if children are styled?
                    // E.g. blockquote might contain p. Style p or blockquote?
                    // Let's style the leaf blocks for now to be safe.
                }

                // Simple heuristic: Apply to all leaf blocks (blocks without block children)
            }
        });
    };

    const handleCommand = (command: string, value: string | undefined = undefined) => {
        // Image Alignment Handling
        if (selectedImage && ['justifyLeft', 'justifyCenter', 'justifyRight'].includes(command)) {
            // Reset common styles first
            selectedImage.style.display = 'block';
            selectedImage.style.marginLeft = '';
            selectedImage.style.marginRight = '';
            selectedImage.style.float = 'none'; // reset float if any

            if (command === 'justifyLeft') {
                selectedImage.style.marginRight = 'auto';
                selectedImage.style.marginLeft = '0';
            } else if (command === 'justifyCenter') {
                selectedImage.style.margin = '0 auto';
            } else if (command === 'justifyRight') {
                selectedImage.style.marginLeft = 'auto';
                selectedImage.style.marginRight = '0';
            }

            // Re-focus and check formats
            if (editorRef.current) editorRef.current.focus();
            checkFormats();
            return; // Skip default execCommand
        }

        document.execCommand(command, false, value);

        // Special handling for Numbering: Remove multilevel class if reapplying simple numbering
        if (command === 'insertOrderedList') {
            setTimeout(() => {
                const selection = window.getSelection();
                if (selection && selection.rangeCount) {
                    let node = selection.getRangeAt(0).commonAncestorContainer as HTMLElement;
                    if (node.nodeType === 3) node = node.parentNode as HTMLElement;
                    let p = node;
                    while (p && p !== editorRef.current) {
                        if (p.tagName === 'OL') {
                            // Always remove multilevel markers if simple numbering is clicked
                            p.classList.remove('list-preset-paren', 'list-preset-alpha-paren', 'list-preset-roman-paren');
                            p.classList.remove('is-multilevel');
                            // Reset style to decimal default
                            p.style.listStyleType = 'decimal';
                        }
                        p = p.parentNode as HTMLElement;
                    }
                }
            }, 10);
        }

        if (editorRef.current) {
            editorRef.current.focus();
        }
        checkFormats();
    };



    const handleLink = () => {
        const url = prompt('Enter URL:', 'https://');
        if (url) {
            handleCommand('createLink', url);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Convert to WebP (max 800px for inline, quality 80%)
                const webpDataUrl = await convertToWebP(file, 800, 0.8);
                document.execCommand('insertImage', false, webpDataUrl);
            } catch (error) {
                console.error('Image conversion error:', error);
                // Fallback to original format
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.execCommand('insertImage', false, e.target?.result as string);
                };
                reader.readAsDataURL(file);
            }
            event.target.value = '';
        }
    };

    const applyLineSpacing = (spacing: string) => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || !editorRef.current) return;

        const range = selection.getRangeAt(0);

        // Helper to find the nearest block parent
        const getBlockParent = (node: Node | null): HTMLElement | null => {
            let current = node;
            while (current && current !== editorRef.current) {
                if (current.nodeType === 1) { // Element node
                    const tag = (current as Element).tagName;
                    // Common block tags in contentEditable
                    if (['P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE'].includes(tag)) {
                        return current as HTMLElement;
                    }
                }
                current = current.parentNode;
            }
            return null;
        };

        const applyStyle = (el: HTMLElement) => {
            // Force line-height
            el.style.lineHeight = spacing;
            el.style.cssText += `; line-height: ${spacing} !important;`;
        };

        if (range.collapsed) {
            // Case 1: Caret only
            const block = getBlockParent(range.commonAncestorContainer);
            if (block) applyStyle(block);
        } else {
            // Case 2: Selection
            // Simple approach: apply to start and end blocks
            const startBlock = getBlockParent(range.startContainer);
            if (startBlock) applyStyle(startBlock);

            const endBlock = getBlockParent(range.endContainer);
            if (endBlock && endBlock !== startBlock) applyStyle(endBlock);

            // TODO: Ideally iterate through all blocks in range for full coverage
            // For now, start/end covers most common "select 2 paragraphs" case
        }
    };

    const applyShading = (color: string) => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || !editorRef.current) return;

        const range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer as HTMLElement;
        if (node.nodeType === 3) node = node.parentNode as HTMLElement;

        // Find closest block parent
        const getBlockParent = (node: Node | null): HTMLElement | null => {
            let current = node;
            while (current && current !== editorRef.current) {
                if (current.nodeType === 1) {
                    const tag = (current as Element).tagName;
                    if (['P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE'].includes(tag)) {
                        return current as HTMLElement;
                    }
                }
                current = current.parentNode;
            }
            return null;
        };

        const block = getBlockParent(node);
        if (block) {
            block.style.backgroundColor = color;
            // Add padding if it doesn't have it, to make shading look better
            if (!block.style.padding) {
                block.style.padding = '0.5rem';
                block.style.borderRadius = '0.375rem'; // rounded-md
            }
        }
    };

    const applyMultilevelStyle = (style: string) => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || !editorRef.current) return;

        let range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer as HTMLElement;
        if (node.nodeType === 3) node = node.parentNode as HTMLElement;

        // Check if inside list
        let insideList = false;
        let p = node;
        while (p && p !== editorRef.current) {
            if (p.tagName === 'OL' || p.tagName === 'UL') {
                insideList = true;
                break;
            }
            p = p.parentNode as HTMLElement;
        }

        if (!insideList) {
            document.execCommand('insertOrderedList');
            // Re-get selection after command
            const newSelection = window.getSelection();
            if (newSelection && newSelection.rangeCount) {
                range = newSelection.getRangeAt(0);
                node = range.commonAncestorContainer as HTMLElement;
                if (node.nodeType === 3) node = node.parentNode as HTMLElement;
            } else {
                return; // Should not happen
            }
        }

        // Helper to find root list
        const getRootList = (current: HTMLElement): HTMLElement | null => {
            let root = null;
            let p = current;
            while (p && p !== editorRef.current) {
                if (p.tagName === 'OL' || p.tagName === 'UL') {
                    root = p; // Keep tracking up
                }
                p = p.parentNode as HTMLElement;
            }
            return root;
        };

        if (style === 'preset-paren' || style === 'preset-alpha-paren' || style === 'preset-roman-paren') {
            let root = getRootList(node);

            // Fallback: If no root found going up, check if node CONTAINS a list (broad selection)
            if (!root && (node.tagName === 'DIV' || node.tagName === 'P')) {
                root = node.querySelector('ol');
            }

            if (root && root.tagName === 'OL') {
                console.log('Found Root:', root);
                console.log('Classes Before:', root.className);

                // Clear all preset classes first
                root.classList.remove('list-preset-paren', 'list-preset-alpha-paren', 'list-preset-roman-paren');

                // Add new preset class
                if (style === 'preset-paren') root.classList.add('list-preset-paren');
                if (style === 'preset-alpha-paren') root.classList.add('list-preset-alpha-paren');
                if (style === 'preset-roman-paren') root.classList.add('list-preset-roman-paren');

                console.log('Classes After:', root.className);

                root.classList.add('is-multilevel'); // Mark as multilevel
                root.style.listStyleType = '';
                root.removeAttribute('type'); // Remove HTML type attribute

                // Force clean inner lists to let CSS take over
                const innerLists = root.querySelectorAll('ol, ul');
                innerLists.forEach((list) => {
                    const el = list as HTMLElement;
                    el.classList.remove('list-preset-paren', 'list-preset-alpha-paren', 'list-preset-roman-paren', 'is-multilevel');
                    el.style.listStyleType = '';
                    el.style.listStyle = '';
                    el.removeAttribute('type'); // Critical for nested list type reset
                });

                // Force clean all list items to remove individual overrides
                const listItems = root.querySelectorAll('li');
                listItems.forEach((li) => {
                    li.style.listStyleType = '';
                    li.style.listStyle = '';
                    li.removeAttribute('type');
                    li.removeAttribute('value'); // Remove custom numbering if present
                });
            }
        } else {
            // Standard Single Level Apply
            let current: HTMLElement | null = node;
            while (current && current !== editorRef.current) {
                if (current.tagName === 'OL' || current.tagName === 'UL') {
                    // Remove preset specific class if switching to manual style
                    if (current.classList.contains('list-preset-paren')) {
                        current.classList.remove('list-preset-paren');
                    }
                    const root = getRootList(current);
                    if (root && root.classList.contains('list-preset-paren')) {
                        root.classList.remove('list-preset-paren');
                    }

                    // Add generic multilevel marker
                    if (root) root.classList.add('is-multilevel');
                    current.classList.add('is-multilevel');

                    current.style.listStyleType = style;
                    current.style.cssText += `; list-style-type: ${style} !important;`;
                    break;
                }
                current = current.parentNode as HTMLElement;
            }
        }

        // Ensure focus and check formats
        if (editorRef.current) {
            editorRef.current.focus();
        }
        checkFormats();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                document.execCommand('outdent');
            } else {
                document.execCommand('indent');
            }
        }
    };

    // Initialize Editor Content - Load from URL if ID exists
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            setCurrentPostId(id);
            // Fetch post data
            fetch(`/api/admin/content?id=${id}`)
                .then(res => res.json())
                .then(data => {
                    const post = Array.isArray(data) ? data[0] : data;
                    if (post) {
                        if (titleRef.current) titleRef.current.innerText = post.title;
                        if (editorRef.current) editorRef.current.innerHTML = post.content;
                        setFeaturedImage(post.image);
                        // Set other states if needed (categories, tags)
                        if (post.categories) setSelectedCategories(post.categories);
                        if (post.tags) setTags(post.tags);
                    }
                })
                .catch(err => console.error("Failed to load post", err));
        }
    }, []);

    // Check formats on cursor movement or selection change
    React.useEffect(() => {
        const handleSelectionChange = () => {
            checkFormats();
        };
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, []);



    const [currentPostId, setCurrentPostId] = React.useState<string | null>(null);

    const handleSave = async (status: 'published' | 'draft') => {
        if (!editorRef.current) return;

        const title = titleRef.current?.innerText || 'Untitled';
        const content = editorRef.current.innerHTML;

        const payload: any = {
            title,
            content,
            status,
            image: featuredImage, // Use the state we have
            categories: selectedCategories,
            tags: tags,
            date: new Date().toISOString() // Or use the input date if connected
        };

        if (currentPostId) {
            payload.id = currentPostId;
        }

        try {
            const res = await fetch('/api/admin/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save');

            const data = await res.json();

            // Update currentPostId so subsequent saves update this post
            if (data.data && data.data.id) {
                const isNew = !currentPostId;
                setCurrentPostId(data.data.id);

                // Update URL without reload if it was a new post
                if (isNew) {
                    const newUrl = `${window.location.pathname}?id=${data.data.id}`;
                    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
                }
            }

            if (status === 'published') {
                showToast('Berita berhasil dipublikasikan!', 'success');
                // Automatically redirect to Posts management
                router.push('/admin/posts');
            } else {
                return data.data.slug;
            }
        } catch (error) {
            console.error(error);
            showToast('Gagal menyimpan berita.', 'error');
            return null;
        }
    };


    const handlePublish = () => {
        setShowPublishConfirm(true);
    };

    const confirmPublish = () => {
        setShowPublishConfirm(false);
        handleSave('published');
    };

    const cancelPublish = () => {
        setShowPublishConfirm(false);
    };

    const handlePreview = async () => {
        const slug = await handleSave('draft');
        if (slug) {
            window.open(`/berita/read?slug=${slug}`, '_blank');
        }
    };


    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0B1114] text-slate-800 dark:text-slate-100 antialiased font-sans">
            <input
                type="file"
                ref={featuredInputRef}
                onChange={handleFeaturedImageUpload}
                className="hidden"
                accept="image/*"
            />

            {/* Header */}
            <header className="h-16 bg-gray-900 dark:bg-white border-b border-gray-700 dark:border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-gray-800 dark:hover:bg-slate-100 rounded-lg transition-colors text-slate-400 dark:text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Posts / Add New</span>
                        <span className="text-sm font-semibold text-white dark:text-slate-900 flex items-center gap-2">
                            Editing Draft
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 mr-2 hidden sm:inline-block">Saved 2m ago</span>
                    <button onClick={handlePreview} className="p-2 text-slate-400 dark:text-slate-600 hover:text-primary dark:hover:text-primary transition-colors flex items-center justify-center border border-transparent hover:bg-gray-800 dark:hover:bg-slate-100 rounded-lg" title="Preview">
                        <Eye className="w-5 h-5" />
                    </button>
                    <button onClick={handlePublish} className="px-3 sm:px-4 py-2 bg-primary hover:bg-sky-600 text-white text-sm font-medium rounded-lg shadow-sm shadow-sky-500/30 transition-all flex items-center gap-2 active:scale-95">
                        <Rocket className="w-4 h-4" />
                        <span className="hidden sm:inline">Publish</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-4rem)]">
                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-gray-50 dark:bg-gray-100 p-4 md:p-8 flex justify-center">
                    <div className="w-full max-w-4xl flex flex-col gap-6">
                        {/* Toolbar - Inverted Theme as requested */}
                        <div className="bg-gray-800 dark:bg-white rounded-xl shadow-sm border border-gray-700 dark:border-slate-200 p-2 sticky top-0 z-20 flex flex-wrap items-center gap-1 transition-colors">
                            {/* Headings */}
                            <div className="flex items-center border-r border-slate-700 dark:border-slate-200 pr-2 mr-1">
                                <button onClick={() => handleCommand('formatBlock', 'H1')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100 rounded transition-colors" title="Heading 1">
                                    <Heading1 className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleCommand('formatBlock', 'H2')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100 rounded transition-colors" title="Heading 2">
                                    <Heading2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Font Size & Style (Basic) */}
                            <div className="flex items-center border-r border-slate-700 dark:border-slate-200 pr-2 mr-1 gap-1">
                                <select onChange={(e) => handleCommand('fontName', e.target.value)} className="bg-transparent text-sm text-slate-300 dark:text-slate-700 border border-slate-700 dark:border-slate-300 rounded p-1 w-32 focus:outline-none focus:border-primary">
                                    <option value="Arial" className="text-slate-900">Arial</option>
                                    <option value="Arial Black" className="text-slate-900">Arial Black</option>
                                    <option value="Verdana" className="text-slate-900">Verdana</option>
                                    <option value="Tahoma" className="text-slate-900">Tahoma</option>
                                    <option value="Trebuchet MS" className="text-slate-900">Trebuchet MS</option>
                                    <option value="Impact" className="text-slate-900">Impact</option>
                                    <option value="Gill Sans" className="text-slate-900">Gill Sans</option>
                                    <option value="Times New Roman" className="text-slate-900">Times New Roman</option>
                                    <option value="Georgia" className="text-slate-900">Georgia</option>
                                    <option value="Palatino" className="text-slate-900">Palatino</option>
                                    <option value="Baskerville" className="text-slate-900">Baskerville</option>
                                    <option value="Andalé Mono" className="text-slate-900">Andalé Mono</option>
                                    <option value="Courier" className="text-slate-900">Courier</option>
                                    <option value="Lucida" className="text-slate-900">Lucida</option>
                                    <option value="Monaco" className="text-slate-900">Monaco</option>
                                    <option value="Bradley Hand" className="text-slate-900">Bradley Hand</option>
                                    <option value="Brush Script MT" className="text-slate-900">Brush Script MT</option>
                                    <option value="Luminari" className="text-slate-900">Luminari</option>
                                    <option value="Comic Sans MS" className="text-slate-900">Comic Sans MS</option>
                                    <option value="Poppins, sans-serif" className="text-slate-900">Poppins</option>
                                    <option value="Calibri" className="text-slate-900">Calibri</option>
                                </select>
                                <select onChange={(e) => handleCommand('fontSize', e.target.value)} className="bg-transparent text-sm text-slate-300 dark:text-slate-700 border border-slate-700 dark:border-slate-300 rounded p-1 w-16 focus:outline-none focus:border-primary">
                                    <option value="1" className="text-slate-900">Small</option>
                                    <option value="3" className="text-slate-900">Normal</option>
                                    <option value="5" className="text-slate-900">Large</option>
                                    <option value="7" className="text-slate-900">Huge</option>
                                </select>

                                {/* Text Color */}
                                <div className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer overflow-hidden" title="Text Color">
                                    <Palette className="w-4 h-4 text-slate-500 absolute pointer-events-none" />
                                    <input
                                        type="color"
                                        onChange={(e) => handleCommand('foreColor', e.target.value)}
                                        className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                                    />
                                </div>

                                {/* Highlight Color */}
                                <div className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden" title="Highlight Color">
                                    <Highlighter className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute pointer-events-none" />
                                    <input
                                        type="color"
                                        onChange={(e) => handleCommand('hiliteColor', e.target.value)}
                                        className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                                    />
                                </div>

                                {/* Line Spacing */}
                                <div className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer" title="Line Spacing">
                                    <MoveVertical className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute pointer-events-none" />
                                    <select
                                        onChange={(e) => applyLineSpacing(e.target.value)}
                                        className="opacity-0 w-full h-full cursor-pointer absolute inset-0 appearance-none"
                                        defaultValue="1.5"
                                    >
                                        <option value="1.0" className="text-slate-900">1.0</option>
                                        <option value="1.15" className="text-slate-900">1.15</option>
                                        <option value="1.5" className="text-slate-900">1.5</option>
                                        <option value="2.0" className="text-slate-900">2.0</option>
                                        <option value="2.5" className="text-slate-900">2.5</option>
                                        <option value="3.0" className="text-slate-900">3.0</option>
                                    </select>
                                </div>

                                {/* Shading (Background Block) */}
                                <div className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden" title="Paragraph Shading">
                                    <PaintBucket className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute pointer-events-none" />
                                    <input
                                        type="color"
                                        onChange={(e) => applyShading(e.target.value)}
                                        className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                                    />
                                </div>

                            </div>

                            {/* Basic Formatting */}
                            <div className="flex items-center border-r border-slate-700 dark:border-slate-200 pr-2 mr-1">
                                <button onClick={() => handleCommand('bold')} className={`p-2 rounded transition-colors ${isActive('bold') ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100'}`} title="Bold">
                                    <Bold className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleCommand('italic')} className={`p-2 rounded transition-colors ${isActive('italic') ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100'}`} title="Italic">
                                    <Italic className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleCommand('underline')} className={`p-2 rounded transition-colors ${isActive('underline') ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100'}`} title="Underline">
                                    <Underline className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleCommand('strikeThrough')} className={`p-2 rounded transition-colors ${isActive('strikeThrough') ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100'}`} title="Strikethrough">
                                    <Strikethrough className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center border-r border-slate-700 dark:border-slate-200 pr-2 mr-1">
                                <div className="flex items-center bg-slate-800 dark:bg-slate-100 rounded mr-1">
                                    <button onClick={() => handleCommand('insertUnorderedList')} className={`p-2 rounded-l transition-colors ${isActive('insertUnorderedList') ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-primary shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100'}`} title="Bullet List">
                                        <List className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setShowBulletModal(true)} className="p-1 px-1.5 border-l border-slate-700 dark:border-slate-200 hover:bg-slate-700 dark:hover:bg-slate-200 rounded-r transition-colors" title="Bullet Settings">
                                        <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                    </button>
                                </div>
                                <div className="flex items-center bg-slate-800 dark:bg-slate-100 rounded mr-1">
                                    <button onClick={() => handleCommand('insertOrderedList')} className={`p-2 rounded-l transition-colors ${isActive('insertOrderedList') && !isMultilevel() ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-primary shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100'}`} title="Numbered List">
                                        <ListOrdered className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setShowNumberModal(true)} className="p-1 px-1.5 border-l border-slate-700 dark:border-slate-200 hover:bg-slate-700 dark:hover:bg-slate-200 rounded-r transition-colors" title="Numbering Settings">
                                        <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                    </button>
                                </div>
                                {/* Multilevel List Style (Manual) - Split Button */}
                                <div className="flex items-center bg-slate-800 dark:bg-slate-100 rounded mr-1">
                                    <button
                                        onClick={() => applyMultilevelStyle(multilevelStyle)}
                                        className={`p-2 rounded-l hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors border-r border-slate-700 dark:border-slate-200 ${isMultilevel() ? 'bg-slate-900 text-white dark:bg-white dark:text-primary shadow-sm' : 'text-slate-400 hover:text-white dark:text-slate-500 dark:hover:text-primary'}`}
                                        title={`Apply Multilevel List Style: ${multilevelStyle}`}
                                    >
                                        <ListTree className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const selection = window.getSelection();
                                            if (selection && selection.rangeCount > 0) {
                                                setSavedRange(selection.getRangeAt(0));
                                            }
                                            setShowMultilevelModal(true);
                                        }}
                                        className="p-1 px-1.5 rounded-r hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
                                        title="Select Multilevel Style"
                                    >
                                        <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                    </button>
                                </div>

                                <button onClick={() => handleCommand('indent')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100 rounded transition-colors" title="Increase Indent (Tab)">
                                    <Indent className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleCommand('outdent')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100 rounded transition-colors" title="Decrease Indent (Shift+Tab)">
                                    <Outdent className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Alignment */}
                            <div className="flex items-center border-r border-slate-700 dark:border-slate-200 pr-2 mr-1">
                                <button onClick={() => handleCommand('justifyLeft')} className={`p-2 rounded transition-colors ${isActive('justifyLeft') ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100'}`} title="Align Left">
                                    <AlignLeft className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleCommand('justifyCenter')} className={`p-2 rounded transition-colors ${isActive('justifyCenter') ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100'}`} title="Align Center">
                                    <AlignCenter className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleCommand('justifyRight')} className={`p-2 rounded transition-colors ${isActive('justifyRight') ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100'}`} title="Align Right">
                                    <AlignRight className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleCommand('justifyFull')} className={`p-2 rounded transition-colors ${isActive('justifyFull') ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100'}`} title="Justify">
                                    <AlignJustify className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Inserts */}
                            <div className="flex items-center gap-1">
                                <button onClick={() => {
                                    const url = prompt('Enter URL:');
                                    if (url) handleCommand('createLink', url);
                                }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100 rounded transition-colors" title="Link">
                                    <LinkIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 dark:text-slate-500 dark:hover:text-primary dark:hover:bg-slate-100 rounded transition-colors" title="Upload Image">
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button onClick={() => handleCommand('removeFormat')} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 dark:text-slate-500 dark:hover:text-red-500 dark:hover:bg-red-50 rounded transition-colors" title="Clear Formatting">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        {/* Content Area */}
                        <div className="bg-gray-900 dark:bg-white min-h-[400px] md:min-h-[800px] shadow-sm rounded-xl border border-gray-700 dark:border-slate-300 focus-within:ring-2 focus-within:ring-primary/20 transition-shadow flex flex-col">
                            {/* Ruler */}
                            <EditorRuler
                                leftIndent={rulerState.leftIndent}
                                firstLineIndent={rulerState.firstLineIndent}
                                rightIndent={rulerState.rightIndent}
                                onChange={handleRulerChange}
                            />

                            <div className="p-4 sm:p-6 md:p-12 flex-1 relative">
                                <ImageResizer
                                    editorRef={editorRef}
                                    selectedImage={selectedImage}
                                    setSelectedImage={setSelectedImage}
                                />
                                <div
                                    ref={titleRef}
                                    className="w-full text-3xl md:text-5xl font-bold placeholder-slate-500 dark:placeholder-slate-400 text-white dark:text-slate-900 border-none focus:ring-0 p-0 mb-6 bg-transparent outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-500 dark:empty:before:text-slate-400"
                                    data-placeholder="Post Title"
                                    contentEditable={true}
                                    spellCheck={false}
                                    onKeyUp={checkFormats}
                                    onMouseUp={checkFormats}
                                    onFocus={() => {
                                        setFocusedField('title');
                                        setSelectedImage(null);
                                    }}
                                    suppressContentEditableWarning={true}
                                />

                                {/* Editable Content */}
                                <div
                                    ref={editorRef}
                                    className="editor-content w-full max-w-none focus:outline-none min-h-[250px] md:min-h-[500px] text-base md:text-lg text-slate-300 dark:text-slate-900"
                                    contentEditable={true}
                                    spellCheck={false}
                                    onKeyDown={handleKeyDown}
                                    onKeyUp={checkFormats}
                                    onMouseUp={checkFormats}
                                    onFocus={() => setFocusedField('body')}
                                    suppressContentEditableWarning={true}
                                />
                            </div>
                        </div>
                        <div className="h-10"></div>
                    </div>
                </div>

                {/* Sidebar - Inverted Theme */}
                <aside className="w-full md:w-80 lg:w-96 bg-gray-900 dark:bg-white border-l border-gray-700 dark:border-slate-200 flex-shrink-0 overflow-y-auto custom-scrollbar md:h-full border-t md:border-t-0">
                    <div className="p-6 space-y-8">
                        {/* Publishing Status */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Rocket className="w-3 h-3 text-primary" /> Publishing
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">Status</label>
                                    <select className="w-full bg-gray-800 dark:bg-slate-100 border-gray-700 dark:border-slate-300 rounded-lg text-sm text-slate-200 dark:text-slate-700 focus:ring-primary focus:border-primary px-3 py-2 outline-none">
                                        <option className="text-slate-900 bg-white dark:bg-slate-100 dark:text-slate-900">Draft</option>
                                        <option className="text-slate-900 bg-white dark:bg-slate-100 dark:text-slate-900">Pending Review</option>
                                        <option className="text-slate-900 bg-white dark:bg-slate-100 dark:text-slate-900">Published</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">Visibility</label>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 bg-gray-800 dark:bg-slate-100 p-2.5 rounded-lg border border-gray-700 dark:border-slate-300">
                                            <Eye className="text-slate-400 w-4 h-4" />
                                            <span className="text-sm text-slate-200 dark:text-slate-700 font-medium capitalize">{visibility}</span>
                                            <button
                                                onClick={() => setShowVisibilityOptions(!showVisibilityOptions)}
                                                className="ml-auto text-xs text-primary font-medium hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </div>

                                        {/* Visibility Options Expansion */}
                                        {showVisibilityOptions && (
                                            <div className="bg-gray-800 dark:bg-slate-100 p-3 rounded-lg border border-gray-700 dark:border-slate-300 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="visibility"
                                                        checked={visibility === 'public'}
                                                        onChange={() => setVisibility('public')}
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm text-slate-300 dark:text-slate-700">Public</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="visibility"
                                                        checked={visibility === 'password'}
                                                        onChange={() => setVisibility('password')}
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm text-slate-300 dark:text-slate-700">Password Protected</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="visibility"
                                                        checked={visibility === 'private'}
                                                        onChange={() => setVisibility('private')}
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm text-slate-300 dark:text-slate-700">Private</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">Publish Date</label>
                                    <input type="datetime-local" className="w-full bg-gray-800 dark:bg-slate-100 border-gray-700 dark:border-slate-300 rounded-lg text-xs text-slate-200 dark:text-slate-700 focus:ring-primary focus:border-primary px-3 py-2 outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-800 dark:bg-slate-200"></div>

                        {/* Featured Image */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <ImageIcon className="w-3 h-3 text-primary" /> Featured Image
                            </h3>

                            <div
                                onClick={() => !featuredImage && featuredInputRef.current?.click()}
                                className={`relative group cursor-pointer border-2 border-dashed rounded-xl transition-all overflow-hidden aspect-video w-full flex flex-col items-center justify-center
                                    ${featuredImage ? 'border-primary' : 'border-gray-700 dark:border-slate-300 hover:border-primary dark:hover:border-primary bg-gray-800 dark:bg-slate-100'}
                                `}
                            >
                                {isUploadingFeatured ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xs text-slate-400 dark:text-slate-500">Uploading...</span>
                                    </div>
                                ) : featuredImage ? (
                                    <>
                                        <img src={featuredImage} alt="Featured" className="absolute inset-0 w-full h-full object-cover" />
                                        {/* Delete Button Overlay */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-2 cursor-default">
                                            <button
                                                onClick={removeFeaturedImage}
                                                className="bg-white text-red-500 p-1.5 rounded-full shadow-lg hover:bg-red-50 transition-colors w-8 h-8 flex items-center justify-center"
                                                title="Remove Image"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                                        <CloudUpload className="text-slate-500 dark:text-slate-400 w-8 h-8 group-hover:text-primary transition-colors" />
                                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Click to upload cover</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-800 dark:bg-slate-200"></div>

                        {/* Taxonomy */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <List className="w-3 h-3 text-primary" /> Taxonomy
                            </h3>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">Category</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar bg-gray-800 dark:bg-slate-100 p-3 rounded-lg border border-gray-700 dark:border-slate-300">
                                    {categories.map((cat) => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="rounded text-primary focus:ring-primary border-slate-600 dark:border-slate-400 bg-transparent w-4 h-4"
                                                checked={selectedCategories.includes(cat)}
                                                onChange={() => toggleCategory(cat)}
                                            />
                                            <span className="text-sm text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors select-none">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                                {isAddingCategory ? (
                                    <div className="mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                        <input
                                            type="text"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                            className="flex-1 bg-gray-800 dark:bg-slate-100 border border-gray-700 dark:border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-200 dark:text-slate-700 focus:outline-none focus:border-primary"
                                            placeholder="New Category Name"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleAddCategory}
                                            className="p-1 bg-primary text-white rounded hover:bg-sky-600 transition-colors"
                                            title="Add"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => setIsAddingCategory(false)}
                                            className="p-1 text-slate-500 hover:text-slate-300 dark:hover:text-slate-500 transition-colors"
                                            title="Cancel"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsAddingCategory(true)}
                                        className="mt-2 text-xs font-medium text-primary hover:text-sky-600 flex items-center gap-1 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" /> Add New Category
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Tags</label>
                                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-800 dark:bg-slate-100 rounded-lg border border-slate-700 dark:border-slate-300 min-h-[40px]">
                                    {tags.map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-sky-700 focus:outline-none"
                                                title="Remove tag"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="Add a tag..."
                                        className="bg-transparent text-xs text-slate-300 dark:text-slate-700 outline-none flex-1 min-w-[80px] placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={handleAddTag}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400">Press Enter to add tags</p>
                            </div>
                        </div>

                        <div className="w-full h-px bg-slate-800 dark:bg-slate-200"></div>

                        {/* SEO */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Search className="w-3 h-3 text-primary" /> SEO Settings
                            </h3>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Meta Title</label>
                                <input className="w-full bg-slate-800 dark:bg-slate-100 border-slate-700 dark:border-slate-300 rounded-lg text-sm text-slate-200 dark:text-slate-700 focus:ring-primary focus:border-primary px-3 py-2 outline-none" placeholder="Page title in search results" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Meta Description</label>
                                <textarea className="w-full bg-slate-800 dark:bg-slate-100 border-slate-700 dark:border-slate-300 rounded-lg text-sm text-slate-200 dark:text-slate-700 focus:ring-primary focus:border-primary px-3 py-2 resize-none outline-none" placeholder="Brief description for search engines" rows={3}></textarea>
                            </div>
                        </div>

                    </div>
                </aside>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #334155;
                }
            `}</style>

            {/* Define New Bullet Modal */}
            {showBulletModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#151e23] rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Define New Bullet</h3>
                            <button onClick={() => setShowBulletModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Bullet Character */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bullet Character</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['disc', 'circle', 'square'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setBulletType(type)}
                                            className={`flex items-center justify-center p-3 rounded-lg border ${bulletType === type ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            <span className={`list-item list-inside`} style={{ listStyleType: type }}>Item</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Alignment */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Alignment</label>
                                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                    {['left', 'center', 'right'].map((align) => (
                                        <button
                                            key={align}
                                            onClick={() => setBulletAlignment(align)}
                                            className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-colors ${bulletAlignment === align ? 'bg-white dark:bg-[#0B1114] shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            {align}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-[#0B1114]/50 rounded-b-xl">
                            <button onClick={() => setShowBulletModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white">Cancel</button>
                            <button onClick={applyBulletSettings} className="px-4 py-2 text-sm font-medium bg-primary hover:bg-sky-600 text-white rounded-lg shadow-sm">OK</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Define New Number Modal */}
            {showNumberModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#151e23] rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Define New Number Format</h3>
                            <button onClick={() => setShowNumberModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Number Style */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Number Style</label>
                                <select
                                    value={numberStyle}
                                    onChange={(e) => setNumberStyle(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="decimal">1, 2, 3</option>
                                    <option value="upper-roman">I, II, III</option>
                                    <option value="lower-roman">i, ii, iii</option>
                                    <option value="upper-alpha">A, B, C</option>
                                    <option value="lower-alpha">a, b, c</option>
                                </select>
                            </div>

                            {/* Alignment */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Alignment</label>
                                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                    {['left', 'center', 'right'].map((align) => (
                                        <button
                                            key={align}
                                            onClick={() => setNumberAlignment(align)}
                                            className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-colors ${numberAlignment === align ? 'bg-white dark:bg-[#0B1114] shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            {align}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Number Value Options */}
                            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Numbering</label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="numberValueOption"
                                        checked={numberStartOption === 'new'}
                                        onChange={() => setNumberStartOption('new')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Start new list</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="numberValueOption"
                                        checked={numberStartOption === 'continue'}
                                        onChange={() => setNumberStartOption('continue')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Continue from previous list</span>
                                </label>
                                <div className="ml-7 text-xs text-slate-400 italic">
                                    (Logic: Advance value/Skip number)
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="numberValueOption"
                                        checked={numberStartOption === 'set'}
                                        onChange={() => setNumberStartOption('set')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Set value to:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={customStartValue}
                                        onChange={(e) => setCustomStartValue(parseInt(e.target.value) || 1)}
                                        disabled={numberStartOption !== 'set'}
                                        className="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm disabled:opacity-50"
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-[#0B1114]/50 rounded-b-xl">
                            <button onClick={() => setShowNumberModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white">Cancel</button>
                            <button onClick={applyNumberSettings} className="px-4 py-2 text-sm font-medium bg-primary hover:bg-sky-600 text-white rounded-lg shadow-sm">OK</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Define Multilevel List Modal */}
            {showMultilevelModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#151e23] rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Multilevel List Style</h3>
                            <button onClick={() => setShowMultilevelModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Style</label>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => {
                                        if (savedRange) {
                                            const sel = window.getSelection();
                                            sel?.removeAllRanges();
                                            sel?.addRange(savedRange);
                                        }
                                        setMultilevelStyle('preset-paren');
                                        applyMultilevelStyle('preset-paren');
                                        setShowMultilevelModal(false);
                                        setSavedRange(null);
                                    }}
                                    className={`text-left p-3 rounded-lg border ${multilevelStyle === 'preset-paren' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    <div className="font-medium">Preset: 1. a) i.</div>
                                    <div className="text-xs opacity-70">Standard nested list</div>
                                </button>

                                <button
                                    onClick={() => {
                                        if (savedRange) {
                                            const sel = window.getSelection();
                                            sel?.removeAllRanges();
                                            sel?.addRange(savedRange);
                                        }
                                        setMultilevelStyle('preset-alpha-paren');
                                        applyMultilevelStyle('preset-alpha-paren');
                                        setShowMultilevelModal(false);
                                        setSavedRange(null);
                                    }}
                                    className={`text-left p-3 rounded-lg border ${multilevelStyle === 'preset-alpha-paren' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    <div className="font-medium">Preset: A. 1) a.</div>
                                    <div className="text-xs opacity-70">Alpha - Number - Alpha</div>
                                </button>

                                <button
                                    onClick={() => {
                                        if (savedRange) {
                                            const sel = window.getSelection();
                                            sel?.removeAllRanges();
                                            sel?.addRange(savedRange);
                                        }
                                        setMultilevelStyle('preset-roman-paren');
                                        applyMultilevelStyle('preset-roman-paren');
                                        setShowMultilevelModal(false);
                                        setSavedRange(null);
                                    }}
                                    className={`text-left p-3 rounded-lg border ${multilevelStyle === 'preset-roman-paren' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    <div className="font-medium">Preset: I. i) 1.</div>
                                    <div className="text-xs opacity-70">Roman - Roman - Number</div>
                                </button>


                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-[#0B1114]/50 rounded-b-xl">
                            <button onClick={() => setShowMultilevelModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Publish Confirmation Modal */}
            {showPublishConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full transform transition-all">
                        <div className="mb-6 text-center">
                            <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Rocket className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Konfirmasi Publikasi</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Apakah Anda yakin ingin mempublikasikan berita ini sekarang?
                            </p>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
                            <button
                                onClick={cancelPublish}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmPublish}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 text-white font-medium hover:bg-sky-700 shadow-md shadow-sky-500/30 transition-colors"
                            >
                                Ya, Publikasikan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
