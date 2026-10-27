/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
import { Device } from "@snTypes/Types"

export const getEnumVals = (x: object): string[] => {
    return (Object.values(x) as string[]).filter(v => isNaN(Number(v)))
}

// NOTE that these should refer to the INTERNAL spellings/names, not necessarily
// the ones used in the source json
export enum KnownFields {
    ROWID = 'rowid',
    ID = 'uuid',
    DATABASE_FROM = 'databaseFrom',
    GROUP_NAME = 'groupName',
    DATABASE_FROM_ID = 'databaseFromId',
    CANONICAL_PATH = 'canonicalPath',
    NFP = 'nfp',
    STELLSYM = 'stellsym',  // *
    ENFORCE_VACUUM = 'enforceVacuum',   // *
    MINOR_RADIUS = 'minorRadius',
    ASPECT_RATIO = 'aspectRatio',
    VOLUME = 'volume',
    VOL_AVG_B = 'volAvgB',
    MIRROR_RATIO = 'mirrorRatio',
    MIN_L_GRAD_B = 'minLgradB',
    PLASMA_BETA = 'plasmaBeta',
    VACUUM_WELL = 'vacuumWell',
    AXIS_HELICITY = 'axisHelicity',
    IOTA_MEAN = 'iotaMean',
    MERCIER_MAX = 'mercierCriterionMax',
    SQRT_BOOZER_QS_ERROR_MEAN = 'sqrtBoozerQsErrMean',
    LOSS_FRAC_S_0_25 = 'lossFractionS025',
    MEAN_CONF_T_S_0_25 = 'meanConfinementTimeS025',
}

export enum DependentVariables {
    // DATABASE_FROM = KnownFields.DATABASE_FROM,
    // GROUP_NAME = KnownFields.GROUP_NAME,
    NFP = KnownFields.NFP,
    MINOR_RADIUS = KnownFields.MINOR_RADIUS,
    ASPECT_RATIO = KnownFields.ASPECT_RATIO,
    VOLUME = KnownFields.VOLUME,
    VOL_AVG_B = KnownFields.VOL_AVG_B,
    MIRROR_RATIO = KnownFields.MIRROR_RATIO,
    MIN_L_GRAD_B = KnownFields.MIN_L_GRAD_B,
    PLASMA_BETA = KnownFields.PLASMA_BETA,
    VACUUM_WELL = KnownFields.VACUUM_WELL,
    AXIS_HELICITY = KnownFields.AXIS_HELICITY,
    IOTA_MEAN = KnownFields.IOTA_MEAN,
    MERCIER_MAX = KnownFields.MERCIER_MAX,
    SQRT_BOOZER_QS_ERROR_MEAN = KnownFields.SQRT_BOOZER_QS_ERROR_MEAN,
    LOSS_FRAC_S_0_25 = KnownFields.LOSS_FRAC_S_0_25,
    MEAN_CONF_T_S_0_25 = KnownFields.MEAN_CONF_T_S_0_25,
}

export enum IndependentVariables {
    // DATABASE_FROM = KnownFields.DATABASE_FROM,
    // GROUP_NAME = KnownFields.GROUP_NAME,
    NFP = KnownFields.NFP,
    MINOR_RADIUS = KnownFields.MINOR_RADIUS,
    ASPECT_RATIO = KnownFields.ASPECT_RATIO,
    VOLUME = KnownFields.VOLUME,
    VOL_AVG_B = KnownFields.VOL_AVG_B,
    MIRROR_RATIO = KnownFields.MIRROR_RATIO,
    MIN_L_GRAD_B = KnownFields.MIN_L_GRAD_B,
    PLASMA_BETA = KnownFields.PLASMA_BETA,
    VACUUM_WELL = KnownFields.VACUUM_WELL,
    AXIS_HELICITY = KnownFields.AXIS_HELICITY,
    IOTA_MEAN = KnownFields.IOTA_MEAN,
    MERCIER_MAX = KnownFields.MERCIER_MAX,
    SQRT_BOOZER_QS_ERROR_MEAN = KnownFields.SQRT_BOOZER_QS_ERROR_MEAN,
    LOSS_FRAC_S_0_25 = KnownFields.LOSS_FRAC_S_0_25,
    MEAN_CONF_T_S_0_25 = KnownFields.MEAN_CONF_T_S_0_25,
}

