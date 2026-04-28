import { SelectChangeEvent } from '@mui/material'
import { SupportedColorMap, SupportedColorPalette } from '@snComponents/display/Colormaps'
import { ColorPropsAction, PlotColorProps, usePlotColorCallbacks } from '@snComponents/display/plots/interactions/plotColors'
import HrBar from '@snComponents/general/HrBar'
import { Fields, RangeVariables, ToggleableVariables, TripartiteVariables, fieldIsCategorical } from '@snTypes/DataDictionary'
import { FilterSettings } from '@snTypes/Types'
import { Dispatch, FunctionComponent, useState } from 'react'
// import { Dispatch, FunctionComponent } from 'react'
import ToggleableVariableCheckboxGroup from './Checkboxes'
import PlotVariableControlsDropdown from './PlotVariableControlsDropdown'
import RangeSlider from './RangeSlider'
import VariableSelector from './VariableSelectDropdown'


type Callbacks = {
    handleRangeChange: (event: Event, field: RangeVariables, newValue: number | number[]) => void
    handleRangeReset: (field: RangeVariables) => void
    handleTripartiteDropdownChange: (field: TripartiteVariables, event: SelectChangeEvent<number>) => void
    handleDependentVariableChange: (event: SelectChangeEvent) => void
    handleIndependentVariableChange: (event: SelectChangeEvent) => void
    handleCoarseVariableChange: (event: SelectChangeEvent) => void
    handleFineVariableChange: (event: SelectChangeEvent) => void
    handleCheckboxChange: (type: ToggleableVariables, index: number, targetState: boolean) => void
}


type Props = {
    filterSettings: FilterSettings,
    callbacks: Callbacks,
    colorProps: PlotColorProps,
    colorChgDispatcher: Dispatch<ColorPropsAction>
}

const SelectionControlPanel: FunctionComponent<Props> = (props: Props) => {
    const { filterSettings, callbacks, colorChgDispatcher } = props
    const { databaseFrom, nfp, dependentVariable, independentVariable, coarsePlotSplit, finePlotSplit } = filterSettings
    const { colorSplit, style } = props.colorProps
    const [ plotVarsClosed, setPlotVarsClosed ] = useState(true)

    const { colorVariableCallback, colorSchemeCallback } = usePlotColorCallbacks(colorChgDispatcher)
    

    const sliders = Object.values(RangeVariables).filter(rv => isNaN(Number(rv)))
        .map(rv => (<RangeSlider key={rv} field={rv} value={filterSettings[rv]} onChange={callbacks.handleRangeChange} onReset={callbacks.handleRangeReset} />))

    const styleSelector = fieldIsCategorical(colorSplit)
        ? <VariableSelector value={style as SupportedColorPalette} onChange={colorSchemeCallback} type="ColorStyleDiscrete" />
        : <VariableSelector value={style as SupportedColorMap} onChange={colorSchemeCallback} type="ColorStyleContinuous" />

    return (
        <div className="ControlPanelWrapper">
            <PlotVariableControlsDropdown
                isClosed={plotVarsClosed}
                toggleFn={setPlotVarsClosed}
            >
                <VariableSelector value={independentVariable} onChange={callbacks.handleIndependentVariableChange} type="Independent" />
                <VariableSelector value={dependentVariable} onChange={callbacks.handleDependentVariableChange} type="Dependent" />
                <HrBar />
                <VariableSelector value={colorSplit} onChange={colorVariableCallback} type="ColorVariable" />
                {styleSelector}
                <HrBar />
                <VariableSelector value={coarsePlotSplit} onChange={callbacks.handleCoarseVariableChange} type="CoarseSplit" />
                <VariableSelector value={finePlotSplit} onChange={callbacks.handleFineVariableChange} type="FineSplit" />
            </PlotVariableControlsDropdown>
            <HrBar />
            {sliders}
            {/* TODO Unify the checkbox template thing by referencing values if it exists */}
            <ToggleableVariableCheckboxGroup
                type={ToggleableVariables.NFP}
                selections={nfp}
                onChange={callbacks.handleCheckboxChange}
                labels={(Fields[ToggleableVariables.NFP].values ?? [])}
            />
            <ToggleableVariableCheckboxGroup
                type={ToggleableVariables.DATABASE_FROM}
                selections={databaseFrom}
                onChange={callbacks.handleCheckboxChange}
                labels={(Fields[ToggleableVariables.DATABASE_FROM].values ?? [])}
            />
        </div>
    )

}

export default SelectionControlPanel
