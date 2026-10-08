import { forceRecheck, updateFilters } from "@snState/filter"
import { DependentVariables, Fields, IndependentVariables, RangeVariables, ToggleableVariables, TripartiteVariables, getValuesFromBoolArray } from "@snTypes/DataDictionary"
import { allOnFilterState } from "@snTypes/Defaults"
import { ArtemissRecord, CategoricalIndex, CategoricalIndexSet, FilterControlState, FilterSettings, NavigatorDatabase, PKType } from "@snTypes/Types"

export const MAX_TABLE_RECORD_COUNT = 1000

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
            const withIndexes = refreshIndexes(newSettings)
            return rematerialize(a.database, withIndexes)
        }
        case "updateRange": {
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
            // // // console.log(`Settings-based focus set has ${newSettings.focusedRecordIds.size} records`)
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
            const newSelectionUrls = new Set<string>([...a.newSelections].map(newS => s.database?.byId[newS]?.canonicalPath ?? '') ?? [])
            return { ...s, markedRecords: a.newSelections, markedRecordUrls: newSelectionUrls }
        }
        case "updatePlotSplits": {
            return updatePlotSplits(s, a.target, a.newSplit)
        }
        case "updateFocusedPlotIndices": {
            // No-op case
            if (s.coarsePlotSelectedValue === a.newValues[0] && s.finePlotSelectedValue === a.newValues[1]) return s
            if (s.database === undefined) return s
            return updateFocusSet(s.database, { ...s, coarsePlotSelectedValue: a.newValues[0], finePlotSelectedValue: a.newValues[1] })
        }
        default: {
            throw Error(`Unknown reducer action ${JSON.stringify(a)}`)
        }
    }
}


const projectRecords = (db: NavigatorDatabase, recordIds: Set<number>): ArtemissRecord[] => {
    const projection: ArtemissRecord[] = []
    recordIds.forEach(id => projection.push(db.byId[id]))
    return projection
}


// TODO: IMPROVE PERFORMANCE OF SNTABLE UPDATE
// TODO: SET A HARD CEILING ON HOW MANY ROWS WE WILL RENDER FOR THE TABLE -- performance is fine up to 1k, but 35k is not fine

/// TODO: WHAT CAN WE DO TO AVOID RE-PROJECTING EVERYTHING EVERY TIME? *****
const rematerialize = (db: NavigatorDatabase, settings: FilterSettings): FilterSettings => {
    const withNewMarks = restrictMarksToFilteredInIds(settings)
    const correctedFocus = rationalizeFocusedPlot(db, withNewMarks)
    const newMaterialized = projectRecords(db, correctedFocus.recordIds)
    correctedFocus.records = newMaterialized
    return { ...correctedFocus }
}


const restrictMarksToFilteredInIds = (settings: FilterSettings): FilterSettings => {
    return {...settings, markedRecords: settings.markedRecords.intersection(settings.recordIds) }
}


const resolveUpdatedFilters = (settings: FilterSettings, active: FilterControlState, newFilters: FilterControlState) => {
    const db = settings.database
    if (db === undefined) return settings     // shouldn't happen; consider logging if it does
    
    const { added, dropped } = updateFilters(db, active, newFilters)
    const _dropped = dropped.intersection(settings.recordIds)
    const _added = added.difference(dropped)
    const withFilters = { ...settings, activeFilters: newFilters }

    if (_added.size != 0 || _dropped.size != 0) {
        withFilters.recordIds = withFilters.recordIds.union(_added).difference(_dropped)
        const withIndices = updateIndexes(db, withFilters, _added, _dropped)
        return rematerialize(db, withIndices)
    }

    return { ...withFilters }
}


