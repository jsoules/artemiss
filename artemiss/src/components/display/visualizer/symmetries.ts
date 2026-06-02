import { ScalarField, Vec3Field } from '@snTypes/Types'
import { Matrix, concat, cos, matrix, multiply, reshape, sin } from 'mathjs'
import { SURFACE_SIDE_RESOLUTION } from './geometry'

const coilTransformMatrices: Record<number, Matrix[]> = {}
const surfaceTransformMatrices: Record<number, Matrix[]> = {}

const S = matrix([[1, 0, 0], [0, -1, 0], [0, 0, -1] ])
// Create an array of 8 elements (8 being the maximum number of field periods).
// Each element should be an array of length (index + 1),
// whose contents are (0 ... index) * 2pi/(index + 1), i.e. the angles of rotational
// symmetry that would give you a complete revolution when there are n units per half-period.
// (Note that's *half* period; we have to fill in the second half of the period using the
// "stellarator symmetry", a 180-degree rotation around the X axis.)
// This computes the angles of rotational symmetry (over the Z axis) for one half-period for
// a device with n symmetries per half-period.
const angleFractionsPerNfp = new Array(12).fill(1)
    .map((_, i) => (
        new Array(i + 1).fill(1).map((_, j) => (j) * -2 * Math.PI / (i + 1))
    ))

// For the coils, for each of the angles of z-axis rotational symmetry, we need two transform matrices.
// One gives the rotated values of the base coils in their proper orientation at that rotation;
// the other is the "stellarator symmetry" i.e. a reflection over the y & z axes (or 180-degree
// rotation around x) that fills in the second half of the period.
// For coils, we do this as two separate matrices, because we want to keep the coils separate.
// To find the transforms, map R over the computed angle fractions for that NFP value.
angleFractionsPerNfp.map((v, i) => {
    coilTransformMatrices[i + 1] = v.map(angle => {
        const R = matrix([[cos(angle), -sin(angle), 0],
                          [sin(angle),  cos(angle), 0],
                          [         0,           0, 1]])
        const RFlipped = multiply(R, S)
        return [R, RFlipped]
    }).flat()
})


// For surfaces, because of the way the surface points are represented, the accounting for the proper order
// in which to stitch them together (in the triangulation step) becomes challenging if we do the "stellarator"
// (180-degree-x-axis-rotational) symmetry separate from the "period count" (n angles per half-period,
// rotational-about-y-axis) symmetry. So instead we'll expand the half period to a full period once, and then
// rotate the result. It also helps that while the coils need to be kept separate, for the surfaces we're
// actually trying to fuse them.
angleFractionsPerNfp.map((v, i) => {
    surfaceTransformMatrices[i + 1] = v.map(angle =>
        matrix([[cos(angle), -sin(angle), 0],
                [sin(angle),  cos(angle), 0],
                [         0,           0, 1]]))
})


// /**
//  * Expand a device's coils across the full stellarator ring.
//  * 
//  * @param inputCoils The coils for one half-period, arranged as an array of
//  * 3-vector points, in sequence.
//  * @param nfp The number of field periods, aka number of rotational symmetries.
//  * @returns A new set of coils that completes the full ring around the Z axis,
//  * properly oriented to honor both types of symmetry. Each coil can still be
//  * plotted individually. If there were k coils in the input set, there will be
//  * 2 * k * nfp coils in the resulting output.
//  */
// export const applyCoilSymmetries = (coilRecords: CoilRecord[], nfp: number): CoilRecord[] => {
//     // Each coil is represented as 161 points in x-y-z space making a loop.
//     // Step 1: convert our array of 3-vector 161-point loops into an array of N [coils] matrices,
//     // each 161 [point-count] x 3 [x,y,z]
//     const inputsAsMatrices = coilRecords.map(record => 
//         matrix(record.coil.map(pt => [...pt]))
//     )
//     // Step 2: apply transformations to matrix to create the missing coils
//     const transforms = coilTransformMatrices[nfp]
//     // The mult gives us a list of transformed coil groups based on the original input coil:
//     const realizedCoilMatrixSets = inputsAsMatrices.map(obj => transforms.map(t => multiply(obj, t)))
//     // For each of these groups, convert each of the [2 * nfp * ncPerHp] result matrices back into
//     // an array of 161 Vec3s, then wrap that back into a CoilApiResponseRecord so that it has the correct current.
//     // Finally, flatten the overall result and return.
//     const coilGroupsWithCurrents = realizedCoilMatrixSets.map((matrixGroup, groupIndex) =>
//         matrixGroup.map((coilMatrix) => {
//             const pts = (coilMatrix.valueOf() as MathNumericType[][]).map(v => [v[0], v[1], v[2]] as Vec3)
//             return { coil: pts, current: coilRecords[groupIndex].current } as CoilRecord
//         })
//     )
//     return coilGroupsWithCurrents.flat()
// }

