import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Move } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  label?: string;
  color?: string;
}

export default function MarketSphere3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [interactionInfo, setInteractionInfo] = useState('Drag to rotate 3D node sphere');

  // 3D rotation states
  const rotationRef = useRef({ x: 0.5, y: 0.5 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate points on a sphere using Golden Spiral / Fibonacci Lattice
    const points: Point3D[] = [];
    const numPoints = 85;
    const sectors = ['FINTECH', 'BANKING', 'IT SEC', 'INFRA', 'PHARMA', 'ENERGY', 'METALS', 'AUTOMOBILE', 'MEDIA', 'TELECOM', 'CHEMICALS', 'RETAIL'];
    
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / numPoints);
      const theta = Math.sqrt(numPoints * Math.PI) * phi;
      
      const r = 140; // Sphere radius
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      let label: string | undefined;
      // Add text label to a subset of points (represent key sector indicators)
      if (i % 7 === 0) {
        label = sectors[(i / 7) % sectors.length];
      }

      // High quality color themes for nodes
      const hue = (160 + (i * 20) % 120) % 360; // range around indigo, blues, teals
      const color = `hsla(${hue}, 80%, 65%, 1)`;

      points.push({ x, y, z, label, color });
    }

    let animationFrameId: number;
    let angleX = 0.004; // Auto rotation speeds
    let angleY = 0.006;

    const updateAndDraw = () => {
      // Handle resizing matching container
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }
      }

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 350; // Camera perspective focal point

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create high-contrast ambient space cyber backdrop
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle orbital dust ring in 3D perspective
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
      ctx.lineWidth = 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.35); // flatten to isometric ellipse
      ctx.beginPath();
      ctx.arc(0, 0, 180, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 240, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Slow idle rotation if user is not actively dragging
      if (!isDraggingRef.current) {
        rotationRef.current.x += angleX;
        rotationRef.current.y += angleY;
      }

      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Transform all points to 3D space and sort by depth (z-order) for proper transparency rendering
      const transformedPoints = points.map(p => {
        // Rotate around Y axis
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;

        // Rotate around X axis
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        // Perspective projections
        const scale = fov / (fov + z2);
        const sx = x1 * scale + cx;
        const sy = y2 * scale + cy;

        return {
          sx,
          sy,
          z: z2,
          scale,
          orig: p
        };
      });

      // Sort back-to-front (high Z index is deeper / further away, rendered first)
      transformedPoints.sort((a, b) => b.z - a.z);

      // Render wireframe lines linking nearby nodes (creates the premium 3D constellation design)
      ctx.lineWidth = 0.8;
      for (let i = 0; i < transformedPoints.length; i++) {
        const p1 = transformedPoints[i];
        if (p1.z > 140) continue; // Skip lines for very distant points

        // Check nearest neighbors
        let linesDrawn = 0;
        for (let j = i + 1; j < transformedPoints.length; j++) {
          const p2 = transformedPoints[j];
          const dist = Math.hypot(p1.sx - p2.sx, p1.sy - p2.sy);

          if (dist < 75 && linesDrawn < 3) {
            const alpha = Math.min(0.18, (1 - p1.z / 180) * (1 - p2.z / 180) * 0.25);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.stroke();
            linesDrawn++;
          }
        }
      }

      // Render 3D nodes & holographic descriptors
      transformedPoints.forEach((p) => {
        // Depth-based size scaling
        const radius = Math.max(1.8, (2.6 + p.scale * 3.5) * (1 - p.z / 260));
        const alpha = Math.max(0.2, Math.min(1.0, 1 - p.z / 240));

        // Radial lighting reflection effect
        const grad = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, p.orig.color || '#818cf8');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core solid glowing point
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Renderfloating text on certain nodes
        if (p.orig.label && p.z < 60) {
          ctx.fillStyle = `rgba(241, 245, 249, ${Math.min(1, alpha * 1.5)})`;
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Subtle sector metadata backing
          const textWidth = ctx.measureText(p.orig.label).width;
          ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
          ctx.fillRect(p.sx - textWidth / 2 - 3, p.sy - 15, textWidth + 6, 11);
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
          ctx.strokeRect(p.sx - textWidth / 2 - 3, p.sy - 15, textWidth + 6, 11);

          ctx.fillStyle = '#6366f1';
          ctx.fillText(p.orig.label, p.sx, p.sy - 10);
        }
      });

      // Draw horizontal reference alignment cursor coordinates
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(canvas.width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, canvas.height);
      ctx.stroke();

      // Floating telemetry label top corner
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '8px monospace';
      ctx.fillText(`3D CORE SEC GRID FPS: 60`, 12, 18);
      ctx.fillText(`ALPHA ROT_X: ${rotX.toFixed(3)} Y: ${rotY.toFixed(3)}`, 12, 28);

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    // Mouse interactive handlers for dragging
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      setInteractionInfo('Actively rotating market sphere...');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      rotationRef.current.y += dx * 0.005;
      rotationRef.current.x += dy * 0.005;

      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setInteractionInfo('Interact with the 3D model to audit sectors');
    };

    // Attach listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full" id="mkt-3d-sphere-viewport">
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
          <div className="leading-tight">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">3D Sector Topology Node</h4>
            <p className="text-[10px] text-slate-500 font-sans">Interactive multi-dimensional visualization of Nifty sectoral clusters</p>
          </div>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-900/30 text-emerald-400 font-mono flex items-center gap-1">
          <span className="h-1 text-[11px] w-1 rounded-full bg-emerald-400 inline-block animate-ping"></span>
          REAL-TIME ENGINE
        </span>
      </div>

      <div ref={containerRef} className="flex-1 relative min-h-[290px] cursor-grab active:cursor-grabbing bg-slate-950">
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
        
        {/* Helper Instructions UI */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between pointer-events-none">
          <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
            <Move className="h-3 w-3 text-sky-400 animate-bounce" />
            {interactionInfo}
          </span>
          <span className="text-[9px] text-slate-500 font-sans">WebGL Canvas emulation</span>
        </div>
      </div>
    </div>
  );
}
