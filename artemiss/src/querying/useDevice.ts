import { KnownPathType } from "@snTypes/DataDictionary"
import { defaultEmptyDevice } from '@snTypes/Defaults'
import { Device, DeviceTimeSeries, LossSeries } from "@snTypes/Types"
import makeResourcePath from "@snUtil/makeResourcePath"
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import queryFn from "./queryFn"

type FieldType = number | number[] | number[][] | number[][][] | number[][][][] | string | boolean

enum RawDeviceFields {
    UUID                         = "uuid",
    DB_FROM                      = "database_from",
    GROUP_NAME                   = "group_name",
    DB_FROM_ID                   = "database_from_ID",
    NFP                          = "nfp",
    STELLSYM                     = "stellsym",
    S1D                          = "s1d",
    SURF_XYZ                     = "surf_xyz",
    ASPECT_RATIO                 = "aspect_ratio",
    MINOR_RADIUS                 = "minor_radius",
    VOLUME                       = "volume",
    VOL_AVG_B                    = "volavgB",
    MIRROR_RATIO                 = "mirror_ratio",
    MIN_L_GRAD_B                 = "min_L_grad_B",
    MODB_BOOZER                  = "modB_boozer",
    PRESSURE                     = "pressure",
    PLASMA_BETA                  = "plasma_beta",
    BOOZER_I                     = "boozer_I",
    BOOZER_G                     = "boozer_G",
    J_DOT_B_VMEC                 = "jdotb_vmec",
    IOTA                         = "iota",
    VACUUM_WELL                  = "vacuum_well",
    MERCIER_CRITERION            = "mercier_criterion",
    MAGNETIC_AXIS                = "xyz_axis",
    INTEGRATED_AXIS_TORSION      = "integrated_axis_torsion",
    AXIS_HELICITY                = "axis_helicity",
    SQRT_BOOZER_QS_ERROR         = "sqrt_boozer_qs_error",
    EPSILON_EFF                  = "epsilon_eff",
    QI_ERROR                     = "qi_error",
    TIME                         = "time",
    LOSS_FRACTION_S_0_01         = "loss_fraction_s_0_01",
    LOSS_FRACTION_S_0_25         = "loss_fraction_s_0_25",
    LOSS_FRACTION_S_0_50         = "loss_fraction_s_0_50",
    MEAN_CONFINEMENT_TIME_S_0_01 = "mean_confinement_time_s_0_01",
    MEAN_CONFINEMENT_TIME_S_0_25 = "mean_confinement_time_s_0_25",
    MEAN_CONFINEMENT_TIME_S_0_50 = "mean_confinement_time_s_0_50",
    THETA_LOST_S_0_25            = "theta_lost_s_0_25",
    ZETA_LOST_S_0_25             = "zeta_lost_s_0_25",
    ENERGY_LOST_S_0_25           = "energy_lost_s_0_25",
}

type RawDevice = {[key in RawDeviceFields]: FieldType }

const deviceJig: { raw: RawDeviceFields, dev: keyof Device }[] = [
    { raw: RawDeviceFields.UUID,                    dev: "uuid"                  },
    { raw: RawDeviceFields.DB_FROM,                 dev: "databaseFrom"          },
    { raw: RawDeviceFields.GROUP_NAME,              dev: "groupName"             },
    { raw: RawDeviceFields.NFP,                     dev: "nfp"                   },
    { raw: RawDeviceFields.STELLSYM,                dev: "stellsym"              },
    { raw: RawDeviceFields.S1D,                     dev: "surfaceDistances"      },
    { raw: RawDeviceFields.SURF_XYZ,                dev: "surface"               },
    { raw: RawDeviceFields.ASPECT_RATIO,            dev: "aspectRatio"           },
    { raw: RawDeviceFields.MINOR_RADIUS,            dev: "minorRadius"           },
    { raw: RawDeviceFields.VOLUME,                  dev: "volume"                },
    { raw: RawDeviceFields.VOL_AVG_B,               dev: "volAvgB"               },
    { raw: RawDeviceFields.MIRROR_RATIO,            dev: "mirrorRatio"           },
    { raw: RawDeviceFields.MIN_L_GRAD_B,            dev: "minLgradB"             },
    { raw: RawDeviceFields.MODB_BOOZER,             dev: "modbBoozer"            },
    { raw: RawDeviceFields.PRESSURE,                dev: "pressure"              },
    { raw: RawDeviceFields.PLASMA_BETA,             dev: "plasmaBeta"            },
    { raw: RawDeviceFields.BOOZER_I,                dev: "boozerI"               },
    { raw: RawDeviceFields.BOOZER_G,                dev: "boozerG"               },
    { raw: RawDeviceFields.J_DOT_B_VMEC,            dev: "jdotbVmec"             },
    { raw: RawDeviceFields.IOTA,                    dev: "iota"                  },
    { raw: RawDeviceFields.VACUUM_WELL,             dev: "vacuumWell"            },
    { raw: RawDeviceFields.MERCIER_CRITERION,       dev: "mercierCriterion"      },
    { raw: RawDeviceFields.MAGNETIC_AXIS,           dev: "magneticAxis"          },
    { raw: RawDeviceFields.INTEGRATED_AXIS_TORSION, dev: "integratedAxisTorsion" },
    { raw: RawDeviceFields.AXIS_HELICITY,           dev: "axisHelicity"          },
    { raw: RawDeviceFields.SQRT_BOOZER_QS_ERROR,    dev: "sqrtBoozerQsError"     },
    { raw: RawDeviceFields.EPSILON_EFF,             dev: "epsilonEff"            },
    { raw: RawDeviceFields.QI_ERROR,                dev: "qiError"               },
]


