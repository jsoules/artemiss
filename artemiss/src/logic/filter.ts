import { Fields, RangeVariables, ToggleableVariables, getValuesFromBoolArray } from "@snTypes/DataDictionary"
import { ArtemissRecord, CategoricalIndexSet, FilterSettings, NavigatorDatabase, NullId, PKType } from "@snTypes/Types"


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
        const choices = filters[key]
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
        const valueRange = filters[key]
        return callback(valueRange)
    })
    const finalSet = new Set(materializedRows.filter(r => rangeTests.every(test => test(r))).map(r => r.uuid))
    console.log(`Final set has size ${finalSet.size} and elements ${[...finalSet.entries()].join(',')}`)
    return finalSet
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
        return (row: ArtemissRecord) => row[key] >= range[0] && row[key] <= range[1]
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
