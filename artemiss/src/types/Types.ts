import { NavigatorStateAction } from "@snState/NavigatorReducer"
import { CategoricalIndexedFields, DependentVariables, IndependentVariables, ToggleableVariables } from "@snTypes/DataDictionary"
import { Dispatch } from "react"


export type PKType = string
export const NullId = ''
export const ConcatenationToken = '---'

export type FilterSettings = {
    databaseFrom: boolean[]
    nfp: boolean[]
    minorRadius: number[]
    aspectRatio: number[]
    volume: number[]
    volAvgB: number[]
    mirrorRatio: number[]
    minLgradB: number[]
    plasmaBeta: number[]
    jdotbVmec: number[]
    iota: number[]
    vacuumWell: number[]
    mercierCriterion: number[]
    axisHelicity: boolean[]
    sqrtBoozerQsErr: number[]
    epsilonEff: number[]
    qiError: number[]
    lossFractionS025: number[]
    // system settings
    dependentVariable: DependentVariables
    independentVariable: IndependentVariables
    coarsePlotSplit?: ToggleableVariables
    finePlotSplit?: ToggleableVariables
    coarsePlotSelectedValue?: string
    finePlotSelectedValue?: string
    database: NavigatorDatabase | undefined
    records: ArtemissRecord[]
    recordIds: Set<PKType>
    markedRecords: Set<PKType>
    markedRecordUrls: Set<string>
}

// See also the further explanations/notes in DataDictionary.ts
// TODO QUERY: Might want to combine the UUID (pk) into an object with the other 3 record-identifying properties
// in light of the fact we need all of them to reconstruct the path
export type ArtemissRecord = {
    // PK
    uuid: PKType,                   // UUID
    // Identification fields
    databaseFrom: string,           // Closed set, should be an enum maybe?
    groupName: string,              // Closed set, maybe an enum? Used for distributing device records over directories NOT INDEXED
    databaseFromId: string,         // Whatever the ID of the device was in the database it's native to NOT INDEXED
    canonicalPath: string,          // assembled per-rule from uuid, groupName, etc
    // Categorical fields
    nfp: number,                    // range 1-8?, field period count
    axisHelicity: number,           // range -3 - 2
    // Globally unique(ish)/continuous fields
    // phiEdge: number,                // range 15.0 - 150.0? (unit?) Total toroidal magnetic flux in the device
    minorRadius: number,            // range 0.3 - 2.5 (M). Minor radius of outermost surface ("minor radius")
    aspectRatio: number,            // range 2.7 - 12.07 (no unit)
    volume: number,                 // range -16 - 3672, signed, Volume enclosed by outermost toroidal surface over which QS was optimized. (m^3)
    volAvgB: number,                // range 3.97 - 11?, magnetic field strength averaged over plasma volume
    mirrorRatio: number,            // range 1.08 - 80.28, magnetic mirror ratio
    minLgradB: number,              // range 0.0002 - 80.3, predicts required coil separation length to maintain containment
    plasmaBeta: number,             // range 0 - 0.0565, volume-averaged plasma beta
    jdotbVmec: number,              // range -160M - 222.2M, bootstrap current
    iota: number,                   // range -2.89 - 2.86, iota profile
    vacuumWell: number,             // range -1.01 - 0.64. Metric for plasma equilibrium stability
    mercierCriterion: number,       // range -754 - 0.33, Mercier criterion, negative is good
    sqrtBoozerQsErr: number,        // range 0.003 - 1.03, root of Boozer QS error
    epsilonEff: number,             // range 2.78 - 134.5M, effective ripple/epsilon
    qiError: number,                // range 0 - 0.281, Goodman QI error
    lossFractionS025: number,       // Fraction (0 - 1.01). Fraction of particles born on s=0.25 that escape plasma w/in 0.1 sec
}
export type RecordDict = Record<string, ArtemissRecord>

export type NavigatorDatabase = {
    list: ArtemissRecord[]
    byId: RecordDict
    allIdSet: Set<string>
    categoricalIndexes: CategoricalIndexSet
}

export type CategoricalIndex = Record<string, Set<string>>
export type CategoricalIndexSet = {[key in CategoricalIndexedFields]: CategoricalIndex}

export type NavigatorDispatch = Dispatch<NavigatorStateAction>

