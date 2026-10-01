import { CategoricalIndexedFields, Fields, RangeVariables, ToggleableVariables, getValuesFromBoolArray } from "@snTypes/DataDictionary"
import { ArtemissRecord, CategoricalIndexSet, FilterControlState, FilterSettings, NavigatorDatabase, PKType, RangeIndex } from "@snTypes/Types"

// TODO: IMPROVE FILTERING PERFORMANCE
// we now have O(40) range filters (which are all basically the same)
// meaning we may be iterating over the ENTIRE 170k DATABASE upwards
// of 40 times, this is probably BAD and is definitely causing
// noticeable performance challenges

export const projectRecords = (selection: Set<PKType>, database: NavigatorDatabase | undefined) => {
    if (database === undefined) return []
    const projection: ArtemissRecord[] = []
    selection.forEach(s => projection.push(database.byId[s]))
    return projection
}


const binSearch = (ary: Float64Array, target: number, mode: 'gte' | 'lte'): number => {
    // given an array and a target, search for the first index just above (gte) or below (lte) the target.
    // We are returning INCLUSIVE results, so in the unlikely event we actually find the searched-for
    // value, we will return that index directly.
    // if not found, return -1.
    // PRECONDITION: ary should be sorted.
    let lowerIdx = 0
    let upperIdx = ary.length - 1
    let guessIdx = -1
    let diff = upperIdx - lowerIdx
    if (ary[lowerIdx] > target || ary[upperIdx] < target) return guessIdx

    while (diff > 1) {
        diff = Math.floor(diff / 2)
        guessIdx = lowerIdx + diff
        const guess = ary[guessIdx]
        if (guess === target) return guessIdx
        lowerIdx = guess <= target ? guessIdx : lowerIdx
        upperIdx = guess > target ? guessIdx : upperIdx
    }
    // upperIdx always points to something greater than target,
    // lowerIdx always points to something lesser than target.
    // If we exit the loop, upperIdx - lowerIdx = 1, so the target
    // must fall between the two.
    // To get the index for an inclusive interval, return upper
    // if we want something above, and lower if we want something below.
    return mode === 'gte' ? upperIdx : lowerIdx
}


// TODO: PKType? But we really can't do this with string types.
const materializeRange = (idx: RangeIndex, newRange: number[]): Set<number> => {
    const lowerIdx = binSearch(idx.val, newRange[0], 'gte')
    const upperIdx = binSearch(idx.val, newRange[1], 'lte')
    return new Set(idx.rowid.slice(lowerIdx, upperIdx + 1)) // slice is exclusive on the upper end
}


const expandedFilter = (database: NavigatorDatabase, filterKey: RangeVariables | ToggleableVariables, allNew: Set<number>): Set<number> => {
    const mask = database.masks[filterKey].inmask
    const nowIncluded: number[] = []
    allNew.forEach(rowid => {
        database.rowSelectionStatus[rowid] |= mask
        if (database.rowSelectionStatus[rowid] === database.fullApproval) {
            nowIncluded.push(rowid)
        }
    })

    return new Set(nowIncluded)
}


const contractFilter = (database: NavigatorDatabase, filterKey: RangeVariables | ToggleableVariables, allRemoved: Set<number>) => {
    const mask = database.masks[filterKey].outmask
    allRemoved.forEach(rowid => database.rowSelectionStatus[rowid] &= mask)
}


const rangeFilter = (database: NavigatorDatabase, f: RangeVariables, r: number[][]) => {
    return r.map(r => materializeRange(database.rangeIndexes[f], r)
            ).reduce((a, b) => a.union(b), new Set<number>())
}


// TODO combine the expand/contract fns?

