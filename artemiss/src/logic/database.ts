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
    phiedge: number[],
    minor_radius: number[],
    aspect_ratio: number[],
    volume: number[],
    volavgB: number[],
    min_L_grad_B: number[],
    vacuum_well: number[],
    loss_fraction_s_0_25: number[],
}


type jigRow = { rawField: keyof RawData, objectField: KnownFields }
const recordJig: jigRow[] = [
    { rawField: "database_from",        objectField: KnownFields.DATABASE_FROM    },
    { rawField: "group_name",           objectField: KnownFields.GROUP_NAME       },
    { rawField: "uuid",                 objectField: KnownFields.ID               },
    { rawField: "database_from_ID",     objectField: KnownFields.DATABASE_FROM_ID },
    { rawField: "nfp",                  objectField: KnownFields.NFP              },
    { rawField: "phiedge",              objectField: KnownFields.PHIEDGE          },
    { rawField: "minor_radius",         objectField: KnownFields.MINOR_RADIUS     },
    { rawField: "aspect_ratio",         objectField: KnownFields.ASPECT_RATIO     },
    { rawField: "volume",               objectField: KnownFields.VOLUME           },
    { rawField: "volavgB",              objectField: KnownFields.VOL_AVG_B        },
    { rawField: "min_L_grad_B",         objectField: KnownFields.MIN_L_GRAD_B     },
    { rawField: "vacuum_well",          objectField: KnownFields.VACUUM_WELL      },
    { rawField: "loss_fraction_s_0_25", objectField: KnownFields.LOSS_FRAC_S_0_25 },
]


// const rec = {
//     uuid: data.uuid[i],
//     databaseFrom: data.database_from[i],
//     groupName: data.group_name[i],
//     databaseFromId: data.database_from_ID[i],
//     nfp: data.nfp[i],
//     phiEdge: data.phiedge[i],
//     minorRadius: data.minor_radius[i],
//     aspectRatio: data.aspect_ratio[i],
//     volume: data.volume[i],
//     volAvgB: data.volavgB[i],
//     minLgradB: data.min_L_grad_B[i],
//     vacuumWell: data.vacuum_well[i],
//     lossFractionS025: data.loss_fraction_s_0_25[i],
// } as {[field in KnownFields]: fieldType }
const makeRecordFromRowIndex = (data: RawData, i: number): ArtemissRecord => {
    const rec = {} as {[field in KnownFields]: fieldType }
    recordJig.forEach(field => { rec[field.objectField] = data[field.rawField][i] } )
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
        'databaseFrom': {}
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
