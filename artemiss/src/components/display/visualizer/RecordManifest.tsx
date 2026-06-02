import { DeviceFields } from "@snTypes/DataDictionary"
import { Device } from "@snTypes/Types"
import { FunctionComponent } from "react"


type deviceProps = {
    device: Device
    colWidth: number
}

const deviceManifest: FunctionComponent<deviceProps> = (props: deviceProps) => {
    const { device, colWidth } = props
    const maxWidth = 520 // "empirically observed" i.e. it looks okay on my monitor
    const margin = Math.max((colWidth - maxWidth)/2, 0)

    type deviceField = keyof typeof DeviceFields
    const metaRows = (Object.keys(DeviceFields)
        ).filter((x) => DeviceFields[x as keyof typeof DeviceFields].displayInTable
        // [null, null, null, etc.]
        ).sort((n1, n2) => {
            if (DeviceFields[n1 as deviceField].order > DeviceFields[n2 as deviceField].order) { return 1 }
            return -1
        })
    // This is a bit hacky, but we have some fields that can be expected to consist only of a list of nulls,
    // so it's better to filter them out somehow
    const justCommas = /^,*$/

    return (
        <div className="metadataManifest" style={{ maxWidth: maxWidth, marginLeft: margin }}>
            <div key="title">
                Device Metadata
            </div>
            <div key="id">
                <div className="manifestLabel">UUID:</div>
                <div className="manifestContent">{device.uuid}</div>
            </div>
            <div key="srcId">
                <div className="manifestLabel">Source:</div>
                <div className="manifestContent">{`${device.databaseFrom} (${device.databaseFromId})`}</div>
            </div>
            {metaRows.map((k) => (
                <div key={k}>
                    <div className="manifestLabel">{DeviceFields[k as deviceField].label}</div>
                    <div className="manifestContent">
                        {`${device[k as deviceField]}`.match(justCommas) ? "N/A" : `${device[k as deviceField]}`}
                    </div>
                </div>
            ))}
{/* TODO: include translations & handling of log values */}
        </div>
    )
}

export default deviceManifest
