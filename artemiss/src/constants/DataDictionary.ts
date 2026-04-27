/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
import { Device } from "@snTypes/Types"

export const getEnumVals = (x: object): string[] => {
    return (Object.values(x) as string[]).filter(v => isNaN(Number(v)))
}

// NOTE that these should refer to the INTERNAL spellings/names, not necessarily
// the ones used in the source json
export enum KnownFields {
    ID = 'uuid',
    DATABASE_FROM = 'databaseFrom', // TODO: NEED A LIST OF THE VALID VALUES
    GROUP_NAME = 'groupName',
    DATABASE_FROM_ID = 'databaseFromId',
    CANONICAL_PATH = 'canonicalPath',
    NFP = 'nfp',
    PHIEDGE = 'phiEdge',
    MINOR_RADIUS = 'minorRadius',
    ASPECT_RATIO = 'aspectRatio',
    VOLUME = 'volume',
    VOL_AVG_B = 'volAvgB',
    MIN_L_GRAD_B = 'minLgradB',
    VACUUM_WELL = 'vacuumWell',
    LOSS_FRAC_S_0_25 = 'lossFractionS025',
}

export enum DependentVariables {
    // DATABASE_FROM = KnownFields.DATABASE_FROM,
    // GROUP_NAME = KnownFields.GROUP_NAME,
    NFP = KnownFields.NFP,
    PHIEDGE = KnownFields.PHIEDGE,
    MINOR_RADIUS = KnownFields.MINOR_RADIUS,
    ASPECT_RATIO = KnownFields.ASPECT_RATIO,
    VOLUME = KnownFields.VOLUME,
    VOL_AVG_B = KnownFields.VOL_AVG_B,
    MIN_L_GRAD_B = KnownFields.MIN_L_GRAD_B,
    VACUUM_WELL = KnownFields.VACUUM_WELL,
    LOSS_FRAC_S_0_25 = KnownFields.LOSS_FRAC_S_0_25,
}

export enum IndependentVariables {
    // DATABASE_FROM = KnownFields.DATABASE_FROM,
    // GROUP_NAME = KnownFields.GROUP_NAME,
    NFP = KnownFields.NFP,
    PHIEDGE = KnownFields.PHIEDGE,
    MINOR_RADIUS = KnownFields.MINOR_RADIUS,
    ASPECT_RATIO = KnownFields.ASPECT_RATIO,
    VOLUME = KnownFields.VOLUME,
    VOL_AVG_B = KnownFields.VOL_AVG_B,
    MIN_L_GRAD_B = KnownFields.MIN_L_GRAD_B,
    VACUUM_WELL = KnownFields.VACUUM_WELL,
    LOSS_FRAC_S_0_25 = KnownFields.LOSS_FRAC_S_0_25,
}

export enum ToggleableVariables {
    DATABASE_FROM = KnownFields.DATABASE_FROM,
    NFP = KnownFields.NFP,
}

export enum RangeVariables {
    PHIEDGE = KnownFields.PHIEDGE,
    MINOR_RADIUS = KnownFields.MINOR_RADIUS,
    ASPECT_RATIO = KnownFields.ASPECT_RATIO,
    VOLUME = KnownFields.VOLUME,
    VOL_AVG_B = KnownFields.VOL_AVG_B,
    MIN_L_GRAD_B = KnownFields.MIN_L_GRAD_B,
    VACUUM_WELL = KnownFields.VACUUM_WELL,
    LOSS_FRAC_S_0_25 = KnownFields.LOSS_FRAC_S_0_25,
}

export enum TripartiteVariables {
    // N_FOURIER_COIL = KnownFields.N_FOURIER_COIL,
    // HELICITY = KnownFields.HELICITY,
}

export const dependentVariableDropdownConfig: { key: number, value: DependentVariables }[] = [
    // { key:  1, value: DependentVariables.DATABASE_FROM               },
    // { key:  2, value: DependentVariables.GROUP_NAME                  },
    { key:  1, value: DependentVariables.NFP                         },
    { key:  2, value: DependentVariables.PHIEDGE                     },
    { key:  3, value: DependentVariables.MINOR_RADIUS                },
    { key:  4, value: DependentVariables.ASPECT_RATIO                },
    { key:  5, value: DependentVariables.VOLUME                      },
    { key:  6, value: DependentVariables.VOL_AVG_B                   },
    { key:  7, value: DependentVariables.MIN_L_GRAD_B                },
    { key:  8, value: DependentVariables.VACUUM_WELL                 },
    { key:  9, value: DependentVariables.LOSS_FRAC_S_0_25            },
]

