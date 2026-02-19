import React, { useState, useEffect, useRef, useMemo } from 'react';

export const SkinViewer3D = ({ skinUrl, width = 200, height = 300 }) => {
    const canvasRef = useRef(null);
    const viewerRef = useRef(null);

    console.log('updated')

    useEffect(() => {
        console.log('Updating skin...')

        if (!window.skinview3d) {
            const script = document.createElement('script');
            script.src = "https://bs-community.github.io/skinview3d/js/skinview3d.bundle.js";
            script.async = true;
            script.onload = initViewer;
            document.body.appendChild(script);
        } else {
            initViewer();
        }

        function initViewer() {
            if (!canvasRef.current) return;
            if (viewerRef.current) {
                viewerRef.current.dispose();
            }

            console.log('Skin', skinUrl)

            // @ts-ignore
            const viewer = new window.skinview3d.SkinViewer({
                canvas: canvasRef.current,
                width: width,
                height: height,
                skin: skinUrl || "https://minecraft.wiki/images/Steve_%28classic_texture%29_JE6.png?8aa86"
            });

            viewer.animation = new window.skinview3d.WalkingAnimation();
            viewer.fov = 70;
            viewer.zoom = 0.9;
            viewer.autoRotate = true;
            viewer.autoRotateSpeed = 0.5;

            viewerRef.current = viewer;
        }

        return () => {};
    }, [ skinUrl, width, height ]);

    return (
        <div style={{background: 'radial-gradient(circle, var(--surface-h) 0%, var(--surface) 100%)', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border)'}}>
        <canvas ref={canvasRef} />
        </div>
    );
};