/**
 * Hook to expand a device's surfaces across the full stellarator ring.
 * 
 * @param baseSurf The base surfaces as a list of (currently) 21 x 21 3-vector points.
 * Indexed as [n_surface x n_phi x n_theta], where theta is the rotation around the
 * magnetic axis in a cross-sectional slice with the magnetic axis at the center, and
 * phi is the angle of rotation for a coronal view with the device's central axis;
 * basically, theta is N increments covering [0, 2pi) while phi is N increments covering
 * the start of the period to the end of the period (if NFP = 4, phi will span [0, pi/2)).
 * surfaces are represented as a 30 x 30 field of 3-vector points, and scalar values are
 * represented as 30 x 30 scalar values.
 * @param baseModB The scalar values of the magnetic flux used to color the surfaces described
 * in baseSurf, indexed/arranged the same way, except they're scalars not vectors.
 * @param nfp Number of field periods, aka number of rotational symmetries.
 * @returns The base surfaces and base surface values extended per the appropriate symmetries
 * so that they cover the entire stellarator ring.
 */
export const applySurfaceSymmetries = (baseSurf: Vec3Field[], baseModB: ScalarField[], nfp: number): {fullSurf: Vec3Field[], fullModB: ScalarField[]} => {
    // Step 1: convert the fields--a 21x21 grid of 3-vector points--to matrices & flatten to 441


    // const {surfacePoints, pointValues} = baseSurf
    const surfaceMatrices = baseSurf.map((field) => matrix(field.flat().map(v => [...v])))

    const transforms = surfaceTransformMatrices[nfp]
    const realizedSurfaceMatrices = surfaceMatrices.map(obj => transforms.map(t => multiply(obj, t)))
    // Now reshape those (1d x R3-point) matrices into (2d x R3).
    const completedSurfaces = realizedSurfaceMatrices.map(s => {
        // each shell/surface has N matrices (one per full-period geometry), in flattened format.
        // Need to concat them before reshaping to X x Y x R3.
        const flatMatrix = concat(...s, 0) as Matrix
        return reshape(flatMatrix, [-1, SURFACE_SIDE_RESOLUTION, 3]).valueOf() as unknown as Vec3Field
    })

    // recall that the surface points are already a ScalarField, i.e. number[][], or 2-d matrix.
    // Also, the ordering of *all* points in both dimensions of the Surface was reversed.
    // So we need to reverse the ordering of all points in both dimensions.
    const fullPeriodPointFields = baseModB.map(baseSurf => {
        const reversed = reshape(matrix([...baseSurf].flat().reverse()),
                                 [SURFACE_SIDE_RESOLUTION, SURFACE_SIDE_RESOLUTION]
                                ).valueOf() as ScalarField
        return [...reversed, ...baseSurf]
    })
    // This may be unnecessary
    const pointFields = fullPeriodPointFields.map(fullPeriodSurfacePoints => {
        return new Array(nfp).fill(0).map(() => fullPeriodSurfacePoints).flat() as ScalarField
    })
    const completedPoints = pointFields
    
    return { fullSurf: completedSurfaces, fullModB: completedPoints }
}