export enum ToggleableVariables {
    DATABASE_FROM = KnownFields.DATABASE_FROM,
    NFP = KnownFields.NFP,
    AXIS_HELICITY = KnownFields.AXIS_HELICITY,
    STELLSYM = KnownFields.STELLSYM,
    ENFORCE_VACUUM = KnownFields.ENFORCE_VACUUM,
}

export enum RangeVariables {
    // PHIEDGE = KnownFields.PHIEDGE,
    MINOR_RADIUS = KnownFields.MINOR_RADIUS,
    ASPECT_RATIO = KnownFields.ASPECT_RATIO,
    VOLUME = KnownFields.VOLUME,
    VOL_AVG_B = KnownFields.VOL_AVG_B,
    MIRROR_RATIO = KnownFields.MIRROR_RATIO,
    MIN_L_GRAD_B = KnownFields.MIN_L_GRAD_B,
    PLASMA_BETA = KnownFields.PLASMA_BETA,
    VACUUM_WELL = KnownFields.VACUUM_WELL,
    IOTA_MEAN = KnownFields.IOTA_MEAN,
    MERCIER_MAX = KnownFields.MERCIER_MAX,
    SQRT_BOOZER_QS_ERROR_MEAN = KnownFields.SQRT_BOOZER_QS_ERROR_MEAN,
    LOSS_FRAC_S_0_25 = KnownFields.LOSS_FRAC_S_0_25,
    MEAN_CONF_T_S_0_25 = KnownFields.MEAN_CONF_T_S_0_25,
}

export enum TripartiteVariables {
    // N_FOURIER_COIL = KnownFields.N_FOURIER_COIL,
    // HELICITY = KnownFields.HELICITY,
}

export const dependentVariableDropdownConfig: { key: number, value: DependentVariables }[] = [
    // { key:  1, value: DependentVariables.DATABASE_FROM               },
    // { key:  2, value: DependentVariables.GROUP_NAME                  },
    // { key:  1, value: DependentVariables.NFP                         },
    // { key:  1, value: DependentVariables.PHIEDGE                     },
    { key:  1, value: DependentVariables.MINOR_RADIUS                },
    { key:  2, value: DependentVariables.ASPECT_RATIO                },
    { key:  3, value: DependentVariables.VOLUME                      },
    { key:  4, value: DependentVariables.VOL_AVG_B                   },
    { key:  5, value: DependentVariables.MIRROR_RATIO                },
    { key:  6, value: DependentVariables.MIN_L_GRAD_B                },
    { key:  7, value: DependentVariables.PLASMA_BETA                 },
    { key:  8, value: DependentVariables.VACUUM_WELL                 },
    { key: 10, value: DependentVariables.AXIS_HELICITY               },
    { key: 12, value: DependentVariables.IOTA_MEAN                   },
    { key: 19, value: DependentVariables.MERCIER_MAX                 },
    { key: 27, value: DependentVariables.SQRT_BOOZER_QS_ERROR_MEAN   },
    { key: 31, value: DependentVariables.LOSS_FRAC_S_0_25            },
    { key: 34, value: DependentVariables.MEAN_CONF_T_S_0_25          },
]

export const independentVariableDropdownConfig: { key: number, value: IndependentVariables }[] = [
    // { key:  1, value: IndependentVariables.DATABASE_FROM               },
    // { key:  2, value: IndependentVariables.GROUP_NAME                  },
    { key:  1, value: IndependentVariables.NFP                         },
    { key:  2, value: IndependentVariables.MINOR_RADIUS                },
    { key:  3, value: IndependentVariables.ASPECT_RATIO                },
    { key:  4, value: IndependentVariables.VOLUME                      },
    { key:  5, value: IndependentVariables.VOL_AVG_B                   },
    { key:  6, value: IndependentVariables.MIRROR_RATIO                },
    { key:  7, value: IndependentVariables.MIN_L_GRAD_B                },
    { key:  8, value: IndependentVariables.PLASMA_BETA                 },
    { key:  9, value: IndependentVariables.VACUUM_WELL                 },
    { key: 11, value: IndependentVariables.AXIS_HELICITY               },
    { key: 13, value: IndependentVariables.IOTA_MEAN                   },
    { key: 20, value: IndependentVariables.MERCIER_MAX                 },
    { key: 28, value: IndependentVariables.SQRT_BOOZER_QS_ERROR_MEAN   },
    { key: 32, value: IndependentVariables.LOSS_FRAC_S_0_25            },
    { key: 35, value: IndependentVariables.MEAN_CONF_T_S_0_25          },
]

