/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
'use client';

// Particle Sphere — Originkit
// Originkit — defaults rewritten to match preview.
import React, { useEffect, useRef } from "react"
const RenderTarget = {
    current: () => "preview",
    canvas: "canvas",
    export: "export",
    thumbnail: "thumbnail",
    preview: "preview",
}
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Color,
    Points,
    BufferGeometry,
    Float32BufferAttribute,
    PointsMaterial,
    SphereGeometry,
    MeshBasicMaterial,
    InstancedMesh,
    Matrix4,
    Group,
    Vector3,
    AdditiveBlending,
} from "three"

export interface ParticleSphereRefactorProps {
    particlesCount?: number
    particleScale?: number
    speed?: number
    smoothing?: number
    scale?: number
    stopOnHover?: boolean
    rotationDirection?: "clockwise" | "anticlockwise"
    dragSpeed?: number
    drag?: boolean
    cursorOn?: boolean
    cursorRadiusUI?: number
    cursorStrengthUI?: number
    clickForce?: number
    sphereColor?: string
    style?: React.CSSProperties
}

// CSS variable token and color parsing (hex/rgba/var())
const cssVariableRegex =
    /var\s*\(\s*(--[\w-]+)(?:\s*,\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*))?\s*\)/

function extractDefaultValue(cssVar: string): string {
    if (!cssVar || !cssVar.startsWith("var(")) return cssVar
    const match = cssVariableRegex.exec(cssVar)
    if (!match) return cssVar
    const fallback = (match[2] || "").trim()
    if (fallback.startsWith("var(")) return extractDefaultValue(fallback)
    return fallback || cssVar
}

function resolveTokenColor(input: any): any {
    if (typeof input !== "string") return input
    if (!input.startsWith("var(")) return input
    return extractDefaultValue(input)
}

