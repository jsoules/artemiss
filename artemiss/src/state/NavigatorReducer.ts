import { projectRecords, restrictMarksToFilteredInIds, updateFilters } from "@snState/filter"
import { DependentVariables, Fields, IndependentVariables, RangeVariables, ToggleableVariables, TripartiteVariables, getValuesFromBoolArray } from "@snTypes/DataDictionary"
import { allOnFilterState } from "@snTypes/Defaults"
import { FilterControlState, FilterSettings, NavigatorDatabase, PKType } from "@snTypes/Types"

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
            s.database = a.database
            s.needsReprojection = true
            const newSettings = resolveUpdatedFilters(s, allOnFilterState, s.activeFilters)
            return rematerialize(newSettings)
            // const newSet = applyFiltersToSet(s, a.database) FIXME
            // const newRecords = projectRecords(newSet, a.database)
            // return { ...s, database: a.database, recordIds: newSet, records: newRecords }
        }
        case "updateRange": {
            const newSettings = doRangesUpdate([a.field], [a.newRange], s)
            return rematerialize(newSettings)
            // return updateRange(a.field, a.newRange, s)  FIXME
        }
        case "updateRanges": {
            const newSettings = doRangesUpdate(a.fields, a.newRanges, s)
            return rematerialize(newSettings)
            // return updateRanges(a.fields, a.newRanges, s)   FIXME
        }
        case "resetRange": {
            const newRange = Fields[a.field]?.range ?? [-1, 1]
            const newSettings = doRangesUpdate([a.field], [newRange], s)
            return rematerialize(newSettings)
            // return resetRange(a.field, s)   FIXME
        }
        case "updateCheckField": {
            const newSettings = updateBooleanList(a.field, a.index, a.targetState, s)
            return rematerialize(newSettings)
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


/// TODO: WHAT CAN WE DO TO AVOID RE-PROJECTING EVERYTHING EVERY TIME? *****
const rematerialize = (settings: FilterSettings): FilterSettings => {
    if (settings.database !== undefined) {  // shouldn't happen
        if (settings.needsReprojection) {
            const newMarks = restrictMarksToFilteredInIds(settings.markedRecords, settings.recordIds)
            const newMaterialized = projectRecords(settings.recordIds, settings.database)
            const correctedFocus = rationalizeFocusedPlot(settings)
            return { ...correctedFocus, records: newMaterialized, markedRecords: newMarks, needsReprojection: false }
        }
    }

    return settings
}


const resolveUpdatedFilters = (settings: FilterSettings, active: FilterControlState, newFilters: FilterControlState) => {
    if (settings.database === undefined) return settings     // shouldn't happen; consider logging if it does
    
    const { added, dropped } = updateFilters(settings.database, active, newFilters)

    if (added.size != 0 || dropped.size != 0) {
        settings.recordIds = settings.recordIds.union(added).difference(dropped)
        settings.needsReprojection = true
    }
    settings.activeFilters = newFilters

    return { ...settings }
}


const doRangesUpdate = (keys: RangeVariables[], newRanges: number[][], settings: FilterSettings): FilterSettings => {
    // if (settings.database === undefined) return settings    // shouldn't happen; consider logging if it does
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
    // const { added, dropped } = updateFilters(settings.database, settings.activeFilters, newFilters)

    // if (added.size != 0 || dropped.size != 0) {
    //     settings.recordIds = settings.recordIds.union(added).difference(dropped)
    //     settings.needsReprojection = true
    // }
    // settings.activeFilters = newFilters

    // return { ...settings }
}


const updateBooleanList = (key: ToggleableVariables, index: number, newState: boolean, settings: FilterSettings): FilterSettings => {
    if (!(key in settings.activeFilters)) {
        throw Error(`Initialization error for boolean filter for ${key}.`)
    }
    // if (settings.database === undefined) return settings    // shouldn't happen

    const rightLength = (Fields[key].values ?? []).length
    const current = settings.activeFilters[key]
    const reset = current.length !== rightLength    // handles initialization
    const newSelections: boolean[] = reset ? new Array<boolean>(rightLength).fill(false)
                                           : index === -1
                                                ? new Array<boolean>(rightLength).fill(newState)
                                                : current
    if (index >= 0) {
        newSelections[index] = newState
    }

    const newFilters = { ...settings.activeFilters }
    newFilters[key] = newSelections

    return resolveUpdatedFilters(settings, settings.activeFilters, newFilters)
    // const { added, dropped } = updateFilters(settings.database, settings.activeFilters, newFilters)
    // if (added.size != 0 || dropped.size != 0) {
    //     settings.recordIds = settings.recordIds.union(added).difference(dropped)
    //     settings.needsReprojection = true
    // }
    // settings.activeFilters = newFilters

    // return { ...settings }
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




// const applyUpdatedFilters = (settings: FilterSettings, ignoreSizeCheck: boolean = false): FilterSettings => {
//     // having updated a filter, we may need to update the selections.
//     if (settings.database !== undefined) { // Shouldn't happen
//         // TODO: Condition which input to use (the full database vs. the current set)
//         // based on whether our selections got more or less restrictive
//         // // // const newSet = applyFiltersToSet(settings, settings.database, settings.database.allIdSet)
//         // Cheat: we're using the size of the selected record set as a proxy for set change,
//         // since no single interaction allows you to select an entirely different set of the same size.
//         const updateRecords = newSet.size !== settings.recordIds.size
//         const newMarks = restrictMarksToFilteredInIds(settings.markedRecords, newSet)
//         if (updateRecords || ignoreSizeCheck) {
    //             const settingsWithCorrectedFocusPlot = rationalizeFocusedPlot(settings)
    //             const newMaterializedRecords = projectRecords(newSet, settings.database)
    //             return { ...settingsWithCorrectedFocusPlot, recordIds: newSet, records: newMaterializedRecords, markedRecords: newMarks }
    //         }
//     }

//     return settings
// }

// const doSingleRangeUpdate = (key: RangeVariables, newRange: number[], settings: FilterSettings): FilterSettings => {
//     const existingRange = settings.activeFilters[key]
//     if (existingRange.length !== 2) {
//         throw Error(`Error attempting to update non-extant/misconfigured range ${key} (currently ${existingRange[0]}, ${existingRange[1]})`)
//     }
//     if (newRange[0] === existingRange[0] && newRange[1] === existingRange[1]) {
//         // no change, return reference equality. e.g. user clicks "reset" for already-default range.
//         return settings
//     }
//     if (settings.database === undefined) return settings    // shouldn't happen, maybe should log about it if it does?

//     const newFilters = { ...settings.activeFilters, key: [Math.min(...newRange), Math.max(...newRange)] }
//     const { added, dropped } = updateFilters(settings.database, settings.activeFilters, newFilters)

//     if (added.size != 0 || dropped.size != 0) {
//         settings.recordIds = settings.recordIds.union(added).difference(dropped)
//         settings.needsReprojection = true
//     }
//     settings.activeFilters[key] = [Math.min(...newRange), Math.max(...newRange)]

//     return settings
// }

// const updateRange = (key: RangeVariables, newRange: number[], settings: FilterSettings) => {
//     const newSettings = { ...doSingleRangeUpdate(key, newRange, settings) }
//     return rematerialize(newSettings)
// }


// const updateRanges = (keys: RangeVariables[], newRanges: number[][], settings: FilterSettings) => {
//     if (keys.length !== newRanges.length) throw Error("updateRanges called with different number of keys and ranges.")

//     let newSettings = { ...settings }
//     keys.forEach((k, i) => {
//         newSettings = doSingleRangeUpdate(k, newRanges[i], newSettings)
//     })

//     return rematerialize(newSettings)
// }


// const resetRange = (key: RangeVariables, settings: FilterSettings) => {
//     const newRange = Fields[key]?.range ?? [-1, 1]
//     return updateRange(key, newRange, settings)
// }


// const updateTripart = (key: TripartiteVariables, settings: FilterSettings, newValue: number | undefined) => {
//     const existingValue = settings[key]
//     if (existingValue === newValue) return settings
//     const newSettings = { ...settings }
//     newSettings[key] = newValue

//     // Note we CANNOT use size as a proxy here, because flipping one of these could conceivably actually
//     // create two distinct sets of different size.
//     return rematerialize(newSettings, true)
// }