export const independentVariableDropdownConfig: { key: number, value: IndependentVariables }[] = [
    // { key:  1, value: IndependentVariables.DATABASE_FROM               },
    // { key:  2, value: IndependentVariables.GROUP_NAME                  },
    { key:  1, value: IndependentVariables.NFP                         },
    { key:  2, value: IndependentVariables.PHIEDGE                     },
    { key:  3, value: IndependentVariables.MINOR_RADIUS                },
    { key:  4, value: IndependentVariables.ASPECT_RATIO                },
    { key:  5, value: IndependentVariables.VOLUME                      },
    { key:  6, value: IndependentVariables.VOL_AVG_B                   },
    { key:  7, value: IndependentVariables.MIN_L_GRAD_B                },
    { key:  8, value: IndependentVariables.VACUUM_WELL                 },
    { key:  9, value: IndependentVariables.LOSS_FRAC_S_0_25            },
]

export const toggleableVariableDropdownConfig: { key: number, value: ToggleableVariables }[] = [
    { key: 1, value: ToggleableVariables.DATABASE_FROM  },
    // { key: 2, value: ToggleableVariables.NC_PER_HP  },
    { key: 3, value: ToggleableVariables.NFP        },
    // { key: 4, value: ToggleableVariables.N_SURFACES },
]


export const colorationVariableDropdownConfig: { key: number, value: DependentVariables | ToggleableVariables }[] = [
    ...toggleableVariableDropdownConfig,
    ...(dependentVariableDropdownConfig.map(v => ({ key: v.key + toggleableVariableDropdownConfig.length, value: v.value})))
]


export type FieldDescription = {
    shortLabel: string,
    plotLabel: string,
    fullLabel: string,
    description: string,
    unit?: string,
    range: [number, number],
    values?: number[],
    valueLabels?: string[],
    isLog: boolean,
    isCategorical: boolean
    markedValue?: number,
    markedValueDesc?: string
    tableColumnWidth?: number,
    displayInTable: boolean
}


type FieldRecords = {
    [name in KnownFields]: FieldDescription
}


export const nfpValidValues = [
    1, 2, 3, 4, 5, 6, 7, 8
]


export const databaseFromLabels = [
    "kappel_2024",
]


export const databaseFromValidValues = [
    1,
]


// TODO: Something about init-capping these in some contexts
export const getLabel = (props: {name: string, labelType: 'short' | 'full' | 'plot'}) => {
    const { name, labelType } = props
    const rec = Fields[name as KnownFields]
    const unitPart = rec.unit === undefined ? '' : ` (${rec.unit})`
    const labelPart = labelType === 'short' ? rec.shortLabel : labelType === 'plot' ? rec.plotLabel : rec.fullLabel
    return `${labelPart}${unitPart}`
}

export const getValuesFromBoolArray = (field: string, choices: boolean[]) => {
    if (choices.length === 0) return []

    const vals = Fields[field as KnownFields].values ?? []
    if (vals.length !== choices.length ) {
        throw Error(`Boolean-to-values for Key ${field}: choices length ${choices.length} but values length ${vals.length}`)
    }
    return vals.filter((_, idx) => choices[idx])
}

// TODO: add sorting order field for table

// NOTE: This describes the fields in the *overview database*. It does NOT describe
// the full data set in the per-record payload file. That's to be handled separately.

