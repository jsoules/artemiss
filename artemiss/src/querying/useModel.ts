import { applySurfaceSymmetries } from "@snComponents/display/visualizer/symmetries"
import { defaultEmptyDevice } from "@snTypes/Defaults"
import { Device, Device3dModel } from "@snTypes/Types"
import { useMemo } from 'react'

// Need to fetch (in parallel) the coils, currents, surfaces, and modB
// fortunately, multiple useQuery calls will run in parallel

// so a potential distinction we might make is between the Model, which has the
// potentially fully-enumerated surfaces and their colorations, and the
// Device, which is just the full data record from the db.
// I think I would make the file distinction as well b/c there's a lot of stuff in the
// useRecord.ts file that doesn't need to be visible outside of it.
// So maybe make this clearer as Device3dModel

// Save the querying stuff as we'll handle it elsewhere.



const useDevice3dModel = (dev: Device): Device3dModel => {
    const baseSurf = useMemo(() => [dev.surface], [dev.uuid])
    const baseModB = useMemo(() => dev.modbBoozer, [dev.uuid])
    const {fullSurf, fullModB} = useMemo(() => {
        return dev.uuid === defaultEmptyDevice.uuid
            ? { fullSurf: [], fullModB: [] }
            : applySurfaceSymmetries(baseSurf, baseModB, dev.nfp)
    }, [dev.uuid])

    return {
        surfaceCount: 1,
        baseSurfaces: baseSurf,
        fullSurfaces: fullSurf,
        baseModBboozer: baseModB,
        fullModBboozer: fullModB
    } as Device3dModel
}


// Keeping this around just for a sec for reference
// // // TODO: Compress all files on server!
// // const coilsQueryKey = (validId: ValidId) => ['coils', validId.id]
// // const coilsQueryFn = async (validId: ValidId) => {
// //     const path = makeResourcePath(getStringId(validId.id), KnownPathType.COILS)
// //     return queryFn<Vec3[][]>(path, false)
// // }

// // const currentsQueryKey = (validId: ValidId) => ['currents', validId.id]
// // const currentsQueryFn = async (validId: ValidId) => {
// //     const path = makeResourcePath(getStringId(validId.id), KnownPathType.CURRENTS)
// //     return queryFn<number[]>(path, false)
// // }

// // const modBQueryKey = (validId: ValidId) => ['modB', validId.id]
// // const modBQueryFn = async (validId: ValidId) => {
// //     const path = makeResourcePath(getStringId(validId.id), KnownPathType.MODB)
// //     return queryFn<ScalarField[]>(path, false)
// // }

// // const surfacesQueryKey = (validId: ValidId) => ['surfaces', validId.id]
// // const surfacesQueryFn = async (validId: ValidId) => {
// //     const path = makeResourcePath(getStringId(validId.id), KnownPathType.SURFACES)
// //     return queryFn<Vec3Field[]>(path, false)
// // }


// // const handleCoils = (validId: ValidId, coilData: Vec3[][] | undefined, currentData: number[] | undefined): CoilRecord[] => {
// //     if (coilData === undefined || currentData === undefined) return []
// //     if (coilData.length !== currentData.length) throw Error(`Mismatched record lengths for record ${validId.id}: coils ${coilData.length}, currents ${currentData.length}`)
// //     return currentData.map((current, idx) => ({ coil: coilData[idx], current } as CoilRecord))
// // }


// // const handleSurfaces = (validId: ValidId, surfacePts: Vec3Field[] | undefined, pointValues: ScalarField[] | undefined): SurfaceObject => {
// //     if (surfacePts === undefined || pointValues === undefined) return { surfacePoints: [], pointValues: [], incomplete: true }
// //     if (surfacePts.length !== pointValues.length) throw Error(`Mismatched record lengths for record ${validId.id}: surfaces ${surfacePts.length}, values ${pointValues.length}`)
// //     return { surfacePoints: surfacePts, pointValues: pointValues, incomplete: false } 
// // }


// // const useModel = (id: string | number, nfp: number) => {
// //     const stringId = getStringId(id)
// //     const coilsQuery = useQuery({ 
// //         queryKey: coilsQueryKey(stringId), 
// //         queryFn: () => coilsQueryFn(stringId)
// //     })
// //     const currentsQuery = useQuery({ 
// //         queryKey: currentsQueryKey(stringId),
// //         queryFn: () => currentsQueryFn(stringId)
// //     })
// //     const modBQuery = useQuery({ 
// //         queryKey: modBQueryKey(stringId),
// //         queryFn: () => modBQueryFn(stringId)
// //     })
// //     const surfacesQuery = useQuery({ 
// //         queryKey: surfacesQueryKey(stringId),
// //         queryFn: () => surfacesQueryFn(stringId)
// //     })
    
// //     const errs = [coilsQuery.error, currentsQuery.error, modBQuery.error, surfacesQuery.error]
// //     errs.forEach(e => {if (e) throw e})

// //     const baseCoils = useMemo(() => handleCoils(stringId, coilsQuery.data, currentsQuery.data), [coilsQuery.data, currentsQuery.data, stringId])
// //     const baseSurfaces = useMemo(() => handleSurfaces(stringId, surfacesQuery.data, modBQuery.data), [modBQuery.data, stringId, surfacesQuery.data])

// //     const fullCoils = useMemo(() => {
// //         if (baseCoils.length === 0) return undefined
// //         if (baseCoils.some(c => c.coil.length === 0)) return undefined
// //         return applyCoilSymmetries(baseCoils, nfp)
// //     }, [baseCoils, nfp])

// //     const fullSurfs = useMemo(() => {
// //         if (baseSurfaces.incomplete) return undefined
    
// //         return applySurfaceSymmetries(baseSurfaces, nfp)
// //     }, [baseSurfaces, nfp])

// //     const record = useMemo(() => 
// //         ({
// //             baseCoils,
// //             baseSurfs: baseSurfaces.incomplete ? undefined : baseSurfaces,
// //             fullCoils,
// //             fullSurfs,
// //             surfaceCount: surfacesQuery.data?.length ?? 0
// //         }), [baseCoils, baseSurfaces, fullCoils, fullSurfs, surfacesQuery.data?.length])
    
// //     return record
// // }

// export default useModel
export default useDevice3dModel
