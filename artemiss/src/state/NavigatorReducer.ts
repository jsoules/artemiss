import { forceRecheck, updateFilters } from "@snState/filter"
import { DependentVariables, Fields, IndependentVariables, RangeVariables, ToggleableVariables, TripartiteVariables, getValuesFromBoolArray } from "@snTypes/DataDictionary"
import { allOnFilterState } from "@snTypes/Defaults"
import { ArtemissRecord, FilterControlState, FilterSettings, NavigatorDatabase, PKType } from "@snTypes/Types"

export type FacetSplitType = 'coarse' | 'fine'

export type NavigatorStateAction = {
    type: 'initialize',
    database: NavigatorDatabase
} | {
    type: 'updateRange',
    field: RangeVariables,
    newRange: number[]
} | {
    type: 'updateRanges',
    fields: RangeVariables[],
    newRanges: number[][]
} | {
    type: 'resetRange',
    field: RangeVariables
} | {
    type: 'updateCheckField',
    field: ToggleableVariables,
    index: number,
    targetState: boolean
} | {
    type: 'updateTripartiteField',
    field: TripartiteVariables,
    newValue: number | undefined
} | {
    type: 'updateDependentVariable',
    newValue: DependentVariables
} | {
    type: 'updateIndependentVariable',
    newValue: IndependentVariables
} | {
    type: 'updateMarkedRecords',
    newSelections: Set<PKType>
} | {
    type: 'updatePlotSplits',
    newSplit: (ToggleableVariables | undefined)
    target: FacetSplitType
} | {
    type: 'updateFocusedPlotIndices',
    newValues: (string | undefined)[]
}


const NavigatorReducer = (s: FilterSettings, a: NavigatorStateAction): FilterSettings => {
    switch (a.type) {
        case "initialize": {
            if (a.database.list.length === 0) return s  // tests for this being the initialDatabase, b/c the real one hasn't loaded yet
            s.database = a.database
            const newSettings = resolveUpdatedFilters(s, allOnFilterState, s.activeFilters)
            newSettings.recordIds = forceRecheck(s.database)
            return newSettings
        }
        case "updateRange": {
            console.log(`activating range update field ${a.field} new range ${a.newRange}`)
            const newSettings = doRangesUpdate([a.field], [a.newRange], s)
            return newSettings
        }
        //// TODO: NANS! NANS ARE BREAKING THE RANGE FILTER
        /// TODO ADD A STEP TO JUST FLIP THEIR BITS PERMANENTLY ON (actually that only matters once we default-off)
        case "updateRanges": {
            const newSettings = doRangesUpdate(a.fields, a.newRanges, s)
            return newSettings
        }
        case "resetRange": {
            const newRange = Fields[a.field]?.range ?? [-1, 1]
            const newSettings = doRangesUpdate([a.field], [newRange], s)
            return newSettings
        }
        case "updateCheckField": {
            const newSettings = updateBooleanList(a.field, a.index, a.targetState, s)
            return newSettings
        }
        // case "updateTripartiteField": {
        //     return updateTripart(a.field, s, a.newValue)
        // }
        case "updateDependentVariable": {
            return { ...s, dependentVariable: a.newValue }
        }
        case "updateIndependentVariable": {
            return { ...s, independentVariable: a.newValue }
        }
        case "updateMarkedRecords": {
            // const newSelectionUrls = s.database.
            const newSelectionUrls = new Set<string>([...a.newSelections].map(newS => s.database?.byId[newS]?.canonicalPath ?? '') ?? [])
            return { ...s, markedRecords: a.newSelections, markedRecordUrls: newSelectionUrls }
        }
        case "updatePlotSplits": {
            return updatePlotSplits(s, a.target, a.newSplit)
        }
        case "updateFocusedPlotIndices": {
            return { ...s, coarsePlotSelectedValue: a.newValues[0], finePlotSelectedValue: a.newValues[1] }
        }
        default: {
            throw Error(`Unknown reducer action ${JSON.stringify(a)}`)
        }
    }
}

// TODO: IMPROVE PERFORMANCE OF SNTABLE UPDATE

/// TODO: WHAT CAN WE DO TO AVOID RE-PROJECTING EVERYTHING EVERY TIME? *****
const rematerialize = (db: NavigatorDatabase, settings: FilterSettings): FilterSettings => {
    const withNewMarks = restrictMarksToFilteredInIds(settings)
    const correctedFocus = rationalizeFocusedPlot(withNewMarks)
    const newMaterialized = projectRecords(db, correctedFocus)
    correctedFocus.records = newMaterialized
    return { ...correctedFocus }
}


const restrictMarksToFilteredInIds = (settings: FilterSettings): FilterSettings => {
    return {...settings, markedRecords: settings.markedRecords.intersection(settings.recordIds) }
}


