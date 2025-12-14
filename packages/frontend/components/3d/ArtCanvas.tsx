"use client"

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Text3D, useTexture } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'

function ArtPiece({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useTexture(imageUrl)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 0.1]} />
        <meshStandardMaterial map={texture} metalness={0.2} roughness={0.8} />
      </mesh>
    </Float>
  )
}

export default function ArtCanvas({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <spotLight
          position={[-10, 10, -10]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
        />
        
        <Suspense fallback={null}>
          <ArtPiece imageUrl={imageUrl} />
          <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.5} />
        </Suspense>
        
        <gridHelper args={[10, 10]} />
      </Canvas>
    </div>
  )
}