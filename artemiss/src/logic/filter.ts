import { Fields, RangeVariables, ToggleableVariables, getValuesFromBoolArray } from "@snTypes/DataDictionary"
import { ArtemissRecord, CategoricalIndexSet, FilterControlState, FilterSettings, NavigatorDatabase, NullId, PKType } from "@snTypes/Types"

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


//  Set intersection should be in the actual language standard Any Day Now
const _intersect = (shortest: Set<PKType>, ...rest: Set<PKType>[]): Set<PKType> => {
    const result = rest.reduce((currentResult, newSet) => { return new Set([...currentResult].filter(id => newSet.has(id))) }, shortest)
    return result
}


const intersect = (...sets: Set<PKType>[]): Set<PKType> => {
    const minLength = Math.min(...sets.map(s => s.size))
    const shortestSetIdx = sets.findIndex(s => s.size === minLength)
    const shortest = sets[shortestSetIdx]
    
    return _intersect(shortest, ...sets.filter((_, i) => i !== shortestSetIdx))
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
    const indexIntersectionSet = intersect(...allSets)
    // Repeatedly projecting and re-set-ifying isn't ideal but
    const materializedRows = projectRecords(indexIntersectionSet, database)
    const rangeTests = rangeFilters.map(r => {
        const { key, callback } = r
        const valueRange = filters.activeFilters[key]
        return callback(valueRange)
    })
    const finalSet = new Set(materializedRows.filter(r => rangeTests.every(test => test(r))).map(r => r.uuid))
    return finalSet
}


type BooleanAddDrops = { allAdds: boolean[][], allDrops: boolean[][] }
const getBooleanAddDrops = (newFilters: FilterControlState, oldFilters: FilterControlState): BooleanAddDrops => {
    let allAdds: boolean[][] = []
    let allDrops: boolean[][] = []

    booleanFields.forEach(f => {
        const adds = newFilters[f].map((e, i) => e && !oldFilters[f][i])
        const drops = newFilters[f].map((e, i) => !e && oldFilters[f][i])
        allAdds.push(adds)
        allDrops.push(drops)
    })
    return { allAdds, allDrops }
}


const getBooleanDifference = (addDrops: BooleanAddDrops, current: Set<PKType>, database: NavigatorDatabase): { added: Set<PKType>, kept: Set<PKType> } => {
    const boolFilters = makeBooleanFilters(database).filter(x => x !== undefined)
    let allAdds = new Set<PKType>()
    let allDrops = new Set<PKType>()

    boolFilters.forEach((b, i) => {
        const added = b.callback(addDrops.allAdds[i])
        const drops = b.callback(addDrops.allDrops[i])
        if (added !== undefined) {
            allAdds = allAdds.union(added)
        }
        if (drops !== undefined) {
            allDrops = allDrops.union(drops)
        }
    })
    return { added: allAdds, kept: current.difference(allDrops) }
}


const getRangeAddDrops = (newFilters: FilterControlState, oldFilters: FilterControlState) => {
    let addRanges = []
    let dropRanges = []


}


export const applyUpdatedFilters = (newFilters: FilterControlState, oldFilters: FilterControlState, database: NavigatorDatabase): Set<PKType> => {
    const boolSets = makeBooleanFilters(database).map(b => {
        const { key, callback } = b
        const choices = newFilters[key]
        return callback(choices)
    })

}


export const restrictMarksToFilteredInIds = (currentMarks: Set<PKType>, filteredIn: Set<PKType>) => {
    if (currentMarks.size === 0 || filteredIn.size === 0) return new Set([NullId])
    return intersect(currentMarks, filteredIn)
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


export const filterTo = (records: ArtemissRecord[], filters: { [key in ToggleableVariables]?: string }) => {
    let result = records
    Object.keys(filters).forEach(k => {
        if (filters[k as ToggleableVariables] !== undefined) {
            result = result.filter(r => `${r[k as ToggleableVariables]}` === filters[k as ToggleableVariables])
        }
    })
    return result
}
