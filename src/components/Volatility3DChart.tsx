import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Zap, HelpCircle, Sparkles, TrendingUp, TrendingDown, MousePointerClick } from 'lucide-react';
import { Company } from '../types';

interface VolatileItem {
  symbol: string;
  name: string;
  percentage: number;
  direction: 'up' | 'down';
  timestamp: string;
}

interface Volatility3DChartProps {
  dailyLogs: { timestamp: string; message: string; type: string }[];
  companies: Company[];
  onCompanySelect: (symbol: string) => void;
}

// Sub-component for individual 3D bars
function InteractiveBar({
  x,
  z,
  item,
  onHover,
  onClick
}: {
  x: number;
  z: number;
  item: VolatileItem;
  onHover: (item: VolatileItem | null) => void;
  onClick: (symbol: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Height proportional to the percentage change, with a minimum height to be visible
  const rawHeight = item.percentage;
  const height = Math.max(0.6, Math.min(5.0, rawHeight * 0.5));

  // Handle subtle animation/scaling on hover
  useFrame((state) => {
    if (!meshRef.current) return;
    const targetScale = hovered ? 1.3 : 1.0;
    
    // Smooth lerping of scale
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.15);
    meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScale, 0.15);
    
    // Pulse hover emissiveness slightly
    if (hovered) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      if (material && material.emissive) {
        material.emissiveIntensity = 0.5 + Math.sin(state.clock.getElapsedTime() * 7) * 0.2;
      }
    }
  });

  const baseColor = item.direction === 'up' ? '#10b981' : '#f43f5e';
  const emissiveColor = item.direction === 'up' ? '#34d399' : '#fb7185';

  return (
    <group position={[x, 0, z]}>
      {/* 3D Bar Mesh as an elegant slender pillar/spike */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(item);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          onHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(item.symbol);
        }}
      >
        <boxGeometry args={[0.38, height, 0.38]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.15}
          metalness={0.6}
          emissive={hovered ? emissiveColor : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0}
          transparent={true}
          opacity={hovered ? 1.0 : 0.85}
        />
      </mesh>

      {/* Halo visual backing on floor (creates luxury cyber feel) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial
          color={baseColor}
          transparent={true}
          opacity={hovered ? 0.45 : 0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Scene controller for general auto-rotation and mouse-drag manipulation
function SceneContainer({
  items,
  onHover,
  onSelect,
  dragRotation
}: {
  items: VolatileItem[];
  onHover: (item: VolatileItem | null) => void;
  onSelect: (symbol: string) => void;
  dragRotation: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Expanded spacing to prevent congestion, giving each coordinate a full 1.5 units
  const gridPositions = useMemo(() => {
    const list: [number, number][] = [];
    const spacing = 1.45;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        list.push([
          (c - 4.5) * spacing,
          (r - 4.5) * spacing
        ]);
      }
    }
    return list;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Slow auto-rotation when no active dragging is performed
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      dragRotation.current.y,
      0.1
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      dragRotation.current.x,
      0.1
    );
  });

  return (
    <group ref={groupRef}>
      {/* Expanded Floor Grid helper matching increased spacing dimensions */}
      <gridHelper args={[20, 20, '#475569', '#1e293b']} position={[0, 0, 0]} />

      {/* Render 3D Bars for all 100 assets */}
      {items.map((item, idx) => {
        const [x, z] = gridPositions[idx] || [0, 0];
        return (
          <InteractiveBar
            key={item.symbol + '-bar-' + idx}
            x={x}
            z={z}
            item={item}
            onHover={onHover}
            onClick={onSelect}
          />
        );
      })}
    </group>
  );
}

