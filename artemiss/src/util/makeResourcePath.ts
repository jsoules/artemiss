import { DbFromIdAbbreviations, DbSrcAbbreviations, KnownPathType, Translation } from "@snTypes/DataDictionary"
import { ArtemissRecord, ConcatenationToken, Device, PKType } from "@snTypes/Types"

// TODO: move basename to a config file? Read from viteconfig?
const BASENAME = import.meta.env.BASE_URL
const basePath = BASENAME === '/'
                    ? import.meta.env.DEV
                        ? 'http://localhost:5173/artemiss/'
                        : 'https://artemiss.flatironinstitute.org/artemiss'
                    : `https://users.flatironinstitute.org/~mpadidar/artemiss/`


const SrcDbAbbrevMap: Map<string, Translation> = new Map(
    DbSrcAbbreviations.flatMap((x) => [[x.abbrev, x], [x.full, x]])
)


const DbFromIdAbbrevMap: Map<string, Translation> = new Map(
    DbFromIdAbbreviations.flatMap((x) => [[x.abbrev, x], [x.full, x]])
)



export type ValidId = { id: PKType }
export const getStringId = (id: PKType): ValidId => {
    return { id: id }
}


export const makeUrl = (dev: ArtemissRecord | Device): string => {
    // TODO: throw an error if the concatenation already contains the concatenation token
    const dbFrom = SrcDbAbbrevMap.get(dev.databaseFrom)?.abbrev ?? dev.databaseFrom
    const srcId = DbFromIdAbbrevMap.get(dev.databaseFromId)?.abbrev ?? dev.databaseFromId
    const clearpath = [dbFrom, dev.groupName, srcId, dev.uuid].join(ConcatenationToken)
    return encodeURIComponent(clearpath)
}


export const decodeUrlToPath = (urlFragment: string): { path: string, uuid: string } => {
    if (urlFragment === '') return { path: '', uuid: '' }
    const [dbFromAbbrev, groupName, srcIdAbbrev, uuid] = decodeURIComponent(urlFragment).split(ConcatenationToken)
    const dbFrom = SrcDbAbbrevMap.get(dbFromAbbrev)?.full ?? dbFromAbbrev
    const srcId = DbFromIdAbbrevMap.get(srcIdAbbrev)?.full ?? srcIdAbbrev
    return { path: [dbFrom, groupName, srcId, uuid].join('/'), uuid }
}


const makeResourcePath = (urlFragment: string, type: KnownPathType): string => {
    const { path: resourcePath, uuid } = decodeUrlToPath(urlFragment)

    switch (type) {
        case KnownPathType.VMEC_OUT:
            return `${basePath}${resourcePath}/preprocess/wout_${uuid}.nc`
        case KnownPathType.VMEC_IN:
            return `${basePath}${resourcePath}/preprocess/input.${uuid}`
        case KnownPathType.WEB:
            return `${basePath}${resourcePath}/web/device_data.json`
        case KnownPathType.DATABASE:
            return `${basePath}/web/database_summary.json`   // add .gz
        default:
            throw Error("Not Implemented")
    }
}

export default makeResourcePath