export type NavigatorContextType = {
    filterSettings: FilterSettings
    selection: Set<PKType>
    database: NavigatorDatabase
    dispatch: React.Dispatch<NavigatorStateAction>
    fetchRecords: (ids: Set<PKType>) => ArtemissRecord[]
}

export type FilterUpdateAction = unknown


export type PlotDimensions = {
    width: number
    height: number
    marginTop: number
    marginRight: number
    marginBottom: number
    marginLeft: number
}

export type BoundedPlotDimensions = PlotDimensions & {
    boundedWidth: number
    boundedHeight: number
    tickLength: number
    pixelsPerTick: number
    fontPx: number,
    clipAvoidanceXOffset: number,
    clipAvoidanceYOffset: number,
    axisLabelOffset: number
}

export type DataGeometry = {
    xmin: number,
    xmax: number,
    ymin: number,
    ymax: number
}

export type Vec3 = [number, number, number]

export type Vec3Field = Vec3[][]

export type ScalarField = number[][]

// I'm going to leave this in, on the assumption that we may
// want to re-incorporate coils in the future
// export type CoilRecord = {
//     coil: Vec3[],
//     current: number
// }

export type SurfaceObject = {
    surfacePoints: Vec3Field[],
    pointValues: ScalarField[],
    incomplete: boolean
}


export type MagneticAxisObject = {
    axisPoints: Vec3[],
    incomplete: boolean
}


export type DeviceTimeSeries = {
    time: number[], // time codes for particle confinement/tracing simulations. Used for plotting.
    lossFracS0_01: number,  // doc says should be nt but example is scalar. TODO
                            // frac of particles born on s=0.01 (i.e. very close to axis)
                            // which are lost after time step t
    lossFracS0_25: number,  // scalar or nt? Fraction particles born on s=0.25 lost after t
    lossFracS0_50: number,  // ditto. Born at s=0.50 lost after time t
    meanConfinementTimeS0_01: number,   // scalar or nt? As above
    meanConfinementTimeS0_25: number,   // scalar or nt? As above
    meanConfinementTimeS0_50: number,   // scalar or nt? As above
}


export type LossSeries = {
    thetaLostS0_25:  number[],  // poloidal angle (theta) when crossing boundary
                                // of lost particles born on s=0.25. MAY NOT BE POPULATED
    zetaLostS0_25:   number[],  // toroidal angle zeta where particles crossed the boundary
    energyLostS0_25: number[],  // particle energy at time of loss, in MeV
}


export type Device = {
    uuid: PKType,
    databaseFrom: string,
    groupName: string,
    databaseFromId: string,
    nfp: number,
    stellsym: boolean,
    surfaceDistances: number[], // s1d
    surface: Vec3Field, // SINGLE complete period of OUTERMOST surface.
                        // to be painted with other values in the object (user-selectable)
                        // TODO: Make this an actual list again...
    nSurfaces: number,
    aspectRatio: number,
    minorRadius: number,
    volume: number,
    volAvgB: number,
    mirrorRatio: number,    // B_max / B_min
    minLgradB: number,
    modbBoozer: ScalarField[],  // currently has ALL surfaces
    pressure: number[], // same dimensionality as n surfaces
    plasmaBeta: number, // volume-averaged plasma beta (pressure / mag pressure)
    boozerI: number[],  // ns. normalized toroidal current
    boozerG: number[],  // ns. normalized poloidal current
    jdotbVmec: number[],    // ns. bootstrap current from vmec
    iota: number[],     // ns. Rotational transform profile (twist of field lines)
    vacuumWell: number, // magnetic well, stability criterion
    mercierCriterion: number[], // ns. Local stability measure
    magneticAxis: Vec3[],   // n_phi x 3. Trace line of mag axis. Colorize? native "xyz_axis".
    integratedAxisTorsion: number,  // integrated torsion along magnetic axis
    axisHelicity: number,   // helicity of magnetic axis
    sqrtBoozerQsError: number[],    // ns. root of Boozer quasi-symmetry error
    epsilonEff: number[],   // ns. effective ripple per-surface
    qiError: number[],  // ns. quasi-isodynamic error measure, per surface.
    lossTracings: DeviceTimeSeries,
    lossCharacteristics: LossSeries
}


export type Device3dModel = {
    surfaceCount: number,
    baseSurfaces: Vec3Field[],
    fullSurfaces: Vec3Field[],
    baseModBboozer: ScalarField[],
    fullModBboozer: ScalarField[]
}
