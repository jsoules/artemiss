import { FunctionComponent, useMemo } from "react"

import { LinePlot, LinePlotProps } from "@snComponents/display/visualizer"


// TODO:
// - allow for showing an overall legend
// - in lineplot itself, add more configuration options to omit/make implied the X axis (confirm with Misha, he asked for conflicting things)
// x use an rw (from model) that adapts to the number of plots we're trying to cram in
// X adapt makeLinePlot fn to give me a set of LinePlotProps for each plot instead of making the component
// x make and embed the plot objects
// X Consider whether it's truly necessary to split the responsibilities in this way vs. just letting this
//   class be aware of the data model

export type LinePlotRowProps = {
    pageWidth: number
    plots: LinePlotProps[]
    label: string
}

const LinePlotRow: FunctionComponent<LinePlotRowProps> = (props) => {
    const { pageWidth, plots, label } = props
    const nPlots = plots.length
    const edgeLength = useMemo(() => nPlots < 1 ? 1 : Math.max(0, (pageWidth / nPlots) - 120 / nPlots), [pageWidth, nPlots])
    const linePlots = plots.map((p, i) => <LinePlot key={`${label}-${i}`} {...p} width={edgeLength} height={edgeLength} />)

    return <div className="linePlotRow">
        <div className="linePlotRowLabel">
            {label}
        </div>
        <div className="linePlotSet">
            {linePlots}
        </div>
    </div>
}

export default LinePlotRow
