import { SupportedColorMap } from "@snComponents/display/Colormaps"
import InstructionButton from "@snComponents/general/InstructionButton"
import { ModelInstructionDrawer } from "@snComponents/general/InstructionDrawer"
import { HrBar, Spinner } from "@snGeneralComponents/index"
import { useDevice, useDevice3dModel } from "@snQuerying/index"
import { defaultEmptyDevice } from "@snTypes/Defaults"
import useWindowDimensions from "@snUtil/useWindowDimensions"
import { DownloadLinks, RecordManifest, SimulationView, SurfaceControls } from "@snVisualizer/index"
import { FunctionComponent, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router"
import imgLogo from 'src/assets/Quasr_Logo_RGB_Full.svg'

const Model: FunctionComponent = () => {
    const params = useParams()
    const modelUrlChunk = params.modelUrlChunk
    if (modelUrlChunk === undefined) {
        throw Error(`Can't happen: modelUrlChunk parameter not set in ${JSON.stringify(params)}`)
    }
    const canvasRef = useRef(null)
    const device = useDevice(modelUrlChunk)
    // const { baseCoils, baseSurfs, fullCoils, fullSurfs, surfaceCount } = useDevice3dModel(stringId.id, device.nfp)
    const deviceModel = useDevice3dModel(device)
    
    const [instructionsOpen, setInstructionsOpen] = useState(false)
    const [colorMap, setColorMap] = useState<SupportedColorMap>(SupportedColorMap.PLASMA)
    const [showFullRing, setShowFullRing] = useState<boolean>(false)
    // const [showCurrents, setShowCurrents] = useState<boolean>(true)
    const [autorotate, setAutorotate] = useState<boolean>(false)
    const [surfaceChecks, setSurfaceChecks] = useState<boolean[]>(Array(device.nSurfaces).fill(true))
    useEffect(() => {
        setSurfaceChecks(Array<boolean>(device.nSurfaces).fill(true))
    }, [device.nSurfaces])

    const FIXME_STRINGID = { 'id': 'foo' }
    const downloadLinks = <DownloadLinks id={FIXME_STRINGID.id} />
    // const poincarePlot = <PoincarePlot id={stringId.id}/>

    const { width } = useWindowDimensions()
    const lw = useMemo(() => Math.max(0, (2 * width / 3) - 80), [width])
    const rw = useMemo(() => Math.max(0, (width / 3) - 40), [width])

    const viewer = useMemo(() => {
        const ifAvail = (
            <>
                <SimulationView
                    // width={constrainedLeftWidth}
                    // height={0.8 * constrainedLeftWidth}
                    width={lw}
                    height={0.8 * lw}
                    canvasRef={canvasRef}
                    // coils={showFullRing ? fullCoils : baseCoils}
                    device={deviceModel}
                    showFullRing={showFullRing}
                    // surfs={showFullRing ? fullSurfs : baseSurfs}
                    surfaceChecks={surfaceChecks}
                    colorScheme={colorMap}
                    displayedPeriods={showFullRing ? device.nfp : 1}
                    // showCurrents={showCurrents}
                    autorotate={autorotate}
                />
            </>
        )
        const spinner = (
            // <div style={{width: constrainedLeftWidth, height: 0.8 * constrainedLeftWidth}}>
            <div style={{width: lw, height: 0.8 * lw}}>
                <Spinner />
            </div>
        )
        return (deviceModel.baseSurfaces === undefined) ? spinner : ifAvail
    // }, [lw, showFullRing, surfaceChecks, colorMap, device.nfp, showCurrents, autorotate])
    }, [lw, showFullRing, surfaceChecks, colorMap, device.nfp, autorotate])

    return device === defaultEmptyDevice
        ? <div></div>
        : (<div className="simulationViewParent ForceLightMode">
            <ModelInstructionDrawer open={instructionsOpen} changeOpenState={setInstructionsOpen} />
            <div className="modelButtonRow">
                <img className="modelLogo" src={imgLogo} />
                <InstructionButton open={instructionsOpen} changeOpenState={setInstructionsOpen} />
            </div>
            <div className="flexWrapper simulationViewParent">
                <div style={{width: Math.floor(lw + 40)}} className="simulationViewWrapper">
                    <SurfaceControls
                        checksNeeded={device.nSurfaces > 0}
                        surfaceChecks={surfaceChecks}
                        setSurfaceChecks={setSurfaceChecks}
                        // showCurrents={showCurrents}
                        // setShowCurrents={setShowCurrents}
                        colorMap={colorMap}
                        setColorMap={setColorMap}
                        showFullRing={showFullRing}
                        setShowFullRing={setShowFullRing}
                        autorotate={autorotate}
                        setAutorotate={setAutorotate}
                    />
                    <canvas
                        ref={canvasRef}
                        className="deviceModel"
                        // style={{marginLeft: `${leftMargin}px`}}
                        title="Click and drag to rotate the camera; right-click, shift-click, or ctrl-click and drag to pan."
                    />
                    {viewer}
                </div>
                <div style={{width: Math.floor(rw) }}>
                    {/* TODO: RE-ADD PLOTS */}
                    {/* <IotaProfilePlot iotaProfile={device.iotaProfile} tfProfile={device.tfProfile} meanIota={device.meanIota} width={rw} height={rw} /> */}
                    <HrBar />
                    <RecordManifest device={device} colWidth={Math.floor(rw)} />
                </div>
            </div>
            <HrBar />
            {/* {poincarePlot}
            <HrBar /> */}
            {downloadLinks}
        </div>
    )
}

export default Model
