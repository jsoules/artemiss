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

    type foo = keyof typeof DeviceFields
    const metaRows = (Object.keys(DeviceFields)
        ).filter((x) => DeviceFields[x as keyof typeof DeviceFields].displayInTable
        ).sort((n1, n2) => {
            if (DeviceFields[n1 as foo].order > DeviceFields[n2 as foo].order) { return 1 }
            return -1
        })


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
                    <div className="manifestLabel">{DeviceFields[k as foo].label}</div>
                    <div className="manifestContent">
                        {`${device[k as foo]}`}
                    </div>
                </div>
            ))}
{/* TODO: include translations & handling of log values */}
        </div>
    )
}

export default deviceManifest
