import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Company } from '../types';
import { Layers, Sparkles, ChevronRight, TrendingUp, Cpu, Landmark, HelpCircle, Activity } from 'lucide-react';

interface CompanyLandscape3DProps {
  companies: Company[];
  onCompanySelect: (symbol: string) => void;
}

// Interactive terrain mesh component
function TerrainMesh({
  companies,
  selectedSector,
  onHoverVertex,
  onClickVertex,
  hoveredIndex
}: {
  companies: Company[];
  selectedSector: string;
  onHoverVertex: (company: Company | null, index: number) => void;
  onClickVertex: (symbol: string) => void;
  hoveredIndex: number | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate target heights for each company (mapped to a 10x10 vertex grid)
  const targetHeights = useMemo(() => {
    return companies.map(c => {
      const isSelectedSector = selectedSector === 'All' || c.sector === selectedSector;
      if (!isSelectedSector) {
        return 0.05; // flattened baseline
      }
      // Scale height proportional to ROE and Book Value to represent "Market Weight"
      const weight = (c.roe * 0.06) + (c.roce * 0.03);
      return Math.max(0.2, Math.min(4.8, weight));
    });
  }, [companies, selectedSector]);

  // Maintain current heights array for smooth interpolation
  const currentHeights = useRef<number[]>(new Array(100).fill(0.1));

  useFrame((state) => {
    if (!meshRef.current) return;
    const geom = meshRef.current.geometry as THREE.PlaneGeometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;

    // Smoother interpolation over vertices
    for (let i = 0; i < 100; i++) {
      const target = targetHeights[i] || 0.1;
      currentHeights.current[i] = THREE.MathUtils.lerp(currentHeights.current[i], target, 0.1);
      
      // Update Y coordinate of the vertex. For a PlaneGeometry(width, height, 9, 9),
      // there are exactly 10x10 = 100 vertices.
      // position details: vertex coordinate layout is [X1, Y1, Z1, X2, Y2, Z2...]
      // In Three.js plane geometry layed horizontally, the Z coordinate represents vertical height
      // if we lay it flat, or Y if we rotate the mesh on its X-axis. 
      // Let's set the height on the Z coordinate since the plane is rotated flat.
      posAttr.setZ(i, currentHeights.current[i]);
    }
    
    posAttr.needsUpdate = true;
    geom.computeVertexNormals();
  });

  // Flat horizontal grid plane: rotation X to -PI/2
  return (
    <group>
      {/* Dynamic terrain mesh */}
      <mesh 
        ref={meshRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
      >
        <planeGeometry args={[11, 11, 9, 9]} />
        <meshStandardMaterial
          color="#312e81"
          roughness={0.15}
          metalness={0.8}
          wireframe={false}
          flatShading={true}
          transparent={true}
          opacity={0.88}
        />
      </mesh>

      {/* Decorative wireframe overlay to accentuate peaks */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.49, 0]}
      >
        <planeGeometry args={[11, 11, 9, 9]} />
        <meshBasicMaterial
          color="#10b981"
          wireframe={true}
          transparent={true}
          opacity={0.35}
        />
      </mesh>

      {/* Floating Interactive Anchors/Pins for peaks */}
      {companies.map((c, idx) => {
        // Compute x and z coordinate based on 10x10 mapping:
        // centered around origin [-5 to 5]
        const col = idx % 10;
        const row = Math.floor(idx / 10);
        const xCoord = (col - 4.5) * 1.1;
        const zCoord = (row - 4.5) * 1.1;
        const height = currentHeights.current[idx] || 0.1;
        const isHovered = hoveredIndex === idx;
        const isActiveSector = selectedSector === 'All' || c.sector === selectedSector;

        if (height < 0.3 || !isActiveSector) return null;

        return (
          <group key={c.symbol + '-marker'} position={[xCoord, height - 0.5, zCoord]}>
            {/* Pulsing visual core */}
            <mesh 
              onPointerOver={(e) => {
                e.stopPropagation();
                onHoverVertex(c, idx);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                onHoverVertex(null, -1);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onClickVertex(c.symbol);
              }}
            >
              <sphereGeometry args={[isHovered ? 0.16 : 0.09, 8, 8]} />
              <meshBasicMaterial 
                color={isHovered ? "#67e8f9" : c.sector === 'IT' ? "#38bdf8" : c.sector === 'Banking' ? "#f43f5e" : "#10b981"} 
              />
            </mesh>
            
            {/* Glow line pointer down to plane floor */}
            <mesh position={[0, -height / 2, 0]}>
              <cylinderGeometry args={[0.015, 0.015, height, 4]} />
              <meshBasicMaterial 
                color={isHovered ? "#22d3ee" : "#312e81"} 
                transparent={true} 
                opacity={0.4} 
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function CompanyLandscape3D({ companies, onCompanySelect }: CompanyLandscape3DProps) {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [hoveredCompany, setHoveredCompany] = useState<Company | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Extract unique sectors
  const sectors = useMemo(() => {
    return ['All', ...Array.from(new Set(companies.map(c => c.sector)))];
  }, [companies]);

  const handleHoverVertex = (company: Company | null, idx: number) => {
    setHoveredCompany(company);
    setHoveredIndex(idx !== -1 ? idx : null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[580px] relative" id="company-landscape-3d-panel">
      {/* Header bar controls */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 font-mono tracking-wider">
            <Layers className="h-3 w-3" />
            3D SPATIAL TERRAIN VISUALIZER
          </span>
          <h3 className="text-sm font-display font-semibold text-white tracking-wide flex items-center gap-1.5 mt-1">
            BSI 100 Market Capitalization Mesh
          </h3>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
            10x10 continuous vertex map. Peaks denote capital weight. Choose a sector below to trigger physical transition animations.
          </p>
        </div>

        {/* Sector toggles */}
        <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {sectors.map(sec => (
            <button
              key={sec}
              onClick={() => {
                setSelectedSector(sec);
                setHoveredCompany(null);
                setHoveredIndex(null);
              }}
              className={`px-2.5 py-1 text-[10px] font-mono font-medium rounded transition-all cursor-pointer ${
                selectedSector === sec
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-450 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sec.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Canvas layout */}
      <div className="flex-1 relative bg-slate-950">
        <Canvas
          camera={{ position: [0, 6.2, 8.5], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Ambient space atmosphere illumination */}
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 15, 10]} intensity={1.5} />
          <directionalLight position={[-8, 12, -4]} intensity={0.7} />
          <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={2} color="#10b981" />
          
          <TerrainMesh
            companies={companies}
            selectedSector={selectedSector}
            onHoverVertex={handleHoverVertex}
            onClickVertex={onCompanySelect}
            hoveredIndex={hoveredIndex}
          />

          <OrbitControls 
            enableZoom={true} 
            maxPolarAngle={Math.PI / 2.1} 
            minDistance={4} 
            maxDistance={15} 
          />
        </Canvas>

        {/* Floating Context Panel HUD overlay */}
        {hoveredCompany ? (
          <div className="absolute top-4 left-4 bg-slate-900/95 border border-slate-700/80 p-4 rounded-xl shadow-2xl backdrop-blur-md max-w-[280px] pointer-events-none transition-all duration-150 animate-fade-in space-y-3">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
              <div>
                <span className="text-xs font-mono font-black text-white tracking-widest block">{hoveredCompany.symbol}</span>
                <span className="text-[9px] text-slate-500 font-mono tracking-wider">{hoveredCompany.sector} &bull; {hoveredCompany.subSector}</span>
              </div>
              <span className="text-[10px] bg-slate-950 font-mono text-emerald-400 px-2 py-0.5 rounded border border-emerald-950 font-bold">
                ROE {hoveredCompany.roe}%
              </span>
            </div>
            
            <p className="text-[10.5px] font-sans text-slate-300 leading-normal line-clamp-2">
              {hoveredCompany.about}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
              <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                <span className="text-slate-500 block text-[9px] uppercase">ROCE Target</span>
                <span className="text-sky-400 font-semibold">{hoveredCompany.roce}%</span>
              </div>
              <div className="bg-slate-950/60 p-1.5 rounded border border-slate-850">
                <span className="text-slate-500 block text-[9px] uppercase">Book Value</span>
                <span className="text-indigo-400 font-semibold">₹{hoveredCompany.bookValue}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-400 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1"><Activity className="h-3 w-3 text-emerald-400 animate-pulse" /> Live Terrain Vertex</span>
              <span className="text-sky-400">Click Vertex to Audit</span>
            </div>
          </div>
        ) : (
          <div className="absolute top-4 left-4 bg-slate-900/60 border border-slate-800/80 px-3 py-2 rounded-lg backdrop-blur-md max-w-[260px] pointer-events-none text-slate-400">
            <p className="text-[10px] font-sans leading-relaxed">
              <Sparkles className="h-4 w-4 text-emerald-400 inline mr-1.5 animate-pulse" />
              <strong>Dynamic 3D Terrain</strong> represents the capitalization density. Drag the landscape to rotate, use pitch zoom, and hover individual peak spheres to audit metrics!
            </p>
          </div>
        )}

        {/* Legend color nodes overlay */}
        <div className="absolute bottom-4 right-4 bg-slate-900/85 border border-slate-850 px-3 py-2 rounded-xl backdrop-blur-md text-[9px] font-mono text-slate-400 flex flex-col gap-1.5 pointer-events-none">
          <span className="text-[8px] font-bold tracking-widest text-slate-500 uppercase pb-0.5">Asset Sectors</span>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400 inline-block"></span>
            <span className="text-slate-300">IT (Information Tech)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 inline-block"></span>
            <span className="text-slate-300">Banking & Finance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-300">Energy & Power</span>
          </div>
        </div>
      </div>
    </div>
  );
}