export const toggleableVariableDropdownConfig: { key: number, value: ToggleableVariables }[] = [
    { key: 1,  value: ToggleableVariables.DATABASE_FROM   },
    // { key: 2,  value: ToggleableVariables.NC_PER_HP       },
    { key: 3,  value: ToggleableVariables.NFP             },
    { key: 5,  value: ToggleableVariables.AXIS_HELICITY   },
    { key: 8,  value: ToggleableVariables.STELLSYM        },
    { key: 12, value: ToggleableVariables.ENFORCE_VACUUM  },
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
    values?: string[],
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
    1, 2, 3, 4, 5, 6, 12
].map(x => `${x}`)

export const databaseFromValidValues = [
    "bindel_2023",
    "bindel_2023_perturbed",
    "constellaration",
    "fast_ion_opt_2026",
    "kappel_2024",
    "model_improvement_2026",
    "model_improvement_bo_2026",
    "omnigenity",
    "random_ellipse",
    "random_ellipse_perturbed",
    "quasr",
    "quasr_perturbed",
]

export const axisHelicityValidValues = [
    -4, -3, -2, -1, 0, 1, 2, 3, 4
].map(x => `${x}`)

export const trueFalseValidValues = [
    0, 1
].map(x => `${x ? 'no' : 'yes'}`)


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


// NOTE: This describes the fields in the *overview database*. It does NOT describe
// the full data set in the per-record payload file. That's to be handled separately.

// TODO: add sorting order field for table
// TODO: Consider adding "as const" to each entry
// TODO: Figure out how to key this off the KnownFields enum already