const expandRangeFilter = (database: NavigatorDatabase, filterKey: RangeVariables, newRange: number[][]) => {
    // NOTE: newRange will go ONLY [new: old] and [old: new]
    // i.e. it will NOT include anything that was included-in by the existing filter settings
    // (except that we're going to get a fencepost there)

    // Identify newly added elements
    const allNew = rangeFilter(database, filterKey, newRange)
    // const newLower = materializeRange(database.rangeIndexes[filterKey], newRange[0])
    // const allNew = newRange.length === 1
    //     ? newLower
    //     : newLower.union(materializeRange(database.rangeIndexes[filterKey], newRange[1]))

    return expandedFilter(database, filterKey, allNew)
}


const contractRangeFilter = (database: NavigatorDatabase, filterKey: RangeVariables, newRange: number[][]) => {
    // const allDrop = newRange.map(r => materializeRange(database.rangeIndexes[filterKey], r)).reduce((a, b) => a.union(b), new Set<number>())
    const allDrop = rangeFilter(database, filterKey, newRange)
    contractFilter(database, filterKey, allDrop)
    return allDrop
}


const boolFilter = (database: NavigatorDatabase, filterKey: ToggleableVariables, sel: boolean[]) => {
    const idx = database.categoricalIndexes[filterKey as unknown as keyof CategoricalIndexSet] // TODO REMOVE FILTER ONCE ALL TOGGLEABLES ARE INDEXED
    const vals = getValuesFromBoolArray(filterKey, sel)
    const sets = vals.map(v => idx[v])
    // const union = new Set(sets.reduce((curr: PKType[], newSet) => [...curr, ...(newSet || [])], []))
    const union = sets.reduce((curr, newSet) => curr.union(newSet)) // TODO COULD THROW ERROR IF NO SETS

    return union
}


const expandBoolFilter = (database: NavigatorDatabase, filterKey: ToggleableVariables, newSelections: boolean[]) => {
    const allNew = boolFilter(database, filterKey, newSelections)
    return expandedFilter(database, filterKey, allNew)
}


const contractBoolFilter = (database: NavigatorDatabase, filterKey: ToggleableVariables, droppedSelections: boolean[]) => {
    const allDropped = boolFilter(database, filterKey, droppedSelections)
    contractFilter(database, filterKey, allDropped)
    return allDropped
}


export const updateFilters = (database: NavigatorDatabase, oldFilters: FilterControlState, newFilters: FilterControlState) => {

    // TODO NOTE FIXME FORCIBLY CUTTING OUT THE STELLSYM AND ENFORCEVACUUM FIELDS
    // Update boolean filters
    const boolDeltas = (Object.keys(CategoricalIndexedFields)).map((f) => {
        const _f = f as any as ToggleableVariables
        const adds = newFilters[_f].map((e, i) => e && !oldFilters[_f][i])
        const drops = newFilters[_f].map((e, i) => !e && oldFilters[_f][i])
        if (adds.every(x => !x) && drops.every(x => !x)) return undefined
        return { field: _f, adds, drops }
    }).filter(x => x !== undefined)

    let dropUnion = boolDeltas.map(v => contractBoolFilter(database, v.field, v.drops)).reduce((a, b) => a.union(b), new Set<number>())
    // NOTE: Need to keep the addUnion in, b/c some items may become filtered-in by earlier steps.
    // Ones that were not fully filtered in by the first update will be caught later (or remain properly filtered out),
    // but otherwise we only catch something the *first* time its status updates so that it gets filtered in.
    let addUnion = boolDeltas.map(v => expandBoolFilter(database, v.field, v.adds)).reduce((a, b) => a.union(b), new Set<number>())

    const rangeDeltas = (Object.keys(RangeVariables)).map((f) => {
        const _f = f as RangeVariables
        const oldRange = oldFilters[_f]
        const newRange = newFilters[_f]
        let addedRange: number[][] = []
        let droppedRange: number[][] = []
        if (oldRange[0] > newRange[0]) {
            addedRange.push([newRange[0], oldRange[0]])
        }
        if (oldRange[0] < newRange[0]) {
            droppedRange.push([oldRange[0], newRange[0]])
        }
        if (oldRange[1] < newRange[1]) {
            addedRange.push([oldRange[1], newRange[1]])
        }
        if (oldRange[1] > newRange[1]) {
            droppedRange.push([newRange[1], oldRange[1]])
        }
        if (addedRange.length === 0 && droppedRange.length === 0) return undefined
        return { field: _f, addedRange, droppedRange }
    }).filter(x => x !== undefined)

    // Update range filters
    rangeDeltas.map(v => contractRangeFilter(database, v.field, v.droppedRange)).reduce((a, b) => a.union(b), dropUnion)
    rangeDeltas.map(v => expandRangeFilter(database, v.field, v.addedRange)).reduce((a, b) => a.union(b), addUnion)

    // TODO: tripartite support

    // TODO: HANDLING OF NON-INDEXED BOOLEAN FIELDS IE STELLSYM, ENFORCEVACUUM

    // database state has been updated, return the new selection set
    return { added: addUnion, dropped: dropUnion }
}


