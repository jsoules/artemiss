import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid'
import { plotGridInternalMargin } from '@snComponents/Overview'
import { Fields, KnownFields } from '@snTypes/DataDictionary'
import { ArtemissRecord, PKType } from '@snTypes/Types'
import { FunctionComponent } from 'react'
import OpenSelectedButton from './OpenSelected'

type SnTableProps = {
    records: ArtemissRecord[]
    truncated: boolean
    markedIds: Set<PKType>
    markedIdUrls: Set<string>
    selectionHandler: (model: GridRowSelectionModel) => void
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


const projectSnTableRows = (rows: ArtemissRecord[]) => {
    return rows.map(r => {
        return {
            id: r.rowid,
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
            axisHelicity: r.axisHelicity,
            iotaMean: r.iotaMean,
            mercierCriterionMax: r.mercierCriterionMax,
            sqrtBooxerQsErrMean: r.sqrtBoozerQsErrMean,
            lossFractionS025: r.lossFractionS025,
            meanConfinementTimeS025: r.meanConfinementTimeS025,
        }
    })
}


// TODO memoize?
const SnTable: FunctionComponent<SnTableProps> = (props: SnTableProps) => {
    const { records, truncated, selectionHandler, markedIds } = props

    const columns = [...fixedWidthCols, ...varWidthCols]
    const rows = projectSnTableRows(records)

    return (
        <div style={{ marginLeft: plotGridInternalMargin, marginRight: plotGridInternalMargin }}>
            { truncated && <div>Note: Selected record count exceeds the limit; only the first 1000 are displayed.</div> }
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