const projectRecords = (db: NavigatorDatabase, settings: FilterSettings): ArtemissRecord[] => {
    const projection: ArtemissRecord[] = []
    settings.recordIds.forEach(id => projection.push(db.byId[id]))
    return projection
}


const resolveUpdatedFilters = (settings: FilterSettings, active: FilterControlState, newFilters: FilterControlState) => {
    if (settings.database === undefined) return settings     // shouldn't happen; consider logging if it does
    
    const { added, dropped } = updateFilters(settings.database, active, newFilters)
    const withFilters = { ...settings, activeFilters: newFilters }

    if (added.size != 0 || dropped.size != 0) {
        const existingSetSize = withFilters.recordIds.size
        withFilters.recordIds = withFilters.recordIds.union(added).difference(dropped)
        // Need to reproject if we added anything, or if we dropped anything that was already in the set.
        if (added.size > 0 || existingSetSize !== withFilters.recordIds.size) {
            return rematerialize(settings.database, withFilters)
        }
    }

    return { ...withFilters }
}


const doRangesUpdate = (keys: RangeVariables[], newRanges: number[][], settings: FilterSettings): FilterSettings => {
    const updateList = keys.map((k, i) => {
            const existingRange = settings.activeFilters[k]
            if (existingRange.length !== 2) {
                throw Error(`Error attempting to update misconfigured range ${k} (currently ${existingRange[0]}, ${existingRange[1]})`)
            }
            const newRange = [Math.min(...newRanges[i]), Math.max(...newRanges[i])] as const
            return (newRange[0] === existingRange[0] && newRange[1] === existingRange[1])
                ? undefined
                : [k, newRange] as const
        }).filter(x => x !== undefined)
    if (updateList.length === 0) return settings    // nothing happened so keep reference equality
    // triggers if e.g. user clicked "reset range" on a range that was already at default

    const toUpdate = Object.fromEntries(updateList)
    const newFilters = { ...settings.activeFilters, ...toUpdate }

    return resolveUpdatedFilters(settings, settings.activeFilters, newFilters)
}


const updateBooleanList = (key: ToggleableVariables, index: number, newState: boolean, settings: FilterSettings): FilterSettings => {
    if (!(key in settings.activeFilters)) {
        throw Error(`Initialization error for boolean filter for ${key}.`)
    }
    const rightLength = (Fields[key].values ?? []).length
    const current = settings.activeFilters[key]
    const reset = current.length !== rightLength    // handles initialization
    const newSelections: boolean[] = reset ? new Array<boolean>(rightLength).fill(false)
                                           : index === -1
                                                ? new Array<boolean>(rightLength).fill(newState)
                                                : [...current]
    if (index >= 0) {
        newSelections[index] = newState
    }
    const newFilters = { ...settings.activeFilters }
    newFilters[key] = newSelections

    return resolveUpdatedFilters(settings, settings.activeFilters, newFilters)
}


const selectedOrFirst = (field: ToggleableVariables, choices: boolean[], selected: string | undefined): string | undefined => {
    const setVals = getValuesFromBoolArray(field, choices)
    if (setVals.length === 0) return undefined
    return selected != undefined && setVals.includes(selected) ? selected : setVals[0]
}


const rationalizeFocusedPlot = (settings: FilterSettings): FilterSettings => {
    const newCoarse = settings.coarsePlotSplit === undefined
        ? settings.coarsePlotSelectedValue
        : selectedOrFirst(settings.coarsePlotSplit, settings.activeFilters[settings.coarsePlotSplit], settings.coarsePlotSelectedValue)
    const newFine = settings.finePlotSplit === undefined
        ? settings.finePlotSelectedValue
        : selectedOrFirst(settings.finePlotSplit, settings.activeFilters[settings.finePlotSplit], settings.finePlotSelectedValue)
    if (newCoarse !== settings.coarsePlotSelectedValue || newFine !== settings.finePlotSelectedValue) {
        return { ...settings, coarsePlotSelectedValue: newCoarse, finePlotSelectedValue: newFine }
    }
    return settings
}


const updatePlotSplits = (settings: FilterSettings, target: FacetSplitType, newSplit: ToggleableVariables | undefined): FilterSettings => {
    // because of the dropdown select interface, this is sometimes passed a literal string value of "undefined" :(
    const splitUndefined = newSplit === undefined || ("undefined" === newSplit as string)
    const value = splitUndefined ? undefined : (Fields[newSplit]?.values ?? [])[settings.activeFilters[newSplit].findIndex(x => x)]
    switch(target) {
        case 'coarse':
            return { ...settings, coarsePlotSplit: newSplit, coarsePlotSelectedValue: value }
        case 'fine':
            return { ...settings, finePlotSplit: newSplit, finePlotSelectedValue: value }
        default:
            throw Error('Unsupported update-plot-split target.')
    }
}


export default NavigatorReducer
