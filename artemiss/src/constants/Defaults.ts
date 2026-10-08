import { makeEmptyCategoricalIndices } from "@snState/database"
import { ArtemissRecord, Device, FilterControlState, FilterSettings, NavigatorDatabase, PKType } from "@snTypes/Types"
import { DependentVariables, Fields, IndependentVariables, ToggleableVariables, axisHelicityValidValues, databaseFromValidValues, nfpValidValues } from "./DataDictionary"

export const defaultFinePlotSplit = ToggleableVariables.NFP
export const defaultCoarsePlotSplit = ToggleableVariables.DATABASE_FROM
export const defaultDependentVariableValue = DependentVariables.VOL_AVG_B
export const defaultIndependentVariableValue = IndependentVariables.MINOR_RADIUS
export const defaultPlotColorSplit = ToggleableVariables.DATABASE_FROM

const defaultFilterState: FilterControlState = {
    databaseFrom: [ true, ...(new Array<boolean>(databaseFromValidValues.length - 2).fill(false)), true ],
    nfp: [ true, true, ...(new Array<boolean>(nfpValidValues.length - 2).fill(false)) ], //new Array<boolean>(nfpValidValues.length).fill(true),
    axisHelicity: new Array<boolean>(axisHelicityValidValues.length).fill(false),
    stellsym: [false, true],
    enforceVacuum: [false, true],
    minorRadius: (Fields.minorRadius.range),
    aspectRatio: (Fields.aspectRatio.range),
    volume: (Fields.volume.range),
    volAvgB: (Fields.volAvgB.range),
    mirrorRatio: (Fields.mirrorRatio.range),
    minLgradB: (Fields.minLgradB.range),
    plasmaBeta: (Fields.plasmaBeta.range),
    vacuumWell: (Fields.vacuumWell.range),
    intAxisTorsion: (Fields.intAxisTorsion.range),
    iotaAxis: (Fields.iotaAxis.range),
    iotaMean: (Fields.iotaMean.range),
    iotaMax: (Fields.iotaMax.range),
    iotaEdge: (Fields.iotaEdge.range),
    jdotbVmecMean: (Fields.jdotbVmecMean.range),
    jdotbVmecMax: (Fields.jdotbVmecMax.range),
    jdotbVmecEdge: (Fields.jdotbVmecEdge.range),
    mercierCriterionMean: (Fields.mercierCriterionMean.range),
    mercierCriterionMax: (Fields.mercierCriterionMax.range),
    mercierCriterionEdge: (Fields.mercierCriterionEdge.range),
    epsilonEffMean: (Fields.epsilonEffMean.range),
    epsilonEffMax: (Fields.epsilonEffMax.range),
    epsilonEffEdge: (Fields.epsilonEffEdge.range),
    qiErrorMean: (Fields.qiErrorMean.range),
    qiErrorMax: (Fields.qiErrorMax.range),
    qiErrorEdge: (Fields.qiErrorEdge.range),
    sqrtBoozerQsErrMean: (Fields.sqrtBoozerQsErrMean.range),
    sqrtBoozerQsErrMax: (Fields.sqrtBoozerQsErrMax.range),
    sqrtBoozerQsErrEdge: (Fields.sqrtBoozerQsErrEdge.range),
    lossFractionS010: (Fields.lossFractionS010.range),
    lossFractionS025: (Fields.lossFractionS025.range),
    lossFractionS050: (Fields.lossFractionS050.range),
    meanConfinementTimeS010: (Fields.meanConfinementTimeS010.range),
    meanConfinementTimeS025: (Fields.meanConfinementTimeS025.range),
    meanConfinementTimeS050: (Fields.meanConfinementTimeS050.range),
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
    intAxisTorsion: 0.,
    iotaAxis: 0.,
    iotaMean: 0.,
    iotaMax: 0.,
    iotaEdge: 0.,
    jdotbVmecMean: 0.,
    jdotbVmecMax: 0.,
    jdotbVmecEdge: 0.,
    mercierCriterionMean: 0.,
    mercierCriterionMax: 0.,
    mercierCriterionEdge: 0.,
    epsilonEffMean: 0.,
    epsilonEffMax: 0.,
    epsilonEffEdge: 0.,
    qiErrorMean: 0.,
    qiErrorMax: 0.,
    qiErrorEdge: 0.,
    sqrtBoozerQsErrMean: 0.,
    sqrtBoozerQsErrMax: 0.,
    sqrtBoozerQsErrEdge: 0.,
    lossFractionS010: 0.,
    lossFractionS025: 0.,
    lossFractionS050: 0.,
    meanConfinementTimeS010: 0.,
    meanConfinementTimeS025: 0.,
    meanConfinementTimeS050: 0.,
}

export const defaultEmptyDevice: Device = {
    uuid: nonExtantRecordId,
    databaseFrom: '',
    groupName: '',
    databaseFromId: "",
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
    modbBoozer: [],
    pressure: [],
    plasmaBeta: 0,
    boozerI: [],
    boozerG: [],
    jdotbVmec: [],
    iota: [],
    vacuumWell: 0,
    mercierCriterion: [],
    magneticAxis: [],
    integratedAxisTorsion: 0,
    axisHelicity: 0,
    sqrtBoozerQsError: [],
    epsilonEff: [],
    qiError: [],
    lossTracings: {
        time: [],
        lossFracS0_01: 0,
        lossFracS0_25: 0,
        lossFracS0_50: 0,
        meanConfinementTimeS0_01: 0,
        meanConfinementTimeS0_25: 0,
        meanConfinementTimeS0_50: 0
    },
    lossCharacteristics: {
        thetaLostS0_25: [],
        zetaLostS0_25: [],
        energyLostS0_25: []
    }
}
