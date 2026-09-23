import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid'
import { plotGridInternalMargin } from '@snComponents/Overview'
import { filterTo } from '@snState/filter'
import { Fields, KnownFields, ToggleableVariables } from '@snTypes/DataDictionary'
import { ArtemissRecord, PKType } from '@snTypes/Types'
import { FunctionComponent } from 'react'
import OpenSelectedButton from './OpenSelected'

type SnTableProps = {
    records: ArtemissRecord[]
    markedIds: Set<PKType>
    markedIdUrls: Set<string>
    selectionHandler: (model: GridRowSelectionModel) => void
    filterCriteria: (ToggleableVariables | undefined)[]
    filterValues: (string | undefined)[]
}

const variableColumnsDefaultWidth = 110

const fieldnames = Object.keys(Fields)
const displayed = fieldnames.filter(fn => Fields[fn as KnownFields].displayInTable)
const fixedWidthFields = displayed.filter(fn => Fields[fn as KnownFields].tableColumnWidth !== undefined)
const varWidthFields = displayed.filter(fn => Fields[fn as KnownFields].tableColumnWidth === undefined)

const fixedWidthCols: GridColDef[] = fixedWidthFields.map(f => {
    const fieldDef = Fields[f as KnownFields]
    const unitSuffix = fieldDef.unit === undefined ? '' : ` (${fieldDef.unit})`
    return {
        field: f,
        headerName: fieldDef.shortLabel,
        width: fieldDef.tableColumnWidth,
        description: fieldDef.description + unitSuffix,
        sortable: true
    }
})

const varWidthCols: GridColDef[] = varWidthFields.map(f => {
    const fieldDef = Fields[f as KnownFields]
    const unitSuffix = fieldDef.unit === undefined ? '' : ` (${fieldDef.unit})`
    return {
        field: f,
        headerName: fieldDef.shortLabel,
        description: fieldDef.description + unitSuffix,
        flex: 1,
        minWidth: variableColumnsDefaultWidth,
        sortable: true
    }
})


const SnTable: FunctionComponent<SnTableProps> = (props: SnTableProps) => {
    const { records, selectionHandler, markedIds, filterCriteria, filterValues } = props

    const filters: {[key in ToggleableVariables]?: string | undefined} = {}
    filterCriteria.forEach((f, i) => {
        if (f !== undefined && filterValues[i] !== undefined) {
            filters[f] = filterValues[i]
        }
    })
    const filteredRecords = filterTo(records, filters)

    const columns = [...fixedWidthCols, ...varWidthCols]
    const rows = filteredRecords.map(r => {
        return {
            id: r.uuid,
            uuid: r.uuid,
            databaseFrom: r.databaseFrom,
            nfp: r.nfp,
            stellsym: r.stellsym ? 'yes' : 'no',
            enforceVacuum: r.enforceVacuum ? 'yes' : 'no',
            // phiEdge: r.phiEdge.toFixed(3),
            minorRadius: r.minorRadius.toFixed(3),
            aspectRatio: r.aspectRatio.toFixed(2),
            volume: r.volume.toFixed(5),
            volAvgB: r.volAvgB,
            mirrorRatio: r.mirrorRatio,
            minLgradB: r.minLgradB,
            plasmaBeta: r.plasmaBeta,
            vacuumWell: r.vacuumWell,
            intAxisTorsion: r.intAxisTorsion.toFixed(6),
            axisHelicity: r.axisHelicity,
            iotaAxis: r.iotaAxis,
            iotaMean: r.iotaMean,
            iotaMax: r.iotaMax,
            iotaEdge: r.iotaEdge,
            jdotbVmecMean: r.jdotbVmecMean,
            jdotbVmecMax: r.jdotbVmecMax,
            jdotbVmecEdge: r.jdotbVmecEdge,
            mercierCriterionMean: r.mercierCriterionMean,
            mercierCriterionMax: r.mercierCriterionMax,
            mercierCriterionEdge: r.mercierCriterionEdge,
            epsilonEffMean: r.epsilonEffMean,
            epsilonEffMax: r.epsilonEffMax,
            epsilonEffEdge: r.epsilonEffEdge,
            qiErrorMean: r.qiErrorMean,
            qiErrorMax: r.qiErrorMax,
            qiErrorEdge: r.qiErrorEdge,
            sqrtBooxerQsErrMean: r.sqrtBoozerQsErrMean,
            sqrtBooxerQsErrMax: r.sqrtBoozerQsErrMax,
            sqrtBooxerQsErrEdge: r.sqrtBoozerQsErrEdge,
            lossFractionS010: r.lossFractionS010,
            lossFractionS025: r.lossFractionS025,
            lossFractionS050: r.lossFractionS050,
            meanConfinementTimeS010: r.meanConfinementTimeS010,
            meanConfinementTimeS025: r.meanConfinementTimeS025,
            meanConfinementTimeS050: r.meanConfinementTimeS050,
        }
    })

    return (
        <div style={{ marginLeft: plotGridInternalMargin, marginRight: plotGridInternalMargin }}>
            <div className="overviewTable">
                <DataGrid
                    disableRowSelectionExcludeModel
                    columns={columns}
                    rows={rows}
                    onRowSelectionModelChange={(newRowSelectionModel) => {selectionHandler(newRowSelectionModel)}}
                    checkboxSelection={true}
                    // can add initialState, pagination model, page size options
                />
            </div>
            <div className="padded">
                <OpenSelectedButton markedIds={markedIds} />
            </div>
        </div>
    )
}

export default SnTable
