import { SupportedColorMap, SupportedColorPalette } from "@snComponents/display/Colormaps"
import SnTable from "@snComponents/display/SnTable"
import { ColorBar, MarkedValueDesc, OverallHitCount, PlotLegend, computePerPlotDimensions, defaultPlotColorProps, plotColorReducer, useDataGeometry, usePlotData, usePlotFittings, usePlotMouseHandlers } from "@snComponents/display/plots"
import { HrBar, InstructionButton, OverviewInstructionDrawer } from "@snComponents/general"
import { SelectionControlDrawer, SelectionControlPanel, ShowFiltersButton, useFilterCallbacks } from "@snComponents/selectionControl"
import { NavigatorStateAction } from "@snState/NavigatorReducer"
import { DependentVariables, ToggleableVariables, fieldIsCategorical } from "@snTypes/DataDictionary"
import { FilterSettings } from "@snTypes/Types"
import useWindowDimensions from "@snUtil/useWindowDimensions"
import { Dispatch, FunctionComponent, useMemo, useReducer, useState } from "react"
import imgLogo from 'src/assets/BoSS_Logo.svg'
import PlotGrid from "./PlotGrid"


const drawerWidth = 500
const drawerClosedLeftMargin = 15
export const plotGridInternalMargin = 20


type OverviewProps = {
    // records: ArtemissRecord[]
    dispatch: Dispatch<NavigatorStateAction>
    filterSettings: FilterSettings
}


const usePerPlotDimensions = (width: number, height: number, colCount: number) => {
    const _width = width - 2 * plotGridInternalMargin
    const _colCount = Math.max(1, colCount)
    return useMemo(() => (
        computePerPlotDimensions(_colCount, _width, height)
    ), [_width, height, _colCount])
}


const Overview: FunctionComponent<OverviewProps> = (props: OverviewProps) => {
    const { dispatch, filterSettings } = props
    const {width, height} = useWindowDimensions()
    const [plotColorProps, plotColorPropsDispatch] = useReducer(plotColorReducer, defaultPlotColorProps)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [instructionsOpen, setInstructionsOpen] = useState(false)
    const callbacks = useFilterCallbacks(dispatch)

    const effectiveWidth = useMemo(() => width - 40, [width])
    
    
    // TODO: Can we further compress this logic preamble?
    const plotDataSummary = usePlotData({ ...props, ...plotColorProps})
    const dataGeometry = useDataGeometry(filterSettings)
    const contentDivLeftMargin = drawerOpen ? drawerWidth : drawerClosedLeftMargin
    const [plotDimensions] = usePerPlotDimensions(width - contentDivLeftMargin, height, plotDataSummary.fineSplitVals.length)
    const fittingsBase = {
        plotDimensions,
        dataGeometry,
        independentVariable: filterSettings.independentVariable,
        dependentVariable: filterSettings.dependentVariable
    }
    const mouseHandlers = usePlotMouseHandlers({
        ...fittingsBase,
        plotClickHandler: callbacks.handleUpdateFocusedPlotIndices,
        resolveRangeChangeHandler: callbacks.handleRangesChange,
    })
    const plotFittings = usePlotFittings({
        ...fittingsBase,
        fineSplitField: filterSettings.finePlotSplit,
        coarseSplitField: filterSettings.coarsePlotSplit
    })
    // TODO: Separate this out to reduce imports
    const legend = fieldIsCategorical(plotColorProps.colorSplit)    // if undefined, will be false
        ?   <PlotLegend
                var={plotColorProps.colorSplit as ToggleableVariables}
                style={plotColorProps.style as SupportedColorPalette}
                filters={filterSettings}
            />
        :   <ColorBar
                field={plotColorProps.colorSplit as DependentVariables}
                style={plotColorProps.style as SupportedColorMap}
                visRange={filterSettings.activeFilters[plotColorProps.colorSplit] as number[]}
            />
    

    return (
        <div
            className="MainWindow ForceLightMode"
            // style={{width: effectiveWidth, height: effectiveHeight}}
            style={{width: effectiveWidth}}
        >
            <SelectionControlDrawer
                open={drawerOpen}
                changeOpenState={setDrawerOpen}
                width={drawerWidth}
            >
                <SelectionControlPanel
                    filterSettings={filterSettings}
                    callbacks={callbacks}
                    colorProps={plotColorProps}
                    colorChgDispatcher={plotColorPropsDispatch}
                />
            </SelectionControlDrawer>

            <OverviewInstructionDrawer open={instructionsOpen} changeOpenState={setInstructionsOpen} />
            <img className="overviewLogo" src={imgLogo} />

            <div
                style={{
                    marginLeft: `${contentDivLeftMargin}px`
                }}
            >
                <PlotGrid
                    plotDataSummary={plotDataSummary}
                    dataGeometry={dataGeometry}
                    plotDimensions={plotDimensions}
                    mouseHandlers={mouseHandlers}
                    plotFittings={plotFittings}
                    plotColorProps={plotColorProps}
                    focusCoarseValue={filterSettings.coarsePlotSelectedValue}
                    focusFineValue={filterSettings.finePlotSelectedValue}
                />
                {legend}
                <MarkedValueDesc dependentVariable={filterSettings.dependentVariable} />
                <OverallHitCount hits={filterSettings.records.length} />
                <div className="buttonRow">
                    <ShowFiltersButton openState={drawerOpen} changeOpenState={setDrawerOpen} />
                    <InstructionButton open={instructionsOpen} changeOpenState={setInstructionsOpen} />
                </div>

                <HrBar />
                <SnTable
                    records={filterSettings.focusedRecords}
                    truncated={filterSettings.focusedRecordIds.size > filterSettings.focusedRecords.length}
                    markedIds={filterSettings.markedRecords}
                    markedIdUrls={filterSettings.markedRecordUrls}
                    selectionHandler={callbacks.handleUpdateMarks}
                />
            </div>
        </div>
    )
}

export default Overview