// TODO: DEBOUNCE?
export const applyFiltersToSet = (filters: FilterSettings, database: NavigatorDatabase, set?: Set<PKType>): Set<PKType> => {
    const boolSets = makeBooleanFilters(database).map(b => {
        const { key, callback } = b
        const choices = filters.activeFilters[key]
        return callback(choices)
    })
    // const selectionSets = makeSelectionFilters(database).map(f => {
    //     const { key, callback } = f
    //     // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    //     const val = filters[key as TripartiteVariables]
    //     return callback(val)
    // })
    // const allSets = [set, ...boolSets, ...selectionSets].filter(s => s !== undefined) as Set<number>[]
    const allSets = [set, ...boolSets].filter(s => s !== undefined) as Set<PKType>[]
    const indexIntersectionSet = allSets.reduce((a, b) => a.intersection(b))
    // Repeatedly projecting and re-set-ifying isn't ideal but
    const materializedRows = projectRecords(indexIntersectionSet, database)
    const rangeTests = rangeFilters.map(r => {
        const { key, callback } = r
        const valueRange = filters.activeFilters[key]
        return callback(valueRange)
    })
    const finalSet = new Set(materializedRows.filter(r => rangeTests.every(test => test(r))).map(r => r.rowid))
    return finalSet
}


// type BooleanAddDrops = { allAdds: boolean[][], allDrops: boolean[][] }
// const getBooleanAddDrops = (newFilters: FilterControlState, oldFilters: FilterControlState): BooleanAddDrops => {
//     let allAdds: boolean[][] = []
//     let allDrops: boolean[][] = []

//     booleanFields.forEach(f => {
//         const adds = newFilters[f].map((e, i) => e && !oldFilters[f][i])
//         const drops = newFilters[f].map((e, i) => !e && oldFilters[f][i])
//         allAdds.push(adds)
//         allDrops.push(drops)
//     })
//     return { allAdds, allDrops }
// }


// const getBooleanDifference = (addDrops: BooleanAddDrops, current: Set<PKType>, database: NavigatorDatabase): { added: Set<PKType>, kept: Set<PKType> } => {
//     const boolFilters = makeBooleanFilters(database).filter(x => x !== undefined)
//     let allAdds = new Set<PKType>()
//     let allDrops = new Set<PKType>()

//     boolFilters.forEach((b, i) => {
//         const added = b.callback(addDrops.allAdds[i])
//         const drops = b.callback(addDrops.allDrops[i])
//         if (added !== undefined) {
//             allAdds = allAdds.union(added)
//         }
//         if (drops !== undefined) {
//             allDrops = allDrops.union(drops)
//         }
//     })
//     return { added: allAdds, kept: current.difference(allDrops) }
// }


// const getRangeAddDrops = (newFilters: FilterControlState, oldFilters: FilterControlState) => {
//     let adds = new Set<PKType>()
//     let drops = new Set<PKType>()

//     // const toCheck = 



// }


