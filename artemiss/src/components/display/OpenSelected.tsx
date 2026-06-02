import { Button, Tooltip } from '@mui/material'
import { PKType } from '@snTypes/Types'
import { FunctionComponent } from 'react'
import { onOpenSelected } from './plots/interactions/dotInteractions'


type OpenSelectedProps = {
    markedIds?: Set<PKType>
}


const OpenSelectedButton: FunctionComponent<OpenSelectedProps> = (props: OpenSelectedProps) => {
    const { markedIds } = props

    return (
        <Tooltip
            title="Depending on browser settings, this may only open the first-selected device."
            placement="right-end"
        >
            <Button
                variant="contained"
                size="small"
                onClick={() => { onOpenSelected(markedIds) }}
            >
                Open selected
            </Button>
        </Tooltip>)
}

export default OpenSelectedButton
