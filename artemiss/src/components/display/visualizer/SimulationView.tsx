import { SupportedColorMap } from '@snDisplayComponents/Colormaps'
import { Device3dModel, SurfaceObject } from '@snTypes/Types'
import { FunctionComponent, RefObject, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import useSvCamera from './SvCamera'
import useSvControls from './SvControls'
import { ambientLight, spotlights } from './SvLighting'
import { fieldMaterial, whiteBackground } from './SvMaterials'
import useSvRenderer from './SvRenderer'
import { colorizeSurfaces, makeSurfaces, usePositions } from './geometry'

type Props = {
    width: number
    height: number
    canvasRef: RefObject<null | HTMLCanvasElement>
    device: Device3dModel
    showFullRing: boolean
    colorScheme?: SupportedColorMap
    surfaceChecks?: boolean[]
    // coils?: CoilRecord[]
    // surfs?: SurfaceObject
    displayedPeriods?: number
    // showCurrents?: boolean
    autorotate?: boolean
}

type Positions = {
    center: THREE.Vector3,
    zOffset: THREE.Vector3,
    xSpan: number,
    ySpan: number
}

const scene = new THREE.Scene()
scene.background = whiteBackground


const worldZ = new THREE.Vector3(0, 0, 1)
const secondsPerRevolution = 10
// degrees/rev * rev/sec * sec/tick
const degreesPerTick = 360 * (1/secondsPerRevolution) / 60
const theta = degreesPerTick * Math.PI/180  // need radians

const spinObjects = (obj: THREE.Mesh<THREE.BufferGeometry, THREE.Material>[], ticks: number = 1) => {
    obj.forEach(o => o.rotateOnWorldAxis(worldZ, -theta * ticks))
}


const SimulationView: FunctionComponent<Props> = (props: Props) => {
    const { width, height, canvasRef, device, showFullRing, surfaceChecks, colorScheme, displayedPeriods, autorotate } = props
    const frameRequest = useRef<number | undefined>(undefined)
    const totalTicks = useRef<number>(0)
    const canvas = canvasRef.current

    // const myCoils = useMemo(() => {
    //     return coils ?? []
    //     // return coils === undefined
    //     //     ? [] as CoilRecord[]
    //     //     : coils
    // }, [coils?.length])

    console.log(`In simulation view, surf dimensions\n\tbase: ${device?.baseSurfaces.length} x ${device?.baseSurfaces[0].length} x ${device?.baseSurfaces[0][0].length}\n\tfull: ${device?.fullSurfaces.length} x ${device?.fullSurfaces[0].length} x ${device?.fullSurfaces[0][0].length}`)
    const mySurfs = useMemo(() => {
        totalTicks.current = 0
        const surf = showFullRing ? device?.fullSurfaces : device?.baseSurfaces
        const colors = showFullRing ? device?.fullModBboozer : device?.baseModBboozer
        // TODO: If we want to support painting more colors on the surface, come up with
        // UI controls to pick which data set we display
        return surf === undefined
            ? { surfacePoints: [], pointValues: [], incomplete: true } as SurfaceObject
            : { surfacePoints: surf, pointValues: colors, incomplete: false }
    }, [device?.baseSurfaces[0]?.length, showFullRing])

    // const tubes = useMemo(() => {
    //     // NOTE: Could memoize these out individually but it's probably not terribly expensive
    //     // const coilTubes = makeTubes(myCoils.map(r => r.coil))
    //     // const currents = myCoils.map(r => r.current)
    //     const coilMeshes = showCurrents
    //         ? coilTubes.map((c, i) => new THREE.Mesh(c, getScaledTubeMaterial(currents[i], SupportedColorMap.BLUEORANGE)))
    //         : coilTubes.map(c => new THREE.Mesh(c, tubeMaterial))
    //     spinObjects(coilMeshes, totalTicks.current)
    //     return coilMeshes
    // }, [myCoils, showCurrents])

    const baseSurfaces = useMemo(() => makeSurfaces(mySurfs.surfacePoints, displayedPeriods), [displayedPeriods, mySurfs.surfacePoints])
    const coloredSurfs = useMemo(() => colorizeSurfaces(baseSurfaces, mySurfs.pointValues, colorScheme), [baseSurfaces, colorScheme, mySurfs.pointValues])
    // NOTE: changing the color scheme/recoloring the surfaces does not change the coloredSurfs reference, which is modified in-place.
    // To ensure that changing the color actually updates the meshes, we need to make the following hook also depend on colorScheme
    // even though it is not directly referenced in the contained code.
    const surfaceMeshes = useMemo(() => {
        const surfaceMeshes = coloredSurfs.map(s => new THREE.Mesh(s, fieldMaterial))
        spinObjects(surfaceMeshes, totalTicks.current)
        return surfaceMeshes
    }, [coloredSurfs, colorScheme])

    const visibleObjects = useMemo(() => {
        const visibleSurfaces = surfaceMeshes.filter((_, idx) => (surfaceChecks ?? [])[idx])
        // return [...tubes, ...visibleSurfaces]
        return [...visibleSurfaces]
    }, [surfaceMeshes, surfaceChecks])

    const focalPositions = usePositions(mySurfs.surfacePoints[0])
    const camera = useSvCamera(width, height)
    const controls = useSvControls(canvas, camera)
    const renderer = useSvRenderer(canvas, width, height)

    useEffect(() => {
        updatePositions(camera, controls, focalPositions, spotlights)
    }, [camera, controls, focalPositions, focalPositions.center, focalPositions.zOffset])

    useEffect(() => {
        return makeScene(controls, camera, spotlights, visibleObjects, renderer)
    }, [height, width, controls, camera, visibleObjects, renderer])

    useEffect(() => {
        if (frameRequest.current !== undefined)
            cancelAnimationFrame(frameRequest.current)
        if (!autorotate) return

        const anim = () => {
            // spinObjects([...tubes, ...surfaceMeshes])
            spinObjects([...surfaceMeshes])
            totalTicks.current += 1
            renderer.render(scene, camera)
            frameRequest.current = requestAnimationFrame(anim)
        }
        anim()
    }, [renderer, camera, autorotate, surfaceMeshes])

    return (
        <></>
    )
}


type Light = THREE.SpotLight | THREE.PointLight
const zUnit = new THREE.Vector3(0, 0, -1)
const updatePositions = (camera: THREE.PerspectiveCamera, controls: OrbitControls | undefined, positions: Positions, spots: Light[] ) => {
    if (!controls) return
    controls.target.copy(positions.center)
    // We'd like to position the camera so the full width of the largest span (x or y) is in view. Since the camera's field-of-view
    // is 60 degrees, it will see 2 * sin(30) * Z in the x & y directions. But 2 sin(30 degrees) = 1.
    // So with W being the max of (xspan, yspan), set:
    //   camera z-position = center - zOffset/2 - W
    // because:
    //   - zOffset/2 puts us even with the lowest observed point, and
    //   - if W = 2 sin(30) * Z --> Z = W, and we put the camera in the negative Z direction.
    // However, since the geometries we actually work with put the x/y extrema closer to the Z-center, the above gives a bit too much
    // margin--especially when drawing into a non-square viewport. So use 0.25*Zspan instead of 0.5.
    camera.position.copy(positions.center).addScaledVector(positions.zOffset, -0.25).addScaledVector(zUnit, Math.max(positions.xSpan, positions.ySpan))
    // TODO: some more sophisticated logic for spotlighting?
    spots[0].position.copy(positions.center).setZ(-50)
    spots[1].position.copy(positions.center).setZ(50)
}


const makeScene = (controls: OrbitControls | undefined, camera: THREE.PerspectiveCamera, spots: Light[], objects: THREE.Mesh[], renderer: THREE.WebGLRenderer) => {
    if (!controls) return

    scene.clear()

    scene.add(ambientLight)
    spots.forEach(s => scene.add(s))
    objects.forEach(obj => {
        scene.add(obj)
    })
    
    scene.add(camera)

    const render = () => {
        renderer.render( scene, camera )
    }
    controls.addEventListener( 'change', render )
    controls.update()
    render()

    return () => {
        controls.removeEventListener('change', render)
    }
}


export default SimulationView