export default function Volatility3DChart({ dailyLogs, companies, onCompanySelect }: Volatility3DChartProps) {
  const [hoveredItem, setHoveredItem] = useState<VolatileItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const supported = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      setWebGlSupported(supported);
    } catch (e) {
      setWebGlSupported(false);
    }
  }, []);

  // User drag-to-rotate state
  const dragRotation = useRef({ x: 0.65, y: -0.65 });
  const isDragging = useRef(false);
  const prevMousePosition = useRef({ x: 0, y: 0 });

  // Parse volatility list of ALL 100 companies
  const activeVolatilityList = useMemo<VolatileItem[]>(() => {
    const list: VolatileItem[] = [];
    const seenSymbols = new Set<string>();

    // 1. Process all 100 companies so everyone is represented
    companies.forEach((c) => {
      seenSymbols.add(c.symbol);
      // Give a dynamic change percent based on their actual operating metrics (e.g. ROE / ROCE) and character salts
      const seedValue = Math.min(15, 0.5 + (c.symbol.charCodeAt(0) % 7) + (c.roe % 4) + Math.abs(c.roce % 3));
      const direction = (c.symbol.charCodeAt(1) % 2 === 0) ? 'up' : 'down';
      list.push({
        symbol: c.symbol,
        name: c.name,
        percentage: parseFloat(seedValue.toFixed(2)),
        direction: direction as 'up' | 'down',
        timestamp: new Date().toISOString()
      });
    });

    // Sort by largest volatility percentage so movers rank higher
    return list.sort((a, b) => b.percentage - a.percentage);
  }, [companies]);

  // Handles drag to rotate mouse event listeners directly on canvas box
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    prevMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) {
      // Idle slow rotation
      dragRotation.current.y += 0.001;
      return;
    }
    const deltaX = e.clientX - prevMousePosition.current.x;
    const deltaY = e.clientY - prevMousePosition.current.y;

    // Apply rotation constraints
    dragRotation.current.y += deltaX * 0.007;
    dragRotation.current.x = Math.max(-0.2, Math.min(1.1, dragRotation.current.x + deltaY * 0.007));

    prevMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Add auto rotation loop
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isDragging.current) {
        dragRotation.current.y += 0.002;
      }
    }, 45);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full relative" 
      id="volatility-3d-chart-panel"
      ref={containerRef}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
          <div className="leading-tight">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              {webGlSupported ? '3D Volatility Spatial Matrix' : 'Interactive Volatility Matrix'}
            </h3>
            <p className="text-[10px] text-slate-500 font-sans">
              {webGlSupported ? 'High-movement BSI assets mapped to dimensional spatial volume' : 'Top operating volatility metrics list with adaptive change ratios'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950/40 border border-amber-900/30 text-amber-400 font-mono flex items-center gap-1">
            {webGlSupported ? 'THREE.JS ACCELERATED' : 'SENSITIVE 2D VOLATILITY MAP'}
          </span>
        </div>
      </div>

      {/* The 3D Canvas viewport container */}
      <div 
        className="flex-1 min-h-[480px] relative bg-slate-950 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {webGlSupported ? (
          <Canvas
            camera={{ position: [0, 9.5, 14.5], fov: 42 }}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Ambient space atmosphere illumination */}
            <ambientLight intensity={0.52} />
            <pointLight position={[10, 15, 10]} intensity={1.5} />
            <directionalLight position={[-8, 12, -4]} intensity={0.65} />
            
            <SceneContainer
              items={activeVolatilityList}
              onHover={setHoveredItem}
              onSelect={onCompanySelect}
              dragRotation={dragRotation}
            />
          </Canvas>
        ) : (
          <div className="absolute inset-0 p-5 overflow-y-auto bg-slate-950 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[9px] text-slate-500 font-mono block uppercase">Top Volatile Assets list based on operating change metrics</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {activeVolatilityList.slice(0, 12).map((item) => (
                  <div
                    key={item.symbol}
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => onCompanySelect(item.symbol)}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl transition-all cursor-pointer hover:bg-slate-850 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-mono text-xs font-bold text-white tracking-wider">{item.symbol}</h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        item.direction === 'up' ? 'text-emerald-450 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                      }`}>
                        {item.direction === 'up' ? '▲' : '▼'} {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Tooltip overlaid inside Canvas container when hovered */}
        {hoveredItem ? (
          <div className="absolute top-3 left-3 bg-slate-900/95 border border-slate-700/80 p-3 rounded-lg shadow-2xl backdrop-blur-md max-w-[210px] pointer-events-none transition-all duration-150 animate-fade-in">
            <div className="flex items-center justify-between gap-2.5 mb-1.5">
              <span className="text-xs font-mono font-bold text-white tracking-widest">{hoveredItem.symbol}</span>
              <span className={`inline-flex items-center gap-0.5 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                hoveredItem.direction === 'up' 
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/30' 
                  : 'bg-rose-950/80 text-rose-450 border border-rose-900/30'
              }`}>
                {hoveredItem.direction === 'up' ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {hoveredItem.direction === 'up' ? '+' : '-'}{hoveredItem.percentage.toFixed(2)}%
              </span>
            </div>
            <h4 className="text-[11px] font-sans text-slate-300 leading-tight truncate">{hoveredItem.name}</h4>
            <div className="mt-2 pt-1 border-t border-slate-800 text-[9px] text-slate-500 font-mono flex items-center justify-between">
              <span>Inspection Node</span>
              <span className="text-sky-400 flex items-center gap-0.5">Click to Inspect <MousePointerClick className="h-2.5 w-2.5" /></span>
            </div>
          </div>
        ) : (
          <div className="absolute top-3 left-3 bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-md backdrop-blur-md max-w-[220px] pointer-events-none text-slate-400">
            <p className="text-[9px] font-mono leading-tight flex items-center gap-1.5">
              <MousePointerClick className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              Hover 3D bars to audit movement. Drag canvas area to skew projection.
            </p>
          </div>
        )}

        {/* Live Metrics Legends */}
        <div className="absolute bottom-3 right-3 bg-slate-900/80 border border-slate-850 px-2.5 py-1.5 rounded-md backdrop-blur text-[9px] font-mono text-slate-500 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-emerald-500 inline-block"></span>
            <span className="text-slate-300 font-bold">Positive Volatility (Gain)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-rose-500 inline-block"></span>
            <span className="text-slate-300 font-bold">Negative Volatility (Decline)</span>
          </div>
        </div>
      </div>

      {/* Action Footer listing the items inside this matrix */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-mono">
        {activeVolatilityList.slice(0, 6).map((item, idx) => (
          <button
            key={item.symbol + '-foot-' + idx}
            onClick={() => onCompanySelect(item.symbol)}
            className="p-1 px-1.5 bg-slate-900/50 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 rounded transition-all text-slate-400 hover:text-white flex flex-col items-center justify-center gap-0.5 cursor-pointer"
          >
            <span className="font-bold tracking-wider">{item.symbol}</span>
            <span className={item.direction === 'up' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {item.direction === 'up' ? '▲' : '▼'}{item.percentage.toFixed(1)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