const doRangesUpdate = (keys: RangeVariables[], newRanges: number[][], settings: FilterSettings): FilterSettings => {
    if (settings.database === undefined) return settings

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
    if (settings.database === undefined) return settings
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


const updateFocusSet = (db: NavigatorDatabase, settings: FilterSettings): FilterSettings => {
    const baseSet = settings.coarsePlotIndex ? settings.coarsePlotIndex[settings.coarsePlotSelectedValue ?? 'undef'] : settings.recordIds
    const fineIdx = settings.finePlotIndex ? settings.finePlotIndex[settings.finePlotSelectedValue ?? 'undef'] : undefined
    const finalSet = fineIdx ? baseSet.intersection(fineIdx) : baseSet

    const focusedIterator = finalSet[Symbol.iterator]()
    const setToMaterialize = finalSet.size > MAX_TABLE_RECORD_COUNT
        ? new Set(Iterator.from(focusedIterator).take(MAX_TABLE_RECORD_COUNT))
        : finalSet

    const focusedRecords = projectRecords(db, setToMaterialize)
    // TODO: DO NOT PROJECT ALL THE FOCUSED RECORDS
    // LIMIT TO LIKE FIRST 1K OR SOMETHING

    return { ...settings, focusedRecordIds: finalSet, focusedRecords }
}


const rationalizeFocusedPlot = (db: NavigatorDatabase, settings: FilterSettings): FilterSettings => {
    const newCoarse = settings.coarsePlotSplit === undefined
        ? settings.coarsePlotSelectedValue
        : selectedOrFirst(settings.coarsePlotSplit, settings.activeFilters[settings.coarsePlotSplit], settings.coarsePlotSelectedValue)
    const newFine = settings.finePlotSplit === undefined
        ? settings.finePlotSelectedValue
        : selectedOrFirst(settings.finePlotSplit, settings.activeFilters[settings.finePlotSplit], settings.finePlotSelectedValue)
    if (newCoarse !== settings.coarsePlotSelectedValue || newFine !== settings.finePlotSelectedValue) {
        const newFocus = { ...settings, coarsePlotSelectedValue: newCoarse, finePlotSelectedValue: newFine }
        return updateFocusSet(db, newFocus)
    }
    return updateFocusSet(db, settings)
}


const updatePlotSplits = (settings: FilterSettings, target: FacetSplitType, newSplit: ToggleableVariables | undefined): FilterSettings => {
    // because of the dropdown select interface, this is sometimes passed a literal string value of "undefined" :(
    const splitUndefined = newSplit === undefined || ("undefined" === newSplit as string)
    const value = splitUndefined ? undefined : (Fields[newSplit]?.values ?? [])[settings.activeFilters[newSplit].findIndex(x => x)]
    let newSettings = settings
    switch(target) {
        case 'coarse':
            newSettings = { ...settings, coarsePlotSplit: newSplit, coarsePlotSelectedValue: value }
            break
        case 'fine':
            newSettings = { ...settings, finePlotSplit: newSplit, finePlotSelectedValue: value }
            break
        default:
            throw Error('Unsupported update-plot-split target.')
    }
    return refreshIndexes(newSettings)
}


// PRECONDITION: adds set and drops set are non-overlapping.
const updateIndexes = (db: NavigatorDatabase, settings: FilterSettings, adds: Set<number>, drops: Set<number>) => {
    // NOTE: It might be faster to materialize the adds/drops to avoid repeated comparisons for
    // the set operations, but I suspect it's close enough to not be worth the headache.
    // REVISIT THIS if performance demands it.
    if (drops.size > 0) { 
        if (settings.coarsePlotSplit && settings.coarsePlotIndex) {
            _dropFromIndex(settings.coarsePlotIndex, drops)
        }
        if (settings.finePlotSplit && settings.finePlotIndex) {
            _dropFromIndex(settings.finePlotIndex, drops)
        }
    }
    // NOTE: most likely these are mutually exclusive branches but we can't be sure
    // It is assumed that the cost of looking up the rows is cheaper than the cost of doing full
    // intersection of the selections on the main indices for every value.
    if (adds.size > 0) {
        const addRows = projectRecords(db, adds)
        const coarseUpdate = _indexAdder(settings.coarsePlotSplit, settings.coarsePlotIndex)
        const fineUpdate = _indexAdder(settings.finePlotSplit, settings.finePlotIndex)
        addRows.forEach(row => {
            coarseUpdate(row)
            fineUpdate(row)
        })
    }

    return { ...settings, coarsePlotIndex: { ...settings.coarsePlotIndex }, finePlotIndex: { ...settings.finePlotIndex } }
}


const _dropFromIndex = (idx: CategoricalIndex, drops: Set<number>) => {
    let fieldDrops = new Set(drops)
    Object.keys(idx).forEach(v => {
        const inter = fieldDrops.intersection(idx[v])
        idx[v] = idx[v].difference(inter)
        fieldDrops = fieldDrops.difference(inter)
    })
}


const _indexAdder = (field: ToggleableVariables | undefined, idx: CategoricalIndex | undefined) => {
    if (field === undefined || idx === undefined) {
        return () => {}
    }
    return (row: ArtemissRecord) => {
        const v = row[field]
        v && v !== '' && idx[v].add(row.rowid)
    }
}


// PRECONDITION: record ID set must actually be populated.
const refreshIndexes = (settings: FilterSettings) => {
    const db = settings.database
    if (db === undefined) return settings
    const cidx = settings.coarsePlotSplit
        ? remakeIndex(db, settings.coarsePlotSplit as any as keyof CategoricalIndexSet)
        : undefined
    const fidx = settings.finePlotSplit
        ? remakeIndex(db, settings.finePlotSplit as any as keyof CategoricalIndexSet)
        : undefined

    const rows = projectRecords(db, settings.recordIds)
    rows.forEach(r => {
        if (settings.coarsePlotSplit !== undefined && cidx !== undefined) {
            cidx[r[settings.coarsePlotSplit]].add(r.rowid)
        }
        if (settings.finePlotSplit !== undefined && fidx !== undefined) {
            fidx[r[settings.finePlotSplit]].add(r.rowid)
        }
    })

    return { ...settings, coarsePlotIndex: cidx, finePlotIndex: fidx }
}


const remakeIndex = (db: NavigatorDatabase, idxKey: keyof CategoricalIndexSet): CategoricalIndex => {
    const idx = db.categoricalIndexes[idxKey]
    const newidx = Object.fromEntries([])
    Object.keys(idx).forEach(v => newidx[v] = new Set<number>())
    return newidx
}


export default NavigatorReducer


// TODO: REVISIT: it may have an example of a way to remove the distinction b/w ToggleableVariables and CategoricalIndexSet keys
// // // const updateFocusSet = (settings: FilterSettings, force: boolean = false): FilterSettings => {
// // //     const db = settings.database
// // //     if (db === undefined) return settings   // TODO make a higher-up boundary for this already
// // //     // TODO: Rationalize this, remove the distinction between ToggleableVariables and CategoricalIndexSet keys
// // //     const coarseSplit = settings.coarsePlotSplit as any as undefined | keyof CategoricalIndexSet
// // //     const fineSplit = settings.finePlotSplit as any as undefined | keyof CategoricalIndexSet

// // //     // TODO might be a neater way to write this
// // //     const coarseIdx = coarseSplit ? settings.selectionCategoricalIndices[coarseSplit][settings.coarsePlotSelectedValue ?? ''] : undefined
// // //     const fineIdx = fineSplit ? settings.selectionCategoricalIndices[fineSplit][settings.finePlotSelectedValue ?? ''] : undefined

// // //     const baseSet = coarseIdx ?? settings.recordIds
// // //     const finalSet = fineIdx ? baseSet.intersection(fineIdx) : baseSet

// // //     // TODO: I think this might be a possible source of errors if alternating between 2 equal-sized sets?
// // //     if (finalSet.size === settings.focusedRecordIds.size && !force) return settings

// // //     return { ...settings, focusedRecordIds: finalSet, focusedRecords: projectRecords(db, finalSet) }
// // // }
