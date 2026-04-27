import { PKType } from "@snTypes/Types"
import { getStringId } from "@snUtil/makeResourcePath"


const BASENAME = import.meta.env.BASE_URL

// TODO FIXME

export const onHoverDot = (id: PKType) => {
    console.log(`Hovered ${getStringId(id).id}`)
}


export const onHoverOff = (id: PKType) => {
    console.log(`Stopped hovering ${getStringId(id).id}`)
}


export const onClickDot = (url: string) => {
    // TODO FIXME once routing is set up right
    if (BASENAME === '/') {
        window.open(`model/${url}`, "_blank", "noreferrer")
    } else {
        window.open(`${BASENAME}/model/${url}`, "_blank", "noreferrer")
    }
}


// TODO: RETEST THIS
export const onOpenSelected = (urls?: Set<string>) => {
    const slowOpen = (url: string) => {
        console.log(`Opening ${url}`)
        onClickDot(url)
        window.focus()
    }
    if (urls !== undefined) {
        urls.forEach(url => {
            setTimeout(() => { slowOpen(url), 250 })
        })
    }
}
