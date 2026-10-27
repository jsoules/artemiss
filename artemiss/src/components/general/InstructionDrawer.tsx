import Drawer from '@mui/material/Drawer'
import { FunctionComponent, PropsWithChildren } from 'react'


type InstructionDrawerPropsBase = {
    open: boolean
    anchor?: "left" | "bottom" | "right" | "top"
    changeOpenState: (newState: boolean) => void
}

type InstructionDrawerProps = PropsWithChildren<InstructionDrawerPropsBase>

const toggleInstructionDrawer = (handler: (newState: boolean) => void, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
             (event as React.KeyboardEvent).key === 'Shift')
           ) { return }
        handler(open)
    }


export const InstructionDrawer: FunctionComponent<InstructionDrawerProps> = (props: InstructionDrawerProps) => {
    const { children, open, anchor, changeOpenState } = props
    const drawer = (
        <Drawer
            variant="temporary"
            anchor={anchor ?? "top"}
            open={open}
            onClose={toggleInstructionDrawer(changeOpenState, false)}
            ModalProps={{
                keepMounted: true, // supposedly better performance on mobile
                // though this honestly isn't a huge concern given how unfriendly
                // this whole thing is to cell phones
            }}
        >
            {children}
        </Drawer>
    )

    return drawer
}


export const OverviewInstructionDrawer: FunctionComponent<InstructionDrawerPropsBase> = (props: InstructionDrawerPropsBase) => {
    const content = (
        <div className="instructionBox">
            <div>
                This page presents plots of the devices in the BoSS database, filtered according to parameters of interest.
                You can show the filter controls by clicking the button, and hide them again with the &ldquo;&lt;&rdquo; symbol.
                Filter controls are divided into plot controls and filter controls.
            </div>
            <div>
                The <span className="emphasis">plot controls</span> allow you to choose the variables used for the
                X- and Y-axes of the plots, as well as the variable used to color the dots. You can also separate
                the plots into rows and columns according to variables of your choice. Altogether, this allows the
                plots to display five dimensions of data.
                By default, the plots show the volume-averaged magnetic field strength against minor radius, with dots colored
                according to the device&apos;s original database of origin, and plots split into columns according
                to the number of field periods (NFP).
            </div>
            <div>
                The <span className="emphasis">filter controls</span> lie below the plot controls. They allow you to
                restrict the visible devices according to a range of descriptive variable values.
            </div>
            <div>
                Note that you can also zoom in to a particular region of the plots by dragging and selecting that region;
                this will update the filters currently used for the axes. By changing axes, you can drill down easily to
                those devices which are of most interest.
            </div>
        </div>
    )

    return <InstructionDrawer {...props}>{content}</InstructionDrawer>
}


export const ModelInstructionDrawer: FunctionComponent<InstructionDrawerPropsBase> = (props: InstructionDrawerPropsBase) => {
    const content = (
        <div className="instructionBox">
            <div>
                This page presents information about one device.
            </div>
            <div>
                The left-hand panel is a 3-D model of the device, and the computed surfaces of its magnetic field.
                You can zoom with the mouse wheel or click and drag to rotate the view. To move the image within
                the frame, click and drag while holding the control (or command) key.
            </div>
            <div>
                The 3D view also offers controls that let you show/hide different surfaces, change the color scheme
                used to show field strength, and toggle whether the complete device is shown (vs only one period).
            </div>
            <div>
                In addition to the 3D visualization, this page also shows plots of several of the device's quantities
                of interest as a function of surface depth or of (log of) simulation time, and
                a complete description of the device parameters. Additionally, you can download
                the device data input and wout files.
            </div>
        </div>
    )

    return <InstructionDrawer {...props}>{content}</InstructionDrawer>
}