const METER_UNIT = "M"
export const Fields: FieldRecords = {
    'uuid': {
        shortLabel: "UUID",
        plotLabel: "UUID",
        fullLabel: "Device ID",
        description: "Artemiss-assigned unique device identifier",
        unit: undefined,
        range: [952, 2793242],      // TODO: does this break
        isLog: false,
        isCategorical: true,
        markedValue: undefined,
        tableColumnWidth: 70,
        displayInTable: true
    },
    'databaseFrom': {
        shortLabel: "Source DB",
        plotLabel: "Source DB",
        fullLabel: "Original source",
        description: "Original source database/publication for this device",
        unit: undefined,
        range: [2.4, 60.1],
        values: databaseFromValidValues,
        valueLabels: databaseFromLabels,
        isLog: false,
        isCategorical: true,
        markedValue: undefined,
        tableColumnWidth: 80,
        displayInTable: true
    },
    'groupName': {
        shortLabel: "Group",
        plotLabel: "Group",
        fullLabel: "Device subgroup",
        description: "Subgrouping of device source (internal use only)",
        unit: undefined,
        range: [2.4, 60.1],
        // values: coilLengthPerHpValidValues,
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 80,
        displayInTable: false
    },
    'databaseFromId': {
        shortLabel: "DB ID",
        plotLabel: "Source-DB ID",
        fullLabel: "ID in source database",
        description: "ID assigned to device by its original source",
        unit: undefined,
        range: [2.4, 60.1],
        // values: coilLengthPerHpValidValues,
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 80,
        displayInTable: false
    },
    'canonicalPath': {
        shortLabel: "canpath",
        plotLabel: "canonPath",
        fullLabel: "canonical path",
        description: "Correctly populated path to individual record data",
        range: [0, 1],
        isCategorical: false,
        isLog: false,
        displayInTable: false
    },
    'nfp': {
        shortLabel: "NFP",
        plotLabel: "FP Count",
        fullLabel: "Number of Field Periods (NFP)",
        description: "Count of field periods",
        unit: undefined,
        range: [1, 8],
        values: nfpValidValues,
        valueLabels: nfpValidValues.map(i => `${i}`),
        isLog: false,
        isCategorical: true,
        markedValue: undefined,
        tableColumnWidth: 75,
        displayInTable: true
    },
    'phiEdge': {
        shortLabel: "phi edge",
        plotLabel: "Phi edge",
        fullLabel: "Phi edge",
        description: "Total toroidal magnetic flux within the device",
        unit: METER_UNIT,   // TODO FIXME
        range: [15.0, 150.0],
        // values: totalCoilLengthValidValues,
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 80,
        displayInTable: true
    },
    'minorRadius': {
        shortLabel: "Minor rad",
        plotLabel: "Minor radius",
        fullLabel: "Minor radius",
        description: "The minor radius of the outermost surface (unscaled)",
        unit: METER_UNIT,
        range: [0.6, 2.5],
        isLog: false,
        isCategorical: false,
        displayInTable: true
    },
    'aspectRatio': {
        shortLabel: "AR",
        plotLabel: "Aspect ratio",
        fullLabel: "Aspect ratio (AR)",
        description: "The aspect ratio of the device, computed using the VMEC definition",
        range: [2.7, 12.0],
        isLog: false,
        isCategorical: false,
        tableColumnWidth: 75,
        displayInTable: true
    },
    'volume': {
        shortLabel: "Vol",
        plotLabel: "Volume",
        fullLabel: "Volume",
        description: "Volume enclosed by the outermost toroidal surface",
        unit: `${METER_UNIT}^3`,
        range: [0.034, 2.42],   // TODO: DOUBLE-CHECK
        isLog: false,
        isCategorical: false,
        displayInTable: true
    },
    'volAvgB': {
        shortLabel: "Vol-avg-B",
        plotLabel: "Volume avg B",
        fullLabel: "Volume-averaged B",
        description: "Magnetic field strength averaged over the plasma volume",
        unit: `T/${METER_UNIT}^3`,   // TODO: FIXME
        range: [4.5, 10.0],
        // values: totalCoilLengthValidValues,
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 80,
        displayInTable: true
    },
    'minLgradB': {
        shortLabel: "L_grad_B",
        plotLabel: "L grad B",
        fullLabel: "L grad B",
        description: "Magnetic gradient scale length",
        unit: METER_UNIT,
        range: [0.5, 9.0],
        // values: meanIotaValidValues,
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 90,
        displayInTable: true
    },
    'vacuumWell': {
        shortLabel: "vwell",
        plotLabel: "V well",
        fullLabel: "Vacuum Magnetic Well",
        description: "Metric for plasma equilibrium stability",
        unit: undefined,    // TODO
        range: [-0.11, 0.2],
        // values: ncPerHpValidValues,
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 80,
        displayInTable: true
    },
    'lossFractionS025': {
        shortLabel: "Loss Frac",
        plotLabel: "Loss frac s=0.25",
        fullLabel: "Loss fraction S=0.25",
        description: "Fraction of particles born on s=0.25 that escape plasma within 0.1 seconds",
        range: [0.0, 0.5],
        // values: nFourierCoilValidValues,
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 75,
        displayInTable: true
    },
}

export const fieldIsCategorical = (fieldName?: string): boolean => (
    Fields[fieldName as KnownFields]?.isCategorical ?? false
)

export const fieldValuesCount = (fieldName?: string): number => (
    Fields[fieldName as KnownFields]?.values?.length ?? 0
)

