import projectToPlotReadyData, { ProjectionCriteria } from "@snState/projection"
import { ToggleableVariables, fieldIsCategorical } from "@snTypes/DataDictionary"
import { ArtemissRecord, FilterSettings, PKType } from "@snTypes/Types"
import { useMemo } from "react"
import { PlotColorProps } from "./plotColors"


export type PlotDataSummary = {
    data: number[][][]
    radius: number[][][]
    ids: PKType[][][]
    urls: string[][][]
    colorValues: number[][][]
    colorFieldRange: number[]
    fineSplitVals: number[]
    coarseSplitVals: number[]
    coarseSplitField?: ToggleableVariables
    fineSplitField?: ToggleableVariables
}

type plotHookParams = PlotColorProps & {
    records: ArtemissRecord[],
    filterSettings: FilterSettings
}

type plotHookType = (params: plotHookParams) => PlotDataSummary


export const usePlotData: plotHookType = ({records, filterSettings, colorSplit}) => {
    const fineSplit = filterSettings.finePlotSplit
    const coarseSplit = filterSettings.coarsePlotSplit
    const res = useMemo(() => {
        const projectionCriteria: ProjectionCriteria = {
            data: records,
            yVar: filterSettings.dependentVariable,
            xVar: filterSettings.independentVariable,
            filterSettings,
            colorField: colorSplit,
            fineSplit,
            coarseSplit,
        }
        const { data, radius, colorValues, ids, urls, fineSplitVals, coarseSplitVals } = projectToPlotReadyData(projectionCriteria)
        const colorFieldRange: number[] = fieldIsCategorical(colorSplit)
            ? []
            : filterSettings[colorSplit] as number[]
        return { data, radius, ids, urls, colorValues, fineSplitVals, coarseSplitVals, coarseSplitField: coarseSplit, fineSplitField: fineSplit, colorFieldRange }
    }, [coarseSplit, colorSplit, filterSettings, fineSplit, records])

    return res
}
