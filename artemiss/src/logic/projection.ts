import { dotMargin } from "@snComponents/display/plots/webgl/drawScatter"
import { DependentVariables, Fields, IndependentVariables, KnownFields, ToggleableVariables, fieldIsCategorical } from "@snTypes/DataDictionary"
import { ArtemissRecord, FilterSettings, NullId, PKType } from "@snTypes/Types"


// We'd like to chop the plots into a grid based on selected discrete-valued data fields.
// Unfortunately, it's confusing to talk about "rowSplits" and "columnSplits" because the name can be read as either
// "field used to split the row apart" or "field used to split one row from another".
// So we define "fine-split" as making separations *within* rows and "coarse-split" as making separations *between* rows.
// Higher-order groupings might be possible, but we won't implement that until it's requested.
type categorizationCriteria = {
    colorField?: DependentVariables | ToggleableVariables
    fineSplit?: ToggleableVariables
    coarseSplit?: ToggleableVariables
}

export type ProjectionCriteria = categorizationCriteria & {
    yVar: DependentVariables
    xVar: IndependentVariables
    data: ArtemissRecord[]
    filterSettings: FilterSettings
}    


type ProjectedData = {
    data: number[][][]
    radius: number[][][]
    colorValues: number[][][]
    ids: PKType[][][]
    urls: string[][][]
    fineSplitVals: string[]
    coarseSplitVals: string[]
}


export const makeValsFromFieldname = (field: ToggleableVariables | undefined, filters: FilterSettings, includeAllIfNone?: boolean): string[] => {
    if (field === undefined) return []
    const allValidVals = Fields[field]?.values ?? []
    const splitVals = (filters[field] ?? []).map((v, i) => (v ? allValidVals[i] : undefined)).filter(x => x !== undefined) as unknown as string[]
    return includeAllIfNone && splitVals.length === 0 ? allValidVals : splitVals
}


export const defaultFieldKey = 'Any'
const makeDefaultedList = (p: {baseList: string[] | undefined, defaultToAll?: boolean, fieldName?: ToggleableVariables | undefined}) => {
    if (p.baseList === undefined || p.baseList.length === 0) {
        return p.defaultToAll
            ? Fields[p.fieldName as unknown as KnownFields].values ?? [defaultFieldKey]
            : [defaultFieldKey]
    }
    return p.baseList
}

const makeLookups = (
    colorField?: DependentVariables | ToggleableVariables,
    fineSplitVals?: string[],
    coarseSplitVals?: string[]
) => {
    // TODO:
    // USE THIS OPPORTUNITY TO TREAT THE CATEGORICAL AS A PROPER TRANSLATION TABLE!
    // OR POSSIBLY the issue is in the makeDefaultedList using values rather than valueLabels... hm
    const fineKeys:   Record<string, number> = {}
    const coarseKeys: Record<string, number> = {}
    const colorKeys:  Record<string, number> = {}

    // Actually this isn't a good idea, as it's likely to occur as a transition state when changing values or axes
    // if (fineSplit !== undefined && (fineSplit === coarseSplit)) {
    //     throw Error(`Data partition criteria must be distinct, but fine-split and coarse-split criterion match (${fineSplit}, ${coarseSplit})`)
    // }

    const fineVals   = makeDefaultedList({ baseList: fineSplitVals })
    const coarseVals = makeDefaultedList({ baseList: coarseSplitVals })
    const colorFieldIsCategorical = fieldIsCategorical(colorField)
    // const colorVals  = colorFieldIsCategorical ? makeDefaultedList({ baseList: undefined, defaultToAll: true, fieldName: colorField as ToggleableVariables }) : []
    const colorVals  = colorFieldIsCategorical ? Fields[colorField as ToggleableVariables].values ?? [] : []

    fineVals.forEach((v, i) => fineKeys[`${v}`] = i)
    coarseVals.forEach((v, i) => coarseKeys[`${v}`] = i)
    colorVals.forEach((v, i) => colorKeys[`${v}`] = i)

    return { fineKeys, coarseKeys, colorKeys }
}


const projectToPlotReadyData = (props: ProjectionCriteria): ProjectedData => {
    const { data, yVar, xVar, filterSettings, colorField, fineSplit, coarseSplit } = props
    const fineSplitVals = makeValsFromFieldname(fineSplit, filterSettings)
    const coarseSplitVals = makeValsFromFieldname(coarseSplit, filterSettings)
    const markedIds = filterSettings.markedRecords
    // We're going to be boorish and iterative here, because filtering properly would potentially involve
    // iterating over the entire database ~1000 times.
    // Instead, create a data structure with S x R x C buckets, where S = cardinality of field for colorCriteria,
    // R = cardinality of field for rowCriteria, C = cardinality of field for columnCriteria.
    // Then iterate over the data set once, computing appropriate bucket based on those values &
    // populating the resulting list as a flat list of x, y values based on the chosen fields.

    const { fineKeys, coarseKeys, colorKeys } = makeLookups(props.colorField, fineSplitVals, coarseSplitVals)
    const colorFieldIsCategorical = fieldIsCategorical(colorField)
    
    const buckets: number[][][] = new Array(Object.keys(coarseKeys).length).fill(0)
        .map(() => new Array(Object.keys(fineKeys).length).fill(0)
            .map(() => [] as number[]))
    const radius: number[][][] = new Array(Object.keys(coarseKeys).length).fill(0)
        .map(() => new Array(Object.keys(fineKeys).length).fill(0)
            .map(() => [] as number[]))
    const ids: PKType[][][] = new Array(Object.keys(coarseKeys).length).fill(NullId)
        .map(() => new Array(Object.keys(fineKeys).length).fill(NullId)
            .map(() => [] as PKType[]))
    const urls: string[][][] = new Array(Object.keys(coarseKeys).length).fill(NullId)
        .map(() => new Array(Object.keys(fineKeys).length).fill(NullId)
            .map(() => [] as string[]))
    const colorValues: number[][][] = new Array(Object.keys(coarseKeys).length).fill(0)
        .map(() => new Array(Object.keys(fineKeys).length).fill(0)
            .map(() => [] as number[]))

    // Precondition: Assume that every row of the data is actually supposed to be there, and we just need to slot
    // them into the right place. Filtering of out-of-scope values should have already taken place.
    data.forEach((record) => {
        const fineIdx   = (fineSplit   ?   fineKeys[record[fineSplit]]   : 0) ?? 0
        const coarseIdx = (coarseSplit ? coarseKeys[record[coarseSplit]] : 0) ?? 0
        const isSelected = markedIds?.has(record.uuid) ?? false
        buckets[coarseIdx][fineIdx].push(record[xVar])
        buckets[coarseIdx][fineIdx].push(record[yVar])
        radius[coarseIdx][fineIdx].push(isSelected ? dotMargin : dotMargin / 2)
        ids[coarseIdx][fineIdx].push(record.uuid)
        urls[coarseIdx][fineIdx].push(record.canonicalPath)
        if (colorFieldIsCategorical) {
            // TODO: See if this works with string-valued categorical variables, i.e. database-from.
            // That may need tweaking or another intermediation layer.
            colorValues[coarseIdx][fineIdx].push(colorField === undefined ? 1 : colorKeys[record[colorField]])
        } else {
            // Note: have to cast this to number because the type checker can't figure out that the string-valued
            // fields on ArtemissRecord are not valid values for the color field
            colorValues[coarseIdx][fineIdx].push(colorField === undefined ? 1 : record[colorField] as number)
        }
    })
    return { data: buckets, radius, colorValues, ids, urls, fineSplitVals, coarseSplitVals }
}


export default projectToPlotReadyData