export const fieldMarkedValueDesc = (fieldName?: string): string | undefined => (
    Fields[fieldName as KnownFields]?.markedValueDesc
)

// I don't think this is actually used
// export const getFieldValueDescriptions = (fieldName: TripartiteVariables): string[] | number[] => {
//     if (fieldName === TripartiteVariables.HELICITY) {
//         return helicityValuesTranslation
//     }
//     return Fields[fieldName]?.values ?? []
// }


export enum CategoricalIndexedFields {
    NFP = 'nfp',
    DATABASE_FROM = 'databaseFrom'
}

export enum KnownPathType {
    WEB = "web",
    // SURFACES = "surfaces",
    // MODB = "modB",
    NML_VMEC = "nml",
    SIMSOPT = "simsopt_serials",
    // CURRENTS = "currents",
    // POINCARE = "poincare",
    DATABASE = "database",
    // RECORD = "record"
}

export enum GraphicsType {
    WEB = KnownPathType.WEB,
    // COILS = KnownPathType.COILS,
    // CURRENTS = KnownPathType.CURRENTS,
    // SURFACES = KnownPathType.SURFACES,
    // MODB = KnownPathType.MODB,
    // POINCARE = KnownPathType.POINCARE
}

type DeviceFieldRecords = { [name in keyof Device]: DeviceManifestEntry }

export type DeviceManifestEntry = {
    label: string,
    order: number,
    displayInTable: boolean
    unit?: string,
    isLog: boolean,
    valueLabels?: { [key: string | number]: string},
}

