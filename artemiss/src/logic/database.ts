import { CategoricalIndexedFields, Fields, KnownFields } from "@snTypes/DataDictionary"
import { ArtemissRecord, CategoricalIndex, CategoricalIndexSet, NavigatorDatabase, RecordDict } from "@snTypes/Types"
import { makeUrl } from "@snUtil/makeResourcePath"

// NOTE: TODO: purge comments/outdated stuff

export type fieldType = number | string | string[] | number[]


export type RawData = {
    database_from: string[],
    group_name: string[],
    uuid: string[],
    database_from_ID: string[],
    nfp: number[],
    stellsym: boolean[],
    enforce_vacuum: boolean[],
    minor_radius: number[],
    aspect_ratio: number[],
    volume: number[],
    volavgB: number[],
    mirror_ratio: number[],
    min_L_grad_B: number[],
    plasma_beta: number[],
    vacuum_well: number[],
    integrated_axis_torsion: number[],
    axis_helicity: number[],

    iota_axis: number[],
    iota_mean: number[],
    iota_max: number[],
    iota_edge: number[],
    jdotb_vmec_mean: number[],
    jdotb_vmec_max: number[],
    jdotb_vmec_edge: number[],
    mercier_criterion_mean: number[],
    mercier_criterion_max: number[],
    mercier_criterion_edge: number[],
    epsilon_eff_mean: number[],
    epsilon_eff_max: number[],
    epsilon_eff_edge: number[],
    qi_error_mean: number[],
    qi_error_max: number[],
    qi_error_edge: number[],
    sqrt_boozer_qs_error_mean: number[],
    sqrt_boozer_qs_error_max: number[],
    sqrt_boozer_qs_error_edge: number[],
    loss_fraction_s_0_10: number[],
    loss_fraction_s_0_25: number[],
    loss_fraction_s_0_50: number[],
    mean_confinement_time_s_0_10: number[],
    mean_confinement_time_s_0_25: number[],
    mean_confinement_time_s_0_50: number[],
}


type jigRow = { rawField: keyof RawData, objectField: KnownFields }
const recordJig: jigRow[] = [
    { rawField: "database_from",                objectField: KnownFields.DATABASE_FROM             },
    { rawField: "group_name",                   objectField: KnownFields.GROUP_NAME                },
    { rawField: "uuid",                         objectField: KnownFields.ID                        },
    { rawField: "database_from_ID",             objectField: KnownFields.DATABASE_FROM_ID          },
    { rawField: "nfp",                          objectField: KnownFields.NFP                       },
    // { rawField: "phiedge",                      objectField: KnownFields.PHIEDGE                   },
    { rawField: "stellsym",                     objectField: KnownFields.STELLSYM                  },
    { rawField: "minor_radius",                 objectField: KnownFields.MINOR_RADIUS              },
    { rawField: "aspect_ratio",                 objectField: KnownFields.ASPECT_RATIO              },
    { rawField: "volume",                       objectField: KnownFields.VOLUME                    },
    { rawField: "volavgB",                      objectField: KnownFields.VOL_AVG_B                 },
    { rawField: "mirror_ratio",                 objectField: KnownFields.MIRROR_RATIO              },
    { rawField: "min_L_grad_B",                 objectField: KnownFields.MIN_L_GRAD_B              },
    { rawField: "plasma_beta",                  objectField: KnownFields.PLASMA_BETA               },
    { rawField: "vacuum_well",                  objectField: KnownFields.VACUUM_WELL               },
    { rawField: "integrated_axis_torsion",      objectField: KnownFields.INTEGRATED_AXIS_TORSION   },
    { rawField: "axis_helicity",                objectField: KnownFields.AXIS_HELICITY             },

    { rawField: "iota_axis",                    objectField: KnownFields.IOTA_AXIS                 },
    { rawField: "iota_mean",                    objectField: KnownFields.IOTA_MEAN                 },
    { rawField: "iota_max",                     objectField: KnownFields.IOTA_MAX                  },
    { rawField: "iota_edge",                    objectField: KnownFields.IOTA_EDGE                 },
    { rawField: "jdotb_vmec_mean",              objectField: KnownFields.JDOTB_VMEC_MEAN           },
    { rawField: "jdotb_vmec_max",               objectField: KnownFields.JDOTB_VMEC_MAX            },
    { rawField: "jdotb_vmec_edge",              objectField: KnownFields.JDOTB_VMEC_EDGE           },
    { rawField: "mercier_criterion_mean",       objectField: KnownFields.MERCIER_MEAN              },
    { rawField: "mercier_criterion_max",        objectField: KnownFields.MERCIER_MAX               },
    { rawField: "mercier_criterion_edge",       objectField: KnownFields.MERCIER_EDGE              },
    { rawField: "epsilon_eff_mean",             objectField: KnownFields.EPSILON_EFF_MEAN          },
    { rawField: "epsilon_eff_max",              objectField: KnownFields.EPSILON_EFF_MAX           },
    { rawField: "epsilon_eff_edge",             objectField: KnownFields.EPSILON_EFF_EDGE          },
    { rawField: "qi_error_mean",                objectField: KnownFields.QI_ERROR_MEAN             },
    { rawField: "qi_error_max",                 objectField: KnownFields.QI_ERROR_MAX              },
    { rawField: "qi_error_edge",                objectField: KnownFields.QI_ERROR_EDGE             },
    { rawField: "sqrt_boozer_qs_error_mean",    objectField: KnownFields.SQRT_BOOZER_QS_ERROR_MEAN },
    { rawField: "sqrt_boozer_qs_error_max",     objectField: KnownFields.SQRT_BOOZER_QS_ERROR_MAX  },
    { rawField: "sqrt_boozer_qs_error_edge",    objectField: KnownFields.SQRT_BOOZER_QS_ERROR_EDGE },
    { rawField: "loss_fraction_s_0_10",         objectField: KnownFields.LOSS_FRAC_S_0_10          },
    { rawField: "loss_fraction_s_0_25",         objectField: KnownFields.LOSS_FRAC_S_0_25          },
    { rawField: "loss_fraction_s_0_50",         objectField: KnownFields.LOSS_FRAC_S_0_50          },
    { rawField: "mean_confinement_time_s_0_10", objectField: KnownFields.MEAN_CONF_T_S_0_10        },
    { rawField: "mean_confinement_time_s_0_25", objectField: KnownFields.MEAN_CONF_T_S_0_25        },
    { rawField: "mean_confinement_time_s_0_50", objectField: KnownFields.MEAN_CONF_T_S_0_50        },
]


