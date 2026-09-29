import { NavigatorStateAction } from "@snState/NavigatorReducer"
import { CategoricalIndexedFields, DependentVariables, IndependentVariables, ToggleableVariables } from "@snTypes/DataDictionary"
import { Dispatch } from "react"


export type PKType = string
export const NullId = ''
export const ConcatenationToken = '---'

export type FilterControlState = {
    databaseFrom: boolean[]
    nfp: boolean[]
    stellsym: boolean[]
    enforceVacuum: boolean[]
    minorRadius: number[]
    aspectRatio: number[]
    volume: number[]
    volAvgB: number[]
    mirrorRatio: number[]
    minLgradB: number[]
    plasmaBeta: number[]
    vacuumWell: number[]
    intAxisTorsion: number[]
    axisHelicity: boolean[]
    iotaAxis: number[]
    iotaMean: number[]
    iotaMax: number[]
    iotaEdge: number[]
    jdotbVmecMean: number[]
    jdotbVmecMax: number[]
    jdotbVmecEdge: number[]
    mercierCriterionMean: number[]
    mercierCriterionMax: number[]
    mercierCriterionEdge: number[]
    epsilonEffMean: number[]
    epsilonEffMax: number[]
    epsilonEffEdge: number[]
    qiErrorMean: number[]
    qiErrorMax: number[]
    qiErrorEdge: number[]
    sqrtBoozerQsErrMean: number[]
    sqrtBoozerQsErrMax: number[]
    sqrtBoozerQsErrEdge: number[]
    lossFractionS010: number[]
    lossFractionS025: number[]
    lossFractionS050: number[]
    meanConfinementTimeS010: number[]
    meanConfinementTimeS025: number[]
    meanConfinementTimeS050: number[]
}

export type FilterSettings = {
    activeFilters: FilterControlState
    priorFilters: FilterControlState
    // TODO: add a third layer, the "cached" set, along with a third filter,
    // which tracks the filter state that populated the cache
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
    uuid: PKType,                    // UUID
    // Identification fields
    databaseFrom: string,            // Closed set, should be an enum maybe?
    groupName: string,               // Closed set, maybe an enum? Used for distributing device records over directories NOT INDEXED
    databaseFromId: string,          // Whatever the ID of the device was in the database it's native to NOT INDEXED
    canonicalPath: string,           // assembled per-rule from uuid, groupName, etc
    // Categorical fields
    nfp: number,                     // field period count. 1, 2, 3, 4, 5, 6, or 12.
    axisHelicity: number,            // range -4 - 4
    stellsym: number,                // TODO note storing a properly-boolean value as 0, 1 for convenience in filtering/projection
    enforceVacuum: number,           // TODO
    // Globally unique(ish)/continuous fields
    // phiEdge: number,                 // range 15.0 - 150.0? (unit?) Total toroidal magnetic flux in the device
    minorRadius: number,             // range 0.4+ - 2.5+ (M). Minor radius of outermost surface ("minor radius")
    aspectRatio: number,             // range 1.245 - 25.142 (no unit)
    volume: number,                  // range -3077 - 3672, signed, Volume enclosed by outermost toroidal surface over which QS was optimized. (m^3)
    volAvgB: number,                 // range 3.97 - 11?, magnetic field strength averaged over plasma volume
    mirrorRatio: number,             // range -55.3 - 665.28, magnetic mirror ratio
    minLgradB: number,               // range 0.00005 - 20.7, predicts required coil separation length to maintain containment
    plasmaBeta: number,              // range 0 - 0.0565, volume-averaged plasma beta. MISSING FROM LATEST PULL
    vacuumWell: number,              // range -4.24 - 0.64. Metric for plasma equilibrium stability
    intAxisTorsion: number,          // range -55740 - 46100 -- TODO
    iotaAxis: number,                // range -3.68 - 2.92, iota profile???
    iotaMean: number,                // range -3.7 - 2.86  TODO
    iotaMax: number,                 // range -3.62 - 2.92 TODO
    iotaEdge: number,                // range -3.62 - 2.91 TODO
    jdotbVmecMean: number,           // range -16M - 22.2M, bootstrap current
    jdotbVmecMax: number,            // range -11M - 28M    TODO
    jdotbVmecEdge: number,           // range -23M - 28M    TODO
    mercierCriterionMean: number,    // range -2392 - 0.5204, Mercier criterion, negative is good
    mercierCriterionMax: number,     // NO CONCRETE VALUES IN LATEST DATA
    mercierCriterionEdge: number,    // NO CONCRETE VALUES IN LATEST DATA
    epsilonEffMean: number,          // range 0 - 2.78e12, effective ripple/epsilon
    epsilonEffMax: number,           // range 0 - 4.17e13, ???
    epsilonEffEdge: number,          // range -1.5 - 4.17e13    ???
    qiErrorMean: number,             // range 0 - 0.395, Goodman QI error
    qiErrorMax: number,              // range 0 - 0.456, ???
    qiErrorEdge: number,             // range 0 - 0.451, ???
    sqrtBoozerQsErrMean: number,     // range 0.003 - 1.03, root of Boozer QS error
    sqrtBoozerQsErrMax: number,      // range 0.004 - 1.28, ???
    sqrtBoozerQsErrEdge: number,     // range 0.004 - 1.28, ???
    lossFractionS010: number,        // Fraction (0 - 1.01). Fraction of particles born on s=0.10 that escape plasma w/in 0.1 sec
    lossFractionS025: number,        // Fraction (0 - 1.01). Fraction of particles born on s=0.25 that escape plasma w/in 0.1 sec
    lossFractionS050: number,        // Fraction (0 - 1.01). Fraction of particles born on s=0.50 that escape plasma w/in 0.1 sec
    meanConfinementTimeS010: number, // range 0 - 0.1, ???
    meanConfinementTimeS025: number, // range 0 - 0.1, ???
    meanConfinementTimeS050: number, // range 0 - 0.1, ???
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
    enforceVacuum: boolean,
    surfaceDistances: number[], // s1d
    // TODO: theta1d? phi1d?
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
    // TODO: modB no boozer?
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