// export const applyUpdatedFilters = (newFilters: FilterControlState, oldFilters: FilterControlState, database: NavigatorDatabase): Set<PKType> => {
//     const boolSets = makeBooleanFilters(database).map(b => {
//         const { key, callback } = b
//         const choices = newFilters[key]
//         return callback(choices)
//     })

// }


export const restrictMarksToFilteredInIds = (currentMarks: Set<PKType>, filteredIn: Set<PKType>): Set<PKType> => {
    if (currentMarks.size === 0 || filteredIn.size === 0) return new Set()
    // return intersect(currentMarks, filteredIn)
    return currentMarks.intersection(filteredIn)
}


// Filter setup
const makeBooleanFilter = (key: ToggleableVariables, db: NavigatorDatabase) => {
    const callback = (choices: boolean[]) => {
        if (choices.every(c => c) || choices.every(c => !c)) {
            return undefined
        }
        const vals = getValuesFromBoolArray(key, choices)
        const idx = db.categoricalIndexes[key as unknown as keyof CategoricalIndexSet]
        const sets = vals.map(v => idx[v])
        const union = new Set(sets.reduce((curr: PKType[], newSet) => [...curr, ...(newSet || [])], []))
        return union
    }
    return {key, callback}
}
// const booleanFields: ToggleableVariables[] = [ToggleableVariables.MEAN_IOTA, ToggleableVariables.NFP, ToggleableVariables.NC_PER_HP, ToggleableVariables.N_SURFACES]
const booleanFields: ToggleableVariables[] = [ToggleableVariables.NFP, ToggleableVariables.DATABASE_FROM]
const makeBooleanFilters = (database: NavigatorDatabase) => booleanFields.map(f => makeBooleanFilter(f, database))
// NOTE: boolean filters can't be pre-populated, because we need to look up values from the categorical index sets,
// which are not known at compile time--they have to be populated from the data.
// We could maybe wrap this setup in an effect hook, but it's not worth the complication.


const makeRangeFilter = (key: RangeVariables) => {
    const callback = (range: number[]) => {
        if (range.length === 0) {
            return () => true
        }
        if (range.length !== 2) {
            throw Error(`Attempt to apply range filter with ill-formed range ${JSON.stringify(range)}`)
        }
        const valRange = Fields[key].range
        const noOp = range[0] <= valRange[0] && range[1] >= valRange[1]
        if (noOp) return () => true
        // need to filter-in the NaN values for keys
        return (row: ArtemissRecord) => 
            (row[key] >= range[0] && row[key] <= range[1]) || isNaN(row[key])
    }
    return {key, callback}
}
const rangeFilters = Object.values(RangeVariables).filter(rv => isNaN(Number(rv))).map(f => makeRangeFilter(f as RangeVariables))


// We don't actually have any tripartite variables in the Artemiss dataset
// const makeSelectionFilter = (key: TripartiteVariables, db: NavigatorDatabase) => {
//     const callback = (value?: number) => {
//         if (value === undefined) return undefined
//         const vals = Fields[key].range
//         if (!(vals.includes(value))) {
//             throw Error(`Attempt to filter ${key} with unknown value ${value}, known range ${Fields[key].range[0]}, ${Fields[key].range[1]}`)
//         }
//         return db.categoricalIndexes[key][value]
//     }
//     return {key, callback}
// }
// const makeSelectionFilters = (database: NavigatorDatabase) => Object.values(
//     TripartiteVariables).filter(v => isNaN(Number(v))
// ).map(f => makeSelectionFilter(f as TripartiteVariables, database))


// This is used in the overview screen to filter the table to only the selected plot.
export const filterTo = (records: ArtemissRecord[], filters: { [key in ToggleableVariables]?: string }) => {
    let result = records
    Object.keys(filters).forEach(k => {
        if (filters[k as ToggleableVariables] !== undefined) {
            result = result.filter(r => `${r[k as ToggleableVariables]}` === filters[k as ToggleableVariables])
        }
    })
    return result
}
