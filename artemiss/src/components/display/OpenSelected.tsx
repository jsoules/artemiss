import { Button, Tooltip } from '@mui/material'
import { FunctionComponent } from 'react'
import { onOpenSelected } from './plots/interactions/dotInteractions'


type OpenSelectedProps = {
    markedIdUrls?: Set<string>
}


// TODO FIXME: THIS IS BROKEN, needs to get the url property of the row, but expects
// to compute the URL from the id.
// Fix is to remap in the SnTable where OpenSelectedButton is created.
const OpenSelectedButton: FunctionComponent<OpenSelectedProps> = (props: OpenSelectedProps) => {
    const { markedIdUrls } = props

    return (
        <Tooltip
            title="Depending on browser settings, this may only open the first-selected device."
            placement="right-end"
        >
            <Button
                variant="contained"
                size="small"
                onClick={() => { onOpenSelected(markedIdUrls) }}
            >
                Open selected
            </Button>
        </Tooltip>)
}

export default OpenSelectedButton