const makeTimeSeriesFromRawDevice = (dev: RawDevice): DeviceTimeSeries => {
    const rec = {} as DeviceTimeSeries
    rec["time"] = dev[RawDeviceFields.TIME] as number[]
    rec["lossFracS0_01"] = dev[RawDeviceFields.LOSS_FRACTION_S_0_01] as number
    rec["lossFracS0_25"] = dev[RawDeviceFields.LOSS_FRACTION_S_0_25] as number
    rec["lossFracS0_50"] = dev[RawDeviceFields.LOSS_FRACTION_S_0_50] as number
    rec["meanConfinementTimeS0_01"] = dev[RawDeviceFields.MEAN_CONFINEMENT_TIME_S_0_01] as number
    rec["meanConfinementTimeS0_25"] = dev[RawDeviceFields.MEAN_CONFINEMENT_TIME_S_0_25] as number
    rec["meanConfinementTimeS0_50"] = dev[RawDeviceFields.MEAN_CONFINEMENT_TIME_S_0_50] as number

    return rec
}


const makeLossSeriesFromRawDevice = (dev: RawDevice): LossSeries => {
    const rec = {} as LossSeries
    rec["thetaLostS0_25"] = dev[RawDeviceFields.THETA_LOST_S_0_25] as number[]
    rec["zetaLostS0_25"] = dev[RawDeviceFields.ZETA_LOST_S_0_25] as number[]
    rec["energyLostS0_25"] = dev[RawDeviceFields.ENERGY_LOST_S_0_25] as number[]

    return rec
}


const makeDeviceFromRawDevice = (dev: RawDevice): Device => {
    // not sure if the direct conversion of surf_xyz, magneticAxis are gonna work
    // we'll see!
    // compare more with the useModel model
    const record = {} as {[field in keyof Device]: FieldType | DeviceTimeSeries | LossSeries }
    deviceJig.forEach(field => { record[field.dev] = dev[field.raw] })
    record["nSurfaces"] = 1//(dev['surf_xyz'] as any as number[]).length  // just hard-code 1 since we only have 1 right now TODO
    record["lossTracings"] = makeTimeSeriesFromRawDevice(dev)
    record["lossCharacteristics"] = makeLossSeriesFromRawDevice(dev)

    return record as Device
}


const deviceQueryKey = (urlChunk: string) => ['device', urlChunk]

const deviceQuery = async (urlChunk: string) => {
    const path = makeResourcePath(urlChunk, KnownPathType.WEB)
    // TODO: Compress individual records
    return queryFn<RawDevice>(path, false)
}


const useDevice = (urlChunk: string) => {
    const key = deviceQueryKey(urlChunk)
    const { data: rawDevice, error } = useQuery({
        queryKey: key,
        queryFn: () => deviceQuery(urlChunk)
    })

    if (error) {
        throw error
    }

    const device = useMemo(() => {
        if (!rawDevice) return defaultEmptyDevice
        return makeDeviceFromRawDevice(rawDevice)
    }, [urlChunk])    // note, linter/react may not like this;
    // previous version used rawDevice instead

    return device
}

export default useDevice