// Parse color string to RGBA values (0-1 range)
function parseColorToRgba(input: string | undefined): {
    r: number
    g: number
    b: number
    a: number
} {
    if (!input || input.trim() === "") return { r: 0, g: 0, b: 0, a: 0 }
    const str = input.trim()

    // Handle rgba() format
    const rgbaMatch = str.match(
        /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i
    )
    if (rgbaMatch) {
        const r = Math.max(0, Math.min(255, parseFloat(rgbaMatch[1]))) / 255
        const g = Math.max(0, Math.min(255, parseFloat(rgbaMatch[2]))) / 255
        const b = Math.max(0, Math.min(255, parseFloat(rgbaMatch[3]))) / 255
        const a =
            rgbaMatch[4] !== undefined
                ? Math.max(0, Math.min(1, parseFloat(rgbaMatch[4])))
                : 1
        return { r, g, b, a }
    }

    // Handle hex formats
    const hex = str.replace(/^#/, "")
    if (hex.length === 8) {
        return {
            r: parseInt(hex.slice(0, 2), 16) / 255,
            g: parseInt(hex.slice(2, 4), 16) / 255,
            b: parseInt(hex.slice(4, 6), 16) / 255,
            a: parseInt(hex.slice(6, 8), 16) / 255,
        }
    }
    if (hex.length === 6) {
        return {
            r: parseInt(hex.slice(0, 2), 16) / 255,
            g: parseInt(hex.slice(2, 4), 16) / 255,
            b: parseInt(hex.slice(4, 6), 16) / 255,
            a: 1,
        }
    }
    if (hex.length === 4) {
        return {
            r: parseInt(hex[0] + hex[0], 16) / 255,
            g: parseInt(hex[1] + hex[1], 16) / 255,
            b: parseInt(hex[2] + hex[2], 16) / 255,
            a: parseInt(hex[3] + hex[3], 16) / 255,
        }
    }
    if (hex.length === 3) {
        return {
            r: parseInt(hex[0] + hex[0], 16) / 255,
            g: parseInt(hex[1] + hex[1], 16) / 255,
            b: parseInt(hex[2] + hex[2], 16) / 255,
            a: 1,
        }
    }
    return { r: 0, g: 0, b: 0, a: 1 }
}

// Value mapping functions
function mapLinear(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    if (inMax === inMin) return outMin
    const t = (value - inMin) / (inMax - inMin)
    return outMin + t * (outMax - outMin)
}

// Speed: UI [0.1..1] → internal [0.01..0.05] (rotation speed multiplier)
function mapSpeedUiToInternal(ui: number): number {
    return mapLinear(ui, 0.1, 1.0, 0.01, 0.05)
}

// Scale: UI [0..1] → scale multiplier [0.5..3.0] (overall sphere size multiplier)
function mapScaleUiToMultiplier(ui: number): number {
    const clamped = Math.max(0, Math.min(1, ui))
    return mapLinear(clamped, 0, 1.0, 0.25, 1.25)
}

// Particle Size: UI [0.1..1] → size [0.01..0.1] (individual particle size)
function mapParticleSizeUiToInternal(ui: number): number {
    const clamped = Math.max(0.1, Math.min(1, ui))
    return mapLinear(clamped, 0.1, 1.0, 0.01, 0.1)
}

// Cursor Strength: UI [0..1] → force multiplier [0..15]
function mapCursorStrengthUiToMultiplier(ui: number): number {
    const clamped = Math.max(0, Math.min(1, ui))
    return mapLinear(clamped, 0, 1.0, 0, 15)
}

// Cursor interaction constants
const CURSOR_PHYSICS = {
    RETURN_FORCE: 0.015,
    FRICTION: 0.94,
} as const

// Property Controls Defaults
const COMPONENT_DEFAULTS = {
    particlesCount: 10000,
    particleScale: 4,
    rotationDirection: "clockwise" as const,
    speed: 20,
    scale: 10,
    drag: true,
    smoothing: 7,
    dragSpeed: 5,
    stopOnHover: false,
    cursorOn: true,
    cursorRadiusUI: 75,
    cursorStrengthUI: 10,
    clickForce: 5,
    sphereColor: "#ffffff",
}

export default function ParticleSphereRefactor(__props: ParticleSphereRefactorProps) {
    const {
        particlesCount = 6400,
        speed = 14,
        smoothing = 7,
        scale = 10,
        stopOnHover = false,
        rotationDirection = "clockwise",
        dragSpeed = 5,
        drag = true,
        particleScale = 8,
        cursorOn = true,
        cursorRadiusUI = 75,
        cursorStrengthUI = 10,
        clickForce = 5,
        sphereColor = "#103465",
        style,
    } = { ...COMPONENT_DEFAULTS, ...__props }
    
    const particlesConfig = { shape: "sphere", scale: particleScale }
    const cursorConfig = {
        enabled: cursorOn,
        radius: cursorRadiusUI,
        strength: cursorStrengthUI,
        clickForce,
    }

    const speedN = speed / 10
    const smoothingN = smoothing / 10
    const scaleN = scale / 10
    const dragN = dragSpeed / 10
    const sizeN = particlesConfig.scale / 10
    const strengthN = cursorConfig.strength / 10
    const containerRef = useRef<HTMLDivElement>(null)
    const zoomProbeRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<any>(null)
    const cameraRef = useRef<any>(null)
    const rendererRef = useRef<any>(null)
    const particlesRef = useRef<any>(null)
    const particlesGroupRef = useRef<any>(null)
    const animationFrameRef = useRef<number | null>(null)
    const animateFnRef = useRef<(() => void) | null>(null)
    const startAnimationRef = useRef<(() => void) | null>(null)
    const lastResizeRef = useRef({ ts: 0, zoom: 0, w: 0, h: 0, aspect: 0 })
    const mouseRef = useRef<{ x: number; y: number } | null>(null)
    const baseParticlePositionsRef = useRef<any[]>([])
    const particleDisplacementsRef = useRef<any[]>([])
    const particleScatterVelocitiesRef = useRef<any[]>([])

    const isCanvasRef = useRef<boolean | null>(null)
    if (isCanvasRef.current === null) {
        isCanvasRef.current = RenderTarget.current() === RenderTarget.canvas
    }
    const isCanvas = isCanvasRef.current

    const rotationSpeed = React.useMemo(() => {
        const baseSpeed = mapSpeedUiToInternal(speedN)
        return rotationDirection === "anticlockwise" ? -baseSpeed : baseSpeed
    }, [speedN, rotationDirection])

    const scaleMultiplier = React.useMemo(
        () => mapScaleUiToMultiplier(scaleN),
        [scaleN]
    )

    const particleSize = React.useMemo(
        () => mapParticleSizeUiToInternal(sizeN),
        [sizeN]
    )

    const cursorRadius = React.useMemo(
        () => Math.max(0, Math.min(600, cursorConfig.radius)),
        [cursorConfig.radius]
    )

    const cursorStrength = React.useMemo(
        () => mapCursorStrengthUiToMultiplier(strengthN),
        [strengthN]
    )

    useEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        const containerWidth =
            container.clientWidth || container.offsetWidth || 400
        const containerHeight =
            container.clientHeight || container.offsetHeight || 400

        const canvasOverflowMultiplier = 2.5
        const canvasWidth = containerWidth * canvasOverflowMultiplier
        const canvasHeight = containerHeight * canvasOverflowMultiplier

        const scene = new Scene()
        sceneRef.current = scene

        const baseFOV = 50
        const adjustedFOV =
            2 *
            Math.atan(
                Math.tan((baseFOV * Math.PI) / 180 / 2) *
                    canvasOverflowMultiplier
            ) *
            (180 / Math.PI)

        const camera = new PerspectiveCamera(
            adjustedFOV,
            canvasWidth / canvasHeight,
            0.1,
            1000
        )
        const baseCameraDistance = 3.0
        const currentSphereRadius = 1.0 * scaleMultiplier
        const cameraDistance = Math.max(
            baseCameraDistance,
            currentSphereRadius + 1.0
        )
        camera.position.z = cameraDistance
        cameraRef.current = camera

        const renderer = new WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(canvasWidth, canvasHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.outputColorSpace = "srgb"
        const canvas = renderer.domElement
        canvas.style.position = "absolute"
        const offsetX = (canvasWidth - containerWidth) / 2
        const offsetY = (canvasHeight - containerHeight) / 2
        canvas.style.left = `-${offsetX}px`
        canvas.style.top = `-${offsetY}px`
        canvas.style.width = `${canvasWidth}px`
        canvas.style.height = `${canvasHeight}px`
        canvas.style.display = "block"
        container.appendChild(canvas)
        rendererRef.current = renderer

        const vertices = []
        const goldenAngle = Math.PI * (3 - Math.sqrt(5))
        const baseSphereRadius = 1.0
        const sphereRadius = baseSphereRadius * scaleMultiplier

        baseParticlePositionsRef.current = []
        particleDisplacementsRef.current = []
        particleScatterVelocitiesRef.current = []

        const resolvedSphereColor = resolveTokenColor(sphereColor)
        const sphereRgba = parseColorToRgba(resolvedSphereColor || sphereColor)
        const baseColorObj = resolvedSphereColor
            ? new Color(resolvedSphereColor)
            : new Color(sphereRgba.r, sphereRgba.g, sphereRgba.b)
        const particleOpacity = sphereRgba.a

        for (let i = 0; i < particlesCount; i++) {
            const y = 1 - (i / (particlesCount - 1)) * 2
            const radius = Math.sqrt(1 - y * y)
            const theta = goldenAngle * i

            const x = Math.cos(theta) * radius
            const z = Math.sin(theta) * radius

            const posX = x * sphereRadius
            const posY = y * sphereRadius
            const posZ = z * sphereRadius
            vertices.push(posX, posY, posZ)

            baseParticlePositionsRef.current.push(new Vector3(posX, posY, posZ))
            particleDisplacementsRef.current.push(new Vector3(0, 0, 0))
            particleScatterVelocitiesRef.current.push(new Vector3(0, 0, 0))
        }

        const particleShape = particlesConfig.shape || "sphere"
        let particles: any

        if (particleShape === "sphere") {
            const sphereRadiusVal = particleSize * 0.15
            const sphereGeometry = new SphereGeometry(sphereRadiusVal, 8, 8)
            const sphereMaterial = new MeshBasicMaterial({
                color: 0xffffff,
                blending: AdditiveBlending,
                transparent: particleOpacity < 1,
                opacity: particleOpacity,
            })

            particles = new InstancedMesh(
                sphereGeometry,
                sphereMaterial,
                particlesCount
            )

            const matrix = new Matrix4()
            for (let i = 0; i < particlesCount; i++) {
                const idx = i * 3
                matrix.setPosition(
                    vertices[idx],
                    vertices[idx + 1],
                    vertices[idx + 2]
                )
                particles.setMatrixAt(i, matrix)
            }
            particles.instanceMatrix.needsUpdate = true

            const instanceColors = new Float32Array(particlesCount * 3)
            for (let i = 0; i < particlesCount; i++) {
                const idx = i * 3
                instanceColors[idx] = baseColorObj.r
                instanceColors[idx + 1] = baseColorObj.g
                instanceColors[idx + 2] = baseColorObj.b
            }
            particles.instanceColor = new Float32BufferAttribute(
                instanceColors,
                3
            )
            sphereMaterial.vertexColors = false
            particles.instanceColor.needsUpdate = true
        } else {
            const particlesGeometry = new BufferGeometry()
            particlesGeometry.setAttribute(
                "position",
                new Float32BufferAttribute(vertices, 3)
            )

            const colors = new Float32Array(particlesCount * 3)
            for (let i = 0; i < particlesCount; i++) {
                const idx = i * 3
                colors[idx] = baseColorObj.r
                colors[idx + 1] = baseColorObj.g
                colors[idx + 2] = baseColorObj.b
            }
            particlesGeometry.setAttribute(
                "color",
                new Float32BufferAttribute(colors, 3)
            )

            const particlesMaterial = new PointsMaterial({
                size: particleSize,
                color: 0xffffff,
                blending: AdditiveBlending,
                depthTest: false,
                transparent: particleOpacity < 1,
                opacity: particleOpacity,
                vertexColors: true,
            })

            particles = new Points(particlesGeometry, particlesMaterial)
        }

        particlesRef.current = particles

        const particlesGroup = new Group()
        particlesGroupRef.current = particlesGroup
        particlesGroup.add(particles)
        scene.add(particlesGroup)

        const rotation = { x: 0, y: 0 }
        const targetRotation = { x: 0, y: 0 }
        const velocity = { x: 0, y: 0 }
        let isDragging = false
        let isHovering = false
        let lastMouseX = 0
        let lastMouseY = 0
        let lastDragTime = 0
        let animationFrameId: number | null = null

        let lastFrameTime = performance.now()
        const targetDeltaTime = 1000 / 60

        const lerpFactor =
            smoothingN === 0 ? 1 : mapLinear(smoothingN, 0, 1, 0.4, 0.03)
        const velocityDecay = mapLinear(smoothingN, 0, 1, 0.7, 0.96)

        const animate = () => {
            animateCore()
        }

        const animateCore = () => {
            const now = performance.now()
            const deltaTime = now - lastFrameTime
            lastFrameTime = now
            const deltaFactor = deltaTime / targetDeltaTime

            let needsRender = false
            const threshold = 0.01

            const canAutoRotate = true
            if (
                !isDragging &&
                rotationSpeed !== 0 &&
                canAutoRotate &&
                (!stopOnHover || !isHovering)
            ) {
                targetRotation.x += rotationSpeed * 0.1 * deltaFactor
            }

            if (!isDragging && smoothingN > 0) {
                if (
                    Math.abs(velocity.x) > threshold ||
                    Math.abs(velocity.y) > threshold
                ) {
                    targetRotation.x += velocity.x * deltaFactor
                    targetRotation.y += velocity.y * deltaFactor
                    targetRotation.y = Math.max(
                        -Math.PI / 2,
                        Math.min(Math.PI / 2, targetRotation.y)
                    )
                    const decayFactor = Math.pow(velocityDecay, deltaFactor)
                    velocity.x *= decayFactor
                    velocity.y *= decayFactor
                } else {
                    velocity.x = 0
                    velocity.y = 0
                }
            }

            const dx = targetRotation.x - rotation.x
            const dy = targetRotation.y - rotation.y

            if (
                Math.abs(dx) > threshold ||
                Math.abs(dy) > threshold ||
                rotationSpeed !== 0 ||
                isDragging
            ) {
                const timeLerpFactor = 1 - Math.pow(1 - lerpFactor, deltaFactor)
                rotation.x += dx * timeLerpFactor
                rotation.y += dy * timeLerpFactor
                rotation.y = Math.max(
                    -Math.PI / 2,
                    Math.min(Math.PI / 2, rotation.y)
                )
                needsRender = true
            }

            particlesGroup.rotation.y = rotation.x
            particlesGroup.rotation.x = rotation.y
            particlesGroup.updateMatrixWorld(true)

            const currentContainerWidth =
                containerRef.current?.clientWidth || 400
            const currentContainerHeight =
                containerRef.current?.clientHeight || 400
            const currentCanvasWidth =
                currentContainerWidth * canvasOverflowMultiplier
            const currentCanvasHeight =
                currentContainerHeight * canvasOverflowMultiplier
            const currentCamera = cameraRef.current
            const cursorRadiusSquared = cursorRadius * cursorRadius

            if (
                cursorConfig.enabled &&
                baseParticlePositionsRef.current.length > 0
            ) {
                for (
                    let i = 0;
                    i < baseParticlePositionsRef.current.length;
                    i++
                ) {
                    const basePos = baseParticlePositionsRef.current[i]
                    const displacement = particleDisplacementsRef.current[i]

                    if (mouseRef.current) {
                        const mouse = mouseRef.current

                        const currentLocalPos = new Vector3()
                        currentLocalPos.copy(basePos)
                        currentLocalPos.add(displacement)

                        const worldPos = new Vector3()
                        worldPos.copy(currentLocalPos)
                        worldPos.applyMatrix4(particlesGroup.matrixWorld)

                        const projected = worldPos
                            .clone()
                            .project(currentCamera)
                        const screenX =
                            (projected.x * 0.5 + 0.5) * currentCanvasWidth
                        const screenY =
                            (-projected.y * 0.5 + 0.5) * currentCanvasHeight

                        const dx = mouse.x - screenX
                        const dy = mouse.y - screenY
                        const distanceSquared = dx * dx + dy * dy

                        if (
                            distanceSquared < cursorRadiusSquared &&
                            distanceSquared > 0 &&
                            worldPos.z > 0
                        ) {
                            const distance = Math.sqrt(distanceSquared)
                            const force =
                                (cursorRadius - distance) / cursorRadius
                            const angle = Math.atan2(dy, dx)

                            const cameraRight = new Vector3()
                            const cameraUp = new Vector3()
                            cameraRight
                                .setFromMatrixColumn(
                                    currentCamera.matrixWorld,
                                    0
                                )
                                .normalize()
                            cameraUp
                                .setFromMatrixColumn(
                                    currentCamera.matrixWorld,
                                    1
                                )
                                .normalize()

                            const repulsion2D =
                                force * cursorStrength * speedN * deltaFactor
                            const repulsionX =
                                -Math.cos(angle) * repulsion2D * 0.01
                            const repulsionY =
                                Math.sin(angle) * repulsion2D * 0.01

                            const worldRepulsion = new Vector3()
                            worldRepulsion.addScaledVector(
                                cameraRight,
                                repulsionX
                            )
                            worldRepulsion.addScaledVector(cameraUp, repulsionY)

                            const localRepulsion = new Vector3()
                            localRepulsion.copy(worldRepulsion)
                            const inverseGroupMatrix = new Matrix4()
                            inverseGroupMatrix
                                .copy(particlesGroup.matrixWorld)
                                .invert()
                            localRepulsion.applyMatrix4(inverseGroupMatrix)

                            displacement.add(localRepulsion)
                        }
                    }

                    const frictionFactor = Math.pow(
                        CURSOR_PHYSICS.FRICTION,
                        deltaFactor
                    )
                    const returnForce =
                        CURSOR_PHYSICS.RETURN_FORCE * speedN * deltaFactor
                    displacement.multiplyScalar(frictionFactor)
                    displacement.multiplyScalar(1 - returnForce)
                }
            }

            if (particleScatterVelocitiesRef.current.length > 0) {
                for (
                    let i = 0;
                    i < particleScatterVelocitiesRef.current.length;
                    i++
                ) {
                    const scatterVelocity =
                        particleScatterVelocitiesRef.current[i]
                    const displacement = particleDisplacementsRef.current[i]

                    displacement.addScaledVector(
                        scatterVelocity,
                        deltaFactor * 0.1
                    )

                    const scatterFriction = Math.pow(0.95, deltaFactor)
                    scatterVelocity.multiplyScalar(scatterFriction)

                    const scatterReturnForce =
                        CURSOR_PHYSICS.RETURN_FORCE * speedN * deltaFactor
                    scatterVelocity.multiplyScalar(1 - scatterReturnForce)
                }
            }

            const particleShape = particlesConfig.shape || "sphere"

            if (particleShape === "sphere" && particlesRef.current) {
                const matrix = new Matrix4()

                for (
                    let i = 0;
                    i < baseParticlePositionsRef.current.length;
                    i++
                ) {
                    const basePos = baseParticlePositionsRef.current[i]
                    const displacement = particleDisplacementsRef.current[i]
                    const finalPos = new Vector3()
                    finalPos.copy(basePos)
                    finalPos.add(displacement)
                    matrix.setPosition(finalPos.x, finalPos.y, finalPos.z)
                    particlesRef.current.setMatrixAt(i, matrix)
                }
                particlesRef.current.instanceMatrix.needsUpdate = true
            } else if (particleShape === "cube" && particlesRef.current) {
                const positions =
                    particlesRef.current.geometry.attributes.position

                for (
                    let i = 0;
                    i < baseParticlePositionsRef.current.length;
                    i++
                ) {
                    const basePos = baseParticlePositionsRef.current[i]
                    const displacement = particleDisplacementsRef.current[i]
                    const finalPos = new Vector3()
                    finalPos.copy(basePos)
                    finalPos.add(displacement)
                    positions.setXYZ(i, finalPos.x, finalPos.y, finalPos.z)
                }
                positions.needsUpdate = true
            }

            needsRender = true

            if (needsRender || rotationSpeed !== 0 || isDragging) {
                renderer.render(scene, camera)
            }

            const hasVelocity =
                Math.abs(velocity.x) > threshold ||
                Math.abs(velocity.y) > threshold
            const hasLerpDelta =
                Math.abs(dx) > threshold || Math.abs(dy) > threshold
            const hasCursorInteraction =
                cursorConfig.enabled &&
                particleDisplacementsRef.current.some(
                    (disp) =>
                        Math.abs(disp.x) > threshold ||
                        Math.abs(disp.y) > threshold ||
                        Math.abs(disp.z) > threshold
                )
            const canAutoRotateForContinue = true
            const needsContinue =
                isCanvas ||
                isDragging ||
                (rotationSpeed !== 0 && canAutoRotateForContinue) ||
                hasVelocity ||
                hasLerpDelta ||
                hasCursorInteraction

            if (needsContinue) {
                animationFrameId = requestAnimationFrame(animate)
                animationFrameRef.current = animationFrameId
            } else {
                animationFrameId = null
                animationFrameRef.current = null
            }
        }

        animateFnRef.current = animate

        const startAnimation = () => {
            if (animationFrameId === null) {
                lastFrameTime = performance.now()
                animationFrameId = requestAnimationFrame(animate)
                animationFrameRef.current = animationFrameId
            }
        }

        startAnimationRef.current = startAnimation
        startAnimation()

        const handleMouseDown = (event: MouseEvent) => {
            if (!drag) return
            isDragging = true
            velocity.x = 0
            velocity.y = 0
            lastMouseX = event.clientX
            lastMouseY = event.clientY
            lastDragTime = performance.now()
            startAnimation()

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const currentTime = performance.now()
                const timeSinceLastMove = currentTime - lastDragTime

                const sensitivity = mapLinear(dragN, 0, 1, 0.001, 0.02)
                const dx = moveEvent.clientX - lastMouseX
                const dy = moveEvent.clientY - lastMouseY

                targetRotation.x += dx * sensitivity
                targetRotation.y += dy * sensitivity
                targetRotation.y = Math.max(
                    -Math.PI / 2,
                    Math.min(Math.PI / 2, targetRotation.y)
                )

                if (timeSinceLastMove > 0) {
                    const timeNormalization =
                        targetDeltaTime / timeSinceLastMove
                    velocity.x = dx * sensitivity * 0.3 * timeNormalization
                    velocity.y = dy * sensitivity * 0.3 * timeNormalization
                }

                lastMouseX = moveEvent.clientX
                lastMouseY = moveEvent.clientY
                lastDragTime = currentTime
            }

            const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove)
                document.removeEventListener("mouseup", handleMouseUp)
                isDragging = false
            }

            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }

        if (drag) {
            canvas.addEventListener("mousedown", handleMouseDown)
        }

        const handleMouseMoveHover = (event: MouseEvent) => {
            if (!stopOnHover) return
            const containerRect = container.getBoundingClientRect()
            const mouseX = event.clientX - containerRect.left
            const mouseY = event.clientY - containerRect.top
            isHovering =
                mouseX >= 0 &&
                mouseX <= containerRect.width &&
                mouseY >= 0 &&
                mouseY <= containerRect.height
        }

        if (stopOnHover) {
            canvas.addEventListener("mousemove", handleMouseMoveHover)
        }

        const handleMouseMoveCursor = (event: MouseEvent) => {
            const containerRect = container.getBoundingClientRect()
            const mouseXInContainer = event.clientX - containerRect.left
            const mouseYInContainer = event.clientY - containerRect.top
            if (
                mouseXInContainer >= 0 &&
                mouseXInContainer <= containerRect.width &&
                mouseYInContainer >= 0 &&
                mouseYInContainer <= containerRect.height
            ) {
                mouseRef.current = {
                    x: mouseXInContainer + offsetX,
                    y: mouseYInContainer + offsetY,
                }
                startAnimation()
            } else {
                mouseRef.current = null
            }
        }

        const handleMouseLeaveCursor = () => {
            mouseRef.current = null
        }

        const handleTouchMove = (event: TouchEvent) => {
            event.preventDefault()
            const containerRect = container.getBoundingClientRect()
            const touch = event.touches[0]
            if (touch) {
                const touchXInContainer = touch.clientX - containerRect.left
                const touchYInContainer = touch.clientY - containerRect.top
                if (
                    touchXInContainer >= 0 &&
                    touchXInContainer <= containerRect.width &&
                    touchYInContainer >= 0 &&
                    touchYInContainer <= containerRect.height
                ) {
                    mouseRef.current = {
                        x: touchXInContainer + offsetX,
                        y: touchYInContainer + offsetY,
                    }
                    startAnimation()
                } else {
                    mouseRef.current = null
                }
            }
        }

        const handleTouchEnd = () => {
            mouseRef.current = null
        }

        const handleClick = (event: MouseEvent) => {
            if (!cursorConfig.enabled || !cursorConfig.clickForce) return
            particlesGroup.updateMatrixWorld(true)

            const containerRect = container.getBoundingClientRect()
            const clickX = event.clientX - containerRect.left + offsetX
            const clickY = event.clientY - containerRect.top + offsetY
            const cursorRadiusSquared = cursorRadius * cursorRadius
            const clickForceVal = cursorConfig.clickForce || 10

            const clickContainerWidth = containerRef.current?.clientWidth || 400
            const clickContainerHeight =
                containerRef.current?.clientHeight || 400
            const clickCanvasWidth =
                clickContainerWidth * canvasOverflowMultiplier
            const clickCanvasHeight =
                clickContainerHeight * canvasOverflowMultiplier
            const currentCamera = cameraRef.current

            const ndcX = (clickX / clickCanvasWidth) * 2 - 1
            const ndcY = 1 - (clickY / clickCanvasHeight) * 2

            const clickRay = new Vector3(ndcX, ndcY, 0.5)
            clickRay.unproject(currentCamera)

            const cameraWorldPos = new Vector3()
            cameraWorldPos.setFromMatrixPosition(currentCamera.matrixWorld)

            const clickDirection = new Vector3()
            clickDirection.subVectors(clickRay, cameraWorldPos).normalize()

            const sphereCenter = new Vector3(0, 0, 0)
            const cameraToCenter = new Vector3()
            cameraToCenter.subVectors(sphereCenter, cameraWorldPos)
            const sphereDistance = cameraToCenter.length()
            const clickWorldPos = new Vector3()
            clickWorldPos.copy(cameraWorldPos)
            clickWorldPos.addScaledVector(clickDirection, sphereDistance)

            for (let i = 0; i < baseParticlePositionsRef.current.length; i++) {
                const basePos = baseParticlePositionsRef.current[i]
                const displacement = particleDisplacementsRef.current[i]
                const scatterVelocity = particleScatterVelocitiesRef.current[i]

                const currentLocalPos = new Vector3()
                currentLocalPos.copy(basePos)
                currentLocalPos.add(displacement)

                const worldPos = new Vector3()
                worldPos.copy(currentLocalPos)
                worldPos.applyMatrix4(particlesGroup.matrixWorld)

                const projected = worldPos.clone().project(currentCamera)
                const screenX = (projected.x * 0.5 + 0.5) * clickCanvasWidth
                const screenY = (-projected.y * 0.5 + 0.5) * clickCanvasHeight

                const dx = clickX - screenX
                const dy = clickY - screenY
                const distanceSquared = dx * dx + dy * dy

                if (
                    distanceSquared < cursorRadiusSquared &&
                    distanceSquared > 0
                ) {
                    const screenDistance = Math.sqrt(distanceSquared)
                    const force =
                        ((cursorRadius - screenDistance) / cursorRadius) *
                        clickForceVal

                    const radialDirection = new Vector3()
                    radialDirection.subVectors(worldPos, clickWorldPos)
                    const radialDistance = radialDirection.length()

                    if (radialDistance > 0.001) {
                        radialDirection.normalize()
                        const scatterMagnitude = force * 0.5
                        const worldScatter = new Vector3()
                        worldScatter.copy(radialDirection)
                        worldScatter.multiplyScalar(scatterMagnitude)

                        const localScatter = new Vector3()
                        localScatter.copy(worldScatter)
                        const inverseGroupMatrix = new Matrix4()
                        inverseGroupMatrix
                            .copy(particlesGroup.matrixWorld)
                            .invert()
                        localScatter.applyMatrix4(inverseGroupMatrix)

                        scatterVelocity.add(localScatter)
                    }
                }
            }

            startAnimation()
        }

        const handleTouchStart = (event: TouchEvent) => {
            if (!cursorConfig.enabled || !cursorConfig.clickForce) return
            event.preventDefault()
            particlesGroup.updateMatrixWorld(true)

            const containerRect = container.getBoundingClientRect()
            const touch = event.touches[0]
            if (!touch) return

            const touchX = touch.clientX - containerRect.left + offsetX
            const touchY = touch.clientY - containerRect.top + offsetY
            const cursorRadiusSquared = cursorRadius * cursorRadius
            const clickForceVal = cursorConfig.clickForce || 10

            const touchContainerWidth = containerRef.current?.clientWidth || 400
            const touchContainerHeight =
                containerRef.current?.clientHeight || 400
            const touchCanvasWidth =
                touchContainerWidth * canvasOverflowMultiplier
            const touchCanvasHeight =
                touchContainerHeight * canvasOverflowMultiplier
            const currentCamera = cameraRef.current

            const ndcX = (touchX / touchCanvasWidth) * 2 - 1
            const ndcY = 1 - (touchY / touchCanvasHeight) * 2

            const touchRay = new Vector3(ndcX, ndcY, 0.5)
            touchRay.unproject(currentCamera)

            const cameraWorldPos = new Vector3()
            cameraWorldPos.setFromMatrixPosition(currentCamera.matrixWorld)

            const touchDirection = new Vector3()
            touchDirection.subVectors(touchRay, cameraWorldPos).normalize()

            const sphereCenter = new Vector3(0, 0, 0)
            const cameraToCenter = new Vector3()
            cameraToCenter.subVectors(sphereCenter, cameraWorldPos)
            const sphereDistance = cameraToCenter.length()
            const touchWorldPos = new Vector3()
            touchWorldPos.copy(cameraWorldPos)
            touchWorldPos.addScaledVector(touchDirection, sphereDistance)

            for (let i = 0; i < baseParticlePositionsRef.current.length; i++) {
                const basePos = baseParticlePositionsRef.current[i]
                const displacement = particleDisplacementsRef.current[i]
                const scatterVelocity = particleScatterVelocitiesRef.current[i]

                const currentLocalPos = new Vector3()
                currentLocalPos.copy(basePos)
                currentLocalPos.add(displacement)

                const worldPos = new Vector3()
                worldPos.copy(currentLocalPos)
                worldPos.applyMatrix4(particlesGroup.matrixWorld)

                const projected = worldPos.clone().project(currentCamera)
                const screenX = (projected.x * 0.5 + 0.5) * touchCanvasWidth
                const screenY = (-projected.y * 0.5 + 0.5) * touchCanvasHeight

                const dx = touchX - screenX
                const dy = touchY - screenY
                const distanceSquared = dx * dx + dy * dy

                if (
                    distanceSquared < cursorRadiusSquared &&
                    distanceSquared > 0
                ) {
                    const screenDistance = Math.sqrt(distanceSquared)
                    const force =
                        ((cursorRadius - screenDistance) / cursorRadius) *
                        clickForceVal

                    const radialDirection = new Vector3()
                    radialDirection.subVectors(worldPos, touchWorldPos)
                    const radialDistance = radialDirection.length()

                    if (radialDistance > 0.001) {
                        radialDirection.normalize()
                        const scatterMagnitude = force * 0.5
                        const worldScatter = new Vector3()
                        worldScatter.copy(radialDirection)
                        worldScatter.multiplyScalar(scatterMagnitude)

                        const localScatter = new Vector3()
                        localScatter.copy(worldScatter)
                        const inverseGroupMatrix = new Matrix4()
                        inverseGroupMatrix
                            .copy(particlesGroup.matrixWorld)
                            .invert()
                        localScatter.applyMatrix4(inverseGroupMatrix)

                        scatterVelocity.add(localScatter)
                    }
                }
            }

            startAnimation()
        }

        if (cursorConfig.enabled) {
            canvas.addEventListener("mousemove", handleMouseMoveCursor)
            canvas.addEventListener("mouseleave", handleMouseLeaveCursor)
            canvas.addEventListener("click", handleClick)
            canvas.addEventListener("touchmove", handleTouchMove, {
                passive: false,
            })
            canvas.addEventListener("touchstart", handleTouchStart, {
                passive: false,
            })
            canvas.addEventListener("touchend", handleTouchEnd)
            canvas.addEventListener("touchcancel", handleTouchEnd)
        }

        const handleResize = () => {
            if (
                !containerRef.current ||
                !cameraRef.current ||
                !rendererRef.current
            )
                return

            const newWidth =
                containerRef.current.clientWidth ||
                containerRef.current.offsetWidth ||
                400
            const newHeight =
                containerRef.current.clientHeight ||
                containerRef.current.offsetHeight ||
                400

            const newCanvasWidth = newWidth * canvasOverflowMultiplier
            const newCanvasHeight = newHeight * canvasOverflowMultiplier
            const newOffsetX = (newCanvasWidth - newWidth) / 2
            const newOffsetY = (newCanvasHeight - newHeight) / 2

            cameraRef.current.aspect = newCanvasWidth / newCanvasHeight
            cameraRef.current.updateProjectionMatrix()

            const baseCameraDistance = 3.0
            const currentSphereRadius = 1.0 * scaleMultiplier
            const cameraDistance = Math.max(
                baseCameraDistance,
                currentSphereRadius + 1.0
            )
            cameraRef.current.position.z = cameraDistance

            rendererRef.current.setSize(newCanvasWidth, newCanvasHeight)
            const canvasEl = rendererRef.current.domElement
            canvasEl.style.left = `-${newOffsetX}px`
            canvasEl.style.top = `-${newOffsetY}px`
            canvasEl.style.width = `${newCanvasWidth}px`
            canvasEl.style.height = `${newCanvasHeight}px`

            rendererRef.current.render(sceneRef.current!, cameraRef.current)
        }

        if (isCanvas && typeof window !== "undefined") {
            const TICK_MS = 250
            const EPS_ZOOM = 0.001
            const EPS_SIZE = 0.5
            const EPS_ASPECT = 0.001

            let rafId = 0
            const tick = (now?: number) => {
                const probe = zoomProbeRef.current
                if (probe && containerRef.current) {
                    const currentZoom = probe.getBoundingClientRect().width / 20
                    const rect = containerRef.current.getBoundingClientRect()
                    const cw = rect.width
                    const ch = rect.height
                    const aspect = cw / ch

                    const timeOk =
                        !lastResizeRef.current.ts ||
                        (now || performance.now()) - lastResizeRef.current.ts >=
                            TICK_MS
                    const zoomChanged =
                        Math.abs(currentZoom - lastResizeRef.current.zoom) >
                        EPS_ZOOM
                    const sizeChanged =
                        Math.abs(cw - lastResizeRef.current.w) > EPS_SIZE ||
                        Math.abs(ch - lastResizeRef.current.h) > EPS_SIZE
                    const aspectChanged =
                        Math.abs(aspect - lastResizeRef.current.aspect) >
                        EPS_ASPECT

                    if (
                        timeOk &&
                        (zoomChanged || sizeChanged || aspectChanged)
                    ) {
                        lastResizeRef.current = {
                            ts: now || performance.now(),
                            zoom: currentZoom,
                            w: cw,
                            h: ch,
                            aspect,
                        }
                        handleResize()
                    }
                }
                rafId = requestAnimationFrame(tick)
            }
            rafId = requestAnimationFrame(tick)

            return () => {
                cancelAnimationFrame(rafId)
                if (animationFrameId !== null) {
                    cancelAnimationFrame(animationFrameId)
                }
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current)
                }
                if (drag) {
                    canvas.removeEventListener("mousedown", handleMouseDown)
                }
                if (stopOnHover) {
                    canvas.removeEventListener(
                        "mousemove",
                        handleMouseMoveHover
                    )
                }
                if (cursorConfig.enabled) {
                    canvas.removeEventListener(
                        "mousemove",
                        handleMouseMoveCursor
                    )
                    canvas.removeEventListener(
                        "mouseleave",
                        handleMouseLeaveCursor
                    )
                    canvas.removeEventListener("click", handleClick)
                    canvas.removeEventListener("touchmove", handleTouchMove)
                    canvas.removeEventListener("touchstart", handleTouchStart)
                    canvas.removeEventListener("touchend", handleTouchEnd)
                    canvas.removeEventListener("touchcancel", handleTouchEnd)
                }
                if (rendererRef.current) {
                    rendererRef.current.dispose()
                    if (containerRef.current && canvas.parentNode) {
                        containerRef.current.removeChild(canvas)
                    }
                }
                if (particlesRef.current) {
                    if (particlesRef.current.geometry) {
                        particlesRef.current.geometry.dispose()
                    }
                    if (particlesRef.current.material) {
                        if (Array.isArray(particlesRef.current.material)) {
                            particlesRef.current.material.forEach((mat: any) =>
                                mat.dispose()
                            )
                        } else {
                            particlesRef.current.material.dispose()
                        }
                    }
                }
            }
        }

        const resizeObserver = new ResizeObserver(() => handleResize())
        resizeObserver.observe(container)
        window.addEventListener("resize", handleResize)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener("resize", handleResize)
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId)
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
            if (drag) {
                canvas.removeEventListener("mousedown", handleMouseDown)
            }
            if (stopOnHover) {
                canvas.removeEventListener("mousemove", handleMouseMoveHover)
            }
            if (cursorConfig.enabled) {
                canvas.removeEventListener("mousemove", handleMouseMoveCursor)
                canvas.removeEventListener("mouseleave", handleMouseLeaveCursor)
                canvas.removeEventListener("click", handleClick)
                canvas.removeEventListener("touchmove", handleTouchMove)
                canvas.removeEventListener("touchstart", handleTouchStart)
                canvas.removeEventListener("touchend", handleTouchEnd)
                canvas.removeEventListener("touchcancel", handleTouchEnd)
            }
            if (rendererRef.current) {
                rendererRef.current.dispose()
                if (containerRef.current && canvas.parentNode) {
                    containerRef.current.removeChild(canvas)
                }
            }
            if (particlesRef.current) {
                if (particlesRef.current.geometry) {
                    particlesRef.current.geometry.dispose()
                }
                if (particlesRef.current.material) {
                    if (Array.isArray(particlesRef.current.material)) {
                        particlesRef.current.material.forEach((mat: any) =>
                            mat.dispose()
                        )
                    } else {
                        particlesRef.current.material.dispose()
                    }
                }
            }
        }
    }, [
        particlesCount,
        speed,
        smoothing,
        scale,
        stopOnHover,
        rotationDirection,
        dragSpeed,
        drag,
        particleScale,
        cursorOn,
        clickForce,
        cursorRadius,
        cursorStrength,
        sphereColor,
        rotationSpeed,
        scaleMultiplier,
        particleSize,
        isCanvas,
    ])

    const containerStyle: React.CSSProperties = {
        ...style,
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
    }

    return (
        <div style={containerStyle}>
            <div
                ref={zoomProbeRef}
                style={{
                    position: "absolute",
                    width: 20,
                    height: 20,
                    opacity: 0,
                    pointerEvents: "none",
                }}
            />
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    overflow: "visible",
                }}
            />
        </div>
    )
}

ParticleSphereRefactor.displayName = "Particle Sphere"