const _numberizeBools = (field: fieldType | boolean): fieldType => {
    if (typeof field !== 'boolean') return field
    return field ? 1 : 0
}

const makeRecordFromRowIndex = (data: RawData, i: number): ArtemissRecord => {

    const rec = {} as {[field in KnownFields]: fieldType }
    recordJig.forEach(field => { rec[field.objectField] = _numberizeBools(data[field.rawField][i]) } )
    rec['canonicalPath'] = makeUrl(rec as ArtemissRecord)
    return rec as ArtemissRecord
}


// export const makeRecordFromObject = (rawRecord: rawObject): ArtemissRecord => {
//     const record = {} as {[field in KnownFields]: fieldType}
//     recordJig.forEach(field => { record[field.objectField] = rawRecord[field.raw] })
//     return record as ArtemissRecord
// }

// const makeRecordFromRow = (row: fieldType[]): ArtemissRecord => {
//     const record = {} as {[field in KnownFields]: fieldType}
//     recordJig.forEach(field => record[field.objectField] = row[field.order])
//     return record as ArtemissRecord
// }



export const makeDatabase = (rawData: RawData) => {
    const dataDict: RecordDict = {}
    const categoricalFieldIndexes: CategoricalIndexSet = {
        'nfp': {},
        'axisHelicity': {},
        'databaseFrom': {},
        // 'nSurfaces': {},
    }
    const categoricalFields = Object.keys(categoricalFieldIndexes) as CategoricalIndexedFields[]
    const dataList: ArtemissRecord[] = rawData.aspect_ratio.map((_, i) => makeRecordFromRowIndex(rawData, i))

    // for (let i in rawData.aspect_ratio) {
    //     dataList.push(makeRecordFromRowIndex(rawData, i))
    // }
    dataList.forEach(entry => { dataDict[entry.uuid] = entry })

    categoricalFields.forEach(k => {
        const vals = Fields[k].values
        if (vals === undefined) {
            throw Error(`Bad value in indexes-keys: ${k}`)
        }
        const key = k as keyof ArtemissRecord
        const idx: CategoricalIndex = {}
        vals.forEach(v => {
            idx[v] = new Set(dataList.filter(row => `${row[key]}` === v).map(row => row.uuid))
        })
        categoricalFieldIndexes[k] = idx
    })


    const database: NavigatorDatabase = {
        list: dataList,
        byId: dataDict,
        allIdSet: new Set(dataList.map(r => r.uuid)),
        //---Indexes
        categoricalIndexes: categoricalFieldIndexes
    }

    return database
}