const METER_UNIT = "M"
export const Fields: FieldRecords = {
    'rowid': {
        shortLabel: "ROWID",
        plotLabel: "ROWID",
        fullLabel: "Arbitrary numeric ID",
        description: "Arbitrary numeric ID",
        unit: undefined,
        range: [0, 200000],
        isLog: false,
        isCategorical: true,
        markedValue: undefined,
        tableColumnWidth: undefined,
        displayInTable: false
    } as const,
    'uuid': {
        shortLabel: "UUID",
        plotLabel: "UUID",
        fullLabel: "Device ID",
        description: "Artemiss-assigned unique device identifier",
        unit: undefined,
        range: [952, 2793242],      // NOTE: This is pleonastic, we don't actually need it
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
        // valueLabels: databaseFromLabels,
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
        range: [1, 12],
        values: nfpValidValues,
        // valueLabels: nfpValidValues.map(i => `${i}`),
        isLog: false,
        isCategorical: true,
        markedValue: undefined,
        tableColumnWidth: 75,
        displayInTable: true
    },
    'stellsym': {
        shortLabel: "Stell. sym.",
        plotLabel: "Stellarator symmetry",
        fullLabel: "Stellarator symmetry",
        description: "Device has stellarator symmetry",
        unit: undefined,
        range: [-1, 1],
        values: trueFalseValidValues,
        isLog: false,
        isCategorical: true,
        displayInTable: true
    },
    'enforceVacuum': {
        // Key is that True means the devices being shown have no pressure.
        shortLabel: "Enforce vacuum",
        plotLabel: "Enforce vacuum",
        fullLabel: "Device is pressure-free",
        description: "True for devices which have no pressure",
        unit: undefined,
        range: [-1, 1],
        values: trueFalseValidValues,
        isLog: false,
        isCategorical: true,
        displayInTable: true
    },
    'minorRadius': {
        shortLabel: "Minor rad",
        plotLabel: "Minor radius",
        fullLabel: "Minor radius",
        description: "The minor radius of the outermost surface (unscaled)",
        unit: METER_UNIT,
        range: [0.4, 2.51],
        isLog: false,
        isCategorical: false,
        displayInTable: true
    },
    'aspectRatio': {
        shortLabel: "AR",
        plotLabel: "Aspect ratio",
        fullLabel: "Aspect ratio (AR)",
        description: "The aspect ratio of the device, computed using the VMEC definition",
        range: [1.245, 25.145],
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
        range: [-3077., 3672.],
        isLog: false,
        isCategorical: false,
        displayInTable: true
    },
    'volAvgB': {
        shortLabel: "Vol-avg-B",
        plotLabel: "Volume avg B",
        fullLabel: "Volume-averaged B",
        description: "Magnetic field strength averaged over the plasma volume",
        unit: `T`,
        range: [3.97, 10.96],
        // values: totalCoilLengthValidValues,
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 80,
        displayInTable: true
    },
    'mirrorRatio': {
        shortLabel: "mirror",
        plotLabel: "mirror ratio",
        fullLabel: "Mirror Ratio",
        description: "Magnetic mirror ratio",
        range: [-55.34, 665.28],
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
        range: [-0.00005, 665.3],
        // values: meanIotaValidValues,
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 90,
        displayInTable: true
    },
    'plasmaBeta': {
        shortLabel: "plasma_B",
        plotLabel: "plasma B",
        fullLabel: "Plasma beta",
        description: "Volume-averaged plasma beta",
        unit: undefined,
        range: [0.0, 0.0565],
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
        // unit: `${METER_UNIT}^3`,
        unit: undefined,
        range: [-4.25, 0.636],
        // values: ncPerHpValidValues,
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 80,
        displayInTable: true
    },
    'axisHelicity': {
        shortLabel: "helicity",
        plotLabel: "Axis helicity",
        fullLabel: "Axis Helicity",
        description: "Helicity of Axis",
        unit: undefined,
        range: [-4, 4],
        values: axisHelicityValidValues,
        isLog: false,
        isCategorical: true,
        markedValue: undefined,
        tableColumnWidth: 80,
        displayInTable: true
    },
    'iotaMean': {
        shortLabel: "iota mean",
        plotLabel: "Iota Mean",
        fullLabel: "Iota Mean",
        description: "Mean value of rotational transform",
        range: [-3.7, 2.86],
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 90,
        displayInTable: true
    },
    'mercierCriterionMax': {
        shortLabel: "mercierMax",
        plotLabel: "Mercier (max value)",
        fullLabel: "Mercier Criterion max value",
        description: "Max value of Mercier stability criterion (positive values stable)",
        // TODO: Should match vacuum well, once we decide what that is
        unit: undefined,
        range: [-2392, 0.521],
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 80,
        displayInTable: true
    },
    'sqrtBoozerQsErrMean': {
        shortLabel: "sqrt-qs avg",
        plotLabel: "sqrt(qs) (mean)",
        fullLabel: "Root of Boozer QS Error mean value",
        description: "Square root of Boozer QS error, mean value",
        range: [.00352, 1.03],
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 80,
        displayInTable: true
    },
    'lossFractionS025': {
        shortLabel: "Loss Frac 025",
        plotLabel: "Loss frac s=0.25",
        fullLabel: "Loss fraction S=0.25",
        description: "Fraction of particles born on s=0.25 that escape plasma within 0.1 seconds",
        range: [0.0, 1.01],
        isLog: false,
        isCategorical: false,
        markedValue: undefined,
        tableColumnWidth: 75,
        displayInTable: true
    },
    'meanConfinementTimeS025': {
        shortLabel: "Mean conf time 025",
        plotLabel: "Mean conf s=0.25",
        fullLabel: "Mean confinement time S=0.25",
        description: "Mean confinement time of particles born on s=0.25",
        unit: 'S',
        range: [0.0, .1],
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
    NFP = ToggleableVariables.NFP,
    AXIS_HELICITY = ToggleableVariables.AXIS_HELICITY,
    DATABASE_FROM = ToggleableVariables.DATABASE_FROM,
    STELLSYM = ToggleableVariables.STELLSYM,
    ENFORCE_VACUUM = ToggleableVariables.ENFORCE_VACUUM
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
    desc?: string,
    order: number,
    displayInTable: boolean
    unit?: string,
    truncateTo?: number,
    isLog: boolean,
    valueLabels?: { [key: string | number]: string},
}

export const DeviceFields: DeviceFieldRecords = {
    uuid: {
        label: 'UUID',
        desc: "Unique identifier",
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
        label: "Source-ID",
        desc: "ID in source database",
        order: 4,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    nfp: {
        label: "NFP",
        desc: "Number of field periods",
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
    enforceVacuum: {
        label: "Vaccum enforced",
        order: 53,
        displayInTable: false,
        unit: undefined,
        isLog: false,
    },
    surfaceDistances: {
        label: "Surface distances",
        desc: "Normalized toroidal flux (s)",
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
        desc: "aspect ratio",
        order: 70,
        displayInTable: true,
        unit: undefined,
        truncateTo: 4,
        isLog: false,
        valueLabels: undefined
    },
    minorRadius: {
        label: "Minor radius",
        desc: "minor radius",
        order: 80,
        displayInTable: true,
        unit: METER_UNIT,
        truncateTo: 4,
        isLog: false,
        valueLabels: undefined
    },
    volume: {
        label: "Volume",
        desc: "volume",
        order: 90,
        displayInTable: true,
        unit: `${METER_UNIT}^3`,
        truncateTo: 4,
        isLog: false,
        valueLabels: undefined
    },
    volAvgB: {
        label: "Volume-averaged B",
        desc: "Volume-averaged magnetic field",
        order: 100,
        displayInTable: true,
        unit: `T/${METER_UNIT}`,
        truncateTo: 4,
        isLog: false,
        valueLabels: undefined
    },
    mirrorRatio: {
        label: "Mag mirror ratio",
        desc: "Magnetic mirror ratio",
        order: 110,
        displayInTable: true,
        unit: undefined,
        truncateTo: 4,
        isLog: false,
        valueLabels: undefined
    },
    minLgradB: {
        label: "Min gradient scale length",
        order: 120,
        displayInTable: true,
        unit: METER_UNIT,
        truncateTo: 4,
        isLog: false,
        valueLabels: undefined
    },
    modb: {
        label: "Mod B",
        desc: "magnitude of B fields at surface",
        order: 0,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    modbBoozer: {
        label: "Mod-B Boozer",
        desc: "magitude of B fields at surface",
        order: 0,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    pressure: {
        label: "Plasma pressure",
        desc: "Plasma pressure profile",
        order: 300,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    plasmaBeta: {
        label: "Plasma beta",
        desc: "Volume-averaged plasma beta",
        order: 140,
        displayInTable: true,
        unit: undefined,
        truncateTo: 4,
        isLog: false,
        valueLabels: undefined
    },
    toroidalCurrent: {
        label: "Toroidal current",
        desc: "Enclosed toroidal current profile on the surfaces",
        order: 155,
        displayInTable: false,
        unit: "Amperes",
        isLog: false,
        valueLabels: undefined
    },
    jdotbVmec: {
        label: "J dot B",
        desc: "Bootstrap current (VMEC)",
        order: 170,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    iota: {
        label: "Iota profile",
        desc: "Iota profile",
        order: 180,
        displayInTable: false,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    vacuumWell: {
        label: "Vacuum well",
        desc: "vacuum well",
        order: 190,
        displayInTable: true,
        unit: undefined,    // TODO: SEE ABOVE
        truncateTo: 4,
        isLog: false,
        valueLabels: undefined
    },
    mercierCriterion: {
        label: "Mercier criterion",
        desc: "Mercier criterion",
        order: 200,
        displayInTable: false,
        unit: undefined, //"TODO -- see above
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
        label: "Int Axis Torsion",
        desc: "Integrated torsion on magnetic axis",
        order: 210,
        displayInTable: true,
        unit: undefined,
        truncateTo: 4,
        isLog: false,
        valueLabels: undefined
    },
    axisHelicity: {
        label: "Axis helicity",
        desc: "helicity of axis",
        order: 220,
        displayInTable: true,
        unit: undefined,
        isLog: false,
        valueLabels: undefined
    },
    sqrtBoozerQsError: {
        label: "Sqrt Boozer QS",
        desc: "Root of Boozer QS error",
        order: 230,
        displayInTable: false,
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
// NOTE: GOTTA DROP THIS--there are ~93k unique values
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

// TODO: UPDATE (after confirming with MP)
export const DbSrcAbbreviations: readonly Translation[] = [
    { abbrev: 'Qu', full: 'quasr' },
    { abbrev: 'Qp', full: 'quasr_perturbed' },
    { abbrev: 'Co', full: 'constellaration' },
    { abbrev: 'Om', full: 'omnigenity' },
    { abbrev: 'Ka', full: 'kappel_2024' },
    { abbrev: 'Bi', full: 'bindel_2023' },
    { abbrev: 'Bp', full: 'bindel_2023_perturbed' },
] as const
