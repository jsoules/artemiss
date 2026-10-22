import { RangeVariables, ToggleableVariables, getValuesFromBoolArray } from "@snTypes/DataDictionary"
import { CategoricalIndexSet, FilterControlState, NavigatorDatabase, RangeIndex } from "@snTypes/Types"


export const forceRecheck = (db: NavigatorDatabase) => {
    const nowIncluded: number[] = []
    // can't map over this b/c TypedArray.map returns another TypedArray of same type, not an arbitrary list
    db.rowSelectionStatus.forEach((r, i) => {
        if (r === db.fullApproval) {
            nowIncluded.push(i)
        }
    })
    return new Set(nowIncluded)
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
    if (ary[lowerIdx] > target) return lowerIdx
    if (ary[upperIdx] < target) return upperIdx

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


const materializeRange = (idx: RangeIndex, newRange: number[]): Set<number> => {
    const lowerIdx = binSearch(idx.val, newRange[0], 'gte')
    const upperIdx = binSearch(idx.val, newRange[1], 'lte')
    return new Set(idx.rowid.slice(lowerIdx, upperIdx + 1)) // slice is exclusive on the upper end
}


const expandedFilter = (database: NavigatorDatabase, filterKey: RangeVariables | ToggleableVariables, allNew: Set<number>): Set<number> => {
    const mask = database.masks[filterKey].inmask
    const nowIncluded = allNew.values().map(rowid => {
        database.rowSelectionStatus[rowid] |= mask
        return database.rowSelectionStatus[rowid] === database.fullApproval ? rowid : undefined
    }).filter(x => x !== undefined)

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


const expandRangeFilter = (database: NavigatorDatabase, filterKey: RangeVariables, newRange: number[][]) => {
    // NOTE: newRange will go ONLY [new: old] and [old: new]
    // i.e. it will NOT include anything that was included-in by the existing filter settings
    // (except that we're going to get a fencepost there)

    // Identify newly added elements
    const allNew = rangeFilter(database, filterKey, newRange)

    return expandedFilter(database, filterKey, allNew)
}


const contractRangeFilter = (database: NavigatorDatabase, filterKey: RangeVariables, newRange: number[][]) => {
    const allDrop = rangeFilter(database, filterKey, newRange)
    contractFilter(database, filterKey, allDrop)
    return allDrop
}


const boolFilter = (database: NavigatorDatabase, filterKey: ToggleableVariables, sel: boolean[]) => {
    const idx = database.categoricalIndexes[filterKey]
    const vals = getValuesFromBoolArray(filterKey, sel)
    const sets = vals.map(v => idx[v])
    const union = sets.reduce((curr, newSet) => curr.union(newSet), new Set<number>())

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


export const subsetSelections = (database: NavigatorDatabase, rawids: Set<number>, filters: ToggleableVariables[], vals: string[]): Set<number> => {
    const fSets = filters.map((f, i) => database.categoricalIndexes[f as unknown as keyof CategoricalIndexSet][vals[i]])
    return fSets.length === 0 ? rawids : fSets.reduce((curr, incoming) => curr.intersection(incoming), rawids)
}


export const updateFilters = (database: NavigatorDatabase, oldFilters: FilterControlState, newFilters: FilterControlState) => {

    // Update boolean filters
    const boolDeltas = (Object.values(ToggleableVariables)).map((f) => {
        const _f = f
        // If every entry is off, that's considered the same as every entry on.
        const correctedNew: boolean[] = newFilters[_f].every(x => !x) ? new Array(newFilters[_f].length).fill(true) : newFilters[_f]
        const correctedOld: boolean[] = oldFilters[_f].every(x => !x) ? new Array(oldFilters[_f].length).fill(true) : oldFilters[_f]
        const adds = correctedNew.map((e, i) => e && !correctedOld[i])
        const drops = correctedNew.map((e, i) => !e && correctedOld[i])
        if (adds.every(x => !x) && drops.every(x => !x)) return undefined
        return { field: _f, adds, drops }
    }).filter(x => x !== undefined)

    let dropUnion = boolDeltas.map(v => contractBoolFilter(database, v.field, v.drops)).reduce((a, b) => a.union(b), new Set<number>())
    // NOTE: Need to keep the addUnion in, b/c some items may become filtered-in by earlier steps.
    // Ones that were not fully filtered in by the first update will be caught later (or remain properly filtered out),
    // but otherwise we only catch something the *first* time its status updates so that it gets filtered in.
    let addUnion = boolDeltas.map(v => expandBoolFilter(database, v.field, v.adds)).reduce((a, b) => a.union(b), new Set<number>())

    const rangeDeltas = (Object.values(RangeVariables)).map((f) => {
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

    dropUnion = rangeDeltas.map(v => contractRangeFilter(database, v.field, v.droppedRange)).reduce((a, b) => a.union(b), dropUnion)
    addUnion = rangeDeltas.map(v => expandRangeFilter(database, v.field, v.addedRange)).reduce((a, b) => a.union(b), addUnion)


    // TODO: tripartite support

    // database state has been updated, return the new selection set
    return { added: addUnion, dropped: dropUnion }
}


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
