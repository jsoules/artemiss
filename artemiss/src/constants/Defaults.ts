import { ArtemissRecord, Device, FilterSettings, NavigatorDatabase, PKType } from "@snTypes/Types"
import { CategoricalIndexedFields, DependentVariables, Fields, IndependentVariables, ToggleableVariables, axisHelicityValidValues, databaseFromValidValues, nfpValidValues } from "./DataDictionary"

export const defaultFinePlotSplit = ToggleableVariables.NFP
export const defaultCoarsePlotSplit = ToggleableVariables.DATABASE_FROM
export const defaultDependentVariableValue = DependentVariables.VOL_AVG_B
export const defaultIndependentVariableValue = IndependentVariables.MINOR_RADIUS
export const defaultPlotColorSplit = ToggleableVariables.DATABASE_FROM

export const initialNavigatorState: FilterSettings = {
    // When we actually have more values, we'll set up a default source or something
    // to limit getting slammed by the initial data.
    // ncPerHp: new Array<boolean>(ncPerHpValidValues.length).fill(false),
    databaseFrom: [ true, ...(new Array<boolean>(databaseFromValidValues.length - 2).fill(false)), true ],
    nfp: [ true, true, ...(new Array<boolean>(nfpValidValues.length - 2).fill(false)) ], //new Array<boolean>(nfpValidValues.length).fill(true),
    axisHelicity: new Array<boolean>(axisHelicityValidValues.length).fill(false),
    minorRadius: (Fields.minorRadius.range),
    aspectRatio: (Fields.aspectRatio.range),
    volume: (Fields.volume.range),
    volAvgB: (Fields.volAvgB.range),
    mirrorRatio: (Fields.mirrorRatio.range),
    minLgradB: (Fields.minLgradB.range),
    plasmaBeta: (Fields.plasmaBeta.range),
    jdotbVmec: (Fields.plasmaBeta.range),
    iota: (Fields.iota.range),
    vacuumWell: (Fields.vacuumWell.range),
    mercierCriterion: (Fields.mercierCriterion.range),
    sqrtBoozerQsErr: (Fields.sqrtBoozerQsErr.range),
    epsilonEff: (Fields.epsilonEff.range),
    qiError: (Fields.qiError.range),
    lossFractionS025: (Fields.lossFractionS025.range),
    //
    dependentVariable: defaultDependentVariableValue,
    independentVariable: defaultIndependentVariableValue,
    coarsePlotSplit: defaultCoarsePlotSplit,
    // coarsePlotSelectedValue: 'kappel_2024',
    finePlotSplit: defaultFinePlotSplit,
    finePlotSelectedValue: '1',
    database: undefined,
    records: [],
    recordIds: new Set<PKType>(),
    markedRecords: new Set<PKType>(),
    markedRecordUrls: new Set<string>(),
}


export const initialDatabase: NavigatorDatabase = {
    list: [],
    byId: {},
    categoricalIndexes: {
        [ CategoricalIndexedFields.NFP           ]: {},
        [ CategoricalIndexedFields.AXIS_HELICITY ]: {},
        [ CategoricalIndexedFields.DATABASE_FROM ]: {},
    },
    allIdSet: new Set<PKType>([])
}


export const nonExtantRecordId = '000000'
export const defaultEmptyRecord: ArtemissRecord = {
    uuid: nonExtantRecordId,
    databaseFrom: '',
    groupName: '',
    databaseFromId: '',
    canonicalPath: '',
    nfp: 1,
    axisHelicity: 0,
    // phiEdge: 0.,
    minorRadius: 0.,
    aspectRatio: 0.,
    volume: 0.,
    volAvgB: 0.,
    mirrorRatio: 0.,
    minLgradB: 0.,
    plasmaBeta: 0.,
    jdotbVmec: 0.,
    iota: 0.,
    vacuumWell: 0.,
    mercierCriterion: 0.,
    sqrtBoozerQsErr: 0.,
    epsilonEff: 0.,
    qiError: 0.,
    lossFractionS025: 0.,
}

export const defaultEmptyDevice: Device = {
    uuid: nonExtantRecordId,
    databaseFrom: '',
    groupName: '',
    databaseFromId: "",
    nfp: 0,
    stellsym: false,
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
