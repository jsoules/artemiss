import useBestFitLine from "@snUtil/useBestFitLine"
import { ScaleLinear, scaleLinear } from "d3"
import { FunctionComponent, useMemo } from "react"
import { baseDims } from "../plots/layout/PlotScaling"
import SvgXAxis from "../plots/plotFittings/SvgXAxis"
import SvgYAxis from "../plots/plotFittings/SvgYAxis"

// TODO: Remove dependency on d3, given how little we actually need from
// the scaling objects

type Props = {
    xLabel: string,
    yLabel: string,
    xDesc: string,
    yDesc: string,
    xSeries: number[],
    ySeries: number[],
    meanY: number,
    width: number,
    height: number,
    // dims: BoundedPlotDimensions
}


const getRange = (dataSeries: number[]) => {
    // Note: it's actually possible the data series
    // will only have one data point. In that case, just add some
    // padding to that data point. (It'll be further padded by the
    // margin-adding code in the main plotter below, but who cares)
    const vals = dataSeries.length === 1
        ? [dataSeries[0] * .8, dataSeries[0] * 1.2]
        : dataSeries
    const range = [Math.min(...vals), Math.max(...vals)]
    return { range }
}

const fontPx = 10

const contentScaleTransform = `translate(${baseDims.marginLeft},${baseDims.marginTop})`


const useTitleGroup = (width: number, xLabel: string, yLabel: string) => {
    return useMemo(() =>
        <g transform={`translate(${baseDims.marginLeft + width/2}, ${1.7*fontPx})`}>
            <text
                style={{
                    fontSize: `${1.7*fontPx}px`,
                    fontWeight: 'bold',
                    textAnchor: "middle"
                }}
            >
                {`${xLabel} vs ${yLabel}`}
            </text>
        </g>
    , [width])
}


type LinearScale = ScaleLinear<number, number>
const useFeaturePlotContent = (xSeries: number[], ySeries: number[], canvasHeight: number, xScale: LinearScale, yScale: LinearScale) => {

    const dots = useMemo(() => (
        xSeries.map((v, i) => {
            const x = xScale(v)
            const y = yScale(ySeries[i])
            return <circle
                key={`dot-${i}`}
                cx={x}
                cy={canvasHeight - y}
                fill={'#000000'}
                r="4"
            />
        })
    ), [canvasHeight, ySeries, xSeries, xScale, yScale])

    const data = xSeries.map((v, i) => [v, ySeries[i]])
    const {slope, intercept} = useBestFitLine(data)
    const line = useMemo(() => {
        if (!slope || !intercept) return <></>
        const nativeX1 = xScale.domain()[0]
        const nativeX2 = xScale.domain()[1]
        const realizedY1 = yScale(intercept + (slope * nativeX1))
        const realizedY2 = yScale(intercept + (nativeX2 * slope))

        // Constrain those to what's actually on the canvas
        // nativeX1, nativeX2 are presumptively on-canvas
        // so if either realized Y is negative or exceeds canvasHeight, we need to recompute the X that would correspond to the boundary.
        // TK -- wait until confirmation from AG
        
        return <line
                    key={`BestFitLine`}
                    x1={xScale(nativeX1)}
                    y1={canvasHeight - realizedY1}
                    x2={xScale(nativeX2)}
                    y2={canvasHeight - realizedY2}
                    stroke="black" />
    }, [canvasHeight, intercept, slope, xScale, yScale])

    return [line, dots]
}


const LinePlot: FunctionComponent<Props> = (props: Props) => {
    const { xSeries, xLabel, xDesc, ySeries, yLabel, yDesc, width, height, meanY } = props
    // const xSpan = xRange[1] - xRange[0]
    const { range: yRange } = getRange(ySeries)
    const _ySpan = yRange[1] - yRange[0]
    const ySpan = _ySpan === 0 ? 1. : _ySpan
    // const broadXrange = useMemo(() => [Math.max(0, xRange[0] - xSpan * .2), xRange[1] + xSpan * .2], [xRange, xSpan])
    const broadXrange = useMemo(() => [Math.min(0, xSeries[0]), Math.max(xSeries[xSeries.length - 1], 1)], [xSeries])
    const broadYrange = useMemo(() => [(yRange[0] - ySpan * .2), yRange[1] + ySpan * .2], [yRange, ySpan])
    const boundedDims = useMemo(() => ({
        ...baseDims,
        height,
        boundedHeight: Math.max(0, height - baseDims.marginTop - baseDims.marginBottom),
        width,
        boundedWidth: Math.max(0, width - baseDims.marginRight - baseDims.marginLeft)
    }), [height, width])

    const xScale = useMemo(() => {
        return scaleLinear()
            .domain(broadXrange)
            .range([0, boundedDims.boundedWidth])
    }, [boundedDims.boundedWidth, broadXrange])
    const yScale = useMemo(() => {
        return scaleLinear()
            .domain(broadYrange)
            .range([0, boundedDims.boundedHeight])
    }, [boundedDims.boundedHeight, broadYrange])

    const xAxis = useMemo(() => <SvgXAxis
                                    dataRange={xScale.domain()}
                                    canvasRange={xScale.range()}
                                    dims={boundedDims}
                                    axisLabel={xDesc}
                                    isLog={false}
                                    isY={false}
                                />,
        [boundedDims, xScale])
    const yAxis = useMemo(() => <SvgYAxis
                                    dataRange={yScale.domain()}
                                    canvasRange={yScale.range()}
                                    axisLabel={yDesc}
                                    isLog={false}
                                    markedValue={meanY}
                                    dims={boundedDims}
                                    isY={true}
                                />,
        [boundedDims, meanY, yScale])
    return (
        <div
            className="iotaProfileWrapper"
            style={{ width, height }}
        >
            <svg width={width} height={height}>
                {useTitleGroup(boundedDims.boundedWidth, xLabel, yLabel)}
                <g transform={contentScaleTransform}>
                    {xAxis}
                    {yAxis}
                    {useFeaturePlotContent(xSeries, ySeries, boundedDims.boundedHeight, xScale, yScale)}
                </g>
            </svg>
        </div>)
}

export default LinePlot
