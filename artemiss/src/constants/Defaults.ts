import { makeEmptyCategoricalIndices } from "@snState/database"
import { ArtemissRecord, Device, FilterControlState, FilterSettings, NavigatorDatabase, PKType } from "@snTypes/Types"
import { DependentVariables, Fields, IndependentVariables, ToggleableVariables, axisHelicityValidValues, databaseFromValidValues, nfpValidValues } from "./DataDictionary"

export const defaultFinePlotSplit = ToggleableVariables.NFP
export const defaultCoarsePlotSplit = ToggleableVariables.DATABASE_FROM
export const defaultDependentVariableValue = DependentVariables.VOL_AVG_B
export const defaultIndependentVariableValue = IndependentVariables.MINOR_RADIUS
export const defaultPlotColorSplit = ToggleableVariables.DATABASE_FROM

const initialOnDatabases = ['bindel_2023', 'kappel_2024', 'model_improvement_2026']
const initialOnNfps = [ '1', '4' ]
const initialDbFromFilter = databaseFromValidValues.map(v => initialOnDatabases.includes(v))
const initialNfpFilter = nfpValidValues.map(v => initialOnNfps.includes(v))

const defaultFilterState: FilterControlState = {
    databaseFrom: initialDbFromFilter,
    nfp: initialNfpFilter,
    axisHelicity: new Array<boolean>(axisHelicityValidValues.length).fill(false),
    stellsym: [true, false],
    enforceVacuum: [true, false],
    minorRadius: (Fields.minorRadius.range),
    aspectRatio: (Fields.aspectRatio.range),
    volume: (Fields.volume.range),
    volAvgB: (Fields.volAvgB.range),
    mirrorRatio: (Fields.mirrorRatio.range),
    minLgradB: (Fields.minLgradB.range),
    plasmaBeta: (Fields.plasmaBeta.range),
    vacuumWell: (Fields.vacuumWell.range),
    iotaMean: (Fields.iotaMean.range),
    mercierCriterionMax: (Fields.mercierCriterionMax.range),
    sqrtBoozerQsErrMean: (Fields.sqrtBoozerQsErrMean.range),
    lossFractionS025: (Fields.lossFractionS025.range),
    meanConfinementTimeS025: (Fields.meanConfinementTimeS025.range),
}


// // const allOffFilterState: FilterControlState = Object.fromEntries(
// //     Object.values(RangeVariables).map(r => [r, [0,0]])
// // )
// export const allOnFilterState: FilterControlState = {
//     ...Object.fromEntries(Object.values(RangeVariables).map(r => [r, [0,0]])),
//     databaseFrom: (new Array<boolean>(databaseFromValidValues.length).fill(false)),
//     nfp: new Array<boolean>(nfpValidValues.length).fill(false), 
//     axisHelicity: new Array<boolean>(axisHelicityValidValues.length).fill(false),
//     stellsym: [false, false],
//     enforceVacuum: [false, false],
// } as any as FilterControlState
export const allOnFilterState: FilterControlState = {
    ...defaultFilterState,
    databaseFrom: (new Array<boolean>(databaseFromValidValues.length).fill(true)),
    nfp: new Array<boolean>(nfpValidValues.length).fill(true), 
    axisHelicity: new Array<boolean>(axisHelicityValidValues.length).fill(true),
    stellsym: [true, true],
    enforceVacuum: [true, true],
} as any as FilterControlState


export const initialNavigatorState: FilterSettings = {
    // When we actually have more values, we'll set up a default source or something
    // to limit getting slammed by the initial data.
    // ncPerHp: new Array<boolean>(ncPerHpValidValues.length).fill(false),
    activeFilters: {...defaultFilterState},
    dependentVariable: defaultDependentVariableValue,
    independentVariable: defaultIndependentVariableValue,
    coarsePlotSplit: defaultCoarsePlotSplit,
    // coarsePlotSelectedValue: 'kappel_2024',
    finePlotSplit: defaultFinePlotSplit,
    finePlotSelectedValue: '1',
    focusedRecordIds: new Set<PKType>(),
    focusedRecords: [] as ArtemissRecord[],
    database: undefined,
    records: [],
    recordIds: new Set<PKType>(),
    markedRecords: new Set<PKType>(),
    markedRecordUrls: new Set<string>(),
}


export const initialDatabase: NavigatorDatabase = {
    list: [],
    byId: {},
    rowSelectionStatus: new BigInt64Array(0),
    allIdSet: new Set<PKType>([]),
    categoricalIndexes: makeEmptyCategoricalIndices(),
    rangeIndexes: {} as any,
    fullApproval: 0n,
    masks: {} as any,
}


export const nonExtantRowId = -1
export const nonExtantRecordId = '000000'
export const defaultEmptyRecord: ArtemissRecord = {
    rowid: nonExtantRowId,
    uuid: nonExtantRecordId,
    databaseFrom: '',
    groupName: '',
    databaseFromId: '',
    canonicalPath: '',
    nfp: 1,
    axisHelicity: 0,
    stellsym: 1,
    enforceVacuum: 1,
    minorRadius: 0.,
    aspectRatio: 0.,
    volume: 0.,
    volAvgB: 0.,
    mirrorRatio: 0.,
    minLgradB: 0.,
    plasmaBeta: 0.,
    vacuumWell: 0.,
    iotaMean: 0.,
    mercierCriterionMax: 0.,
    sqrtBoozerQsErrMean: 0.,
    lossFractionS025: 0.,
    meanConfinementTimeS025: 0.,
}

export const defaultEmptyDevice: Device = {
    uuid: nonExtantRecordId,
    databaseFrom: '',
    groupName: '',
    databaseFromId: '',
    canonicalPath: '',
    nfp: 0,
    stellsym: false,
    enforceVacuum: false,
    surfaceDistances: [],
    surface: [],
    nSurfaces: 0,
    aspectRatio: 0,
    minorRadius: 0,
    volume: 0,
    volAvgB: 0,
    mirrorRatio: 0,
    minLgradB: 0,
    modb: [],
    modbBoozer: [],
    pressure: [],
    plasmaBeta: 0,
    toroidalCurrent: [],
    jdotbVmec: [],
    iota: [],
    vacuumWell: 0,
    mercierCriterion: [],
    magneticAxis: [],
    integratedAxisTorsion: 0,
    axisHelicity: 0,
    sqrtBoozerQsError: [],
    lossTracings: {
        time: [],
        lossFracS0_10: [0],
        lossFracS0_25: [0],
        lossFracS0_50: [0],
        meanConfinementTimeS0_10: 0,
        meanConfinementTimeS0_25: 0,
        meanConfinementTimeS0_50: 0
    },
    lossCharacteristics: {
        thetaLostS0_25: [],
        zetaLostS0_25: [],
        energyLostS0_25: []
    }
}
