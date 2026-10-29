import { SupportedColorMap } from "@snComponents/display/Colormaps"
import { DownloadLinks, LinePlotProps, LinePlotRow, RecordManifest, SimulationView, SurfaceControls } from "@snComponents/display/visualizer"
import { HrBar, InstructionButton, ModelInstructionDrawer, Spinner } from "@snComponents/general"
import { useDevice, useDevice3dModel } from "@snQuerying/index"
import { DeviceFields } from "@snTypes/DataDictionary"
import { defaultEmptyDevice } from "@snTypes/Defaults"
import { Device, DeviceTimeSeries } from "@snTypes/Types"
import useWindowDimensions from "@snUtil/useWindowDimensions"
import { FunctionComponent, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router"
import imgLogo from 'src/assets/BoSS_Logo.svg'

const _mean: (series: number[]) => number = (series: number[]) => {
    if (series.length === 0) {
        return 0
    }
    return series.reduce((a, c) => a + c, 0) / series.length
}

// TODO: Switch mean calculation to use sumPrecise --> requries upgrading target math library version
const makeLinePlotProps = (device: Device, xField: keyof Device, yField: keyof Device, edgeLength: number): LinePlotProps => {
    // this is a real ugly hack
    const xSeries = device[xField] as any as number[]
    const ySeries = device[yField] as any as number[]
    const _xSeries = yField === "mercierCriterion" ? xSeries.slice(1) : xSeries
    const _ySeries = yField === "mercierCriterion" ? ySeries.slice(1) : ySeries
    return {
        xLabel: DeviceFields[xField].label,
        yLabel: DeviceFields[yField].label,
        xDesc: DeviceFields[xField].desc ?? DeviceFields[xField].label,
        yDesc: DeviceFields[yField].desc ?? DeviceFields[yField].label,
        xSeries: _xSeries,
        ySeries: _ySeries,
        meanY: _mean(_ySeries),
        width: edgeLength,
        height: edgeLength,
        withFit: false,
        customLabel: DeviceFields[yField].label
    }
}

// TODO: These two functions could probably be combined with use of generics, but we aren't quite there
const makeLinePlotPropsForTime = (series: DeviceTimeSeries, frac: "10" | "25" | "50", edgeLength: number): LinePlotProps => {
    const yLabel = `s=0.${frac}`
    const yDesc = `Loss fraction (${frac})`
    const ySeries = frac === '10' ? series.lossFracS0_10 : frac === '25' ? series.lossFracS0_25 : series.lossFracS0_50
    const xSeries = series.time.map(x => Math.log10(x))

    /// Actually take the log for the time series!
    // Remove the mean for this one too

    return {
        xLabel: "t",
        yLabel,
        xDesc: "Log_10 of time (s)",
        yDesc,
        xSeries: xSeries,
        ySeries: ySeries,
        meanY: undefined,
        width: edgeLength,
        height: edgeLength,
        withFit: false,
        customLabel: `Loss fraction for particles born on ${yLabel}`
    }
}


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

    const downloadLinks = <DownloadLinks canonicalPath={device.canonicalPath} />
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

    const profilePlotProps = useMemo(() => {
        return device === defaultEmptyDevice
            ? []
            : [
                makeLinePlotProps(device, "surfaceDistances", "pressure", rw),
                makeLinePlotProps(device, "surfaceDistances", "toroidalCurrent", rw),
                makeLinePlotProps(device, "surfaceDistances", "iota", rw),
            ]
    }, [device])
    const mhdPlotProps = useMemo(() => {
        return device === defaultEmptyDevice
            ? []
            : [
                makeLinePlotProps(device, "surfaceDistances", "sqrtBoozerQsError", rw),
                makeLinePlotProps(device, "surfaceDistances", "mercierCriterion", rw)
            ]
    }, [device])
    const timePlotProps = useMemo(() => {
        return device === defaultEmptyDevice
            ? []
            : [
                makeLinePlotPropsForTime(device.lossTracings, "10", rw),
                makeLinePlotPropsForTime(device.lossTracings, "25", rw),
                makeLinePlotPropsForTime(device.lossTracings, "50", rw),
            ]
    }, [device])

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
                        title="Click and drag to rotate the camera; right-click, shift-click, or ctrl-click and drag to pan."
                    />
                    {viewer}
                </div>
                <div style={{width: Math.floor(rw) }}>
                    <RecordManifest device={device} colWidth={Math.floor(rw)} />
                </div>
            </div>
            <LinePlotRow pageWidth={width} plots={profilePlotProps} label={"Profiles"} />
            <LinePlotRow pageWidth={width} plots={mhdPlotProps} label={"Ideal MHD"} />
            <LinePlotRow pageWidth={width} plots={timePlotProps} label={"Guiding center"} />
            <HrBar />
            {/* {poincarePlot}
            <HrBar /> */}
            {downloadLinks}
        </div>
    )
}

export default Model