export const DeviceFields: DeviceFieldRecords = {
    uuid: {
        label: 'UUID',
        order: 0,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined,
    },
    databaseFrom: {
        label: "Source Database",
        order: 1,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    groupName: {
        label: "Subgroup",
        order: 2,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    databaseFromId: {
        label: "ID in Source DB",
        order: 4,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    nfp: {
        label: "Number of field periods (NFP)",
        order: 5,
        displayInTable: true,
        isLog: false,
    },
    stellsym: {
        label: "Has stellarator symmetry",
        order: 50,
        displayInTable: false,
        unit: undefined,
        isLog: false,
    },
    surfaceDistances: {
        label: "Surface distances",
        order: 60,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    surface: {
        label: "Surface cartesian points",
        order: 0,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    nSurfaces: {
        label: "Number of surfaces",
        order: 59,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    aspectRatio: {
        label: "Aspect ratio",
        order: 70,
        displayInTable: true,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    minorRadius: {
        label: "Minor radius",
        order: 80,
        displayInTable: true,
        unit: METER_UNIT,
        isLog: false,
        valueLabels: undefined
    },
    volume: {
        label: "Volume",
        order: 90,
        displayInTable: true,
        unit: `${METER_UNIT}^3`,
        isLog: false,
        valueLabels: undefined
    },
    volAvgB: {
        label: "Volume-averaged B",
        order: 100,
        displayInTable: true,
        unit: `T/${METER_UNIT}`,
        isLog: false,
        valueLabels: undefined
    },
    mirrorRatio: {
        label: "Mag mirror ratio",
        order: 110,
        displayInTable: true,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    minLgradB: {
        label: "Min gradient scale length",
        order: 120,
        displayInTable: true,
        unit: METER_UNIT,
        isLog: false,
        valueLabels: undefined
    },
    modbBoozer: {
        label: "magnitude of b fields at surface",
        order: 0,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    pressure: {
        label: "Plasma pressure profile",
        order: 130,
        displayInTable: true,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    plasmaBeta: {
        label: "Vol-avg plasma beta",
        order: 140,
        displayInTable: true,
        unit: "FIXME",
        isLog: false,
        valueLabels: undefined
    },
    boozerI: {
        label: "Normalized toroidal current",
        order: 150,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    boozerG: {
        label: "Normalized poloidal current",
        order: 160,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    jdotbVmec: {
        label: "Bootstrap current (VMEC)",
        order: 170,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    iota: {
        label: "Iota profile",
        order: 180,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    vacuumWell: {
        label: "Vacuum well",
        order: 190,
        displayInTable: true,
        unit: "FIXME",
        isLog: false,
        valueLabels: undefined
    },
    mercierCriterion: {
        label: "Mercier criterion",
        order: 200,
        displayInTable: true,
        unit: "FIXME",
        isLog: false,
        valueLabels: undefined
    },
    magneticAxis: {
        label: "cartesian coordinates of magnetic axis",
        order: 0,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    integratedAxisTorsion: {
        label: "Int. torsion on mag axis",
        order: 210,
        displayInTable: true,
        unit: "FIXME",
        isLog: false,
        valueLabels: undefined
    },
    axisHelicity: {
        label: "Helicty of axis",
        order: 220,
        displayInTable: true,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    sqrtBoozerQsError: {
        label: "Root QS error",
        order: 230,
        displayInTable: true,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    epsilonEff: {
        label: "Effective ripple (epsilon)",
        order: 240,
        displayInTable: true,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    qiError: {
        label: "Goodman QI error",
        order: 250,
        displayInTable: true,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    lossTracings: {
        label: "do not display",
        order: 0,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    lossCharacteristics: {
        label: "do not display",
        order: 0,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    }
} as const


export type Translation = { abbrev: string, full: string }
export const DbFromIdAbbreviations: readonly Translation[] = [
    { abbrev: 'QH4-A8-MW',  full: '20210728-01-026_QH_nfp4_A8_magwell_aScaling' },
    { abbrev: 'QH4-A65-SF', full: '20220102-01-053-003_QH_nfp4_aspect6p5_beta0p05_iteratedWithSfincs'},
    { abbrev: 'GIU-24',     full: '20220124-01-GiulianiSurfaceOptVmecAnalysis_len24_aScaling'},
    { abbrev: 'QFM0',       full: '20220124_qfm_well0_length24_aScaling'},
    { abbrev: 'QFM1',       full: '20220124_qfm_well1_length24_aScaling'},
    { abbrev: 'QH3-A6',     full: '20220609-02-032_QH_nfp3_A6_aScaling'},
    { abbrev: 'ATEN',       full: 'aten_aScaling'},
    { abbrev: 'ATEN-HI',    full: 'aten_hires_aScaling'},
    { abbrev: 'ATF',        full: 'ATF_aScaling'},
    { abbrev: 'B000',       full: 'b000_aScaling'},
    { abbrev: 'CFQS-HI',    full: 'cfqs_2b40_hires_aScaling'},
    { abbrev: 'EST24',      full: 'estell_24_scaled_aScaling'},
    { abbrev: 'GQI1',       full: 'Goodman_QI_nfp1_aScaling'},
    { abbrev: 'HSX-V',      full: 'HSX_QHS_vacuum_ns201_aScaling'},
    { abbrev: 'HSX-NCR',    full: 'HSX_without_coil_ripple_nmax4'},
    { abbrev: 'LNF-AC-B4',  full: 'LNF1714_2537_almostARIESCScaled_beta4'},
    { abbrev: 'MO-QH3',     full: 'multiopt_scan_QH_nfp3_20210924-01-046_QH_nfp3_no_magwell_smaller_6551_aScaling'},
    { abbrev: 'NCSX',       full: 'ncsx_c09r00_fixed_aScaling'},
    { abbrev: 'LPQA-MW',    full: 'new_QA_magwell_aScaling'},
    { abbrev: 'LPQH-HI',    full: 'new_QH_hires_aScaling'},
    { abbrev: 'NZ88',       full: 'NuhrenbergZille_1988_QHS_aScaling'},
    { abbrev: 'QA-DRE-HR',  full: 'QA_beta0p025_iota0p42_dreopt_HIGHERRES_2022-04-15'},
    { abbrev: 'QI1',        full: 'QI_NFP1_r1_test_aScaling'},
    { abbrev: 'QI2',        full: 'QI_nfp2_aScaling'},
    { abbrev: 'QI3',        full: 'QI_nfp3_aScaling'},
    { abbrev: 'SP-ITER',    full: 'Spong_20160107_ITER_hybridAxisymmFixedBoundary_lasymF_aScaling'},
    { abbrev: 'ST-AUG',     full: 'st_a34_i32v22_beta_35_scaledAUG_aScaling'},
    { abbrev: 'W7X',        full: 'W7-X_standard_configuration_aScaling'},
] as const

export const DbSrcAbbreviations: readonly Translation[] = [
    { abbrev: 'Qu', full: 'quasr' },
    { abbrev: 'Qp', full: 'quasr_perturbed' },
    { abbrev: 'Co', full: 'constellaration' },
    { abbrev: 'Om', full: 'omnigenity' },
    { abbrev: 'Ka', full: 'kappel_2024' },
    { abbrev: 'Bi', full: 'bindel_2023' },
    { abbrev: 'Bp', full: 'bindel_2023_perturbed' },
] as const
